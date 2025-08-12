import { decode as cborDecode, encode as cborEncode } from 'cbor-x';
import express, { Request, Response } from 'express';
import { isRight, type Left, type Right } from 'fp-ts/lib/Either.js';
import { webcrypto as crypto } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import open from 'open';

import {
  RegistrationAuthenticatorSelection as AS,
  Base64Url,
  Bytes,
  ChallengeService,
  RegistrationPublicKeyCredentialParameters as PKCP,
  RegistrationService,
  RPId,
  RegistrationRelyingPartyName as RPN,
  RegistrationUser as RU,
  RegistrationUserId as RUID
} from 'webauthn-rp';

import { type Opts, type PersistedConfig, TOOL_VERSION } from './cli.js';
import { html } from './frontend.js';

export const findAvailablePort = async (preferred: number): Promise<number> => {
  const net = await import('node:net');
  const tryPort = (p: number) => new Promise<number>((resolve, reject) => {
    const srv = net.createServer().unref();
    srv.on('error', reject);
    srv.listen(p, '127.0.0.1', () => {
      const addr = srv.address();
      srv.close(() => resolve(p));
    });
  });
  for (let i = 0; i < 10; i++) {
    const p = preferred + i;
    try {
      // eslint-disable-next-line no-await-in-loop
      await tryPort(p);
      return p;
    } catch {}
  }
  throw new Error('No available port in 10 attempts starting from ' + preferred);
};

// Minimal Either helpers (types only from fp-ts)
type Result<T> = import('webauthn-rp').Utils.Result<T>;
type DomainError = import('webauthn-rp').Utils.DomainError;
const isLeft = <T>(e: Result<T>): e is Left<DomainError> =>
  typeof e === 'object' && e !== null && (e as any)._tag === 'Left';
const getRight = <T>(e: Result<T>): T => (e as Right<T>).right as T;

export const createServer = async (opts: Opts): Promise<{ server: any, port: number }> => {
  // Parse RP ID
  if (!opts.domain) {
    throw new Error('Domain is required');
  }
  const rpIdE = RPId.fromString(opts.domain);
  if (isLeft(rpIdE)) {
    throw new Error('Invalid domain: ' + rpIdE.left.message);
  }
  const rpId = getRight(rpIdE);

  // Relying party name
  const rpNameE = RPN.fromString('Blog');
  if (isLeft(rpNameE)) {
    throw new Error(rpNameE.left.message);
  }
  const rpName = getRight(rpNameE);

  // Algorithms ES256 and EdDSA
  const algsE = PKCP.fromArray([-7, -8, -257]);
  if (isLeft(algsE)) {
    throw new Error(algsE.left.message);
  }
  const algorithms = getRight(algsE);

  // Authenticator selection: resident key required, cross-platform, UV preferred
  const authSelE = AS.create('required', 'preferred', 'cross-platform');
  if (isLeft(authSelE)) {
    throw new Error(authSelE.left.message);
  }
  const authenticatorSelection = getRight(authSelE);

  // Build RegistrationService
  const regService = RegistrationService.createService({
    rpId,
    rpName,
    algorithms,
    authenticatorSelection,
    timeoutMs: 300_000, // 5 minutes
    attestation: 'none',
  });

  // Challenge generation using existing ChallengeService
  const challengeSvc = ChallengeService.createService({ rpId, rpName: rpName.value, ttlMs: 5 * 60_000 });

  // Simple session storage for challenge validation
  let storedChallenge: string | null = null;

  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // Fragments
  app.get('/', (_req, res) => res.type('html').send(html('/api')));
  app.get('/fragment/start', (_req, res) => {
    res.type('html').send('<div id="status" class="status">Starting registration…</div>');
  });
  app.get('/fragment/error', (req, res) => {
    const m = req.query.m ?? 'Unexpected error';
    res.type('html').status(500).send(`<div id="status" class="status">Error: ${String(m)}</div>`);
  });

  // Options endpoint
  app.get('/api/options', (_req: Request, res: Response) => {
    const gen = challengeSvc.generate();
    if (isLeft(gen)) return res.status(500).json({ error: gen.left.message });
    const { challenge, timeoutMs } = getRight(gen);
    const userIdBytes = crypto.getRandomValues(new Uint8Array(16));
    const userIdE = RUID.fromBytes(userIdBytes);
    if (isLeft(userIdE)) return res.status(500).json({ error: userIdE.left.message });
    const userId = getRight(userIdE);
    const userE = RU.create(userId, opts.displayName, opts.displayName);
    if (isLeft(userE)) return res.status(400).json({ error: userE.left.message });
    const user = getRight(userE);
    const creationE = regService.buildCreationOptions(user, challenge);
    if (isLeft(creationE)) return res.status(500).json({ error: creationE.left.message });
    const creation = getRight(creationE);
    
    // Store challenge for validation in /api/store
    storedChallenge = creation.challenge.base64Url;
    
    // Return JSON with base64url fields for transport
    res.json({
      challenge: creation.challenge.base64Url,
      rp: { id: creation.rp.id.canonical, name: creation.rp.name.value },
      user: { id: userId.base64Url, name: user.name, displayName: user.displayName },
      pubKeyCredParams: creation.pubKeyCredParams,
      authenticatorSelection: creation.authenticatorSelection,
      timeout: creation.timeoutMs,
      attestation: creation.attestation,
    });
  });

  // Store endpoint
  app.post('/api/store', async (req: Request, res: Response) => {
    try {
      const { id, rawId, response } = req.body ?? {};
      if (!id || !rawId || !response?.attestationObject || !response?.clientDataJSON) {
        return res.status(400).type('html').send('<div id="status" class="status">Invalid attestation payload</div>');
      }

      // Decode client data json
      const clientDataJsonE = Base64Url.fromBase64UrlToBytes(response.clientDataJSON);
      if (isLeft(clientDataJsonE)) {
        return res.status(400).type('html').send('<div id="status" class="status">Invalid clientDataJSON</div>');
      }
      
      const clientDataJson = JSON.parse(Bytes.toString(getRight(clientDataJsonE)));
      const { type, origin, challenge } = clientDataJson;
      
      // Validate challenge matches the stored one
      if (!storedChallenge || challenge !== storedChallenge) {
        return res.status(400).type('html').send('<div id="status" class="status">Challenge mismatch</div>');
      }
      
      // Validate type is webauthn.create
      if (type !== 'webauthn.create') {
        return res.status(400).type('html').send('<div id="status" class="status">Invalid type: expected webauthn.create</div>');
      }
      
      // Validate origin matches server origin
      const expectedOrigin = `http://localhost:${port}`;
      if (origin !== expectedOrigin) {
        return res.status(400).type('html').send(`<div id="status" class="status">Origin mismatch: expected ${expectedOrigin}, got ${origin}</div>`);
      }
      
      // Clear the stored challenge (single use)
      storedChallenge = null;

      // Decode attestation object and extract credentialId + COSE public key
      const attBytesE = Base64Url.fromBase64UrlToBytes(response.attestationObject);
      if (isLeft(attBytesE)) {
        return res.status(400).type('html').send(`<div id="status" class="status">${attBytesE.left.message}</div>`);
      }
      
      const attObj: any = cborDecode(getRight(attBytesE));
      const authData: Uint8Array | undefined = (attObj && (attObj.authData || (attObj.get && attObj.get('authData'))));
      if (!authData || !(authData instanceof Uint8Array)) {
        return res.status(400).type('html').send('<div id="status" class="status">Missing authData in attestation</div>');
      }

      // Parse authenticator data (see WebAuthn spec)
      let i = 0;
      const read = (n: number) => authData.slice(i, (i += n));
      const rpIdHash = read(32);
      
      // Validate rpIdHash matches the expected rpId
      const expectedRpIdHash = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(rpId.canonical)));
      if (!rpIdHash.every((byte, index) => byte === expectedRpIdHash[index])) {
        return res.status(400).type('html').send('<div id="status" class="status">rpIdHash mismatch: authenticator data does not match current rpId</div>');
      }
      
      const flags = read(1)[0] ?? 0;
      /* const signCountBytes = */ read(4);
      const FLAG_AT = 0x40;
      if ((flags & FLAG_AT) === 0) {
        return res.status(400).type('html').send('<div id="status" class="status">Attested credential data not present</div>');
      }
      /* const aaguid = */ read(16);
      const credIdLenBytes = read(2);
      const credIdLen = ((credIdLenBytes[0] ?? 0) << 8) | (credIdLenBytes[1] ?? 0);
      const credIdBytes = read(credIdLen);
      const coseKeyBytes = authData.slice(i);
      const coseKey: any = cborDecode(coseKeyBytes);
      const coseBytes = cborEncode(coseKey);
      const algorithm: number = (coseKey?.get?.(3) ?? coseKey?.[3]) ?? -7;

      const persisted: PersistedConfig = {
        credentialId: Base64Url.toBase64Url(credIdBytes),
        publicKeyCose: Base64Url.toBase64Url(coseBytes),
        algorithm: Number(algorithm),
        registrationTimestamp: new Date().toISOString(),
        rpId: rpId.canonical,
        toolVersion: TOOL_VERSION,
        signCounter: 0,
      };

      // Atomic write: write to temp file then rename
      const target = path.resolve(opts.config);
      const dir = path.dirname(target);
      await fs.mkdir(dir, { recursive: true });
      const tmp = path.join(dir, `.tmp-${process.pid}-${Date.now()}.json`);
      await fs.writeFile(tmp, JSON.stringify(persisted, null, 2), { mode: 0o600 });
      await fs.rename(tmp, target);

      // Return success fragment and trigger shutdown
      res.type('html').send(
        `<div id="status" class="status">`+
          `Success! Saved credential <span class=mono>${id}</span> to <span class=mono>${target}</span>.`+
        `</div>`
      );

      setTimeout(() => {
        server.close(() => process.exit(0));
      }, 5000);
    } catch (err: any) {
      console.error(err);
      res.status(500).type('html').send(`<div id="status" class="status">${err?.message ?? 'Error'}</div>`);
    }
  });

  const preferred = Number.parseInt(String(opts.port), 10) || 8080;
  const port = await findAvailablePort(preferred);
  const server = app.listen(port, 'localhost', () => {
    const url = `http://localhost:${port}/`;
    console.log('Starting server at', url);
    console.log('Waiting for registration…');
    // Launch browser, but non-fatal if it fails
    open(url).catch(() => {
      console.log('Could not automatically open browser. Please navigate to', url);
    });
  });

  // Graceful shutdown after 10 minutes if idle
  setTimeout(() => {
    console.error('Timeout waiting for registration');
    server.close(() => process.exit(1));
  }, 10 * 60_000);

  // Handle SIGINT/SIGTERM
  const stop = () => server.close(() => process.exit(0));
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);

  return { server, port };
};

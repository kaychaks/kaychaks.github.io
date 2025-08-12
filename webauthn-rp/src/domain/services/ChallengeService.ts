import * as E from 'fp-ts/lib/Either.js';
import * as O from 'fp-ts/lib/Option.js';
import { randomBytes as nodeRandomBytes } from 'node:crypto';
import { type Result, domainError } from '../utils/types.js';
import { toBase64Url } from '../utils/base64url.js';
import { copyBytes } from '../utils/bytes.js';
import { CHALLENGE_NUM_BYTES, fromBytes as challengeFromBytes, type Challenge } from '../valueObjects/Challenge.js';
import { CHALLENGE_TTL_MS } from '../entities/AuthenticationChallenge.js';
import type { RPId } from '../valueObjects/RPId.js';

export interface ChallengeRecord {
  readonly createdAtIso: string;
  readonly bytes: Uint8Array; // length = 32
}

export interface ChallengeServiceConfig {
  readonly rpId: RPId;
  readonly rpName: string;
  readonly timeoutMs?: number; // default 60000
  readonly ttlMs?: number; // default CHALLENGE_TTL_MS
  readonly randomBytes?: (numBytes: number) => Uint8Array;
  readonly nowMs?: () => number;
}

export interface GeneratedChallenge {
  readonly challenge: Challenge;
  readonly rpId: RPId;
  readonly rpName: string;
  readonly timeoutMs: number;
}

export interface ChallengeService {
  readonly generate: () => Result<GeneratedChallenge>;
  readonly validateAndConsume: (challengeBase64Url: string) => Result<ChallengeRecord>;
  readonly purgeExpired: () => number;
  readonly size: () => number;
  readonly getRecord: (challengeBase64Url: string) => O.Option<ChallengeRecord>;
}

export const createService = (config: ChallengeServiceConfig): ChallengeService => {
  const storage = new Map<string, ChallengeRecord>();
  const now = () => (config.nowMs ?? Date.now)();
  const ttl = config.ttlMs ?? CHALLENGE_TTL_MS;
  const timeoutMs = config.timeoutMs ?? 60_000;
  const rng = config.randomBytes ?? ((n: number) => nodeRandomBytes(n));

  const isExpiredMs = (createdAtMs: number, atMs: number): boolean => atMs - createdAtMs >= ttl;

  const generateUniqueBytes = (): Result<Uint8Array> => {
    // extremely unlikely collision; attempt a few times for safety
    const MAX_ATTEMPTS = 5;
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const buf = rng(CHALLENGE_NUM_BYTES);
      if (buf.length !== CHALLENGE_NUM_BYTES) {
        return E.left(
          domainError('InvalidArgument', `RNG must return ${CHALLENGE_NUM_BYTES} bytes, got ${buf.length}`)
        );
      }
      const b64 = toBase64Url(buf);
      if (!storage.has(b64)) {
        return E.right(new Uint8Array(buf));
      }
    }
    return E.left(domainError('InvalidArgument', 'Failed to generate unique challenge'));
  };

  const generate = (): Result<GeneratedChallenge> => {
    const issuedAt = now();
    const unique = generateUniqueBytes();
    if (E.isLeft(unique)) return unique;
    const bytes = unique.right;
    const ch = challengeFromBytes(bytes);
    if (E.isLeft(ch)) return ch;
    const challenge = ch.right;
    const record: ChallengeRecord = Object.freeze({
      createdAtIso: new Date(issuedAt).toISOString(),
      bytes: copyBytes(bytes),
    });
    storage.set(challenge.base64Url, record);
    return E.right({ challenge, rpId: config.rpId, rpName: config.rpName, timeoutMs });
  };

  const validateAndConsume = (challengeBase64Url: string): Result<ChallengeRecord> => {
    const record = storage.get(challengeBase64Url);
    if (!record) {
      return E.left(domainError('NotFound', 'Challenge not found'));
    }
    const createdAtMs = Date.parse(record.createdAtIso);
    if (Number.isNaN(createdAtMs)) {
      // Should never happen, defensive
      storage.delete(challengeBase64Url);
      return E.left(domainError('InvalidArgument', 'Corrupted challenge record'));
    }
    if (isExpiredMs(createdAtMs, now())) {
      storage.delete(challengeBase64Url);
      return E.left(domainError('Expired', 'Challenge has expired'));
    }
    storage.delete(challengeBase64Url);
    return E.right({ createdAtIso: record.createdAtIso, bytes: copyBytes(record.bytes) });
  };

  const purgeExpired = (): number => {
    const at = now();
    let purged = 0;
    for (const [k, v] of storage.entries()) {
      const createdAtMs = Date.parse(v.createdAtIso);
      if (!Number.isNaN(createdAtMs) && isExpiredMs(createdAtMs, at)) {
        storage.delete(k);
        purged++;
      }
    }
    return purged;
  };

  const size = () => storage.size;

  const getRecord = (challengeBase64Url: string): O.Option<ChallengeRecord> => {
    const r = storage.get(challengeBase64Url);
    return r
      ? O.some({ createdAtIso: r.createdAtIso, bytes: copyBytes(r.bytes) })
      : O.none;
  };

  return Object.freeze({ generate, validateAndConsume, purgeExpired, size, getRecord });
};


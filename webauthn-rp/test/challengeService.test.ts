import { describe, it, expect } from 'vitest';
import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';
import { RPId, ChallengeService, Base64Url } from '../src/index.ts';

const makeRngSequence = (sequence: ReadonlyArray<Uint8Array>) => {
  let idx = 0;
  return (n: number): Uint8Array => {
    if (n !== 32) throw new Error(`expected 32 bytes, got ${n}`);
    const out = sequence[idx] ?? sequence[sequence.length - 1];
    idx = Math.min(idx + 1, sequence.length);
    return new Uint8Array(out);
  };
};

describe('ChallengeService - generation', () => {
  it('returns unique 32-byte base64url challenge and stores timestamp', () => {
    const rpIdE = RPId.fromString('example.com');
    if (E.isLeft(rpIdE)) throw new Error('Invalid RPId');
    const rpId = rpIdE.right;

    const now = { t: 1_700_000_000_000 };
    const bA = new Uint8Array(32); // all zeros
    const bB = new Uint8Array(32).fill(1); // all ones
    const rng = makeRngSequence([bA, bA, bB]);

    const svc = ChallengeService.createService({
      rpId,
      rpName: 'My Blog',
      nowMs: () => now.t,
      randomBytes: rng,
    });

    const g1 = svc.generate();
    expect(E.isRight(g1)).toBe(true);
    if (E.isLeft(g1)) return;
    const c1 = g1.right.challenge;
    expect(c1.bytes.length).toBe(32);
    // base64url of zeros
    const b64A = Base64Url.toBase64Url(bA);
    expect(c1.base64Url).toBe(b64A);

    // record stored with current timestamp
    const recOpt1 = svc.getRecord(c1.base64Url);
    expect(O.isSome(recOpt1)).toBe(true);
    if (O.isSome(recOpt1)) {
      expect(recOpt1.value.createdAtIso).toBe(new Date(now.t).toISOString());
    }

    const g2 = svc.generate();
    expect(E.isRight(g2)).toBe(true);
    if (E.isLeft(g2)) return;
    const c2 = g2.right.challenge;
    const b64B = Base64Url.toBase64Url(bB);
    expect(c2.base64Url).toBe(b64B);
    expect(c2.base64Url).not.toBe(c1.base64Url);
  });
});

describe('ChallengeService - expiration', () => {
  it('rejects expired challenge during validation and removes it', () => {
    const rpIdE = RPId.fromString('example.com');
    if (E.isLeft(rpIdE)) throw new Error('Invalid RPId');
    const rpId = rpIdE.right;

    const now = { t: 1_700_000_000_000 };
    const rng = makeRngSequence([new Uint8Array(32).fill(7)]);

    const svc = ChallengeService.createService({
      rpId,
      rpName: 'My Blog',
      nowMs: () => now.t,
      randomBytes: rng,
    });

    const g = svc.generate();
    if (E.isLeft(g)) throw new Error('generation failed');
    const { challenge } = g.right;

    // advance time by 6 minutes
    now.t += 6 * 60 * 1000;

    const result = svc.validateAndConsume(challenge.base64Url);
    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left.code).toBe('Expired');
    }
    const recOpt = svc.getRecord(challenge.base64Url);
    expect(O.isNone(recOpt)).toBe(true);
  });
});



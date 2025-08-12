import * as E from 'fp-ts/Either';
import { domainError, type Brand, type Result } from '../utils/types.js';
import type { Challenge } from '../valueObjects/Challenge.js';

export type ChallengeId = Brand<string, 'ChallengeId'>;

export interface AuthenticationChallenge {
  readonly id: ChallengeId;
  readonly challenge: Challenge;
  readonly issuedAtMs: number;
  readonly expiresAtMs: number;
}

export const CHALLENGE_TTL_MS = 5 * 60 * 1000;

export const create = (
  id: string,
  challenge: Challenge,
  issuedAtMs: number = Date.now()
): Result<AuthenticationChallenge> => {
  const trimmed = id.trim();
  if (trimmed.length === 0) {
    return E.left(domainError('InvalidArgument', 'ChallengeId must not be empty'));
  }
  const expiresAtMs = issuedAtMs + CHALLENGE_TTL_MS;
  const value: AuthenticationChallenge = Object.freeze({
    id: trimmed as ChallengeId,
    challenge,
    issuedAtMs,
    expiresAtMs,
  });
  return E.right(value);
};

export const isExpired = (entity: AuthenticationChallenge, nowMs: number = Date.now()): boolean =>
  nowMs >= entity.expiresAtMs;



import * as E from 'fp-ts/lib/Either.js';
import { domainError, type Brand, type Result } from '../../domain/utils/types.js';
import type { RegistrationChallenge } from './RegistrationChallenge.js';
import type { UserEntity } from './UserEntity.js';

export type RegistrationSessionId = Brand<string, 'RegistrationSessionId'>;

export type RegistrationState = 'initiated' | 'optionsSent' | 'completed' | 'failed';

export interface RegistrationSession {
  readonly id: RegistrationSessionId;
  readonly createdAtMs: number;
  readonly state: RegistrationState;
  readonly user: UserEntity;
  readonly challenge?: RegistrationChallenge;
}

export const create = (
  id: string,
  createdAtMs: number,
  user: UserEntity
): Result<RegistrationSession> => {
  const trimmed = id.trim();
  if (trimmed.length === 0) return E.left(domainError('InvalidArgument', 'Session id must not be empty'));
  return E.right(
    Object.freeze({ id: trimmed as RegistrationSessionId, createdAtMs, state: 'initiated', user })
  );
};

export const advance = (
  session: RegistrationSession,
  state: RegistrationState,
  challenge?: RegistrationChallenge
): RegistrationSession => {
  return Object.freeze({ ...session, state, challenge });
};



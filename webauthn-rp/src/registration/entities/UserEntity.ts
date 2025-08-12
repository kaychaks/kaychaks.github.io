import * as E from 'fp-ts/lib/Either.js';
import { domainError, type Result } from '../../domain/utils/types.js';
import type { UserId } from '../valueObjects/UserId.js';

export interface UserEntity {
  readonly id: UserId;
  readonly name: string; // human readable
  readonly displayName: string; // shown by the authenticator/manager
}

export const create = (id: UserId, name: string, displayName: string): Result<UserEntity> => {
  const n = name.trim();
  const d = displayName.trim();
  if (n.length === 0) return E.left(domainError('InvalidArgument', 'User name must not be empty'));
  if (d.length === 0) return E.left(domainError('InvalidArgument', 'User displayName must not be empty'));
  return E.right(Object.freeze({ id, name: n, displayName: d }));
};



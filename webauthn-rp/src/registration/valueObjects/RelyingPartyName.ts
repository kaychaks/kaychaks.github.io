import * as E from 'fp-ts/lib/Either.js';
import { domainError, type Result } from '../../domain/utils/types.js';

export interface RelyingPartyName {
  readonly value: string;
}

export const fromString = (input: string): Result<RelyingPartyName> => {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return E.left(domainError('InvalidArgument', 'RelyingPartyName must not be empty'));
  }
  return E.right(Object.freeze({ value: trimmed }));
};



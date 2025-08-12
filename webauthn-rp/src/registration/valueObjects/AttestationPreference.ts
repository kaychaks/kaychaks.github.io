import * as E from 'fp-ts/lib/Either.js';
import { domainError, type Result } from '../../domain/utils/types.js';

export type AttestationPreference = 'none' | 'indirect' | 'direct' | 'enterprise';

export const fromString = (s: string): Result<AttestationPreference> => {
  const v = s.trim() as AttestationPreference;
  if (v === 'none' || v === 'indirect' || v === 'direct' || v === 'enterprise') {
    return E.right(v);
  }
  return E.left(domainError('InvalidArgument', 'Invalid attestation preference'));
};



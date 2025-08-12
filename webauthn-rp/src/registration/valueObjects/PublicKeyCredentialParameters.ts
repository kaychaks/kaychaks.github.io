import * as E from 'fp-ts/lib/Either.js';
import { domainError, type Result } from '../../domain/utils/types.js';

// COSE algorithm identifiers per IANA
// ES256 = -7, EdDSA = -8
export type CoseAlgorithm = -7 | -8 | -257;

export interface PublicKeyCredentialParameter {
  readonly type: 'public-key';
  readonly alg: CoseAlgorithm;
}

export const fromArray = (algs: ReadonlyArray<CoseAlgorithm>): Result<ReadonlyArray<PublicKeyCredentialParameter>> => {
  if (algs.length === 0) return E.left(domainError('InvalidArgument', 'At least one algorithm must be provided'));
  const params = algs.map((alg) => Object.freeze({ type: 'public-key' as const, alg }));
  return E.right(Object.freeze(params));
};



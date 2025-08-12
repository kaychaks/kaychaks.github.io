import * as E from 'fp-ts/lib/Either.js';
import { copyBytes } from '../utils/bytes.js';
import { domainError, type Base64UrlString, type Result } from '../utils/types.js';
import { toBase64Url, fromBase64UrlToBytes } from '../utils/base64url.js';

export type PublicKeyAlgorithm = 'ES256' | 'EdDSA' | 'RS256';

export interface PublicKey {
  readonly coseBytes: Uint8Array;
  readonly base64Url: Base64UrlString;
  readonly algorithm: PublicKeyAlgorithm;
}

export const fromBytes = (
  bytes: Uint8Array,
  algorithm: PublicKeyAlgorithm
): Result<PublicKey> => {
  if (bytes.length === 0) {
    return E.left(domainError('InvalidLength', 'PublicKey (COSE) must not be empty'));
  }
  const copy = copyBytes(bytes);
  const value: PublicKey = Object.freeze({
    coseBytes: copy,
    base64Url: toBase64Url(copy),
    algorithm,
  });
  return E.right(value);
};

export const fromBase64Url = (
  b64: string,
  algorithm: PublicKeyAlgorithm
): Result<PublicKey> => {
  const decoded = fromBase64UrlToBytes(b64);
  if (E.isLeft(decoded)) return decoded;
  return fromBytes(decoded.right, algorithm);
};



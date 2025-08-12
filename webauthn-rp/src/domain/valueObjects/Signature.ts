import * as E from 'fp-ts/Either';
import { copyBytes } from '../utils/bytes.js';
import { domainError, type Base64UrlString, type Result } from '../utils/types.js';
import { toBase64Url, fromBase64UrlToBytes } from '../utils/base64url.js';

export interface Signature {
  readonly bytes: Uint8Array;
  readonly base64Url: Base64UrlString;
}

export const fromBytes = (bytes: Uint8Array): Result<Signature> => {
  if (bytes.length === 0) {
    return E.left(domainError('InvalidLength', 'Signature must not be empty'));
  }
  const copy = copyBytes(bytes);
  const value: Signature = Object.freeze({ bytes: copy, base64Url: toBase64Url(copy) });
  return E.right(value);
};

export const fromBase64Url = (b64: string): Result<Signature> => {
  const decoded = fromBase64UrlToBytes(b64);
  if (E.isLeft(decoded)) return decoded;
  return fromBytes(decoded.right);
};



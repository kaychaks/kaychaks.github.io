import * as E from 'fp-ts/lib/Either.js';
import { copyBytes } from '../utils/bytes.js';
import { domainError, type Base64UrlString, type Result } from '../utils/types.js';
import { toBase64Url, fromBase64UrlToBytes } from '../utils/base64url.js';

export interface Challenge {
  readonly bytes: Uint8Array;
  readonly base64Url: Base64UrlString;
}

export const CHALLENGE_NUM_BYTES = 32;

export const fromBytes = (bytes: Uint8Array): Result<Challenge> => {
  if (bytes.length !== CHALLENGE_NUM_BYTES) {
    return E.left(
      domainError(
        'InvalidLength',
        `Challenge must be exactly ${CHALLENGE_NUM_BYTES} bytes, got ${bytes.length}`
      )
    );
  }
  const copy = copyBytes(bytes);
  const value: Challenge = Object.freeze({ bytes: copy, base64Url: toBase64Url(copy) });
  return E.right(value);
};

export const fromBase64Url = (b64: string): Result<Challenge> => {
  const decoded = fromBase64UrlToBytes(b64);
  if (E.isLeft(decoded)) return decoded;
  return fromBytes(decoded.right);
};



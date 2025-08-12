import * as E from 'fp-ts/lib/Either.js';
import { copyBytes } from '../../domain/utils/bytes.js';
import {
  domainError,
  type Base64UrlString,
  type Result,
} from '../../domain/utils/types.js';
import { toBase64Url, fromBase64UrlToBytes } from '../../domain/utils/base64url.js';

export interface UserId {
  readonly bytes: Uint8Array;
  readonly base64Url: Base64UrlString;
}

const MIN_USER_ID_NUM_BYTES = 16;

export const fromBytes = (bytes: Uint8Array): Result<UserId> => {
  if (bytes.length < MIN_USER_ID_NUM_BYTES) {
    return E.left(
      domainError(
        'InvalidLength',
        `UserId must be at least ${MIN_USER_ID_NUM_BYTES} bytes, got ${bytes.length}`
      )
    );
  }
  const copy = copyBytes(bytes);
  const value: UserId = Object.freeze({ bytes: copy, base64Url: toBase64Url(copy) });
  return E.right(value);
};

export const fromBase64Url = (b64: string): Result<UserId> => {
  const decoded = fromBase64UrlToBytes(b64);
  if (E.isLeft(decoded)) return decoded;
  return fromBytes(decoded.right);
};



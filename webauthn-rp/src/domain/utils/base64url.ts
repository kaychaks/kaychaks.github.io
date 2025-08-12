import { domainError, type Base64UrlString, type Result } from './types.js';
import * as E from 'fp-ts/Either';

const BASE64URL_REGEX = /^[A-Za-z0-9_-]*$/;

export const toBase64Url = (bytes: Uint8Array): Base64UrlString => {
  const b64 = Buffer.from(bytes).toString('base64');
  const url = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  return url as Base64UrlString;
};

export const parseBase64Url = (value: string): Result<Base64UrlString> => {
  if (value.length === 0) {
    return E.left(domainError('InvalidBase64Url', 'Base64url string cannot be empty'));
  }
  if (!BASE64URL_REGEX.test(value)) {
    return E.left(domainError('InvalidBase64Url', 'String contains non-base64url characters'));
  }
  if (value.includes('=')) {
    return E.left(domainError('InvalidBase64Url', 'Padding is not allowed in base64url strings'));
  }
  return E.right(value as Base64UrlString);
};

export const fromBase64UrlToBytes = (value: string): Result<Uint8Array> => {
  const parsed = parseBase64Url(value);
  if (E.isLeft(parsed)) return parsed;

  // Convert to base64 by restoring characters and padding
  let b64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const mod = b64.length % 4;
  if (mod === 2) b64 += '==' ;
  else if (mod === 3) b64 += '=';
  else if (mod !== 0) {
    return E.left(domainError('InvalidBase64Url', 'Invalid base64url length'));
  }
  try {
    const buf = Buffer.from(b64, 'base64');
    return E.right(new Uint8Array(buf));
  } catch {
    return E.left(domainError('InvalidBase64Url', 'Failed to decode base64url'));
  }
};



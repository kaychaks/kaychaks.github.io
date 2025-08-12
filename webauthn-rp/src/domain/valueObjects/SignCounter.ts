import * as E from 'fp-ts/Either';
import { domainError, type Result } from '../utils/types.js';

export interface SignCounter {
  readonly value: number; // uint32
}

export const fromNumber = (n: number): Result<SignCounter> => {
  if (!Number.isInteger(n)) {
    return E.left(domainError('OutOfRange', 'SignCounter must be an integer'));
  }
  if (n < 0 || n > 0xffffffff) {
    return E.left(domainError('OutOfRange', 'SignCounter must be within uint32 range'));
  }
  const value: SignCounter = Object.freeze({ value: n >>> 0 });
  return E.right(value);
};



import * as E from 'fp-ts/lib/Either.js';
import { domainError, type Result } from '../../domain/utils/types.js';

export interface ServerPort {
  readonly value: number; // 1025..65535
}

export const fromNumber = (port: number): Result<ServerPort> => {
  if (!Number.isInteger(port)) {
    return E.left(domainError('OutOfRange', 'ServerPort must be an integer'));
  }
  if (port < 1025 || port > 65535) {
    return E.left(domainError('OutOfRange', 'ServerPort must be between 1025 and 65535'));
  }
  return E.right(Object.freeze({ value: port }));
};



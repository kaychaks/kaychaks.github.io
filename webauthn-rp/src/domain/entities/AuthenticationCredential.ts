import * as E from 'fp-ts/lib/Either.js';
import { domainError, type Result } from '../utils/types.js';
import type { CredentialId } from '../valueObjects/CredentialId.js';
import type { PublicKey } from '../valueObjects/PublicKey.js';
import type { SignCounter } from '../valueObjects/SignCounter.js';

export interface AuthenticationCredential {
  readonly id: CredentialId;
  readonly publicKey: PublicKey;
  readonly signCounter: SignCounter;
  readonly backupEligible: boolean;
  readonly backupState: boolean;
}

export const create = (
  id: CredentialId,
  publicKey: PublicKey,
  signCounter: SignCounter,
  backupEligible: boolean,
  backupState: boolean
): Result<AuthenticationCredential> => {
  // If backupState is true, authenticator reports credential is currently backed up; it must be eligible
  if (backupState && !backupEligible) {
    return E.left(
      domainError(
        'InvalidArgument',
        'backupState cannot be true when backupEligible is false'
      )
    );
  }
  return E.right(
    Object.freeze({ id, publicKey, signCounter, backupEligible, backupState })
  );
};



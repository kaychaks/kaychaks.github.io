import * as E from 'fp-ts/Either';
import { copyBytes } from '../utils/bytes.js';
import { domainError, type Result } from '../utils/types.js';
import type { CredentialId } from '../valueObjects/CredentialId.js';
import type { Signature } from '../valueObjects/Signature.js';

export interface AuthenticationAssertion {
  readonly credentialId: CredentialId;
  readonly authenticatorData: Uint8Array;
  readonly signature: Signature;
  readonly clientDataJson: string;
  readonly userHandle?: Uint8Array; // optional
}

export const create = (
  credentialId: CredentialId,
  authenticatorData: Uint8Array,
  signature: Signature,
  clientDataJson: string,
  userHandle?: Uint8Array
): Result<AuthenticationAssertion> => {
  const client = clientDataJson.trim();
  if (client.length === 0) {
    return E.left(domainError('InvalidArgument', 'clientDataJson must not be empty'));
  }
  const ad = Object.freeze(copyBytes(authenticatorData));
  const uh = userHandle ? Object.freeze(copyBytes(userHandle)) : undefined;
  return E.right(
    Object.freeze({
      credentialId,
      authenticatorData: ad,
      signature,
      clientDataJson: client,
      userHandle: uh,
    })
  );
};



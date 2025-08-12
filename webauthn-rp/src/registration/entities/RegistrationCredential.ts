import type { CredentialId } from '../../domain/valueObjects/CredentialId.js';
import type { PublicKey } from '../../domain/valueObjects/PublicKey.js';
import { CoseAlgorithm } from '../valueObjects/PublicKeyCredentialParameters.js';

export interface RegistrationCredential {
  readonly id: CredentialId;
  readonly publicKey: PublicKey; // COSE format
  readonly algorithm: CoseAlgorithm; // COSE alg value
  readonly clientDataJson: string; // base64url encoded when transmitted
  readonly attestationObject: Uint8Array; // raw CBOR (kept for future verification)
}



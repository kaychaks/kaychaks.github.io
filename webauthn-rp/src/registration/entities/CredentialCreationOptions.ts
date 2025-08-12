import type { Challenge } from '../../domain/valueObjects/Challenge.js';
import type { RPId } from '../../domain/valueObjects/RPId.js';
import type { RelyingPartyName } from '../valueObjects/RelyingPartyName.js';
import type { UserEntity } from './UserEntity.js';
import type { AuthenticatorSelection } from '../valueObjects/AuthenticatorSelection.js';
import type { PublicKeyCredentialParameter } from '../valueObjects/PublicKeyCredentialParameters.js';
import { AttestationPreference } from '../valueObjects/AttestationPreference.js';

export interface RelyingPartyInfo {
  readonly id: RPId;
  readonly name: RelyingPartyName;
}

export interface CredentialCreationOptions {
  readonly challenge: Challenge;
  readonly rp: RelyingPartyInfo;
  readonly user: UserEntity;
  readonly pubKeyCredParams: ReadonlyArray<PublicKeyCredentialParameter>;
  readonly authenticatorSelection: AuthenticatorSelection;
  readonly timeoutMs: number;
  readonly attestation: AttestationPreference;
}



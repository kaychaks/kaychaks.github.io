import * as E from 'fp-ts/lib/Either.js';
import { domainError, type Result } from '../../domain/utils/types.js';
import type { RPId } from '../../domain/valueObjects/RPId.js';
import type { Challenge } from '../../domain/valueObjects/Challenge.js';
import type { UserEntity } from '../entities/UserEntity.js';
import type { CredentialCreationOptions } from '../entities/CredentialCreationOptions.js';
import type { RelyingPartyName } from '../valueObjects/RelyingPartyName.js';
import type { AuthenticatorSelection } from '../valueObjects/AuthenticatorSelection.js';
import type { PublicKeyCredentialParameter } from '../valueObjects/PublicKeyCredentialParameters.js';

export interface RegistrationServiceConfig {
  readonly rpId: RPId;
  readonly rpName: RelyingPartyName;
  readonly algorithms: ReadonlyArray<PublicKeyCredentialParameter>;
  readonly authenticatorSelection: AuthenticatorSelection;
  readonly timeoutMs: number; // e.g. 5 minutes = 300_000
  readonly attestation: 'none' | 'indirect' | 'direct' | 'enterprise';
  readonly nowMs?: () => number;
}

export interface RegistrationService {
  readonly buildCreationOptions: (user: UserEntity, challenge: Challenge) => Result<CredentialCreationOptions>;
}

export const createService = (config: RegistrationServiceConfig): RegistrationService => {
  const buildCreationOptions = (user: UserEntity, challenge: Challenge): Result<CredentialCreationOptions> => {
    if (config.algorithms.length === 0) {
      return E.left(domainError('InvalidArgument', 'At least one algorithm must be configured'));
    }
    // shallow validation of timeout
    if (!Number.isFinite(config.timeoutMs) || config.timeoutMs <= 0) {
      return E.left(domainError('OutOfRange', 'timeoutMs must be a positive finite number'));
    }
    const rp = { id: config.rpId, name: config.rpName } as const;
    const opts: CredentialCreationOptions = Object.freeze({
      challenge,
      rp,
      user,
      pubKeyCredParams: config.algorithms,
      authenticatorSelection: config.authenticatorSelection,
      timeoutMs: Math.floor(config.timeoutMs),
      attestation: config.attestation,
    });
    return E.right(opts);
  };

  return Object.freeze({ buildCreationOptions });
};



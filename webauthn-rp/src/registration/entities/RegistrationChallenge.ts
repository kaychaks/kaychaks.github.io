import type { Challenge } from '../../domain/valueObjects/Challenge.js';
import type { RPId } from '../../domain/valueObjects/RPId.js';

export interface RegistrationChallenge {
  readonly challenge: Challenge;
  readonly rpId: RPId;
  readonly issuedAtMs: number;
  readonly expiresAtMs: number;
}



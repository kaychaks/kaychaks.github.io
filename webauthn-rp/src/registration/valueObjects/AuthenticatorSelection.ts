import * as E from 'fp-ts/lib/Either.js';
import { domainError, type Result } from '../../domain/utils/types.js';

export type AuthenticatorAttachment = 'platform' | 'cross-platform';
export type ResidentKeyRequirement = 'discouraged' | 'preferred' | 'required';
export type UserVerificationRequirement = 'required' | 'preferred' | 'discouraged';

export interface AuthenticatorSelection {
  readonly residentKey: ResidentKeyRequirement;
  readonly userVerification: UserVerificationRequirement;
  readonly authenticatorAttachment: AuthenticatorAttachment;
}

export const create = (
  residentKey: ResidentKeyRequirement,
  userVerification: UserVerificationRequirement,
  authenticatorAttachment: AuthenticatorAttachment
): Result<AuthenticatorSelection> => {
  // All options are union-typed so if passed, they are valid; we keep a defensive check
  const valid =
    (residentKey === 'discouraged' || residentKey === 'preferred' || residentKey === 'required') &&
    (userVerification === 'required' || userVerification === 'preferred' || userVerification === 'discouraged') &&
    (authenticatorAttachment === 'platform' || authenticatorAttachment === 'cross-platform');
  if (!valid) return E.left(domainError('InvalidArgument', 'Invalid authenticator selection'));
  return E.right(Object.freeze({ residentKey, userVerification, authenticatorAttachment }));
};



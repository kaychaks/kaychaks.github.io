import * as E from 'fp-ts/lib/Either.js';
import { createHash } from 'node:crypto';
import { domainError, type Result } from '../utils/types.js';

export interface RPId {
  readonly value: string; // as provided
  readonly canonical: string; // lowercased, trimmed
}

// Basic DNS label validation: letters, digits, hyphen. No leading/trailing hyphen, labels 1-63, total <= 253
const DOMAIN_REGEX = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)(?:\.(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?))*$/;

export const fromString = (value: string): Result<RPId> => {
  const trimmed = value.trim();
  const canonical = trimmed.toLowerCase();
  if (canonical.length === 0) {
    return E.left(domainError('InvalidDomain', 'RPId must not be empty'));
  }
  if (!DOMAIN_REGEX.test(canonical)) {
    return E.left(domainError('InvalidDomain', `Invalid domain name: ${value}`));
  }
  return E.right(Object.freeze({ value: trimmed, canonical }));
};

export const rpIdHash = (rpId: RPId): Uint8Array => {
  const hash = createHash('sha256').update(rpId.canonical, 'utf8').digest();
  return new Uint8Array(hash);
};



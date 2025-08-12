import { Command } from 'commander';
import path from 'node:path';

export const TOOL_VERSION = '0.1.0';

export const program = new Command();
program
  .name('passkey-registration')
  .description('One-time passkey registration tool')
  .option('-d, --domain <domain>', 'Blog domain (RP ID)', process.env.BLOG_DOMAIN)
  .option('-n, --display-name <name>', 'User display name', 'Blog Owner')
  .option('-c, --config <path>', 'Output config path', process.env.PASSKEY_CONFIG ?? path.join(process.cwd(), 'passkey-config.json'))
  .option('-p, --port <port>', 'Server port (prefers 8080, will fallback)', '8080')
  .parse(process.argv);

export type Opts = ReturnType<typeof program.opts<{
  domain: string | undefined;
  displayName: string;
  config: string;
  port: string;
}>>;

export const opts = program.opts() as Opts;

// Config persistence structure (pure JSON)
export interface PersistedConfig {
  credentialId: string; // base64url
  publicKeyCose: string; // base64url
  algorithm: number; // COSE alg id
  registrationTimestamp: string; // ISO
  rpId: string; // domain
  toolVersion: string; // semver
  signCounter: number; // initialize 0
}

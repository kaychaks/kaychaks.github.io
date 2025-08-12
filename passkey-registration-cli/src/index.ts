#!/usr/bin/env node
import 'dotenv/config';

import { opts } from './cli.js';
import { createServer } from './backend.js';

const start = async (): Promise<void> => {
  // Validate required options
  if (!opts.domain) {
    console.error('Error: --domain is required (or BLOG_DOMAIN env)');
    process.exit(1);
  }

  try {
    const { server, port } = await createServer(opts);
  } catch (err: any) {
    console.error(err.message);
    process.exit(1);
  }
};

start().catch((err) => {
  console.error(err);
  process.exit(1);
});



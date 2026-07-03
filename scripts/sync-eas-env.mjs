#!/usr/bin/env node
/**
 * Sync EXPO_PUBLIC_* variables from .env to EAS (production, preview, development).
 * Run: npm run sync-eas-env
 *
 * Production overrides EXPO_PUBLIC_API_URL with EXPO_PUBLIC_API_URL2 so the
 * store build never points at the Android emulator localhost (10.0.2.2).
 */

import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const envPath = resolve(root, '.env');

const ENVIRONMENTS = ['production', 'preview', 'development'];

function parseEnv(content) {
  const vars = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (key.startsWith('EXPO_PUBLIC_')) {
      vars[key] = value;
    }
  }
  return vars;
}

function visibilityFor(_key) {
  // EAS rejects "secret" for EXPO_PUBLIC_* — they are inlined into the app bundle anyway.
  return 'sensitive';
}

function runEasCreate(environment, name, value, visibility) {
  const escaped = value.replace(/"/g, '\\"');
  const cmd = [
    'npx eas-cli env:create',
    environment,
    `--name "${name}"`,
    `--value "${escaped}"`,
    `--visibility ${visibility}`,
    '--force',
    '--non-interactive',
  ].join(' ');

  execSync(cmd, { cwd: root, stdio: 'inherit' });
}

if (!existsSync(envPath)) {
  console.error('Missing .env file. Copy .env.example to .env and fill in values.');
  process.exit(1);
}

const vars = parseEnv(readFileSync(envPath, 'utf8'));
const keys = Object.keys(vars);

if (keys.length === 0) {
  console.error('No EXPO_PUBLIC_* variables found in .env');
  process.exit(1);
}

console.log(`Syncing ${keys.length} EXPO_PUBLIC_* variables to EAS...\n`);

for (const environment of ENVIRONMENTS) {
  console.log(`\n=== ${environment.toUpperCase()} ===\n`);

  for (const key of keys) {
    let value = vars[key];

    if (
      environment === 'production' &&
      key === 'EXPO_PUBLIC_API_URL' &&
      vars.EXPO_PUBLIC_API_URL2
    ) {
      value = vars.EXPO_PUBLIC_API_URL2;
      console.log(`  ${key} -> using EXPO_PUBLIC_API_URL2 for production`);
    }

    try {
      runEasCreate(environment, key, value, visibilityFor(key));
      console.log(`  ✓ ${key}`);
    } catch {
      console.error(`  ✗ ${key} failed`);
      process.exitCode = 1;
    }
  }
}

console.log('\nDone. Rebuild with: eas build --platform android --profile production');

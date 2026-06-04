#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const failures = [];
const warnings = [];

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function requireFile(relativePath) {
  if (!exists(relativePath)) {
    failures.push(`Missing required file: ${relativePath}`);
  }
}

function requireText(relativePath, expected, message) {
  if (!exists(relativePath)) {
    failures.push(`Missing required file: ${relativePath}`);
    return;
  }

  if (!read(relativePath).includes(expected)) {
    failures.push(message);
  }
}

function walkFiles(directory, output = []) {
  if (!exists(directory)) return output;

  for (const entry of fs.readdirSync(path.join(root, directory), {withFileTypes: true})) {
    const relativePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.next', '.git', 'artifacts'].includes(entry.name)) continue;
      walkFiles(relativePath, output);
      continue;
    }

    output.push(relativePath);
  }

  return output;
}

requireFile('package.json');
requireFile('package-lock.json');
requireFile('Dockerfile');
requireFile('docker-compose.yml');
requireFile('.dockerignore');
requireFile('.env.example');
requireFile('public/.gitkeep');
requireFile('app/api/health/route.ts');
requireFile('proxy.ts');
requireFile('next.config.ts');

if (exists('package.json')) {
  const pkg = JSON.parse(read('package.json'));
  const requiredScripts = [
    'build',
    'start',
    'lint:ci',
    'typecheck',
    'test:security-smoke',
    'dataset:validate',
    'dataset:evaluate',
    'selfhost:check'
  ];

  for (const script of requiredScripts) {
    if (!pkg.scripts?.[script]) {
      failures.push(`Missing package script: ${script}`);
    }
  }

  if (pkg.version !== '2.6.0') {
    warnings.push(`Expected package version 2.6.0, found ${pkg.version ?? 'unknown'}`);
  }
}

if (exists('package-lock.json') && exists('package.json')) {
  const pkg = JSON.parse(read('package.json'));
  const lock = JSON.parse(read('package-lock.json'));
  const lockVersion = lock.packages?.['']?.version ?? lock.version;
  if (lockVersion !== pkg.version) {
    warnings.push(`package-lock root version (${lockVersion}) does not match package.json (${pkg.version}).`);
  }
}

requireText(
  'next.config.ts',
  "output: 'standalone'",
  'next.config.ts must enable standalone output for self-hosted Docker/VPS deployments.'
);
requireText(
  'Dockerfile',
  '/api/health',
  'Dockerfile must use /api/health for runtime health checks.'
);
requireText(
  'docker-compose.yml',
  '/api/health',
  'docker-compose.yml must use /api/health for health checks.'
);
requireText(
  '.dockerignore',
  'node_modules',
  '.dockerignore must exclude node_modules.'
);
requireText(
  '.dockerignore',
  '.next',
  '.dockerignore must exclude .next.'
);

const forbiddenRuntimeGlobals = [`__dir${'name'}`, `__file${'name'}`];

for (const file of walkFiles('lib').concat(walkFiles('app'), walkFiles('components'), walkFiles('scripts'))) {
  const source = read(file);
  if (forbiddenRuntimeGlobals.some((globalName) => source.includes(globalName))) {
    failures.push(`ESM runtime global found in ${file}; use process.cwd() or import.meta.url-safe code.`);
  }
}

for (const generatedPath of ['node_modules', '.next', 'artifacts', 'tsconfig.tsbuildinfo']) {
  if (exists(generatedPath)) {
    warnings.push(`Generated path present and should not be shipped in release archive: ${generatedPath}`);
  }
}

if (failures.length > 0) {
  console.error('Self-host release check failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

if (warnings.length > 0) {
  console.warn('Self-host release warnings:');
  for (const warning of warnings) {
    console.warn(`- ${warning}`);
  }
}

console.log('Self-host release check passed.');

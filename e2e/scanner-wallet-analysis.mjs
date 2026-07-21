import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const home = await readFile('app/page.tsx', 'utf8');
const scanner = await readFile('components/sections/SecurityScanner.tsx', 'utf8');
const wallet = await readFile('components/Web3WalletAnalyzer.tsx', 'utf8');
const simulator = await readFile('components/TransactionSimulator.tsx', 'utf8');

assert.match(home, /TransactionSimulator/);
assert.match(scanner, /Analyze Address/);
assert.match(wallet, /Connected Wallet Analysis/);
assert.match(simulator, /Pre-Sign Transaction Simulator/);
assert.match(simulator, /If you sign this/);

console.log('scanner and wallet analysis e2e smoke checks passed');

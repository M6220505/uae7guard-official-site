import fs from 'node:fs';
import path from 'node:path';

const filePath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve('datasets/sample_labeled_transactions.ndjson');

const DECISIONS = new Set(['ALLOW', 'REVIEW', 'BLOCK']);
const ENTITY_TYPES = new Set(['address', 'transaction']);
const SEVERITIES = new Set(['low', 'medium', 'high', 'critical']);

function fail(message) {
  console.error(message);
  process.exit(1);
}

function ensure(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

if (!fs.existsSync(filePath)) {
  fail(`Dataset file not found: ${filePath}`);
}

const raw = fs.readFileSync(filePath, 'utf8');
const lines = raw
  .split('\n')
  .map((line) => line.trim())
  .filter(Boolean);

if (lines.length === 0) {
  fail('Dataset is empty.');
}

const summary = {
  total: 0,
  decisions: {ALLOW: 0, REVIEW: 0, BLOCK: 0},
  malicious: 0,
  benign: 0
};

for (let index = 0; index < lines.length; index += 1) {
  let row;
  const lineNumber = index + 1;

  try {
    row = JSON.parse(lines[index]);
  } catch {
    fail(`Invalid JSON at line ${lineNumber}.`);
  }

  try {
    ensure(typeof row.id === 'string' && row.id.length > 0, `line ${lineNumber}: id is required`);
    ensure(
      typeof row.createdAt === 'string' && !Number.isNaN(Date.parse(row.createdAt)),
      `line ${lineNumber}: createdAt must be ISO-8601`
    );
    ensure(typeof row.analyst === 'string' && row.analyst.length > 0, `line ${lineNumber}: analyst is required`);
    ensure(Number.isInteger(row.chainId) && row.chainId > 0, `line ${lineNumber}: chainId must be a positive integer`);

    ensure(row.entity && typeof row.entity === 'object', `line ${lineNumber}: entity object is required`);
    ensure(ENTITY_TYPES.has(row.entity.type), `line ${lineNumber}: entity.type must be address|transaction`);
    ensure(typeof row.entity.value === 'string' && row.entity.value.length > 0, `line ${lineNumber}: entity.value is required`);

    ensure(DECISIONS.has(row.decisionLabel), `line ${lineNumber}: decisionLabel must be ALLOW|REVIEW|BLOCK`);

    ensure(
      row.groundTruth && typeof row.groundTruth === 'object',
      `line ${lineNumber}: groundTruth object is required`
    );
    ensure(
      typeof row.groundTruth.isMalicious === 'boolean',
      `line ${lineNumber}: groundTruth.isMalicious must be boolean`
    );
    ensure(
      typeof row.groundTruth.category === 'string' && row.groundTruth.category.length > 0,
      `line ${lineNumber}: groundTruth.category is required`
    );

    ensure(Array.isArray(row.signals), `line ${lineNumber}: signals must be an array`);
    for (let signalIndex = 0; signalIndex < row.signals.length; signalIndex += 1) {
      const signal = row.signals[signalIndex];
      ensure(signal && typeof signal === 'object', `line ${lineNumber}: signal[${signalIndex}] must be object`);
      ensure(
        typeof signal.type === 'string' && signal.type.length > 0,
        `line ${lineNumber}: signal[${signalIndex}].type is required`
      );
      ensure(
        typeof signal.severity === 'string' && SEVERITIES.has(signal.severity),
        `line ${lineNumber}: signal[${signalIndex}].severity must be low|medium|high|critical`
      );
    }
  } catch (error) {
    fail(error instanceof Error ? error.message : `Invalid row at line ${lineNumber}`);
  }

  summary.total += 1;
  summary.decisions[row.decisionLabel] += 1;
  if (row.groundTruth.isMalicious) summary.malicious += 1;
  else summary.benign += 1;
}

console.log('Dataset validation passed');
console.log(JSON.stringify(summary, null, 2));

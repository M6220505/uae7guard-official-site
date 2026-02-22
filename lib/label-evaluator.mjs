import fs from 'node:fs';
import path from 'node:path';

const DECISIONS = new Set(['ALLOW', 'REVIEW', 'BLOCK']);

function safeDivide(numerator, denominator) {
  if (!denominator) return 0;
  return numerator / denominator;
}

function roundMetric(value) {
  return Number((value * 100).toFixed(2));
}

function finalizeConfusion(matrix) {
  const precision = safeDivide(matrix.tp, matrix.tp + matrix.fp);
  const recall = safeDivide(matrix.tp, matrix.tp + matrix.fn);
  const fpr = safeDivide(matrix.fp, matrix.fp + matrix.tn);
  const specificity = safeDivide(matrix.tn, matrix.fp + matrix.tn);
  const accuracy = safeDivide(matrix.tp + matrix.tn, matrix.tp + matrix.tn + matrix.fp + matrix.fn);
  const f1 = safeDivide(2 * precision * recall, precision + recall);

  return {
    ...matrix,
    precision: roundMetric(precision),
    recall: roundMetric(recall),
    fpr: roundMetric(fpr),
    specificity: roundMetric(specificity),
    accuracy: roundMetric(accuracy),
    f1: roundMetric(f1)
  };
}

function evaluateRow(row, mode) {
  const malicious = row.groundTruth.isMalicious === true;
  const predictedMalicious =
    mode === 'block_only'
      ? row.decisionLabel === 'BLOCK'
      : row.decisionLabel === 'BLOCK' || row.decisionLabel === 'REVIEW';

  return {malicious, predictedMalicious};
}

function emptyMatrix() {
  return {
    tp: 0,
    fp: 0,
    fn: 0,
    tn: 0
  };
}

function updateMatrix(matrix, malicious, predictedMalicious) {
  if (malicious && predictedMalicious) matrix.tp += 1;
  else if (!malicious && predictedMalicious) matrix.fp += 1;
  else if (malicious && !predictedMalicious) matrix.fn += 1;
  else matrix.tn += 1;
}

function validateRow(row, index) {
  const line = index + 1;

  if (!row || typeof row !== 'object') {
    throw new Error(`line ${line}: row must be object`);
  }

  if (typeof row.id !== 'string' || !row.id.trim()) {
    throw new Error(`line ${line}: id is required`);
  }

  if (!DECISIONS.has(row.decisionLabel)) {
    throw new Error(`line ${line}: decisionLabel must be ALLOW|REVIEW|BLOCK`);
  }

  if (!row.groundTruth || typeof row.groundTruth !== 'object') {
    throw new Error(`line ${line}: groundTruth is required`);
  }

  if (typeof row.groundTruth.isMalicious !== 'boolean') {
    throw new Error(`line ${line}: groundTruth.isMalicious must be boolean`);
  }

  if (typeof row.groundTruth.category !== 'string' || !row.groundTruth.category.trim()) {
    throw new Error(`line ${line}: groundTruth.category is required`);
  }

  if (row.signals !== undefined && !Array.isArray(row.signals)) {
    throw new Error(`line ${line}: signals must be array when provided`);
  }
}

export function evaluateLabelRows(rows) {
  const blockOnly = emptyMatrix();
  const blockOrReview = emptyMatrix();
  const perCategory = {};
  const decisions = {ALLOW: 0, REVIEW: 0, BLOCK: 0};

  let maliciousCount = 0;
  let benignCount = 0;

  rows.forEach((row, index) => {
    validateRow(row, index);

    const category = row.groundTruth.category;
    perCategory[category] = (perCategory[category] ?? 0) + 1;
    decisions[row.decisionLabel] += 1;

    if (row.groundTruth.isMalicious) maliciousCount += 1;
    else benignCount += 1;

    const modeA = evaluateRow(row, 'block_only');
    const modeB = evaluateRow(row, 'block_or_review');

    updateMatrix(blockOnly, modeA.malicious, modeA.predictedMalicious);
    updateMatrix(blockOrReview, modeB.malicious, modeB.predictedMalicious);
  });

  return {
    total: rows.length,
    classBalance: {
      malicious: maliciousCount,
      benign: benignCount,
      maliciousRatioPct: roundMetric(safeDivide(maliciousCount, rows.length))
    },
    decisions,
    policyMetrics: {
      blockOnly: finalizeConfusion(blockOnly),
      blockOrReview: finalizeConfusion(blockOrReview)
    },
    perCategory
  };
}

export function readNdjson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      try {
        return JSON.parse(line);
      } catch {
        throw new Error(`Invalid JSON at line ${index + 1}`);
      }
    });
}

export function evaluateLabelFile(filePath) {
  const absolute = path.resolve(filePath);
  if (!fs.existsSync(absolute)) {
    throw new Error(`Dataset file not found: ${absolute}`);
  }

  const rows = readNdjson(absolute);
  return {
    file: absolute,
    generatedAt: new Date().toISOString(),
    ...evaluateLabelRows(rows)
  };
}

export function evaluateDefaultDataset() {
  const defaultFile = path.resolve(process.cwd(), 'datasets', 'sample_labeled_transactions.ndjson');
  return evaluateLabelFile(defaultFile);
}

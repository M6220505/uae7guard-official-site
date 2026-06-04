import path from 'node:path';
import {evaluateDefaultDataset, evaluateLabelFile} from '../lib/label-evaluator.mjs';

const target = process.argv[2] ? path.resolve(process.argv[2]) : null;

try {
  const result = target ? evaluateLabelFile(target) : evaluateDefaultDataset();
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Dataset evaluation failed');
  process.exit(1);
}

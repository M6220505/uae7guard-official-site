import {isValidAddress} from '@/lib/optimized_risk_engine';
import type {
  AnalyzePayload,
  ExternalSignal,
  ExternalSignalSeverity,
  SimulationSummary
} from '@/lib/analyze-types';

const HEX_REGEX = /^0x[0-9a-fA-F]*$/;
const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

const MAX_BODY_BYTES = Number(process.env.ANALYZE_MAX_BODY_BYTES ?? 32_768);
const MAX_HISTORY_ITEMS = Number(process.env.ANALYZE_MAX_HISTORY_ITEMS ?? 250);
const MAX_EXTERNAL_SIGNALS = Number(process.env.ANALYZE_MAX_EXTERNAL_SIGNALS ?? 50);
const MAX_DATA_HEX_LENGTH = Number(process.env.ANALYZE_MAX_DATA_HEX_LENGTH ?? 12_288);

const allowedSeverities: ExternalSignalSeverity[] = ['low', 'medium', 'high', 'critical'];

export class ValidationError extends Error {
  readonly status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = 'ValidationError';
    this.status = status;
  }
}

function assertObject(value: unknown): asserts value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new ValidationError('Payload must be a JSON object.');
  }
}

function parseFiniteNumber(value: unknown, fallback = 0): number {
  if (value === null || value === undefined || value === '') return fallback;
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) {
    throw new ValidationError('transactionValue must be a finite number.');
  }
  if (parsed < 0) {
    throw new ValidationError('transactionValue cannot be negative.');
  }
  if (parsed > 1_000_000_000) {
    throw new ValidationError('transactionValue exceeds allowed limit.');
  }
  return parsed;
}

function parseOptionalAddress(field: unknown, fieldName: string): string | undefined {
  if (field === undefined || field === null || field === '') {
    return undefined;
  }

  if (typeof field !== 'string') {
    throw new ValidationError(`${fieldName} must be a string.`);
  }

  const trimmed = field.trim();
  if (!ADDRESS_REGEX.test(trimmed)) {
    throw new ValidationError(`${fieldName} must be a valid EVM address.`);
  }

  return trimmed;
}

function parseOptionalChainId(field: unknown): number | undefined {
  if (field === undefined || field === null || field === '') {
    return undefined;
  }

  const parsed = Number(field);
  if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 100_000_000) {
    throw new ValidationError('chainId must be a positive integer.');
  }

  return parsed;
}

function parseOptionalHexData(field: unknown): string | undefined {
  if (field === undefined || field === null || field === '') {
    return undefined;
  }

  if (typeof field !== 'string') {
    throw new ValidationError('data must be a hex string.');
  }

  const trimmed = field.trim();
  if (!HEX_REGEX.test(trimmed)) {
    throw new ValidationError('data must be valid hex prefixed with 0x.');
  }

  if (trimmed.length % 2 !== 0) {
    throw new ValidationError('data hex length must be even.');
  }

  if (trimmed.length > MAX_DATA_HEX_LENGTH) {
    throw new ValidationError('data exceeds maximum supported length.');
  }

  return trimmed;
}

function parseHistoricalAddresses(field: unknown): string[] {
  if (field === undefined || field === null) {
    return [];
  }

  if (!Array.isArray(field)) {
    throw new ValidationError('historicalAddresses must be an array.');
  }

  if (field.length > MAX_HISTORY_ITEMS) {
    throw new ValidationError(`historicalAddresses exceeds ${MAX_HISTORY_ITEMS} items.`);
  }

  const addresses: string[] = [];
  for (const item of field) {
    if (typeof item !== 'string') {
      throw new ValidationError('historicalAddresses entries must be strings.');
    }

    const trimmed = item.trim();
    if (!trimmed) continue;
    if (!isValidAddress(trimmed)) {
      throw new ValidationError(`Invalid historical address: ${trimmed}`);
    }

    addresses.push(trimmed);
  }

  return addresses;
}

function parseExternalSignals(field: unknown): ExternalSignal[] {
  if (field === undefined || field === null) {
    return [];
  }

  if (!Array.isArray(field)) {
    throw new ValidationError('externalSignals must be an array.');
  }

  if (field.length > MAX_EXTERNAL_SIGNALS) {
    throw new ValidationError(`externalSignals exceeds ${MAX_EXTERNAL_SIGNALS} items.`);
  }

  return field.map((item, index) => {
    assertObject(item);
    const source = typeof item.source === 'string' ? item.source.trim() : '';
    const severity = typeof item.severity === 'string' ? item.severity.trim().toLowerCase() : '';

    if (!source) {
      throw new ValidationError(`externalSignals[${index}].source is required.`);
    }

    if (!allowedSeverities.includes(severity as ExternalSignalSeverity)) {
      throw new ValidationError(`externalSignals[${index}].severity is invalid.`);
    }

    return {
      source,
      severity: severity as ExternalSignalSeverity,
      id: typeof item.id === 'string' ? item.id.trim() : undefined,
      note: typeof item.note === 'string' ? item.note.trim() : undefined
    };
  });
}

function parseSimulation(field: unknown): SimulationSummary | undefined {
  if (field === undefined || field === null) {
    return undefined;
  }

  assertObject(field);

  const touchedUnknownContractsRaw = field.touchedUnknownContracts;
  const touchedUnknownContracts =
    touchedUnknownContractsRaw === undefined || touchedUnknownContractsRaw === null
      ? undefined
      : Number(touchedUnknownContractsRaw);

  if (
    touchedUnknownContracts !== undefined &&
    (!Number.isInteger(touchedUnknownContracts) || touchedUnknownContracts < 0)
  ) {
    throw new ValidationError('simulation.touchedUnknownContracts must be a non-negative integer.');
  }

  function parseSimulationBool(value: unknown, key: string) {
    if (value === undefined || value === null) return undefined;
    if (typeof value !== 'boolean') {
      throw new ValidationError(`simulation.${key} must be boolean.`);
    }
    return value;
  }

  return {
    reverted: parseSimulationBool(field.reverted, 'reverted'),
    delegateCallDetected: parseSimulationBool(field.delegateCallDetected, 'delegateCallDetected'),
    selfDestructDetected: parseSimulationBool(field.selfDestructDetected, 'selfDestructDetected'),
    createdContract: parseSimulationBool(field.createdContract, 'createdContract'),
    unlimitedApprovalDetected: parseSimulationBool(
      field.unlimitedApprovalDetected,
      'unlimitedApprovalDetected'
    ),
    touchedUnknownContracts
  };
}

export function parseAnalyzePayload(rawBody: string): AnalyzePayload {
  const size = new TextEncoder().encode(rawBody).length;
  if (size > MAX_BODY_BYTES) {
    throw new ValidationError(`Payload exceeds ${MAX_BODY_BYTES} bytes.`, 413);
  }

  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(rawBody);
  } catch {
    throw new ValidationError('Invalid JSON payload.');
  }

  assertObject(parsedBody);

  const address = typeof parsedBody.address === 'string' ? parsedBody.address.trim() : '';
  if (!address || !isValidAddress(address)) {
    throw new ValidationError('Invalid Ethereum address. Format must be 0x + 40 hex chars.');
  }

  const payload: AnalyzePayload = {
    address,
    transactionValue: parseFiniteNumber(parsedBody.transactionValue, 0),
    historicalAddresses: parseHistoricalAddresses(parsedBody.historicalAddresses),
    chainId: parseOptionalChainId(parsedBody.chainId),
    from: parseOptionalAddress(parsedBody.from, 'from'),
    data: parseOptionalHexData(parsedBody.data),
    externalSignals: parseExternalSignals(parsedBody.externalSignals),
    simulation: parseSimulation(parsedBody.simulation)
  };

  return payload;
}

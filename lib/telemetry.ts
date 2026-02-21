type Outcome =
  | 'success'
  | 'validation_error'
  | 'auth_error'
  | 'rate_limited'
  | 'quota_blocked'
  | 'server_error';

type TelemetryInput = {
  outcome: Outcome;
  durationMs: number;
  riskLevel?: string;
  decision?: string;
};

const MAX_SAMPLES = 200;

const telemetryState = {
  startedAt: Date.now(),
  total: 0,
  success: 0,
  validationErrors: 0,
  authErrors: 0,
  rateLimited: 0,
  quotaBlocked: 0,
  serverErrors: 0,
  latencySamples: [] as number[],
  riskLevels: {} as Record<string, number>,
  decisions: {} as Record<string, number>
};

function addSample(durationMs: number) {
  telemetryState.latencySamples.push(Math.max(0, Math.round(durationMs)));
  if (telemetryState.latencySamples.length > MAX_SAMPLES) {
    telemetryState.latencySamples.shift();
  }
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return sorted[index] ?? 0;
}

export function recordAnalyzeTelemetry(input: TelemetryInput) {
  telemetryState.total += 1;
  addSample(input.durationMs);

  if (input.outcome === 'success') telemetryState.success += 1;
  if (input.outcome === 'validation_error') telemetryState.validationErrors += 1;
  if (input.outcome === 'auth_error') telemetryState.authErrors += 1;
  if (input.outcome === 'rate_limited') telemetryState.rateLimited += 1;
  if (input.outcome === 'quota_blocked') telemetryState.quotaBlocked += 1;
  if (input.outcome === 'server_error') telemetryState.serverErrors += 1;

  if (input.riskLevel) {
    telemetryState.riskLevels[input.riskLevel] =
      (telemetryState.riskLevels[input.riskLevel] ?? 0) + 1;
  }

  if (input.decision) {
    telemetryState.decisions[input.decision] = (telemetryState.decisions[input.decision] ?? 0) + 1;
  }
}

export function getAnalyzeTelemetrySnapshot() {
  const uptimeSeconds = Math.floor((Date.now() - telemetryState.startedAt) / 1000);

  return {
    uptimeSeconds,
    totalRequests: telemetryState.total,
    success: telemetryState.success,
    validationErrors: telemetryState.validationErrors,
    authErrors: telemetryState.authErrors,
    rateLimited: telemetryState.rateLimited,
    quotaBlocked: telemetryState.quotaBlocked,
    serverErrors: telemetryState.serverErrors,
    latencyMs: {
      p50: percentile(telemetryState.latencySamples, 50),
      p95: percentile(telemetryState.latencySamples, 95)
    },
    riskLevels: telemetryState.riskLevels,
    decisions: telemetryState.decisions
  };
}

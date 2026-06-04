export type SecurityAlertEvent = 'auth_error' | 'rate_limited' | 'quota_blocked' | 'server_error';

type SecurityAlertInput = {
  event: SecurityAlertEvent;
  requestId: string;
  tenantId: string;
  clientIp?: string;
  status: number;
  message?: string;
  route?: string;
  method?: string;
};

type AlertConfig = {
  enabled: boolean;
  url: string;
  bearerToken?: string;
  timeoutMs: number;
  rateLimitSample: number;
  suppressWindowMs: number;
  serviceName: string;
  environment: string;
};

const alertSuppressions = new Map<string, number>();

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function parseNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return parsed;
}

function getAlertConfig(): AlertConfig {
  const url = process.env.ANALYZE_ALERT_WEBHOOK_URL?.trim() || '';
  const bearerToken = process.env.ANALYZE_ALERT_WEBHOOK_BEARER_TOKEN?.trim() || undefined;

  return {
    enabled: Boolean(url),
    url,
    bearerToken,
    timeoutMs: clamp(parseNumber(process.env.ANALYZE_ALERT_TIMEOUT_MS, 1200), 300, 10_000),
    rateLimitSample: clamp(parseNumber(process.env.ANALYZE_ALERT_RATE_LIMIT_SAMPLE, 0.2), 0, 1),
    suppressWindowMs: clamp(parseNumber(process.env.ANALYZE_ALERT_SUPPRESS_WINDOW_MS, 30_000), 0, 300_000),
    serviceName: process.env.ANALYZE_ALERT_SERVICE_NAME?.trim() || 'uae7guard-analyze-api',
    environment:
      process.env.ANALYZE_ALERT_ENV?.trim() ||
      process.env.NODE_ENV?.trim() ||
      'unknown'
  };
}

function alertSeverity(event: SecurityAlertEvent) {
  if (event === 'server_error') return 'high';
  if (event === 'auth_error') return 'medium';
  return 'low';
}

function shouldSample(event: SecurityAlertEvent, config: AlertConfig) {
  if (event !== 'rate_limited') return true;
  if (config.rateLimitSample >= 1) return true;
  if (config.rateLimitSample <= 0) return false;
  return Math.random() <= config.rateLimitSample;
}

function shouldSuppress(key: string, now: number, suppressWindowMs: number) {
  if (suppressWindowMs <= 0) return false;

  const previous = alertSuppressions.get(key);
  if (typeof previous === 'number' && now - previous < suppressWindowMs) {
    return true;
  }

  alertSuppressions.set(key, now);

  if (alertSuppressions.size > 3000) {
    for (const [entryKey, timestamp] of alertSuppressions.entries()) {
      if (now - timestamp > suppressWindowMs * 2) {
        alertSuppressions.delete(entryKey);
      }
    }
  }

  return false;
}

export function getSecurityAlertRuntimeInfo() {
  const config = getAlertConfig();
  return {
    enabled: config.enabled,
    timeoutMs: config.timeoutMs,
    rateLimitSample: config.rateLimitSample,
    suppressWindowMs: config.suppressWindowMs,
    serviceName: config.serviceName,
    environment: config.environment
  };
}

export async function emitSecurityAlert(input: SecurityAlertInput) {
  const config = getAlertConfig();
  if (!config.enabled) return;
  if (!shouldSample(input.event, config)) return;

  const now = Date.now();
  const fingerprint = `${input.event}:${input.tenantId}:${input.clientIp || 'unknown'}:${input.status}`;
  if (shouldSuppress(fingerprint, now, config.suppressWindowMs)) return;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    const headers: Record<string, string> = {
      'content-type': 'application/json'
    };

    if (config.bearerToken) {
      headers.authorization = `Bearer ${config.bearerToken}`;
    }

    await fetch(config.url, {
      method: 'POST',
      headers,
      signal: controller.signal,
      body: JSON.stringify({
        event: 'analyze_security_alert',
        category: input.event,
        severity: alertSeverity(input.event),
        timestamp: new Date(now).toISOString(),
        service: config.serviceName,
        environment: config.environment,
        requestId: input.requestId,
        tenantId: input.tenantId,
        clientIp: input.clientIp || 'unknown',
        status: input.status,
        route: input.route || '/api/analyze',
        method: input.method || 'POST',
        message: input.message
      })
    });
  } catch {
    // Alert delivery failures are non-fatal.
  } finally {
    clearTimeout(timeout);
  }
}

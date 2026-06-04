import {NextResponse} from 'next/server';
import {analyzeRisk} from '@/lib/optimized_risk_engine';
import {parseAnalyzePayload, ValidationError} from '@/lib/analyze-validation';
import {consumeAnalyzeRateLimit, extractClientIp, getAnalyzeRateLimitConfig} from '@/lib/rate-limit';
import {emitSecurityAlert, getSecurityAlertRuntimeInfo} from '@/lib/security-alerts';
import {getAnalyzeTelemetrySnapshot, recordAnalyzeTelemetry} from '@/lib/telemetry';
import {getSimulationRuntimeInfo, runServerSideSimulation} from '@/lib/simulation-engine';
import {getTenantRuntimeInfo, getUsageAdminPolicy, hasUsageAdminAccess, resolveTenantAccess} from '@/lib/tenant-auth';
import {consumeDailyQuota, getUsageSnapshot, recordAnalyzeUsage} from '@/lib/usage-metrics';

const POLICY_VERSION = 'v4-phase3-2026-02';

function requestId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `req_${Date.now()}_${Math.floor(Math.random() * 1_000_000)}`;
}

function jsonResponse(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return NextResponse.json(body, {
    status,
    headers: {
      'cache-control': 'no-store',
      ...headers
    }
  });
}

export async function POST(request: Request) {
  const startedAt = Date.now();
  const reqId = requestId();
  const clientIp = extractClientIp(request);
  let tenantId = 'unknown';

  try {
    const auth = resolveTenantAccess(request);
    if (!auth.authorized) {
      const durationMs = Date.now() - startedAt;
      recordAnalyzeTelemetry({
        outcome: 'auth_error',
        durationMs
      });
      recordAnalyzeUsage({
        tenantId: 'unauthorized',
        outcome: 'auth_error',
        latencyMs: durationMs
      });
      void emitSecurityAlert({
        event: 'auth_error',
        requestId: reqId,
        tenantId: 'unauthorized',
        clientIp,
        status: auth.status,
        message: auth.message
      });

      return jsonResponse(
        {error: auth.message, requestId: reqId},
        auth.status,
        {'x-request-id': reqId}
      );
    }

    const access = auth.access;
    tenantId = access.tenantId;

    const rate = await consumeAnalyzeRateLimit({
      key: `analyze:${tenantId}:${clientIp}`,
      maxRequests: access.rateLimitMaxRequests
    });

    if (!rate.allowed) {
      const durationMs = Date.now() - startedAt;
      recordAnalyzeTelemetry({
        outcome: 'rate_limited',
        durationMs
      });
      recordAnalyzeUsage({
        tenantId,
        outcome: 'rate_limited',
        latencyMs: durationMs
      });
      void emitSecurityAlert({
        event: 'rate_limited',
        requestId: reqId,
        tenantId,
        clientIp,
        status: 429,
        message: 'Rate limit exceeded'
      });

      return jsonResponse(
        {error: 'Rate limit exceeded. Please retry later.', requestId: reqId, tenantId},
        429,
        {
          'x-request-id': reqId,
          'x-ratelimit-remaining': '0',
          'x-tenant-id': tenantId,
          'retry-after': String(rate.retryAfterSeconds)
        }
      );
    }

    const quota = await consumeDailyQuota(tenantId, access.dailyQuota);
    if (!quota.allowed) {
      const durationMs = Date.now() - startedAt;
      recordAnalyzeTelemetry({
        outcome: 'quota_blocked',
        durationMs
      });
      recordAnalyzeUsage({
        tenantId,
        outcome: 'quota_blocked',
        latencyMs: durationMs
      });
      void emitSecurityAlert({
        event: 'quota_blocked',
        requestId: reqId,
        tenantId,
        clientIp,
        status: 429,
        message: 'Daily tenant quota exceeded'
      });

      return jsonResponse(
        {
          error: 'Daily tenant quota exceeded.',
          requestId: reqId,
          tenantId
        },
        429,
        {
          'x-request-id': reqId,
          'x-ratelimit-remaining': String(rate.remaining),
          'x-tenant-id': tenantId,
          'x-quota-remaining': '0',
          'retry-after': String(Math.max(1, Math.ceil((quota.resetAt - Date.now()) / 1000)))
        }
      );
    }

    const rawBody = await request.text();
    const payload = parseAnalyzePayload(rawBody);
    const allowClientSimulation = process.env.ANALYZE_ALLOW_CLIENT_SIMULATION === 'true';
    const serverSimulation = await runServerSideSimulation(payload);

    const fallbackClientSimulation =
      allowClientSimulation && !serverSimulation.summary ? payload.simulation : undefined;

    const effectiveSimulation = serverSimulation.summary ?? fallbackClientSimulation;
    const simulationExecution = serverSimulation.summary
      ? serverSimulation
      : fallbackClientSimulation
        ? {
            status: 'ok',
            source: 'client',
            reason: 'client_simulation_fallback',
            summary: fallbackClientSimulation
          }
        : serverSimulation;

    const analysis = await analyzeRisk({
      ...payload,
      simulation: effectiveSimulation
    });
    const latencyMs = Date.now() - startedAt;

    recordAnalyzeTelemetry({
      outcome: 'success',
      durationMs: latencyMs,
      riskLevel: analysis.riskLevel,
      decision: analysis.decision
    });
    recordAnalyzeUsage({
      tenantId,
      outcome: 'success',
      latencyMs,
      decision: analysis.decision,
      riskLevel: analysis.riskLevel
    });

    console.info(
      JSON.stringify({
        event: 'analyze_request',
        requestId: reqId,
        tenantId,
        clientIp,
        decision: analysis.decision,
        riskLevel: analysis.riskLevel,
        riskScore: analysis.riskScore,
        simulationStatus: simulationExecution.status,
        simulationSource: simulationExecution.source,
        latencyMs
      })
    );

    return jsonResponse(
      {
        ...analysis,
        simulation: simulationExecution,
        tenantId,
        requestId: reqId,
        policyVersion: POLICY_VERSION
      },
      200,
      {
        'x-request-id': reqId,
        'x-ratelimit-remaining': String(rate.remaining),
        'x-tenant-id': tenantId,
        'x-quota-remaining': quota.remaining === null ? 'unlimited' : String(quota.remaining)
      }
    );
  } catch (error) {
    const latencyMs = Date.now() - startedAt;

    if (error instanceof ValidationError) {
      recordAnalyzeTelemetry({
        outcome: 'validation_error',
        durationMs: latencyMs
      });
      recordAnalyzeUsage({
        tenantId,
        outcome: 'validation_error',
        latencyMs
      });

      return jsonResponse(
        {
          error: error.message,
          requestId: reqId,
          tenantId
        },
        error.status,
        {'x-request-id': reqId}
      );
    }

    const message = error instanceof Error ? error.message : 'Unknown server error';
    recordAnalyzeTelemetry({
      outcome: 'server_error',
      durationMs: latencyMs
    });
    recordAnalyzeUsage({
      tenantId,
      outcome: 'server_error',
      latencyMs
    });

    console.error(
      JSON.stringify({
        event: 'analyze_request_error',
        requestId: reqId,
        tenantId,
        clientIp,
        message
      })
    );

    const exposeServerErrors = process.env.ANALYZE_EXPOSE_SERVER_ERRORS === 'true';
    void emitSecurityAlert({
      event: 'server_error',
      requestId: reqId,
      tenantId,
      clientIp,
      status: 500,
      message
    });
    return jsonResponse(
      {
        error: exposeServerErrors
          ? `Risk analysis failed: ${message}`
          : 'Risk analysis failed due to internal server error.',
        requestId: reqId,
        tenantId
      },
      500,
      {'x-request-id': reqId}
    );
  }
}

export async function GET(request: Request) {
  const policy = getUsageAdminPolicy();
  if (!policy.keyConfigured && policy.enforced) {
    return jsonResponse({error: 'Admin key is required in production but is not configured.'}, 503);
  }

  if (!hasUsageAdminAccess(request)) {
    return jsonResponse({error: 'Unauthorized analyze metadata access.'}, 401);
  }

  const limit = getAnalyzeRateLimitConfig();
  const simulation = getSimulationRuntimeInfo();
  const tenants = getTenantRuntimeInfo();
  const usage = getUsageSnapshot();
  const alerts = getSecurityAlertRuntimeInfo();

  return jsonResponse({
    status: 'ok',
    endpoint: '/api/analyze',
    methods: ['POST'],
    policyVersion: POLICY_VERSION,
    simulation,
    tenants,
    usage: {
      tenantCount: usage.tenantCount,
      generatedAt: usage.generatedAt
    },
    alerts,
    rateLimit: limit,
    telemetry: getAnalyzeTelemetrySnapshot()
  });
}

import {NextResponse} from 'next/server';
import {getAnalyzeRateLimitConfig} from '@/lib/rate-limit';
import {getSecurityAlertRuntimeInfo} from '@/lib/security-alerts';
import {getSimulationRuntimeInfo} from '@/lib/simulation-engine';
import {getTenantRuntimeInfo, getUsageAdminPolicy, hasUsageAdminAccess} from '@/lib/tenant-auth';
import {getAnalyzeTelemetrySnapshot} from '@/lib/telemetry';
import {getUsageSnapshot} from '@/lib/usage-metrics';
import {evaluateDefaultDataset} from '@/lib/label-evaluator.mjs';

function jsonResponse(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      'cache-control': 'no-store'
    }
  });
}

export async function GET(request: Request) {
  const policy = getUsageAdminPolicy();
  if (!policy.keyConfigured && policy.enforced) {
    return jsonResponse({error: 'Admin key is required in production but is not configured.'}, 503);
  }

  if (!hasUsageAdminAccess(request)) {
    return jsonResponse({error: 'Unauthorized usage access.'}, 401);
  }

  let evaluation: unknown = null;
  let evaluationError: string | null = null;

  try {
    evaluation = evaluateDefaultDataset();
  } catch (error) {
    evaluationError = error instanceof Error ? error.message : 'Dataset evaluation failed';
  }

  return jsonResponse({
    generatedAt: new Date().toISOString(),
    telemetry: getAnalyzeTelemetrySnapshot(),
    usage: getUsageSnapshot(),
    tenantRuntime: getTenantRuntimeInfo(),
    simulationRuntime: getSimulationRuntimeInfo(),
    alertRuntime: getSecurityAlertRuntimeInfo(),
    rateLimit: getAnalyzeRateLimitConfig(),
    evaluation,
    evaluationError
  });
}

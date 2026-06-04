import {NextResponse} from 'next/server';
import {getAnalyzeRateLimitConfig} from '@/lib/rate-limit';
import {getSecurityAlertRuntimeInfo} from '@/lib/security-alerts';
import {getSimulationRuntimeInfo} from '@/lib/simulation-engine';
import {getTenantRuntimeInfo, getUsageAdminPolicy} from '@/lib/tenant-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      service: 'uae7guard',
      version: '2.6.0',
      generatedAt: new Date().toISOString(),
      runtime: {
        nodeEnv: process.env.NODE_ENV ?? 'development',
        tenant: getTenantRuntimeInfo(),
        usageAdmin: getUsageAdminPolicy(),
        rateLimit: getAnalyzeRateLimitConfig(),
        simulation: getSimulationRuntimeInfo(),
        alerts: getSecurityAlertRuntimeInfo()
      }
    },
    {
      headers: {
        'cache-control': 'no-store'
      }
    }
  );
}

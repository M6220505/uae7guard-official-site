import { NextRequest, NextResponse } from 'next/server';
import { enforceApiAuthentication, enforceRateLimit } from '@/lib/api-security';
import { analyzeScamContent } from '@/lib/scam-detection';

export async function POST(request: NextRequest) {
  const authError = enforceApiAuthentication(request);
  if (authError) return authError;

  const rateLimitError = enforceRateLimit(request);
  if (rateLimitError) return rateLimitError;

  const body = await request.json();
  const result = analyzeScamContent({ text: body.text, url: body.url });

  return NextResponse.json(result);
}

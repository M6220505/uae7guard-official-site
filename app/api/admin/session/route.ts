import {NextResponse} from 'next/server';
import {
  ADMIN_SESSION_COOKIE_NAME,
  createAdminSessionToken,
  getUsageAdminPolicy
} from '@/lib/tenant-auth';

const MAX_BODY_BYTES = 4_096;
const DEFAULT_SESSION_MAX_AGE_SECONDS = Number(process.env.ANALYZE_ADMIN_SESSION_MAX_AGE_SECONDS ?? 28_800);

function jsonResponse(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      'cache-control': 'no-store'
    }
  });
}

function getSessionMaxAgeSeconds() {
  if (!Number.isFinite(DEFAULT_SESSION_MAX_AGE_SECONDS) || DEFAULT_SESSION_MAX_AGE_SECONDS <= 0) {
    return 28_800;
  }

  return Math.min(86_400, Math.max(300, Math.floor(DEFAULT_SESSION_MAX_AGE_SECONDS)));
}

function parseCandidate(rawBody: string) {
  const bytes = new TextEncoder().encode(rawBody).length;
  if (bytes > MAX_BODY_BYTES) {
    return {error: 'Payload too large.', candidate: null as string | null};
  }

  try {
    const parsed = JSON.parse(rawBody) as {adminKey?: unknown};
    const adminKey = typeof parsed?.adminKey === 'string' ? parsed.adminKey.trim() : '';
    if (!adminKey) {
      return {error: 'Missing adminKey.', candidate: null as string | null};
    }

    return {error: null, candidate: adminKey};
  } catch {
    return {error: 'Invalid JSON payload.', candidate: null as string | null};
  }
}

export async function POST(request: Request) {
  const policy = getUsageAdminPolicy();
  if (!policy.keyConfigured) {
    return jsonResponse({error: 'Admin access is not configured on this deployment.'}, 503);
  }

  const rawBody = await request.text();
  const parsed = parseCandidate(rawBody);
  if (parsed.error || !parsed.candidate) {
    return jsonResponse({error: parsed.error ?? 'Invalid admin payload.'}, 400);
  }

  const token = createAdminSessionToken(parsed.candidate);
  if (!token) {
    return jsonResponse({error: 'Invalid admin key.'}, 401);
  }

  const response = jsonResponse({ok: true});
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: getSessionMaxAgeSeconds()
  });

  return response;
}

export async function DELETE() {
  const response = jsonResponse({ok: true});
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0
  });
  return response;
}

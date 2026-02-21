import {createHmac} from 'node:crypto';

type TenantConfig = {
  tenantId: string;
  apiKey: string;
  rateLimitMaxRequests?: number;
  dailyQuota?: number;
};

export type TenantAccess = {
  tenantId: string;
  rateLimitMaxRequests: number;
  dailyQuota: number | null;
};

type TenantCache = {
  loaded: boolean;
  tenants: TenantConfig[];
  loadError: string | null;
};

export const ADMIN_SESSION_COOKIE_NAME = 'uae7guard_admin_key';
const ADMIN_SESSION_TOKEN_VERSION = 'v1';
const DEFAULT_ADMIN_SESSION_MAX_AGE_SECONDS = Number(
  process.env.ANALYZE_ADMIN_SESSION_MAX_AGE_SECONDS ?? 28_800
);

const DEFAULT_RATE_LIMIT_MAX = Number(process.env.ANALYZE_RATE_LIMIT_MAX_REQUESTS ?? 60);
const DEFAULT_DAILY_QUOTA = Number(process.env.ANALYZE_DEFAULT_DAILY_QUOTA ?? 10000);
const ALLOW_UNAUTH_TENANT_HEADER = process.env.ANALYZE_ALLOW_UNAUTH_TENANT_HEADER === 'true';

const cache: TenantCache = {
  loaded: false,
  tenants: [],
  loadError: null
};

function secureStringCompare(a: string, b: string) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

function getAdminSessionMaxAgeSeconds() {
  if (!Number.isFinite(DEFAULT_ADMIN_SESSION_MAX_AGE_SECONDS) || DEFAULT_ADMIN_SESSION_MAX_AGE_SECONDS <= 0) {
    return 28_800;
  }
  return Math.min(86_400, Math.max(300, Math.floor(DEFAULT_ADMIN_SESSION_MAX_AGE_SECONDS)));
}

function signAdminSessionPayload(payload: string, secret: string) {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

function verifyAdminSessionToken(token: string | null | undefined) {
  const expected = process.env.ANALYZE_ADMIN_KEY?.trim();
  if (!expected || !token) return false;

  const normalized = token.trim();
  const [version, issuedAtRaw, signature] = normalized.split('.');
  if (!version || !issuedAtRaw || !signature) return false;
  if (version !== ADMIN_SESSION_TOKEN_VERSION) return false;

  const issuedAt = Number(issuedAtRaw);
  if (!Number.isInteger(issuedAt) || issuedAt <= 0) return false;

  const now = Math.floor(Date.now() / 1000);
  const maxAge = getAdminSessionMaxAgeSeconds();
  if (issuedAt > now + 60) return false;
  if (now - issuedAt > maxAge + 60) return false;

  const payload = `${version}.${issuedAtRaw}`;
  const expectedSig = signAdminSessionPayload(payload, expected);
  return secureStringCompare(expectedSig, signature);
}

function parseCookieHeader(rawCookie: string | null): Record<string, string> {
  if (!rawCookie?.trim()) return {};

  const output: Record<string, string> = {};
  for (const pair of rawCookie.split(';')) {
    const [keyRaw, ...valueParts] = pair.split('=');
    const key = keyRaw?.trim();
    if (!key) continue;
    const rawValue = valueParts.join('=').trim();
    try {
      output[key] = decodeURIComponent(rawValue);
    } catch {
      output[key] = rawValue;
    }
  }
  return output;
}

function readAdminKeyCandidate(input: {
  headerAdminKey?: string | null;
  authorization?: string | null;
  cookieHeader?: string | null;
}) {
  const fromHeader = input.headerAdminKey?.trim();
  if (fromHeader) return fromHeader;

  const authHeader = input.authorization?.trim() ?? '';
  if (authHeader.toLowerCase().startsWith('bearer ')) {
    const token = authHeader.slice(7).trim();
    if (token) return token;
  }

  const cookies = parseCookieHeader(input.cookieHeader ?? null);
  const fromCookie = cookies[ADMIN_SESSION_COOKIE_NAME]?.trim();
  if (fromCookie) return fromCookie;

  return null;
}

export function getUsageAdminPolicy() {
  const keyConfigured = Boolean(process.env.ANALYZE_ADMIN_KEY?.trim());
  const requireInProduction = process.env.ANALYZE_REQUIRE_ADMIN_KEY_IN_PRODUCTION !== 'false';
  const enforced = keyConfigured || (process.env.NODE_ENV === 'production' && requireInProduction);

  return {
    keyConfigured,
    requireInProduction,
    enforced
  };
}

export function hasUsageAdminAccessFromCandidate(candidate: string | null | undefined) {
  const expected = process.env.ANALYZE_ADMIN_KEY?.trim();
  if (!expected) {
    return !getUsageAdminPolicy().enforced;
  }

  if (!candidate) return false;
  const normalized = candidate.trim();
  if (secureStringCompare(expected, normalized)) return true;
  return verifyAdminSessionToken(normalized);
}

export function hasUsageAdminAccess(request: Request) {
  const candidate = readAdminKeyCandidate({
    headerAdminKey: request.headers.get('x-admin-key'),
    authorization: request.headers.get('authorization'),
    cookieHeader: request.headers.get('cookie')
  });
  return hasUsageAdminAccessFromCandidate(candidate);
}

export function createAdminSessionToken(candidate: string | null | undefined) {
  const expected = process.env.ANALYZE_ADMIN_KEY?.trim();
  if (!expected || !candidate) return null;
  if (!secureStringCompare(expected, candidate.trim())) return null;

  const issuedAt = Math.floor(Date.now() / 1000);
  const payload = `${ADMIN_SESSION_TOKEN_VERSION}.${issuedAt}`;
  const signature = signAdminSessionPayload(payload, expected);
  return `${payload}.${signature}`;
}

function parsePositiveInteger(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return undefined;
  return parsed;
}

function loadTenantConfigs() {
  if (cache.loaded) return cache;
  cache.loaded = true;

  const raw = process.env.ANALYZE_TENANTS_JSON?.trim();
  if (!raw) {
    return cache;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      cache.loadError = 'ANALYZE_TENANTS_JSON must be a JSON array.';
      return cache;
    }

    const tenants: TenantConfig[] = [];

    for (const item of parsed) {
      if (!item || typeof item !== 'object') continue;

      const tenantId =
        typeof item.tenantId === 'string' && item.tenantId.trim()
          ? item.tenantId.trim()
          : undefined;
      const apiKey =
        typeof item.apiKey === 'string' && item.apiKey.trim() ? item.apiKey.trim() : undefined;

      if (!tenantId || !apiKey) continue;

      tenants.push({
        tenantId,
        apiKey,
        rateLimitMaxRequests: parsePositiveInteger(item.rateLimitMaxRequests),
        dailyQuota: parsePositiveInteger(item.dailyQuota)
      });
    }

    cache.tenants = tenants;
  } catch (error) {
    cache.loadError = error instanceof Error ? error.message : 'Invalid ANALYZE_TENANTS_JSON';
  }

  return cache;
}

export function getTenantRuntimeInfo() {
  const state = loadTenantConfigs();
  const hasMultiTenant = state.tenants.length > 0;

  return {
    mode: hasMultiTenant ? 'multi-tenant' : 'single-tenant',
    tenantsConfigured: state.tenants.length,
    tenantIds: state.tenants.map((tenant) => tenant.tenantId),
    defaults: {
      rateLimitMaxRequests: DEFAULT_RATE_LIMIT_MAX,
      dailyQuota: DEFAULT_DAILY_QUOTA
    },
    loadError: state.loadError
  };
}

export function resolveTenantAccess(request: Request):
  | {authorized: true; access: TenantAccess}
  | {authorized: false; status: number; message: string} {
  const state = loadTenantConfigs();
  if (state.loadError) {
    return {
      authorized: false,
      status: 500,
      message: `Tenant config error: ${state.loadError}`
    };
  }

  const providedApiKey = request.headers.get('x-api-key')?.trim();

  if (state.tenants.length > 0) {
    if (!providedApiKey) {
      return {authorized: false, status: 401, message: 'Missing x-api-key.'};
    }

    const matched = state.tenants.find((tenant) => secureStringCompare(tenant.apiKey, providedApiKey));
    if (!matched) {
      return {authorized: false, status: 401, message: 'Invalid tenant API key.'};
    }

    return {
      authorized: true,
      access: {
        tenantId: matched.tenantId,
        rateLimitMaxRequests: matched.rateLimitMaxRequests ?? DEFAULT_RATE_LIMIT_MAX,
        dailyQuota: matched.dailyQuota ?? DEFAULT_DAILY_QUOTA
      }
    };
  }

  const singleKey = process.env.ANALYZE_API_KEY?.trim();
  if (singleKey) {
    if (!providedApiKey) {
      return {authorized: false, status: 401, message: 'Missing x-api-key.'};
    }

    if (!secureStringCompare(singleKey, providedApiKey)) {
      return {authorized: false, status: 401, message: 'Unauthorized request.'};
    }
  }

  const tenantHeader = request.headers.get('x-tenant-id')?.trim();

  return {
    authorized: true,
    access: {
      tenantId: ALLOW_UNAUTH_TENANT_HEADER && tenantHeader ? tenantHeader : 'default',
      rateLimitMaxRequests: DEFAULT_RATE_LIMIT_MAX,
      dailyQuota: Number.isFinite(DEFAULT_DAILY_QUOTA) && DEFAULT_DAILY_QUOTA > 0
        ? DEFAULT_DAILY_QUOTA
        : null
    }
  };
}

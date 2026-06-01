#!/usr/bin/env node

import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {access} from 'node:fs/promises';
import {createServer} from 'node:net';
import path from 'node:path';
import process from 'node:process';

const NPM_CMD = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const NEXT_CMD =
  process.platform === 'win32'
    ? path.join(process.cwd(), 'node_modules', '.bin', 'next.cmd')
    : path.join(process.cwd(), 'node_modules', '.bin', 'next');
const cwd = process.cwd();

const ADMIN_KEY = 'smoke-admin-key';
const API_KEY_DEFAULT = 'smoke-api-key-default';
const API_KEY_RATE = 'smoke-api-key-rate';
const API_KEY_QUOTA = 'smoke-api-key-quota';

const tenants = [
  {
    tenantId: 'default-smoke',
    apiKey: API_KEY_DEFAULT,
    rateLimitMaxRequests: 20,
    dailyQuota: 20
  },
  {
    tenantId: 'rate-limit-smoke',
    apiKey: API_KEY_RATE,
    rateLimitMaxRequests: 2,
    dailyQuota: 50
  },
  {
    tenantId: 'quota-smoke',
    apiKey: API_KEY_QUOTA,
    rateLimitMaxRequests: 20,
    dailyQuota: 1
  }
];

const serverEnv = {
  ...process.env,
  NODE_ENV: 'production',
  ANALYZE_ADMIN_KEY: ADMIN_KEY,
  ANALYZE_REQUIRE_ADMIN_KEY_IN_PRODUCTION: 'true',
  ANALYZE_TENANTS_JSON: JSON.stringify(tenants),
  ANALYZE_RATE_LIMIT_WINDOW_MS: '60000',
  ANALYZE_RATE_LIMIT_MAX_REQUESTS: '60',
  ANALYZE_DEFAULT_DAILY_QUOTA: '10000',
  ANALYZE_ALLOW_UNAUTH_TENANT_HEADER: 'false',
  ANALYZE_EXPOSE_SERVER_ERRORS: 'false',
  ANALYZE_ALLOW_CLIENT_SIMULATION: 'false',
  ANALYZE_REDIS_REST_URL: '',
  ANALYZE_REDIS_REST_TOKEN: '',
  ANALYZE_ALERT_WEBHOOK_URL: ''
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function pushRecentLog(buffer, chunk, stream) {
  const line = `[${stream}] ${String(chunk).trimEnd()}`;
  if (!line.trim()) return;
  buffer.push(line);
  if (buffer.length > 120) {
    buffer.shift();
  }
}

async function ensureProductionBuild() {
  const buildIdPath = path.join(cwd, '.next', 'BUILD_ID');

  try {
    await access(buildIdPath);
    return;
  } catch {
    // Build is missing.
  }

  console.log('No production build found. Running npm run build...');
  await runCommand(NPM_CMD, ['run', 'build'], {cwd, env: process.env});
}

function runCommand(command, args, options) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      ...options,
      stdio: 'inherit'
    });

    child.on('error', (error) => {
      reject(error);
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${command} ${args.join(' ')} failed with exit code ${code ?? 'unknown'}`));
    });
  });
}

async function findFreePort() {
  return await new Promise((resolve, reject) => {
    const server = createServer();

    server.on('error', (error) => {
      reject(error);
    });

    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : 0;
      server.close((closeError) => {
        if (closeError) {
          reject(closeError);
          return;
        }
        if (!port) {
          reject(new Error('Failed to allocate free port.'));
          return;
        }
        resolve(port);
      });
    });
  });
}

async function waitForServer(baseUrl, processRef, timeoutMs, recentLogs) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    if (processRef.exitCode !== null) {
      throw new Error(
        `Server exited early with code ${processRef.exitCode}.\nRecent logs:\n${recentLogs.join('\n')}`
      );
    }

    try {
      const response = await fetch(`${baseUrl}/en`, {
        redirect: 'manual',
        signal: AbortSignal.timeout(5000)
      });
      if (response.status >= 200 && response.status < 500) {
        return;
      }
    } catch {
      // Retry until timeout.
    }

    await sleep(500);
  }

  throw new Error(`Timed out waiting for server readiness.\nRecent logs:\n${recentLogs.join('\n')}`);
}

async function stopServer(serverProcess) {
  if (!serverProcess || serverProcess.exitCode !== null) {
    return;
  }

  try {
    if (process.platform === 'win32') {
      serverProcess.kill('SIGTERM');
    } else if (serverProcess.pid) {
      // Kill the detached process group so next-server cannot outlive npm wrappers.
      process.kill(-serverProcess.pid, 'SIGTERM');
    }
  } catch {
    // Ignore shutdown race errors.
  }

  try {
    await Promise.race([once(serverProcess, 'exit'), sleep(5000)]);
  } catch {
    // Ignore race errors.
  }

  if (serverProcess.exitCode === null) {
    try {
      if (process.platform === 'win32') {
        serverProcess.kill('SIGKILL');
      } else if (serverProcess.pid) {
        process.kill(-serverProcess.pid, 'SIGKILL');
      }
    } catch {
      // Ignore shutdown race errors.
    }

    try {
      await Promise.race([once(serverProcess, 'exit'), sleep(3000)]);
    } catch {
      // Ignore shutdown race errors.
    }
  }

  serverProcess.stdout?.removeAllListeners('data');
  serverProcess.stderr?.removeAllListeners('data');
  serverProcess.stdout?.destroy();
  serverProcess.stderr?.destroy();
}

async function requestJson(baseUrl, pathname, init = {}) {
  const signal = init.signal ?? AbortSignal.timeout(10_000);
  const response = await fetch(`${baseUrl}${pathname}`, {
    redirect: 'manual',
    ...init,
    signal
  });

  const text = await response.text();
  let json = null;

  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  return {
    response,
    status: response.status,
    headers: response.headers,
    text,
    json
  };
}

function validPayload() {
  return {
    address: '0x2222222222222222222222222222222222222222',
    transactionValue: 0.12,
    historicalAddresses: []
  };
}

async function main() {
  await ensureProductionBuild();

  const port = await findFreePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const recentLogs = [];

  const serverProcess = spawn(NEXT_CMD, ['start', '-p', String(port)], {
    cwd,
    env: {
      ...serverEnv,
      PORT: String(port)
    },
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: process.platform !== 'win32'
  });

  serverProcess.stdout.on('data', (chunk) => pushRecentLog(recentLogs, chunk, 'stdout'));
  serverProcess.stderr.on('data', (chunk) => pushRecentLog(recentLogs, chunk, 'stderr'));

  const failures = [];

  async function runTest(name, fn) {
    try {
      await fn();
      console.log(`PASS ${name}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      failures.push({name, message});
      console.error(`FAIL ${name}: ${message}`);
    }
  }

  try {
    await waitForServer(baseUrl, serverProcess, 60_000, recentLogs);

    await runTest('usage endpoint denies unauthenticated admin access', async () => {
      const result = await requestJson(baseUrl, '/api/usage');
      assert(result.status === 401, `Expected 401, got ${result.status}`);
    });

    await runTest('usage endpoint allows x-admin-key access', async () => {
      const result = await requestJson(baseUrl, '/api/usage', {
        headers: {
          'x-admin-key': ADMIN_KEY
        }
      });

      assert(result.status === 200, `Expected 200, got ${result.status}`);
      assert(Boolean(result.json?.usage), 'Expected usage payload in response.');
      assert(Boolean(result.json?.alertRuntime), 'Expected alertRuntime in response.');
      assert(Boolean(result.json?.rateLimit?.backend), 'Expected rateLimit backend metadata.');
    });

    await runTest('analyze metadata endpoint denies unauthenticated access', async () => {
      const result = await requestJson(baseUrl, '/api/analyze');
      assert(result.status === 401, `Expected 401, got ${result.status}`);
    });

    await runTest('analyze metadata endpoint accepts admin bearer token', async () => {
      const result = await requestJson(baseUrl, '/api/analyze', {
        headers: {
          authorization: `Bearer ${ADMIN_KEY}`
        }
      });

      assert(result.status === 200, `Expected 200, got ${result.status}`);
      assert(result.json?.endpoint === '/api/analyze', 'Expected endpoint metadata in response.');
      assert(Boolean(result.json?.alerts), 'Expected alerts runtime metadata in response.');
    });

    await runTest('analyze endpoint requires tenant API key', async () => {
      const result = await requestJson(baseUrl, '/api/analyze', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify(validPayload())
      });

      assert(result.status === 401, `Expected 401, got ${result.status}`);
    });

    await runTest('analyze endpoint rejects invalid payload with 400', async () => {
      const result = await requestJson(baseUrl, '/api/analyze', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': API_KEY_DEFAULT,
          'x-forwarded-for': '198.51.100.21'
        },
        body: JSON.stringify({address: '0x123'})
      });

      assert(result.status === 400, `Expected 400, got ${result.status}`);
      assert(Boolean(result.json?.error), 'Expected validation error message.');
    });

    await runTest('analyze endpoint accepts valid request and returns tracking headers', async () => {
      const result = await requestJson(baseUrl, '/api/analyze', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': API_KEY_DEFAULT,
          'x-forwarded-for': '198.51.100.22'
        },
        body: JSON.stringify(validPayload())
      });

      assert(result.status === 200, `Expected 200, got ${result.status}`);
      assert(Boolean(result.json?.requestId), 'Expected requestId in JSON response.');
      assert(Boolean(result.json?.decision), 'Expected decision in JSON response.');
      assert(Boolean(result.headers.get('x-request-id')), 'Expected x-request-id response header.');
      assert(Boolean(result.headers.get('x-tenant-id')), 'Expected x-tenant-id response header.');
    });

    await runTest('tenant-specific rate limit blocks after configured threshold', async () => {
      const headers = {
        'content-type': 'application/json',
        'x-api-key': API_KEY_RATE,
        'x-forwarded-for': '203.0.113.33'
      };

      const first = await requestJson(baseUrl, '/api/analyze', {
        method: 'POST',
        headers,
        body: JSON.stringify(validPayload())
      });
      const second = await requestJson(baseUrl, '/api/analyze', {
        method: 'POST',
        headers,
        body: JSON.stringify(validPayload())
      });
      const third = await requestJson(baseUrl, '/api/analyze', {
        method: 'POST',
        headers,
        body: JSON.stringify(validPayload())
      });

      assert(first.status === 200, `Expected first request status 200, got ${first.status}`);
      assert(second.status === 200, `Expected second request status 200, got ${second.status}`);
      assert(third.status === 429, `Expected third request status 429, got ${third.status}`);
      assert(Boolean(third.headers.get('retry-after')), 'Expected retry-after header on rate limit response.');
    });

    await runTest('tenant-specific daily quota blocks excess requests', async () => {
      const headers = {
        'content-type': 'application/json',
        'x-api-key': API_KEY_QUOTA,
        'x-forwarded-for': '203.0.113.44'
      };

      const first = await requestJson(baseUrl, '/api/analyze', {
        method: 'POST',
        headers,
        body: JSON.stringify(validPayload())
      });

      const second = await requestJson(baseUrl, '/api/analyze', {
        method: 'POST',
        headers,
        body: JSON.stringify(validPayload())
      });

      assert(first.status === 200, `Expected first request status 200, got ${first.status}`);
      assert(second.status === 429, `Expected second request status 429, got ${second.status}`);
      assert(
        String(second.json?.error || '').toLowerCase().includes('quota'),
        'Expected daily quota error message in second response.'
      );
      assert(second.headers.get('x-quota-remaining') === '0', 'Expected x-quota-remaining to be 0.');
    });

    await runTest('admin session endpoint validates keys and issues secure cookie token', async () => {
      const invalid = await requestJson(baseUrl, '/api/admin/session', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({adminKey: 'wrong-key'})
      });

      assert(invalid.status === 401, `Expected invalid key status 401, got ${invalid.status}`);

      const valid = await requestJson(baseUrl, '/api/admin/session', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({adminKey: ADMIN_KEY})
      });

      assert(valid.status === 200, `Expected valid key status 200, got ${valid.status}`);
      const setCookie = valid.headers.get('set-cookie') || '';
      assert(setCookie.includes('uae7guard_admin_key='), 'Expected admin session cookie to be set.');
      assert(!setCookie.includes(ADMIN_KEY), 'Expected session cookie not to contain raw admin key.');

      const cookieHeader = setCookie.split(';')[0] || '';
      assert(Boolean(cookieHeader), 'Expected cookie header value for follow-up request.');

      const usageWithCookie = await requestJson(baseUrl, '/api/usage', {
        headers: {
          cookie: cookieHeader
        }
      });

      assert(usageWithCookie.status === 200, `Expected cookie-auth usage status 200, got ${usageWithCookie.status}`);
    });
  } finally {
    await stopServer(serverProcess);
  }

  if (failures.length > 0) {
    console.error('\nSecurity smoke tests failed:');
    for (const failure of failures) {
      console.error(`- ${failure.name}: ${failure.message}`);
    }
    process.exit(1);
  }

  console.log('\nSecurity smoke tests passed.');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

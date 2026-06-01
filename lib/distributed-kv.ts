type RedisCommandArg = string | number;

type PipelineItem = {
  result?: unknown;
  error?: string;
};

function getRedisRestConfig() {
  const url =
    process.env.ANALYZE_REDIS_REST_URL?.trim() || process.env.UPSTASH_REDIS_REST_URL?.trim() || '';
  const token =
    process.env.ANALYZE_REDIS_REST_TOKEN?.trim() || process.env.UPSTASH_REDIS_REST_TOKEN?.trim() || '';

  return {
    url,
    token,
    enabled: Boolean(url && token)
  };
}

export function getDistributedKvRuntimeInfo() {
  const config = getRedisRestConfig();
  return {
    enabled: config.enabled,
    backend: config.enabled ? 'redis-rest' : 'memory'
  } as const;
}

function normalizeResultNumber(value: unknown): number | null {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return Math.trunc(parsed);
}

async function runPipeline(commands: RedisCommandArg[][]): Promise<PipelineItem[] | null> {
  const config = getRedisRestConfig();
  if (!config.enabled) return null;

  try {
    const response = await fetch(`${config.url}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(commands)
    });

    if (!response.ok) return null;
    const parsed = (await response.json()) as PipelineItem[];
    if (!Array.isArray(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function redisIncrWithExpiry(key: string, ttlSeconds: number) {
  const normalizedTtl = Math.max(1, Math.floor(ttlSeconds));

  const results = await runPipeline([
    ['INCR', key],
    ['EXPIRE', key, normalizedTtl]
  ]);

  if (!results || results.length < 1 || results[0]?.error) {
    return null;
  }

  return normalizeResultNumber(results[0]?.result);
}

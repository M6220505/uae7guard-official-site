type IntegrationStatus = 'ready' | 'missing' | 'optional';

type IntegrationCheck = {
  id: string;
  label: string;
  status: IntegrationStatus;
  category: 'web3' | 'threat-intel' | 'ops' | 'simulation';
  required: boolean;
  env: string[];
  impact: string;
};

function hasValue(key: string) {
  return Boolean(process.env[key]?.trim());
}

function configured(keys: string[]) {
  return keys.some((key) => hasValue(key));
}

export function getIntegrationStatus() {
  const checks: IntegrationCheck[] = [
    {
      id: 'walletconnect',
      label: 'WalletConnect',
      status: hasValue('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID') ? 'ready' : 'missing',
      category: 'web3',
      required: true,
      env: ['NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID'],
      impact: 'Required for production wallet connection reliability.'
    },
    {
      id: 'alchemy',
      label: 'Alchemy Browser Key',
      status: hasValue('NEXT_PUBLIC_ALCHEMY_API_KEY') ? 'ready' : 'missing',
      category: 'web3',
      required: true,
      env: ['NEXT_PUBLIC_ALCHEMY_API_KEY'],
      impact: 'Enables wallet/network integrations that need an RPC-backed public key.'
    },
    {
      id: 'server-rpc',
      label: 'Server Simulation RPC',
      status: configured(['SIM_RPC_URL', 'SIM_RPC_URL_1', 'SIM_RPC_URL_42161', 'SIM_RPC_URL_8453'])
        ? 'ready'
        : 'missing',
      category: 'simulation',
      required: true,
      env: ['SIM_RPC_URL', 'SIM_RPC_URL_<CHAIN_ID>'],
      impact: 'Required for live pre-sign simulation instead of graceful simulation skips.'
    },
    {
      id: 'forta',
      label: 'Forta',
      status: hasValue('FORTA_API_KEY') ? 'ready' : 'optional',
      category: 'threat-intel',
      required: false,
      env: ['FORTA_API_KEY', 'FORTA_API_URL'],
      impact: 'Adds external threat alerts to risk scoring.'
    },
    {
      id: 'chainalysis',
      label: 'Chainalysis',
      status: hasValue('CHAINALYSIS_API_KEY') ? 'ready' : 'optional',
      category: 'threat-intel',
      required: false,
      env: ['CHAINALYSIS_API_KEY'],
      impact: 'Adds commercial compliance and attribution intelligence.'
    },
    {
      id: 'etherscan',
      label: 'Etherscan',
      status: hasValue('ETHERSCAN_API_KEY') ? 'ready' : 'optional',
      category: 'threat-intel',
      required: false,
      env: ['ETHERSCAN_API_KEY'],
      impact: 'Improves address and contract metadata lookups.'
    },
    {
      id: 'redis',
      label: 'Distributed Redis',
      status: configured(['ANALYZE_REDIS_REST_URL']) && hasValue('ANALYZE_REDIS_REST_TOKEN')
        ? 'ready'
        : 'optional',
      category: 'ops',
      required: false,
      env: ['ANALYZE_REDIS_REST_URL', 'ANALYZE_REDIS_REST_TOKEN'],
      impact: 'Recommended for rate limits and quotas across multiple replicas.'
    },
    {
      id: 'siem-alerts',
      label: 'SIEM/Webhook Alerts',
      status: hasValue('ANALYZE_ALERT_WEBHOOK_URL') ? 'ready' : 'optional',
      category: 'ops',
      required: false,
      env: ['ANALYZE_ALERT_WEBHOOK_URL'],
      impact: 'Streams auth, rate-limit, quota, and server failures to operations.'
    }
  ];

  const required = checks.filter((check) => check.required);
  const readyRequired = required.filter((check) => check.status === 'ready').length;
  const readyChecks = checks.filter((check) => check.status === 'ready').length;

  return {
    generatedAt: new Date().toISOString(),
    readinessScore: checks.length === 0 ? 100 : Math.round((readyChecks / checks.length) * 100),
    requiredReady: readyRequired,
    requiredTotal: required.length,
    missingRequired: required.filter((check) => check.status === 'missing').map((check) => check.id),
    checks
  };
}

const DRAINER_TERMS = [
  'wallet drainer',
  'seed phrase',
  'private key',
  'sync wallet',
  'verify wallet',
  'airdrop claim',
  'urgent claim',
  'connect wallet to validate',
];

const SOCIAL_SCAM_DOMAINS = ['t.me/', 'telegram.me/', 'discord.gg/', 'discord.com/invite/'];
const FAKE_SITE_PATTERNS = [/xn--/i, /-wallet/i, /wallet-.*claim/i, /airdrop.*verify/i];

export type ScamDetectionInput = {
  text?: string;
  url?: string;
};

export function analyzeScamContent(input: ScamDetectionInput) {
  const text = `${input.text ?? ''} ${input.url ?? ''}`.toLowerCase();
  const findings: string[] = [];
  let score = 0;

  for (const term of DRAINER_TERMS) {
    if (text.includes(term)) {
      findings.push(`Potential wallet-drainer/social-engineering phrase: "${term}".`);
      score += 18;
    }
  }

  for (const domain of SOCIAL_SCAM_DOMAINS) {
    if (text.includes(domain)) {
      findings.push(`Telegram/Discord invite detected: ${domain}. Verify the community independently.`);
      score += 12;
    }
  }

  for (const pattern of FAKE_SITE_PATTERNS) {
    if (pattern.test(text)) {
      findings.push('Fake website pattern detected in the provided URL/text.');
      score += 20;
    }
  }

  if (/limited time|act now|last chance|guaranteed profit/i.test(text)) {
    findings.push('High-pressure or guaranteed-profit language detected.');
    score += 15;
  }

  return {
    score: Math.min(100, score),
    riskLevel: score >= 70 ? 'critical' : score >= 40 ? 'high' : score >= 20 ? 'moderate' : 'low',
    findings,
    plainLanguageWarning: findings.length
      ? 'This looks like a scam conversation or wallet-drainer lure. Do not sign transactions or share secrets until verified.'
      : 'No obvious scam language was detected, but always verify the site and transaction before signing.',
  };
}

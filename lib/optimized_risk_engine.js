const DIRECT_BLACKLIST = new Set([
  '0x000000000000000000000000000000000000dead',
  '0x1111111111111111111111111111111111111111',
  '0x9999999999999999999999999999999999999999'
]);

const KNOWN_RISKY_CONTRACTS = new Set([
  '0x5f3b5dfeb7b28cdbe76f8f5dbf4e21004d6f0cbf',
  '0x000000000000ad05ccc4f10045630fb830b95127'
]);

const EXTERNAL_SIGNAL_WEIGHTS = {
  low: 6,
  medium: 14,
  high: 26,
  critical: 40
};

const EXTERNAL_SIGNAL_SEVERITIES = ['low', 'medium', 'high', 'critical'];

const FORTA_GRAPHQL_QUERY = `
  query Alerts($addresses: [String!], $chainId: Int, $first: Int) {
    alerts(
      input: {
        addresses: $addresses
        chainId: $chainId
        paging: {cursor: null, limit: $first}
      }
    ) {
      alerts {
        alertId
        hash
        name
        description
        severity
        createdAt
        source {
          bot {
            id
            reference
          }
        }
      }
    }
  }
`;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeAddress(address) {
  return String(address || '').trim().toLowerCase();
}

function isObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function parseNumber(value, fallback = 0) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return parsed;
}

function parseBoolean(value) {
  return value === true;
}

function parseFortaSeverity(rawSeverity) {
  const normalized = String(rawSeverity || '').trim().toLowerCase();
  if (normalized === 'critical' || normalized === 'severe') return 'critical';
  if (normalized === 'high') return 'high';
  if (normalized === 'medium' || normalized === 'moderate') return 'medium';
  if (normalized === 'low' || normalized === 'info' || normalized === 'informational') return 'low';
  return 'medium';
}

export function isValidAddress(address) {
  return /^0x[a-fA-F0-9]{40}$/.test(String(address || '').trim());
}

function levenshtein(a, b) {
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const matrix = Array.from({length: b.length + 1}, (_, row) => [row]);
  for (let col = 0; col <= a.length; col += 1) {
    matrix[0][col] = col;
  }

  for (let row = 1; row <= b.length; row += 1) {
    for (let col = 1; col <= a.length; col += 1) {
      const cost = a[col - 1] === b[row - 1] ? 0 : 1;
      matrix[row][col] = Math.min(
        matrix[row - 1][col] + 1,
        matrix[row][col - 1] + 1,
        matrix[row - 1][col - 1] + cost
      );
    }
  }

  return matrix[b.length][a.length];
}

function similarityScore(a, b) {
  const distance = levenshtein(a, b);
  const longest = Math.max(a.length, b.length);
  return longest === 0 ? 1 : 1 - distance / longest;
}

function dedupeAddresses(values) {
  const seen = new Set();
  const unique = [];

  for (const value of values) {
    const normalized = normalizeAddress(value);
    if (!isValidAddress(normalized)) continue;
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    unique.push(normalized);
  }

  return unique;
}

function detectAddressPoisoning(targetAddress, historicalAddresses) {
  const history = dedupeAddresses(Array.isArray(historicalAddresses) ? historicalAddresses : []);
  let maxSimilarity = 0;
  let nearMatches = 0;
  const evidence = [];

  for (const historical of history) {
    if (historical === targetAddress) continue;

    const samePrefix = historical.slice(0, 8) === targetAddress.slice(0, 8);
    const sameSuffix = historical.slice(-6) === targetAddress.slice(-6);
    if (!samePrefix && !sameSuffix) continue;

    const similarity = similarityScore(targetAddress, historical);
    if (similarity < 0.82) continue;

    nearMatches += 1;
    maxSimilarity = Math.max(maxSimilarity, similarity);

    evidence.push({
      type: 'address_poisoning_match',
      historicalAddress: historical,
      similarity: Number((similarity * 100).toFixed(2)),
      samePrefix,
      sameSuffix
    });
  }

  let score = 0;
  if (maxSimilarity >= 0.96) score = 38;
  else if (maxSimilarity >= 0.93) score = 28;
  else if (maxSimilarity >= 0.9) score = 20;
  else if (maxSimilarity >= 0.86) score = 12;

  if (nearMatches >= 3) {
    score += 6;
  }

  return {
    score: clamp(score, 0, 45),
    maxSimilarity: Number((maxSimilarity * 100).toFixed(2)),
    nearMatches,
    evidence
  };
}

function scoreTransactionValue(transactionValue) {
  const value = parseNumber(transactionValue, 0);

  if (value >= 5_000) return {score: 18, tier: 'very_high', value};
  if (value >= 1_000) return {score: 12, tier: 'high', value};
  if (value >= 250) return {score: 7, tier: 'elevated', value};
  if (value >= 50) return {score: 3, tier: 'low', value};

  return {score: 0, tier: 'normal', value};
}

function scoreSimulation(simulation) {
  if (!isObject(simulation)) {
    return {
      score: 0,
      hardFlag: false,
      evidence: []
    };
  }

  const evidence = [];
  let score = 0;

  if (parseBoolean(simulation.reverted)) {
    score += 8;
    evidence.push({type: 'simulation_reverted'});
  }

  if (parseBoolean(simulation.delegateCallDetected)) {
    score += 24;
    evidence.push({type: 'delegatecall_detected'});
  }

  if (parseBoolean(simulation.selfDestructDetected)) {
    score += 28;
    evidence.push({type: 'selfdestruct_detected'});
  }

  if (parseBoolean(simulation.unlimitedApprovalDetected)) {
    score += 14;
    evidence.push({type: 'unlimited_approval_detected'});
  }

  if (parseBoolean(simulation.createdContract)) {
    score += 8;
    evidence.push({type: 'contract_creation_detected'});
  }

  const touchedUnknownContracts = parseNumber(simulation.touchedUnknownContracts, 0);
  if (touchedUnknownContracts >= 5) {
    score += 12;
    evidence.push({type: 'many_unknown_contracts', count: touchedUnknownContracts});
  } else if (touchedUnknownContracts >= 2) {
    score += 6;
    evidence.push({type: 'unknown_contracts', count: touchedUnknownContracts});
  }

  const hardFlag =
    parseBoolean(simulation.delegateCallDetected) ||
    parseBoolean(simulation.selfDestructDetected);

  return {
    score: clamp(score, 0, 40),
    hardFlag,
    evidence
  };
}

function normalizeExternalSignals(signals) {
  if (!Array.isArray(signals)) return [];

  return signals
    .filter((signal) => isObject(signal) && typeof signal.source === 'string')
    .map((signal) => {
      const source = String(signal.source).trim();
      const severity = String(signal.severity || 'medium').trim().toLowerCase();
      const normalizedSeverity = EXTERNAL_SIGNAL_SEVERITIES.includes(severity)
        ? severity
        : 'medium';

      return {
        source,
        severity: normalizedSeverity,
        id: typeof signal.id === 'string' ? signal.id.trim() : undefined,
        note: typeof signal.note === 'string' ? signal.note.trim() : undefined
      };
    });
}

async function fetchCustomIntelSignals(payload) {
  const url = process.env.THREAT_INTEL_URL?.trim();
  if (!url) {
    return {signals: [], error: null, configured: false};
  }

  const timeoutMs = clamp(parseNumber(process.env.THREAT_INTEL_TIMEOUT_MS, 1200), 300, 5000);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const headers = {'content-type': 'application/json'};
    const token = process.env.THREAT_INTEL_BEARER_TOKEN?.trim();
    if (token) {
      headers.authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      signal: controller.signal,
      body: JSON.stringify({
        address: payload.address,
        from: payload.from,
        chainId: payload.chainId,
        data: payload.data,
        transactionValue: payload.transactionValue
      })
    });

    if (!response.ok) {
      return {
        signals: [],
        configured: true,
        error: `Custom intel endpoint responded ${response.status}`
      };
    }

    const data = await response.json();
    const signals = normalizeExternalSignals(data?.signals);
    return {signals, configured: true, error: null};
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown external intel error';
    return {signals: [], configured: true, error: message};
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchFortaSignals(payload) {
  const apiKey = process.env.FORTA_API_KEY?.trim();
  if (!apiKey) {
    return {signals: [], configured: false, error: null};
  }

  const endpoint = process.env.FORTA_API_URL?.trim() || 'https://api.forta.network/graphql';
  const timeoutMs = clamp(parseNumber(process.env.FORTA_TIMEOUT_MS, 1800), 500, 8000);
  const first = clamp(parseNumber(process.env.FORTA_ALERT_LIMIT, 15), 1, 50);

  const addresses = dedupeAddresses([payload.address, payload.from].filter(Boolean));
  if (addresses.length === 0) {
    return {signals: [], configured: true, error: null};
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        query: FORTA_GRAPHQL_QUERY,
        variables: {
          addresses,
          chainId: Number.isInteger(payload.chainId) ? payload.chainId : null,
          first
        }
      })
    });

    if (!response.ok) {
      return {
        signals: [],
        configured: true,
        error: `Forta endpoint responded ${response.status}`
      };
    }

    const data = await response.json();
    const alerts = data?.data?.alerts?.alerts;

    if (!Array.isArray(alerts)) {
      return {
        signals: [],
        configured: true,
        error: 'Forta response missing alerts array'
      };
    }

    const signals = alerts
      .filter((alert) => isObject(alert))
      .map((alert) => {
        const botId = alert?.source?.bot?.id || alert?.source?.bot?.reference || 'unknown_bot';
        const severity = parseFortaSeverity(alert.severity);
        const id = typeof alert.alertId === 'string' ? alert.alertId : alert.hash;
        const note =
          typeof alert.name === 'string'
            ? alert.name
            : typeof alert.description === 'string'
              ? alert.description
              : undefined;

        return {
          source: `forta:${String(botId)}`,
          severity,
          id: typeof id === 'string' ? id : undefined,
          note
        };
      });

    return {
      signals,
      configured: true,
      error: null
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Forta error';
    return {
      signals: [],
      configured: true,
      error: message
    };
  } finally {
    clearTimeout(timeout);
  }
}

function scoreExternalSignals(signals) {
  let score = 0;
  for (const signal of signals) {
    score += EXTERNAL_SIGNAL_WEIGHTS[signal.severity] ?? EXTERNAL_SIGNAL_WEIGHTS.medium;
  }

  return clamp(score, 0, 45);
}

function classifyThreatType({
  directBlacklist,
  contractRisk,
  poisoning,
  simulation,
  externalSignals,
  riskScore
}) {
  if (directBlacklist) return 'DIRECT_BLACKLIST';
  if (contractRisk || simulation.hardFlag) return 'SMART_CONTRACT';
  if (poisoning.score >= 20) return 'ADDRESS_POISONING';
  if (externalSignals.some((signal) => signal.severity === 'critical')) {
    return 'EXTERNAL_INTELLIGENCE';
  }
  if (riskScore >= 55) return 'ELEVATED';
  return 'STANDARD';
}

function buildConfidence({
  directBlacklist,
  historicalAddresses,
  simulationProvided,
  externalSignals,
  externalConfigured,
  evidenceCount
}) {
  let confidence = 55;

  if (directBlacklist) confidence += 26;

  if (historicalAddresses >= 10) confidence += 15;
  else if (historicalAddresses >= 3) confidence += 8;

  if (simulationProvided) confidence += 12;

  if (externalConfigured) confidence += 8;
  else confidence -= 10;

  if (externalSignals > 0) confidence += 10;

  if (evidenceCount >= 5) confidence += 8;
  else if (evidenceCount <= 1) confidence -= 4;

  return clamp(Math.round(confidence), 40, 98);
}

function decisionFromScore({riskScore, directBlacklist, externalSignals, simulation}) {
  const hasCriticalExternal = externalSignals.some((signal) => signal.severity === 'critical');

  if (directBlacklist || hasCriticalExternal || riskScore >= 85) {
    return 'BLOCK';
  }

  if (simulation.hardFlag || riskScore >= 45) {
    return 'REVIEW';
  }

  return 'ALLOW';
}

function riskLevelFromScore(riskScore) {
  if (riskScore >= 85) return 'critical';
  if (riskScore >= 65) return 'high';
  if (riskScore >= 45) return 'medium';
  return 'low';
}

function explanationFromDecision(decision) {
  if (decision === 'BLOCK') {
    return 'Transaction blocked due to confirmed high-risk signals.';
  }

  if (decision === 'REVIEW') {
    return 'Manual review required before signing because medium/high-risk indicators were detected.';
  }

  return 'No severe risk indicators detected under the current policy.';
}

export async function analyzeRisk(payload) {
  const startedAt = Date.now();
  const normalizedAddress = normalizeAddress(payload.address);
  const historicalAddresses = Array.isArray(payload.historicalAddresses)
    ? payload.historicalAddresses
    : [];

  const directBlacklist = DIRECT_BLACKLIST.has(normalizedAddress);
  const contractRisk = KNOWN_RISKY_CONTRACTS.has(normalizedAddress);

  const poisoning = detectAddressPoisoning(normalizedAddress, historicalAddresses);
  const valueSignal = scoreTransactionValue(payload.transactionValue);
  const simulationSignal = scoreSimulation(payload.simulation);

  const incomingExternalSignals = normalizeExternalSignals(payload.externalSignals);
  const [customIntel, fortaIntel] = await Promise.all([
    fetchCustomIntelSignals(payload),
    fetchFortaSignals(payload)
  ]);
  const externalSignals = [
    ...incomingExternalSignals,
    ...customIntel.signals,
    ...fortaIntel.signals
  ];

  const externalScore = scoreExternalSignals(externalSignals);
  const contractScore = contractRisk ? 72 : 0;
  const blacklistScore = directBlacklist ? 100 : 0;

  let riskScore = directBlacklist
    ? blacklistScore
    : contractScore + poisoning.score + valueSignal.score + simulationSignal.score + externalScore;

  riskScore = clamp(Math.round(riskScore), 0, 100);

  const evidence = [
    ...poisoning.evidence,
    ...simulationSignal.evidence,
    ...externalSignals.map((signal) => ({
      type: 'external_signal',
      source: signal.source,
      severity: signal.severity,
      id: signal.id,
      note: signal.note
    }))
  ];

  if (directBlacklist) {
    evidence.push({type: 'blacklist_match', address: normalizedAddress});
  }

  if (contractRisk) {
    evidence.push({type: 'known_risky_contract', address: normalizedAddress});
  }

  if (valueSignal.score > 0) {
    evidence.push({type: 'value_risk', tier: valueSignal.tier, value: valueSignal.value});
  }

  const decision = decisionFromScore({
    riskScore,
    directBlacklist,
    externalSignals,
    simulation: simulationSignal
  });

  const riskLevel = riskLevelFromScore(riskScore);

  const confidence = buildConfidence({
    directBlacklist,
    historicalAddresses: historicalAddresses.length,
    simulationProvided: isObject(payload.simulation),
    externalSignals: externalSignals.length,
    externalConfigured: customIntel.configured || fortaIntel.configured,
    evidenceCount: evidence.length
  });

  const threatType = classifyThreatType({
    directBlacklist,
    contractRisk,
    poisoning,
    simulation: simulationSignal,
    externalSignals,
    riskScore
  });

  const latencyMs = Date.now() - startedAt;

  const intelErrors = [];
  if (customIntel.error) intelErrors.push(customIntel.error);
  if (fortaIntel.error) intelErrors.push(fortaIntel.error);

  return {
    riskScore,
    riskLevel,
    decision,
    confidence,
    threatType,
    explanation: explanationFromDecision(decision),
    latencyMs,
    breakdown: {
      directBlacklist: directBlacklist ? 100 : 0,
      smartContract: contractScore,
      addressPoisoning: poisoning.score,
      valueRisk: valueSignal.score,
      simulation: simulationSignal.score,
      externalIntelligence: externalScore
    },
    detectionModules: {
      directBlacklist,
      smartContractRisk: contractRisk,
      addressPoisoning: poisoning.score > 0,
      addressPoisoningSimilarity: poisoning.maxSimilarity,
      simulationRisk: simulationSignal.score > 0,
      externalThreatHit: externalSignals.length > 0
    },
    evidence,
    externalIntelligence: {
      configuredSources: {
        customIntel: customIntel.configured,
        forta: fortaIntel.configured,
        chainalysis: Boolean(process.env.CHAINALYSIS_API_KEY),
        etherscan: Boolean(process.env.ETHERSCAN_API_KEY)
      },
      signals: externalSignals,
      errors: intelErrors
    }
  };
}

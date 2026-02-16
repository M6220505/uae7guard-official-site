/**
 * UAE7Guard Optimized Risk Engine V2.5
 *
 * Enhanced risk assessment with:
 * - Granular weight system for different threat types
 * - Address Poisoning detection module
 * - Contract Safety analyzer for suspicious opcodes
 * - Multi-vector threat intelligence
 * - External Threat API Integration (Forta, Chainalysis, Etherscan)
 */

// ============================================================================
// EXTERNAL THREAT API INTEGRATION
// ============================================================================

/**
 * Integration layer for external threat intelligence APIs
 * Supports: Forta Network, Chainalysis, Etherscan Labels
 */
class ExternalThreatAPIManager {
  constructor(config = {}) {
    this.config = {
      enableForta: config.enableForta ?? true,
      enableChainalysis: config.enableChainalysis ?? true,
      enableEtherscan: config.enableEtherscan ?? true,
      fortaApiKey: config.fortaApiKey || process.env.FORTA_API_KEY,
      chainalysisApiKey: config.chainalysisApiKey || process.env.CHAINALYSIS_API_KEY,
      etherscanApiKey: config.etherscanApiKey || process.env.ETHERSCAN_API_KEY,
      timeout: config.timeout || 5000, // 5s timeout for external APIs
      cacheEnabled: config.cacheEnabled ?? true,
      cacheTTL: config.cacheTTL || 3600000, // 1 hour cache
    };

    this.cache = new Map();
  }

  /**
   * Check cache for existing threat data
   */
  getCached(address) {
    if (!this.config.cacheEnabled) return null;

    const cached = this.cache.get(address.toLowerCase());
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > this.config.cacheTTL;
    if (isExpired) {
      this.cache.delete(address.toLowerCase());
      return null;
    }

    return cached.data;
  }

  /**
   * Store threat data in cache
   */
  setCache(address, data) {
    if (!this.config.cacheEnabled) return;

    this.cache.set(address.toLowerCase(), {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Query Forta Network for threat alerts
   * Forta provides real-time security monitoring across multiple chains
   */
  async queryFortaNetwork(address) {
    if (!this.config.enableForta || !this.config.fortaApiKey) {
      return { source: 'forta', enabled: false, alerts: [] };
    }

    try {
      // Forta GraphQL API endpoint
      const response = await fetch('https://api.forta.network/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.fortaApiKey}`,
        },
        body: JSON.stringify({
          query: `
            query GetAlerts($address: String!) {
              alerts(input: {
                addresses: [$address]
                first: 10
              }) {
                pageInfo { hasNextPage }
                alerts {
                  alertId
                  name
                  description
                  severity
                  metadata
                  createdAt
                }
              }
            }
          `,
          variables: { address: address.toLowerCase() },
        }),
        signal: AbortSignal.timeout(this.config.timeout),
      });

      const data = await response.json();
      const alerts = data?.data?.alerts?.alerts || [];

      // Calculate risk based on Forta alerts
      const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL').length;
      const highAlerts = alerts.filter(a => a.severity === 'HIGH').length;

      const riskScore = Math.min(100, criticalAlerts * 30 + highAlerts * 15);

      return {
        source: 'forta',
        enabled: true,
        alerts,
        riskScore,
        summary: `${criticalAlerts} critical, ${highAlerts} high alerts`,
      };
    } catch (error) {
      console.error('[Forta API Error]:', error.message);
      return { source: 'forta', enabled: true, error: error.message, alerts: [], riskScore: 0 };
    }
  }

  /**
   * Query Chainalysis for sanctions/AML data
   * Industry-standard for regulatory compliance
   */
  async queryChainalysis(address) {
    if (!this.config.enableChainalysis || !this.config.chainalysisApiKey) {
      return { source: 'chainalysis', enabled: false };
    }

    try {
      // Chainalysis KYT API
      const response = await fetch(
        `https://api.chainalysis.com/api/risk/v2/entities/${address}`,
        {
          headers: {
            'Token': this.config.chainalysisApiKey,
            'Accept': 'application/json',
          },
          signal: AbortSignal.timeout(this.config.timeout),
        }
      );

      const data = await response.json();

      // Chainalysis provides risk categories
      const isSanctioned = data.identifications?.some(
        id => id.category === 'sanctions'
      );
      const riskLevel = data.risk || 'unknown';

      // Map Chainalysis risk levels to scores
      const riskScoreMap = {
        'severe': 100,
        'high': 85,
        'medium': 60,
        'low': 30,
        'unknown': 0,
      };

      return {
        source: 'chainalysis',
        enabled: true,
        isSanctioned,
        riskLevel,
        riskScore: isSanctioned ? 100 : riskScoreMap[riskLevel] || 0,
        categories: data.identifications?.map(id => id.category) || [],
      };
    } catch (error) {
      console.error('[Chainalysis API Error]:', error.message);
      return { source: 'chainalysis', enabled: true, error: error.message, riskScore: 0 };
    }
  }

  /**
   * Query Etherscan for address labels and tags
   * Free tier available, useful for basic reputation checks
   */
  async queryEtherscan(address) {
    if (!this.config.enableEtherscan || !this.config.etherscanApiKey) {
      return { source: 'etherscan', enabled: false };
    }

    try {
      // Etherscan address tags API
      const response = await fetch(
        `https://api.etherscan.io/api?module=account&action=addresslabel&address=${address}&apikey=${this.config.etherscanApiKey}`,
        {
          signal: AbortSignal.timeout(this.config.timeout),
        }
      );

      const data = await response.json();

      const labels = data.result || [];

      // Known malicious labels
      const maliciousLabels = ['phishing', 'scam', 'hack', 'exploit', 'fraud', 'fake'];
      const hasKnownBadLabel = labels.some(label =>
        maliciousLabels.some(bad => label.toLowerCase().includes(bad))
      );

      return {
        source: 'etherscan',
        enabled: true,
        labels,
        hasKnownBadLabel,
        riskScore: hasKnownBadLabel ? 95 : 0,
      };
    } catch (error) {
      console.error('[Etherscan API Error]:', error.message);
      return { source: 'etherscan', enabled: true, error: error.message, riskScore: 0 };
    }
  }

  /**
   * Aggregate threat intelligence from all enabled sources
   */
  async aggregateThreatIntelligence(address) {
    // Check cache first
    const cached = this.getCached(address);
    if (cached) {
      return { ...cached, fromCache: true };
    }

    // Query all enabled APIs in parallel
    const [fortaData, chainalysisData, etherscanData] = await Promise.all([
      this.queryFortaNetwork(address),
      this.queryChainalysis(address),
      this.queryEtherscan(address),
    ]);

    // Calculate combined risk score (weighted average)
    const scores = [];
    if (fortaData.enabled && fortaData.riskScore !== undefined) {
      scores.push({ score: fortaData.riskScore, weight: 0.4 }); // Forta: 40%
    }
    if (chainalysisData.enabled && chainalysisData.riskScore !== undefined) {
      scores.push({ score: chainalysisData.riskScore, weight: 0.4 }); // Chainalysis: 40%
    }
    if (etherscanData.enabled && etherscanData.riskScore !== undefined) {
      scores.push({ score: etherscanData.riskScore, weight: 0.2 }); // Etherscan: 20%
    }

    const combinedRiskScore = scores.length > 0
      ? scores.reduce((sum, s) => sum + s.score * s.weight, 0) / scores.reduce((sum, s) => sum + s.weight, 0)
      : 0;

    const result = {
      address: address.toLowerCase(),
      timestamp: Date.now(),
      sources: {
        forta: fortaData,
        chainalysis: chainalysisData,
        etherscan: etherscanData,
      },
      combinedRiskScore: Math.round(combinedRiskScore),
      hasActiveThreats: combinedRiskScore > 50,
      fromCache: false,
    };

    // Cache the result
    this.setCache(address, result);

    return result;
  }
}

// ============================================================================
// GRANULAR WEIGHT SYSTEM
// ============================================================================

// Dynamic weights based on threat type classification
const THREAT_TYPE_WEIGHTS = {
  // Direct blacklist threats get maximum weight
  DIRECT_BLACKLIST: {
    AGE: 0.10,
    ACTIVITY: 0.10,
    VALUE: 0.05,
    PATTERN: 0.40,
    THREAT: 0.35,
  },
  // Smart contract threats prioritize pattern and threat analysis
  SMART_CONTRACT: {
    AGE: 0.15,
    ACTIVITY: 0.10,
    VALUE: 0.10,
    PATTERN: 0.35,
    THREAT: 0.30,
  },
  // Address poisoning prioritizes pattern recognition
  ADDRESS_POISONING: {
    AGE: 0.15,
    ACTIVITY: 0.15,
    VALUE: 0.10,
    PATTERN: 0.40,
    THREAT: 0.20,
  },
  // Flash loan attacks prioritize activity and value patterns
  FLASH_LOAN: {
    AGE: 0.25,
    ACTIVITY: 0.30,
    VALUE: 0.25,
    PATTERN: 0.10,
    THREAT: 0.10,
  },
  // Standard phishing/fraud
  STANDARD: {
    AGE: 0.20,
    ACTIVITY: 0.25,
    VALUE: 0.20,
    PATTERN: 0.20,
    THREAT: 0.15,
  },
};

// ============================================================================
// ADDRESS POISONING DETECTION MODULE
// ============================================================================

/**
 * Detects address poisoning attacks by analyzing visual similarity
 * and comparing against user's historical interactions
 */
class AddressPoisoningDetector {
  /**
   * Calculate Levenshtein distance between two strings
   */
  static levenshteinDistance(str1, str2) {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));

    for (let i = 0; i <= len1; i++) matrix[i][0] = i;
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }

    return matrix[len1][len2];
  }

  /**
   * Check if address matches common poisoning patterns:
   * - Similar prefix/suffix to legitimate addresses
   * - Vanity addresses with repeating patterns
   * - Checksummed addresses that look legitimate
   */
  static detectPoisoningPattern(targetAddress, historicalAddresses = []) {
    const target = targetAddress.toLowerCase();
    let maxSimilarity = 0;
    let isPoisoningAttempt = false;
    let matchedAddress = null;

    // Check prefix similarity (first 10 chars including 0x)
    const targetPrefix = target.slice(0, 10);
    const targetSuffix = target.slice(-8);

    for (const historical of historicalAddresses) {
      const hist = historical.toLowerCase();
      const histPrefix = hist.slice(0, 10);
      const histSuffix = hist.slice(-8);

      // Calculate similarity scores
      const prefixDistance = this.levenshteinDistance(targetPrefix, histPrefix);
      const suffixDistance = this.levenshteinDistance(targetSuffix, histSuffix);

      const prefixSimilarity = 1 - (prefixDistance / 10);
      const suffixSimilarity = 1 - (suffixDistance / 8);

      // Address poisoning typically matches prefix OR suffix closely
      const similarity = Math.max(prefixSimilarity, suffixSimilarity);

      if (similarity > maxSimilarity) {
        maxSimilarity = similarity;
        matchedAddress = historical;
      }

      // High similarity (>70%) but not exact match = poisoning
      if (similarity > 0.7 && target !== hist) {
        isPoisoningAttempt = true;
      }
    }

    // Check for vanity address patterns (suspicious repeating chars)
    const vanityPatterns = [
      /0x([0-9a-f])\1{6,}/i,  // 6+ repeating chars
      /0x(0{8,}|f{8,})/i,      // Long sequences of 0 or f
      /0x.*(dead|beef|cafe|babe|face){2,}/i,  // Multiple vanity words
    ];

    const hasVanityPattern = vanityPatterns.some(pattern => pattern.test(target));

    return {
      isPoisoningAttempt,
      similarity: maxSimilarity,
      matchedAddress,
      hasVanityPattern,
      riskScore: isPoisoningAttempt ? 90 : (hasVanityPattern ? 60 : 0),
    };
  }
}

// ============================================================================
// CONTRACT SAFETY MODULE
// ============================================================================

/**
 * Analyzes smart contract bytecode/source for suspicious patterns
 */
class ContractSafetyAnalyzer {
  /**
   * Dangerous opcodes that indicate potential vulnerabilities
   */
  static DANGEROUS_OPCODES = {
    SELFDESTRUCT: { code: 'ff', risk: 95, description: 'Contract can self-destruct' },
    DELEGATECALL: { code: 'f4', risk: 85, description: 'Allows arbitrary code execution' },
    CALLCODE: { code: 'f2', risk: 80, description: 'Deprecated, allows code execution' },
    CREATE2: { code: 'f5', risk: 70, description: 'Can create contracts at predictable addresses' },
  };

  /**
   * Suspicious patterns in contract code
   */
  static SUSPICIOUS_PATTERNS = [
    {
      name: 'Hidden Ownership',
      pattern: /owner\s*=\s*address\(0\)/i,
      risk: 75,
      description: 'Ownership can be hidden or transferred',
    },
    {
      name: 'Unlimited Approval',
      pattern: /approve\s*\([^,]+,\s*(2\*\*256|type\(uint256\)\.max)/i,
      risk: 70,
      description: 'Requests unlimited token approval',
    },
    {
      name: 'Honeypot Pattern',
      pattern: /require\s*\([^)]*tx\.origin/i,
      risk: 85,
      description: 'Uses tx.origin (honeypot indicator)',
    },
    {
      name: 'Reentrancy Risk',
      pattern: /\.call\{value:/i,
      risk: 65,
      description: 'External call before state update (reentrancy risk)',
    },
    {
      name: 'Flash Loan Pattern',
      pattern: /(flashLoan|borrow.*repay)/i,
      risk: 50,
      description: 'Flash loan functionality detected',
    },
  ];

  /**
   * Analyze contract bytecode for dangerous opcodes
   */
  static analyzeOpcodes(bytecode) {
    if (!bytecode || bytecode.length < 4) {
      return { hasOpcodes: false, opcodes: [], maxRisk: 0 };
    }

    const detectedOpcodes = [];
    let maxRisk = 0;

    // Remove 0x prefix if present
    const cleanBytecode = bytecode.startsWith('0x') ? bytecode.slice(2) : bytecode;

    // Check for dangerous opcodes
    for (const [name, opcode] of Object.entries(this.DANGEROUS_OPCODES)) {
      if (cleanBytecode.includes(opcode.code)) {
        detectedOpcodes.push({ name, ...opcode });
        maxRisk = Math.max(maxRisk, opcode.risk);
      }
    }

    return {
      hasOpcodes: detectedOpcodes.length > 0,
      opcodes: detectedOpcodes,
      maxRisk,
    };
  }

  /**
   * Analyze contract source code for suspicious patterns
   */
  static analyzeSourceCode(sourceCode) {
    if (!sourceCode || sourceCode.length < 10) {
      return { hasPatterns: false, patterns: [], maxRisk: 0 };
    }

    const detectedPatterns = [];
    let maxRisk = 0;

    for (const pattern of this.SUSPICIOUS_PATTERNS) {
      if (pattern.pattern.test(sourceCode)) {
        detectedPatterns.push(pattern);
        maxRisk = Math.max(maxRisk, pattern.risk);
      }
    }

    return {
      hasPatterns: detectedPatterns.length > 0,
      patterns: detectedPatterns,
      maxRisk,
    };
  }

  /**
   * Comprehensive contract safety analysis
   */
  static analyzeContract(contractData) {
    const { bytecode, sourceCode, isVerified = false } = contractData;

    const opcodeAnalysis = this.analyzeOpcodes(bytecode);
    const sourceAnalysis = this.analyzeSourceCode(sourceCode);

    // Unverified contracts get extra risk penalty
    const verificationPenalty = !isVerified ? 30 : 0;

    // Calculate combined risk score
    const combinedRisk = Math.min(
      100,
      Math.max(opcodeAnalysis.maxRisk, sourceAnalysis.maxRisk) + verificationPenalty
    );

    return {
      opcodeAnalysis,
      sourceAnalysis,
      isVerified,
      verificationPenalty,
      overallRisk: combinedRisk,
      isSafe: combinedRisk < 40,
    };
  }
}

// ============================================================================
// ENHANCED RISK CALCULATION FUNCTIONS
// ============================================================================

function calculateAgeRisk(walletAgeDays) {
  if (walletAgeDays === 0) return 100;
  if (walletAgeDays < 1) return 95;
  if (walletAgeDays < 7) return 80;
  if (walletAgeDays < 30) return 60;
  if (walletAgeDays < 90) return 40;
  if (walletAgeDays < 365) return 20;
  return 0;
}

function calculateActivityRisk(transactionCount, walletAgeDays) {
  if (transactionCount === 0) return 100;
  if (transactionCount < 5) return 80;
  if (transactionCount < 20) return 50;
  if (transactionCount < 100) return 20;

  // Check for suspicious high-frequency activity
  if (walletAgeDays > 0 && transactionCount / walletAgeDays > 50) {
    return 70; // Suspiciously high transaction rate
  }

  return 0;
}

function calculateValueRisk(balanceEth, transactionValue) {
  // Factor in both balance and transaction value
  const balanceRisk = balanceEth === 0 ? 80 :
                      balanceEth < 0.01 ? 60 :
                      balanceEth < 0.1 ? 40 :
                      balanceEth < 1 ? 20 : 10;

  // High-value transactions from low-balance wallets are suspicious
  if (transactionValue && balanceEth > 0) {
    const valueRatio = transactionValue / balanceEth;
    if (valueRatio > 10) return 90; // Trying to send 10x more than balance
    if (valueRatio > 2) return 70;  // Trying to send 2x more than balance
  }

  return balanceRisk;
}

function calculatePatternRisk(input) {
  const {
    isSmartContract,
    blacklistAssociations,
    isDirectlyBlacklisted,
    addressPoisoningResult,
    contractSafetyResult,
  } = input;

  // Direct blacklist = maximum risk
  if (isDirectlyBlacklisted) return 100;

  // Address poisoning detection
  if (addressPoisoningResult && addressPoisoningResult.isPoisoningAttempt) {
    return Math.max(90, addressPoisoningResult.riskScore);
  }

  // Smart contract risk analysis
  if (isSmartContract && contractSafetyResult) {
    return contractSafetyResult.overallRisk;
  }

  // Blacklist associations
  if (blacklistAssociations >= 3) return 90;
  if (blacklistAssociations === 2) return 70;
  if (blacklistAssociations === 1) return 50;

  // Smart contract without analysis
  if (isSmartContract) return 40;

  return 30;
}

// ============================================================================
// THREAT TYPE CLASSIFIER
// ============================================================================

function classifyThreatType(input) {
  const {
    isDirectlyBlacklisted,
    isSmartContract,
    addressPoisoningResult,
    transactionValue,
    balanceEth,
    walletAgeDays,
  } = input;

  if (isDirectlyBlacklisted) {
    return 'DIRECT_BLACKLIST';
  }

  if (addressPoisoningResult && addressPoisoningResult.isPoisoningAttempt) {
    return 'ADDRESS_POISONING';
  }

  if (isSmartContract) {
    // Check for flash loan pattern (large value, new wallet)
    if (transactionValue > 10 && walletAgeDays < 7) {
      return 'FLASH_LOAN';
    }
    return 'SMART_CONTRACT';
  }

  return 'STANDARD';
}

// ============================================================================
// OPTIMIZED RISK ENGINE
// ============================================================================

async function calculateOptimizedRisk(input) {
  const {
    walletAddress,
    walletAgeDays,
    transactionCount,
    balanceEth,
    threatScore,
    blacklistAssociations,
    isDirectlyBlacklisted,
    isSmartContract = false,
    transactionValue = 0,
    historicalAddresses = [],
    contractData = {},
    externalThreatAPIConfig = {},
  } = input;

  // Run specialized detection modules
  const addressPoisoningResult = AddressPoisoningDetector.detectPoisoningPattern(
    walletAddress,
    historicalAddresses
  );

  const contractSafetyResult = isSmartContract
    ? ContractSafetyAnalyzer.analyzeContract(contractData)
    : null;

  // Query external threat intelligence APIs (async)
  let externalThreatIntel = null;
  if (externalThreatAPIConfig.enabled !== false) {
    try {
      const threatAPIManager = new ExternalThreatAPIManager(externalThreatAPIConfig);
      externalThreatIntel = await threatAPIManager.aggregateThreatIntelligence(walletAddress);
    } catch (error) {
      console.error('[External Threat API Error]:', error.message);
      // Continue with analysis even if external APIs fail
      externalThreatIntel = { error: error.message, combinedRiskScore: 0 };
    }
  }

  // Classify threat type for dynamic weighting
  const threatType = classifyThreatType({
    isDirectlyBlacklisted,
    isSmartContract,
    addressPoisoningResult,
    transactionValue,
    balanceEth,
    walletAgeDays,
  });

  const WEIGHTS = THREAT_TYPE_WEIGHTS[threatType];

  // Calculate individual risk components
  const ageRisk = calculateAgeRisk(walletAgeDays);
  const activityRisk = calculateActivityRisk(transactionCount, walletAgeDays);
  const valueRisk = calculateValueRisk(balanceEth, transactionValue);
  const patternRisk = calculatePatternRisk({
    isSmartContract,
    blacklistAssociations,
    isDirectlyBlacklisted,
    addressPoisoningResult,
    contractSafetyResult,
  });
  const threatRisk = threatScore * 100;

  // Calculate weighted components
  const ageComponent = WEIGHTS.AGE * ageRisk;
  const activityComponent = WEIGHTS.ACTIVITY * activityRisk;
  const valueComponent = WEIGHTS.VALUE * valueRisk;
  const patternComponent = WEIGHTS.PATTERN * patternRisk;
  const threatComponent = WEIGHTS.THREAT * threatRisk;

  const rawScore = ageComponent + activityComponent + valueComponent + patternComponent + threatComponent;
  const riskScore = Math.min(Math.max(Math.round(rawScore), 0), 100);

  // Determine risk level and decision
  let riskLevel, color, recommendation, recommendationAr, decision;

  if (riskScore <= 25) {
    riskLevel = "low";
    color = "green";
    recommendation = "LOW RISK - Proceed with standard protocols. Wallet shows healthy activity patterns.";
    recommendationAr = "مخاطر منخفضة - يمكنك المتابعة بالإجراءات العادية. المحفظة تظهر أنماط نشاط سليمة.";
    decision = "✅ ALLOW";
  } else if (riskScore <= 50) {
    riskLevel = "moderate";
    color = "yellow";
    recommendation = "MODERATE RISK - Enhanced due diligence recommended before proceeding.";
    recommendationAr = "مخاطر متوسطة - ننصح بإجراء فحص إضافي قبل المتابعة.";
    decision = "⚠️  WARN (Requires Additional Verification)";
  } else if (riskScore <= 75) {
    riskLevel = "high";
    color = "orange";
    recommendation = "HIGH RISK - Additional verification required. Exercise caution.";
    recommendationAr = "مخاطر عالية - يتطلب تحقق إضافي. كن حذراً.";
    decision = "🛑 BLOCK (High Risk - Manual Review Required)";
  } else {
    riskLevel = "critical";
    color = "red";
    recommendation = "CRITICAL RISK - Transaction not recommended without thorough investigation.";
    recommendationAr = "مخاطر حرجة - لا ننصح بالمعاملة بدون تحقيق شامل.";
    decision = "🚨 BLOCK (Critical - Transaction Denied)";
  }

  // Enhanced confidence calculation (now includes external threat intel)
  const confidence = Math.min(
    95,
    50 +
    (walletAgeDays > 0 ? 15 : 0) +
    (transactionCount > 0 ? 15 : 0) +
    (balanceEth > 0 ? 10 : 0) +
    (addressPoisoningResult ? 5 : 0) +
    (contractSafetyResult ? 5 : 0) +
    (externalThreatIntel && !externalThreatIntel.error ? 5 : 0)
  );

  // Apply external threat intelligence boost if available
  let finalRiskScore = riskScore;
  if (externalThreatIntel && externalThreatIntel.combinedRiskScore > 0) {
    // Blend our internal score with external threat intelligence (70% internal, 30% external)
    finalRiskScore = Math.round(riskScore * 0.7 + externalThreatIntel.combinedRiskScore * 0.3);
    finalRiskScore = Math.min(100, finalRiskScore);
  }

  const calculationString = `(${ageRisk}×${WEIGHTS.AGE}) + (${activityRisk}×${WEIGHTS.ACTIVITY}) + (${valueRisk}×${WEIGHTS.VALUE}) + (${patternRisk}×${WEIGHTS.PATTERN}) + (${Math.round(threatRisk)}×${WEIGHTS.THREAT}) = ${riskScore}`;

  return {
    riskScore: finalRiskScore,
    riskLevel,
    color,
    recommendation,
    recommendationAr,
    decision,
    confidence: Math.round(confidence),
    threatType,
    breakdown: {
      ageComponent: Math.round(ageComponent * 100) / 100,
      activityComponent: Math.round(activityComponent * 100) / 100,
      valueComponent: Math.round(valueComponent * 100) / 100,
      patternComponent: Math.round(patternComponent * 100) / 100,
      threatComponent: Math.round(threatComponent * 100) / 100,
    },
    formula: {
      weights: WEIGHTS,
      calculation: calculationString,
    },
    detectionModules: {
      addressPoisoning: addressPoisoningResult,
      contractSafety: contractSafetyResult,
      externalThreatIntel: externalThreatIntel || { enabled: false },
    },
  };
}

// ============================================================================
// WEB3 INTEGRATION UTILITIES
// ============================================================================

/**
 * Analyze a connected Web3 wallet in real-time
 * This function accepts wallet data from a connected Web3 provider
 * and performs comprehensive risk analysis
 *
 * @param {Object} web3WalletData - Data from connected wallet
 * @param {string} web3WalletData.address - Wallet address
 * @param {string} web3WalletData.balance - Balance in ETH (as string)
 * @param {number} web3WalletData.chainId - Chain ID
 * @param {Array} web3WalletData.historicalAddresses - User's previous interactions
 * @param {Object} web3WalletData.contractData - Contract bytecode/source if applicable
 * @returns {Object} Comprehensive risk assessment
 */
function analyzeWeb3Wallet(web3WalletData) {
  const {
    address,
    balance = '0',
    chainId,
    historicalAddresses = [],
    contractData = {},
  } = web3WalletData;

  // Convert balance from Wei string to ETH number
  const balanceEth = parseFloat(balance) || 0;

  // Mock blockchain data (in production, fetch from actual blockchain APIs)
  // For demonstration, we'll generate realistic mock data based on the address
  const mockBlockchainData = generateMockBlockchainData(address, balanceEth);

  // Prepare input for risk calculation
  const riskInput = {
    walletAddress: address,
    walletAgeDays: mockBlockchainData.walletAgeDays,
    transactionCount: mockBlockchainData.transactionCount,
    balanceEth: balanceEth,
    threatScore: mockBlockchainData.threatScore,
    blacklistAssociations: mockBlockchainData.blacklistAssociations,
    isDirectlyBlacklisted: mockBlockchainData.isDirectlyBlacklisted,
    isSmartContract: mockBlockchainData.isSmartContract,
    transactionValue: 0, // Current transaction value (if analyzing a specific tx)
    historicalAddresses: historicalAddresses,
    contractData: contractData,
  };

  // Calculate risk using the optimized engine
  const riskAssessment = calculateOptimizedRisk(riskInput);

  // Add Web3-specific metadata
  return {
    ...riskAssessment,
    web3Metadata: {
      chainId: chainId,
      connectedWallet: true,
      timestamp: new Date().toISOString(),
      balance: balanceEth.toFixed(4) + ' ETH',
    },
  };
}

/**
 * Generate mock blockchain data for testing
 * In production, this would fetch real data from blockchain APIs
 */
function generateMockBlockchainData(address, balanceEth) {
  const lowerAddress = address.toLowerCase();

  // Special test cases
  if (lowerAddress.includes('0000000000000000000')) {
    return {
      walletAgeDays: 0,
      transactionCount: 0,
      threatScore: 95,
      blacklistAssociations: 5,
      isDirectlyBlacklisted: true,
      isSmartContract: false,
    };
  }

  if (lowerAddress.includes('dead') || lowerAddress.includes('beef')) {
    return {
      walletAgeDays: 7,
      transactionCount: 3,
      threatScore: 65,
      blacklistAssociations: 2,
      isDirectlyBlacklisted: false,
      isSmartContract: false,
    };
  }

  // Check for smart contract patterns (repeated characters suggest contract)
  const hasRepeatingPattern = /(.)\1{3,}/.test(lowerAddress);

  if (hasRepeatingPattern) {
    return {
      walletAgeDays: 180,
      transactionCount: 1500,
      threatScore: 30,
      blacklistAssociations: 0,
      isDirectlyBlacklisted: false,
      isSmartContract: true,
    };
  }

  // Default to established wallet
  return {
    walletAgeDays: 730, // 2 years
    transactionCount: 250,
    threatScore: 15,
    blacklistAssociations: 0,
    isDirectlyBlacklisted: false,
    isSmartContract: false,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  calculateOptimizedRisk,
  analyzeWeb3Wallet,
  AddressPoisoningDetector,
  ContractSafetyAnalyzer,
  ExternalThreatAPIManager,
};

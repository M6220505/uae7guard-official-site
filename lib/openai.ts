import OpenAI from 'openai';

let openaiInstance: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (openaiInstance) return openaiInstance;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  openaiInstance = new OpenAI({ apiKey });
  return openaiInstance;
}

// Analyze a wallet or transaction using AI
export async function analyzeWithAI(prompt: string): Promise<string> {
  const openai = getOpenAI();

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'You are UAE7Guard, an AI security analyst specializing in blockchain threat detection. ' +
          'Provide concise, actionable security assessments. Flag scams, rug pulls, phishing, ' +
          'and suspicious patterns. Always indicate risk level (low/moderate/high/critical).',
      },
      { role: 'user', content: prompt },
    ],
    max_tokens: 1024,
    temperature: 0.3,
  });

  return response.choices[0]?.message?.content ?? 'Analysis unavailable.';
}

// AI-powered scam detection for a given address + context
export async function detectScam(data: {
  address: string;
  riskScore: number;
  riskLevel: string;
  breakdown: Record<string, number>;
  chainId?: number;
}): Promise<{ verdict: string; explanation: string; confidence: number }> {
  const prompt = [
    `Analyze this blockchain address for potential scam indicators:`,
    `Address: ${data.address}`,
    `Risk Score: ${data.riskScore}/100 (${data.riskLevel})`,
    `Breakdown: ${JSON.stringify(data.breakdown)}`,
    `Chain ID: ${data.chainId ?? 1}`,
    ``,
    `Provide a JSON response with: verdict (safe/suspicious/scam), explanation (1-2 sentences), confidence (0-100).`,
  ].join('\n');

  const raw = await analyzeWithAI(prompt);

  try {
    const parsed = JSON.parse(raw);
    return {
      verdict: parsed.verdict ?? 'unknown',
      explanation: parsed.explanation ?? raw,
      confidence: parsed.confidence ?? 50,
    };
  } catch {
    return { verdict: 'unknown', explanation: raw, confidence: 50 };
  }
}

// Chat with the AI assistant about security topics
export async function chatWithAssistant(
  messages: { role: 'user' | 'assistant'; content: string }[],
): Promise<string> {
  const openai = getOpenAI();

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'You are UAE7Guard AI Assistant. Help users understand blockchain security, ' +
          'evaluate wallet risks, and stay safe from scams. Be concise and helpful.',
      },
      ...messages,
    ],
    max_tokens: 2048,
    temperature: 0.5,
  });

  return response.choices[0]?.message?.content ?? 'Sorry, I could not process your request.';
}

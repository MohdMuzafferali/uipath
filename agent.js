// ============================================================
// UiPath Competitive Intelligence — Agentic Motor / Agentic Engine
// agent.js
//
// Şu an: Mock mod (API key gelmeden çalışır)
// Current mode: Mock (runs without an API key)
//
// Sonra: USE_MOCK = false + API_KEY doldur → gerçek API'ye geçer
// To switch to live: set USE_MOCK = false and fill in API_KEY
// ============================================================

const AGENT_CONFIG = {
  USE_MOCK: true,                    // false → gerçek API / live API call
  API_KEY:  'sk-your-key-here',     // Kobi'nin key'i gelince buraya / Add Kobi's key here when available
  MODEL:    'gpt-4o',               // veya / or 'claude-sonnet-4-6'
  PROVIDER: 'openai',               // 'openai' veya / or 'anthropic'
  MOCK_DELAY_MS: 2000,              // Mock'ta simüle edilen gecikme / Simulated delay in mock mode
};

// ============================================================
// 1. PROMPT BUILDER
// Kullanıcının seçimini yapılandırılmış bir prompt'a çevirir
// Converts user selection into a structured LLM prompt
// ============================================================

function buildPrompt(vendor, topic, existingData) {
  const existing = existingData ? `
Current data on file (may be outdated):
- Score: ${existingData.score}
- Evidence: ${existingData.evidence}
- Sources: ${(existingData.sources || []).join(', ')}
` : 'No existing data on file.';

  return `You are a competitive intelligence analyst specializing in enterprise automation and agentic AI platforms.

Your task: Research and score ${vendor} on the dimension "${topic}" for a UiPath competitive battle card.

Scoring scale:
1 = Not Supported: Not a primary focus; requires major build
2 = Limited: Partial capability; significant gaps or operational burden  
3 = Adequate: Usable baseline; requires customization or external tooling
4 = Strong: Enterprise-ready with minor gaps or distributed capabilities
5 = Best-in-class: Mature enterprise features, strong governance, clear evidence

${existing}

Research the latest publicly available information about ${vendor}'s capabilities on "${topic}".
Focus on: official documentation, product announcements, analyst reports, recent news (2024-2025).

Respond ONLY with a valid JSON object in this exact format:
{
  "vendor": "${vendor}",
  "topic": "${topic}",
  "score": <number 1-5>,
  "rationale": "<one sentence summary of why this score>",
  "reasoning": "<2-3 sentences explaining the score in detail>",
  "evidence": "<2-3 sentences of specific evidence from public sources>",
  "sources": ["<url1>", "<url2>"],
  "confidence": "<High|Medium|Low>",
  "notes": "<any caveats or things to validate>",
  "last_updated": "${new Date().toISOString().split('T')[0]}"
}

Do not include any text outside the JSON object.`;
}

// ============================================================
// 2. MOCK API RESPONSE
// Gerçek API gelene kadar test için kullanılır
// Used for testing before a real API key is available
// ============================================================

function generateMockResponse(vendor, topic) {
  // Mevcut skorları baz alarak tutarlı mock üretir
  // Generates consistent mock scores based on known vendor profiles
  const mockScores = {
    'UiPath':      { base: 4.5, strength: 'enterprise governance and BPMN orchestration' },
    'Microsoft':   { base: 4.2, strength: 'low-code UX and connector ecosystem' },
    'Google':      { base: 4.0, strength: 'AI/agent capabilities and cloud scale' },
    'ServiceNow':  { base: 4.1, strength: 'IT/HR workflow automation' },
    'Appian':      { base: 4.0, strength: 'BPM and regulated industry compliance' },
    'n8n':         { base: 3.2, strength: 'developer flexibility and low TCO' },
    'OpenAI':      { base: 3.5, strength: 'pure agentic AI capabilities' },
  };

  const vendorInfo = mockScores[vendor] || { base: 3.0, strength: 'automation capabilities' };
  const score = Math.min(5, Math.max(1, Math.round(vendorInfo.base + (Math.random() - 0.5))));
  const confidence = score >= 4 ? 'High' : score >= 3 ? 'Medium' : 'Low';

  return {
    vendor,
    topic,
    score,
    rationale: `${vendor} shows ${score >= 4 ? 'strong' : score >= 3 ? 'adequate' : 'limited'} capabilities in ${topic}, driven by its ${vendorInfo.strength}.`,
    reasoning: `Score ${score} reflects ${vendor}'s current product positioning in this area. The platform's ${vendorInfo.strength} contributes positively, though gaps remain depending on deployment context and use case specifics.`,
    evidence: `[MOCK DATA] Based on publicly available documentation and recent product announcements, ${vendor} demonstrates ${score >= 4 ? 'mature' : 'developing'} capabilities in ${topic}. This would be replaced with real research from official docs, Gartner reports, and competitor announcements.`,
    sources: [
      `https://www.${vendor.toLowerCase().replace(/\s/g, '')}.com/documentation`,
      `https://www.gartner.com/reviews/${vendor.toLowerCase().replace(/\s/g, '-')}`
    ],
    confidence,
    notes: '[MOCK] This is simulated data. Replace with real API call when key is available.',
    last_updated: new Date().toISOString().split('T')[0]
  };
}

// ============================================================
// 3. API ÇAĞRISI / API CALL
// Mock modda simüle eder, gerçek modda API'ye gider
// Runs in mock mode or routes to a real LLM API
// ============================================================

async function callLLM(prompt, vendor, topic) {
  if (AGENT_CONFIG.USE_MOCK) {
    // Mock mod: gecikme simüle et, sahte veri döndür
    // Mock mode: simulate delay and return generated data
    await new Promise(resolve => setTimeout(resolve, AGENT_CONFIG.MOCK_DELAY_MS));
    return generateMockResponse(vendor, topic);
  }

  // Gerçek API modu / Live API mode
  try {
    let response, data;

    if (AGENT_CONFIG.PROVIDER === 'openai') {
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AGENT_CONFIG.API_KEY}`
        },
        body: JSON.stringify({
          model: AGENT_CONFIG.MODEL,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 800
        })
      });
      data = await response.json();
      const text = data.choices[0].message.content.trim();
      return JSON.parse(text);

    } else if (AGENT_CONFIG.PROVIDER === 'anthropic') {
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': AGENT_CONFIG.API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: AGENT_CONFIG.MODEL,
          max_tokens: 800,
          messages: [{ role: 'user', content: prompt }]
        })
      });
      data = await response.json();
      const text = data.content[0].text.trim();
      return JSON.parse(text);
    }

  } catch (err) {
    console.error('API call failed:', err);
    throw new Error(`API call failed: ${err.message}`);
  }
}

// ============================================================
// 4. ANA FONKSİYON — generateIntelligence
// Dashboard'dan çağrılır, sonucu DOM'a yazar
// MAIN FUNCTION — Called from the dashboard; resolves via callbacks
// ============================================================

async function generateIntelligence({ vendor, topic, topicIdx, onStart, onSuccess, onError }) {
  try {
    // Başlangıç callback'i / Trigger start callback
    if (onStart) onStart({ vendor, topic });

    // Mevcut veriyi al / Retrieve existing data for context
    const existingData = window.DASHBOARD_DATA?.vendors?.[vendor]?.[topicIdx] || null;

    // Prompt oluştur ve API'ye gönder / Build and send the prompt
    const prompt = buildPrompt(vendor, topic, existingData);
    const result = await callLLM(prompt, vendor, topic);

    // Sonucu başarı callback'ine ilet / Pass result to success callback
    if (onSuccess) onSuccess({ vendor, topic, topicIdx, result });

    return result;

  } catch (err) {
    if (onError) onError({ vendor, topic, error: err.message });
    throw err;
  }
}

// ============================================================
// 5. TOPLU GÜNCELLEME / BULK UPDATE
// Tüm vendor'ları bir topic için sırayla günceller
// Runs generateIntelligence for all vendors on a given topic
// ============================================================

async function generateAllVendorsForTopic({ topic, topicIdx, vendors, onProgress, onComplete, onError }) {
  const results = {};
  const errors = {};

  for (const vendor of vendors) {
    try {
      if (onProgress) onProgress({ vendor, topic, status: 'loading' });

      const result = await generateIntelligence({
        vendor, topic, topicIdx,
        onStart: () => {},
        onSuccess: ({ result }) => { results[vendor] = result; },
        onError: ({ error }) => { errors[vendor] = error; }
      });

      results[vendor] = result;
      if (onProgress) onProgress({ vendor, topic, status: 'done', result });

    } catch (err) {
      errors[vendor] = err.message;
      if (onProgress) onProgress({ vendor, topic, status: 'error', error: err.message });
    }
  }

  if (onComplete) onComplete({ topic, results, errors });
  return { results, errors };
}

// ============================================================
// 6. EXPORT
// index.html'den window.Agent olarak erişilir
// Exposed globally as window.Agent for use in index.html
// ============================================================

window.Agent = {
  config: AGENT_CONFIG,
  buildPrompt,
  generateIntelligence,
  generateAllVendorsForTopic,
};

console.log('[Agent] Loaded. Mock mode:', AGENT_CONFIG.USE_MOCK);

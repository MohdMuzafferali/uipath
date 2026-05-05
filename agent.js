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
// UiPath DIFFERENTIATORS
// UiPath'in güçlü olduğu alanlar — prompt'a context olarak eklenir
// Core strengths injected into every prompt for positioning accuracy
// ============================================================

const UIPATH_DIFFERENTIATORS = {
  global: `
UiPath is the market leader in enterprise RPA and is rapidly expanding into agentic automation.
Key differentiators to keep in mind when evaluating competitors:
- Maestro: dedicated agentic orchestration layer with BPMN/DMN modeling, human-in-the-loop controls (pause/resume/retry/rewind), and multi-agent coordination
- Enterprise Test Suite: end-to-end test automation with agentic testing, CI/CD integration, and ALM governance
- Process & Task Mining: conformance checking against BPMN models, closed-loop process intelligence
- Integration Service: governed connector catalog with standardized auth across all UiPath products
- Deployment flexibility: SaaS (Automation Cloud), on-premises, hybrid, and containerized (Automation Suite on OpenShift/Kubernetes)
- Audit & Governance: Orchestrator audit trail, Automation Cloud centralized logs, role-based access, tenant-level controls
- Open standards: BPMN and DMN as executable modeling languages — changes to diagrams change runtime behavior directly
`,
  byTopic: {
    'Security & Compliance': `
UiPath specifics: SOC 2 Type 2, ISO certifications published at trust.uipath.com. Automation Cloud provides centralized audit logs with filtering, CSV export, and long-term retention. Orchestrator has a dedicated Audit page.
When evaluating ${'{vendor}'}: look for whether they have comparable third-party attestations, audit trail depth, and data residency controls. Watch for gaps in agent-level auditability.
`,
    'Agentic Capabilities': `
UiPath specifics: Maestro orchestrates AI agents, robots, and humans end-to-end. Supports BPMN-based process modeling, DMN decision management, instance-level controls (suspend/resume/retry/rewind), and exception handling. UiPath agents are governed — not just triggered.
When evaluating ${'{vendor}'}: assess whether their agentic layer is production-ready or still in preview. Look for: orchestration depth, human oversight mechanisms, agent governance, and multi-agent coordination. Many competitors have "agent builders" but lack runtime governance.
`,
    'BPM & Orchestration': `
UiPath specifics: Maestro uses BPMN as an OMG-maintained open standard — the diagram IS the executable process. DMN for decisions. No hidden logic behind the model.
When evaluating ${'{vendor}'}: check if they support standards-based BPMN execution (not just diagramming), DMN for decision modeling, and whether process changes require code or just model updates. ServiceNow and Appian are the strongest BPM competitors here.
`,
    'Testing & Evaluation (Functional + Performance)': `
UiPath specifics: Enterprise Test Suite provides agentic testing with AI agents, resilient end-to-end UI and API test automation, governance (auditing, role management, centralized credentials), and CI/CD + ALM integrations.
When evaluating ${'{vendor}'}: most automation vendors do not have a dedicated test suite. Look for: end-to-end test automation (not just unit tests), governance integrations, and whether AI is used in test generation or resilience.
`,
    'Process Intelligence': `
UiPath specifics: Process Mining with conformance checking against BPMN reference models. Task Mining for discovering how work is actually done before automation. Closed-loop: insights feed directly back into automation design.
When evaluating ${'{vendor}'}: assess whether they offer true process mining (event log analysis, conformance checking, variant analysis) vs. basic workflow analytics. ServiceNow and Microsoft are the key competitors here.
`,
    'Deployment & Operations': `
UiPath specifics: Available as SaaS (Automation Cloud), on-premises, private cloud, public cloud, and containerized (Automation Suite). Orchestrator manages attended/unattended robots, schedules, queues, and assets centrally.
When evaluating ${'{vendor}'}: assess deployment flexibility — can they support air-gapped/on-prem for regulated industries? Do they have a comparable operational control plane?
`,
    'Traceability & Governance': `
UiPath specifics: Orchestrator Audit page shows full audit trail of all actions by all entities, with filtering and CSV export. Automation Cloud provides centralized audit logs across all services with retention controls.
When evaluating ${'{vendor}'}: governance depth is a key differentiator. Look for: audit trail granularity, retention policies, role-based access, and agent-level traceability (not just flow-level).
`,
  }
};

// ============================================================
// 1. PROMPT BUILDER
// Kullanıcının seçimini zenginleştirilmiş bir prompt'a çevirir
// Converts user selection into a rich, positioning-aware LLM prompt
// ============================================================

function buildPrompt(vendor, topic, existingData) {
  const existing = existingData ? `
Current data on file (may be outdated — use as context only, not as the answer):
- Score: ${existingData.score}
- Evidence on file: ${existingData.evidence}
- Sources on file: ${(existingData.sources || []).join(', ')}
` : 'No existing data on file.';

  // Topic-specific guidance varsa ekle
  const topicGuidance = UIPATH_DIFFERENTIATORS.byTopic[topic]
    ? UIPATH_DIFFERENTIATORS.byTopic[topic].replace(/\$\{'vendor'\}/g, vendor).replace(/\$\{.vendor.\}/g, vendor).replace(/{vendor}/g, vendor)
    : `When evaluating ${vendor}: focus on enterprise readiness, governance depth, and production maturity of their capabilities in this area.`;

  return `You are a senior competitive intelligence analyst at UiPath, specializing in enterprise automation, RPA, and agentic AI platforms. Your role is to produce accurate, evidence-based competitive assessments that help UiPath sales engineers position UiPath effectively against competitors.

## Your task
Research and score **${vendor}** on the dimension **"${topic}"** for a UiPath competitive battle card.

## Scoring scale
1 = Not Supported: Not a primary focus; requires major build or external tooling
2 = Limited: Partial capability; significant gaps or high operational burden
3 = Adequate: Usable baseline; requires customization, configuration, or external tooling
4 = Strong: Enterprise-ready with minor gaps or distributed capabilities across products
5 = Best-in-class: Mature enterprise features, strong governance, clear third-party evidence

## UiPath context & differentiators
${UIPATH_DIFFERENTIATORS.global}

## Topic-specific guidance for "${topic}"
${topicGuidance}

## Existing data
${existing}

## Research instructions
- Research the latest publicly available information about ${vendor}'s capabilities on "${topic}" (focus on 2024–2025)
- Use: official product documentation, product announcements, press releases, analyst reports (Gartner, Forrester), G2/Capterra reviews, and credible tech news
- Be objective and evidence-based — do not inflate or deflate scores without evidence
- Identify specific gaps or weaknesses that UiPath sales engineers can use in conversations
- If ${vendor} is genuinely strong in this area, say so accurately

## Output format
Respond ONLY with a valid JSON object. No preamble, no markdown, no explanation outside the JSON.

{
  "vendor": "${vendor}",
  "topic": "${topic}",
  "score": <integer 1-5>,
  "rationale": "<one clear sentence: why this score, what is the key strength or gap>",
  "reasoning": "<2-3 sentences: detailed explanation of the score, referencing specific product capabilities>",
  "evidence": "<2-3 sentences: specific, citable evidence from public sources — product names, features, announcements>",
  "uipath_advantage": "<1-2 sentences: where UiPath has an advantage or differentiation on this dimension vs ${vendor}>",
  "sources": ["<url1>", "<url2>"],
  "confidence": "<High|Medium|Low>",
  "notes": "<any important caveats, version-specific limitations, or things to validate with the customer>",
  "last_updated": "${new Date().toISOString().split('T')[0]}"
}`;
}

// ============================================================
// 2. BATTLE CARD PROMPT BUILDER
// Battle Card için ayrı, daha agresif positioning prompt'u
// Separate prompt for Battle Card — more positioning-focused
// ============================================================

function buildBattleCardPrompt(rival, topic, uiData, rivalData) {
  const isAllTopics = topic === 'All Topics (Overall)';

  return `You are a senior sales enablement specialist at UiPath. Your job is to write a concise, compelling competitive positioning message for a UiPath sales engineer preparing for a customer meeting where ${rival} is the competing vendor.

## Context
${isAllTopics
  ? `The customer is evaluating UiPath vs ${rival} across the entire automation platform.`
  : `The customer has raised questions about "${topic}" specifically.`
}

## Score data
- UiPath score on ${isAllTopics ? 'overall platform' : topic}: ${uiData?.score || 'N/A'} / 5
- ${rival} score on ${isAllTopics ? 'overall platform' : topic}: ${rivalData?.score || 'N/A'} / 5
- Delta: ${uiData && rivalData ? (uiData.score - rivalData.score > 0 ? '+' : '') + (uiData.score - rivalData.score) : 'N/A'}

## UiPath evidence on file
${uiData?.rationale || 'No data available.'}

## ${rival} evidence on file
${rivalData?.rationale || 'No data available.'}

## Your task
Write a positioning message for the SE to use. It should:
- Be factual and evidence-based (not just marketing language)
- Highlight where UiPath is genuinely stronger
- Acknowledge where ${rival} is competitive (credibility matters)
- Give the SE a clear talking point to use in the meeting
- Be 2-3 sentences maximum

Respond ONLY with a JSON object:
{
  "positioning": "<the SE talking point — 2-3 sentences>",
  "uipath_strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "rival_gaps": ["<gap 1>", "<gap 2>"],
  "handle_with_care": "<one thing the SE should be careful about or not overclaim>"
}`;
}

// ============================================================
// 3. MOCK API RESPONSE
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
    evidence: `[MOCK DATA] Based on publicly available documentation and recent product announcements, ${vendor} demonstrates ${score >= 4 ? 'mature' : 'developing'} capabilities in ${topic}. This would be replaced with real research from official docs, Gartner reports, and competitor announcements when live API is enabled.`,
    uipath_advantage: `[MOCK] UiPath's ${topic} capabilities are supported by enterprise-grade governance, open standards (BPMN/DMN), and dedicated tooling that ${vendor} does not yet match at the same depth.`,
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
// 4. API CALL
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
          temperature: 0.2,
          max_tokens: 1000
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
          max_tokens: 1000,
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
// 5. MAIN FUNCTION — generateIntelligence
// Dashboard'dan çağrılır, sonucu DOM'a yazar
// Called from the dashboard; resolves via callbacks
// ============================================================

async function generateIntelligence({ vendor, topic, topicIdx, onStart, onSuccess, onError }) {
  try {
    // Başlangıç callback'i / Trigger start callback
    if (onStart) onStart({ vendor, topic });

    // Mevcut veriyi al / Retrieve existing data for context
    const existingData = window.DASHBOARD_DATA?.vendors?.[vendor]?.[topicIdx] || null;

    // Zenginleştirilmiş prompt oluştur / Build enriched prompt
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
// 6. BULK UPDATE
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
// 7. EXPORT
// index.html'den window.Agent olarak erişilir
// Exposed globally as window.Agent for use in index.html
// ============================================================

window.Agent = {
  config: AGENT_CONFIG,
  buildPrompt,
  buildBattleCardPrompt,
  generateIntelligence,
  generateAllVendorsForTopic,
  differentiators: UIPATH_DIFFERENTIATORS,
};

console.log('[Agent] Loaded. Mock mode:', AGENT_CONFIG.USE_MOCK);

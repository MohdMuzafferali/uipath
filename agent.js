// ============================================================
// UiPath Competitive Intelligence — Agentic Motor / Agentic Engine
// agent.js
//
// Şu an: UiPath Agent Builder modu (Orchestrator üzerinden)
// Current mode: UiPath Agent Builder via Orchestrator API
//
// Mock moda dönmek için: USE_MOCK = true
// To switch back to mock: set USE_MOCK = true
// ============================================================

const AGENT_CONFIG = {
  USE_MOCK: false,                      // Önce mock ile test et, sonra false yap
                                        // Test with mock first, then set to false

  // ── UiPath Orchestrator bağlantısı / UiPath Orchestrator connection ──
  PROVIDER:   'uipath',
  BASE_URL:   'https://staging.uipath.com',
  ORG:        'uipatiqypphm',
  TENANT:     'UiPathDefault',
  FOLDER:     'CompetitiveIntel',
  PROCESS:    'CompetitiveIntelAgent',
  API_TOKEN:  'rt_535C04579F9225740A8994F4E3C332D33D4057E6F0AD7580DD1D167A02EB7543-1',        // Token'ı buraya yapıştır / Paste your token here

  // ── Polling ayarları / Polling settings ──
  // Agent async çalışır — job tamamlanana kadar bekleriz
  // Agent runs async — we poll until the job completes
  POLL_INTERVAL_MS: 3000,              // 3 saniyede bir kontrol / Check every 3 seconds
  POLL_TIMEOUT_MS:  120000,            // Max 2 dakika / Max 2 minutes

  // ── Mock ayarları / Mock settings ──
  MOCK_DELAY_MS: 2000,
};

// ============================================================
// UiPath DIFFERENTIATORS
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
When evaluating {vendor}: look for whether they have comparable third-party attestations, audit trail depth, and data residency controls. Watch for gaps in agent-level auditability.
`,
    'Agentic Capabilities': `
UiPath specifics: Maestro orchestrates AI agents, robots, and humans end-to-end. Supports BPMN-based process modeling, DMN decision management, instance-level controls (suspend/resume/retry/rewind), and exception handling. UiPath agents are governed — not just triggered.
When evaluating {vendor}: assess whether their agentic layer is production-ready or still in preview. Look for: orchestration depth, human oversight mechanisms, agent governance, and multi-agent coordination. Many competitors have "agent builders" but lack runtime governance.
`,
    'BPM & Orchestration': `
UiPath specifics: Maestro uses BPMN as an OMG-maintained open standard — the diagram IS the executable process. DMN for decisions. No hidden logic behind the model.
When evaluating {vendor}: check if they support standards-based BPMN execution (not just diagramming), DMN for decision modeling, and whether process changes require code or just model updates.
`,
    'Testing & Evaluation (Functional + Performance)': `
UiPath specifics: Enterprise Test Suite provides agentic testing with AI agents, resilient end-to-end UI and API test automation, governance (auditing, role management, centralized credentials), and CI/CD + ALM integrations.
When evaluating {vendor}: most automation vendors do not have a dedicated test suite. Look for: end-to-end test automation (not just unit tests), governance integrations, and whether AI is used in test generation or resilience.
`,
    'Process Intelligence': `
UiPath specifics: Process Mining with conformance checking against BPMN reference models. Task Mining for discovering how work is actually done before automation. Closed-loop: insights feed directly back into automation design.
When evaluating {vendor}: assess whether they offer true process mining (event log analysis, conformance checking, variant analysis) vs. basic workflow analytics.
`,
    'Deployment & Operations': `
UiPath specifics: Available as SaaS (Automation Cloud), on-premises, private cloud, public cloud, and containerized (Automation Suite). Orchestrator manages attended/unattended robots, schedules, queues, and assets centrally.
When evaluating {vendor}: assess deployment flexibility — can they support air-gapped/on-prem for regulated industries? Do they have a comparable operational control plane?
`,
    'Traceability & Governance': `
UiPath specifics: Orchestrator Audit page shows full audit trail of all actions by all entities, with filtering and CSV export. Automation Cloud provides centralized audit logs across all services with retention controls.
When evaluating {vendor}: governance depth is a key differentiator. Look for: audit trail granularity, retention policies, role-based access, and agent-level traceability.
`,
  }
};

// ============================================================
// 1. PROMPT BUILDER (fallback — mock modda kullanılır)
// ============================================================

function buildPrompt(vendor, topic, existingData) {
  const existing = existingData ? `
Current data on file (may be outdated — use as context only):
- Score: ${existingData.score}
- Evidence: ${existingData.evidence}
- Sources: ${(existingData.sources || []).join(', ')}
` : 'No existing data on file.';

  const topicGuidance = UIPATH_DIFFERENTIATORS.byTopic[topic]
    ? UIPATH_DIFFERENTIATORS.byTopic[topic].replace(/{vendor}/g, vendor)
    : `When evaluating ${vendor}: focus on enterprise readiness, governance depth, and production maturity.`;

  return `You are a senior competitive intelligence analyst at UiPath.

## Your task
Research and score **${vendor}** on the dimension **"${topic}"** for a UiPath competitive battle card.

## Scoring scale
1 = Not Supported | 2 = Limited | 3 = Adequate | 4 = Strong | 5 = Best-in-class

## UiPath differentiators
${UIPATH_DIFFERENTIATORS.global}

## Topic guidance for "${topic}"
${topicGuidance}

## Existing data
${existing}

Respond ONLY with valid JSON:
{
  "vendor": "${vendor}",
  "topic": "${topic}",
  "score": <integer 1-5>,
  "rationale": "<one sentence>",
  "reasoning": "<2-3 sentences>",
  "evidence": "<2-3 sentences>",
  "uipath_advantage": "<1-2 sentences>",
  "sources": ["<url1>", "<url2>"],
  "confidence": "<High|Medium|Low>",
  "notes": "<caveats>",
  "last_updated": "${new Date().toISOString().split('T')[0]}"
}`;
}

// ============================================================
// 2. BATTLE CARD PROMPT BUILDER
// ============================================================

function buildBattleCardPrompt(rival, topic, uiData, rivalData) {
  const isAllTopics = topic === 'All Topics (Overall)';
  return `You are a senior sales enablement specialist at UiPath.

## Context
${isAllTopics
    ? `The customer is evaluating UiPath vs ${rival} across the entire automation platform.`
    : `The customer has raised questions about "${topic}" specifically.`}

## Score data
- UiPath score: ${uiData?.score || 'N/A'} / 5
- ${rival} score: ${rivalData?.score || 'N/A'} / 5
- Delta: ${uiData && rivalData ? (uiData.score - rivalData.score > 0 ? '+' : '') + (uiData.score - rivalData.score) : 'N/A'}

## UiPath evidence: ${uiData?.rationale || 'No data available.'}
## ${rival} evidence: ${rivalData?.rationale || 'No data available.'}

Write a 2-3 sentence positioning message. Respond ONLY with JSON:
{
  "positioning": "<SE talking point>",
  "uipath_strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "rival_gaps": ["<gap 1>", "<gap 2>"],
  "handle_with_care": "<one caveat>"
}`;
}

// ============================================================
// 3. MOCK RESPONSE
// ============================================================

function generateMockResponse(vendor, topic) {
  const mockScores = {
    'UiPath':     { base: 4.5, strength: 'enterprise governance and BPMN orchestration' },
    'Microsoft':  { base: 4.2, strength: 'low-code UX and connector ecosystem' },
    'Google':     { base: 4.0, strength: 'AI/agent capabilities and cloud scale' },
    'ServiceNow': { base: 4.1, strength: 'IT/HR workflow automation' },
    'Appian':     { base: 4.0, strength: 'BPM and regulated industry compliance' },
    'n8n':        { base: 3.2, strength: 'developer flexibility and low TCO' },
    'OpenAI':     { base: 3.5, strength: 'pure agentic AI capabilities' },
  };
  const vendorInfo = mockScores[vendor] || { base: 3.0, strength: 'automation capabilities' };
  const score = Math.min(5, Math.max(1, Math.round(vendorInfo.base + (Math.random() - 0.5))));
  const confidence = score >= 4 ? 'High' : score >= 3 ? 'Medium' : 'Low';
  return {
    vendor, topic, score,
    rationale: `${vendor} shows ${score >= 4 ? 'strong' : score >= 3 ? 'adequate' : 'limited'} capabilities in ${topic}, driven by its ${vendorInfo.strength}.`,
    reasoning: `Score ${score} reflects ${vendor}'s current product positioning. The platform's ${vendorInfo.strength} contributes positively, though gaps remain depending on deployment context.`,
    evidence: `[MOCK] ${vendor} demonstrates ${score >= 4 ? 'mature' : 'developing'} capabilities in ${topic}. Replace with real data when live mode is enabled.`,
    uipath_advantage: `[MOCK] UiPath's ${topic} capabilities are supported by enterprise-grade governance and open standards that ${vendor} does not yet match at the same depth.`,
    sources: [
      `https://www.${vendor.toLowerCase().replace(/\s/g,'')}.com/documentation`,
      `https://www.gartner.com/reviews/${vendor.toLowerCase().replace(/\s/g,'-')}`
    ],
    confidence,
    notes: '[MOCK] Simulated data. Set USE_MOCK=false to use UiPath Agent.',
    last_updated: new Date().toISOString().split('T')[0]
  };
}

// ============================================================
// 4. UiPath ORCHESTRATOR API
// Job başlat → polling ile bekle → output al
// Start job → poll until complete → get output
// ============================================================

async function startOrchestratorJob(vendor, topic) {
  const { BASE_URL, ORG, TENANT, FOLDER, PROCESS, API_TOKEN } = AGENT_CONFIG;

  // Folder ID'yi al
  const folderRes = await fetch(
    `${BASE_URL}/${ORG}/${TENANT}/orchestrator_/odata/Folders?$filter=FullyQualifiedName eq '${FOLDER}'`,
    { headers: { 'Authorization': `Bearer ${API_TOKEN}`, 'Content-Type': 'application/json' } }
  );
  const folderData = await folderRes.json();
  const folderId = folderData.value?.[0]?.Id;
  if (!folderId) throw new Error(`Folder '${FOLDER}' not found`);

  // Release key'i al
  const releaseRes = await fetch(
    `${BASE_URL}/${ORG}/${TENANT}/orchestrator_/odata/Releases?$filter=ProcessKey eq '${PROCESS}'`,
    { headers: { 'Authorization': `Bearer ${API_TOKEN}`, 'X-UIPATH-OrganizationUnitId': String(folderId) } }
  );
  const releaseData = await releaseRes.json();
  const releaseKey = releaseData.value?.[0]?.Key;
  if (!releaseKey) throw new Error(`Process '${PROCESS}' not found in folder`);

  // Job'ı başlat
  const jobRes = await fetch(
    `${BASE_URL}/${ORG}/${TENANT}/orchestrator_/odata/Jobs/UiPath.Server.Configuration.OData.StartJobs`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
        'X-UIPATH-OrganizationUnitId': String(folderId)
      },
      body: JSON.stringify({
        startInfo: {
          ReleaseKey: releaseKey,
          Strategy: 'All',
          RobotIds: [],
          JobsCount: 0,
          InputArguments: JSON.stringify({ vendor, topic })
        }
      })
    }
  );
  const jobData = await jobRes.json();
  const jobId = jobData.value?.[0]?.Id;
  if (!jobId) throw new Error('Failed to start job: ' + JSON.stringify(jobData));

  return { jobId, folderId };
}

async function pollJobResult(jobId, folderId) {
  const { BASE_URL, ORG, TENANT, API_TOKEN, POLL_INTERVAL_MS, POLL_TIMEOUT_MS } = AGENT_CONFIG;
  const startTime = Date.now();

  while (Date.now() - startTime < POLL_TIMEOUT_MS) {
    await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));

    const res = await fetch(
      `${BASE_URL}/${ORG}/${TENANT}/orchestrator_/odata/Jobs(${jobId})`,
      {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'X-UIPATH-OrganizationUnitId': String(folderId)
        }
      }
    );
    const job = await res.json();
    const state = job.State;

    if (state === 'Successful') {
      // Output'u parse et
      const output = job.OutputArguments ? JSON.parse(job.OutputArguments) : null;
      const content = output?.content || output?.output || null;
      if (!content) throw new Error('Job completed but no output found');

      // Agent scoring: 1=vendor leads, 5=UiPath leads
      // HTML araç: 1=vendor weak, 5=vendor strong
      // Dönüşüm: htmlScore = 6 - agentScore
      const parsed = typeof content === 'string' ? JSON.parse(content) : content;
      parsed.score = 6 - parsed.score; // Score dönüşümü
      parsed._source = 'uipath-agent';  // Nereden geldiğini işaretle
      return parsed;

    } else if (state === 'Faulted' || state === 'Stopped' || state === 'Abandoned') {
      throw new Error(`Job ${state}: ${job.Info || 'Unknown error'}`);
    }
    // Pending/Running — polling devam eder
  }
  throw new Error('Job timeout — agent did not complete within 2 minutes');
}

// ============================================================
// 5. MAIN API CALL
// ============================================================

async function callLLM(prompt, vendor, topic) {
  if (AGENT_CONFIG.USE_MOCK) {
    await new Promise(r => setTimeout(r, AGENT_CONFIG.MOCK_DELAY_MS));
    return generateMockResponse(vendor, topic);
  }

  if (AGENT_CONFIG.PROVIDER === 'uipath') {
    // UiPath Agent Builder üzerinden çalıştır
    const { jobId, folderId } = await startOrchestratorJob(vendor, topic);
    return await pollJobResult(jobId, folderId);

  } else if (AGENT_CONFIG.PROVIDER === 'openai') {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${AGENT_CONFIG.API_KEY}` },
      body: JSON.stringify({ model: AGENT_CONFIG.MODEL, messages: [{ role: 'user', content: prompt }], temperature: 0.2, max_tokens: 1000 })
    });
    const data = await response.json();
    return JSON.parse(data.choices[0].message.content.trim());

  } else if (AGENT_CONFIG.PROVIDER === 'anthropic') {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': AGENT_CONFIG.API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: AGENT_CONFIG.MODEL, max_tokens: 1000, messages: [{ role: 'user', content: prompt }] })
    });
    const data = await response.json();
    return JSON.parse(data.content[0].text.trim());
  }
}

// ============================================================
// 6. generateIntelligence
// ============================================================

async function generateIntelligence({ vendor, topic, topicIdx, onStart, onSuccess, onError }) {
  try {
    if (onStart) onStart({ vendor, topic });
    const existingData = window.DASHBOARD_DATA?.vendors?.[vendor]?.[topicIdx] || null;
    const prompt = buildPrompt(vendor, topic, existingData);
    const result = await callLLM(prompt, vendor, topic);
    if (onSuccess) onSuccess({ vendor, topic, topicIdx, result });
    return result;
  } catch (err) {
    if (onError) onError({ vendor, topic, error: err.message });
    throw err;
  }
}

// ============================================================
// 7. BULK UPDATE
// ============================================================

async function generateAllVendorsForTopic({ topic, topicIdx, vendors, onProgress, onComplete, onError }) {
  const results = {}, errors = {};
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
// 8. EXPORT
// ============================================================

window.Agent = {
  config: AGENT_CONFIG,
  buildPrompt,
  buildBattleCardPrompt,
  generateIntelligence,
  generateAllVendorsForTopic,
  differentiators: UIPATH_DIFFERENTIATORS,
};

console.log('[Agent] Loaded. Provider:', AGENT_CONFIG.PROVIDER, '| Mock:', AGENT_CONFIG.USE_MOCK);

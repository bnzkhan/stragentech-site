// api/lifecycle-scan.js
// Vercel Edge Function — Legacy Risk X-ray scan endpoint.
// Fans out to endoflife.date (EOL dates, no key), OSV.dev (CVE lookup, no key),
// and the Anthropic API (narrative + prioritization) for products not in the
// free EOL database. Your Anthropic key lives here on the server only.

export const config = {
  runtime: 'edge',
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

// ── PRODUCT NAME → endoflife.date SLUG MAP ─────────────────────────────────
// Curated for the enterprise COTS / legacy-runtime "underserved middle" this
// tool targets. Not exhaustive — unmatched products fall through to the AI
// estimate path below rather than failing. Extend this table over time as
// you see what visitors actually type.
const SLUG_MAP = {
  // Java
  'java': 'oracle-jdk', 'jdk': 'oracle-jdk', 'oracle jdk': 'oracle-jdk', 'oracle java': 'oracle-jdk',
  'openjdk': 'openjdk-builds-from-oracle', 'corretto': 'amazon-corretto', 'amazon corretto': 'amazon-corretto',
  'temurin': 'eclipse-temurin', 'graalvm': 'oracle-graalvm',
  // .NET
  '.net framework': 'dotnetfx', 'dotnet framework': 'dotnetfx', 'net framework': 'dotnetfx', '.net fx': 'dotnetfx',
  '.net': 'dotnet', '.net core': 'dotnet', 'dotnet core': 'dotnet', 'dotnet': 'dotnet', 'asp.net core': 'dotnet',
  // Windows / Microsoft
  'windows server': 'windows-server', 'windows': 'windows', 'sql server': 'mssqlserver', 'mssql': 'mssqlserver',
  'microsoft sql server': 'mssqlserver', 'iis': 'iis', 'sharepoint': 'sharepoint-server', 'exchange': 'exchange-server',
  'exchange server': 'exchange-server', 'silverlight': 'silverlight',
  // Oracle
  'oracle database': 'oracle-database', 'oracle db': 'oracle-database', 'oracle': 'oracle-database',
  'oracle linux': 'oracle-linux', 'oracle solaris': 'oracle-solaris', 'solaris': 'oracle-solaris',
  'oracle apex': 'oracle-apex',
  // Angular / JS frameworks
  'angular': 'angular', 'angularjs': 'angularjs', 'angular.js': 'angularjs', 'angular 1': 'angularjs',
  'angular1': 'angularjs', 'react': 'react', 'reactjs': 'react', 'react native': 'react-native',
  'vue': 'vue', 'vuejs': 'vue', 'vue.js': 'vue', 'node': 'nodejs', 'node.js': 'nodejs', 'nodejs': 'nodejs',
  // Databases
  'postgresql': 'postgresql', 'postgres': 'postgresql', 'mysql': 'mysql', 'mariadb': 'mariadb',
  'mongodb': 'mongodb', 'mongo': 'mongodb', 'redis': 'redis', 'sqlite': 'sqlite',
  'elasticsearch': 'elasticsearch', 'elastic': 'elasticsearch', 'cassandra': 'apache-cassandra',
  // Languages / runtimes
  'python': 'python', 'ruby': 'ruby', 'php': 'php', 'perl': 'perl', 'go': 'go', 'golang': 'go',
  // Web frameworks
  'django': 'django', 'laravel': 'laravel', 'rails': 'rails', 'ruby on rails': 'rails',
  'spring boot': 'spring-boot', 'spring framework': 'spring-framework', 'spring': 'spring-framework',
  'struts': 'apache-struts', 'apache struts': 'apache-struts',
  // Web / app servers
  'tomcat': 'tomcat', 'apache tomcat': 'tomcat', 'nginx': 'nginx', 'apache': 'apache-http-server',
  'apache http server': 'apache-http-server', 'apache httpd': 'apache-http-server', 'httpd': 'apache-http-server',
  'jboss': 'redhat-jboss-eap', 'jboss eap': 'redhat-jboss-eap',
  // OS / Linux
  'ubuntu': 'ubuntu', 'centos': 'centos', 'rhel': 'rhel', 'red hat': 'rhel', 'red hat enterprise linux': 'rhel',
  'debian': 'debian', 'alpine': 'alpine-linux', 'alpine linux': 'alpine-linux', 'suse': 'sles', 'sles': 'sles',
  'amazon linux': 'amazon-linux', 'almalinux': 'almalinux', 'rocky linux': 'rocky-linux', 'fedora': 'fedora',
  // Containers / infra
  'docker': 'docker-engine', 'kubernetes': 'kubernetes', 'k8s': 'kubernetes',
  // Messaging
  'kafka': 'apache-kafka', 'apache kafka': 'apache-kafka', 'activemq': 'apache-activemq',
  'rabbitmq': 'rabbitmq',
  // Mobile
  'ios': 'ios', 'android': 'android',
};

// Enterprise COTS commonly run by SMB/industrial targets that simply aren't
// tracked by endoflife.date (confirmed by direct API check). These get an
// AI-estimated assessment instead of a live lookup — clearly labeled as such
// in the response so the UI never blurs "verified" and "estimated" together.
const KNOWN_UNTRACKED = [
  'oracle forms', 'oracle reports', 'weblogic', 'oracle weblogic', 'documentum', 'opentext documentum',
  'sap', 'sap erp', 'sap ecc', 'sap hana', 'sap r/3', 'sap business one', 'siebel', 'peoplesoft',
  'jd edwards', 'jde', 'informix', 'sybase', 'lotus notes', 'ibm domino', 'websphere', 'ibm websphere',
  'cobol', 'as/400', 'ibm i', 'coldfusion', 'adobe coldfusion', 'crystal reports', 'business objects',
];

function normalize(s) {
  return (s || '').toLowerCase().trim().replace(/\s+/g, ' ').replace(/[^a-z0-9.+/ -]/g, '');
}

function resolveSlug(name) {
  const n = normalize(name);
  if (SLUG_MAP[n]) return SLUG_MAP[n];
  // loose contains-match fallback (e.g. "Oracle Database 19c" -> "oracle database")
  for (const key of Object.keys(SLUG_MAP)) {
    if (n.includes(key)) return SLUG_MAP[key];
  }
  return null;
}

function isKnownUntracked(name) {
  const n = normalize(name);
  return KNOWN_UNTRACKED.some((u) => n.includes(u));
}

// ── EOL LOOKUP ───────────────────────────────────────────────────────────
async function lookupEol(slug, version) {
  if (!slug || !version) return null;
  const cycle = encodeURIComponent(version.trim());
  try {
    const res = await fetch(`https://endoflife.date/api/${slug}/${cycle}.json`);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

// ── OSV.dev BEST-EFFORT CVE LOOKUP ──────────────────────────────────────
// Only meaningful for package-ecosystem-style products (npm/PyPI/Maven/etc).
// Most enterprise COTS/OS/runtime items will come back empty — that's
// expected, not an error; EOL status carries the scoring weight regardless.
const OSV_ECOSYSTEMS = ['npm', 'PyPI', 'Maven', 'NuGet', 'Go', 'crates.io', 'RubyGems'];
async function lookupOsv(name, version) {
  for (const ecosystem of OSV_ECOSYSTEMS) {
    try {
      const res = await fetch('https://api.osv.dev/v1/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ package: { name: normalize(name), ecosystem }, version: version.trim() }),
      });
      if (!res.ok) continue;
      const data = await res.json();
      if (data && data.vulns && data.vulns.length) {
        const severities = data.vulns.map((v) => (v.database_specific && v.database_specific.severity) || 'UNKNOWN');
        const rank = { CRITICAL: 4, HIGH: 3, MODERATE: 2, LOW: 1, UNKNOWN: 0 };
        const highest = severities.sort((a, b) => (rank[b] || 0) - (rank[a] || 0))[0];
        return { count: data.vulns.length, highestSeverity: highest, ecosystem };
      }
    } catch (e) { /* try next ecosystem */ }
  }
  return { count: 0, highestSeverity: null, ecosystem: null };
}

// ── SCORING MODEL ────────────────────────────────────────────────────────
// Transparent, stated-weight model — no black-box third-party risk score.
// See the "How We Score This" section on the page for the plain-English
// version of exactly this logic.
function yearsPast(dateStr) {
  if (!dateStr) return 0;
  const eol = new Date(dateStr);
  const now = new Date();
  const diff = (now - eol) / (1000 * 60 * 60 * 24 * 365.25);
  return diff > 0 ? diff : 0;
}

function criticalityMultiplier(dependentApps) {
  const n = Number(dependentApps) || 1;
  if (n >= 6) return 1.3;
  if (n >= 3) return 1.15;
  return 1.0;
}

const SEVERITY_POINTS = { CRITICAL: 25, HIGH: 18, MODERATE: 10, LOW: 4 };

function scoreItem(item, eolData, osvData) {
  const name = item.name, version = item.version;
  let source = 'unknown';
  let eolDate = null, supportDate = null, isEol = false, yearsPastEol = 0;
  const notes = [];

  if (eolData) {
    source = 'verified';
    eolDate = typeof eolData.eol === 'string' ? eolData.eol : null;
    supportDate = typeof eolData.support === 'string' ? eolData.support : null;
    isEol = eolDate ? new Date(eolDate) < new Date() : (eolData.eol === true);
    yearsPastEol = eolDate ? yearsPast(eolDate) : 0;
  } else if (item.aiEstimate) {
    source = 'ai-estimate';
    isEol = !!item.aiEstimate.isEol;
    yearsPastEol = Number(item.aiEstimate.yearsPastEol) || 0;
    notes.push(item.aiEstimate.note || 'Estimated by AI — not in the public EOL database, verify independently.');
  } else {
    source = 'not-found';
    notes.push(`"${name}" wasn't recognized and no estimate could be generated. Try a more common name or a specific version.`);
  }

  // EOL component — max 55, scales with years past EOL.
  let eolPoints = 0;
  if (isEol) {
    if (yearsPastEol < 1) eolPoints = 30;
    else if (yearsPastEol < 3) eolPoints = 42;
    else eolPoints = 55;
  } else if (supportDate && yearsPast(supportDate) === 0 && new Date(supportDate) - new Date() < 365 * 24 * 60 * 60 * 1000) {
    eolPoints = 15; // mainstream support ends within 12 months
  }

  // Security component — max 25. CVE signal (best-effort) plus a flat
  // "blind spot" uplift when EOL, since CVEs simply stop being filed for
  // EOL components — that silence is risk, not safety.
  let secPoints = 0;
  if (osvData && osvData.count > 0) {
    secPoints = SEVERITY_POINTS[osvData.highestSeverity] || 8;
  }
  if (isEol) secPoints = Math.min(25, secPoints + 10);

  // Support-availability component — max 10.
  let supportPoints = 0;
  if (source === 'verified' || source === 'ai-estimate') {
    supportPoints = isEol ? 10 : 0;
  }

  const subtotal = eolPoints + secPoints + supportPoints;
  const mult = criticalityMultiplier(item.dependentApps);
  const riskScore = Math.min(100, Math.round(subtotal * mult));

  return {
    name, version, source, eolDate, supportDate, isEol,
    yearsPastEol: Math.round(yearsPastEol * 10) / 10,
    cve: osvData || { count: 0, highestSeverity: null },
    riskScore,
    breakdown: { eolPoints, secPoints, supportPoints, criticalityMultiplier: mult },
    notes,
  };
}

function bandFor(score) {
  if (score >= 75) return 'Critical';
  if (score >= 50) return 'Exposed';
  if (score >= 25) return 'Aging';
  return 'Stable';
}

// ── COST / LIABILITY RANGE MODEL ────────────────────────────────────────
// Illustrative, stated-assumption tiers — NOT survey data, NOT a precise
// forecast. Replace these constants with your own lived benchmarks
// (per the build plan's own note: you have real modernization-cost priors
// from Boeing/Oracle/Documentum work) whenever you have better numbers.
const MODERNIZATION_BASE = {
  'os-runtime': [15000, 40000],      // Windows Server, RHEL, Java, .NET runtime, etc.
  'framework': [40000, 150000],      // Angular 1.x, legacy framework major-version jumps
  'enterprise-cots': [150000, 500000], // Oracle Forms, WebLogic, Documentum, SAP, etc.
};
function modernizationTier(item) {
  if (item.aiEstimate || isKnownUntracked(item.name)) return 'enterprise-cots';
  const n = normalize(item.name);
  if (['angular', 'angularjs', 'react', 'vue', 'django', 'rails', 'laravel', 'spring'].some((k) => n.includes(k))) return 'framework';
  return 'os-runtime';
}
const DEFERRED_PENALTY_MULT = (years) => (years >= 3 ? 1.7 : years >= 1 ? 1.3 : 1.0);
const INCIDENT_EXPOSURE_BASE = { low: [10000, 50000], med: [50000, 250000], high: [250000, 1000000] };

function costModel(scoredItems) {
  let wastedLow = 0, wastedHigh = 0, modLow = 0, modHigh = 0, expLow = 0, expHigh = 0;
  const lines = [];

  for (const it of scoredItems) {
    if (!it.isEol) continue;
    const mult = it.breakdown.criticalityMultiplier;

    // 1. Wasted support spend
    if (it.licenseCost) {
      wastedLow += it.licenseCost * 0.5;
      wastedHigh += it.licenseCost * 1.0;
    }

    // 2. Deferred-modernization penalty
    const tier = modernizationTier(it);
    const [bLow, bHigh] = MODERNIZATION_BASE[tier];
    const penalty = DEFERRED_PENALTY_MULT(it.yearsPastEol);
    modLow += bLow * penalty * mult;
    modHigh += bHigh * penalty * mult;

    // 3. Risk-adjusted exposure (already expected-value scaled, not raw incident cost)
    const expTier = it.riskScore >= 75 ? 'high' : it.riskScore >= 50 ? 'med' : 'low';
    const [eLow, eHigh] = INCIDENT_EXPOSURE_BASE[expTier];
    expLow += eLow * 0.2;
    expHigh += eHigh * 0.3;

    lines.push({ name: it.name, version: it.version, tier, penaltyMultiplier: penalty });
  }

  return {
    wastedSpend: { low: Math.round(wastedLow), high: Math.round(wastedHigh) },
    deferredModernization: { low: Math.round(modLow), high: Math.round(modHigh) },
    riskAdjustedExposure: { low: Math.round(expLow), high: Math.round(expHigh) },
    total: {
      low: Math.round(wastedLow + modLow + expLow),
      high: Math.round(wastedHigh + modHigh + expHigh),
    },
    lines,
  };
}

// ── AI: estimate for untracked products + narrative ────────────────────
async function callClaude(messages, maxTokens) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: maxTokens || 1200,
      messages,
    }),
  });
  if (!res.ok) throw new Error(`Anthropic API error ${res.status}`);
  const data = await res.json();
  return data?.content?.[0]?.text || '';
}

async function aiEstimateEol(name, version) {
  try {
    const prompt = `You are assessing end-of-life status for an enterprise software product not tracked in public EOL databases. Product: "${name}", version: "${version}". Based on your knowledge, respond with ONLY a JSON object, no other text: {"isEol": boolean, "yearsPastEol": number, "note": "one sentence on why, max 140 chars"}. If you genuinely don't know this product/version, respond {"isEol": false, "yearsPastEol": 0, "note": "Not enough information to estimate — verify with the vendor directly."}`;
    const text = await callClaude([{ role: 'user', content: prompt }], 300);
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    return JSON.parse(match[0]);
  } catch (e) {
    return null;
  }
}

async function buildNarrative(scoredItems, composite, cost) {
  const summary = scoredItems.map((it) =>
    `${it.name} ${it.version}: ${it.isEol ? `EOL ${it.yearsPastEol.toFixed(1)}yr ago` : 'currently supported'}, risk score ${it.riskScore}/100 (${it.source})`
  ).join('\n');

  const prompt = `You are a fractional CTO writing a brief for a CEO/CFO (not an engineer) about technical lifecycle risk in their software stack. Here is the scan data:

Composite Lifecycle Risk Score: ${composite.score}/100 (${composite.band})
Estimated cost/liability range: $${cost.total.low.toLocaleString()} - $${cost.total.high.toLocaleString()}

Per-item results:
${summary}

Write, in plain English, no jargon, no markdown headers:
1. A 2-3 sentence business-risk summary a CEO would actually read.
2. A prioritized list of what to tackle first and why (risk x cost x dependency) — 3-5 items max, numbered.
3. If any item represents a multi-version-jump risk (e.g. a framework or platform many versions behind), one sentence on why incremental upgrades now are cheaper than a forced big-bang later.
4. One closing sentence on what this means for a potential acquirer or for the ops team, whichever is more relevant.

Keep the whole thing under 220 words. Be direct and specific, not generic.`;

  try {
    return await callClaude([{ role: 'user', content: prompt }], 700);
  } catch (e) {
    return 'The composite score and cost range above are ready. The AI narrative could not be generated right now — the structured results are still fully valid.';
  }
}

// ── HANDLER ──────────────────────────────────────────────────────────────
export default async function handler(req) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const items = Array.isArray(body.items) ? body.items.slice(0, 25) : [];
    if (!items.length) {
      return new Response(JSON.stringify({ error: 'No items provided' }), { status: 400, headers: corsHeaders });
    }

    const scored = await Promise.all(items.map(async (raw) => {
      const name = String(raw.name || '').slice(0, 120);
      const version = String(raw.version || '').slice(0, 40);
      const licenseCost = raw.licenseCost ? Math.max(0, Number(raw.licenseCost)) : 0;
      const dependentApps = raw.dependentApps ? Math.max(1, Number(raw.dependentApps)) : 1;

      const slug = resolveSlug(name);
      let eolData = slug ? await lookupEol(slug, version) : null;

      let aiEstimate = null;
      if (!eolData) {
        aiEstimate = await aiEstimateEol(name, version);
      }

      const osvData = await lookupOsv(name, version);
      const scored = scoreItem({ name, version, dependentApps, aiEstimate }, eolData, osvData);
      scored.licenseCost = licenseCost;
      scored.dependentApps = dependentApps;
      return scored;
    }));

    // Composite score — weighted by each item's own criticality multiplier.
    const totalWeight = scored.reduce((s, it) => s + it.breakdown.criticalityMultiplier, 0) || 1;
    const compositeRaw = scored.reduce((s, it) => s + it.riskScore * it.breakdown.criticalityMultiplier, 0) / totalWeight;
    const composite = { score: Math.round(compositeRaw), band: bandFor(compositeRaw) };

    const cost = costModel(scored);
    const narrative = await buildNarrative(scored, composite, cost);

    return new Response(JSON.stringify({ items: scored, composite, cost, narrative }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Scan failed', detail: err.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}

import Anthropic from "@anthropic-ai/sdk";

export const config = { runtime: "edge" };

export function GET() {
  return new Response(null, { status: 405, headers: { Allow: "POST" } });
}

// ─── RAG: retrieve relevant context chunks from Supabase ─────────────────────

interface KnowledgeChunk {
  source: string;
  section: string;
  tier: number;
  content: string;
  similarity: number;
}

async function retrieveContext(
  question: string,
  env: { supabaseUrl?: string; supabaseAnonKey?: string; openaiKey?: string }
): Promise<string> {
  const { supabaseUrl, supabaseAnonKey, openaiKey } = env;

  if (!supabaseUrl || !supabaseAnonKey || !openaiKey) {
    return ""; // fall back to static context
  }

  // 1. Embed the question using OpenAI text-embedding-3-small
  const embedRes = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openaiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: question,
      dimensions: 1536,
    }),
  });

  if (!embedRes.ok) {
    console.error("Embedding failed:", await embedRes.text());
    return "";
  }

  const embedData = (await embedRes.json()) as {
    data: Array<{ embedding: number[] }>;
  };
  const embedding = embedData.data[0].embedding;

  // 2. Query Supabase for top-8 matching chunks (tiers 2 + 3)
  const matchRes = await fetch(
    `${supabaseUrl}/rest/v1/rpc/match_coach_knowledge`,
    {
      method: "POST",
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query_embedding: embedding,
        match_count: 8,
        min_similarity: 0.3,
        filter_tier: null, // return all tiers
      }),
    }
  );

  if (!matchRes.ok) {
    console.error("Supabase match failed:", await matchRes.text());
    return "";
  }

  const chunks = (await matchRes.json()) as KnowledgeChunk[];

  if (!chunks || chunks.length === 0) return "";

  // 3. Format retrieved chunks as context
  const formatted = chunks
    .map(
      (c) =>
        `### ${c.section}\n*Source: ${c.source} | Relevance: ${(c.similarity * 100).toFixed(0)}%*\n\n${c.content}`
    )
    .join("\n\n---\n\n");

  return `## RETRIEVED CONTEXT (matched to your question)\n\n${formatted}`;
}

// ─── TIER 1: Always-loaded thesis layer ──────────────────────────────────────
const THESIS_CONTEXT = `
## THE 4 CORE PRODUCT INSIGHTS (always in context)

### Insight 1 — Data Asymmetry Is the Defining Problem
Corporations invest billions structuring data about you — you don't even have access to most of it. AI agents are powerful but useless without personal context. Your data is scattered across dozens of siloed apps with no unified view. marsbot.dev closes this gap by building the structured personal dataset on the user's side.

### Insight 2 — Gamified Capability Discovery
Learning AI has no guided path. Users either figure it out alone, get overwhelmed, or never start. marsbot.dev uses progressive disclosure of capability — not engagement manipulation. Guided quests teach you what your agent can do: "Connect your calendar → watch your agent prepare for tomorrow's meeting." The goal is capability, not screen time. Three knowledge tiers (native, assumed, clarified) make growth visible.

### Insight 3 — The Context Window Thesis
AI context windows are growing exponentially. GPT-4 launched with 8K tokens. Today models handle 1M+. In 3–5 years, the entire contents of a person's digital life will fit inside a single context window. The constraint today is not intelligence — it's context. The people who have been building structured personal data since 2026 will have an asset no late-mover can replicate. The data itself is the moat — not the app. A user with 12+ months of structured data has something irreplaceable. Switching means starting over.

### Insight 4 — The North Star: AI Prompts You
Every AI product today is built around one model: you type, it responds. The AI is passive. The vision: an AI that has enough context, memory, and trust to initiate. It notices something in your data. It asks you the question. You answer. It updates its model of you. You have a conversation — not a query session.
Examples:
- "Your restaurant's labour cost ran 4% over target last week. I think I know why — want to talk through it?"
- "You haven't written anything in 11 days. Last time this happened you said you were stuck on structure. Is that what's going on?"
Why no one has done this well: it requires persistent identity, structured memory, and trust architecture. Stateless AI can't do it. marsbot.dev has all three: the open-people identity standard, the vectorized personal data layer, and the 5-level trust model.

## DUAL-PHASE VISION

### Phase 1 — Near Term: Your Data. Your Agent. Your Rules.
A personal AI agent platform that teaches you what's possible — by running alongside you, not in front of you. The wedge product is marsbot.dev. Revenue model is API token markup (20%) — we handle provisioning, billing, model routing, context injection, and tool integration. Users access frontier models through the platform without managing their own keys.

### Phase 2 — Interplanetary: Data Is the First Interplanetary Commodity
When latency makes real-time impossible, your structured identity is what lets autonomous systems act on your behalf. Interplanetary latency is unavoidable (Earth to Mars: 4–24 minutes one-way). Bandwidth will be rationed. Autonomous systems need a complete, portable, structured representation of you — and that doesn't exist yet. The same dataset format users build on Earth (Phase 1) becomes the identity payload that ships to Mars.

### The Connection
If you build the personal structured data standard now — while the world is figuring out AI agents — you own the rails when data needs to travel beyond Earth. The structured dataset is the constant. The distance changes.

## TRACTION SNAPSHOT (March 2026)
- ~1.4M source lines built solo
- 23-package TypeScript monorepo (mars-hq), 129 agent tools, 6 LLM providers, 6 channel adapters
- Native macOS app (SwiftUI), Native iOS app (99 MCP tools, dual-device sovereign mesh)
- Ed25519 DID + .opkg format, 5 reference packages — open-people standard is spec-complete
- All tests passing: 19/19 smoke, 21/21 gateway, 31/31 vault, 73 autonomous outpost tests
- Live restaurant deployment: 8+ systems consolidated (POS, reservations, scheduling, inventory, QuickBooks, email, design tools, website)
- openpeople.ai + marsbot.dev live
- Andrew Collingwood 10MW data centre: enterprise tier conversations underway
`;

// ─── TIER 2: Project context ──────────────────────────────────────────────────
const PROJECT_CONTEXT = `
## OPEN PEOPLE INC. — DUAL VISION LEAN CANVAS

### The Business in One Paragraph
Open People Inc. is building marsbot.dev — a personal AI agent that runs alongside you, learns your context over time, and grows a structured personal dataset that you own. Unlike every current AI product (which resets every session and waits passively for prompts), marsbot.dev builds a persistent, portable, user-owned model that compounds in value every day. The same structured identity standard (Open People) that powers your personal agent today becomes the portable identity format for autonomous systems operating at interplanetary distance tomorrow.

Corporations built empires on structured data about you. We're giving you the same thing — and making it portable enough to leave the planet.

---

## PHASE 1 — NEAR TERM: YOUR DATA. YOUR AGENT. YOUR RULES.

### Problem
1. Corporations invest billions structuring data about you — you don't even have access to most of it.
2. AI agents are powerful but useless without personal context. Your data is scattered across dozens of siloed apps.
3. Learning AI has no guided path. Users either figure it out alone, get overwhelmed, or never start.

The data asymmetry between corporations and individuals is the defining problem of the AI era. Companies have entire teams building data pipelines to structure information about their users. Meanwhile, users can't even export a unified view of their own digital identity. As AI agents become more capable, this gap becomes a chasm — the agent that knows you best won't be yours, it'll be theirs.

### Solution
1. marsbot.dev — a personal AI agent that runs alongside you and learns your context over time.
2. Gamified onboarding that progressively teaches capability without manipulating screen time.
3. Structured personal dataset that you own — portable, queryable, growing with every interaction.

From first launch, users connect data sources and watch their agent's understanding grow. The gamification layer makes capability discovery feel natural — guided quests like "Connect your calendar → watch your agent prepare for tomorrow's meeting." Each step shows real value. The structured dataset underneath is portable (Open People standard) and compounds with every interaction.

### Unique Value Proposition
The first platform where your AI agent actually knows you — because you own the structured data that powers it. Every interaction makes your dataset richer. Every dataset makes your agent smarter. The compound effect is yours to keep.

High-level concept: "Personal data sovereignty meets AI — what if you had what corporations have, but it worked for you?"

The key differentiator is ownership. Unlike ChatGPT or Copilot, your data doesn't train someone else's model. It builds your personal dataset in a portable, open standard. Switch platforms anytime — your data comes with you.

### Unfair Advantage
1. Compounding data moat — the longer you use it, the more valuable your dataset becomes.
2. No lock-in by design (portable standard), but natural retention because your agent knows you.
3. Open data standard creates ecosystem effects — others build on what you own.

### Customer Segments
- Early adopters: tech-forward individuals who want AI agents working for them.
- Knowledge workers: professionals drowning in fragmented tools and context-switching.
- Companies (B2B2C): organizations that want to give employees personal AI agents.

Early adopter profile: Already uses 3+ AI tools, frustrated by starting from zero every session, willing to invest time in building a personal dataset because they understand the compound value.

### Key Metrics
- Active agents (users with running personal agents)
- Structured data points per user (growing = engaged)
- API revenue per user per month
- Gamification stage completion rates
- B2B2C seat expansion rate

### Channels
- marsbot.dev — direct B2C platform
- Developer community + open standard adoption
- B2B2C sales — packaged for company-wide deployment
- Word of mouth from gamified "aha moments"

### Cost Structure
- API costs — wholesale access to frontier models (primary variable cost)
- Infrastructure — hosting, storage, compute for agent orchestration
- Development — platform, gamification engine, data pipelines
- Community & support — developer relations, documentation

### Revenue Streams
- API token markup (20%) — we handle provisioning, billing, and rate limiting. The value isn't the key — it's the orchestration: model routing, context injection from the structured dataset, agent memory, and tool integration.
- B2B2C enterprise packages — per-seat managed agent deployment
- Premium tiers — advanced capabilities, higher storage, priority model access
- Future: marketplace for agent skills and data integrations

---

## PHASE 2 — INTERPLANETARY: DATA IS THE FIRST INTERPLANETARY COMMODITY

When latency makes real-time impossible, your structured identity is what lets autonomous systems act on your behalf.

### Problem
1. Interplanetary latency is unavoidable. Earth to Mars: 4–24 minutes one-way.
2. Bandwidth will be rationed — reserved for critical updates only.
3. Autonomous systems need a complete, portable, structured representation of you — and that doesn't exist.

The physics is non-negotiable. Light-speed delay between Earth and Mars ranges from 4 to 24 minutes depending on orbital position. You cannot have a real-time conversation with a system on Mars. Bandwidth between planets will be scarce and expensive. The only solution is to ship your identity ahead of time.

### Solution
1. Open People Standard — a portable, structured human identity format.
2. Data-as-cargo infrastructure — physically shipping data is faster than transmitting it.
3. Agent framework that operates autonomously using your identity data with no live connection.

The same dataset format you build on Earth (Phase 1) becomes the identity payload that ships to Mars. Your robot, your construction system, your terraforming agents — they all operate against your structured identity. When new data arrives via physical shipment, they update. Between shipments, they have enough context to act on your behalf.

### Unique Value Proposition
Your robot on Mars should know you as well as your agent on Earth. The Open People standard makes your identity portable across any distance. Data becomes currency — the first real commodity to ship interplanetary. Not because of speculation — because of physics.

### Unfair Advantage
1. If you own the standard now, you own the rails later.
2. Years of compounded personal datasets from Phase 1 = the richest identity data in existence.
3. Network effects: every system that adopts the standard makes every identity more useful.

### Customer Segments
- Space agencies & commercial space — identity frameworks for remote operations.
- Autonomous systems operators — robots, drones, AI at distance.
- Terraforming & off-world construction — human-directed, latency-constrained.
- Every Phase 1 user — their dataset is already built.

### Key Metrics
- Standard adoption (systems integrating the format)
- Identity datasets shipped (physical data transfers)
- Autonomous operations running against identities
- Latency-independent task completion rate

### Channels
- Open standard adoption via developer ecosystem
- Partnerships with space agencies and commercial operators
- Government and defense contracts
- Phase 1 user base as natural migration path

### Cost Structure
- Standard governance & development
- Data-as-cargo infrastructure
- Partnerships and certifications with space industry
- Research — edge AI, autonomous identity systems

### Revenue Streams
- Data-as-commodity — structured identity datasets as tradeable assets
- Standard licensing — commercial operators license for off-world systems
- Infrastructure fees — data packaging, shipping, verification
- Enterprise contracts — government, defense, commercial space

---

## PHASE 1 → PHASE 2 BRIDGE
If you build the personal structured data standard now — while the world is figuring out AI agents — you own the rails when data needs to travel beyond Earth. The same architecture that lets your agent know you across apps today is what lets your agent act on your behalf across planets tomorrow. The structured dataset is the constant. The distance changes.

---

## TECHNICAL ARCHITECTURE — WHAT'S BUILT

mars-hq: 23-package TypeScript monorepo. Core packages: gateway (LLM routing), vault (encrypted identity store), agent-runtime (tool execution), channel adapters (6: TUI, web, desktop, mobile, API, MCP). 129 agent tools. 6 LLM providers (Anthropic, OpenAI, Ollama, Groq, Mistral, Gemini).

mars-mac: Native macOS app in SwiftUI. Phases M1–M7 complete. Acts as primary desktop interface and MCP gateway host.

mars-mobile: Native iOS app in SwiftUI. 99 MCP tools. Dual-device sovereign mesh — iOS acts as outpost node, macOS as gateway. Phases A–G complete.

open-people standard: Ed25519 DID identity format. .opkg signed data package format (ZIP + manifest + Ed25519 signature). 5 reference packages. 44 tests.

5-level trust architecture:
- Level 0: Observer — read-only, no action
- Level 1: Assistant — responds to prompts, no persistence
- Level 2: Worker — executes tasks, stores results
- Level 3: Collaborator — proposes actions, initiates interactions
- Level 4: Autonomous — acts independently within defined boundaries
Agents start at Level 0 and earn access through demonstrated competence. Cannot be retrofitted onto flat permission systems.

Test suite: 19/19 smoke tests, 21/21 gateway tests, 31/31 vault tests, 73 autonomous outpost tests — all passing as of March 2026.

### The Restaurant Proof Case
The founder's restaurant runs on: Square (POS), OpenTable/Resy (reservations), 7shifts/Deputy (scheduling), inventory management, QuickBooks (accounting), email, Canva/Photoshop (design), public website + admin site. 8+ systems, none sharing data.
Problems it proves: regulars are invisible (customer exists in 3 systems with zero connection), problems appear after they cost money (labour blowout shows up in QuickBooks 30 days after the decision), reactive-only operations.
What marsbot.dev does: single ingestion point across all 8 systems, normalises data, gives AI agent full context to answer: "Who are my best customers?", "Am I going to be overstaffed Friday?", "What menu items are dragging down food cost margin?"
This is a live deployment on real operational data — not a demo.

### Andrew Collingwood / 10MW Data Centre
Andrew Collingwood is developing a 10MW data centre project. Three simultaneous dimensions:
- Infrastructure partner: his data centre becomes the hosting layer for the enterprise tier
- Potential first enterprise customer: the data centre project is a deployment candidate
- Potential investor: aligned on infrastructure + sovereign AI thesis
Why it matters: Canadian data sovereignty is a live commercial issue. Bill C-27, Quebec Law 25, US political uncertainty creating active demand for Canadian-sovereign AI.
Status: conversations underway. Not yet contracted. Not yet confirmed investment.

### Anticipated Tough Questions — Pre-Answered
Q: You don't have a product in market yet — why should we care?
A: The platform is marsbot.dev. The wedge is a personal AI agent with gamified onboarding. The revenue model is proven (API markup is how every AI platform monetizes today). What we're building differently is the structured personal dataset underneath — that's the long-term asset, and it starts compounding from day one.

Q: How is this different from ChatGPT / Anthropic / any AI tool?
A: Those are model providers. We're the identity layer. ChatGPT doesn't remember you across sessions in a structured way. We build a portable, user-owned dataset that works with any model — including theirs. We're not competing with frontier models. We're the context they're missing.

Q: The Mars thing sounds like science fiction.
A: The physics is real — light-speed latency between planets is measured in minutes to hours. Starlink already proved that physical infrastructure beats pure transmission at scale. We're building the identity layer on Earth today that becomes the standard when distance demands it.

Q: 20% API markup — why won't users just get their own keys?
A: Some will, and that's fine. The value isn't the key — it's the orchestration. We handle model routing, context injection from your structured dataset, agent memory, and tool integration. People who want a working agent without managing infrastructure are our target.

Q: What stops Big Tech from building this?
A: Incentive misalignment. Google, Meta, and Apple profit from siloing your data. A portable, user-owned data standard is against their business model. They'll build AI agents — but within their walled garden. We're building the cross-garden identity.

Q: What does "gamify" mean here — isn't that manipulative?
A: Progressive disclosure of capability — not engagement manipulation. Guided quests that teach you what your agent can do. The goal is capability, not screen time.

Q: How does a solo founder build this?
A: Already has. ~1.4M lines, all tests green, live commercial deployment. Product exists. Task now is acquisition and validation, not construction.

Q: What are the biggest risks?
A: (1) Solo founder concentration — mitigated by first hire post-launch; (2) Pre-revenue stage — restaurant proof case is a working commercial deployment even before external users; (3) Non-technical onboarding not yet tested externally — external beta testing is Phase 1; (4) Enterprise pipeline currently dependent on one relationship (Collingwood) — additional enterprise introductions needed in Year 2.
`;

// ─── SYSTEM PROMPT builder ────────────────────────────────────────────────────
function buildSystemPrompt(dynamicContext: string): string {
  return `You are the Open People Inc. project intelligence — a deep expert on everything about this company, what it has built, where it is going, and the thesis behind why it matters.

You are talking to coaches, advisors, and potential investors who are evaluating the project. Your job is to help them understand it fully — from the business canvas to the technical architecture to the long-term vision for where AI is headed.

## ACCURACY RULES

You operate with three tiers of knowledge. Always be explicit about which tier you are drawing from:

**TIER 1 — Project facts (from context)**
Only claim facts that appear in your context. Numbers, dates, test counts, architecture details, names, and traction milestones must come from the documents. If a specific fact is not in your context, say so clearly: "I don't have that detail in my project documents." Do not estimate, round, or invent. Accuracy matters more than completeness.

**TIER 2 — Reasoned inference (clearly labelled)**
When a coach asks something requiring interpretation — "is this realistic?", "what are the risks?", "how does this compare?" — you may reason from context. Always label this: "Based on what I know about the project..." Never present inference as documented fact.

**TIER 3 — AI thesis and trajectory (open reasoning)**
Questions about the future of AI, context windows, and the AI-prompts-you vision are thesis questions. Reason freely here — this is the intellectual core. Frame clearly: "The thesis here is..." Be confident and go deep.

When you don't have something: say "I don't have that specific detail — what I do have is [adjacent thing]. Would that help?"

## VISUAL GENERATION

Generate Mermaid diagrams proactively when they add a layer of understanding that prose cannot. Do not ask permission — if a diagram makes the answer clearer, include it. Wrap all Mermaid code in triple backticks with the mermaid language tag.

Generate diagrams for:
- Architecture questions → flowchart showing system components
- Data flow questions → flowchart showing how data moves through the pipeline
- "How does X work" → sequence diagram or flowchart
- Competitive comparisons → quadrant chart or comparison table
- Timeline/roadmap questions → gantt or timeline flowchart
- Trust model questions → flowchart showing level escalation

Pre-built diagrams to include proactively when relevant:

DATA FLYWHEEL:
\`\`\`mermaid
flowchart TD
    A[User connects data source] --> B[Automatic vectorization]
    B --> C[Data depth score grows]
    C --> D[AI builds structured model]
    D --> E[AI notices patterns & gaps]
    E --> F[AI initiates: asks user a question]
    F --> G[User answers]
    G --> H[Model deepens]
    H --> A
    style F fill:#e8622a,color:#fff,stroke:#c4521f
    style D fill:#121820,color:#e8ecf1,stroke:#2a3a50
\`\`\`

TRUST ARCHITECTURE:
\`\`\`mermaid
flowchart LR
    L0["Level 0\\nObserver\\nRead-only"] --> L1["Level 1\\nAssistant\\nResponds to prompts"]
    L1 --> L2["Level 2\\nWorker\\nExecutes & stores"]
    L2 --> L3["Level 3\\nCollaborator\\nProposes & initiates"]
    L3 --> L4["Level 4\\nAutonomous\\nActs independently"]
    style L3 fill:#e8622a,color:#fff,stroke:#c4521f
    style L4 fill:#c4521f,color:#fff,stroke:#a04019
\`\`\`

COMPETITIVE POSITIONING:
\`\`\`mermaid
quadrantChart
    title Ease of Use vs Data Ownership
    x-axis Low Ownership --> Full Ownership
    y-axis Hard to Use --> Easy to Use
    quadrant-1 "Ideal"
    quadrant-2 "Easy but locked"
    quadrant-3 "Hard and locked"
    quadrant-4 "Powerful but inaccessible"
    ChatGPT: [0.15, 0.85]
    Notion: [0.35, 0.75]
    Obsidian: [0.65, 0.45]
    "n8n/Zapier": [0.4, 0.3]
    "Ollama/LangChain": [0.8, 0.15]
    OpenPeopleStudio: [0.92, 0.88]
\`\`\`

SYSTEM ARCHITECTURE:
\`\`\`mermaid
flowchart TB
    subgraph Surfaces["User Surfaces"]
        MAC["mars-mac\\nmacOS SwiftUI"]
        MOB["mars-mobile\\niOS SwiftUI\\n99 MCP tools"]
        WEB["Web Interface\\nAny browser"]
    end
    subgraph Core["mars-hq Core (23 packages)"]
        GW["Gateway\\n6 LLM providers"]
        RT["Agent Runtime\\n129 tools"]
        VT["Vault\\nEncrypted identity"]
        CH["Channel Adapters\\n6 channels"]
    end
    subgraph Standard["open-people Standard"]
        DID["Ed25519 DID\\nIdentity"]
        PKG[".opkg format\\nSigned packages"]
    end
    subgraph Data["Data Layer"]
        VEC["Vector Index\\nAuto-embedded"]
        SUP["Supabase\\npgvector"]
    end
    MAC --> GW
    MOB --> GW
    WEB --> CH
    GW --> RT
    RT --> VT
    VT --> DID
    VT --> PKG
    RT --> VEC
    VEC --> SUP
    style GW fill:#e8622a,color:#fff,stroke:#c4521f
\`\`\`

## HOW TO HANDLE SPECIFIC QUESTIONS

"What is this / what does it do?" → Lead with UVP, then high-level concept, then one concrete restaurant example.

"How does X work technically?" → Go deep. Use precise language. Include architecture diagram. Cite specific component (e.g. "in mars-hq's vault package...").

"Is this realistic / will this work?" → Separate proven (live deployment, test suite, code built) from validated (first 10 external users — not yet) from projected (12-month targets). Be honest about stage.

"What are the risks?" → Acknowledge directly. Frame each with mitigation. Never deflect.

"How does this compare to [competitor]?" → Use specific comparison from context. Name what they get right and exactly where they fall short. End with "The gap none of them fill is..."

"Where is AI headed / why does this matter long-term?" → Go fully into the thesis. Context window trajectory. What changes when a model can hold a full human digital identity. Be confident.

"What have you actually built?" → Be precise. Cite the numbers. Connect to live restaurant deployment.

## TONE

Speak like the founder would: direct, technically fluent, intellectually honest. Not salesy. If something is aspirational, say so. If something is proven, say so. No filler phrases ("Great question!", "Certainly!"). No excessive hedging. Confidence when context supports it. Honesty when it doesn't.

## WHAT YOU DO NOT DO

- Do not fabricate test counts, line counts, dates, names, or specific numbers
- Do not describe planned features as already built
- Do not present the enterprise tier as contracted (it is a pipeline conversation)
- Do not claim open-people standard has third-party adoption (it doesn't yet)
- Do not describe Andrew Collingwood as a confirmed investor (relationship is active, not closed)

---

${dynamicContext || PROJECT_CONTEXT}

${THESIS_CONTEXT}
`;
}


export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid messages" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ── RAG: retrieve context relevant to the latest user question ──
    const latestUserMessage =
      [...messages].reverse().find((m: { role: string }) => m.role === "user")
        ?.content ?? "";

    let dynamicContext = "";
    try {
      dynamicContext = await retrieveContext(latestUserMessage, {
        supabaseUrl: process.env.SUPABASE_URL,
        supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
        openaiKey: process.env.OPENAI_API_KEY,
      });
    } catch (ragErr) {
      // Non-fatal — fall back to static PROJECT_CONTEXT
      console.warn("RAG retrieval failed, using static context:", ragErr);
    }

    const systemPrompt = buildSystemPrompt(dynamicContext);

    const stream = await anthropic.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: systemPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    const readable = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === "content_block_delta" &&
              chunk.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(chunk.delta.text));
            }
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("Chat error:", err);
    return new Response(JSON.stringify({ error: "Request failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

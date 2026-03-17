#!/usr/bin/env node
/**
 * index-knowledge.ts — Coach RAG context indexer
 *
 * Reads project documents, splits into semantic chunks, generates embeddings
 * via OpenAI text-embedding-3-small (1536 dims), and upserts into the
 * Supabase `coach_knowledge` table.
 *
 * Run:     npx tsx scripts/index-knowledge.ts
 * Requires in .env.local:
 *   OPENAI_API_KEY=sk-...
 *   SUPABASE_URL=https://loygyzhukfxdztkwfimr.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=<service role key from Supabase dashboard>
 */

import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

// ─── Environment ──────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_KEY = process.env.OPENAI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !OPENAI_KEY) {
  console.error(
    "❌ Missing required env vars.\n" +
      "   Add to .env.local:\n" +
      "     SUPABASE_URL=https://loygyzhukfxdztkwfimr.supabase.co\n" +
      "     SUPABASE_SERVICE_ROLE_KEY=<from Supabase dashboard → Project Settings → API>\n" +
      "     OPENAI_API_KEY=sk-..."
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const openai = new OpenAI({ apiKey: OPENAI_KEY });

// ─── Document definitions ─────────────────────────────────────────────────────
// Paths are relative to the marsbot.dev project root (where you run the script)

interface DocSource {
  path: string;
  source: string;        // logical name used as the 'source' column value
  defaultTier: number;   // 1=always-loaded, 2=retrieved, 3=technical deep-dive
  tier1Patterns: string[]; // section headings that get bumped to tier 1
  skipPatterns: string[];  // section headings to skip entirely
}

const DOCUMENTS: DocSource[] = [
  {
    // The clean, structured context doc — primary source for coach Q&A
    path: "../Documents/OpenPeople/OpenPeople-Canvas-Context.md",
    source: "canvas-context",
    defaultTier: 2,
    tier1Patterns: [
      "business in one paragraph",
      "unique value proposition",
      "4 core product insights",
      "core product insights",
      "context window thesis",
      "north star",
      "ai prompts you",
      "vectorization as standard",
      "gamified data growth",
    ],
    skipPatterns: ["for coaches", "how to use this document"],
  },
  {
    // Working lean canvas — section-by-section detail
    path: "../Documents/OpenPeople/lean-canvas-working.md",
    source: "lean-canvas",
    defaultTier: 2,
    tier1Patterns: [],
    skipPatterns: [
      "how to use this doc",
      "status",
      "current",
      "proposed",
    ],
  },
  {
    // open-people spec — for technical architecture questions
    path: "../open-people/CLAUDE.md",
    source: "open-people-spec",
    defaultTier: 3,
    tier1Patterns: [],
    skipPatterns: ["ownership"],
  },
  {
    // mars-hq architecture — for technical deep-dive questions
    path: "../mars-hq/CLAUDE.md",
    source: "mars-hq-architecture",
    defaultTier: 3,
    tier1Patterns: [],
    skipPatterns: ["ownership"],
  },
];

// ─── Chunking ─────────────────────────────────────────────────────────────────

interface Chunk {
  source: string;
  section: string;
  tier: number;
  content: string;
}

function shouldSkip(heading: string, patterns: string[]): boolean {
  const h = heading.toLowerCase().trim();
  return patterns.some((p) => h.includes(p.toLowerCase()));
}

function chunkMarkdown(
  text: string,
  source: string,
  defaultTier: number,
  tier1Patterns: string[],
  skipPatterns: string[]
): Chunk[] {
  const chunks: Chunk[] = [];

  // Split on H2+ headings — each section becomes a candidate chunk
  const sections = text.split(/\n(?=#{1,3} )/);

  for (const raw of sections) {
    const section = raw.trim();
    if (!section || section.length < 60) continue;

    // Extract the first heading line
    const headingMatch = section.match(/^(#{1,3})\s+(.+)$/m);
    const heading = headingMatch ? headingMatch[2].trim() : "Introduction";

    // Skip meta/scaffolding sections
    if (shouldSkip(heading, skipPatterns)) continue;

    // Determine tier
    const isTier1 = tier1Patterns.some((p) =>
      heading.toLowerCase().includes(p.toLowerCase())
    );
    const tier = isTier1 ? 1 : defaultTier;

    // For long sections (>800 words ≈ 3200 chars), split on H3 boundaries
    if (section.length > 3200) {
      const subSections = section.split(/\n(?=### )/);
      for (const sub of subSections) {
        const subTrimmed = sub.trim();
        if (subTrimmed.length < 60) continue;

        const subHeadingMatch = subTrimmed.match(/^#+\s+(.+)$/m);
        const subHeading = subHeadingMatch
          ? subHeadingMatch[1].trim()
          : heading;

        if (shouldSkip(subHeading, skipPatterns)) continue;

        const fullSection =
          subHeading !== heading ? `${heading} — ${subHeading}` : heading;
        const subTier = tier1Patterns.some((p) =>
          subHeading.toLowerCase().includes(p.toLowerCase())
        )
          ? 1
          : tier;

        chunks.push({
          source,
          section: fullSection,
          tier: subTier,
          content: subTrimmed,
        });
      }
    } else {
      chunks.push({ source, section: heading, tier, content: section });
    }
  }

  return chunks;
}

// ─── Embedding ────────────────────────────────────────────────────────────────

async function embedBatch(texts: string[]): Promise<number[][]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: texts,
    dimensions: 1536,
  });
  return response.data
    .sort((a, b) => a.index - b.index)
    .map((d) => d.embedding);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const BATCH_SIZE = 10;

async function main() {
  console.log("🚀 Coach knowledge indexer\n");

  const allChunks: Chunk[] = [];

  // ── Read + chunk all documents ──
  for (const doc of DOCUMENTS) {
    const absPath = resolve(process.cwd(), doc.path);

    if (!existsSync(absPath)) {
      console.warn(`⚠️  Skipping (file not found): ${doc.path}`);
      continue;
    }

    const text = readFileSync(absPath, "utf-8");
    const chunks = chunkMarkdown(
      text,
      doc.source,
      doc.defaultTier,
      doc.tier1Patterns,
      doc.skipPatterns
    );

    const tiers = [...new Set(chunks.map((c) => c.tier))].sort().join(", ");
    console.log(
      `📄 ${doc.source.padEnd(24)} ${String(chunks.length).padStart(3)} chunks  (tiers: ${tiers})`
    );
    allChunks.push(...chunks);
  }

  if (allChunks.length === 0) {
    console.error("\n❌ No chunks found. Check document paths.");
    process.exit(1);
  }

  console.log(`\n📦 Total: ${allChunks.length} chunks`);
  console.log(
    `   Tier 1 (always-loaded):  ${allChunks.filter((c) => c.tier === 1).length}`
  );
  console.log(
    `   Tier 2 (retrieved):      ${allChunks.filter((c) => c.tier === 2).length}`
  );
  console.log(
    `   Tier 3 (technical):      ${allChunks.filter((c) => c.tier === 3).length}`
  );

  // ── Clear existing rows (full re-index) ──
  console.log("\n🗑️  Clearing existing coach_knowledge rows...");
  const { error: deleteError } = await supabase
    .from("coach_knowledge")
    .delete()
    // Delete all rows — this filter always evaluates true
    .gte("created_at", "2000-01-01");

  if (deleteError) {
    console.error("❌ Failed to clear table:", deleteError.message);
    process.exit(1);
  }
  console.log("✅ Table cleared\n");

  // ── Generate embeddings + insert in batches ──
  let processed = 0;

  for (let i = 0; i < allChunks.length; i += BATCH_SIZE) {
    const batch = allChunks.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(allChunks.length / BATCH_SIZE);

    process.stdout.write(
      `⚡ Batch ${String(batchNum).padStart(2)}/${totalBatches}  embedding...`
    );

    // Prepend section heading to the text for better embedding quality
    const texts = batch.map((c) => `${c.section}\n\n${c.content}`);

    let embeddings: number[][];
    try {
      embeddings = await embedBatch(texts);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`\n❌ Embedding failed: ${msg}`);
      process.exit(1);
    }

    const rows = batch.map((chunk, idx) => ({
      source: chunk.source,
      section: chunk.section,
      tier: chunk.tier,
      content: chunk.content,
      token_count: Math.ceil(chunk.content.length / 4),
      // Supabase accepts vector as a JSON array string
      embedding: JSON.stringify(embeddings[idx]),
    }));

    const { error: insertError } = await supabase
      .from("coach_knowledge")
      .insert(rows);

    if (insertError) {
      console.error(`\n❌ Insert failed: ${insertError.message}`);
      process.exit(1);
    }

    processed += batch.length;
    console.log(` inserted  (${processed}/${allChunks.length})`);

    // Small pause to avoid OpenAI rate limits
    if (i + BATCH_SIZE < allChunks.length) {
      await new Promise((r) => setTimeout(r, 250));
    }
  }

  console.log(`\n✅ Done! ${processed} chunks indexed into coach_knowledge.\n`);
  console.log("Next steps:");
  console.log(
    "  1. Add to Vercel environment variables (project settings → Environment Variables):"
  );
  console.log(`       SUPABASE_URL=${SUPABASE_URL}`);
  console.log(
    "       SUPABASE_ANON_KEY=<anon key from Supabase dashboard → Project Settings → API>"
  );
  console.log("       OPENAI_API_KEY=<your key>");
  console.log("       ANTHROPIC_API_KEY=<your key>");
  console.log("  2. Deploy: git push  (Vercel auto-deploys)");
  console.log("  3. Test at: https://marsbot.dev/coach\n");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});

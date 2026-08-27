import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { COPY } from "../src/copy.ts";

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const html = () => readFileSync("dist/index.html", "utf8");

test("index contains locked copy", () => {
  const page = html();
  assert.match(page, new RegExp(escapeRe(COPY.lede)));
  assert.match(page, /mars\.bot/);
  assert.match(page, /marsbase/);
  assert.match(page, /╭·╮/);
  assert.match(page, /class="ember"/);
  assert.match(page, new RegExp(escapeRe(COPY.footer.studio)));
  assert.match(page, new RegExp(escapeRe(COPY.refusal)));
});

test("index is not the waitlist pitch", () => {
  const page = html();
  assert.doesNotMatch(page, /Join waitlist/i);
  assert.doesNotMatch(page, /early access/i);
  assert.doesNotMatch(page, /your data, your agent/i);
  assert.doesNotMatch(page, /client:load/);
  assert.doesNotMatch(page, /HeroInversion/);
});

test("vercel.json 301s retired pages, not APIs", () => {
  const cfg = JSON.parse(readFileSync("vercel.json", "utf8")) as {
    redirects?: { source: string }[];
  };
  const sources = (cfg.redirects ?? []).map((r) => r.source);
  for (const s of [
    "/coach",
    "/ecosystem",
    "/lean-canvas",
    "/docs",
    "/docs/:path*",
  ]) {
    assert.ok(sources.includes(s), `missing redirect ${s}`);
  }
  assert.ok(!sources.includes("/api/waitlist"));
  assert.ok(!sources.includes("/api/chat"));
});

test("retired API files are gone", () => {
  assert.equal(existsSync("api/waitlist.ts"), false);
  assert.equal(existsSync("api/chat.ts"), false);
  assert.equal(existsSync("src/pages/api/chat.ts"), false);
});

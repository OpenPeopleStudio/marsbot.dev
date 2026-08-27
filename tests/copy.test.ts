import assert from "node:assert/strict";
import { test } from "node:test";
import { COPY } from "../src/copy.ts";

test("lede is the locked sentence", () => {
  assert.equal(
    COPY.lede,
    "A sovereign personal AI platform. One plant: phone, desk, gateway.",
  );
});

test("three surfaces", () => {
  assert.equal(COPY.sol.name, "Sol");
  assert.equal(COPY.sol.line, "the phone. Where you go for an answer.");
  assert.equal(COPY.desk.name, "mars.bot");
  assert.equal(COPY.desk.line, "the Mac. Where you decide and do.");
  assert.equal(COPY.gateway.name, "marsbase");
  assert.equal(COPY.gateway.line, "the gateway. Every surface hits this edge.");
});

test("marks", () => {
  assert.equal(COPY.marks.mars, ">");
  assert.equal(COPY.marks.sol, "╭·╮");
  assert.equal(COPY.marks.openPeople, "( · )");
});

test("refusal and layers", () => {
  assert.equal(
    COPY.layers,
    "Open People is the company. Sol is who you talk to. Mars is what you touch.",
  );
  assert.equal(
    COPY.refusal,
    "Not a product you can sign up for. Not a dataset you export. Not on GitHub.",
  );
});

test("footer", () => {
  assert.equal(COPY.wordmark, "Mars");
  assert.equal(COPY.footer.studio, "Open People · est. 2024");
  assert.equal(COPY.footer.copyright, "© 2026 Open People");
  assert.equal(COPY.footer.href, "https://openpeople.ai");
});

test("meta uses lede, not waitlist pitch", () => {
  assert.equal(COPY.title, "Mars");
  assert.equal(COPY.description, COPY.lede);
  assert.doesNotMatch(COPY.description, /waitlist|your data|early access/i);
});

---
date: "2026-02-11"
title: "Core Experience Wiring"
description: "Skills, sandbox, rate limiting, agent display names, and approval flow all wired up and test-covered. The core agent loop is now production-quality."
tag: "integration"
items:
  - "Skills: 22 bundled skills, prompt builder with slot injection, skill registry with search, 16 integration tests"
  - "Sandbox: 5 routable tool categories (shell, file, web, code, data), isolation per execution, 16 tests"
  - "Rate limiter: token bucket algorithm, per-user and per-model limits, burst allowance, 24 tests"
  - "Chat responses: agent display names surfaced in all surfaces (web, TUI, mobile), thread metadata enrichment"
  - "Approval flow: 14 tests covering tool approval request, user decision, timeout, and escalation paths"
---

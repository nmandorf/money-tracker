## Context

This change executes a full mobile MVP delivery plan across nine dependent milestones. The current repository contains a web-first prototype; this plan introduces a React Native (Expo) app with strict quality gates and deterministic financial domain behavior.

## Goals / Non-Goals

**Goals:**
- Ship a local-first Expo MVP with deterministic split/balance/settlement logic.
- Maintain high confidence with strict TypeScript, linting, coverage thresholds, and CI.
- Keep architecture modular: pure domain, repository layer, and UI screens separated.

**Non-Goals:**
- Cloud sync or payment provider integrations.
- Multi-currency settlement in MVP.
- Perfect receipt line-item extraction.

## Decisions

### 1) Milestone-driven architecture
Decision:
- Implement in strict milestone order (01→09) with gated completion and tests per phase.

Rationale:
- Avoids feature coupling and keeps failures localized.

### 2) Domain-first deterministic money core
Decision:
- All money in integer cents, pure functions for split/balance/settlements, deterministic remainder rules by stable memberId ordering.

Rationale:
- Prevents floating-point drift and test flakiness.

### 3) Local-first SQLite repository
Decision:
- Use `expo-sqlite` with explicit migrations and typed repository contracts.

Rationale:
- Meets persistence requirements without backend dependency.

### 4) Policy defaults
Decision:
- Duplicate member names in same group: reject.
- Payer excluded from participants: allow (no implicit mutation).
- Percent precision: 2 decimals; must equal exactly 100.00.
- Percent participant changes: reset percent map and require explicit re-entry.
- Receipt heuristic for multiple totals: choose maximum detected USD-like amount.

Rationale:
- Explicit, deterministic behavior reduces ambiguity and edge-case drift.

## Risks / Trade-offs

- [Scope size across 9 milestones] -> Mitigation: hard phase gates with CI before advancing.
- [Toolchain churn in RN ecosystem] -> Mitigation: pin dependency versions and lockfile policy.
- [OCR instability] -> Mitigation: adapter boundary + mocked CI OCR.
- [Performance regressions with large lists] -> Mitigation: FlatList optimization and perf sanity checks in hardening phase.

## Migration Plan

1. Introduce Expo+TS strict foundation and CI.
2. Implement and verify pure domain modules.
3. Add SQLite schema/migrations and repository.
4. Build UI phases incrementally (groups, expenses, percent, receipts, settle-up).
5. Execute hardening and release checks.

## Open Questions

- Final OCR provider choice for non-mocked production path.
- Exact E2E runner selection in CI vs nightly.

## Context

The change introduces a full group expense-sharing workflow with dual expense input modes (receipt image and manual). There is no existing product code in this repository yet, so design decisions should optimize for a clean first implementation while preserving extensibility for OCR quality improvements, settlement features, and mobile-friendly usage. Core constraints are: support arbitrary group size, keep split math deterministic, and avoid blocking entry when receipt parsing fails.

## Goals / Non-Goals

**Goals:**
- Model groups, members, expenses, and balances in a way that supports unlimited members per group.
- Support expense creation from either manual amount entry or receipt image upload.
- Provide predictable split calculation and group-level net balances that can be recomputed from source data.
- Keep receipt processing resilient by allowing manual correction/override at any time.
- Define API boundaries that separate capture, calculation, and presentation concerns.

**Non-Goals:**
- Automated payment transfer or bank integration.
- Multi-currency conversion in initial version.
- Advanced OCR accuracy guarantees beyond extracting candidate values.
- Audit-grade accounting features (tax handling, reimbursements with external ledgers).

## Decisions

### 1) Domain model with event-source-friendly primitives
Decision:
- Use relational entities: `Group`, `Member`, `Expense`, `ExpenseParticipant`, and derived `BalanceSnapshot` (or computed query view).
- Store expense source metadata (`manual` or `receipt`) and normalized monetary values in integer minor units (for example cents).

Rationale:
- Supports arbitrary member counts and selective participant splits.
- Integer storage avoids floating-point rounding issues.
- Receipt/manual parity simplifies downstream split logic.

Alternative considered:
- Store only aggregate balances and mutate them on each write.
Why not:
- Harder to repair when edits/deletes happen and less transparent for debugging.

### 2) Split engine as deterministic application service
Decision:
- Implement split computation in a dedicated service that accepts an expense + participant set and writes owed shares.
- Aggregate net balances from expense-level owed shares (`member_owes` minus `member_paid`).

Rationale:
- Keeps calculation logic centralized and testable.
- Supports future split strategies (equal, weighted, custom shares) without rewriting persistence.

Alternative considered:
- Compute splits directly in controllers/UI layer.
Why not:
- Increases duplication and risk of inconsistent math.

### 3) Two-phase receipt flow with graceful fallback
Decision:
- On image upload, create an expense draft with `source=receipt` and run asynchronous OCR extraction.
- Expose extracted amount/tax/date as suggestions that users confirm or edit before finalizing.

Rationale:
- Prevents OCR latency from blocking UX.
- Keeps manual correction explicit, improving trust and accuracy.

Alternative considered:
- Synchronous OCR before creating any expense.
Why not:
- Poor UX under slow OCR and higher failure impact.

### 4) API-first boundaries
Decision:
- Define endpoints for:
- Group/member management
- Expense create/update/delete (manual and receipt)
- Balance summary retrieval
- Keep OCR provider behind an internal adapter interface.

Rationale:
- Enables frontends (web/mobile) to share business behavior.
- Adapter abstraction prevents vendor lock-in for OCR.

Alternative considered:
- Tight coupling of OCR SDK in request handlers.
Why not:
- Harder to test and migrate providers.

## Risks / Trade-offs

- [OCR extraction inaccuracies] -> Mitigation: always require user confirmation/edit before expense finalization.
- [Rounding drift in split distribution] -> Mitigation: integer minor units + deterministic remainder assignment rule.
- [Performance degradation for large groups/history] -> Mitigation: indexed participant/expense tables and cached/materialized group balance views.
- [Concurrency conflicts when multiple users edit same expense] -> Mitigation: optimistic locking/version checks on update.
- [Complexity of keeping derived balances in sync] -> Mitigation: treat balances as recomputable projections from immutable expense-share facts.

## Migration Plan

1. Introduce schema/tables for groups, members, expenses, and expense participants.
2. Add manual expense API path and split engine with unit/integration tests.
3. Add receipt upload storage and async OCR worker path.
4. Add balance summary endpoint using computed or cached projections.
5. Enable UI flows for group setup, expense entry, and balances.
6. Rollout strategy: start with manual entry enabled by default, gate OCR behind feature flag.
7. Rollback strategy: disable OCR feature flag and continue manual entry without data loss.

## Open Questions

- Should equal split be the only initial split mode, or should custom shares be included in MVP?
- What maximum image size/format constraints should be enforced for uploads?
- Is member identity anonymous display-name only, or tied to authenticated user accounts in V1?
- Should balances be recomputed on read or incrementally maintained with background reconciliation?

---
task: Deliver the full 9-milestone mobile MVP using OpenSpec change deliver-mobile-mvp-milestones
test_command: "npm test"
---

# Task: Complete Mobile MVP Milestones (01-09)

Execute milestones in order using the OpenSpec change:
`openspec/changes/deliver-mobile-mvp-milestones/`

## Hard Constraints

1. Follow milestone order strictly (01 -> 09).
2. Do not skip failing tests or CI gates.
3. Keep money logic integer-cents only and deterministic.
4. Commit after meaningful completed increments.
5. Update this file as criteria are completed.

## Success Criteria

### Milestone 01: Foundation
- [x] Expo React Native + TypeScript scaffolded
- [x] Strict TypeScript + noImplicitAny
- [x] lint/typecheck/test scripts pass
- [x] CI workflow enforces lint/typecheck/test + coverage

### Milestone 02: Domain
- [x] Pure TS domain modules implemented
- [x] Deterministic equal split + percent split
- [x] Balances + settlements implemented
- [x] Domain coverage >= 90%

### Milestone 03: Persistence
- [x] SQLite schema + migrations implemented
- [x] Typed repository API implemented
- [x] Integration tests for repository pass

### Milestone 04: Groups UI
- [x] Group/member screens + navigation implemented
- [x] Duplicate member names rejected per group
- [x] E2E persistence flow exists

### Milestone 05: Manual Expenses
- [ ] Manual expense form + validation implemented
- [ ] Expenses persist and balances update
- [ ] E2E manual expense scenario passes

### Milestone 06: Percent Split
- [ ] Percent split UI + exact 100.00% gating
- [ ] Percent allocations persist and compute correctly
- [ ] E2E percent scenario passes

### Milestone 07: Receipts
- [ ] Receipt picker/camera + storage implemented
- [ ] OCR adapter + parser heuristics implemented
- [ ] Prefill remains editable; manual fallback always available

### Milestone 08: Settle Up
- [ ] Settle-up screen implemented from computed settlements
- [ ] Empty/all-settled states implemented
- [ ] Deterministic transfer tests pass

### Milestone 09: Hardening & Release
- [ ] Accessibility pass complete
- [ ] Error/loading states across async flows
- [ ] Performance checks for large lists
- [ ] Coverage and CI release gates enforced

## Completion Rule
- When all criteria are [x], output: `<ralph>COMPLETE</ralph>`
- If blocked after repeated retries, output: `<ralph>GUTTER</ralph>` with reason

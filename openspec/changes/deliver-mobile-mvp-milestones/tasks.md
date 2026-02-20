## 1. Foundation (01)
- [x] 1.1 Scaffold Expo + TypeScript app with strict tsconfig and noImplicitAny.
- [x] 1.2 Configure ESLint + Prettier with non-conflicting rules.
- [x] 1.3 Add Jest + RN testing libraries and baseline passing tests.
- [x] 1.4 Add CI workflow for lint/typecheck/test with coverage output.

## 2. Domain Core (02)
- [x] 2.1 Implement money utilities in pure TS (integer cents only).
- [x] 2.2 Implement deterministic equal split with remainder handling.
- [x] 2.3 Implement strict percent split validation and allocations.
- [x] 2.4 Implement balance and settlement pure functions.
- [x] 2.5 Add domain unit tests with >=90% coverage for domain modules.

## 3. Persistence (03)
- [x] 3.1 Add expo-sqlite initialization and migration versioning.
- [x] 3.2 Implement typed repository methods and typed validation errors.
- [x] 3.3 Add integration tests for CRUD and relation constraints.
- [x] 3.4 Add dev-only DB reset utility.

## 4. Groups & Members UI (04)
- [x] 4.1 Add navigation stack and group/member screens.
- [x] 4.2 Implement create group/member forms with validation and duplicate-name rejection.
- [x] 4.3 Wire screens to repository and add component tests.
- [x] 4.4 Add E2E persistence flow test.

## 5. Manual Expenses (05)
- [ ] 5.1 Add expense list and balance summary sections to group detail.
- [ ] 5.2 Implement manual add-expense form with validations.
- [ ] 5.3 Persist expenses + participants and recompute balances.
- [ ] 5.4 Add component + E2E tests for manual expense flow.

## 6. Percent Split (06)
- [ ] 6.1 Add split method selector and percent editor UI.
- [ ] 6.2 Enforce exact 100.00% validation and submit gating.
- [ ] 6.3 Persist participant percent data and render split metadata.
- [ ] 6.4 Add tests for percent validation and balance outcomes.

## 7. Receipts (07)
- [ ] 7.1 Add image picker/camera flow and receipt persistence.
- [ ] 7.2 Implement OCR adapter interface and mockable implementation.
- [ ] 7.3 Implement parser heuristics and editable prefill.
- [ ] 7.4 Add parser/unit/component/E2E tests with mocked OCR.

## 8. Settle Up (08)
- [ ] 8.1 Add Settle Up screen route from group detail.
- [ ] 8.2 Render computed transfers and empty/all-settled states.
- [ ] 8.3 Add unit/component/E2E settlement tests.

## 9. Hardening & Release (09)
- [ ] 9.1 Add loading/error states and centralized error boundary/logging.
- [ ] 9.2 Complete accessibility pass (labels + touch targets).
- [ ] 9.3 Optimize long-list performance and memoization.
- [ ] 9.4 Enforce final CI coverage thresholds and build checks.
- [ ] 9.5 Add dev seed-data toggle and release readiness checklist.

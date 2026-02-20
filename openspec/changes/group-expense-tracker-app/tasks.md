## 1. Project Setup and Data Model

- [x] 1.1 Initialize app skeleton, environment config, and core dependency setup for API, storage, and file upload handling.
- [x] 1.2 Define and migrate database schema for groups, members, expenses, expense participants, and derived balance data.
- [x] 1.3 Add shared money utilities for integer minor-unit storage, validation, and deterministic rounding behavior.

## 2. Group and Member Management

- [x] 2.1 Implement group creation and update endpoints with request validation.
- [x] 2.2 Implement member add/remove endpoints with active/inactive state handling and historical-reference preservation.
- [x] 2.3 Add tests for unlimited member handling and member lifecycle edge cases.

## 3. Expense Capture (Manual and Receipt)

- [x] 3.1 Implement manual expense create/update/delete endpoints with payer and participant validation.
- [x] 3.2 Implement receipt image upload flow that creates draft expenses and persists image references.
- [x] 3.3 Implement OCR adapter interface and async processing pipeline for receipt suggestion extraction.
- [x] 3.4 Implement finalize/edit flow for receipt drafts that supports full manual override.
- [x] 3.5 Add validation and error handling for invalid amounts, unsupported files, and OCR failures.

## 4. Split and Balance Engine

- [x] 4.1 Implement split-calculation service for equal splits across selected participants.
- [x] 4.2 Implement deterministic remainder distribution so totals reconcile exactly.
- [x] 4.3 Implement balance projection logic for member net positions and bilateral owed relationships.
- [x] 4.4 Recompute affected balances on expense edits/deletions and participant-set changes.
- [x] 4.5 Add unit tests for split math, rounding edge cases, and recomputation paths.

## 5. API and UX Surface

- [x] 5.1 Implement balance summary endpoint that excludes unfinalized receipt drafts.
- [x] 5.2 Build UI/API integration for group management, manual expense entry, receipt upload, and balance views.
- [x] 5.3 Add optimistic concurrency/version checks on mutable expense updates.
- [x] 5.4 Add feature flag control for OCR to support gradual rollout and quick disable.

## 6. Quality, Rollout, and Operations

- [x] 6.1 Add integration tests covering end-to-end flow from group creation through settlement summary.
- [x] 6.2 Add performance checks for larger groups and expense histories, including index verification.
- [x] 6.3 Add observability for upload processing, OCR success/failure, and calculation errors.
- [x] 6.4 Document deployment and rollback steps, including OCR-off fallback behavior.

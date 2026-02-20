## Why

The project needs a complete, test-driven path from scaffolding to release-ready MVP for group expense tracking. Consolidating the nine milestone plans into one orchestrated change ensures execution order, quality gates, and dependencies are explicit.

## What Changes

- Deliver milestone-based implementation from foundation setup through release hardening.
- Define deterministic domain logic, local-first persistence, and core group/expense UI flows.
- Add percent split, receipt-assisted expense prefill, and settle-up transfer views.
- Enforce strict testing and CI quality thresholds across unit, component, integration, and E2E levels.

## Capabilities

### New Capabilities
- `foundation-quality-gates`: Expo + TypeScript strict setup, lint/typecheck/test/CI/coverage gates.
- `domain-calculations`: Pure deterministic money, split, balance, and settlement modules with high coverage.
- `persistence-repository`: Local SQLite migrations and typed repository API.
- `groups-members-ui`: Navigation and group/member creation flows backed by repository.
- `manual-expenses`: Manual expense entry and live balance display.
- `percent-split`: Strict percent split editor and validated allocation logic.
- `receipts-ocr`: Receipt image intake with OCR adapter and editable prefill.
- `settle-up`: Transfer list screen derived from balances and settlements.
- `hardening-release`: Accessibility, error handling, performance tuning, CI strictness, and release readiness.

### Modified Capabilities
- None.

## Impact

- Affected code: entire app architecture (domain, persistence, UI, test, CI).
- APIs: internal repository contracts and domain interfaces evolve.
- Dependencies/systems: Expo toolchain, SQLite, React Navigation, testing stack, OCR adapter boundary, CI workflows.

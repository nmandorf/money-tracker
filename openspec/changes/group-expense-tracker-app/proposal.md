## Why

People splitting shared costs in trips, households, or events often track expenses in scattered chats and notes, which causes confusion and disputes. A dedicated shared tracker is needed now to let groups quickly record expenses and calculate fair splits from either receipt images or manual entry.

## What Changes

- Add support for creating an expense-sharing group and adding any number of participants.
- Add expense capture through two input modes: receipt image upload and manual amount entry.
- Add per-expense assignment metadata (payer, participants included in split, amount, note/date).
- Add split calculation logic that divides costs across selected participants and maintains running balances.
- Add group-level balance views showing who owes whom and net amounts per member.

## Capabilities

### New Capabilities

- `group-member-management`: Create groups, invite/add members, and manage active participant lists with no hard member cap.
- `expense-capture`: Record expenses through receipt image upload or manual amount input, with validation and storage of expense details.
- `expense-split-calculation`: Compute per-member owed amounts for each expense and aggregate net balances across the group.
- `group-balance-summary`: Present current balances and settlement-oriented summaries for all group members.

### Modified Capabilities

- None.

## Impact

- Affected code: new domain models for groups, members, expenses, and balances; new UI/API flows for expense entry and group views.
- APIs: endpoints for group lifecycle, expense creation (manual and image-based), and balance retrieval.
- Dependencies/systems: image upload/storage pipeline; optional OCR integration for extracting amounts from receipts; validation rules for fallback to manual correction.

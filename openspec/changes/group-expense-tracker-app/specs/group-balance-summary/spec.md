## ADDED Requirements

### Requirement: Provide group-level balance summary
The system SHALL provide a current balance summary for a group that includes each member's net payable or receivable amount.

#### Scenario: Retrieve group balances
- **WHEN** a user requests balances for a group with finalized expenses
- **THEN** the system returns each member's net position derived from current expense data

### Requirement: Show bilateral owed relationships
The system SHALL expose settlement-oriented owed relationships indicating who owes whom and for what amount.

#### Scenario: Member owes another member
- **WHEN** netted expense shares indicate one member owes another
- **THEN** the system returns a bilateral owed entry linking debtor, creditor, and amount

### Requirement: Reflect only finalized expense data
The system SHALL exclude unfinalized receipt drafts from balance summaries until they are finalized.

#### Scenario: Draft receipt exists
- **WHEN** a receipt-based expense remains in draft state
- **THEN** the system omits that draft from net and bilateral balance calculations

### Requirement: Keep balance responses consistent with latest state
The system SHALL ensure balance summaries reflect the latest committed expense and membership changes.

#### Scenario: Recent expense deletion
- **WHEN** a finalized expense is deleted
- **THEN** the next balance summary response reflects recalculated totals without the deleted expense

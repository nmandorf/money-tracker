## ADDED Requirements

### Requirement: Manual expense entry and balance updates
The system SHALL allow manual expense creation and display updated per-member balances.

#### Scenario: Valid manual expense
- **WHEN** amount, payer, and participant constraints are satisfied
- **THEN** expense is persisted and balances update using domain logic

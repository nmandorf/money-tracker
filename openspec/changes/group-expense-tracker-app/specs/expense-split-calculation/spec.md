## ADDED Requirements

### Requirement: Calculate equal shares across selected participants
The system SHALL divide each finalized expense amount equally across the selected participant set for that expense.

#### Scenario: Equal split for subset of group
- **WHEN** a finalized expense includes a subset of group members as participants
- **THEN** the system computes shares only for those selected participants

### Requirement: Maintain deterministic rounding behavior
The system SHALL calculate splits using integer minor currency units and SHALL apply a deterministic remainder assignment rule so totals always reconcile to the original expense amount.

#### Scenario: Amount not evenly divisible
- **WHEN** an expense amount cannot be divided evenly among participants
- **THEN** the system assigns remainder units deterministically and preserves exact total reconciliation

### Requirement: Compute member net balances from expenses
The system SHALL derive each member's net position from all finalized expenses by subtracting owed shares from amounts paid.

#### Scenario: Member paid for group expense
- **WHEN** a member pays an expense that includes other participants
- **THEN** the system increases the payer's net receivable and increases participant payables according to computed shares

### Requirement: Recompute balances after expense changes
The system SHALL recalculate affected balances when an expense is edited, deleted, or participant membership for that expense changes.

#### Scenario: Expense amount updated
- **WHEN** an existing finalized expense amount is changed
- **THEN** the system updates all affected owed shares and net balances using the latest expense data

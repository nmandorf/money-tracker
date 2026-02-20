## ADDED Requirements

### Requirement: Deterministic pure domain calculations
The system SHALL compute equal splits, percent splits, balances, and settlements using pure TypeScript functions and integer cents.

#### Scenario: Deterministic uneven split
- **WHEN** a split requires remainder allocation
- **THEN** the system assigns remainder cents deterministically by stable member ordering

#### Scenario: Settlement correctness
- **WHEN** balances are non-zero
- **THEN** settlement transfers fully net balances to zero within cents

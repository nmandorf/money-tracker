## ADDED Requirements

### Requirement: Local-first typed repository persistence
The system SHALL persist groups, members, expenses, participants, and receipts in local SQLite through typed repository APIs.

#### Scenario: Restart persistence
- **WHEN** app data is created and the app restarts
- **THEN** entities are available through repository list/read methods

#### Scenario: Referential validation
- **WHEN** an expense references invalid payer/participant IDs
- **THEN** repository operations fail with typed validation errors

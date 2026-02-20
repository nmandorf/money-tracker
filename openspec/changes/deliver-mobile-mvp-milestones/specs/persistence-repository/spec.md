## ADDED Requirements

### Requirement: Local-first typed repository persistence
The system SHALL persist groups, members, expenses, participants, and receipts in local SQLite through typed repository APIs.

#### Scenario: Restart persistence
- **WHEN** app data is created and the app restarts
- **THEN** entities are available through repository list/read methods

#### Scenario: Referential validation
- **WHEN** an expense references invalid payer/participant IDs
- **THEN** repository operations fail with typed validation errors

### Requirement: Versioned SQLite schema and migration safety
The system SHALL initialize SQLite with explicit schema versioning and deterministic migration steps.

#### Scenario: Schema bootstrap
- **WHEN** the app starts on a clean install
- **THEN** required tables for groups, members, expenses, expense participants, and receipts are created

#### Scenario: Migration upgrade path
- **WHEN** the app starts with an older schema version
- **THEN** migrations run in order and preserve existing user data

### Requirement: Repository contract completeness
The repository layer SHALL expose `createGroup`, `listGroups`, `addMember`, `listMembers`, `addExpense`, `listExpenses`, and `saveReceipt`.

#### Scenario: Contract method behavior
- **WHEN** repository methods are invoked with valid inputs
- **THEN** each method performs its expected create/list behavior and returns typed results

### Requirement: Repository integration test coverage
The system SHALL include integration tests that verify CRUD and relation constraints against a real local SQLite database.

#### Scenario: CRUD integration flow
- **WHEN** integration tests create groups, members, expenses, participants, and receipts
- **THEN** read operations return persisted records with valid foreign-key relationships

### Requirement: Duplicate member policy in persistence
The system SHALL reject duplicate member names within the same group.

#### Scenario: Duplicate member insert
- **WHEN** a member is added with a name that already exists in the target group
- **THEN** the repository returns a typed validation error and does not persist the duplicate

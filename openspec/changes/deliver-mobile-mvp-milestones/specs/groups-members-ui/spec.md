## ADDED Requirements

### Requirement: Group and member management UI
The system SHALL provide screens to create and list groups and add members per group.

#### Scenario: Create group and members
- **WHEN** a user creates a group and adds members
- **THEN** data is validated, persisted, and visible on relaunch

#### Scenario: Duplicate member rejection
- **WHEN** a user attempts to add a duplicate member name in the same group
- **THEN** the system rejects the submission with a clear error

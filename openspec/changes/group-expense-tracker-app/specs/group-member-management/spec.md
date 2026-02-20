## ADDED Requirements

### Requirement: Create and manage expense groups
The system SHALL allow a user to create an expense group and update the group name and metadata.

#### Scenario: Create group
- **WHEN** a user submits a valid group name
- **THEN** the system creates a new group and returns its identifier

### Requirement: Add and remove group members without a fixed cap
The system SHALL allow adding and removing members from a group, and SHALL NOT enforce a hard-coded maximum number of members.

#### Scenario: Add member to group
- **WHEN** a user adds a member with a valid display name or identity reference
- **THEN** the system stores the member as active in the target group

#### Scenario: Remove active member from group
- **WHEN** a user removes a member who is active in the group
- **THEN** the system marks the member inactive for future expense participation

### Requirement: Preserve member references for historical expenses
The system SHALL preserve historical expense links to members even if those members are later removed from active participation.

#### Scenario: Removed member has historical expenses
- **WHEN** a member with existing expense history is removed from a group
- **THEN** the system keeps historical expense records intact and attributable

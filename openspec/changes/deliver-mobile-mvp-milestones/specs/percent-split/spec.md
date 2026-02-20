## ADDED Requirements

### Requirement: Strict percent split support
The system SHALL support percent split mode with exact 100.00% validation and deterministic cent allocations.

#### Scenario: Invalid percent total
- **WHEN** percent inputs do not equal exactly 100.00
- **THEN** save is blocked and validation feedback is shown

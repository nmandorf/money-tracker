## ADDED Requirements

### Requirement: User can select theme mode
The system SHALL provide a theme mode control that allows selecting `light`, `dark`, or `system`.

#### Scenario: User selects dark mode
- **WHEN** a user selects `dark` from the theme mode control
- **THEN** the interface applies dark theme styling immediately

#### Scenario: User selects light mode
- **WHEN** a user selects `light` from the theme mode control
- **THEN** the interface applies light theme styling immediately

#### Scenario: User selects system mode
- **WHEN** a user selects `system` from the theme mode control
- **THEN** the interface applies the current OS color-scheme preference

## ADDED Requirements

### Requirement: Persist explicit user theme preference
The system SHALL persist explicit theme mode selections so they are restored after page reload.

#### Scenario: Reload after selecting dark mode
- **WHEN** a user selects `dark` and reloads the page
- **THEN** the interface restores and applies `dark` mode on initialization

### Requirement: Fall back to system mode when no preference exists
The system SHALL default to `system` behavior when no saved theme preference is present.

#### Scenario: First visit with no saved preference
- **WHEN** a user opens the app without a stored theme preference
- **THEN** the interface resolves and applies the OS color-scheme preference

### Requirement: Handle unavailable storage gracefully
The system SHALL continue rendering with a valid theme even if browser storage is unavailable.

#### Scenario: Storage access fails
- **WHEN** reading or writing theme preference storage throws an error
- **THEN** the app keeps functioning and applies a runtime theme without crashing

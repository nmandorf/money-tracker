## ADDED Requirements

### Requirement: Core UI renders in both light and dark themes
The system SHALL render all primary UI surfaces (page background, cards, text, controls, and code blocks/output panes) with theme-appropriate tokens for both light and dark modes.

#### Scenario: Switch from light to dark
- **WHEN** the active theme changes from light to dark
- **THEN** all primary UI surfaces update to dark tokens without requiring page reload

### Requirement: Maintain readable contrast across themes
The system SHALL use color token values that preserve readable foreground/background contrast in both themes.

#### Scenario: Themed text remains readable
- **WHEN** a user views headings, body text, and muted text in either theme
- **THEN** text remains clearly legible against the active background and card colors

### Requirement: System mode responds to OS theme changes
The system SHALL react to OS `prefers-color-scheme` changes while user mode is `system`.

#### Scenario: OS changes to dark while app is open
- **WHEN** OS color-scheme changes to dark and user mode is `system`
- **THEN** the app updates active theme to dark without user refresh

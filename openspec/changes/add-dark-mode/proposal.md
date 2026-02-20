## Why

The app currently renders only a light theme, which is uncomfortable in low-light environments and less accessible for users with light sensitivity. Adding dark mode now improves usability and aligns the interface with common user expectations across modern apps.

## What Changes

- Add a user-selectable dark theme for the web UI.
- Add a theme toggle control in the interface to switch between light and dark.
- Add persisted theme preference so user choice survives page reloads.
- Add system-theme fallback behavior when no explicit user preference is set.
- Update UI color tokens and component styles to support both themes consistently.

## Capabilities

### New Capabilities

- `theme-mode-selection`: Support selecting light, dark, or system theme mode from the UI.
- `theme-preference-persistence`: Persist and restore user theme preference across sessions.
- `dual-theme-rendering`: Render all primary UI surfaces with accessible colors in both light and dark themes.

### Modified Capabilities

- None.

## Impact

- Affected code: frontend page styling in `public/index.html` and any shared theme token definitions.
- APIs: no backend API contract changes required.
- Dependencies/systems: browser storage (`localStorage`) and CSS media query handling for `prefers-color-scheme`.

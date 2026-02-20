## Context

The current UI in `public/index.html` defines a single light color palette in CSS variables with no theme switching. The change introduces dark mode without backend contract changes, so implementation is fully client-side and must preserve readability, contrast, and current interactions.

## Goals / Non-Goals

**Goals:**
- Add a theme mode selector with `light`, `dark`, and `system` options.
- Persist explicit user preference so reloads keep the chosen theme.
- Apply theme changes through centralized CSS tokens rather than per-element overrides.
- Respect OS-level `prefers-color-scheme` when mode is `system`.

**Non-Goals:**
- Server-side user profile storage for theme preference.
- Full design overhaul of layout/typography.
- Multi-theme customization beyond light/dark/system for this change.

## Decisions

### 1) Use `data-theme` on `<html>` and tokenized CSS variables
Decision:
- Define light and dark token sets in CSS.
- Apply active theme by toggling `document.documentElement.dataset.theme`.

Rationale:
- Keeps style changes centralized and minimizes regression risk.
- Scales as more components are added.

Alternative considered:
- Toggling per-element classes.
Why not:
- Harder to maintain and easier to miss components.

### 2) Persist mode in `localStorage` with `system` fallback
Decision:
- Store selected mode as `theme-mode` in `localStorage`.
- If no stored mode, default to `system`.
- Resolve actual applied theme based on `matchMedia('(prefers-color-scheme: dark)')`.

Rationale:
- Matches user expectations and works offline with no backend.

Alternative considered:
- Persist only explicit `light`/`dark` and ignore system.
Why not:
- Less user-friendly and ignores platform settings.

### 3) React to system theme changes while in `system` mode
Decision:
- Attach a media query listener and re-apply theme when OS preference changes, only when mode is `system`.

Rationale:
- Keeps UI consistent with real-time OS appearance changes.

Alternative considered:
- Resolve system theme only on initial load.
Why not:
- Produces stale theme during long sessions.

## Risks / Trade-offs

- [Insufficient contrast in one theme] -> Mitigation: update tokens with minimum readable contrast and test key views manually.
- [Flash of incorrect theme on first paint] -> Mitigation: apply theme class immediately during initial script execution.
- [Storage unavailability in strict privacy contexts] -> Mitigation: fall back to in-memory/system behavior if `localStorage` access fails.
- [Theme state drift in future UI additions] -> Mitigation: require new styles to use shared tokens only.

## Migration Plan

1. Add dark-mode token set and theme root selectors in CSS.
2. Add a theme mode control to the page header/controls section.
3. Implement client-side theme initialization, persistence, and system listener logic.
4. Verify major UI sections in light and dark mode on desktop and mobile widths.
5. Rollback: remove theme toggle logic and keep light tokens as default.

## Open Questions

- Should initial default be `system` or explicit `light` for first-time users?
- Do we need a visible icon-only toggle in addition to a select control?
- Should theme preference be namespaced for future multi-page apps?

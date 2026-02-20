## 1. Theme Foundations

- [x] 1.1 Define light and dark design tokens in `public/index.html` CSS variables.
- [x] 1.2 Add root-level theme selector mechanism using `data-theme` on `<html>`.
- [x] 1.3 Verify baseline UI sections (cards, text, buttons, output panel) consume shared tokens only.

## 2. Theme Mode Behavior

- [x] 2.1 Add a UI control for theme mode with `light`, `dark`, and `system` options.
- [x] 2.2 Implement theme initialization logic that defaults to `system` when no preference exists.
- [x] 2.3 Persist explicit user mode in `localStorage` and restore on page load.
- [x] 2.4 Implement `prefers-color-scheme` listener updates while mode is `system`.
- [x] 2.5 Add safe fallback behavior when storage access fails.

## 3. Validation and Documentation

- [x] 3.1 Test light/dark/system flows across page reload and runtime mode switches.
- [x] 3.2 Verify readable contrast for primary text and controls in both themes.
- [x] 3.3 Update README or UI usage notes to mention theme toggle behavior.

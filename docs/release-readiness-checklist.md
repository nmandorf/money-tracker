# Release Readiness Checklist

## Functional

- [ ] Groups can be created, listed, and persisted.
- [ ] Members can be added and duplicate names are rejected per group.
- [ ] Manual expenses save and update balances.
- [ ] Percent split requires exactly 100.00% and persists metadata.
- [ ] Receipt prefill works and remains editable.
- [ ] Settle Up renders deterministic transfers and all-settled state.

## Reliability

- [ ] App-level errors are caught by the global error boundary.
- [ ] Async loading/error states are visible on major screens.
- [ ] SQLite migrations complete from prior schema versions.

## Quality Gates

- [ ] `npm run lint` passes.
- [ ] `npm run typecheck` passes.
- [ ] `npm test` passes with required coverage thresholds.

## Accessibility & Performance

- [ ] Interactive elements include accessibility labels.
- [ ] Core tap targets are at least 44px high.
- [ ] FlatList-backed screens use virtualization options.

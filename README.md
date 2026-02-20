# Money Tracker

A lightweight group expense tracker API with:

- Group/member management with no hard member cap
- Manual and receipt-draft expense capture
- Deterministic split math in minor currency units
- Balance summaries and bilateral settlement suggestions
- Optimistic concurrency checks for mutable expense updates

## Run

```bash
npm start
```

## Test

```bash
npm test
```

## UI Notes

- Open `http://localhost:3000/app` to use the demo UI.
- Theme selector supports `System`, `Light`, and `Dark` modes.
- Explicit theme choice is saved in browser storage and restored on reload.

## Key Endpoints

- `POST /groups`
- `PATCH /groups/:groupId`
- `POST /groups/:groupId/members`
- `DELETE /groups/:groupId/members/:memberId`
- `POST /groups/:groupId/expenses/manual`
- `POST /groups/:groupId/expenses/receipt`
- `PATCH /groups/:groupId/expenses/:expenseId/finalize`
- `PATCH /groups/:groupId/expenses/:expenseId`
- `DELETE /groups/:groupId/expenses/:expenseId`
- `GET /groups/:groupId/balances`
- `GET /health`

# Deployment and Rollback

## Deploy

1. Set environment values (`PORT`, `OCR_ENABLED`, `MAX_RECEIPT_BYTES`).
2. Start service with `npm start`.
3. Verify readiness via `GET /health`.
4. Run tests in CI: `npm test`.
5. Release API with OCR initially enabled for pilot groups.

## Rollback

1. Set `OCR_ENABLED=0` and redeploy to disable OCR while preserving manual entry.
2. If broader rollback is needed, redeploy previous build artifact.
3. Validate `GET /health` and create a manual expense smoke test.
4. Confirm balances endpoint still computes from finalized manual expenses.

## Operational Notes

- Track `/health` metrics for `ocr.succeeded`, `ocr.failed`, and `errors.internal`.
- Draft receipt expenses do not affect balances until finalized.
- Version conflicts (`409`) indicate concurrent updates and should be retried with latest version.

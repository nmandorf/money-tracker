## ADDED Requirements

### Requirement: Receipt-assisted manual entry
The system SHALL allow receipt image attachment, OCR text extraction via adapter, and editable prefill of expense fields.

#### Scenario: OCR failure fallback
- **WHEN** OCR fails or returns empty content
- **THEN** manual expense entry remains fully available without blocking save

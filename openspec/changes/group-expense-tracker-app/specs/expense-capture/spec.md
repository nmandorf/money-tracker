## ADDED Requirements

### Requirement: Record manual expenses
The system SHALL allow users to create an expense by entering amount manually, selecting payer, selecting participating members, and optionally adding notes and date.

#### Scenario: Manual expense creation succeeds
- **WHEN** a user submits a manual expense with valid amount, payer, and participant set
- **THEN** the system stores the expense and marks it finalized

### Requirement: Record receipt-based expenses
The system SHALL allow users to upload a receipt image to create an expense draft linked to the group and payer.

#### Scenario: Receipt upload creates draft
- **WHEN** a user uploads a supported receipt image with required metadata
- **THEN** the system creates a receipt-sourced expense draft and stores the image reference

### Requirement: Support OCR suggestions with user override
The system SHALL extract candidate values from receipt images when processing is available, and SHALL allow users to edit or replace extracted values before finalizing the expense.

#### Scenario: OCR returns candidate amount
- **WHEN** OCR processing returns candidate amount fields for a receipt draft
- **THEN** the system presents the candidates for user confirmation or correction

#### Scenario: OCR unavailable or fails
- **WHEN** OCR processing is unavailable or extraction fails
- **THEN** the system still allows the user to finalize the expense via manual values

### Requirement: Validate monetary and participant inputs
The system SHALL reject expense submissions with invalid monetary values, missing payer, or empty participant sets.

#### Scenario: Invalid expense payload
- **WHEN** a user submits an expense with non-positive amount or no participants
- **THEN** the system returns a validation error and does not persist a finalized expense

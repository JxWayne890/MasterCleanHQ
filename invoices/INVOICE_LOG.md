# Invoice Log — Master Commercial Clean

This file tracks every invoice created so the next invoice number can increment correctly.

**ALWAYS read this file before creating a new invoice. ALWAYS append a new row after creating one.**

## Numbering convention
- Format: `{CLIENT-CODE}-INV-{###}`
- Per-client sequence (each client has its own counter starting at 001).
- If the client is brand new, assign a short uppercase client code (e.g. Veribest High School → `VBHS`) and start at `001`.

## Ledger

| Invoice #    | Date       | Client               | Facility              | Service             | Amount  | File |
|--------------|------------|----------------------|-----------------------|---------------------|---------|------|
| VBHS-INV-001 | 2026-04-22 | Veribest High School | Field House           | One-Time Deep Clean | $500.00 | [MasterClean_Invoice_VBHS-INV-001.pdf](MasterClean_Invoice_VBHS-INV-001.pdf) |
| VBHS-INV-002 | 2026-05-12 | Veribest ISD         | Agriculture Classroom | One-Time Deep Clean | $400.00 | [MasterClean_Invoice_VBHS-INV-002.pdf](MasterClean_Invoice_VBHS-INV-002.pdf) |

## Next invoice numbers (per client)
- **Veribest High School / Veribest ISD (VBHS):** next = `VBHS-INV-003`

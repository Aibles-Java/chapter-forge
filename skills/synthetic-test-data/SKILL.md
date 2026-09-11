---
name: synthetic-test-data
description: How to create synthetic/masked test data for banking — NEVER using real card data/PII (PCI requirement). Use when building test data in P3/P5.
---

# Synthetic / Masked Test Data — Banking

**Non-negotiable boundary:** non-prod and AI context must **never** contain real card data/PII (PCI-DSS + the SDLC data rule). The guardrail will block sensitive files/content.

## Principles
- **Synthetic** (freshly generated) is preferred over **masked** (obscuring real data) — the safest option is never exporting real data out of prod.
- Keep **format validity** so tests are meaningful (Luhn-valid test PANs, correctly shaped phone numbers, valid dates).

## Card data (test)
- Use the card networks' **official test PANs** (test BINs), NEVER real card numbers.
- **Never** generate/store a real CVV; the test CVV is a fixed dummy value.
- Display masked (`**** **** **** 1234`) everywhere.

## PII (test)
- Generate fake names/addresses/emails/phones (faker). Do not reuse real customer data, even "partially masked".
- If masking from prod is unavoidable: consistent tokenization/pseudonymization, remove direct identifiers, with approval.

## How to do it
- Use a faker library (Java: Datafaker; Kotlin/TS similar) to generate the dataset.
- Fixed seed for repeatable (deterministic) tests, but ensure no collision with real data.
- Store fixtures in the test repo (they pass the guardrail — they are not secret files).

## Check before committing / feeding into AI
- No real PANs (scan Luhn + real BINs), no CVV, no real PII, no secrets.
- Delegate to `test-engineer` to generate and `security-reviewer` to review.

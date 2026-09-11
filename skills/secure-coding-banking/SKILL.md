---
name: secure-coding-banking
description: Secure code patterns for banking in Java/Spring Boot & Kotlin — input validation, parameterized queries, encryption, secret management, no PII logging. Use when writing/reviewing code in P4.
---

# Secure Coding — Banking (Java/Spring Boot · Kotlin)

Applied in **P4 — Development**; the standard that `code-reviewer`/`security-reviewer` check against.

## Input validation (every boundary)
- Validate at controller/DTO: Bean Validation (`@NotNull`, `@Pattern`, `@Positive`...). Do not trust external data.
- Reject early, with clear error messages that **do not expose internal details**.

## SQL injection prevention
- **Always** use parameterized queries / JPA binding. NEVER concatenate SQL strings.
- Kotlin Exposed / JPA repositories instead of raw strings.

## Secrets & keys
- NO hardcoding. Use env / Spring `@ConfigurationProperties` + secret manager / Vault.
- Keys via KMS/HSM. Do not commit `.env`, `*.pem`, keystores (the guardrail blocks these).

## No logging of sensitive data
- NEVER log PAN/CVV/PII/tokens. Mask before logging (e.g. `****1234`).
- Beware entity `toString()` containing PII; override it to exclude sensitive fields.

## Encryption
- In-transit: TLS 1.2+. At-rest: encrypt sensitive columns / tokenize card data.
- Do not store CVV (PCI). Card number: tokenize/encrypt, display masked.

## Concurrency & money
- Money transactions: idempotency key, appropriate optimistic/pessimistic locking, avoid races.
- Immutability: create new objects instead of mutating; reduce hidden side effects.

## Error handling
- Handle errors explicitly at each layer; never swallow errors silently; log context server-side, friendly messages on the UI.

## Testing
- TDD, coverage ≥ 80%; test error and boundary paths too; synthetic data (skill `synthetic-test-data`).

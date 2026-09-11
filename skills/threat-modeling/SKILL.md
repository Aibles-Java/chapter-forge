---
name: threat-modeling
description: STRIDE method applied to banking systems (auth, payment, PII) with concrete examples. Use when modeling threats for a feature/flow in the design phase (P2).
---

# Threat Modeling (STRIDE) for banking

Applied in **P2 — Design**, contributing evidence for **Gate G1**. The approver is Security/Architect.

## 4-step process
1. **Build the data flow**: actor → trust boundary → process → data store. Describe as text/mermaid.
2. **Apply STRIDE** to each element crossing a boundary.
3. **Assess** likelihood × impact → severity.
4. **Mitigation** + status (planned/done) → trace back to the ADR/story.

## STRIDE ↔ banking examples

| Threat | banking example | Typical mitigation |
|--------|----------------|--------------------|
| **Spoofing** | Forged token/session on the accounts API | mTLS, signed JWT + short TTL, MFA for sensitive actions |
| **Tampering** | Altering the amount in a transfer request | signed messages, server-side validation, idempotency key |
| **Repudiation** | Denying that a transaction was made | immutable audit log (PCI Req.10), non-repudiation |
| **Information disclosure** | Leaking PAN/PII via logs/responses | masking/tokenization, no logging of sensitive data, encryption |
| **Denial of service** | Spamming the onboarding/OTP endpoint | rate limiting, quotas, circuit breaker |
| **Elevation of privilege** | A regular user calling an admin API | strict RBAC, authz check per request, SoD |

## Priority areas in the chapter
Authentication & authorization · money-transfer flows (transfer-payments) · onboarding/KYC (PII) · feature flags affecting money flows · card-data access (PCI scope).

## Output
A table: component · STRIDE threat · severity · mitigation · status. Delegate to the `threat-modeler` agent to build it.

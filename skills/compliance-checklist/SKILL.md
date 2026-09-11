---
name: compliance-checklist
description: Control mapping ↔ SBV TT09/2020 · PCI-DSS v4.0 · ISO 27001, anchored to SDLC phases. Use when checking compliance, preparing for an audit, or assessing the impact of a change.
---

# Compliance Checklist — Banking (SBV · PCI-DSS · ISO 27001)

> This is a **directional reference mapping** — reconcile the official clauses with the Risk/Compliance team before formal rollout.

| Control | Anchored phase | PCI-DSS v4.0 | ISO 27001 | SBV |
|---------|----------------|--------------|-----------|-----|
| Risk assessment & ranking | P1 | 12.3 | A.5/A.6 | TT 09/2020 |
| Data classification & protection | P1–P2 | 3, 4 | A.5.12 | TT 09/2020 |
| Threat modeling / Secure design | P2 | 6.2 | A.8.25 | TT 09/2020 |
| Secure coding & code review | P4 | 6.2.3–6.2.4 | A.8.28 | TT 09/2020 |
| Vulnerability management (SAST/DAST/Pentest) | P4–P5 | 6.3, 11.3–11.4 | A.8.8 | TT 09/2020 |
| Change management & approval | P6 | 6.5 | A.8.32 | TT 09/2020 |
| Segregation of Duties & Access | Cross-cutting | 7, 8 | A.5.15/A.8.2 | TT 09/2020 |
| Audit logging & monitoring | P8 | 10 | A.8.15 | TT 09/2020 |
| Incident response · DR/BCP | P8 | 12.10 | A.5.24–.30 | TT 09/2020 |

## Data boundaries (non-negotiable)
- **Never** use real card data/PII in non-prod or in AI context — use masking/synthetic (skill `synthetic-test-data`).
- **Never** store CVV; card data is encrypted/tokenized; audit-log access to sensitive data (PCI Req.10).

## Note on the Claude Code tier
The team currently uses **Pro/Max personal**: data goes to Anthropic under consumer terms and there is no centralized audit. For banking, we recommend **Team/Enterprise** + a **Risk/Compliance sign-off on data residency**.

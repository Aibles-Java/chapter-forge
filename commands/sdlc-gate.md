---
description: Check the exit criteria of a Gate (G0/G1/CI/G2/G3/GO_LIVE) and remind the approver.
argument-hint: "<G0|G1|CI|G2|G3|GO_LIVE>"
---

Check Gate: **$1**

1. Read the criteria for gate `$1` from `${CLAUDE_PLUGIN_ROOT}/graph/sdlc-graph.yaml` (the `gates` section). If `$1` is empty/invalid, list the valid gates.
2. Delegate to `compliance-checker`: cross-check each criterion against the artifact/current state, mark it **met / not met / missing evidence**, with concrete evidence (file, PR, report).
3. Print the checklist table + the list of gaps to address.
4. Print clearly **who the approver** of this gate is.

**Important:** this command does NOT approve the gate. It only prepares evidence for a **human** to make the decision (principle: AI is a Maker, not a Checker).

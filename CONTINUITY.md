Goal (incl. success criteria):
- Diagnose why metadata extraction now returns empty amount/date/recipient and `jsonPath not found` for N26 proof generation.

Constraints/Assumptions:
- Follow AGENTS.md continuity ledger rules; keep ledger updated each turn.
- Workspace: /Users/richardliang/Documents/zk/providers.
- User-provided payload path: /Users/richardliang/Downloads/n26_new.json.
- Need concrete before/after JSON paths tied to selector breakage.

Key decisions:
- Use `/Users/richardliang/Documents/zk/providers/n26/transfer_n26.json` as the source of truth and validate directly against `/Users/richardliang/Downloads/n26_new.json`.
- Avoid speculative selector rewrites when current selectors resolve correctly.

State:
- User shared failed proof output with empty metadata fields and asked why extraction broke.

Done:
- Read prior continuity entry.
- Rebased ledger to current N26 selector-update task.
- Loaded `n26/transfer_n26.json` and `n26_new.json`.
- Verified current selectors in `n26/transfer_n26.json` resolve correctly on `n26_new.json`.
- Confirmed prior selector set drift:
  - `$.data.transaction.containers[0].body[1].*` is now empty in `n26_new.json`.
  - Header fields are now at `$.data.transaction.containers[0].body[0].*`.
  - Payment/recipient proof moved from old `containers[3].body[0].action.params.*` pattern to carousel action at `containers[1].body[1].action.tracking.property` and `containers[1].body[1].action.params.iban` in current metadata.
- Confirmed no further `transfer_n26.json` edits are necessary for this specific payload.
- Verified "old transfer_n26" refers to pre-commit `5755881` (Dec 19, 2025), where selectors used `body[1]` and `containers[3]...accountId/transactionId`.
- Identified that the newly pasted payload appears as an escaped JSON string (outer quotes + escaped inner quotes + trailing `\n`) rather than a plain JSON object.
- Reconfirmed visible structural paths still match current selectors (`containers[0].body[0]` and `containers[1].body[1]`).
- Cross-checked current vs pre-`5755881` N26 template side-by-side.
- Confirmed failure signature matches pre-`5755881` template exactly:
  - Empty metadata for first 4 selectors (`body[1]` paths).
  - Only 5 selector outputs after Date header.
  - Last selector resolves `containers[3].body[0].action.params.transactionId`.
- Verified current template has 6 `proofMetadataSelectors` and uses `body[0]` + `containers[1].body[1]...iban`.

Now:
- Explain root cause as stale provider config/runtime source mismatch and provide targeted verification steps.

Next:
- If needed, help user point app Base URL/path to current local provider (`http://localhost:8080/n26/transfer_n26.json`) and re-test.

Open questions (UNCONFIRMED if needed):
- UNCONFIRMED: whether user runtime is loading old hosted provider artifact instead of local repo file.

Working set (files/ids/commands):
- /Users/richardliang/Documents/zk/providers/CONTINUITY.md
- /Users/richardliang/Downloads/n26_new.json
- /Users/richardliang/Documents/zk/providers/n26/transfer_n26.json
- `jq` selector checks for old/new paths
- `git show 5755881 -- n26/transfer_n26.json`
- `rg -n ... /Users/richardliang/.codex/skills/create-zkp2p-provider/references`

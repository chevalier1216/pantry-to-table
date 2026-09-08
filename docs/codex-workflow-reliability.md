# Codex self-hosted workflow reliability — 2026-09-09

Scope: automation only, based on main `1ad6edb6d7a8e7b63cd7b912a5109cea3a409f31`.
Delivery branch: `fix/codex-self-hosted-reliability`. No merge or deployment.

## Evidence and fixes

1. Run [34220004987](https://github.com/chevalier1216/pantry-to-table/actions/runs/34220004987)
   failed with `'bash' is not recognized`. The workflow inherited the runner's old PATH;
   the setup script did not supply Git Bash/GNU timeout. The new first step finds a complete
   Git for Windows installation (Program Files, x86, per-user, Scoop, or executable PATH),
   runs Bash/GNU timeout, and adds its bin and usr/bin to GITHUB_PATH. No persistent machine
   PATH change or product build-script change. Missing installation fails explicitly.
2. Run [34219921004](https://github.com/chevalier1216/pantry-to-table/actions/runs/34219921004)
   failed because `codex/issue-11` already existed locally. The old remote-only existence
   check used `checkout -b` when no remote branch existed, and reused remote issue history
   otherwise. Preparation now validates the exact issue branch, rejects dirty checkouts
   and identical base/head, fetches the named base, and uses `checkout -B` at its commit.
   Same-issue jobs serialize. Publication checks branch identity and uses an explicit
   SHA lease (including an empty lease for a new branch), rejecting concurrent remote changes.
   Reopening intentionally regenerates this issue branch from its base; earlier attempt
   commits are not carried into the new attempt. Other issue refs are not reset.
3. Issue [#13](https://github.com/chevalier1216/pantry-to-table/issues/13), run
   [34222378615](https://github.com/chevalier1216/pantry-to-table/actions/runs/34222378615),
   pushed `98dee8faac31b714c19891b2ef0b9c993f937c97` then received HTTP 403:
   `GitHub Actions is not permitted to create or approve pull requests.` Repository
   `can_approve_pull_request_reviews` was false despite workflow `pull-requests: write`.
   The repository setting must be true; default workflow permissions remain read.
   GitHub combines PR creation and approval in this setting; this workflow never approves.
   After explicit user authorization on 2026-09-09, the setting was enabled and read back:
   `default_workflow_permissions=read`, `can_approve_pull_request_reviews=true`.
   PR creation now reconciles duplicate/lost responses, retries transient failures,
   reuses the exact head's open PR, rejects a conflicting base, converts ready PRs to draft,
   and records the URL in the job summary. An issue-comment failure becomes a warning
   after PR delivery. A 403 reports the exact required setting and pushed branch.

At inspection, [#14](https://github.com/chevalier1216/pantry-to-table/pull/14) remains open,
draft, unmerged: `codex/issue-13` into `feat/on-demand-recipe-candidates`. It is unchanged.

Verification and Git publication now check each native command's exit code so a later
success cannot hide an earlier failure. Helpers stay inline because a Codex-Base branch
may predate the workflow fix and contain none of its helper/test files.

## Verification

Run on Windows with Node and PowerShell 7:

```powershell
node --test .github/tests/codex-self-hosted.test.cjs
```

12 test groups pass locally: inline PowerShell parsing; missing inherited PATH and replay
of GITHUB_PATH; missing Git installation; real temporary Git repositories for fresh/local/
remote branch preparation, branch isolation, dirty/base refusal, successful lease push and
stale lease rejection; fail-fast verification; draft creation; ready-PR reuse/conversion;
wrong-base rejection; duplicate/lost response recovery; actionable 403; bounded retry;
notification failure. REST/GraphQL PR calls are mocked. CI runs the same suite on Windows
without invoking Codex, product code, or deployment. Test fixtures stay under OS temp.
Both changed workflows also pass actionlint 1.7.12 and `git diff --check`.

The infrastructure-only main branch has no package.json, so product npm test commands
are not applicable to this change. Existing uncommitted product work in the other checkout
is excluded and preserved. Full live Codex execution is not repeated and is not claimed
as verified. The updated issue workflow takes effect only after a separately authorized
merge to the default branch; this delivery stops at draft PR.

GitHub setting reference:
https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository

Version-record folder supplied by the user:
https://drive.google.com/drive/folders/1hY0oV7A1wjT5zwas61wVh-ZuiR-iPn1p

Human-readable version record (commit and remote CI results recorded after publication):
https://docs.google.com/document/d/1mEdUHcxLrmTTSKYw1rM12ifMt8tRIuFgCL4aUi5Puk0/edit

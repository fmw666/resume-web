#!/usr/bin/env bash
# 一键给 main 分支上强制保护 + 打开 auto-merge。
#
# 执行前提：
#   - 本地装了 `gh`（GitHub CLI）并已 `gh auth login`
#   - 当前目录是本仓库（仓库 owner/name 由 `gh repo view` 自动解析）
#
# 用法：
#   bash scripts/setup-branch-protection.sh
#
# 效果：
#   1. 打开 "Allow auto-merge"（相当于 Settings → General → Pull Requests 的那个勾选）
#   2. 给 main 分支加保护规则：
#      - 要求 PR 才能合入（禁止直接 push / commit 到 main）
#      - 要求 `build + test` 状态检查必须通过
#      - 分支必须与最新 main 同步后才能合
#      - 禁止 force-push / 删除 main
#      - 对管理员也生效（可按需改为 enforce_admins=false）
#      - 要求对话都 resolved 后才能合
#
# 想恢复默认？
#   gh api -X DELETE /repos/:owner/:repo/branches/main/protection

set -euo pipefail

REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
echo "==> Target repo: $REPO"

echo "==> Enabling 'Allow auto-merge' on repository…"
gh api -X PATCH "/repos/$REPO" -f allow_auto_merge=true >/dev/null
echo "    ok"

echo "==> Applying branch protection to 'main'…"
gh api -X PUT "/repos/$REPO/branches/main/protection" \
  --input - <<'JSON' >/dev/null
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["build + test"]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": null,
  "restrictions": null,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_conversation_resolution": true,
  "lock_branch": false,
  "allow_fork_syncing": false
}
JSON
echo "    ok"

echo ""
echo "Done. From now on:"
echo "  • Direct pushes / commits to 'main' are rejected."
echo "  • PRs must pass the 'build + test' status check before they can be merged."
echo "  • PRs labelled 'auto-merge' (or opened from cursor/ branches by the owner)"
echo "    will automatically squash-merge once CI is green — see .github/workflows/auto-merge.yml."

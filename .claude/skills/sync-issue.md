# sync-issue

Issue のステータス・コメントを更新するスキル。

---
argument-hint: "<Issue番号>"
---

## 用途別の処理

### 作業開始時

```bash
gh issue edit <Issue番号> --add-label "in-progress"
gh issue comment <Issue番号> --body "作業を開始しました。"
```

### PR 作成時

```bash
gh issue comment <Issue番号> --body "PR を作成しました: <PR URL>"
```

- PR の本文に `Closes #<Issue番号>` が含まれているか確認する
- 含まれていなければ PR の本文を更新して追加する

## 注意事項

- Issue のクローズは PR マージに任せる（手動でクローズしない）
- `gh issue view <Issue番号>` で最新状態を確認してから操作する

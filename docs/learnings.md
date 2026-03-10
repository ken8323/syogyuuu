# Learnings

CI失敗・レビュー差し戻し・本番バグなどの振り返り記録。
`/retrospective` スキルにより自動追記される。

---

## 2026-03-08: カスタムスキルのディレクトリ名

**問題**: `.claude/skills/` にスキルファイルを配置していたが、Claude Code が認識せず `Unknown skill` エラーが発生した。

**原因**: Claude Code のカスタムスラッシュコマンドは `.claude/commands/` に配置する必要がある。

**対応**: `.claude/skills/` → `.claude/commands/` にリネームして解決。

**教訓**: Claude Code のスキルファイルは `.claude/commands/` が正しい配置先。

---

## 2026-03-08: Format on Save と Edit ツールの競合

**問題**: IDE の Format on Save が有効な状態で、Read → Edit の間にフォーマッタがファイルを書き換え「File has been modified since read」エラーが頻発した。

**原因**: Read でファイルを取得した後、IDE がファイルを開いていると自動フォーマットが走り、ファイルのハッシュが変わる。

**対応**: Edit が弾かれたら都度 Read し直してから再 Edit する運用で対処。Format on Save はコード品質のため有効のまま維持。

**教訓**: IDE でファイルが開かれている場合は Edit 前に必ず最新の Read を行う。

---

### 2026-03-10: Framer Motion variants が style のモーション値を上書きする

- **事象**: PR #85（アイドルアニメーション実装）で後手（赤）駒の180度回転が消えるバグを導入した
- **原因**: `variants` に `rotate: 0` を定義したことで、`style={{ rotate: isOpponent ? 180 : 0 }}` が上書きされた。Framer Motion では `animate` / `variants` が `style` に設定したモーション値（rotate, x, y 等）を上書きする仕様を見落としていた
- **対策**: isOpponent の回転など「表示制御のための固定値」は Framer Motion のモーション値ではなく外側 div の CSS `transform` で適用する。アニメーション用途と表示制御用途でモーション値を混在させない
- **関連Issue**: #85

---

## 2026-03-08: self-review の「minor」分類の曖昧さ

**問題**: PR レビューで `[minor]` をコード変更が必要な指摘と、問題なしの補足メモの両方に使用していた。ユーザーに「minor を対応して」と言われた際に「修正不要です」となるケースが発生。

**対応**: CLAUDE.md のレビュールールに `[要修正]`（コード変更が必要）と `[補足]`（対応不要の確認メモ）の分類を追加。

**教訓**: レビューコメントはアクション要否を明確にする分類で書く。

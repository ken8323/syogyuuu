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

---

### 2026-03-13: Board ラッパー div による盤面レイアウト崩壊

- **事象**: PraiseMessage を Board 上にオーバーレイするため `<div className="relative">` で Board を囲んだところ、盤面が極小サイズに崩壊。1回目の修正（`flex justify-center` 追加）でも直らず、2回目でようやく解消
- **原因**: Board コンポーネントが `inline-flex` で親フレックスコンテナからサイズを受け取る仕組みを理解せずにラッパーを追加した。修正もレイアウトの実機確認をせず推測ベースで push した
- **対策**: (1) 既存コンポーネントをラッパーで囲む前に display 特性とサイズ伝播を確認する (2) overlay コンポーネントは `fixed` 配置を第一候補にし、既存レイアウトを囲まない (3) レイアウト変更は build だけでなく視覚的確認を行ってから push する
- **関連Issue**: #71

---

### 2026-03-13: バグ修正後に振り返りスキルを実行しなかった

- **事象**: Board ラッパーによるレイアウト崩壊を修正した後、CLAUDE.md に「バグ修正後は即座に `/retrospective` を実行すること」と明記されているにもかかわらず、ユーザーに指摘されるまで振り返りを実施しなかった
- **原因**: 修正 push → ユーザー確認待ちの流れに意識が集中し、「修正完了 ≠ 対応完了」というルールが頭から抜けていた。CLAUDE.md のルールを修正作業中に参照していなかった
- **対策**: バグ修正の commit/push を行った直後に、次のアクションとして必ず `/retrospective` を実行する。「push したら retrospective」をセットで記憶する
- **関連Issue**: #71, #98

---

### 2026-03-17: 後手持ち駒アイコンに回転が適用されていなかった

- **事象**: 後手（赤）の持ち駒エリアのアイコンが盤面の駒と逆向きに表示されていた
- **原因**: `CapturedPieces.tsx` に `rotate(180deg)` が実装されておらず、Board との表示仕様の横断確認が未実施だった
- **対策**: 後手表示を持つコンポーネントを新規作成・修正するときは、Board の `isOpponent` 回転ルールとの整合を必ず確認する
- **関連Issue**: #109

---

### 2026-03-17: 成りダイアログの駒アイコン色が currentPlayer に依存していた

- **事象**: 成りダイアログに表示される駒アイコンの色が、成りを行うプレイヤーと逆のチームカラーになっていた
- **原因**: `executeMove` が呼ばれた時点で `currentPlayer` が次のプレイヤーに切り替わる。そのため `promotion_check` フェーズ時には `currentPlayer` は相手のプレイヤーになっており、`owner={currentPlayer}` では必ず逆の色が表示される。また修正1回目（`animatingMove?.piece.owner`）も、`completeMoveAnimation` 内で `animatingMove` と `phase` が同一の `set()` で更新されるため、`promotion_check` フェーズ到達時には `animatingMove` がすでに `null` であり、同様に `currentPlayer` にフォールバックして逆になった
- **対策**: `executeMove` 後に変わるプレイヤー依存の情報（「誰が動かしたか」）は `currentPlayer` から取得しない。`moveHistory.moves[currentIndex].piece.owner` など、移動履歴から取得する。`executeMove` が副作用として `currentPlayer` を切り替えることを常に意識する
- **関連Issue**: #110

---

### 2026-03-22: next/image fill と Framer Motion の組み合わせでTitleScreenが壊れた

- **事象**: TitleScreen でSVGをPNGに切り替えた際に `<Image fill>` を使用したところ、動物アイコン・タイトル文字・ボタンがすべて表示されなくなった。`.next` キャッシュ削除後に顕在化
- **原因**: `next/image` の `fill` は画像を `position: absolute` にする。Framer Motion の `motion.div` 内で使用した場合、アニメーション開始時のレイアウト計算で描画が壊れた。サイズが `size` props で明示的にわかっている場面で安易に `fill` を選択した
- **対策**: `<Image>` のサイズが確定している場合は `fill` ではなく `width`/`height` を明示的に指定する。`fill` は親要素のサイズに依存させたい場合のみ使用する
- **関連Issue**: #123

---

### 2026-03-22: バグ報告を受けてIssue作成せず直接修正・pushした

- **事象**: ユーザーから「赤の持ち駒の文字の向きが盤面のコマと合ってない」というバグ報告を受けた際、Issue作成・人間の選択待ちプロセスを飛ばし、直接修正してmainにpushした
- **原因**: 「軽微なバグ修正だからプロセスを省略しても良い」と自己判断した。CLAUDE.mdの「要望を受けた時のプロセス」がバグ報告にも適用されるという認識が不足していた。修正の規模や種類に関わらず、ユーザーからの報告はすべて同一プロセスで扱うべきだった
- **対策**: CLAUDE.mdのセクション名を「要望・バグ報告を受けた時のプロセス」に変更し、バグ報告にも同一プロセスを適用することを明記した。修正の軽重を自己判断してプロセスをスキップしない
- **関連Issue**: #113


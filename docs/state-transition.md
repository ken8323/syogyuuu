# 状態遷移定義書

## 1. ゲーム全体の状態

### 1.1 アプリ状態（AppState）

```
[TITLE] --あそぶ！(未完了)--> [TUTORIAL] --> [PLAYING] --> [GAME_OVER]
   |                                              ^   |            |
   |                                              |   v            |
   +--あそぶ！(完了済み)--------------------------> +---+            |
   +--つづきから---------------------------------->  ^               |
                                                    +---------------+
```

| 状態 | 説明 | 遷移条件 |
|------|------|---------|
| TITLE | タイトル画面 | アプリ起動時 / 対局終了時（「おわる」選択） |
| TUTORIAL | チュートリアル表示中 | 「あそぶ！」タップ & `tutorialCompleted=false` |
| PLAYING | 対局中 | チュートリアル完了・スキップ / 「あそぶ！」(完了済み) / 「つづきから」タップ |
| GAME_OVER | 対局終了（詰み・投了） | 詰み判定 or 投了選択 |

### 1.1.1 チュートリアルステップ（TutorialStep）

チュートリアル中のステップ遷移:

```
[select_piece] --(先手ひよこタップ)--> [move_piece] --(移動マスタップ)--> [capture_piece] --(駒取り)--> [complete] --> PLAYING
```

| ステップ | 説明 | 完了条件 |
|---------|------|---------|
| select_piece | 先手ひよこ（5七）を選択する | piece at (6,4) が selected 状態になる |
| move_piece | 移動先マス（5六）をタップする | ひよこが (5,4) へ移動する |
| capture_piece | 後手ひよこ（5五）を取る | ひよこが (4,4) を取って移動する |
| complete | 完了演出 → onComplete() 呼び出し | 自動遷移 |

### 1.2 対局中の状態（GamePhase）

```
[IDLE] --自駒タップ--> [PIECE_SELECTED] --合法手タップ--> [MOVING]
  |                       |       ^                        |
  |                       |       |                  アニメ完了
  |                       +-------+                        |
  |                     (別の駒選択)                   +----+----+
  |                                                   |         |
  |                                             強制成り    通常/成り可能
  |                                                   |         |
  |                                                   v         v
  +--持ち駒タップ--> [CAPTURED_SELECTED]          [PROMOTING] [PROMOTION_CHECK]
                          |       ^                   |         |
                          |       |             アニメ完了  選択完了
                          +-------+                   |    (なる→PROMOTING)
                        (別の持ち駒選択)               |    (ならない→直接↓)
                          |                           v         |
                          +--打てるマスタップ--> [MOVING]        |
                                                        +------+
                                                        v
                                                 [TURN_SWITCHING]
                                                        |
                                              +---------+---------+
                                              |         |         |
                                            詰み      王手      通常
                                              |         |         |
                                              v         v         v
                                        [CHECKMATE] [CHECK_NOTIFY] [IDLE]
                                                        |
                                                   通知完了
                                                        |
                                                        v
                                                      [IDLE]
```

| 状態 | 説明 |
|------|------|
| IDLE | 手番プレイヤーの入力待ち。駒未選択。ヒントタイマー起動中 |
| PIECE_SELECTED | 盤上の駒が選択されている。合法手ハイライト＋矢印表示中 |
| CAPTURED_SELECTED | 持ち駒が選択されている。打てるマスハイライト表示中 |
| MOVING | 駒の移動アニメーション中（AnimatingPiece描画中） |
| PROMOTION_CHECK | 成り判定。ダイアログ表示中（ユーザーの選択待ち） |
| PROMOTING | 成りアニメーション中（PromotionEffect描画中） |
| TURN_SWITCHING | 手番交代中（即座に遷移。useEffectで自動completeTurnSwitch） |
| CHECK_NOTIFY | 王手通知バナー表示中（1.5秒後に自動消去） |
| CHECKMATE | 詰み。勝敗ダイアログ表示 |

---

## 2. 状態遷移テーブル

### 2.1 メイン対局フロー

| 現在の状態 | イベント | 次の状態 | 処理内容 | 効果音 | 触覚 |
|-----------|---------|---------|---------|--------|------|
| IDLE | 自分の駒タップ | PIECE_SELECTED | 合法手計算 → ハイライト表示 → 矢印表示。ヒントクリア | select | hapticSelect |
| IDLE | 持ち駒タップ | CAPTURED_SELECTED | 打てるマス計算 → ハイライト表示。ヒントクリア | select | hapticSelect |
| IDLE | その他タップ | IDLE | 何もしない | - | - |
| PIECE_SELECTED | 合法手マスタップ | MOVING | 盤面即時更新＋移動アニメーション開始。pendingPhase決定 | place/capture/forced_promote | hapticPlace/hapticCapture/hapticPromote |
| PIECE_SELECTED | 別の自駒タップ | PIECE_SELECTED | 選択切替。新しい駒の合法手表示 | select | hapticSelect |
| PIECE_SELECTED | 合法手外タップ | IDLE | 選択解除。ハイライト消去 | - | - |
| CAPTURED_SELECTED | 打てるマスタップ | MOVING | 盤面即時更新＋打ちアニメーション開始 | drop | hapticPlace |
| CAPTURED_SELECTED | 打てないマスタップ | IDLE | 選択解除 | - | - |
| CAPTURED_SELECTED | 別の持ち駒タップ | CAPTURED_SELECTED | 選択切替 | select | hapticSelect |
| CAPTURED_SELECTED | 選択中の持ち駒再タップ | IDLE | 選択解除 | - | - |
| MOVING | アニメーション完了（強制成り） | PROMOTING | PromotionEffect開始。promotingInfo設定 | - | - |
| MOVING | アニメーション完了（成り可能） | PROMOTION_CHECK | 成りダイアログ表示 | - | - |
| MOVING | アニメーション完了（通常） | TURN_SWITCHING | 手番交代開始 | - | - |
| PROMOTION_CHECK | 「なる」選択 | PROMOTING | undo→re-execute(promote=true)。PromotionEffect開始 | promote | hapticPromote |
| PROMOTION_CHECK | 「ならない」選択 | TURN_SWITCHING | そのまま手番交代開始 | - | - |
| PROMOTING | アニメーション完了 | TURN_SWITCHING | promotingInfo クリア。強制成りの場合はforcedPromotionPiece設定 | - | - |
| TURN_SWITCHING | 詰み検出 | CHECKMATE | appState→game_over。勝敗ダイアログ表示 | victory | hapticCheckmate |
| TURN_SWITCHING | 王手検出 | CHECK_NOTIFY | isCheck=true。バナー表示 | check | hapticCheck |
| TURN_SWITCHING | 通常 | IDLE | isCheck=false | - | - |
| CHECK_NOTIFY | 通知消去 | IDLE | phase→idle（盤面操作再開） | - | - |
| CHECKMATE | 「もういっかい」 | IDLE | 盤面リセット | - | - |
| CHECKMATE | 「おわる」 | (TITLE) | タイトル画面へ | - | - |

### 2.2 アニメーションチェーン詳細

駒移動から手番交代までのアニメーション連鎖:

```
movePiece/dropPiece
  → gameState更新（executeMove/executeDrop）
  → phase = 'moving'
  → ui.animatingMove 設定
  → AnimatingPiece がアニメーション描画
  → onAnimationComplete → completeMoveAnimation()
      |
      +-- isForcedPromote → phase = 'promoting', ui.promotingInfo 設定
      |     → PromotionEffect がアニメーション描画
      |     → onComplete → completePromotion()
      |         → phase = 'turn_switching', ui.forcedPromotionPiece 設定
      |
      +-- pendingPhase = 'promotion_check' → phase = 'promotion_check'
      |     → PromotionDialog 表示
      |     → promote(true) → undo + re-execute → phase = 'promoting'
      |         → PromotionEffect → completePromotion() → phase = 'turn_switching'
      |     → promote(false) → phase = 'turn_switching'
      |
      +-- pendingPhase = 'turn_switching' → phase = 'turn_switching'

phase = 'turn_switching'
  → useEffect → completeTurnSwitch()
  → isCheckmate() → phase = 'checkmate'
  → isInCheck() → phase = 'check_notify'
  → else → phase = 'idle'
```

### 2.3 待った（Undo）フロー

| 現在の状態 | イベント | 次の状態 | 処理内容 | 効果音 | 触覚 |
|-----------|---------|---------|---------|--------|------|
| IDLE | 「もどる」タップ | MOVING | 盤面を1手前に戻す → `animatingMove` をセット（逆方向スライド）→ アニメーション完了後 IDLE へ。ヒントクリア | undo | hapticUndoRedo |
| IDLE | 「すすむ」タップ | MOVING | 1手先を再実行 → `animatingMove` をセット（正方向スライド）→ アニメーション完了後 IDLE へ。ヒントクリア | redo | hapticUndoRedo |

| アニメーション種別 | 条件 | 挙動 |
|------------------|------|------|
| Undo BoardMove | `undoRedo='undo'`, from≠to | 駒が to→from へ逆スライド（0.3s easeOut）。captured あれば持ち駒エリアから盤面へ飛び込み（同 0.3s） |
| Undo DropMove | `undoRedo='undo'`, from=to | 打った駒が盤面で縮小消滅（pop-out, scale 1→0, 0.2s） |
| Redo BoardMove | `undoRedo='redo'` | 駒が from→to へスライド（0.25s easeOut）。captured あればフェードアウト |
| Redo DropMove | `undoRedo='redo'`, from=null | 既存 pop-in（scale 0→1）と同じ |

※ 盤面は常に先手視点固定のため、Undo/Redo 時の回転処理は不要。
※ `canUndo = moveHistory.currentIndex >= 0 && phase === 'idle'`
※ `canRedo = moveHistory.currentIndex < moveHistory.moves.length - 1 && phase === 'idle'`
※ アニメーション詳細は `data-type-definition.md` セクション 4.4 を参照

### 2.4 メニューフロー

メニューの開閉は GamePhase とは独立した `ui.isMenuOpen: boolean` フラグで管理する。
メニュー表示中は盤面操作を無効化し、ヒントタイマーをリセットする。

| 現在の状態 | イベント | 次の状態 | 処理内容 |
|-----------|---------|---------|---------|
| IDLE | メニュータップ | IDLE (isMenuOpen=true) | メニューダイアログを表示。盤面操作無効化。ヒントクリア |
| IDLE (isMenuOpen) | 「まいった」 | CHECKMATE | 確認ダイアログ → 相手の勝ちとして勝敗ダイアログ表示 |
| IDLE (isMenuOpen) | 「さいしょから」 | IDLE (isMenuOpen=false) | 確認ダイアログ → 盤面リセット。先手の手番でやり直し |
| IDLE (isMenuOpen) | 「とじる」/ オーバーレイタップ | IDLE (isMenuOpen=false) | メニュー閉じる。盤面操作を再開 |

### 2.5 ヒントフロー

ヒントは `useHintTimer` フックが `phase` と `isMenuOpen` を監視して自動制御する。

| 条件 | イベント | 処理 |
|------|---------|------|
| phase=idle, isMenuOpen=false | 10秒無操作 | setHint(1): 合法手を持つ全駒位置を `ui.hintPieces` に設定。脈動表示 |
| phase=idle, isMenuOpen=false | 15秒無操作 | setHint(2): おすすめ1駒＋合法手を `ui.hintPieces`/`ui.hintMoves` に設定 |
| phase≠idle or isMenuOpen=true | - | clearHint(): hintLevel=0, hintPieces=[], hintMoves=[] |
| phase=idle | 💡ボタンタップ | showHint(): 即座にレベル2ヒントを表示 |

おすすめ手の選出優先度:
1. 相手の駒を取れる手を持つ駒
2. 前方に進める手を持つ駒（先手: row減少、後手: row増加）
3. 最初に見つかった合法手を持つ駒

### 2.6 ほめメッセージフロー

ほめメッセージは `ui.praiseMessage` に格納され、PraiseMessage コンポーネントで表示する。

| トリガー | 発火タイミング | メッセージ設定箇所 |
|---------|-------------|-----------------|
| 初回駒取得 | movePiece 内（captured && !hasFirstCapture） | FIRST_CAPTURE_MESSAGE |
| 駒取得（2回目以降） | movePiece 内（captured && hasFirstCapture） | pickMessage(CAPTURE_MESSAGES) |
| 強制成り | movePiece 内（isForcedPromote） | pickMessage(PROMOTE_MESSAGES) |
| 成り（ダイアログ選択） | promote(true) 内 | pickMessage(PROMOTE_MESSAGES) |
| 10手マイルストーン | completeTurnSwitch 内（moveCount % 10 === 0） | pickMessage(MILESTONE_MESSAGES) |

- 強制成り時の捕獲は成りメッセージが優先される
- マイルストーンは他のメッセージが表示中でない場合のみ
- 1秒後に自動消去（useEffect + setTimeout → clearPraise）

---

## 3. 手の履歴管理（Undo/Redo）

### 3.1 データ構造

```
MoveHistory {
  moves: Move[]        // 実行された手の配列
  currentIndex: number // 現在位置（-1 = 初期状態）
}
```

### 3.2 操作

| 操作 | 処理 | 条件 |
|------|------|------|
| 手を指す | moves に追加。currentIndex より後ろの手を削除。currentIndex++ | phase = idle |
| もどる | currentIndex-- 。盤面を moves[currentIndex] の状態に戻す | currentIndex >= 0 && phase = idle |
| すすむ | currentIndex++ 。moves[currentIndex] の手を再実行 | currentIndex < moves.length - 1 && phase = idle |

### 3.3 盤面表示との連動
- 盤面は常に先手視点固定のため、Undo/Redo による盤面の回転処理は不要
- 手番の切り替え（currentPlayer の変更）と盤面状態の復元のみ行う
- Undo/Redo 時はヒントをクリアする

---

## 4. ローカルストレージ保存

### 4.1 保存タイミング

Zustand の `persist` ミドルウェアにより、保存対象フィールドの変更時に自動保存される。

### 4.2 保存キー

| キー | 内容 |
|------|------|
| `shogyuu_game_state` | JSON: 盤面配列 + 持ち駒 + 手番 + 手の履歴 + ミュート設定 |

### 4.3 保存対象フィールド

| フィールド | 保存 | 理由 |
|-----------|------|------|
| gameState.board | o | 盤面状態の復元に必要 |
| gameState.capturedPieces | o | 持ち駒の復元に必要 |
| gameState.currentPlayer | o | 手番の復元に必要 |
| gameState.moveHistory | o | Undo/Redo の復元に必要 |
| ui.isMuted | o | ユーザー設定の永続化 |
| gameState.phase | x | idle にリセット |
| gameState.selectedPosition | x | null にリセット |
| gameState.selectedCaptured | x | null にリセット |
| gameState.legalMoves | x | [] にリセット |
| gameState.isCheck | x | false にリセット |
| gameState.winner | x | null にリセット |
| gameState.gameOverReason | x | null にリセット |
| ui.isMenuOpen | x | false にリセット |
| ui.isAnimating | x | false にリセット |
| ui.animatingMove | x | null にリセット |
| ui.promotingInfo | x | null にリセット |
| ui.hintLevel / hintPieces / hintMoves | x | 0 / [] / [] にリセット |
| ui.praiseMessage | x | null にリセット |
| ui.hasFirstCapture | x | false にリセット |
| ui.forcedPromotionPiece | x | null にリセット |

### 4.4 復元

| 条件 | 動作 |
|------|------|
| 保存データあり（moves.length > 0） | タイトル画面に「つづきから」ボタンを表示 |
| 保存データなし | 「つづきから」ボタンは非表示 |
| データ破損 | 保存データを削除して無視 |
| 復元時 | phase=idle, 選択状態=null, ヒント=クリア にリセット |
| 復元時（ミュート） | `soundEngine.setMuted(isMuted)` でエンジンに反映 |

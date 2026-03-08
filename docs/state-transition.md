# 状態遷移定義書

## 1. ゲーム全体の状態

### 1.1 アプリ状態（AppState）

```
[TITLE] --> [PLAYING] --> [GAME_OVER]
              ^   |            |
              |   v            |
              +---+            |
              ^                |
              +----------------+
```

| 状態 | 説明 | 遷移条件 |
|------|------|---------|
| TITLE | タイトル画面 | アプリ起動時 / 対局終了時 |
| PLAYING | 対局中 | 「あそぶ！」or「つづきから」タップ |
| GAME_OVER | 対局終了（詰み・投了） | 詰み判定 or 投了選択 |

### 1.2 対局中の状態（GamePhase）

```
[IDLE] --自駒タップ--> [PIECE_SELECTED] --合法手タップ--> [MOVING] --アニメ完了--> [PROMOTION_CHECK]
  |                       |       ^                                                    |
  |                       |       |                                                    v
  |                       +-------+                                            [TURN_SWITCHING]
  |                     (別の駒選択)                                                   |
  |                                                                                    v
  +--持ち駒タップ--> [CAPTURED_SELECTED] --打てるマスタップ--> [MOVING]          [CHECK_NOTIFY]
                          |       ^                                                    |
                          |       |                                                    v
                          +-------+                                          [IDLE] or [CHECKMATE]
                        (別の持ち駒選択)
```

| 状態 | 説明 |
|------|------|
| IDLE | 手番プレイヤーの入力待ち。駒未選択 |
| PIECE_SELECTED | 盤上の駒が選択されている。合法手ハイライト表示中 |
| CAPTURED_SELECTED | 持ち駒が選択されている。打てるマスハイライト表示中 |
| MOVING | 駒の移動アニメーション中 |
| PROMOTION_CHECK | 成り判定。ダイアログ表示 or 自動成り |
| TURN_SWITCHING | 手番交代中（盤面は固定のまま即座に遷移） |
| CHECK_NOTIFY | 王手通知表示中 |
| CHECKMATE | 詰み。勝敗ダイアログ表示 |

---

## 2. 状態遷移テーブル

### 2.1 メイン対局フロー

| 現在の状態 | イベント | 次の状態 | 処理内容 |
|-----------|---------|---------|---------|
| IDLE | 自分の駒タップ | PIECE_SELECTED | 合法手計算 → ハイライト表示 → 矢印表示 |
| IDLE | 持ち駒タップ | CAPTURED_SELECTED | 打てるマス計算 → ハイライト表示 |
| IDLE | その他タップ | IDLE | 何もしない |
| PIECE_SELECTED | 合法手マスタップ | MOVING | 駒移動アニメーション開始 |
| PIECE_SELECTED | 別の自駒タップ | PIECE_SELECTED | 選択切替。新しい駒の合法手表示 |
| PIECE_SELECTED | 合法手外タップ | IDLE | 選択解除。ハイライト消去 |
| CAPTURED_SELECTED | 打てるマスタップ | MOVING | 駒打ちアニメーション開始 |
| CAPTURED_SELECTED | 打てないマスタップ | IDLE | 選択解除 |
| CAPTURED_SELECTED | 別の持ち駒タップ | CAPTURED_SELECTED | 選択切替 |
| MOVING | アニメーション完了 | PROMOTION_CHECK | 成り条件チェック |
| PROMOTION_CHECK | 成り条件あり | PROMOTION_CHECK | 成りダイアログ表示。入力待ち |
| PROMOTION_CHECK | 成り不要 | TURN_SWITCHING | 手番交代開始 |
| PROMOTION_CHECK | 強制成り | TURN_SWITCHING | 自動で成り → 手番交代開始 |
| PROMOTION_CHECK | 「なる」選択 | TURN_SWITCHING | 成駒に変更 → 手番交代開始 |
| PROMOTION_CHECK | 「ならない」選択 | TURN_SWITCHING | そのまま → 手番交代開始 |
| TURN_SWITCHING | 手番交代完了 | CHECK_NOTIFY or IDLE | 王手判定 |
| CHECK_NOTIFY | 通知表示完了 | IDLE or CHECKMATE | 詰み判定。合法手ありなら IDLE |
| CHECKMATE | 「もういっかい」 | IDLE | 盤面リセット |
| CHECKMATE | 「おわる」 | (TITLE) | タイトル画面へ |

### 2.2 待った（Undo）フロー

| 現在の状態 | イベント | 次の状態 | 処理内容 |
|-----------|---------|---------|---------|
| IDLE | 「もどる」タップ | IDLE | 手の履歴から1手戻す。盤面状態を復元 |
| IDLE | 「すすむ」タップ | IDLE | 戻した手を再実行。盤面状態を更新 |

※ 盤面は常に先手視点固定のため、Undo/Redo 時の回転処理は不要。

### 2.3 メニューフロー

メニューの開閉は GamePhase とは独立した `isMenuOpen: boolean` フラグで管理する。
メニュー表示中は盤面操作を無効化する。

| 現在の状態 | イベント | 次の状態 | 処理内容 |
|-----------|---------|---------|---------|
| IDLE | メニュータップ | IDLE (isMenuOpen=true) | メニューダイアログを表示。盤面操作無効化 |
| IDLE (isMenuOpen) | 「まいった」 | CHECKMATE | 確認ダイアログ → 相手の勝ちとして勝敗ダイアログ表示 |
| IDLE (isMenuOpen) | 「さいしょから」 | IDLE (isMenuOpen=false) | 確認ダイアログ → 盤面リセット。先手の手番でやり直し |
| IDLE (isMenuOpen) | 「とじる」/ オーバーレイタップ | IDLE (isMenuOpen=false) | メニュー閉じる。盤面操作を再開 |

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
| 手を指す | moves に追加。currentIndex より後ろの手を削除。currentIndex++ | IDLE 状態 |
| もどる | currentIndex-- 。盤面を moves[currentIndex] の状態に戻す | currentIndex >= 0 |
| すすむ | currentIndex++ 。moves[currentIndex] の手を再実行 | currentIndex < moves.length - 1 |

### 3.3 盤面表示との連動
- 盤面は常に先手視点固定のため、Undo/Redo による盤面の回転処理は不要
- 手番の切り替え（currentPlayer の変更）と盤面状態の復元のみ行う

---

## 4. ローカルストレージ保存

### 4.1 保存タイミング

| イベント | 保存内容 |
|---------|---------|
| 手を指した後 | 盤面状態 + 手の履歴 + 手番 |
| 「もどる」/「すすむ」後 | 盤面状態 + 手の履歴 + currentIndex + 手番 |
| 対局終了 | 保存データを削除 |

### 4.2 保存キー

| キー | 内容 |
|------|------|
| `shogyuu_game_state` | JSON: 盤面配列 + 持ち駒 + 手番 + 手の履歴 |

### 4.3 復元

| 条件 | 動作 |
|------|------|
| 保存データあり | タイトル画面に「つづきから」ボタンを表示 |
| 保存データなし | 「つづきから」ボタンは非表示 |
| データ破損 | 保存データを削除して無視 |

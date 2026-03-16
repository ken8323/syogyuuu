# データ型定義書

## 1. 駒の型定義

### 1.1 駒の種類（PieceType）

| 値 | 駒名 | 動物 |
|----|------|------|
| KING | 王将/玉将 | ライオン |
| ROOK | 飛車 | 鷹 |
| BISHOP | 角行 | フクロウ |
| GOLD | 金将 | ゾウ |
| SILVER | 銀将 | オオカミ |
| KNIGHT | 桂馬 | うさぎ |
| LANCE | 香車 | イノシシ |
| PAWN | 歩兵 | ひよこ |

### 1.2 成駒の種類（PromotedPieceType）

| 値 | 元の駒 | 成駒名 | 動物変化 |
|----|--------|--------|---------|
| PROMOTED_ROOK | 飛車 | 竜王 | 金色の鷹 |
| PROMOTED_BISHOP | 角行 | 竜馬 | 金色のフクロウ |
| PROMOTED_SILVER | 銀将 | 成銀 | 金色のオオカミ |
| PROMOTED_KNIGHT | 桂馬 | 成桂 | 金色のうさぎ |
| PROMOTED_LANCE | 香車 | 成香 | 金色のイノシシ |
| PROMOTED_PAWN | 歩兵 | と金 | ニワトリ |

※ 金将（ゾウ）と王将（ライオン）は成れない。

### 1.3 プレイヤー（Player）

| 値 | 説明 | 表示色 |
|----|------|--------|
| SENTE | 先手 | 青系 #3B82F6 |
| GOTE | 後手 | 赤系 #EF4444 |

---

## 2. コアデータ構造

### 2.1 駒（Piece）

```typescript
type PieceType = 'king' | 'rook' | 'bishop' | 'gold' | 'silver' | 'knight' | 'lance' | 'pawn'

type PromotedPieceType = 'promoted_rook' | 'promoted_bishop' | 'promoted_silver' | 'promoted_knight' | 'promoted_lance' | 'promoted_pawn'

type Player = 'sente' | 'gote'

interface Piece {
  type: PieceType | PromotedPieceType
  owner: Player
}
```

### 2.2 盤面の座標（Position）

```typescript
// 内部では全て 0-indexed で管理する
// row: 0-8（0=一段目/後手陣最奥、8=九段目/先手陣最奥）
// col: 0-8（0=9筋/右端、8=1筋/左端）
interface Position {
  col: number  // 0-8（0=9筋, 8=1筋）
  row: number  // 0-8（0=一段目, 8=九段目）
}
```

### 2.3 盤面（Board）

```typescript
// 9x9 の2次元配列。null は駒なし
// board[row][col] で参照（全て 0-indexed）
type Board = (Piece | null)[][]
```

### 2.4 座標変換ユーティリティ

```typescript
// 内部座標 (0-indexed) → 将棋表記 (筋: 1-9, 段: 一〜九)
function toSujiDan(pos: Position): { suji: number; dan: number } {
  return { suji: 9 - pos.col, dan: pos.row + 1 }
}

// 将棋表記 → 内部座標
function fromSujiDan(suji: number, dan: number): Position {
  return { col: 9 - suji, row: dan - 1 }
}

// ※ 盤面は常に先手視点固定のため、表示用座標変換は不要
// displayRow = row, displayCol = col で常に描画する
```

### 2.5 持ち駒（CapturedPieces）

```typescript
// 各プレイヤーが持っている駒の種類と枚数
interface CapturedPieces {
  sente: Partial<Record<PieceType, number>>
  gote: Partial<Record<PieceType, number>>
}
```

※ 持ち駒は常に成り前の状態で保持する（成駒を取った場合は元の駒に戻す）。

---

## 3. 手（Move）のデータ構造

### 3.1 盤上の駒を動かす手（BoardMove）

```typescript
interface BoardMove {
  type: 'move'
  from: Position           // 移動元
  to: Position             // 移動先
  piece: Piece             // 動かした駒
  captured: Piece | null   // 取った駒（なければ null）
  promoted: boolean        // 成ったかどうか
}
```

### 3.2 持ち駒を打つ手（DropMove）

```typescript
interface DropMove {
  type: 'drop'
  to: Position             // 打った位置
  piece: Piece             // 打った駒
}
```

### 3.3 手の共用体型

```typescript
type Move = BoardMove | DropMove
```

---

## 4. ゲーム状態（GameState）

### 4.1 ゲーム全体の状態

```typescript
interface GameState {
  board: Board                       // 現在の盤面
  capturedPieces: CapturedPieces     // 両者の持ち駒
  currentPlayer: Player              // 現在の手番
  phase: GamePhase                   // ゲームフェーズ
  selectedPosition: Position | null  // 選択中の盤上の駒の位置
  selectedCaptured: PieceType | null // 選択中の持ち駒の種類
  legalMoves: Position[]             // 現在の合法手リスト
  moveHistory: MoveHistory           // 手の履歴
  isCheck: boolean                   // 王手がかかっているか
  winner: Player | null              // 勝者（対局中は null）
  gameOverReason: 'checkmate' | 'resign' | null  // 終了理由
}
```

### 4.2 ゲームフェーズ

```typescript
type GamePhase =
  | 'idle'               // 入力待ち
  | 'piece_selected'     // 盤上の駒選択中
  | 'captured_selected'  // 持ち駒選択中
  | 'moving'             // 駒移動アニメーション中（AnimatingPiece描画中）
  | 'promotion_check'    // 成り判定中（ダイアログ表示）
  | 'promoting'          // 成りアニメーション中（PromotionEffect描画中）
  | 'turn_switching'     // 手番交代中（即座に遷移）
  | 'check_notify'       // 王手通知中（バナー表示）
  | 'checkmate'          // 詰み（対局終了）
```

### 4.3 手の履歴

```typescript
interface MoveHistory {
  moves: Move[]          // 全ての手
  currentIndex: number   // 現在位置（-1 = 初期状態、0 = 1手目）
}
```

### 4.4 移動アニメーション情報

```typescript
interface AnimatingMoveInfo {
  piece: Piece               // 移動する駒
  from: Position | null      // 移動元（null = 持ち駒打ち）
  to: Position               // 移動先
  captured: Piece | null     // 取られる駒（null = 取りなし）
  pendingPhase: 'turn_switching' | 'promotion_check'  // アニメーション完了後の遷移先
  promote: boolean           // 成りが確定しているか（強制成り時に true）
  isForcedPromote: boolean   // 強制成りか
}
```

### 4.5 成りアニメーション情報

```typescript
interface PromotingInfo {
  position: Position     // 成る駒の盤上位置
  pieceType: PieceType   // 成り前の駒種（エフェクト表示用）
  isForcedPromote: boolean  // 強制成りか（アニメーション時間が異なる）
}
```

---

## 5. UI状態（UIState）

GamePhase とは独立した、UIの表示制御用の状態。

```typescript
interface UIState {
  /** メニューダイアログの開閉 */
  isMenuOpen: boolean

  /** アニメーション中フラグ（操作無効化に使用） */
  isAnimating: boolean

  /** 強制成りトースト通知用の駒種（表示後に clearForcedPromotion() で null に戻す） */
  forcedPromotionPiece: PieceType | null

  /** 効果音・触覚のミュート（ローカルストレージに永続化） */
  isMuted: boolean

  /** 移動アニメーション中の情報（null = アニメーションなし） */
  animatingMove: AnimatingMoveInfo | null

  /** 成りアニメーション中の情報（null = アニメーションなし） */
  promotingInfo: PromotingInfo | null

  /** ヒントレベル（0=なし, 1=全駒脈動, 2=おすすめ手表示） */
  hintLevel: 0 | 1 | 2

  /** ヒント対象の駒の位置一覧（hintLevel>=1 で使用） */
  hintPieces: Position[]

  /** おすすめ手の合法手一覧（hintLevel=2 で使用） */
  hintMoves: Position[]

  /** 現在表示中のほめメッセージ（null = 非表示） */
  praiseMessage: string | null

  /** 対局内で初めて駒を取ったかのフラグ */
  hasFirstCapture: boolean
}
```

### 5.1 UIState 初期値

```typescript
const INITIAL_UI_STATE: UIState = {
  isMenuOpen: false,
  isAnimating: false,
  forcedPromotionPiece: null,
  isMuted: false,       // ※ 復元時は永続化された値で上書き
  animatingMove: null,
  promotingInfo: null,
  hintLevel: 0,
  hintPieces: [],
  hintMoves: [],
  praiseMessage: null,
  hasFirstCapture: false,
}
```

---

## 6. 駒の移動ルール定義

### 6.1 移動パターン（MovePattern）

```typescript
// 相対的な移動方向（先手基準で定義）
// 先手にとって「前方」= row が減る方向（dRow が負）
// 後手の場合は dRow, dCol を両方反転して適用する
interface MoveDirection {
  dCol: number  // 筋方向の移動量（正=col増加方向、負=col減少方向）
  dRow: number  // 段方向の移動量（負=前方/row減少、正=後方/row増加）
}

interface MovePattern {
  steps: MoveDirection[]  // 1マスだけ移動できる方向
  slides: MoveDirection[] // その方向に何マスでも進める方向（飛び駒）
}
```

### 6.2 各駒の移動パターン

| 駒 | 1マス移動 | スライド移動 |
|----|----------|------------|
| 王将 | 全8方向 | なし |
| 金将 | 前、左前、右前、左、右、後 (6方向) | なし |
| 銀将 | 前、左前、右前、左後、右後 (5方向) | なし |
| 桂馬 | 左前2+左1、右前2+右1 (2方向) | なし |
| 歩兵 | 前 (1方向) | なし |
| 香車 | なし | 前方向 |
| 飛車 | なし | 前後左右 (4方向) |
| 角行 | なし | 斜め4方向 |
| 竜王 | 斜め4方向 (1マス) | 前後左右 (4方向) |
| 竜馬 | 前後左右 (1マス) | 斜め4方向 |
| 成銀/成桂/成香/と金 | 金将と同じ | なし |

### 6.3 後手の移動方向
- 後手の駒は移動方向の dRow と dCol を両方反転させる（盤面が180度回転した視点）
- 例: 先手の歩は dRow=-1（上方向）、後手の歩は dRow=+1（下方向）

---

## 7. 初期盤面配置

### 7.1 配置図（先手視点）

```
段＼筋  9    8    7    6    5    4    3    2    1
一    香   桂   銀   金   玉   金   銀   桂   香   ← 後手
二    __   飛   __   __   __   __   __   角   __   ← 後手
三    歩   歩   歩   歩   歩   歩   歩   歩   歩   ← 後手
四    __   __   __   __   __   __   __   __   __
五    __   __   __   __   __   __   __   __   __
六    __   __   __   __   __   __   __   __   __
七    歩   歩   歩   歩   歩   歩   歩   歩   歩   ← 先手
八    __   角   __   __   __   __   __   飛   __   ← 先手
九    香   桂   銀   金   王   金   銀   桂   香   ← 先手
```

### 7.2 初期配置データ

```typescript
// board[row][col] (0-indexed)
// row=0 が一段目（後手陣）、row=8 が九段目（先手陣）
// col=0 が9筋、col=8 が1筋

const INITIAL_BOARD: Board = [
  // 一段目（後手）
  [
    { type: 'lance', owner: 'gote' },
    { type: 'knight', owner: 'gote' },
    { type: 'silver', owner: 'gote' },
    { type: 'gold', owner: 'gote' },
    { type: 'king', owner: 'gote' },
    { type: 'gold', owner: 'gote' },
    { type: 'silver', owner: 'gote' },
    { type: 'knight', owner: 'gote' },
    { type: 'lance', owner: 'gote' },
  ],
  // 二段目（後手）
  [
    null,
    { type: 'rook', owner: 'gote' },
    null, null, null, null, null,
    { type: 'bishop', owner: 'gote' },
    null,
  ],
  // 三段目（後手の歩）
  Array(9).fill(null).map(() => ({ type: 'pawn' as const, owner: 'gote' as const })),
  // 四〜六段目（空）
  Array(9).fill(null),
  Array(9).fill(null),
  Array(9).fill(null),
  // 七段目（先手の歩）
  Array(9).fill(null).map(() => ({ type: 'pawn' as const, owner: 'sente' as const })),
  // 八段目（先手）
  [
    null,
    { type: 'bishop', owner: 'sente' },
    null, null, null, null, null,
    { type: 'rook', owner: 'sente' },
    null,
  ],
  // 九段目（先手）
  [
    { type: 'lance', owner: 'sente' },
    { type: 'knight', owner: 'sente' },
    { type: 'silver', owner: 'sente' },
    { type: 'gold', owner: 'sente' },
    { type: 'king', owner: 'sente' },
    { type: 'gold', owner: 'sente' },
    { type: 'silver', owner: 'sente' },
    { type: 'knight', owner: 'sente' },
    { type: 'lance', owner: 'sente' },
  ],
]
```

---

## 8. 禁手チェック仕様

### 8.1 チェック対象

| 禁手 | 判定タイミング | 判定方法 |
|------|-------------|---------|
| 二歩 | 持ち駒の歩を打つ時 | 打とうとしている筋に、同じプレイヤーの歩（成っていない）が既にあるか |
| 打ち歩詰め | 持ち駒の歩を打つ時 | 歩を打った結果、相手の王が詰みになるか（ただし突き歩詰めはOK） |
| 行き所のない駒 | 駒を移動/打つ時 | 先手: 歩・香 → row=0 に移動不可、桂 → row=0,1 に移動不可。後手: 歩・香 → row=8 に移動不可、桂 → row=7,8 に移動不可 |
| 王手放置 | 全ての手 | 指した後に自分の王に王手がかかる手は合法手から除外 |

### 8.2 合法手フィルタリング順序

1. 駒の移動パターンから候補手を生成
2. 盤外チェック（座標が0-8の範囲内か）
3. 味方駒チェック（移動先に味方の駒がないか）
4. 経路チェック（スライド移動で途中に駒がないか）
5. 行き所のない駒チェック
6. 王手放置チェック（仮に指した後の盤面で自玉に王手がかかるか）
7. 二歩チェック（持ち駒の歩を打つ場合）
8. 打ち歩詰めチェック（持ち駒の歩を打つ場合）

---

## 9. 成り判定仕様

### 9.1 成りの条件

| 条件 | 説明 |
|------|------|
| 移動元が敵陣（相手から見て1-3段目） | 敵陣から出る時に成れる |
| 移動先が敵陣 | 敵陣に入る時に成れる |
| 既に成っている | 成れない |
| 金将・王将 | 成れない |

### 9.2 強制成り

| 駒 | 条件 | 理由 |
|----|------|------|
| 歩・香 | 相手陣の1段目（最奥）に到達 | これ以上前に進めない |
| 桂 | 相手陣の1-2段目に到達 | 跳ぶ先がない |

### 9.3 敵陣の定義

| プレイヤー | 敵陣（row, 0-indexed） |
|-----------|----------------------|
| 先手 | row 0, 1, 2（一〜三段目） |
| 後手 | row 6, 7, 8（七〜九段目） |

---

## 10. Zustand ストア設計

### 10.1 ストア構成

```typescript
interface GameStore {
  // 状態
  appState: 'title' | 'playing' | 'game_over'
  gameState: GameState
  ui: UIState

  // ゲーム開始・再開
  startNewGame: () => void                  // 新規対局開始
  resumeGame: () => void                    // 保存された対局を再開

  // 駒の選択
  selectPiece: (position: Position) => void       // 盤上の駒を選択
  selectCapturedPiece: (pieceType: PieceType) => void  // 持ち駒を選択
  deselectPiece: () => void                       // 選択解除

  // 駒の移動
  movePiece: (to: Position) => void          // 盤上の駒を移動
  dropPiece: (to: Position) => void          // 持ち駒を打つ

  // 成り選択
  promote: (doPromote: boolean) => void      // 成りダイアログの選択結果

  // Undo / Redo
  undo: () => void                           // 1手戻す
  redo: () => void                           // 1手進む

  // ゲーム終了
  resign: () => void                         // 投了
  resetGame: () => void                      // 盤面リセット（対局継続）
  goToTitle: () => void                      // タイトル画面へ戻る

  // UI制御
  toggleMenu: () => void                     // メニューの開閉
  toggleMute: () => void                     // ミュートの切替

  // アニメーション完了コールバック
  completeMoveAnimation: () => void          // 移動アニメーション完了
  completePromotion: () => void              // 成りアニメーション完了
  completeTurnSwitch: () => void             // 手番交代完了
  completeCheckNotify: () => void            // 王手通知消去

  // ヒント
  setHint: (level: 1 | 2) => void           // ヒントレベル設定（タイマーから呼出）
  clearHint: () => void                      // ヒントクリア
  showHint: () => void                       // 即座にレベル2ヒント表示（ボタンから呼出）

  // その他
  clearForcedPromotion: () => void           // 強制成りトースト消去
  clearPraise: () => void                    // ほめメッセージ消去
}
```

### 10.2 永続化

```typescript
// Zustand の persist ミドルウェアで localStorage に保存
// 保存キー: 'shogyuu_game_state'
// 保存対象: board, capturedPieces, currentPlayer, moveHistory, isMuted
// 除外: phase, selectedPosition, legalMoves, ui (isMenuOpen, isAnimating, animatingMove等) 等の一時的なUI状態
// 復元時: phase=idle にリセット、soundEngine.setMuted() でミュート状態を同期
```

---

## 11. ロジックモジュール公開API

### 11.1 board.ts（盤面操作）

| 関数 | シグネチャ | 説明 |
|------|----------|------|
| createInitialBoard | `() => Board` | 初期盤面のディープコピーを生成 |
| cloneBoard | `(board: Board) => Board` | 盤面のイミュータブルクローン |
| getPieceAt | `(board: Board, pos: Position) => Piece \| null` | 指定位置の駒を取得 |
| setPieceAt | `(board: Board, pos: Position, piece: Piece) => Board` | 指定位置に駒を配置（新盤面を返す） |
| removePieceAt | `(board: Board, pos: Position) => Board` | 指定位置の駒を除去（新盤面を返す） |
| findKing | `(board: Board, player: Player) => Position \| null` | 王の位置を検索 |
| createInitialCapturedPieces | `() => CapturedPieces` | 空の持ち駒を生成 |
| addCapturedPiece | `(captured, player, pieceType) => CapturedPieces` | 持ち駒に追加 |
| consumeCapturedPiece | `(captured, player, pieceType) => CapturedPieces` | 持ち駒から消費 |

### 11.2 moves.ts（合法手生成）

| 関数 | シグネチャ | 説明 |
|------|----------|------|
| getMovePattern | `(pieceType) => MovePattern` | 駒種の移動パターンを取得 |
| applyPlayerDirection | `(dir, player) => MoveDirection` | 後手用に方向を反転 |
| isInCheck | `(board, player) => boolean` | player の王に王手がかかっているか |
| generateMoveCandidates | `(board, pos) => Position[]` | 合法性チェックなしの移動候補 |
| getLegalMoves | `(board, pos, capturedPieces, currentPlayer) => Position[]` | 完全な合法手リスト |
| getLegalDrops | `(board, currentPlayer, pieceType, capturedPieces) => Position[]` | 持ち駒の打てるマスリスト |

### 11.3 rules.ts（禁手・成り・詰み）

| 関数 | シグネチャ | 説明 |
|------|----------|------|
| isNifu | `(board, player, col) => boolean` | 二歩チェック |
| hasNoEscape | `(pieceType, player, pos) => boolean` | 行き所のない駒チェック |
| isUchifuzume | `(board, player, pos, capturedPieces) => boolean` | 打ち歩詰めチェック |
| getCheckingPieces | `(board, player) => Position[]` | 王手をかけている駒の位置一覧 |
| isCheckmate | `(board, capturedPieces, player) => boolean` | 詰み判定 |
| canPromote | `(piece, from, to) => boolean` | 成り可能か |
| mustPromote | `(piece, to) => boolean` | 強制成りか |
| getPromotedType | `(pieceType) => PromotedPieceType \| null` | 成駒の型を取得 |
| getDemotedType | `(pieceType) => PieceType` | 成駒→元の駒の型を取得 |

### 11.4 game.ts（ゲーム進行）

| 関数 | シグネチャ | 説明 |
|------|----------|------|
| createInitialGameState | `() => GameState` | 初期ゲーム状態を生成 |
| executeMove | `(state, from, to, promote) => GameState` | 盤上の駒を移動（履歴追加・手番交代含む） |
| executeDrop | `(state, pieceType, to) => GameState` | 持ち駒を打つ（履歴追加・手番交代含む） |
| undoMove | `(state) => GameState` | 1手戻す |
| redoMove | `(state) => GameState` | 1手進む |

### 11.5 hint.ts（ヒント）

| 関数 | シグネチャ | 説明 |
|------|----------|------|
| getMovablePieces | `(board, capturedPieces, player) => Position[]` | 合法手を持つ全駒の位置（レベル1用） |
| getRecommendedMove | `(board, capturedPieces, player) => { piece: Position; moves: Position[] } \| null` | おすすめ駒＋合法手（レベル2用） |

### 11.6 sound/soundEngine.ts（効果音）

| 関数/クラス | シグネチャ | 説明 |
|-----------|----------|------|
| SoundEngine.play | `(id: SoundId) => void` | 効果音を再生 |
| SoundEngine.setMuted | `(muted: boolean) => void` | ミュート設定 |
| SoundEngine.isMuted | `() => boolean` | ミュート状態取得 |
| playSound | `(id: SoundId) => void` | シングルトンの play() ラッパー |

### 11.7 haptics.ts（触覚フィードバック）

| 関数 | シグネチャ | パターン |
|------|----------|---------|
| hapticSelect | `(isMuted: boolean) => void` | 10ms |
| hapticPlace | `(isMuted: boolean) => void` | 20ms |
| hapticCapture | `(isMuted: boolean) => void` | [20, 10, 30]ms |
| hapticPromote | `(isMuted: boolean) => void` | [10, 30, 15, 30, 20]ms |
| hapticCheck | `(isMuted: boolean) => void` | [30, 50, 30, 50, 30]ms |
| hapticCheckmate | `(isMuted: boolean) => void` | [50, 30, 80]ms |
| hapticUndoRedo | `(isMuted: boolean) => void` | 10ms |

### 11.8 praise.ts（ほめメッセージ）

| 関数/定数 | シグネチャ | 説明 |
|----------|----------|------|
| CAPTURE_MESSAGES | `string[]` | 駒取得時メッセージ（5種） |
| FIRST_CAPTURE_MESSAGE | `string` | 初回駒取得メッセージ（固定） |
| PROMOTE_MESSAGES | `string[]` | 成り時メッセージ（3種） |
| MILESTONE_MESSAGES | `string[]` | マイルストーンメッセージ（3種） |
| pickMessage | `(messages: string[], lastMessage: string \| null) => string` | 前回と重複しないランダム選出 |

---

## 12. フック

### 12.1 useHintTimer

```typescript
interface UseHintTimerOptions {
  phase: GamePhase       // 現在のフェーズ
  isMenuOpen: boolean    // メニュー開閉状態
  onLevel1: () => void   // 10秒後のコールバック
  onLevel2: () => void   // 15秒後のコールバック
  onClear: () => void    // ヒントクリアのコールバック
}

function useHintTimer(options: UseHintTimerOptions): void
```

- `phase === 'idle'` かつ `isMenuOpen === false` の間、10秒後に `onLevel1`、15秒後に `onLevel2` を呼び出す
- `phase` が idle 以外になるか `isMenuOpen` が true になるとタイマーリセット＋ `onClear` 呼び出し
- コールバックは ref で保持し、stale closure を防止

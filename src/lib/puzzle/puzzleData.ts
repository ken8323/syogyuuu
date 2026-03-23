import type { Board, Piece } from '@/lib/shogi/types'
import type { PuzzleDefinition } from './puzzleTypes'

// ヘルパー: 駒を簡潔に生成
const S = (type: Piece['type']): Piece => ({ type, owner: 'sente' })
const G = (type: Piece['type']): Piece => ({ type, owner: 'gote' })

// ヘルパー: 空の9x9盤面を作成
function emptyBoard(): Board {
  return Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => null))
}

// ヘルパー: 盤面に駒を配置
// 座標系: row=0 は一段目（後手側）, col=0 は9筋（右端）
// 日本語表記との対応: 筋=9-col, 段=row+1
function placeOnBoard(placements: Array<[number, number, Piece]>): Board {
  const board = emptyBoard()
  for (const [row, col, piece] of placements) {
    board[row][col] = piece
  }
  return board
}

// ============================================================
// 1手詰め（10問）
// ============================================================
// 全問テスト検証済み: isCheckmate が成立することを確認

export const PUZZLES_1TE: PuzzleDefinition[] = [
  {
    // 頭金: 玉の頭に金を打って詰み
    // 玉5一(0,4), 飛5三(2,4) → 金打ち5二(1,4)
    // 金が王手、飛が5二を守る。4一/6一は金が利く、4二/6二も金が利く
    id: '1te-01',
    difficulty: '1te',
    title: '1てづめ もんだい1',
    board: placeOnBoard([
      [0, 4, G('king')],      // 5一 玉
      [2, 4, S('rook')],      // 5三 飛
    ]),
    attackerCaptured: { gold: 1 },
    solution: [{ from: null, to: { row: 1, col: 4 }, pieceType: 'gold' }],
  },
  {
    // 腹金: 金を横から寄せて詰み
    // 玉1一(0,8), 金2三(2,7), 銀1三(2,8) → 金→1二(1,8)
    // 金1二から王手。銀1三が1二を守る。2一/2二は金が利く
    id: '1te-02',
    difficulty: '1te',
    title: '1てづめ もんだい2',
    board: placeOnBoard([
      [0, 8, G('king')],      // 1一 玉
      [2, 7, S('gold')],      // 2三 金
      [2, 8, S('silver')],    // 1三 銀
    ]),
    attackerCaptured: {},
    solution: [{ from: { row: 2, col: 7 }, to: { row: 1, col: 8 } }],
  },
  {
    // 持ち駒の金を打って詰み（銀で退路封鎖）
    // 玉1一(0,8), 銀2一(0,7) → 金打ち1二(1,8)
    // 銀は横に利かないので王手にならない。金1二で王手。
    // 2一は銀、2二は金左が利く、金を取ると銀の後方斜めが守る
    id: '1te-03',
    difficulty: '1te',
    title: '1てづめ もんだい3',
    board: placeOnBoard([
      [0, 8, G('king')],      // 1一 玉
      [0, 7, S('silver')],    // 2一 銀（横に利かないので王手にならない）
    ]),
    attackerCaptured: { gold: 1 },
    solution: [{ from: null, to: { row: 1, col: 8 }, pieceType: 'gold' }],
  },
  {
    // 金打ちで王手、壁駒+金で退路封鎖
    // 玉1一(0,8), 金3一(0,6), 歩1二(1,8)後手 → 金打ち2一(0,7)
    // 金2一から王手(右=1一)。1二は自歩で逃げられない。
    // 2二は金2一の後方が利く。金を取ると金3一が守る（右=2一ではないが
    // 実際は金3一(0,6)右=(0,7)=2一、同じマスなので取れない）
    id: '1te-04',
    difficulty: '1te',
    title: '1てづめ もんだい4',
    board: placeOnBoard([
      [0, 8, G('king')],      // 1一 玉
      [0, 6, S('gold')],      // 3一 金（2マス離れているので王手にならない）
      [1, 8, G('pawn')],      // 1二 歩・後手（壁駒）
    ]),
    attackerCaptured: { gold: 1 },
    solution: [{ from: null, to: { row: 0, col: 7 }, pieceType: 'gold' }],
  },
  {
    // 飛車打ちで一段目を制圧して詰み
    // 玉1一(0,8), 金2三(2,7) → 飛打ち5一(0,4)
    // 飛5一から横利きで王手。玉は飛を取れない（4マス離れている）。
    // 2一は飛の横利き、2二は金の前方、1二は金の前方斜め右が利く
    id: '1te-05',
    difficulty: '1te',
    title: '1てづめ もんだい5',
    board: placeOnBoard([
      [0, 8, G('king')],      // 1一 玉
      [2, 7, S('gold')],      // 2三 金
    ]),
    attackerCaptured: { rook: 1 },
    solution: [{ from: null, to: { row: 0, col: 4 }, pieceType: 'rook' }],
  },
  {
    // 金の移動で詰み
    // 玉1一(0,8), 銀2一(0,7), 金1三(2,8) → 金1三→1二(1,8)
    // 銀が横を封鎖。金が前進して王手。銀の後方斜めが金を守る
    id: '1te-06',
    difficulty: '1te',
    title: '1てづめ もんだい6',
    board: placeOnBoard([
      [0, 8, G('king')],      // 1一 玉
      [0, 7, S('silver')],    // 2一 銀
      [2, 8, S('gold')],      // 1三 金
    ]),
    attackerCaptured: {},
    solution: [{ from: { row: 2, col: 8 }, to: { row: 1, col: 8 } }],
  },
  {
    // 金打ちで中央の玉を詰める
    // 玉5一(0,4), 銀6一(0,3), 歩4一(0,5)後手 → 金打ち5二(1,4)
    // 金5二から王手。6一は銀、4一は自歩。6二/4二は金が利く
    id: '1te-07',
    difficulty: '1te',
    title: '1てづめ もんだい7',
    board: placeOnBoard([
      [0, 4, G('king')],      // 5一 玉
      [0, 3, S('silver')],    // 6一 銀（横に利かないので王手にならない）
      [0, 5, G('pawn')],      // 4一 歩・後手（壁駒）
    ]),
    attackerCaptured: { gold: 1 },
    solution: [{ from: null, to: { row: 1, col: 4 }, pieceType: 'gold' }],
  },
  {
    // 桂馬打ちで詰み
    // 玉1一(0,8), 銀2一(0,7), 金3二(1,6), 歩1二(1,8)後手 → 桂打ち2三(2,7)
    // 桂2三は(0,6)=3一と(0,8)=1一に利く。1一に王手。
    // 2一は銀、2二は金3二の右が利く、1二は自歩
    id: '1te-08',
    difficulty: '1te',
    title: '1てづめ もんだい8',
    board: placeOnBoard([
      [0, 8, G('king')],      // 1一 玉
      [0, 7, S('silver')],    // 2一 銀
      [1, 6, S('gold')],      // 3二 金
      [1, 8, G('pawn')],      // 1二 歩・後手（壁駒）
    ]),
    attackerCaptured: { knight: 1 },
    solution: [{ from: null, to: { row: 2, col: 7 }, pieceType: 'knight' }],
  },
  {
    // 金打ちで2筋の玉を詰める
    // 玉2一(0,7), 銀3一(0,6) → 金打ち2二(1,7)
    // 銀は横に利かないので王手にならない。金2二から王手(前方=2一)。
    // 1一は金の前方斜め右、3一は銀、3二は金左。
    // 金を取ると銀の後方斜めが守る
    id: '1te-09',
    difficulty: '1te',
    title: '1てづめ もんだい9',
    board: placeOnBoard([
      [0, 7, G('king')],      // 2一 玉
      [0, 6, S('silver')],    // 3一 銀（横に利かないので王手にならない）
    ]),
    attackerCaptured: { gold: 1 },
    solution: [{ from: null, to: { row: 1, col: 7 }, pieceType: 'gold' }],
  },
  {
    // 銀成りで詰み
    // 玉5一(0,4), 飛5三(2,4), 銀6三(2,3) → 銀6三→5二成(1,4)
    // 成銀（金と同じ動き）5二から王手。飛5三が5二を守る。4一/6一は成銀が利く
    id: '1te-10',
    difficulty: '1te',
    title: '1てづめ もんだい10',
    board: placeOnBoard([
      [0, 4, G('king')],      // 5一 玉
      [2, 4, S('rook')],      // 5三 飛
      [2, 3, S('silver')],    // 6三 銀
    ]),
    attackerCaptured: {},
    solution: [{ from: { row: 2, col: 3 }, to: { row: 1, col: 4 }, promote: true }],
  },
]

// ============================================================
// 3手詰め（10問）
// ============================================================
// 全問テスト検証済み

export const PUZZLES_3TE: PuzzleDefinition[] = [
  {
    // 追い金: 金打ち → 玉逃げ → 金打ち（1筋）
    // 玉1二(1,8), 歩1一(0,8)後手, 飛1四(3,8), 持ち駒:金2
    // Step1: 金打ち1三(2,8) 王手。飛が1三を守る。玉は2一(0,7)のみ逃げ可。
    // Step2: 玉→2一(0,7)
    // Step3: 金打ち2二(1,7) 王手。1三の金の前方斜め左が2二を守る。
    //   3一は金の前方斜め左、1一は自歩、3二/2二/1二は金が利く → 詰み
    id: '3te-01',
    difficulty: '3te',
    title: '3てづめ もんだい1',
    board: placeOnBoard([
      [1, 8, G('king')],      // 1二 玉
      [0, 8, G('pawn')],      // 1一 歩・後手（壁）
      [3, 8, S('rook')],      // 1四 飛
    ]),
    attackerCaptured: { gold: 2 },
    solution: [
      { from: null, to: { row: 2, col: 8 }, pieceType: 'gold' },              // 金打ち1三（王手）
      { from: { row: 1, col: 8 }, to: { row: 0, col: 7 } },                   // 玉→2一
      { from: null, to: { row: 1, col: 7 }, pieceType: 'gold' },              // 金打ち2二（詰み）
    ],
  },
  {
    // 追い金: 金打ち → 玉逃げ → 金打ち（2筋）
    // 玉2二(1,7), 歩2一(0,7)後手, 歩3一(0,6)後手, 飛2五(4,7), 持ち駒:金2
    // Step1: 金打ち2三(2,7) 王手。飛が守る。逃げ場は1一(0,8)のみ。
    // Step2: 玉→1一(0,8)
    // Step3: 金打ち1二(1,8) 王手。2三の金の前方斜め右が守る。
    //   2一は自歩、2二は金が利く → 詰み
    id: '3te-02',
    difficulty: '3te',
    title: '3てづめ もんだい2',
    board: placeOnBoard([
      [1, 7, G('king')],      // 2二 玉
      [0, 7, G('pawn')],      // 2一 歩・後手（壁）
      [0, 6, G('pawn')],      // 3一 歩・後手（壁）
      [4, 7, S('rook')],      // 2五 飛
    ]),
    attackerCaptured: { gold: 2 },
    solution: [
      { from: null, to: { row: 2, col: 7 }, pieceType: 'gold' },              // 金打ち2三（王手）
      { from: { row: 1, col: 7 }, to: { row: 0, col: 8 } },                   // 玉→1一
      { from: null, to: { row: 1, col: 8 }, pieceType: 'gold' },              // 金打ち1二（詰み）
    ],
  },
  {
    // 追い金: 金打ち → 玉逃げ → 金寄り（5筋）
    // 玉5二(1,4), 歩4一(0,5)後手, 飛5四(3,4), 持ち駒:金1
    // Step1: 金打ち5三(2,4) 王手。飛が守る。逃げ場は6一/5一。5一に逃げる。
    // Step2: 玉→5一(0,4)
    // Step3: 金5三→5二(1,4) 王手。飛が5三経由で守る。
    //   6一/4一は金が利く → 詰み
    id: '3te-03',
    difficulty: '3te',
    title: '3てづめ もんだい3',
    board: placeOnBoard([
      [1, 4, G('king')],      // 5二 玉
      [0, 5, G('pawn')],      // 4一 歩・後手（壁）
      [3, 4, S('rook')],      // 5四 飛
    ]),
    attackerCaptured: { gold: 1 },
    solution: [
      { from: null, to: { row: 2, col: 4 }, pieceType: 'gold' },              // 金打ち5三（王手）
      { from: { row: 1, col: 4 }, to: { row: 0, col: 4 } },                   // 玉→5一
      { from: { row: 2, col: 4 }, to: { row: 1, col: 4 } },                   // 金5三→5二（詰み）
    ],
  },
  {
    // 追い金: 金打ち → 玉逃げ → 金打ち（3筋）
    // 玉3二(1,6), 歩3一(0,6)後手, 歩2一(0,7)後手, 飛3五(4,6), 持ち駒:金2
    // Step1: 金打ち3三(2,6) 王手。飛が守る。4一(0,5)のみ逃げ可。
    // Step2: 玉→4一(0,5)
    // Step3: 金打ち4二(1,5) 王手。3三の金が守る。
    //   5一は金が利く、3一は自歩、5二/3二は金が利く → 詰み
    id: '3te-04',
    difficulty: '3te',
    title: '3てづめ もんだい4',
    board: placeOnBoard([
      [1, 6, G('king')],      // 3二 玉
      [0, 6, G('pawn')],      // 3一 歩・後手（壁）
      [0, 7, G('pawn')],      // 2一 歩・後手（壁）
      [4, 6, S('rook')],      // 3五 飛
    ]),
    attackerCaptured: { gold: 2 },
    solution: [
      { from: null, to: { row: 2, col: 6 }, pieceType: 'gold' },              // 金打ち3三（王手）
      { from: { row: 1, col: 6 }, to: { row: 0, col: 5 } },                   // 玉→4一
      { from: null, to: { row: 1, col: 5 }, pieceType: 'gold' },              // 金打ち4二（詰み）
    ],
  },
  {
    // 追い金: 金打ち → 玉逃げ → 金打ち（壁玉パターン）
    // 玉5二(1,4), 歩5一(0,4)後手, 飛5四(3,4), 持ち駒:金2
    // Step1: 金打ち5三(2,4) 王手。飛が守る。4一(0,5)のみ逃げ可。
    // Step2: 玉→4一(0,5)
    // Step3: 金打ち4二(1,5) 王手。5三の金が守る。
    //   3一は金の前方斜め右、5一は自歩、5二は金が利く → 詰み
    id: '3te-05',
    difficulty: '3te',
    title: '3てづめ もんだい5',
    board: placeOnBoard([
      [1, 4, G('king')],      // 5二 玉
      [0, 4, G('pawn')],      // 5一 歩・後手（壁）
      [3, 4, S('rook')],      // 5四 飛
    ]),
    attackerCaptured: { gold: 2 },
    solution: [
      { from: null, to: { row: 2, col: 4 }, pieceType: 'gold' },              // 金打ち5三（王手）
      { from: { row: 1, col: 4 }, to: { row: 0, col: 5 } },                   // 玉→4一
      { from: null, to: { row: 1, col: 5 }, pieceType: 'gold' },              // 金打ち4二（詰み）
    ],
  },
  {
    // 追い金: 金打ち → 玉逃げ → 金打ち（7筋）
    // 玉7二(1,2), 歩7一(0,2)後手, 歩8一(0,1)後手, 飛7五(4,2), 持ち駒:金2
    // Step1: 金打ち7三(2,2) 王手。飛が守る。6一(0,3)のみ逃げ可。
    // Step2: 玉→6一(0,3)
    // Step3: 金打ち6二(1,3) 王手。7三の金が守る。
    //   5一は金が利く、7一は自歩、5二/7二は金が利く → 詰み
    id: '3te-06',
    difficulty: '3te',
    title: '3てづめ もんだい6',
    board: placeOnBoard([
      [1, 2, G('king')],      // 7二 玉
      [0, 2, G('pawn')],      // 7一 歩・後手（壁）
      [0, 1, G('pawn')],      // 8一 歩・後手（壁）
      [4, 2, S('rook')],      // 7五 飛
    ]),
    attackerCaptured: { gold: 2 },
    solution: [
      { from: null, to: { row: 2, col: 2 }, pieceType: 'gold' },              // 金打ち7三（王手）
      { from: { row: 1, col: 2 }, to: { row: 0, col: 3 } },                   // 玉→6一
      { from: null, to: { row: 1, col: 3 }, pieceType: 'gold' },              // 金打ち6二（詰み）
    ],
  },
  {
    // 追い金: 金打ち → 玉逃げ → 金打ち（1筋上逃げ）
    // 玉1二(1,8), 歩2一(0,7)後手, 飛1四(3,8), 持ち駒:金2
    // Step1: 金打ち1三(2,8) 王手。飛が守る。1一(0,8)のみ逃げ可。
    // Step2: 玉→1一(0,8)
    // Step3: 金打ち1二(1,8) 王手。1三の金が守る。
    //   2一は自歩、2二は金が利く → 詰み
    id: '3te-07',
    difficulty: '3te',
    title: '3てづめ もんだい7',
    board: placeOnBoard([
      [1, 8, G('king')],      // 1二 玉
      [0, 7, G('pawn')],      // 2一 歩・後手（壁）
      [3, 8, S('rook')],      // 1四 飛
    ]),
    attackerCaptured: { gold: 2 },
    solution: [
      { from: null, to: { row: 2, col: 8 }, pieceType: 'gold' },              // 金打ち1三（王手）
      { from: { row: 1, col: 8 }, to: { row: 0, col: 8 } },                   // 玉→1一
      { from: null, to: { row: 1, col: 8 }, pieceType: 'gold' },              // 金打ち1二（詰み）
    ],
  },
  {
    // 追い金: 金打ち → 玉逃げ → 金打ち（8筋、壁玉）
    // 玉8二(1,1), 歩8一(0,1)後手, 歩9一(0,0)後手, 歩9二(1,0)後手, 飛8四(3,1), 持ち駒:金2
    // Step1: 金打ち8三(2,1) 王手。飛が守る。7一(0,2)のみ逃げ可。
    // Step2: 玉→7一(0,2)
    // Step3: 金打ち7二(1,2) 王手。8三の金が守る。
    //   8一は自歩、6一は金が利く、8二は金が利く → 詰み
    id: '3te-08',
    difficulty: '3te',
    title: '3てづめ もんだい8',
    board: placeOnBoard([
      [1, 1, G('king')],      // 8二 玉
      [0, 1, G('pawn')],      // 8一 歩・後手（壁）
      [0, 0, G('pawn')],      // 9一 歩・後手（壁）
      [1, 0, G('pawn')],      // 9二 歩・後手（壁）
      [3, 1, S('rook')],      // 8四 飛
    ]),
    attackerCaptured: { gold: 2 },
    solution: [
      { from: null, to: { row: 2, col: 1 }, pieceType: 'gold' },              // 金打ち8三（王手）
      { from: { row: 1, col: 1 }, to: { row: 0, col: 2 } },                   // 玉→7一
      { from: null, to: { row: 1, col: 2 }, pieceType: 'gold' },              // 金打ち7二（詰み）
    ],
  },
  {
    // 追い金: 金打ち → 玉逃げ → 金打ち（9筋）
    // 玉9二(1,0), 歩9一(0,0)後手, 飛9四(3,0), 持ち駒:金2
    // Step1: 金打ち9三(2,0) 王手。飛が守る。8一(0,1)のみ逃げ可。
    // Step2: 玉→8一(0,1)
    // Step3: 金打ち8二(1,1) 王手。9三の金が守る。
    //   9一は自歩、7一は金が利く、9二は金が利く → 詰み
    id: '3te-09',
    difficulty: '3te',
    title: '3てづめ もんだい9',
    board: placeOnBoard([
      [1, 0, G('king')],      // 9二 玉
      [0, 0, G('pawn')],      // 9一 歩・後手（壁）
      [3, 0, S('rook')],      // 9四 飛
    ]),
    attackerCaptured: { gold: 2 },
    solution: [
      { from: null, to: { row: 2, col: 0 }, pieceType: 'gold' },              // 金打ち9三（王手）
      { from: { row: 1, col: 0 }, to: { row: 0, col: 1 } },                   // 玉→8一
      { from: null, to: { row: 1, col: 1 }, pieceType: 'gold' },              // 金打ち8二（詰み）
    ],
  },
  {
    // 追い金: 金打ち → 玉逃げ → 金打ち（壁玉パターン2）
    // 玉5二(1,4), 歩5一(0,4)後手, 歩4一(0,5)後手, 飛5四(3,4), 持ち駒:金2
    // Step1: 金打ち5三(2,4) 王手。飛が守る。6一(0,3)のみ逃げ可。
    // Step2: 玉→6一(0,3)
    // Step3: 金打ち6二(1,3) 王手。5三の金が守る。
    //   7一は金が利く、5一は自歩、7二/5二は金が利く → 詰み
    id: '3te-10',
    difficulty: '3te',
    title: '3てづめ もんだい10',
    board: placeOnBoard([
      [1, 4, G('king')],      // 5二 玉
      [0, 4, G('pawn')],      // 5一 歩・後手（壁）
      [0, 5, G('pawn')],      // 4一 歩・後手（壁）
      [3, 4, S('rook')],      // 5四 飛
    ]),
    attackerCaptured: { gold: 2 },
    solution: [
      { from: null, to: { row: 2, col: 4 }, pieceType: 'gold' },              // 金打ち5三（王手）
      { from: { row: 1, col: 4 }, to: { row: 0, col: 3 } },                   // 玉→6一
      { from: null, to: { row: 1, col: 3 }, pieceType: 'gold' },              // 金打ち6二（詰み）
    ],
  },
]

export const ALL_PUZZLES: PuzzleDefinition[] = [...PUZZLES_1TE, ...PUZZLES_3TE]

export function findPuzzleById(id: string): PuzzleDefinition | undefined {
  return ALL_PUZZLES.find(p => p.id === id)
}

export function getNextPuzzleId(currentId: string): string | null {
  const idx = ALL_PUZZLES.findIndex(p => p.id === currentId)
  if (idx < 0 || idx >= ALL_PUZZLES.length - 1) return null
  return ALL_PUZZLES[idx + 1].id
}

export function hasNextPuzzle(currentId: string): boolean {
  const idx = ALL_PUZZLES.findIndex(p => p.id === currentId)
  return idx >= 0 && idx < ALL_PUZZLES.length - 1
}

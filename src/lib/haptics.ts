/**
 * 触覚フィードバック（Haptics）
 *
 * Web Vibration API を薄くラップしたユーティリティ。
 * - 未対応環境（iOS Safari など）では navigator.vibrate が存在しないため
 *   optional chaining（?.）で無視し、エラーを発生させない。
 * - ミュート状態と連動させるため、isMuted フラグを受け取る関数群として提供する。
 */

/** 振動を実行する内部ヘルパー（ミュート時はスキップ） */
function vibrate(pattern: number | number[], isMuted: boolean): void {
  if (isMuted) return
  if (typeof navigator === 'undefined') return
  navigator.vibrate?.(pattern)
}

/** 駒選択: 単発 10ms（light tap） */
export function hapticSelect(isMuted: boolean): void {
  vibrate(10, isMuted)
}

/** 駒配置 / 持ち駒打ち: 単発 20ms（medium tap） */
export function hapticPlace(isMuted: boolean): void {
  vibrate(20, isMuted)
}

/** 駒捕獲: ダブルタップ [20ms, 10ms gap, 30ms] */
export function hapticCapture(isMuted: boolean): void {
  vibrate([20, 10, 30], isMuted)
}

/** 成り: 上昇パターン [10, 30, 15, 30, 20] */
export function hapticPromote(isMuted: boolean): void {
  vibrate([10, 30, 15, 30, 20], isMuted)
}

/** 王手: 警告パターン [30, 50, 30, 50, 30] */
export function hapticCheck(isMuted: boolean): void {
  vibrate([30, 50, 30, 50, 30], isMuted)
}

/** 詰み: 長い振動 [50, 30, 80] */
export function hapticCheckmate(isMuted: boolean): void {
  vibrate([50, 30, 80], isMuted)
}

/** Undo / Redo: 単発 10ms */
export function hapticUndoRedo(isMuted: boolean): void {
  vibrate(10, isMuted)
}

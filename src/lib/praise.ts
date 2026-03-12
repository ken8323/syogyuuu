// ============================================================
// ほめメッセージ定義
// ============================================================

export const CAPTURE_MESSAGES = ['すごい！', 'やったね！', 'ナイス！', 'おみごと！', 'かっこいい！']

export const FIRST_CAPTURE_MESSAGE = 'はじめてとれたね！すごい！'

export const PROMOTE_MESSAGES = ['パワーアップ！', 'へんしんせいこう！', 'つよくなったよ！']

export const MILESTONE_MESSAGES = ['いいしょうぶだね！', 'がんばってるね！', 'たのしいね！']

/**
 * メッセージ配列からランダムに1つ選ぶ。
 * lastMessage と同じものが連続しないよう、候補から除外して選ぶ。
 */
export function pickMessage(messages: string[], lastMessage: string | null): string {
  const candidates = messages.length > 1 && lastMessage !== null
    ? messages.filter(m => m !== lastMessage)
    : messages
  return candidates[Math.floor(Math.random() * candidates.length)]
}

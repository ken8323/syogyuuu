/**
 * Web Audio API ベースの効果音エンジン
 *
 * - AudioContext は最初のユーザー操作後に遅延初期化（iOS Safari 制限への対応）
 * - SSR 対応: typeof window チェックで Next.js サーバー側では無操作
 * - ミュート制御: setMuted() / isMuted()
 */

export type SoundId =
  | 'select'   // 駒選択
  | 'place'    // 駒配置
  | 'capture'  // 駒捕獲
  | 'drop'     // 持ち駒打ち
  | 'promote'  // 成り
  | 'forced_promote' // 強制成り
  | 'check'    // 王手
  | 'victory'  // 詰み（勝利）
  | 'undo'     // もどる
  | 'redo'     // すすむ
  | 'ui'       // UIボタン

interface Envelope {
  attack: number   // 秒
  decay: number    // 秒
  sustain: number  // 0.0〜1.0
  release: number  // 秒
}

interface OscillatorSound {
  type: 'oscillator'
  waves: Array<{
    frequency: number
    waveform: OscillatorType
    gain: number
    detune?: number
  }>
  envelope: Envelope
  duration: number  // 秒
}

interface SequenceSound {
  type: 'sequence'
  notes: Array<{
    frequency: number
    waveform: OscillatorType
    gain: number
    startTime: number  // 開始オフセット（秒）
    duration: number   // 秒
  }>
}

type SoundDef = OscillatorSound | SequenceSound

// ============================================================
// 効果音の定義
// ============================================================

const SOUNDS: Record<SoundId, SoundDef> = {
  // 駒選択: 軽い木のタップ音（高め・短い）
  select: {
    type: 'oscillator',
    waves: [{ frequency: 520, waveform: 'sine', gain: 0.25 }],
    envelope: { attack: 0.005, decay: 0.05, sustain: 0, release: 0.03 },
    duration: 0.09,
  },

  // 駒配置: やや低め・少し重い
  place: {
    type: 'oscillator',
    waves: [
      { frequency: 300, waveform: 'sine', gain: 0.3 },
      { frequency: 600, waveform: 'sine', gain: 0.1 },
    ],
    envelope: { attack: 0.005, decay: 0.08, sustain: 0, release: 0.04 },
    duration: 0.13,
  },

  // 駒捕獲: 配置音 + 上昇フラッシュ音
  capture: {
    type: 'sequence',
    notes: [
      { frequency: 300, waveform: 'sine', gain: 0.3, startTime: 0, duration: 0.12 },
      { frequency: 600, waveform: 'sine', gain: 0.1, startTime: 0, duration: 0.12 },
      { frequency: 660, waveform: 'sine', gain: 0.2, startTime: 0.08, duration: 0.1 },
    ],
  },

  // 持ち駒打ち: 配置音と同じ
  drop: {
    type: 'oscillator',
    waves: [
      { frequency: 300, waveform: 'sine', gain: 0.3 },
      { frequency: 600, waveform: 'sine', gain: 0.1 },
    ],
    envelope: { attack: 0.005, decay: 0.08, sustain: 0, release: 0.04 },
    duration: 0.13,
  },

  // 成り: C→E→G→高C のアルペジオ（キラキラ）
  promote: {
    type: 'sequence',
    notes: [
      { frequency: 523, waveform: 'sine', gain: 0.25, startTime: 0,    duration: 0.12 },
      { frequency: 659, waveform: 'sine', gain: 0.25, startTime: 0.1,  duration: 0.12 },
      { frequency: 784, waveform: 'sine', gain: 0.25, startTime: 0.2,  duration: 0.12 },
      { frequency: 1047, waveform: 'sine', gain: 0.3, startTime: 0.3,  duration: 0.2  },
    ],
  },

  // 強制成り: 短縮版アルペジオ
  forced_promote: {
    type: 'sequence',
    notes: [
      { frequency: 523, waveform: 'sine', gain: 0.22, startTime: 0,   duration: 0.09 },
      { frequency: 784, waveform: 'sine', gain: 0.22, startTime: 0.08, duration: 0.09 },
      { frequency: 1047, waveform: 'sine', gain: 0.25, startTime: 0.16, duration: 0.14 },
    ],
  },

  // 王手: 緊張感のある警告音（柔らかめ）
  check: {
    type: 'oscillator',
    waves: [
      { frequency: 220, waveform: 'sine', gain: 0.2 },
      { frequency: 277, waveform: 'sine', gain: 0.15 },  // 不協和音
    ],
    envelope: { attack: 0.01, decay: 0.15, sustain: 0.05, release: 0.1 },
    duration: 0.35,
  },

  // 詰み（勝利）: ファンファーレ
  victory: {
    type: 'sequence',
    notes: [
      { frequency: 523,  waveform: 'sine', gain: 0.28, startTime: 0,    duration: 0.18 },
      { frequency: 659,  waveform: 'sine', gain: 0.28, startTime: 0.18, duration: 0.18 },
      { frequency: 784,  waveform: 'sine', gain: 0.28, startTime: 0.36, duration: 0.18 },
      { frequency: 1047, waveform: 'sine', gain: 0.35, startTime: 0.54, duration: 0.5  },
      // 和音（最後の音に重ねる）
      { frequency: 784,  waveform: 'sine', gain: 0.2,  startTime: 0.54, duration: 0.5  },
      { frequency: 659,  waveform: 'sine', gain: 0.15, startTime: 0.54, duration: 0.5  },
    ],
  },

  // Undo（もどる）: 下降音
  undo: {
    type: 'sequence',
    notes: [
      { frequency: 440, waveform: 'sine', gain: 0.18, startTime: 0,    duration: 0.1 },
      { frequency: 330, waveform: 'sine', gain: 0.18, startTime: 0.09, duration: 0.1 },
    ],
  },

  // Redo（すすむ）: 上昇音
  redo: {
    type: 'sequence',
    notes: [
      { frequency: 330, waveform: 'sine', gain: 0.18, startTime: 0,    duration: 0.1 },
      { frequency: 440, waveform: 'sine', gain: 0.18, startTime: 0.09, duration: 0.1 },
    ],
  },

  // UIボタン: 最短・最軽
  ui: {
    type: 'oscillator',
    waves: [{ frequency: 660, waveform: 'sine', gain: 0.15 }],
    envelope: { attack: 0.003, decay: 0.04, sustain: 0, release: 0.02 },
    duration: 0.06,
  },
}

// ============================================================
// エンジン実装
// ============================================================

class SoundEngine {
  private ctx: AudioContext | null = null
  private muted = false

  /** AudioContext を遅延初期化（最初のユーザー操作後に呼ぶ） */
  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null
    if (!this.ctx) {
      try {
        this.ctx = new AudioContext()
      } catch {
        return null
      }
    }
    // iOS Safari では suspended 状態のことがある
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {})
    }
    return this.ctx
  }

  setMuted(muted: boolean): void {
    this.muted = muted
  }

  isMuted(): boolean {
    return this.muted
  }

  play(id: SoundId): void {
    if (this.muted) return
    const def = SOUNDS[id]
    if (!def) return
    const ctx = this.getContext()
    if (!ctx) return

    if (def.type === 'oscillator') {
      this.playOscillator(ctx, def)
    } else {
      this.playSequence(ctx, def)
    }
  }

  private playOscillator(ctx: AudioContext, def: OscillatorSound): void {
    const { waves, envelope, duration } = def
    const now = ctx.currentTime

    waves.forEach(({ frequency, waveform, gain, detune = 0 }) => {
      const osc = ctx.createOscillator()
      const gainNode = ctx.createGain()

      osc.type = waveform
      osc.frequency.setValueAtTime(frequency, now)
      osc.detune.setValueAtTime(detune, now)

      gainNode.gain.setValueAtTime(0, now)
      gainNode.gain.linearRampToValueAtTime(gain, now + envelope.attack)
      gainNode.gain.linearRampToValueAtTime(gain * envelope.sustain, now + envelope.attack + envelope.decay)
      gainNode.gain.linearRampToValueAtTime(0, now + duration)

      osc.connect(gainNode)
      gainNode.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + duration + envelope.release)
    })
  }

  private playSequence(ctx: AudioContext, def: SequenceSound): void {
    const now = ctx.currentTime

    def.notes.forEach(({ frequency, waveform, gain, startTime, duration }) => {
      const osc = ctx.createOscillator()
      const gainNode = ctx.createGain()

      osc.type = waveform
      osc.frequency.setValueAtTime(frequency, now + startTime)

      gainNode.gain.setValueAtTime(0, now + startTime)
      gainNode.gain.linearRampToValueAtTime(gain, now + startTime + 0.01)
      gainNode.gain.linearRampToValueAtTime(0, now + startTime + duration)

      osc.connect(gainNode)
      gainNode.connect(ctx.destination)

      osc.start(now + startTime)
      osc.stop(now + startTime + duration + 0.02)
    })
  }
}

export const soundEngine = new SoundEngine()

export function playSound(id: SoundId): void {
  soundEngine.play(id)
}

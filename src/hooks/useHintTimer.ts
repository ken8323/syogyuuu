'use client'

import { useEffect, useRef } from 'react'
import type { GamePhase } from '@/lib/shogi/types'

interface UseHintTimerOptions {
  phase: GamePhase
  isMenuOpen: boolean
  onLevel1: () => void
  onLevel2: () => void
  onClear: () => void
}

/**
 * 無操作 10秒で level=1（全駒脈動）、15秒で level=2（おすすめ手表示）をトリガーする。
 * phase が idle 以外になるか isMenuOpen=true になるとタイマーをリセット。
 */
export function useHintTimer({
  phase,
  isMenuOpen,
  onLevel1,
  onLevel2,
  onClear,
}: UseHintTimerOptions) {
  // コールバックを ref で保持してタイマー内での stale closure を防ぐ
  const onLevel1Ref = useRef(onLevel1)
  const onLevel2Ref = useRef(onLevel2)
  const onClearRef = useRef(onClear)

  useEffect(() => {
    onLevel1Ref.current = onLevel1
    onLevel2Ref.current = onLevel2
    onClearRef.current = onClear
  })

  useEffect(() => {
    const clearTimers = (timers: ReturnType<typeof setTimeout>[]) => {
      timers.forEach(clearTimeout)
    }

    // idle 以外またはメニューオープン中はタイマー停止しヒントをクリア
    if (phase !== 'idle' || isMenuOpen) {
      onClearRef.current()
      return
    }

    // idle に入ったら 10s / 15s タイマーをセット
    const t1 = setTimeout(() => {
      onLevel1Ref.current()
      const t2 = setTimeout(() => {
        onLevel2Ref.current()
      }, 5000) // 10s + 5s = 15s
      timers.push(t2)
    }, 10000)

    const timers: ReturnType<typeof setTimeout>[] = [t1]

    return () => clearTimers(timers)
  }, [phase, isMenuOpen])
}

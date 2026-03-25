export type Season = 'spring' | 'summer' | 'autumn' | 'winter'

/**
 * 月（0-11）から季節を判定する
 * 春: 3-5月, 夏: 6-8月, 秋: 9-11月, 冬: 12-2月
 */
export function getSeason(month: number): Season {
  if (month >= 2 && month <= 4) return 'spring'
  if (month >= 5 && month <= 7) return 'summer'
  if (month >= 8 && month <= 10) return 'autumn'
  return 'winter'
}

export function getCurrentSeason(): Season {
  return getSeason(new Date().getMonth())
}

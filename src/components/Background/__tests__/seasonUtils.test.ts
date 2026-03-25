import { describe, it, expect } from 'vitest'
import { getSeason } from '../seasonUtils'

describe('getSeason', () => {
  it('冬: 1月 (month=0)', () => {
    expect(getSeason(0)).toBe('winter')
  })

  it('冬: 2月 (month=1)', () => {
    expect(getSeason(1)).toBe('winter')
  })

  it('春: 3月 (month=2)', () => {
    expect(getSeason(2)).toBe('spring')
  })

  it('春: 4月 (month=3)', () => {
    expect(getSeason(3)).toBe('spring')
  })

  it('春: 5月 (month=4)', () => {
    expect(getSeason(4)).toBe('spring')
  })

  it('夏: 6月 (month=5)', () => {
    expect(getSeason(5)).toBe('summer')
  })

  it('夏: 7月 (month=6)', () => {
    expect(getSeason(6)).toBe('summer')
  })

  it('夏: 8月 (month=7)', () => {
    expect(getSeason(7)).toBe('summer')
  })

  it('秋: 9月 (month=8)', () => {
    expect(getSeason(8)).toBe('autumn')
  })

  it('秋: 10月 (month=9)', () => {
    expect(getSeason(9)).toBe('autumn')
  })

  it('秋: 11月 (month=10)', () => {
    expect(getSeason(10)).toBe('autumn')
  })

  it('冬: 12月 (month=11)', () => {
    expect(getSeason(11)).toBe('winter')
  })
})

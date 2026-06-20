import { describe, it, expect } from 'vitest'
import { formatSeconds } from './formatTime'
import { parseTimeInput } from './parseTime'

describe('formatSeconds', () => {
  it('returns "00:00:00" for 0', () => {
    expect(formatSeconds(0)).toBe('00:00:00')
  })

  it('returns "00:00:05" for 5', () => {
    expect(formatSeconds(5)).toBe('00:00:05')
  })

  it('returns "00:59:59" for 3599', () => {
    expect(formatSeconds(3599)).toBe('00:59:59')
  })

  it('returns "11:59:59" for 43199', () => {
    expect(formatSeconds(43199)).toBe('11:59:59')
  })
})

describe('parseTimeInput', () => {
  it('returns 5400 for "01:30:00"', () => {
    expect(parseTimeInput('01:30:00')).toBe(5400)
  })

  it('returns 5 for "00:00:05" (minimum valid)', () => {
    expect(parseTimeInput('00:00:05')).toBe(5)
  })

  it('returns 43199 for "11:59:59" (maximum valid)', () => {
    expect(parseTimeInput('11:59:59')).toBe(43199)
  })

  it('returns null for "00:00:04" (below minimum)', () => {
    expect(parseTimeInput('00:00:04')).toBeNull()
  })

  it('returns null for "12:00:00" (above maximum)', () => {
    expect(parseTimeInput('12:00:00')).toBeNull()
  })

  it('returns null for "abc"', () => {
    expect(parseTimeInput('abc')).toBeNull()
  })

  it('returns null for "99:99:99" (invalid minutes/seconds)', () => {
    expect(parseTimeInput('99:99:99')).toBeNull()
  })

  it('returns 5400 for "1:30:00" (single-digit hour without leading zero)', () => {
    expect(parseTimeInput('1:30:00')).toBe(5400)
  })

  it('returns 65 for "0:1:5" (single-digit minutes and seconds)', () => {
    expect(parseTimeInput('0:1:5')).toBe(65)
  })

  it('returns null for "0:0:4" (below minimum even with single-digit format)', () => {
    expect(parseTimeInput('0:0:4')).toBeNull()
  })
})

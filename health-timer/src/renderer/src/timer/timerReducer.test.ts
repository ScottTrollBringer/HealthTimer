import { describe, it, expect } from 'vitest'
import {
  timerReducer,
  createInitialState,
  DEFAULT_HEALTH_SECONDS,
  DEFAULT_LONG_BREAK_SECONDS,
  DEFAULT_EYE_SECONDS,
  DEFAULT_SITTING_SECONDS,
  type TimerState
} from './timerReducer'

const stopped = createInitialState(3600)
const running: TimerState = { status: 'running', remaining: 10, defaultSeconds: 3600 }
const paused: TimerState = { status: 'paused', remaining: 10, defaultSeconds: 3600 }
const alertState: TimerState = { status: 'alert', remaining: 0, defaultSeconds: 3600 }

describe('DEFAULT constants', () => {
  it('DEFAULT_HEALTH_SECONDS is 3599', () => {
    expect(DEFAULT_HEALTH_SECONDS).toBe(3599)
  })
  it('DEFAULT_LONG_BREAK_SECONDS is 7199', () => {
    expect(DEFAULT_LONG_BREAK_SECONDS).toBe(7199)
  })
  it('DEFAULT_EYE_SECONDS is 1199', () => {
    expect(DEFAULT_EYE_SECONDS).toBe(1199)
  })
  it('DEFAULT_SITTING_SECONDS is 1799', () => {
    expect(DEFAULT_SITTING_SECONDS).toBe(1799)
  })
})

describe('createInitialState', () => {
  it('returns stopped state with matching remaining and defaultSeconds', () => {
    const s = createInitialState(3599)
    expect(s.status).toBe('stopped')
    expect(s.remaining).toBe(3599)
    expect(s.defaultSeconds).toBe(3599)
  })
})

describe('START', () => {
  it('transitions stopped → running, remaining unchanged', () => {
    const next = timerReducer(stopped, { type: 'START' })
    expect(next.status).toBe('running')
    expect(next.remaining).toBe(stopped.remaining)
  })
  it('is a no-op when already running', () => {
    expect(timerReducer(running, { type: 'START' })).toBe(running)
  })
  it('is a no-op when paused', () => {
    expect(timerReducer(paused, { type: 'START' })).toBe(paused)
  })
})

describe('PAUSE', () => {
  it('transitions running → paused', () => {
    const next = timerReducer(running, { type: 'PAUSE' })
    expect(next.status).toBe('paused')
    expect(next.remaining).toBe(running.remaining)
  })
  it('is a no-op when stopped', () => {
    expect(timerReducer(stopped, { type: 'PAUSE' })).toBe(stopped)
  })
})

describe('RESUME', () => {
  it('transitions paused → running', () => {
    const next = timerReducer(paused, { type: 'RESUME' })
    expect(next.status).toBe('running')
  })
  it('is a no-op when already running', () => {
    expect(timerReducer(running, { type: 'RESUME' })).toBe(running)
  })
})

describe('TICK', () => {
  it('decrements remaining when running and remaining > 1', () => {
    const s: TimerState = { status: 'running', remaining: 10, defaultSeconds: 3600 }
    const next = timerReducer(s, { type: 'TICK' })
    expect(next.remaining).toBe(9)
    expect(next.status).toBe('running')
  })
  it('enters alert state when running and remaining === 1', () => {
    const s: TimerState = { status: 'running', remaining: 1, defaultSeconds: 3600 }
    const next = timerReducer(s, { type: 'TICK' })
    expect(next.remaining).toBe(0)
    expect(next.status).toBe('alert')
  })
  it('is a no-op when stopped', () => {
    expect(timerReducer(stopped, { type: 'TICK' })).toBe(stopped)
  })
  it('is a no-op when paused', () => {
    expect(timerReducer(paused, { type: 'TICK' })).toBe(paused)
  })
})

describe('DISMISS_ALERT', () => {
  it('transitions alert → stopped with remaining reset to defaultSeconds', () => {
    const next = timerReducer(alertState, { type: 'DISMISS_ALERT' })
    expect(next.status).toBe('stopped')
    expect(next.remaining).toBe(alertState.defaultSeconds)
  })
  it('is a no-op when not in alert state', () => {
    expect(timerReducer(running, { type: 'DISMISS_ALERT' })).toBe(running)
    expect(timerReducer(stopped, { type: 'DISMISS_ALERT' })).toBe(stopped)
  })
})

describe('RESET', () => {
  it('resets from running → stopped, remaining = defaultSeconds', () => {
    const s: TimerState = { status: 'running', remaining: 5, defaultSeconds: 3600 }
    const next = timerReducer(s, { type: 'RESET' })
    expect(next.status).toBe('stopped')
    expect(next.remaining).toBe(3600)
  })
  it('resets from paused → stopped, remaining = defaultSeconds', () => {
    const next = timerReducer(paused, { type: 'RESET' })
    expect(next.status).toBe('stopped')
    expect(next.remaining).toBe(paused.defaultSeconds)
  })
  it('resets from alert → stopped, remaining = defaultSeconds', () => {
    const next = timerReducer(alertState, { type: 'RESET' })
    expect(next.status).toBe('stopped')
    expect(next.remaining).toBe(alertState.defaultSeconds)
  })
  it('resets from stopped (remaining at default)', () => {
    const next = timerReducer(stopped, { type: 'RESET' })
    expect(next.status).toBe('stopped')
    expect(next.remaining).toBe(stopped.defaultSeconds)
  })
})

describe('SET_DEFAULT', () => {
  it('updates defaultSeconds and remaining when stopped', () => {
    const next = timerReducer(stopped, { type: 'SET_DEFAULT', payload: 1800 })
    expect(next.defaultSeconds).toBe(1800)
    expect(next.remaining).toBe(1800)
    expect(next.status).toBe('stopped')
  })
  it('is a no-op when running', () => {
    expect(timerReducer(running, { type: 'SET_DEFAULT', payload: 1800 })).toBe(running)
  })
  it('is a no-op when paused', () => {
    expect(timerReducer(paused, { type: 'SET_DEFAULT', payload: 1800 })).toBe(paused)
  })
})

describe('purity', () => {
  it('returns identical value for identical inputs', () => {
    const s: TimerState = { status: 'running', remaining: 5, defaultSeconds: 60 }
    const a = timerReducer(s, { type: 'TICK' })
    const b = timerReducer(s, { type: 'TICK' })
    expect(a).toEqual(b)
  })
  it('does not mutate the input state object', () => {
    const s: TimerState = { status: 'running', remaining: 5, defaultSeconds: 60 }
    const snapshot = { ...s }
    timerReducer(s, { type: 'TICK' })
    expect(s).toEqual(snapshot)
  })
})

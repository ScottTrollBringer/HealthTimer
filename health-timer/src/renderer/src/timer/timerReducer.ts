export type TimerStatus = 'stopped' | 'running' | 'paused' | 'alert'

export type TimerState = {
  status: TimerStatus
  remaining: number
  defaultSeconds: number
}

export type TimerAction =
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'TICK' }
  | { type: 'RESET' }
  | { type: 'DISMISS_ALERT' }
  | { type: 'SET_DEFAULT'; payload: number }

export const DEFAULT_HEALTH_SECONDS = 3599
export const DEFAULT_LONG_BREAK_SECONDS = 7199
export const DEFAULT_EYE_SECONDS = 1199
export const DEFAULT_SITTING_SECONDS = 1799

export function createInitialState(defaultSeconds: number): TimerState {
  return { status: 'stopped', remaining: defaultSeconds, defaultSeconds }
}

export function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case 'START':
      if (state.status !== 'stopped') return state
      return { ...state, status: 'running' }

    case 'PAUSE':
      if (state.status !== 'running') return state
      return { ...state, status: 'paused' }

    case 'RESUME':
      if (state.status !== 'paused') return state
      return { ...state, status: 'running' }

    case 'TICK':
      if (state.status !== 'running') return state
      if (state.remaining <= 1) {
        return { ...state, remaining: 0, status: 'alert' }
      }
      return { ...state, remaining: state.remaining - 1 }

    case 'DISMISS_ALERT':
      if (state.status !== 'alert') return state
      return { ...state, status: 'stopped', remaining: state.defaultSeconds }

    case 'RESET':
      return { ...state, status: 'stopped', remaining: state.defaultSeconds }

    case 'SET_DEFAULT':
      if (state.status !== 'stopped') return state
      return { ...state, defaultSeconds: action.payload, remaining: action.payload }

    default:
      return state
  }
}

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, cleanup, fireEvent } from '@testing-library/react'
import App from './App'
import { formatSeconds } from './utils/formatTime'
import {
  DEFAULT_HEALTH_SECONDS,
  DEFAULT_LONG_BREAK_SECONDS,
  DEFAULT_EYE_SECONDS,
  DEFAULT_SITTING_SECONDS,
} from './timer/timerReducer'

beforeEach(() => {
  vi.stubGlobal('electronAPI', { setAlwaysOnTop: vi.fn() })
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('App — root layout', () => {
  it('renders 4 TimerWidget Start buttons (stopped state)', () => {
    render(<App />)
    expect(screen.getAllByRole('button', { name: 'Start' }).length).toBe(4)
  })

  it('renders WipBand with WIP text', () => {
    render(<App />)
    expect(screen.getByText('WIP')).toBeTruthy()
  })

  it('timer 1 (Health gestures) shows default time', () => {
    render(<App />)
    expect(screen.getByText(formatSeconds(DEFAULT_HEALTH_SECONDS))).toBeTruthy()
  })

  it('timer 2 (Long break) shows default time', () => {
    render(<App />)
    expect(screen.getByText(formatSeconds(DEFAULT_LONG_BREAK_SECONDS))).toBeTruthy()
  })

  it('timer 3 (Eye rest) shows default time', () => {
    render(<App />)
    expect(screen.getByText(formatSeconds(DEFAULT_EYE_SECONDS))).toBeTruthy()
  })

  it('timer 4 (Sitting) shows default time', () => {
    render(<App />)
    expect(screen.getByText(formatSeconds(DEFAULT_SITTING_SECONDS))).toBeTruthy()
  })
})

describe('App — always-on-top toggle', () => {
  it('renders toggle button with aria-pressed="false" on initial load', () => {
    render(<App />)
    const btn = screen.getByRole('button', { name: 'Always on top' })
    expect(btn.getAttribute('aria-pressed')).toBe('false')
  })

  it('calls setAlwaysOnTop(true) and sets aria-pressed="true" when clicked from OFF state', () => {
    render(<App />)
    const btn = screen.getByRole('button', { name: 'Always on top' })
    act(() => { fireEvent.click(btn) })
    expect(window.electronAPI.setAlwaysOnTop).toHaveBeenCalledWith(true)
    expect(btn.getAttribute('aria-pressed')).toBe('true')
  })

  it('calls setAlwaysOnTop(false) and sets aria-pressed="false" when clicked again from ON state', () => {
    render(<App />)
    const btn = screen.getByRole('button', { name: 'Always on top' })
    act(() => { fireEvent.click(btn) })
    act(() => { fireEvent.click(btn) })
    expect(window.electronAPI.setAlwaysOnTop).toHaveBeenLastCalledWith(false)
    expect(btn.getAttribute('aria-pressed')).toBe('false')
  })
})

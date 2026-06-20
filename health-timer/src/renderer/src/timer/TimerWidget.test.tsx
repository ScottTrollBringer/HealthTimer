// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, act, cleanup, fireEvent } from '@testing-library/react'
import { Eye } from 'lucide-react'
import { TimerWidget } from './TimerWidget'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('TimerWidget', () => {
  it('renders label, icon, and initial time', () => {
    render(<TimerWidget icon={Eye} label="Yeux" defaultSeconds={1199} />)
    expect(screen.getByText('Yeux')).toBeTruthy()
    expect(screen.getByText('00:19:59')).toBeTruthy()
  })

  it('shows Start button in stopped state', () => {
    render(<TimerWidget icon={Eye} label="Yeux" defaultSeconds={60} />)
    expect(screen.getByRole('button', { name: 'Start' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Pause' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Reset' })).toBeNull()
  })

  it('transitions to running when Start is clicked', () => {
    vi.useFakeTimers()
    render(<TimerWidget icon={Eye} label="Yeux" defaultSeconds={60} />)
    act(() => { fireEvent.click(screen.getByRole('button', { name: 'Start' })) })
    expect(screen.queryByRole('button', { name: 'Start' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Pause' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Reset' })).toBeTruthy()
  })

  it('transitions to paused when Pause is clicked', () => {
    vi.useFakeTimers()
    render(<TimerWidget icon={Eye} label="Yeux" defaultSeconds={60} />)
    act(() => { fireEvent.click(screen.getByRole('button', { name: 'Start' })) })
    act(() => { fireEvent.click(screen.getByRole('button', { name: 'Pause' })) })
    expect(screen.getByRole('button', { name: 'Resume' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Pause' })).toBeNull()
  })

  it('transitions to running when Resume is clicked', () => {
    vi.useFakeTimers()
    render(<TimerWidget icon={Eye} label="Yeux" defaultSeconds={60} />)
    act(() => { fireEvent.click(screen.getByRole('button', { name: 'Start' })) })
    act(() => { fireEvent.click(screen.getByRole('button', { name: 'Pause' })) })
    act(() => { fireEvent.click(screen.getByRole('button', { name: 'Resume' })) })
    expect(screen.getByRole('button', { name: 'Pause' })).toBeTruthy()
  })

  it('resets to stopped at defaultSeconds when Reset is clicked', () => {
    vi.useFakeTimers()
    render(<TimerWidget icon={Eye} label="Yeux" defaultSeconds={60} />)
    act(() => { fireEvent.click(screen.getByRole('button', { name: 'Start' })) })
    act(() => { fireEvent.click(screen.getByRole('button', { name: 'Reset' })) })
    expect(screen.getByText('00:01:00')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Start' })).toBeTruthy()
  })

  it('decrements time display after 1 second when running', () => {
    vi.useFakeTimers()
    render(<TimerWidget icon={Eye} label="Yeux" defaultSeconds={60} />)
    act(() => { fireEvent.click(screen.getByRole('button', { name: 'Start' })) })
    act(() => { vi.advanceTimersByTime(1000) })
    expect(screen.getByText('00:00:59')).toBeTruthy()
  })

  it('clears interval when paused (no decrement after pause)', () => {
    vi.useFakeTimers()
    render(<TimerWidget icon={Eye} label="Yeux" defaultSeconds={60} />)
    act(() => { fireEvent.click(screen.getByRole('button', { name: 'Start' })) })
    act(() => { vi.advanceTimersByTime(1000) })
    act(() => { fireEvent.click(screen.getByRole('button', { name: 'Pause' })) })
    act(() => { vi.advanceTimersByTime(5000) })
    expect(screen.getByText('00:00:59')).toBeTruthy()
  })

  it('enters alert state when timer reaches 0: shows only Reset, displays 00:00:00', () => {
    vi.useFakeTimers()
    render(<TimerWidget icon={Eye} label="Yeux" defaultSeconds={2} />)
    act(() => { fireEvent.click(screen.getByRole('button', { name: 'Start' })) })
    act(() => { vi.advanceTimersByTime(2000) })
    expect(screen.getByText('00:00:00')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Reset' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Start' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Pause' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Resume' })).toBeNull()
  })

  it('applies alerting class to icon when in alert state', () => {
    vi.useFakeTimers()
    const { container } = render(<TimerWidget icon={Eye} label="Yeux" defaultSeconds={2} />)
    act(() => { fireEvent.click(screen.getByRole('button', { name: 'Start' })) })
    act(() => { vi.advanceTimersByTime(2000) })
    const svg = container.querySelector('svg')
    expect(svg?.classList.contains('alerting')).toBe(true)
  })

  it('clicking icon in alert state dismisses the alert and resets timer', () => {
    vi.useFakeTimers()
    const { container } = render(<TimerWidget icon={Eye} label="Yeux" defaultSeconds={2} />)
    act(() => { fireEvent.click(screen.getByRole('button', { name: 'Start' })) })
    act(() => { vi.advanceTimersByTime(2000) })
    const svg = container.querySelector('svg')!
    act(() => { fireEvent.click(svg) })
    expect(screen.getByRole('button', { name: 'Start' })).toBeTruthy()
    expect(screen.getByText('00:00:02')).toBeTruthy()
    expect(svg.classList.contains('alerting')).toBe(false)
  })

  it('clicking icon in non-alert state does nothing', () => {
    const { container } = render(<TimerWidget icon={Eye} label="Yeux" defaultSeconds={60} />)
    const svg = container.querySelector('svg')!
    act(() => { fireEvent.click(svg) })
    expect(screen.getByRole('button', { name: 'Start' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Reset' })).toBeNull()
  })

  it('shows input pre-filled with current time when time display is clicked in stopped state', () => {
    render(<TimerWidget icon={Eye} label="Yeux" defaultSeconds={60} />)
    act(() => { fireEvent.click(screen.getByText('00:01:00')) })
    const input = screen.getByRole('textbox')
    expect(input).toBeTruthy()
    expect((input as HTMLInputElement).value).toBe('00:01:00')
  })

  it('commits new value and returns to display on blur with valid input', () => {
    render(<TimerWidget icon={Eye} label="Yeux" defaultSeconds={60} />)
    act(() => { fireEvent.click(screen.getByText('00:01:00')) })
    const input = screen.getByRole('textbox')
    act(() => { fireEvent.change(input, { target: { value: '00:02:00' } }) })
    act(() => { fireEvent.blur(input) })
    expect(screen.queryByRole('textbox')).toBeNull()
    expect(screen.getByText('00:02:00')).toBeTruthy()
  })

  it('cancels editing on Escape without changing the value', () => {
    render(<TimerWidget icon={Eye} label="Yeux" defaultSeconds={60} />)
    act(() => { fireEvent.click(screen.getByText('00:01:00')) })
    const input = screen.getByRole('textbox')
    act(() => { fireEvent.change(input, { target: { value: '00:05:00' } }) })
    act(() => { fireEvent.keyDown(input, { key: 'Escape' }) })
    expect(screen.queryByRole('textbox')).toBeNull()
    expect(screen.getByText('00:01:00')).toBeTruthy()
  })

  it('rejects value below 5 seconds and restores original', () => {
    render(<TimerWidget icon={Eye} label="Yeux" defaultSeconds={60} />)
    act(() => { fireEvent.click(screen.getByText('00:01:00')) })
    const input = screen.getByRole('textbox')
    act(() => { fireEvent.change(input, { target: { value: '00:00:04' } }) })
    act(() => { fireEvent.blur(input) })
    expect(screen.queryByRole('textbox')).toBeNull()
    expect(screen.getByText('00:01:00')).toBeTruthy()
  })

  it('rejects invalid format and restores original', () => {
    render(<TimerWidget icon={Eye} label="Yeux" defaultSeconds={60} />)
    act(() => { fireEvent.click(screen.getByText('00:01:00')) })
    const input = screen.getByRole('textbox')
    act(() => { fireEvent.change(input, { target: { value: 'notavalue' } }) })
    act(() => { fireEvent.blur(input) })
    expect(screen.queryByRole('textbox')).toBeNull()
    expect(screen.getByText('00:01:00')).toBeTruthy()
  })

  it('does not open editor when timer is running', () => {
    vi.useFakeTimers()
    render(<TimerWidget icon={Eye} label="Yeux" defaultSeconds={60} />)
    act(() => { fireEvent.click(screen.getByRole('button', { name: 'Start' })) })
    act(() => { fireEvent.click(screen.getByText('00:01:00')) })
    expect(screen.queryByRole('textbox')).toBeNull()
  })

  it('does not open editor when timer is paused', () => {
    vi.useFakeTimers()
    render(<TimerWidget icon={Eye} label="Yeux" defaultSeconds={60} />)
    act(() => { fireEvent.click(screen.getByRole('button', { name: 'Start' })) })
    act(() => { fireEvent.click(screen.getByRole('button', { name: 'Pause' })) })
    act(() => { fireEvent.click(screen.getByText('00:01:00')) })
    expect(screen.queryByRole('textbox')).toBeNull()
  })

  it('does not open editor when timer is in alert state', () => {
    vi.useFakeTimers()
    render(<TimerWidget icon={Eye} label="Yeux" defaultSeconds={2} />)
    act(() => { fireEvent.click(screen.getByRole('button', { name: 'Start' })) })
    act(() => { vi.advanceTimersByTime(2000) })
    act(() => { fireEvent.click(screen.getByTestId('timer-display')) })
    expect(screen.queryByRole('textbox')).toBeNull()
  })

  it('commits via Enter key (Enter triggers blur → commit)', () => {
    render(<TimerWidget icon={Eye} label="Yeux" defaultSeconds={60} />)
    act(() => { fireEvent.click(screen.getByText('00:01:00')) })
    const input = screen.getByRole('textbox')
    act(() => { fireEvent.change(input, { target: { value: '00:03:00' } }) })
    act(() => { fireEvent.keyDown(input, { key: 'Enter' }) })
    expect(screen.queryByRole('textbox')).toBeNull()
    expect(screen.getByText('00:03:00')).toBeTruthy()
  })
})

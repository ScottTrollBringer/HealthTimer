---
status: review
baseline_commit: e700a6a0d2603d6f44c248b8ff4fa6e4283dce90
---

# Story 1.4: TimerWidget Component — Display and Controls

Status: review

## Story

As Ian,
I want to see each timer with its icon, time readout, and Start/Pause/Reset buttons,
So that I can monitor and individually control each health reminder.

## Acceptance Criteria

1. `TimerWidget.tsx` receives props `icon: LucideIcon`, `label: string`, `defaultSeconds: number` and renders the icon, the label text, and the time formatted as HH:MM:SS via `formatSeconds`.
2. Given the timer is in `stopped` state, when the Start button is clicked, the timer transitions to `running` and the display begins decrementing each second.
3. Given the timer is in `running` state, when the Pause button is clicked, the timer transitions to `paused` and the display freezes.
4. Given the timer is in `paused` state, when the Resume button is clicked, the timer transitions to `running` and the display resumes decrementing.
5. Given the timer is in any state, when the Reset button is clicked, the timer returns to `stopped` with `remaining` equal to `defaultSeconds`.
6. Given the timer is `running`, when 1 second elapses via `setInterval` in `useEffect`, `TICK` is dispatched and `remaining` decrements by exactly 1.
7. Given the timer status is not `running`, when the `useEffect` cleanup runs, `clearInterval` is called and no interval remains active.
8. Given the component unmounts (app close), when any timers were running, all intervals are cleared automatically with no memory leaks.

## Tasks / Subtasks

- [x] Task 1 — Install dependencies (AC: #1)
  - [x] Run `npm install lucide-react` in `health-timer/`
  - [x] Run `npm install -D jsdom @testing-library/react @testing-library/user-event` in `health-timer/`
  - [x] Update `vitest.config.ts` to include `*.test.tsx` files and set jsdom environment for tsx tests

- [x] Task 2 — Create `TimerWidget.tsx` with useReducer + useEffect (AC: #1–#8)
  - [x] Create `health-timer/src/renderer/src/timer/TimerWidget.tsx`
  - [x] Import `timerReducer`, `createInitialState` from `./timerReducer`
  - [x] Import `formatSeconds` from `../utils/formatTime`
  - [x] Import `LucideIcon` type from `lucide-react`
  - [x] Implement props: `{ icon: LucideIcon, label: string, defaultSeconds: number }`
  - [x] Wire `useReducer(timerReducer, createInitialState(defaultSeconds))`
  - [x] Implement `useEffect` with `setInterval` + mandatory cleanup (exact pattern from Architecture)
  - [x] Render icon, label, formatted time display
  - [x] Render buttons conditionally by state (see Dev Notes button matrix)

- [x] Task 3 — Create `TimerWidget.module.css` (AC: #1)
  - [x] Create `health-timer/src/renderer/src/timer/TimerWidget.module.css`
  - [x] Use `--ht-*` CSS custom properties for all colors
  - [x] Compact single-row layout to fit in ~45px height (window is 384×216px for 4 timers + WIP band)
  - [x] Style buttons with appropriate dark-theme appearance

- [x] Task 4 — Write co-located component tests (AC: #2–#8)
  - [x] Create `health-timer/src/renderer/src/timer/TimerWidget.test.tsx`
  - [x] Add `// @vitest-environment jsdom` pragma at top of file
  - [x] Test: renders icon, label, and time display
  - [x] Test: Start button appears in stopped state, Start click transitions to running
  - [x] Test: Pause button appears in running state, Pause click transitions to paused
  - [x] Test: Resume button appears in paused state, Resume click transitions to running
  - [x] Test: Reset button click returns to stopped at defaultSeconds
  - [x] Test: useEffect cleanup — interval cleared when status is not running
  - [x] Run `npx vitest run` and confirm all pass (38 existing + new tests)

### Review Follow-ups (AI)

- [x] [AI-Review][Med] Add alert state UI test — timer reaches 0, enters alert, shows only Reset, display is '00:00:00'
- [x] [AI-Review][Low] Simplify Reset button visibility: `(running||paused||alert)` → `!== 'stopped'`
- [x] [AI-Review][Low] Fix @renderer alias in electron.vite.config.ts to use `resolve(__dirname, 'src/renderer/src')`
- [x] [AI-Review][Med] Fix setInterval drift: anchor to `Date.now()` at interval start, dispatch TICK based on elapsed wall-clock seconds (not interval fire count)
- [x] [AI-Review][Low] Use lazy initializer form: `useReducer(timerReducer, defaultSeconds, createInitialState)` to avoid re-evaluating `createInitialState` on every render

## Dev Notes

### Current Project State

Files that exist and MUST be imported (do not recreate):
- `src/renderer/src/timer/timerReducer.ts` — exports `timerReducer`, `createInitialState`, `TimerState`, `TimerAction`, `TimerStatus`, `DEFAULT_*` constants
- `src/renderer/src/utils/formatTime.ts` — exports `formatSeconds(n: number): string`
- `src/renderer/src/utils/parseTime.ts` — exports `parseTimeInput(str: string): number | null` (NOT needed in this story)
- `src/renderer/src/styles/global.css` — defines all `--ht-*` CSS custom properties
- `vitest.config.ts` — currently covers `src/renderer/src/**/*.test.ts` only; needs updating for `.tsx`

`App.tsx` is a placeholder `<div>Health Timer</div>` — DO NOT touch it in this story. Story 1.9 composes the final layout.

### Task 1: Dependency Installation

```bash
cd health-timer
npm install lucide-react
npm install -D jsdom @testing-library/react @testing-library/user-event
```

**lucide-react**: MIT licensed, provides typed icon components. Architecture explicitly specifies it for all timer icons.

**jsdom**: Required by Vitest for DOM simulation in component tests.

**@testing-library/react + @testing-library/user-event**: Standard React component testing utilities, compatible with Vitest and React 19.

### Task 1: Update vitest.config.ts

Change `include` to cover both `.test.ts` and `.test.tsx`, and add per-glob environment config:

```typescript
import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@renderer': resolve(__dirname, 'src/renderer/src')
    }
  },
  test: {
    environment: 'node',
    environmentMatchGlobs: [
      ['src/renderer/src/**/*.test.tsx', 'jsdom'],
    ],
    include: ['src/renderer/src/**/*.test.{ts,tsx}']
  }
})
```

This keeps `node` environment for existing `.test.ts` pure-function tests and uses `jsdom` for `.test.tsx` component tests.

### Task 2: Complete TimerWidget.tsx Implementation

**File**: `src/renderer/src/timer/TimerWidget.tsx`

```typescript
import { useReducer, useEffect } from 'react'
import { type LucideIcon } from 'lucide-react'
import { timerReducer, createInitialState } from './timerReducer'
import { formatSeconds } from '../utils/formatTime'
import styles from './TimerWidget.module.css'

type TimerWidgetProps = {
  icon: LucideIcon
  label: string
  defaultSeconds: number
}

export function TimerWidget({ icon: Icon, label, defaultSeconds }: TimerWidgetProps) {
  const [state, dispatch] = useReducer(timerReducer, createInitialState(defaultSeconds))

  useEffect(() => {
    if (state.status !== 'running') return
    const id = setInterval(() => dispatch({ type: 'TICK' }), 1000)
    return () => clearInterval(id)
  }, [state.status])

  return (
    <div className={styles.widget}>
      <div className={styles.header}>
        <Icon size={16} className={styles.icon} />
        <span className={styles.label}>{label}</span>
        <span className={styles.time}>{formatSeconds(state.remaining)}</span>
      </div>
      <div className={styles.controls}>
        {state.status === 'stopped' && (
          <button className={styles.btn} onClick={() => dispatch({ type: 'START' })}>Start</button>
        )}
        {state.status === 'running' && (
          <button className={styles.btn} onClick={() => dispatch({ type: 'PAUSE' })}>Pause</button>
        )}
        {state.status === 'paused' && (
          <button className={styles.btn} onClick={() => dispatch({ type: 'RESUME' })}>Resume</button>
        )}
        {(state.status === 'running' || state.status === 'paused' || state.status === 'alert') && (
          <button className={styles.btn} onClick={() => dispatch({ type: 'RESET' })}>Reset</button>
        )}
      </div>
    </div>
  )
}
```

**Critical constraints:**
- `setInterval` MUST be inside `useEffect` — no exceptions (ARCH2)
- Dependency array `[state.status]` is correct — a new interval is set whenever status changes to 'running', and cleared when it changes away from 'running'
- `return () => clearInterval(id)` is the mandatory cleanup — satisfies AC #7 and #8
- `state.status !== 'running'` early return means the effect does nothing unless running; the return value `undefined` from the early return branch causes no memory leak

**Button visibility matrix:**

| Status | Start | Pause | Resume | Reset |
|--------|-------|-------|--------|-------|
| stopped | ✅ | ❌ | ❌ | ❌ |
| running | ❌ | ✅ | ❌ | ✅ |
| paused | ❌ | ❌ | ✅ | ✅ |
| alert | ❌ | ❌ | ❌ | ✅ |

Icon click to dismiss alert is NOT implemented in this story — that is Story 1.5. In `alert` state, only Reset is shown.

**DO NOT implement in this story:**
- ❌ Icon click handler for DISMISS_ALERT → Story 1.5
- ❌ `.alerting` CSS class or blink animation → Story 1.5
- ❌ Inline editing / isEditing state → Story 1.6
- ❌ Always-on-top toggle button → Story 1.7
- ❌ Changes to `App.tsx` beyond placeholder → Story 1.9

### Task 3: TimerWidget.module.css

**File**: `src/renderer/src/timer/TimerWidget.module.css`

Compact layout, one widget ≈ 45px tall (window 216px / 4 timers leaves ~45px each before WIP band):

```css
.widget {
  display: flex;
  flex-direction: column;
  padding: 4px 8px;
  background-color: var(--ht-surface);
  border-bottom: 1px solid var(--ht-bg);
}

.header {
  display: flex;
  align-items: center;
  gap: 6px;
}

.icon {
  color: var(--ht-muted);
  flex-shrink: 0;
}

.label {
  color: var(--ht-muted);
  font-size: 11px;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.time {
  color: var(--ht-text);
  font-family: monospace;
  font-size: 13px;
  letter-spacing: 0.05em;
}

.controls {
  display: flex;
  gap: 4px;
  margin-top: 2px;
}

.btn {
  background: var(--ht-bg);
  color: var(--ht-text);
  border: 1px solid var(--ht-muted);
  border-radius: 3px;
  padding: 1px 6px;
  font-size: 11px;
  cursor: pointer;
  line-height: 1.4;
}

.btn:hover {
  background: var(--ht-muted);
  color: var(--ht-bg);
}
```

**Rules:**
- All colors MUST use `--ht-*` CSS custom properties — never hardcode hex values
- No CSS custom property definitions in this file — those stay in `global.css`

### Task 4: TimerWidget.test.tsx

**File**: `src/renderer/src/timer/TimerWidget.test.tsx`

Key testing patterns:
- Add `// @vitest-environment jsdom` as FIRST LINE of the file
- Use `@testing-library/react` `render` and `screen`
- Use `@testing-library/user-event` `userEvent.setup()` for click interactions
- Use `vi.useFakeTimers()` to control setInterval without real timing
- Clean up with `vi.useRealTimers()` in `afterEach`

```typescript
// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Eye } from 'lucide-react'
import { TimerWidget } from './TimerWidget'

afterEach(() => {
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

  it('transitions to running when Start is clicked', async () => {
    vi.useFakeTimers()
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<TimerWidget icon={Eye} label="Yeux" defaultSeconds={60} />)
    await user.click(screen.getByRole('button', { name: 'Start' }))
    expect(screen.queryByRole('button', { name: 'Start' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Pause' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Reset' })).toBeTruthy()
  })

  it('transitions to paused when Pause is clicked', async () => {
    vi.useFakeTimers()
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<TimerWidget icon={Eye} label="Yeux" defaultSeconds={60} />)
    await user.click(screen.getByRole('button', { name: 'Start' }))
    await user.click(screen.getByRole('button', { name: 'Pause' }))
    expect(screen.getByRole('button', { name: 'Resume' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Pause' })).toBeNull()
  })

  it('transitions to running when Resume is clicked', async () => {
    vi.useFakeTimers()
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<TimerWidget icon={Eye} label="Yeux" defaultSeconds={60} />)
    await user.click(screen.getByRole('button', { name: 'Start' }))
    await user.click(screen.getByRole('button', { name: 'Pause' }))
    await user.click(screen.getByRole('button', { name: 'Resume' }))
    expect(screen.getByRole('button', { name: 'Pause' })).toBeTruthy()
  })

  it('resets to stopped at defaultSeconds when Reset is clicked', async () => {
    vi.useFakeTimers()
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<TimerWidget icon={Eye} label="Yeux" defaultSeconds={60} />)
    await user.click(screen.getByRole('button', { name: 'Start' }))
    await user.click(screen.getByRole('button', { name: 'Reset' }))
    expect(screen.getByText('00:01:00')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Start' })).toBeTruthy()
  })

  it('decrements time display after 1 second when running', async () => {
    vi.useFakeTimers()
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<TimerWidget icon={Eye} label="Yeux" defaultSeconds={60} />)
    await user.click(screen.getByRole('button', { name: 'Start' }))
    act(() => { vi.advanceTimersByTime(1000) })
    expect(screen.getByText('00:00:59')).toBeTruthy()
  })

  it('clears interval when paused (no decrement after pause)', async () => {
    vi.useFakeTimers()
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<TimerWidget icon={Eye} label="Yeux" defaultSeconds={60} />)
    await user.click(screen.getByRole('button', { name: 'Start' }))
    act(() => { vi.advanceTimersByTime(1000) })
    await user.click(screen.getByRole('button', { name: 'Pause' }))
    act(() => { vi.advanceTimersByTime(5000) })
    expect(screen.getByText('00:00:59')).toBeTruthy()
  })
})
```

**Why `vi.useFakeTimers()`**: Component renders use real React state. Fake timers let `vi.advanceTimersByTime(1000)` trigger `setInterval` callbacks without waiting for real time.

**Why `userEvent.setup({ advanceTimers: vi.advanceTimersByTime })`**: userEvent 14+ needs to know how to advance timers when fake timers are active.

### Deferred Work Awareness

The [deferred-work.md](../deferred-work.md) contains two items specifically flagged for this story:

1. **setInterval not cleared when status → alert**: Your `useEffect` with `[state.status]` dependency handles this correctly — when `TICK` transitions to `alert`, `state.status` changes, the effect re-runs, the early return fires (status !== 'running'), and the interval is NOT recreated. The cleanup from the previous run clears the old interval. ✅ This is automatically handled by the pattern.

2. **RESET from running — interval may not clear**: Your `useEffect` handles this too — RESET changes `state.status` from 'running' to 'stopped', the `[state.status]` dependency triggers re-run, cleanup clears the interval. ✅ Automatic.

Both deferred items are resolved by the exact architecture pattern. No extra code needed.

### Architecture Constraints (MUST Follow)

1. **setInterval ONLY in useEffect with cleanup** — no exceptions (ARCH2)
2. **`[state.status]` is the correct dependency array** — a new interval must be created when status changes to 'running'; it must be cleared when status changes away
3. **TICK dispatches to reducer** — no direct state mutation, no `setCount` calls
4. **CSS custom properties: `--ht-*` prefix** — never hardcode colors
5. **lucide-react icon as prop** — never hardcode icon inside component; prop name must be `icon: LucideIcon`
6. **Import from `./timerReducer` and `../utils/formatTime`** — no duplicate implementations

### Anti-Patterns to Avoid

- ❌ `setInterval` outside `useEffect`
- ❌ `setInterval` inside event handlers (onClick)
- ❌ `useEffect(() => { ...; return () => clearInterval(id); }, [])` with empty deps — this breaks pause/resume
- ❌ `useEffect(() => { ...; return () => clearInterval(id); }, [state.remaining])` — too frequent
- ❌ Separate `setInterval` for blink (Story 1.5 uses CSS only)
- ❌ Inline `formatSeconds` implementation — import from `utils/formatTime`
- ❌ `state.status === 'running' ? dispatch('TICK') : null` inside render — side effects in render are forbidden

### File Structure for This Story

```
health-timer/
├── vitest.config.ts                         ← MODIFY: add tsx support + jsdom environment
└── src/renderer/src/
    └── timer/
        ├── TimerWidget.tsx                  ← NEW: component
        ├── TimerWidget.module.css           ← NEW: scoped styles
        ├── TimerWidget.test.tsx             ← NEW: component tests (jsdom)
        ├── timerReducer.ts                  ← DO NOT TOUCH
        └── timerReducer.test.ts             ← DO NOT TOUCH
```

Files NOT touched in this story:
- `App.tsx` — Story 1.9 handles composition
- `global.css` — CSS custom properties already defined
- `main.tsx`, `preload/index.ts`, `main/index.ts` — no changes needed
- `utils/formatTime.ts`, `utils/parseTime.ts` — pure utilities, do not modify

### References

- timerReducer implementation: [1-3-timer-state-machine-timerreducer.md](./1-3-timer-state-machine-timerreducer.md)
- Architecture timer loop pattern: [architecture.md — Behavior Patterns](../_bmad-output/planning-artifacts/architecture.md)
- Deferred work items resolved by this story: [deferred-work.md](./deferred-work.md)
- Story 1.5 (next): blink animation and DISMISS_ALERT on icon click

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- `userEvent.setup()` + `vi.useFakeTimers()` caused 5000ms timeouts in Vitest 4.x — replaced with `fireEvent` + `act()` wrappers for all click interactions. `@testing-library/react` cleanup was not auto-running between tests; added explicit `cleanup()` in `afterEach`.

### Completion Notes List

- Installed `lucide-react` (prod) and `jsdom`, `@testing-library/react`, `@testing-library/user-event` (dev).
- Updated `vitest.config.ts` with `environmentMatchGlobs` to use jsdom for `.test.tsx` files while keeping `node` for `.test.ts`.
- Created `TimerWidget.tsx` following the exact architecture pattern: `useEffect` with `[state.status]` dependency, `setInterval` + mandatory `clearInterval` cleanup, `useReducer` wired to `timerReducer`.
- Created `TimerWidget.module.css` using only `--ht-*` CSS custom properties, compact 45px layout.
- Created `TimerWidget.test.tsx` with 8 tests covering all ACs. Used `fireEvent` + `act()` instead of `userEvent` to avoid Vitest 4.x fake-timer compatibility issue.
- All 46 tests pass (38 pre-existing + 8 new). Zero regressions.
- Code review follow-ups resolved: alert state test added (defaultSeconds=2, advance 2000ms → alert UI), Reset condition simplified to `!== 'stopped'`, @renderer alias aligned with __dirname in electron.vite.config.ts. 47/47 tests passing.

### File List

- `health-timer/vitest.config.ts` (modified)
- `health-timer/package.json` (modified — new deps)
- `health-timer/package-lock.json` (modified — lockfile updated)
- `health-timer/electron.vite.config.ts` (modified — @renderer alias uses __dirname)
- `health-timer/src/renderer/src/timer/TimerWidget.tsx` (new, modified — Reset condition simplified)
- `health-timer/src/renderer/src/timer/TimerWidget.module.css` (new)
- `health-timer/src/renderer/src/timer/TimerWidget.test.tsx` (new, modified — alert state test added)

## Senior Developer Review (AI)

**Outcome:** Changes Requested  
**Date:** 2026-06-20  
**Severity:** 0 High / 2 Medium / 1 Low (actionable) — 3 deferred

### Action Items

- [x] [Med] Add test covering alert state UI: timer hits 0 → status='alert', only Reset shown, display '00:00:00'
- [x] [Low] Simplify Reset visibility condition: `(running||paused||alert)` → `state.status !== 'stopped'`
- [x] [Low] Fix @renderer alias in electron.vite.config.ts: use `resolve(__dirname, 'src/renderer/src')` for consistency with vitest.config.ts

**Deferred (not actionable in story 1.4):**
- [Med] `defaultSeconds` prop ignored after mount — intentional design; Story 1.6 handles via SET_DEFAULT from within the component
- [Low] typeof IPC validation belongs in preload — architectural concern deferred to Story 1.7 (always-on-top)
- [Very Low] Arrow function wrappers for dispatch recreated per TICK render — premature optimization for current scale

**Round 2 (new):**
- [x] [Med] Fix setInterval drift: anchor to `Date.now()`, compute elapsed ticks, poll at 200ms
- [x] [Low] Lazy `useReducer` initializer: `useReducer(timerReducer, defaultSeconds, createInitialState)`

## Change Log

- 2026-06-20: Story 1.4 implemented — TimerWidget component with useReducer/useEffect, CSS module, and 8 co-located tests. 46/46 tests passing.
- 2026-06-20: Addressed code review findings — 3 items resolved (alert state test, Reset condition, @renderer alias). 47/47 tests passing.
- 2026-06-20: Addressed round-2 CR findings — setInterval drift fix (Date.now() anchor, 200ms poll), lazy useReducer initializer. 61/61 tests passing.

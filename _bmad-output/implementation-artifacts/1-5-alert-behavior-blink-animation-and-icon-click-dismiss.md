---
status: review
baseline_commit: e700a6a0d2603d6f44c248b8ff4fa6e4283dce90
---

# Story 1.5: Alert behavior — blink animation and icon-click dismiss

Status: review

## Story

As Ian,
I want the timer's icon to blink red and white when a timer reaches zero, and to dismiss it by clicking the icon,
So that I notice the health reminder even while focused on other work.

## Acceptance Criteria

1. Given a timer in `running` state with `remaining: 1`, when `TICK` fires, then the timer enters `alert` state with `remaining: 0`. *(Already satisfied by `timerReducer` + existing test in `TimerWidget.test.tsx` — do NOT re-implement or re-test.)*
2. Given the timer is in `alert` state, when the component renders, then the CSS class `alerting` (from `TimerWidget.module.css`) is applied to the icon element.
3. Given the `.alerting` CSS class is active, when rendered in a browser, then the icon alternates between `#FF0000` and `#FFFFFF` via `animation: blink 1s step-end infinite` — no JavaScript color manipulation occurs.
4. Given the timer is in `alert` state, when the user clicks the icon, then `DISMISS_ALERT` is dispatched, the `alerting` class is removed, and the timer is in `stopped` state at `defaultSeconds`.
5. Given the timer is in a non-alert state, when the icon is clicked, then nothing happens.
6. Given two timers are simultaneously in `alert` state, when the user clicks one icon, then only that timer resets; the other continues blinking independently.
7. Given the app is covered by another window while in `alert` state, when the alert triggers, then no system notification, sound, or OS-level popup is produced.

## Tasks / Subtasks

- [x] Task 1 — Add `.alerting` CSS class and `@keyframes blink` to `TimerWidget.module.css` (AC: #2, #3)
  - [x] Add `.alerting` rule with `animation: blink 1s step-end infinite` and `cursor: pointer`
  - [x] Add `@keyframes blink` with `0%, 100% { color: var(--ht-alert-red); }` and `50% { color: var(--ht-alert-white); }`
  - [x] Verify only `--ht-*` CSS custom properties are used — no hardcoded hex values

- [x] Task 2 — Update `TimerWidget.tsx` icon element (AC: #2, #4, #5)
  - [x] Apply `alerting` class conditionally on icon: `className` = `styles.icon` normally, `styles.icon + ' ' + styles.alerting` when `state.status === 'alert'`
  - [x] Add `onClick` handler on the icon element: dispatch `{ type: 'DISMISS_ALERT' }` only when `state.status === 'alert'`, otherwise no-op
  - [x] No changes to any other part of `TimerWidget.tsx` (button rendering, useEffect, reducer wiring all stay identical)

- [x] Task 3 — Add component tests for alert behavior (AC: #2, #4, #5, #6)
  - [x] Test: `alerting` class is on the icon SVG when timer enters alert state
  - [x] Test: clicking icon in alert state dismisses the alert (Start button reappears, time resets to `defaultSeconds`)
  - [x] Test: clicking icon in non-alert state (stopped) does nothing
  - [x] Run `npx vitest run` — confirm all 47 existing tests still pass + new tests added → 50/50 pass
  - [x] AC #6 (independent timers) is inherently guaranteed by `useReducer` per instance — no extra test needed (see Dev Notes)
  - [x] AC #7 (no system notification) is guaranteed by omission — the renderer has no notification API access (see Dev Notes)

## Dev Notes

### Current Project State

**Files that exist and MUST be reused — do NOT recreate:**
- `src/renderer/src/timer/timerReducer.ts` — exports `timerReducer`, `createInitialState`, `TimerState`, `TimerAction`, `DISMISS_ALERT` action already implemented
- `src/renderer/src/timer/TimerWidget.tsx` — component with `useReducer` + `useEffect`; icon renders as `<Icon size={16} className={styles.icon} />`
- `src/renderer/src/timer/TimerWidget.module.css` — 57 lines; has `.icon`, `.btn`, etc.; add to it, do NOT replace
- `src/renderer/src/timer/TimerWidget.test.tsx` — 9 tests (47 total); has alert state reducer test at line 80; keep all existing tests
- `src/renderer/src/styles/global.css` — already defines `--ht-alert-red: #FF0000` and `--ht-alert-white: #FFFFFF`

`App.tsx` is still a placeholder `<div>Health Timer</div>` — do NOT touch it.

### `DISMISS_ALERT` Already Exists in the Reducer

```typescript
// timerReducer.ts (line 48-50) — DO NOT re-implement:
case 'DISMISS_ALERT':
  if (state.status !== 'alert') return state
  return { ...state, status: 'stopped', remaining: state.defaultSeconds }
```

The reducer already handles the guard (`status !== 'alert'` → no-op). This means the icon's `onClick` can always `dispatch({ type: 'DISMISS_ALERT' })` — the reducer guard is sufficient. But the recommended pattern (explicit conditional in onClick) makes intent clearer and avoids a dispatch on non-alert clicks:

```tsx
onClick={() => { if (state.status === 'alert') dispatch({ type: 'DISMISS_ALERT' }) }}
```

Both approaches are correct. The reducer guard is the safety net.

### Task 1: CSS Changes

**Add to the end of `TimerWidget.module.css`:**

```css
.alerting {
  animation: blink 1s step-end infinite;
  cursor: pointer;
}

@keyframes blink {
  0%, 100% { color: var(--ht-alert-red); }
  50%       { color: var(--ht-alert-white); }
}
```

**Why `step-end`:** `step-end` produces crisp instantaneous color switches (0.5s red → 0.5s white) — no fade, no gradient. This matches FR7: "alternates #FF0000 and #FFFFFF at 1 Hz (0.5s each)."

**Why in `.module.css`:** ARCH5 mandates CSS keyframes only — no JS `setInterval` for blinking, no inline style color updates. The `.alerting` class is toggled by React based on `state.status`, and the CSS does the rest.

**Enforcement rules from Architecture:**
- `--ht-alert-red` and `--ht-alert-white` are the ONLY allowed color values here
- No `#FF0000` or `#FFFFFF` literals — use the CSS vars
- No additional `setInterval` or `setTimeout` for blinking — CSS handles it entirely

### Task 2: TimerWidget.tsx Changes

**Only the icon line changes.** Current:
```tsx
<Icon size={16} className={styles.icon} />
```

New:
```tsx
<Icon
  size={16}
  className={state.status === 'alert' ? `${styles.icon} ${styles.alerting}` : styles.icon}
  onClick={() => { if (state.status === 'alert') dispatch({ type: 'DISMISS_ALERT' }) }}
/>
```

Everything else in `TimerWidget.tsx` stays identical:
- `useReducer` wiring — unchanged
- `useEffect` with `setInterval` — unchanged (timer stops cleanly because `status` leaves `'running'` when TICK hits 0)
- Button matrix — unchanged (alert state already shows only Reset via `!== 'stopped'`)
- `cursor: pointer` is in the `.alerting` CSS class — no inline style needed

**What happens on interval when status → alert:**
The `useEffect` has `[state.status]` dependency. When `TICK` causes `running → alert`, React re-runs the effect: the `if (state.status !== 'running') return` branch fires, clearing the old interval. No extra cleanup code needed.

### Task 3: Test Patterns

**CSS Module class names in Vitest jsdom:**
In Vitest's jsdom environment, CSS Modules use an identity transform by default — `styles.alerting` evaluates to the literal string `"alerting"`. Therefore, `svg.classList.contains('alerting')` works correctly in tests without any special configuration.

**Finding the icon SVG:**
Lucide React renders an `<svg>` element. Use `container.querySelector('svg')` to find it. The `render()` call returns `{ container }`.

**Test for alerting class:**
```tsx
it('applies alerting class to icon when in alert state', () => {
  vi.useFakeTimers()
  const { container } = render(<TimerWidget icon={Eye} label="Yeux" defaultSeconds={2} />)
  act(() => { fireEvent.click(screen.getByRole('button', { name: 'Start' })) })
  act(() => { vi.advanceTimersByTime(2000) })
  const svg = container.querySelector('svg')
  expect(svg?.classList.contains('alerting')).toBe(true)
})
```

**Test for dismiss on icon click:**
```tsx
it('clicking icon in alert state dismisses the alert and resets timer', () => {
  vi.useFakeTimers()
  const { container } = render(<TimerWidget icon={Eye} label="Yeux" defaultSeconds={2} />)
  act(() => { fireEvent.click(screen.getByRole('button', { name: 'Start' })) })
  act(() => { vi.advanceTimersByTime(2000) })
  // In alert state — click the icon
  const svg = container.querySelector('svg')!
  act(() => { fireEvent.click(svg) })
  // Should return to stopped at defaultSeconds (2s = "00:00:02")
  expect(screen.getByRole('button', { name: 'Start' })).toBeTruthy()
  expect(screen.getByText('00:00:02')).toBeTruthy()
  expect(svg.classList.contains('alerting')).toBe(false)
})
```

**Test for no-op in non-alert state:**
```tsx
it('clicking icon in non-alert state does nothing', () => {
  const { container } = render(<TimerWidget icon={Eye} label="Yeux" defaultSeconds={60} />)
  const svg = container.querySelector('svg')!
  act(() => { fireEvent.click(svg) })
  // Still stopped — Start button still present
  expect(screen.getByRole('button', { name: 'Start' })).toBeTruthy()
  expect(screen.queryByRole('button', { name: 'Reset' })).toBeNull()
})
```

**Note on imports:** The test file already imports `{ render, screen, act, cleanup, fireEvent }` and `{ vi, afterEach }`. No new imports needed. The `{ container }` destructuring is added to the `render()` call return for tests that need it.

### AC #6: Independent Timer Behavior

Each `<TimerWidget>` renders its own `useReducer` instance. React local state is completely isolated between component instances — there is no shared state. When two `<TimerWidget>` instances are both in `alert` state, clicking one dispatches `DISMISS_ALERT` only to its own reducer. The other continues unchanged. This is guaranteed by React's architecture and requires no implementation work. No test needed for this AC.

### AC #7: No System Notification

The renderer process has `contextIsolation: true` (electron-vite default) and no access to `Notification` API or `ipcRenderer.send` except `set-always-on-top` (which is the only exposed IPC method via contextBridge). No implementation work needed. No test needed for this AC.

### Button Visibility Matrix (unchanged from Story 1.4)

| Status | Start | Pause | Resume | Reset | alerting icon |
|--------|-------|-------|--------|-------|---------------|
| stopped | ✅ | ❌ | ❌ | ❌ | ❌ |
| running | ❌ | ✅ | ❌ | ✅ | ❌ |
| paused | ❌ | ❌ | ✅ | ✅ | ❌ |
| **alert** | ❌ | ❌ | ❌ | ✅ | **✅** |

The Reset button remains in `alert` state (condition `!== 'stopped'` already handles it). Both Reset and icon click dismiss the timer, but via different actions: Reset → `RESET` (which works from any state), icon click → `DISMISS_ALERT` (which only works from `alert`).

### DO NOT implement in this story

- ❌ Inline default value editing (isEditing state) → Story 1.6
- ❌ Always-on-top toggle button → Story 1.7
- ❌ Changes to `App.tsx` beyond placeholder → Story 1.9
- ❌ Any new IPC channel or Notification API usage
- ❌ `setInterval` for blinking — CSS `animation` is the only allowed blink mechanism

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log

- CSS Modules returned `{}` by default in Vitest (no CSS transform active). Added `css.modules.classNameStrategy: 'non-scoped'` to vitest.config.ts so `styles.alerting === 'alerting'` in test environment. This enables `classList.contains('alerting')` assertions.

### Completion Notes

- Added `.alerting` CSS class with `animation: blink 1s step-end infinite` and `cursor: pointer` to `TimerWidget.module.css`
- Added `@keyframes blink` using `--ht-alert-red` and `--ht-alert-white` CSS custom properties only — no hardcoded hex values
- Updated `TimerWidget.tsx` icon element: conditional `alerting` class + `onClick` dispatching `DISMISS_ALERT` when `status === 'alert'`
- Added 3 new tests: alerting class presence, dismiss on icon click, no-op in non-alert state
- Updated `vitest.config.ts` with `css.modules.classNameStrategy: 'non-scoped'` to enable CSS class name assertions in tests
- AC #6 (independent timers) verified by design: each `TimerWidget` has its own `useReducer` — no shared state
- AC #7 (no notification) verified by omission: renderer process has no access to `Notification` API
- **50/50 tests pass** (47 pre-existing + 3 new)

### File List

- `health-timer/src/renderer/src/timer/TimerWidget.module.css` (modified — alerting class + keyframe)
- `health-timer/src/renderer/src/timer/TimerWidget.tsx` (modified — alerting class + onClick on icon)
- `health-timer/src/renderer/src/timer/TimerWidget.test.tsx` (modified — 3 new alert behavior tests)
- `health-timer/vitest.config.ts` (modified — css.modules.classNameStrategy: non-scoped)

### Change Log

- 2026-06-20: Story 1.5 implemented — CSS blink animation, icon-click dismiss (DISMISS_ALERT), 3 new tests. 50/50 tests passing.

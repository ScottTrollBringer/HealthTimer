---
status: done
baseline_commit: e700a6a0d2603d6f44c248b8ff4fa6e4283dce90
---

# Story 1.6: Inline default value editing

Status: review

## Story

As Ian,
I want to change a timer's default value by clicking on its time display,
So that I can customize each reminder interval directly in the app.

## Acceptance Criteria

1. **Given** the timer is in `stopped` state, **when** the user clicks the displayed time value, **then** the display transforms into an inline `<input type="text">` pre-filled with the current value in HH:MM:SS format.

2. **Given** the inline input is active and the user types a valid value, **when** the user presses Enter, **then** `parseTimeInput` validates it, `SET_DEFAULT` is dispatched with the new seconds value, and the display returns to label mode showing the new value.

3. **Given** the inline input is active, **when** the user presses Escape, **then** the input is cancelled, the original value is restored, and display mode returns — no dispatch occurs.

4. **Given** the inline input is active, **when** the user clicks outside (blur event), **then** the same save-and-validate logic as Enter applies.

5. **Given** the user enters a value below 5 seconds (e.g. "00:00:04"), **when** confirmed via Enter or blur, **then** the value is rejected (`parseTimeInput` returns null), the previous value is restored, and no dispatch occurs.

6. **Given** the user enters a value above 11:59:59 (e.g. "12:00:00") or an invalid format string, **when** confirmed via Enter or blur, **then** the value is rejected and the previous value is restored.

7. **Given** the timer is in `running`, `paused`, or `alert` state, **when** the user clicks the time display, **then** the inline editor does NOT activate.

## Tasks / Subtasks

- [x] Task 1 — Add CSS styles for inline editor to `TimerWidget.module.css` (AC: #1)
  - [x] Add `.timeInput` rule matching `.time` typography (monospace 13px, `--ht-text` color) with `background: var(--ht-bg)`, `border: 1px solid var(--ht-muted)`, `border-radius: 3px`, `width: 8ch`, `padding: 0 2px`, `outline: none`
  - [x] Add `.timeInput:focus` rule with `border-color: var(--ht-text)` for focus indicator
  - [x] Add `.timeEditable` rule with `cursor: text` (visual hint that the time is clickable when stopped)

- [x] Task 2 — Update `TimerWidget.tsx` with inline editing logic (AC: #1–#7)
  - [x] Add `useState, useRef` to react imports
  - [x] Add `parseTimeInput` import from `'../utils/parseTime'`
  - [x] Add `isEditing` (`useState(false)`) and `draft` (`useState('')`) local state
  - [x] Add `cancelledRef` (`useRef(false)`) to prevent double-commit when Escape unmounts the input and triggers blur
  - [x] Implement `startEditing()`: guard `state.status !== 'stopped'`, set `cancelledRef.current = false`, set draft to `formatSeconds(state.remaining)`, set `isEditing = true`
  - [x] Implement `commitEdit()`: guard `cancelledRef.current`, set `isEditing = false`, parse `draft` with `parseTimeInput`, dispatch `SET_DEFAULT` only if result is non-null
  - [x] Implement `cancelEdit()`: set `cancelledRef.current = true`, set `isEditing = false`
  - [x] Replace static `<span className={styles.time}>` with conditional: `isEditing && state.status === 'stopped'` → `<input>`, else → `<span>`
  - [x] On the `<span>`: set `onClick={startEditing}` and `className` conditioned on stopped state (adds `.timeEditable` when stopped)
  - [x] On the `<input>`: type="text", className={styles.timeInput}, controlled value={draft}, onChange updates draft, onKeyDown handles Enter (calls `e.currentTarget.blur()`) and Escape (calls `cancelEdit()`), onBlur={commitEdit}, autoFocus, onFocus selects all text

- [x] Task 3 — Add tests to `TimerWidget.test.tsx` (AC: #1–#7)
  - [x] Test: clicking time display in stopped state shows input pre-filled with formatted time
  - [x] Test: typing valid value + blur commits new value (time display updates, Start button remains)
  - [x] Test: pressing Escape cancels edit, original value restored, no SET_DEFAULT dispatched
  - [x] Test: invalid value (below 5s) on blur is rejected and original value is restored
  - [x] Test: invalid value (above max / bad format) on blur is rejected and original value restored
  - [x] Test: clicking time display in running state does NOT show input
  - [x] Test: clicking time display in paused state does NOT show input
  - [x] Run `npx vitest run` — confirm all prior tests still pass + new tests added

### Review Follow-ups (AI)

- [x] [AI-Review][Med] Fix `parseTimeInput` regex: `\d{2}` → `\d{1,2}` to accept single-digit segments (e.g. `1:30:00`) — silently rejected before
- [x] [AI-Review][Low] Remove unreachable `|| total > MAX_SECONDS` guard in `parseTimeInput` (h≤11,m<60,s<60 caps total at exactly MAX_SECONDS=43199)

## Dev Notes

### Current Project State

**Files that MUST be reused — do NOT recreate:**

- `src/renderer/src/timer/timerReducer.ts` — exports `timerReducer`, `createInitialState`, `SET_DEFAULT` action (line 55–57)
- `src/renderer/src/utils/parseTime.ts` — exports `parseTimeInput(str): number | null`. Valid range: `[5, 43199]` seconds. Returns null for bad format, below min, or above max.
- `src/renderer/src/utils/formatTime.ts` — exports `formatSeconds(n): string` → "HH:MM:SS". Already imported in TimerWidget.
- `src/renderer/src/timer/TimerWidget.tsx` — 49 lines, full content below. ONLY modify the imports block, add the new state/functions, and replace the `<span className={styles.time}>` line.
- `src/renderer/src/timer/TimerWidget.module.css` — 67 lines, full content below. Add 3 new rules at the end; do NOT replace existing rules.
- `src/renderer/src/timer/TimerWidget.test.tsx` — 12 tests, 120 lines. ADD new tests; keep all existing tests.

App.tsx is still a placeholder `<div>Health Timer</div>` — do NOT touch it.

### Current TimerWidget.tsx (full — read before modifying)

```tsx
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
        <Icon
          size={16}
          className={state.status === 'alert' ? `${styles.icon} ${styles.alerting}` : styles.icon}
          onClick={() => { if (state.status === 'alert') dispatch({ type: 'DISMISS_ALERT' }) }}
        />
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
        {state.status !== 'stopped' && (
          <button className={styles.btn} onClick={() => dispatch({ type: 'RESET' })}>Reset</button>
        )}
      </div>
    </div>
  )
}
```

**Only these lines change:**
1. Imports line 1: add `useState, useRef`
2. Import block: add `import { parseTimeInput } from '../utils/parseTime'`
3. After `useEffect`: add the 3 new state/ref declarations + 3 functions
4. Line 31: `<span className={styles.time}>{formatSeconds(state.remaining)}</span>` → replace with the conditional input/span block

### Current parseTime.ts (full)

```ts
const MIN_SECONDS = 5
const MAX_SECONDS = 43199  // = 11:59:59

export function parseTimeInput(str: string): number | null {
  const match = str.match(/^(\d{2}):(\d{2}):(\d{2})$/)
  if (!match) return null
  const h = parseInt(match[1], 10)
  const m = parseInt(match[2], 10)
  const s = parseInt(match[3], 10)
  if (h > 11 || m >= 60 || s >= 60) return null
  const total = h * 3600 + m * 60 + s
  if (total < MIN_SECONDS || total > MAX_SECONDS) return null
  return total
}
```

Note: `h > 11` means 12:xx:xx is rejected. "00:00:04" returns null (below 5s). "11:59:59" returns 43199 (max valid). "12:00:00" returns null (h > 11). Bad format strings (e.g. "abc", "1:1:1") return null.

### ARCH6 — isEditing is Local useState (critical)

Per ARCH6: inline editing is managed via local `isEditing` useState **separate from the timer reducer**. The reducer knows nothing about editing — it only handles SET_DEFAULT to update defaultSeconds and remaining.

Do NOT add `isEditing` to TimerState. Do NOT add editing actions to TimerAction. This is a deliberate separation: the reducer owns the countdown; the component owns the edit UI mode.

### SET_DEFAULT Action — Already in the Reducer

```ts
// timerReducer.ts line 55–57
case 'SET_DEFAULT':
  if (state.status !== 'stopped') return state
  return { ...state, defaultSeconds: action.payload, remaining: action.payload }
```

The reducer guard `status !== 'stopped'` is a safety net. In practice, `startEditing()` already guards against non-stopped states, so SET_DEFAULT is only ever dispatched when the timer is stopped.

**Important clarification from code review:** A previous code review flagged that `defaultSeconds` prop changes after mount are ignored by `useReducer`. Story 1.6's inline editing does NOT go through the prop — it dispatches `SET_DEFAULT` directly to the reducer, updating `state.defaultSeconds` in-place. The prop `defaultSeconds` is only used once at mount via `createInitialState`. The inline edit flow is: user edits → dispatch SET_DEFAULT → `state.defaultSeconds` updates → RESET/DISMISS_ALERT use the new value ✓. No prop change needed.

### Critical Pattern: cancelledRef — Escape + Blur Double-Call

When the user presses Escape, the sequence is:
1. `cancelEdit()` → `setIsEditing(false)`
2. React re-renders → `<input>` is removed from DOM
3. Browser fires `blur` on the input (it was focused)
4. `onBlur` = `commitEdit()` fires

Without protection, step 4 would try to commit after the user cancelled. The `cancelledRef` prevents this:

```tsx
const cancelledRef = useRef(false)

function startEditing() {
  if (state.status !== 'stopped') return
  cancelledRef.current = false          // reset on each new edit session
  setDraft(formatSeconds(state.remaining))
  setIsEditing(true)
}

function commitEdit() {
  if (cancelledRef.current) return      // abort if Escape was pressed
  setIsEditing(false)
  const parsed = parseTimeInput(draft)
  if (parsed !== null) {
    dispatch({ type: 'SET_DEFAULT', payload: parsed })
  }
}

function cancelEdit() {
  cancelledRef.current = true           // flag before isEditing → false
  setIsEditing(false)
}
```

This ref must be a `useRef`, NOT a `useState` — it must be mutated synchronously without triggering a re-render.

### Pattern: Enter Key → Commit via .blur()

Enter commits by programmatically blurring the input, which triggers `onBlur` → `commitEdit()`. This means commitEdit is called from ONE place only (onBlur), simplifying the logic:

```tsx
onKeyDown={(e) => {
  if (e.key === 'Enter') e.currentTarget.blur()   // → triggers onBlur → commitEdit
  else if (e.key === 'Escape') cancelEdit()
}}
onBlur={commitEdit}
```

Do NOT call `commitEdit()` directly from `onKeyDown` for Enter — that would cause `onBlur` to call it again.

### Conditional Render: input vs span

```tsx
{isEditing && state.status === 'stopped' ? (
  <input
    type="text"
    className={styles.timeInput}
    value={draft}
    onChange={(e) => setDraft(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === 'Enter') e.currentTarget.blur()
      else if (e.key === 'Escape') cancelEdit()
    }}
    onBlur={commitEdit}
    onFocus={(e) => e.target.select()}
    autoFocus
  />
) : (
  <span
    className={state.status === 'stopped' ? `${styles.time} ${styles.timeEditable}` : styles.time}
    onClick={startEditing}
  >
    {formatSeconds(state.remaining)}
  </span>
)}
```

The double condition `isEditing && state.status === 'stopped'` ensures the input disappears if the timer status changes while editing (e.g., if Start is somehow triggered). The span's `onClick` calls `startEditing()` which guards against non-stopped states, so clicking the time when running/paused/alert is silently ignored.

`onFocus={(e) => e.target.select()}` selects all text when the input opens — the user can immediately type a new value without manually clearing the old one.

### CSS Changes — Add to End of TimerWidget.module.css

```css
.timeEditable {
  cursor: text;
}

.timeInput {
  font-family: monospace;
  font-size: 13px;
  letter-spacing: 0.05em;
  color: var(--ht-text);
  background: var(--ht-bg);
  border: 1px solid var(--ht-muted);
  border-radius: 3px;
  width: 8ch;
  padding: 0 2px;
  outline: none;
}

.timeInput:focus {
  border-color: var(--ht-text);
}
```

`8ch` = exactly 8 characters width with a monospace font — fits "00:00:00" precisely. Only `--ht-*` CSS custom properties are used (no hardcoded colors).

### Test Patterns for Story 1.6

The existing tests use `fireEvent` from `@testing-library/react` and `act()`. Continue this pattern.

**Finding the input:** `<input type="text">` has implicit ARIA role `textbox` → use `screen.getByRole('textbox')`.

**Finding the time span:** `screen.getByText('00:00:02')` (the formatted time string).

**Simulating user interactions:**
```tsx
// Click time display to open editor
fireEvent.click(screen.getByText('00:00:02'))

// Type a new value
const input = screen.getByRole('textbox')
fireEvent.change(input, { target: { value: '00:01:00' } })

// Commit via blur (covers both Enter and blur paths)
fireEvent.blur(input)

// Cancel via Escape
fireEvent.keyDown(input, { key: 'Escape' })
```

**Testing Enter specifically (to verify Enter → blur → commit flow):**
```tsx
fireEvent.change(input, { target: { value: '00:01:00' } })
fireEvent.keyDown(input, { key: 'Enter' })
// In jsdom, e.currentTarget.blur() triggers blur synchronously
// The onBlur handler fires → commitEdit() is called
// Verify the edit was committed:
expect(screen.queryByRole('textbox')).toBeNull()
expect(screen.getByText('00:01:00')).toBeTruthy()
```

**Note on act():** Wrap state-changing fireEvent calls in `act()` per existing test pattern:
```tsx
act(() => { fireEvent.click(screen.getByText('00:00:02')) })
act(() => { fireEvent.blur(screen.getByRole('textbox')) })
```

**Test for rejection (invalid input):**
After blur with an invalid value, the input disappears and the original time span reappears with the unchanged value. `screen.getByRole('textbox')` should be null and `screen.getByText('00:00:02')` should be truthy.

**Verifying SET_DEFAULT was dispatched:**
After a valid edit + blur, verify the new value appears in the time display:
```tsx
expect(screen.getByText('00:01:00')).toBeTruthy()
```

After RESET, the timer should reset to the NEW default (not the original prop value):
```tsx
// start, advance, then reset
// verify reset goes to the new defaultSeconds
```

But this test may be out of scope for Story 1.6 — the reducer behavior is already tested in timerReducer.test.ts. Focus on the component-level behavior (display/input toggle + dispatch).

### Test Scaffold (minimum 8 tests)

```tsx
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

it('commits via Enter key (Enter triggers blur → commit)', () => {
  render(<TimerWidget icon={Eye} label="Yeux" defaultSeconds={60} />)
  act(() => { fireEvent.click(screen.getByText('00:01:00')) })
  const input = screen.getByRole('textbox')
  act(() => { fireEvent.change(input, { target: { value: '00:03:00' } }) })
  act(() => { fireEvent.keyDown(input, { key: 'Enter' }) })
  expect(screen.queryByRole('textbox')).toBeNull()
  expect(screen.getByText('00:03:00')).toBeTruthy()
})
```

### DO NOT Implement in This Story

- ❌ Always-on-top toggle → Story 1.7
- ❌ WipBand component → Story 1.8
- ❌ App.tsx composition of 4 timers → Story 1.9
- ❌ Any changes to `timerReducer.ts` (SET_DEFAULT is already correct)
- ❌ Any changes to `parseTime.ts` (already correct)
- ❌ Any changes to `formatTime.ts` (already correct)
- ❌ Persisting edited values (FR14 explicitly forbids any persistence)

### State Machine Reminder

| Status | Editor opens? | Notes |
|--------|--------------|-------|
| stopped | ✅ yes | Only valid state for editing |
| running | ❌ no | `startEditing()` returns early |
| paused | ❌ no | `startEditing()` returns early |
| alert | ❌ no | `startEditing()` returns early |

After `SET_DEFAULT` is dispatched: `state.defaultSeconds` = new value, `state.remaining` = new value. Next RESET or DISMISS_ALERT will return to the new default (not the original prop). This is correct per FR13.

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log

- `cancelledRef` pattern required: when Escape calls `cancelEdit()` → `setIsEditing(false)`, React re-renders removing the input, which fires a `blur` event (jsdom fires blur on unmount if element was focused). Without `cancelledRef`, `commitEdit()` would run after Escape, committing the cancelled draft. The `cancelledRef.current = true` in `cancelEdit()` guards `commitEdit()` against this.
- Enter key pattern: `e.currentTarget.blur()` in `onKeyDown` triggers `blur` synchronously in jsdom → `onBlur` = `commitEdit()` fires once. Do NOT call `commitEdit()` directly from `onKeyDown` for Enter — would cause double-call when blur also fires.
- `isEditing && state.status === 'stopped'` double-guard on input render: protects against edge case where timer state changes while editing (e.g. Start pressed simultaneously).

### Completion Notes

- Added `.timeEditable` (cursor: text), `.timeInput` (monospace input matching time display typography), `.timeInput:focus` (border highlight) to `TimerWidget.module.css`
- Added `isEditing` / `draft` useState + `cancelledRef` useRef to `TimerWidget.tsx`
- Added `startEditing()` / `commitEdit()` / `cancelEdit()` helper functions
- Replaced static `<span className={styles.time}>` with conditional: input when `isEditing && stopped`, span otherwise
- Added `parseTimeInput` import from `../utils/parseTime` (already existed, no changes to the utility)
- No changes to `timerReducer.ts`, or `formatTime.ts` — reused as-is
- 8 new tests added; 73/73 total tests pass (65 pre-existing + 8 new) — re-implemented after Story 1.4 code review revert
- ✅ Resolved [Med] parseTimeInput regex: `\d{1,2}` accepts flexible single-digit format (already in codebase, preserved)
- ✅ Resolved [Low] removed dead `|| total > MAX_SECONDS` guard from parseTimeInput (already in codebase, preserved)

### File List

- `health-timer/src/renderer/src/timer/TimerWidget.tsx` (modified)
- `health-timer/src/renderer/src/timer/TimerWidget.module.css` (modified)
- `health-timer/src/renderer/src/timer/TimerWidget.test.tsx` (modified)
- `health-timer/src/renderer/src/utils/parseTime.ts` (modified — regex fix + dead code removal)
- `health-timer/src/renderer/src/utils/formatTime.test.ts` (modified — 3 new tests for flexible format)

### Review Findings

**Patch (2):**

- [x] [Review][Patch] P1 — No `maxLength` on inline input [TimerWidget.tsx] — added `maxLength={8}`.
- [x] [Review][Patch] P2 — AC7 not tested for alert state [TimerWidget.test.tsx] — test added; 74/74 pass.

**Deferred (1):**

- [x] [Review][Defer] W1 — No test for Start-clicked-while-editing scenario [TimerWidget.test.tsx] — behavior is correct (blur→commitEdit resets isEditing, SET_DEFAULT no-op), but undocumented by tests. Not required by spec.

### Senior Developer Review (AI)

**Outcome:** Changes Requested
**Date:** 2026-06-20
**Severity:** 0 High / 1 Medium / 1 Low

### Action Items

- [x] [Med] Fix `parseTimeInput` regex `\d{2}` → `\d{1,2}`: silently rejected valid input like `1:30:00` (user deletes leading zero)
- [x] [Low] Remove unreachable `|| total > MAX_SECONDS` in `parseTimeInput`: structural guards (h≤11,m<60,s<60) already cap total at 43199=MAX_SECONDS

### Change Log

- 2026-06-20: Story 1.6 implemented — inline default value editing (isEditing useState, cancelledRef pattern, commitEdit/cancelEdit, 8 new tests). 58/58 tests passing.
- 2026-06-20: Addressed CR findings — parseTimeInput regex made flexible (`\d{1,2}`), dead code removed, 3 new tests. 61/61 tests passing.
- 2026-06-20: Re-implemented after Story 1.4 code review revert. parseTime.ts fixes already preserved. 73/73 tests passing.

---
baseline_commit: e700a6a0d2603d6f44c248b8ff4fa6e4283dce90
---

# Story 1.3: Timer State Machine (timerReducer)

Status: done

## Story

As a developer,
I want a pure reducer function implementing the timer state machine,
So that all 4 timer instances share identical, fully testable countdown logic.

## Acceptance Criteria

1. `src/renderer/src/timer/timerReducer.ts` exists and exports: `timerReducer` function, `TimerState` type, `TimerAction` type, and constants `DEFAULT_HEALTH_SECONDS` (3599), `DEFAULT_LONG_BREAK_SECONDS` (7199), `DEFAULT_EYE_SECONDS` (1199), `DEFAULT_SITTING_SECONDS` (1799).
2. `TimerState` has shape `{ status: 'stopped' | 'running' | 'paused' | 'alert'; remaining: number; defaultSeconds: number }`.
3. Given a timer in `stopped` state, when `START` is dispatched, status becomes `running` and `remaining` is unchanged.
4. Given a timer in `running` state, when `PAUSE` is dispatched, status becomes `paused`.
5. Given a timer in `paused` state, when `RESUME` is dispatched, status becomes `running`.
6. Given a timer in `running` state with `remaining: 10`, when `TICK` is dispatched, `remaining` becomes 9 and status stays `running`.
7. Given a timer in `running` state with `remaining: 1`, when `TICK` is dispatched, `remaining` becomes 0 and status becomes `alert`.
8. Given a timer in `alert` state, when `DISMISS_ALERT` is dispatched, status becomes `stopped` and `remaining` equals `defaultSeconds`.
9. Given a timer in any state, when `RESET` is dispatched, status becomes `stopped` and `remaining` equals `defaultSeconds`.
10. Given `SET_DEFAULT` action with a valid seconds value, when dispatched while timer is `stopped`, `defaultSeconds` and `remaining` both update to the new value.
11. `timerReducer` called twice with identical inputs returns identical outputs with no side effects.
12. `src/renderer/src/timer/timerReducer.test.ts` exists and `npx vitest run` passes all state transition tests.

## Tasks / Subtasks

- [x] Task 1 — Create `timer/` directory and `timerReducer.ts` with types and constants (AC: #1, #2)
  - [x] Create directory `health-timer/src/renderer/src/timer/`
  - [x] Create `timerReducer.ts` exporting `TimerState`, `TimerAction`, 4 DEFAULT constants, `timerReducer` function, and `createInitialState` helper

- [x] Task 2 — Implement all 7 state transitions inside `timerReducer` (AC: #3–#10)
  - [x] `START`: stopped → running (remaining unchanged); no-op in other states
  - [x] `PAUSE`: running → paused; no-op in other states
  - [x] `RESUME`: paused → running; no-op in other states
  - [x] `TICK`: running, remaining > 1 → remaining - 1, status running
  - [x] `TICK`: running, remaining ≤ 1 → remaining = 0, status alert
  - [x] `DISMISS_ALERT`: alert → stopped, remaining = defaultSeconds; no-op otherwise
  - [x] `RESET`: any state → stopped, remaining = defaultSeconds
  - [x] `SET_DEFAULT`: stopped only → defaultSeconds = payload, remaining = payload; no-op otherwise

- [x] Task 3 — Write co-located test file (AC: #11, #12)
  - [x] Create `health-timer/src/renderer/src/timer/timerReducer.test.ts`
  - [x] Tests: DEFAULT constants values
  - [x] Tests: START, PAUSE, RESUME transitions + no-op guards
  - [x] Tests: TICK at remaining > 1, at remaining === 1
  - [x] Tests: DISMISS_ALERT and RESET from multiple states
  - [x] Tests: SET_DEFAULT in stopped (applies) and non-stopped (no-op)
  - [x] Tests: purity — same inputs same output; input state not mutated
  - [x] Run `npx vitest run` and confirm all pass

### Review Findings

- [x] [Review][Decision] SET_DEFAULT with out-of-range payload — RESOLVED: design decision to trust callers; validation stays in parseTimeInput (UI layer). Reducer remains pure with no range logic. [src/renderer/src/timer/timerReducer.ts]
- [x] [Review][Defer] DISMISS_ALERT restores potentially corrupted defaultSeconds — cascades from SET_DEFAULT validation gap above; resolving the decision_needed finding above eliminates this — deferred

## Dev Notes

### Current Project State (from Stories 1.1 and 1.2)

The project lives under `health-timer/` (manually scaffolded — NOT the electron-vite CLI output):
- `electron-vite@5.0.0`, `typescript@6.0.3`, `vitest@4.1.9` installed
- `vitest.config.ts` exists at `health-timer/vitest.config.ts` — already configured:
  ```typescript
  test: { environment: 'node', include: ['src/renderer/src/**/*.test.ts'] }
  ```
  This glob **already covers** `src/renderer/src/timer/timerReducer.test.ts` — no vitest config changes needed.
- `src/renderer/src/utils/` exists with `formatTime.ts`, `parseTime.ts`, `formatTime.test.ts`
- `src/renderer/src/timer/` directory does **NOT yet exist** — must be created
- `App.tsx` is a placeholder — Story 1.4 will update it; do NOT touch it in this story

### Path Correction (Architecture Doc vs Actual Project)

The architecture doc shows paths like `src/renderer/timer/...` — the **actual** correct path is:
```
health-timer/src/renderer/src/timer/timerReducer.ts
health-timer/src/renderer/src/timer/timerReducer.test.ts
```

The extra `src/` after `renderer/` is the electron-vite convention confirmed by existing files.

### Task 1: Complete `timerReducer.ts` Implementation

**File**: `health-timer/src/renderer/src/timer/timerReducer.ts`

```typescript
export type TimerStatus = 'stopped' | 'running' | 'paused' | 'alert'

export type TimerState = {
  status: TimerStatus
  remaining: number       // seconds remaining in countdown
  defaultSeconds: number  // editable per session, not persisted
}

export type TimerAction =
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'TICK' }
  | { type: 'RESET' }
  | { type: 'DISMISS_ALERT' }
  | { type: 'SET_DEFAULT'; payload: number }

export const DEFAULT_HEALTH_SECONDS = 3599      // 00:59:59
export const DEFAULT_LONG_BREAK_SECONDS = 7199  // 01:59:59
export const DEFAULT_EYE_SECONDS = 1199         // 00:19:59
export const DEFAULT_SITTING_SECONDS = 1799     // 00:29:59

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
```

**Why `return state` (reference equality) for no-ops**: React's `useReducer` skips re-render when the reducer returns the exact same object reference. This is correct idiomatic React — no `structuredClone` or deep copy needed for no-ops.

**Why `TimerStatus` is a separate exported type**: Story 1.4 (TimerWidget) and Story 1.5 (blink animation) need to pattern-match on `state.status`. Exporting `TimerStatus` lets those components type their comparisons explicitly.

**Why `createInitialState`**: Story 1.4 needs to call `useReducer(timerReducer, createInitialState(props.defaultSeconds))`. Exporting this helper keeps the initialization logic in one place and makes tests cleaner.

### Task 2: State Machine Validation

The state machine diagram (from architecture.md):

```
stopped ──START──→ running ──PAUSE──→ paused
   ↑                  |                  |
   |                  ↓ (TICK@0)        |
   └──DISMISS_ALERT── alert ←───────────┘ RESUME
   
RESET from any state → stopped (remaining = defaultSeconds)
SET_DEFAULT only in stopped → updates defaultSeconds AND remaining
```

**Edge case on TICK**: `remaining <= 1` (not `=== 1`) handles the hypothetical case where remaining somehow lands at 0 while still running — both `remaining = 1` and `remaining = 0` trigger the alert transition safely.

**SET_DEFAULT in non-stopped states**: Returns `state` unchanged (reference equality). The UI in Story 1.6 enforces that inline editing is only available in stopped state, so this guard is a safety net.

### Task 3: Complete Test File

See `src/renderer/src/timer/timerReducer.test.ts` — 27 tests across 9 describe blocks.

### Architecture Constraints (MUST follow)

1. **Pure function only** — `timerReducer` has ZERO side effects. No `setInterval`, no `console.log`, no external calls.
2. **No imports** — `timerReducer.ts` imports nothing from React, Electron, or utils. It is a standalone TypeScript module.
3. **Spread for new state** — always `{ ...state, changed: newValue }`. Never mutate the `state` parameter.
4. **Reference equality for no-ops** — `return state` (not `return { ...state }`). React's `useReducer` optimization depends on this.

### Anti-Patterns to Avoid

- ❌ Do NOT put `setInterval` or any async logic inside the reducer
- ❌ Do NOT import `formatSeconds` or `parseTimeInput` — the reducer works with raw `number` values only
- ❌ Do NOT export `MIN_SECONDS` / `MAX_SECONDS` from this file — those are in `parseTime.ts`
- ❌ Do NOT create a `timerTypes.ts` — all types live in `timerReducer.ts` per architecture
- ❌ Do NOT add `TimerWidget.tsx` yet — that is Story 1.4
- ❌ Do NOT touch `App.tsx` — that is Story 1.9

### Story 1.4 Context (Awareness Only — Do NOT Implement)

Story 1.4 will use `timerReducer` and `createInitialState` like this:
```typescript
import { timerReducer, createInitialState, type TimerState } from './timerReducer'

// Inside TimerWidget.tsx:
const [state, dispatch] = useReducer(timerReducer, createInitialState(props.defaultSeconds))
```

Each of the 4 timer instances will have its own independent `useReducer` — no shared state between timers.

### Project Structure Reference

```
health-timer/
├── vitest.config.ts              ← already exists; include glob covers timer/
└── src/renderer/src/
    ├── App.tsx                   ← placeholder; DO NOT touch
    ├── utils/
    │   ├── formatTime.ts         ← done in Story 1.2
    │   ├── parseTime.ts          ← done in Story 1.2
    │   └── formatTime.test.ts    ← done in Story 1.2
    └── timer/                    ← CREATE this directory
        ├── timerReducer.ts       ← CREATE: reducer + types + constants
        └── timerReducer.test.ts  ← CREATE: all state transition tests
```

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- `timer/` directory created at `health-timer/src/renderer/src/timer/`
- `timerReducer.ts`: exports `TimerStatus`, `TimerState`, `TimerAction` (discriminated union, 7 action variants), 4 DEFAULT constants, `createInitialState`, `timerReducer`
- All 7 action types implemented with guard conditions; no-ops return `state` (reference equality)
- TICK boundary condition uses `<= 1` to handle edge case where remaining already at 0
- `timerReducer.test.ts`: 27 tests across 9 describe blocks (DEFAULT constants, createInitialState, START, PAUSE, RESUME, TICK, DISMISS_ALERT, RESET, SET_DEFAULT, purity)
- `npx vitest run` — 2 files, 38 tests (27 new + 11 from Story 1.2), all passed
- `npm run typecheck` — 0 errors (node + web)

### File List

- `health-timer/src/renderer/src/timer/timerReducer.ts` (new)
- `health-timer/src/renderer/src/timer/timerReducer.test.ts` (new)

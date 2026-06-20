---
status: review
baseline_commit: e700a6a0d2603d6f44c248b8ff4fa6e4283dce90
---

# Story 1.7: Always-on-top window toggle

Status: review

## Story

As Ian,
I want a button to keep the Health Timer window always visible above other windows,
So that I can see my timers while working in any application.

## Acceptance Criteria

1. **Given** the app launches, **when** the window opens, **then** always-on-top is OFF and the toggle button reflects the inactive state (`aria-pressed="false"`).

2. **Given** the toggle button is in OFF state, **when** the user clicks it, **then** `window.electronAPI.setAlwaysOnTop(true)` is called, the OS window floats above all others, and the button reflects active state (`aria-pressed="true"`).

3. **Given** the toggle button is in ON state, **when** the user clicks it again, **then** `window.electronAPI.setAlwaysOnTop(false)` is called, the window returns to normal stacking, and the button reflects inactive state (`aria-pressed="false"`).

4. **Given** the IPC handler in `main/index.ts`, **when** `'set-always-on-top'` is received with `true`, **then** `win.setAlwaysOnTop(true)` is called on the BrowserWindow instance. *(Already implemented in Story 1.1 — no code change needed.)*

5. **Given** the app is closed and relaunched, **when** the window opens, **then** always-on-top is OFF regardless of previous session state. *(Guaranteed by `useState(false)` initialization.)*

6. **Given** always-on-top is active on macOS, **when** another app is brought to fullscreen, **then** the Health Timer window remains visible on top. *(Manual test only — untestable in jsdom.)*

7. **Given** always-on-top is active on Windows 11, **when** another app is in focus, **then** the Health Timer window remains above it. *(Manual test only — untestable in jsdom.)*

## Tasks / Subtasks

- [x] Task 1 — Update `App.tsx` with always-on-top toggle state and button (AC: #1, #2, #3, #5)
  - [x] Add `useState` import from React (no other React imports needed)
  - [x] Add `const [alwaysOnTop, setAlwaysOnTopState] = useState(false)` local state
  - [x] Add `handleToggle()` function: compute `next = !alwaysOnTop`, call `setAlwaysOnTopState(next)`, call `window.electronAPI.setAlwaysOnTop(next)`
  - [x] Replace placeholder `<div>Health Timer</div>` with a wrapping `<div className={styles.app}>` containing the toggle button
  - [x] Render toggle button: `aria-pressed={alwaysOnTop}`, `onClick={handleToggle}`, label "Always on top", apply `styles.toggleBtn` (+ `styles.toggleBtnActive` when on)
  - [x] Add `import styles from './App.module.css'`

- [x] Task 2 — Create `App.module.css` with toggle button styles (AC: #1, #2)
  - [x] Create `health-timer/src/renderer/src/App.module.css`
  - [x] Add `.app` rule: `display: flex; flex-direction: column; height: 100%` (Story 1.9 will layout timers inside this)
  - [x] Add `.toggleBtn` rule: base style matching `.btn` in `TimerWidget.module.css` — `background: transparent; border: 1px solid var(--ht-muted); border-radius: 4px; color: var(--ht-muted); cursor: pointer; font-size: 11px; padding: 2px 6px`
  - [x] Add `.toggleBtnActive` rule: `color: var(--ht-text); border-color: var(--ht-text)` — visually distinct when ON
  - [x] All CSS custom properties MUST use `--ht-` prefix

- [x] Task 3 — Write `App.test.tsx` (AC: #1, #2, #3)
  - [x] Create `health-timer/src/renderer/src/App.test.tsx` with `// @vitest-environment jsdom` pragma
  - [x] In `beforeEach`: use `vi.stubGlobal('electronAPI', { setAlwaysOnTop: vi.fn() })` to mock the IPC bridge
  - [x] In `afterEach`: call `cleanup()` and `vi.unstubAllGlobals()`
  - [x] Test: renders with always-on-top OFF → `getByRole('button')` has `aria-pressed="false"`
  - [x] Test: click toggle when OFF → mock called once with `true`, button `aria-pressed="true"`
  - [x] Test: click toggle twice (OFF → ON → OFF) → second call with `false`, button `aria-pressed="false"`
  - [x] Run `npx vitest run` — confirm all prior tests still pass + 3 new tests

## Dev Notes

### Files and their current state

**DO NOT TOUCH (already correct):**
- `src/main/index.ts` — IPC handler `ipcMain.on('set-always-on-top', (_event, enabled) => { if (typeof enabled !== 'boolean') return; win?.setAlwaysOnTop(enabled) })` implemented in Story 1.1 and patched in CR.
- `src/preload/index.ts` — `contextBridge.exposeInMainWorld('electronAPI', { setAlwaysOnTop: (enabled: boolean) => ipcRenderer.send('set-always-on-top', enabled) })` already exposes the IPC bridge.
- `src/renderer/src/env.d.ts` — already declares `interface Window { electronAPI: { setAlwaysOnTop: (enabled: boolean) => void } }`. No change needed.

**MODIFY:**
- `src/renderer/src/App.tsx` — currently only `<div>Health Timer</div>`. Replace with toggle implementation. **Story 1.9 will extend this file further** (adds 4 TimerWidgets + WipBand) — write `App.tsx` so it's easy to extend: wrap in a flex `<div className={styles.app}>`, keep the toggle button as a self-contained element so Story 1.9 can add timer rows above/around it.

**CREATE NEW:**
- `src/renderer/src/App.module.css`
- `src/renderer/src/App.test.tsx`

### Architecture constraints (ARCH3, ARCH9)

- ARCH3: Single IPC method — `electronAPI.setAlwaysOnTop(boolean)` only. Do NOT add new IPC channels.
- ARCH9: Always-on-top initial state MUST be `false` on every launch. Enforced by `useState(false)`. Do NOT read from localStorage or any persistence.
- CSS: ALL custom properties use `--ht-` prefix. Never hardcode colors.

### Test pattern (established in Story 1.4/1.5/1.6)

- Use `// @vitest-environment jsdom` pragma at top of `.test.tsx`
- Use `fireEvent.click(button)` + `act(() => { ... })` — NOT `userEvent` (known fake-timer compat issue in Vitest 4.x)
- Import: `{ describe, it, expect, vi, beforeEach, afterEach }` from 'vitest'
- Import: `{ render, screen, act, cleanup, fireEvent }` from '@testing-library/react'
- **For `window.electronAPI` mock:** use `vi.stubGlobal('electronAPI', { setAlwaysOnTop: vi.fn() })` in `beforeEach`. Access the spy via `(window.electronAPI.setAlwaysOnTop as ReturnType<typeof vi.fn>)`.
- `vi.unstubAllGlobals()` in `afterEach` to restore the global after each test.

### Expected App.tsx after this story

```tsx
import { useState } from 'react'
import styles from './App.module.css'

function App(): React.JSX.Element {
  const [alwaysOnTop, setAlwaysOnTopState] = useState(false)

  function handleToggle() {
    const next = !alwaysOnTop
    setAlwaysOnTopState(next)
    window.electronAPI.setAlwaysOnTop(next)
  }

  return (
    <div className={styles.app}>
      <button
        className={`${styles.toggleBtn} ${alwaysOnTop ? styles.toggleBtnActive : ''}`}
        aria-pressed={alwaysOnTop}
        onClick={handleToggle}
      >
        Always on top
      </button>
    </div>
  )
}

export default App
```

*(Story 1.9 will add `<TimerWidget>` instances and `<WipBand>` inside `.app` — do not break this structure.)*

### AC coverage mapping

| AC | Test approach |
|----|---------------|
| AC1 | Unit test: initial `aria-pressed="false"` |
| AC2 | Unit test: click → mock called with `true`, `aria-pressed="true"` |
| AC3 | Unit test: click twice → mock called with `false`, `aria-pressed="false"` |
| AC4 | Already verified in Story 1.1 + CR patches — no new code or test |
| AC5 | Covered by AC1 (fresh render = `useState(false)`) |
| AC6/7 | Manual test on macOS/Windows — cannot unit test process boundary |

### Test mock pattern for electronAPI

```tsx
// beforeEach
vi.stubGlobal('electronAPI', { setAlwaysOnTop: vi.fn() })

// afterEach
vi.unstubAllGlobals()

// in test: access spy via cast
const spy = window.electronAPI.setAlwaysOnTop as ReturnType<typeof vi.fn>
expect(spy).toHaveBeenCalledWith(true)
```

### What Story 1.9 expects from this story

Story 1.9 will import `TimerWidget` and `WipBand` into `App.tsx`. It will add them inside `<div className={styles.app}>`. The toggle button must remain; Story 1.9 only adds timer rows. Preserve the `.app` wrapper div — Story 1.9 depends on it for layout.

### References

- ARCH3 (IPC surface): architecture.md — "API & Communication Patterns"
- ARCH9 (always-on-top initial state): architecture.md — "Gap Analysis Results"
- IPC handler already in: `src/main/index.ts` (Story 1.1 + CR patch)
- preload bridge already in: `src/preload/index.ts` (Story 1.1)
- Window type already declared: `src/renderer/src/env.d.ts` (Story 1.1)
- CSS Module pattern: see `src/renderer/src/timer/TimerWidget.module.css`
- Test pattern: see `src/renderer/src/timer/TimerWidget.test.tsx` (stories 1.4–1.6)

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- `vi.stubGlobal('electronAPI', ...)` used to mock IPC bridge in jsdom tests — works correctly in Vitest 4.x without needing to type-cast `window.electronAPI`. `vi.unstubAllGlobals()` in `afterEach` ensures clean state between tests.
- `fireEvent.click` + `act()` used consistently (NOT `userEvent`) — matches established test pattern from stories 1.4–1.6.

### Completion Notes List

- Updated `App.tsx`: replaced `<div>Health Timer</div>` placeholder with `useState(false)` toggle + `handleToggle()` + button with `aria-pressed`, wrapped in `<div className={styles.app}>` for Story 1.9 extension.
- Created `App.module.css`: `.app` flex container, `.toggleBtn` base style, `.toggleBtnActive` highlighted state — all using `--ht-*` CSS custom properties.
- Created `App.test.tsx`: 3 tests covering AC1 (initial OFF), AC2 (click ON), AC3 (click OFF again) using `vi.stubGlobal` IPC mock.
- 64/64 tests pass (61 pre-existing + 3 new). Zero TypeScript errors.

### File List

- `health-timer/src/renderer/src/App.tsx` (modified)
- `health-timer/src/renderer/src/App.module.css` (new)
- `health-timer/src/renderer/src/App.test.tsx` (new)

## Change Log

- 2026-06-20: Story 1.7 created — always-on-top toggle (useState + IPC bridge already wired).
- 2026-06-20: Story 1.7 implemented — App.tsx toggle button, App.module.css, App.test.tsx (3 tests). 64/64 tests passing.

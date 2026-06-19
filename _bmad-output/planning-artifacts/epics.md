---
stepsCompleted: [1, 2, 3, 4]
status: 'complete'
completedAt: '2026-06-19'
inputDocuments:
  - PRD/Health Timer.md
  - _bmad-output/planning-artifacts/architecture.md
---

# Health Timer - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Health Timer, decomposing the requirements from the PRD and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Display a single combined timer with icon for health gestures (hydration, stretching, breathing). Default: 59 minutes 59 seconds.
FR2: Display a timer with icon for long break. Default: 1 hour 59 minutes 59 seconds.
FR3: Display a timer with eye icon for eye rest reminder. Default: 19 minutes 59 seconds.
FR4: Display a timer with sitting person icon for posture reminder. Default: 29 minutes 59 seconds.
FR5: Each timer has an individual Start button to begin countdown.
FR6: Each timer decrements second by second once started until reaching 0.
FR7: When a timer reaches 0, its icon blinks: alternates #FF0000 and #FFFFFF at 1 Hz (0.5s each).
FR8: Blinking persists until user clicks the icon, which resets the timer to its default value in stopped state.
FR9: Each timer has individual Pause and Reset buttons.
FR10: App has an always-on-top toggle button — non-persistent between sessions, starts OFF.
FR11: No system notifications. Blink alerts only visible when app is in foreground.
FR12: On app close, all timers reset — next launch always starts from default values.
FR13: Timer default values are editable inline: clicking the displayed value reveals an inline HH:MM:SS input field. Valid range: 5 seconds minimum to 11 hours 59 minutes 59 seconds maximum.
FR14: Custom timer values are NOT persisted between sessions — always start with hardcoded defaults.
FR15: Timers do not auto-start on launch — each must be started individually.
FR16: WIP zone: horizontal band at bottom of window with a disabled heart rate placeholder ("WIP" text) and a greyed, non-clickable ON/OFF button.

### NonFunctional Requirements

NFR1: Cross-platform — runs natively on macOS and Windows 11 without emulation.
NFR2: All components 100% open source and free (MIT licensed).
NFR3: Window size: ~384×216 px (20% × 20% of 1080p), non-resizable.
NFR4: Dark theme mandatory.
NFR5: No network access — fully local, in-memory application.
NFR6: Single-user — no accounts, profiles, or authentication.
NFR7: No data persistence of any kind (no localStorage, no files, no database).

### Additional Requirements

- ARCH1: Project scaffolded with: `npm create electron-vite@latest health-timer -- --template react-ts`
- ARCH2: Timer logic (`setInterval`) runs in renderer process inside `useEffect` with mandatory cleanup.
- ARCH3: Single IPC method across process boundary: `electronAPI.setAlwaysOnTop(boolean)` via contextBridge.
- ARCH4: Timer state machine implemented as `useReducer` with shared pure `timerReducer` function.
- ARCH5: Blink animation implemented exclusively via CSS keyframes (`.alerting` class) — no JS color manipulation.
- ARCH6: Inline editing managed via local `isEditing` useState separate from the timer reducer.
- ARCH7: Time parsing/formatting via shared pure functions: `parseTimeInput()` and `formatSeconds()` in `utils/`.
- ARCH8: BrowserWindow: `width: 384, height: 216, minWidth: 384, minHeight: 216, resizable: false`.
- ARCH9: Always-on-top initial state: `false` on every launch.
- ARCH10: Packaging via electron-builder: macOS .dmg (arm64+x64 universal), Windows .exe NSIS installer.

### UX Design Requirements

N/A — No UX design document exists for this project. UI decisions are specified directly in the PRD and Architecture.

### FR Coverage Map

FR1: Epic 1 — Combined health gestures timer (default 59:59)
FR2: Epic 1 — Long break timer (default 1:59:59)
FR3: Epic 1 — Eye rest timer (default 19:59)
FR4: Epic 1 — Sitting posture timer (default 29:59)
FR5: Epic 1 — Individual Start button per timer
FR6: Epic 1 — Second-by-second countdown
FR7: Epic 1 — Alert blink at 0 (#FF0000↔#FFFFFF at 1Hz)
FR8: Epic 1 — Blink dismissed by clicking icon; timer resets to default
FR9: Epic 1 — Individual Pause and Reset buttons
FR10: Epic 1 — Always-on-top toggle (non-persistent, starts OFF)
FR11: Epic 1 — No system notifications; alert only visible in foreground
FR12: Epic 1 — All timers reset to defaults on app close
FR13: Epic 1 — Inline default value editing (5s – 11:59:59 range)
FR14: Epic 1 — Custom values not persisted between sessions
FR15: Epic 1 — Timers do not auto-start on launch
FR16: Epic 1 — WIP heart rate band (bottom, greyed, non-clickable ON/OFF)
NFR1: Epic 2 — Cross-platform native builds (macOS + Windows 11)
NFR2: Epic 1 — All dependencies MIT licensed
NFR3: Epic 1 — Window ~384×216 px, non-resizable
NFR4: Epic 1 — Dark theme mandatory
NFR5: Epic 1 — No network access
NFR6: Epic 1 — Single-user, no accounts
NFR7: Epic 1 — No data persistence
ARCH1: Epic 1 (Story 1) — electron-vite scaffold command
ARCH2: Epic 1 — setInterval in useEffect with cleanup
ARCH3: Epic 1 — Single contextBridge IPC method
ARCH4: Epic 1 — useReducer per timer, shared timerReducer
ARCH5: Epic 1 — Blink via CSS keyframes only
ARCH6: Epic 1 — isEditing useState separate from reducer
ARCH7: Epic 1 (Story 2) — formatSeconds + parseTimeInput utilities
ARCH8: Epic 1 (Story 1) — BrowserWindow dimensions
ARCH9: Epic 1 — Always-on-top initial state false
ARCH10: Epic 2 — electron-builder packaging targets

## Epic List

### Epic 1: Application Health Timer fonctionnelle
L'utilisateur peut lancer l'application, démarrer ses timers de santé, recevoir des alertes visuelles quand ils expirent, ajuster les valeurs par défaut, et contrôler la mise au premier plan.
**FRs couverts :** FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR8, FR9, FR10, FR11, FR12, FR13, FR14, FR15, FR16
**NFRs :** NFR2, NFR3, NFR4, NFR5, NFR6, NFR7
**ARCHs :** ARCH1, ARCH2, ARCH3, ARCH4, ARCH5, ARCH6, ARCH7, ARCH8, ARCH9

Stories:
- 1.1: Project scaffold + window configuration
- 1.2: Shared utility functions (formatSeconds, parseTimeInput)
- 1.3: Timer state machine (timerReducer + types + unit tests)
- 1.4: TimerWidget component — display and controls (Start/Pause/Reset)
- 1.5: Alert behavior — CSS blink animation and icon-click dismiss
- 1.6: Inline default value editing
- 1.7: Always-on-top toggle (IPC via contextBridge)
- 1.8: WIP heart rate band
- 1.9: Root layout — composition of 4 timers + WIP band

### Epic 2: Application distribuable
L'utilisateur peut installer l'application sur macOS (.dmg) et Windows 11 (.exe) sans outillage de développement.
**NFRs :** NFR1
**ARCHs :** ARCH10

Stories:
- 2.1: electron-builder configuration + macOS dmg + Windows NSIS exe builds

---

## Epic 1: Application Health Timer fonctionnelle

L'utilisateur peut lancer l'application, démarrer ses timers de santé, recevoir des alertes visuelles quand ils expirent, ajuster les valeurs par défaut, et contrôler la mise au premier plan.

### Story 1.1: Project scaffold and window configuration

As a developer,
I want to scaffold the Electron + Vite + React + TypeScript project and configure the application window,
So that the app launches as a compact, dark-themed, non-resizable window on both macOS and Windows.

**Acceptance Criteria:**

**Given** the command `npm create electron-vite@latest health-timer -- --template react-ts` is run
**When** setup completes
**Then** a working Electron app with Vite + React + TypeScript scaffolding exists and `npm run dev` launches the window without errors

**Given** the app launches
**When** the window opens
**Then** its dimensions are exactly `width: 384, height: 216` and `resizable: false` is set in BrowserWindow config

**Given** the app launches
**When** the window opens
**Then** the window background color is dark (#1a1a1a) via BrowserWindow `backgroundColor` and `alwaysOnTop` is `false`

**Given** `src/renderer/src/styles/global.css` exists
**When** it is loaded
**Then** `:root` defines all `--ht-*` CSS custom properties: `--ht-bg` (#1a1a1a), `--ht-surface` (#242424), `--ht-text` (#efefef), `--ht-muted` (#888888), `--ht-alert-red` (#FF0000), `--ht-alert-white` (#FFFFFF)

**Given** `src/renderer/src/env.d.ts` exists
**When** the renderer TypeScript compiles
**Then** `Window.electronAPI` is declared with `setAlwaysOnTop: (enabled: boolean) => void`

**Given** `src/preload/index.ts` is configured
**When** the renderer calls `window.electronAPI.setAlwaysOnTop(true)`
**Then** the IPC message `'set-always-on-top'` is received in the main process and `win.setAlwaysOnTop(true)` is called

**Given** the app runs on macOS
**When** launched
**Then** it opens without errors or permission prompts

**Given** the app runs on Windows 11
**When** launched
**Then** it opens without errors

---

### Story 1.2: Shared time utility functions

As a developer,
I want shared pure functions for formatting and parsing time values,
So that all components handle HH:MM:SS conversion consistently without duplicating logic.

**Acceptance Criteria:**

**Given** `formatSeconds(n: number): string` exists in `src/renderer/src/utils/formatTime.ts`
**When** called with 0
**Then** it returns "00:00:00"

**Given** `formatSeconds(n)`
**When** called with 5
**Then** returns "00:00:05"

**Given** `formatSeconds(n)`
**When** called with 3599
**Then** returns "00:59:59"

**Given** `formatSeconds(n)`
**When** called with 43199
**Then** returns "11:59:59"

**Given** `parseTimeInput(str: string): number | null` exists in `src/renderer/src/utils/parseTime.ts`
**When** called with "01:30:00"
**Then** returns 5400

**Given** `parseTimeInput(str)`
**When** called with "00:00:05" (minimum valid)
**Then** returns 5

**Given** `parseTimeInput(str)`
**When** called with "11:59:59" (maximum valid)
**Then** returns 43199

**Given** `parseTimeInput(str)`
**When** called with "00:00:04" (below 5-second minimum)
**Then** returns null

**Given** `parseTimeInput(str)`
**When** called with "12:00:00" (above 11:59:59 maximum)
**Then** returns null

**Given** `parseTimeInput(str)`
**When** called with an invalid string such as "abc" or "99:99:99"
**Then** returns null

**Given** `src/renderer/src/utils/formatTime.test.ts` exists co-located
**When** `npx vitest` runs
**Then** all edge cases above pass

---

### Story 1.3: Timer state machine (timerReducer)

As a developer,
I want a pure reducer function implementing the timer state machine,
So that all 4 timer instances share identical, fully testable countdown logic.

**Acceptance Criteria:**

**Given** `src/renderer/src/timer/timerReducer.ts` exists
**When** imported
**Then** it exports: `timerReducer` function, `TimerState` type, `TimerAction` type, and constants `DEFAULT_HEALTH_SECONDS` (3599), `DEFAULT_LONG_BREAK_SECONDS` (7199), `DEFAULT_EYE_SECONDS` (1199), `DEFAULT_SITTING_SECONDS` (1799)

**Given** `TimerState` is defined
**When** inspected
**Then** it has shape `{ status: 'stopped' | 'running' | 'paused' | 'alert'; remaining: number; defaultSeconds: number }`

**Given** a timer in `stopped` state
**When** `START` action is dispatched
**Then** status becomes `running` and `remaining` is unchanged

**Given** a timer in `running` state
**When** `PAUSE` action is dispatched
**Then** status becomes `paused`

**Given** a timer in `paused` state
**When** `RESUME` action is dispatched
**Then** status becomes `running`

**Given** a timer in `running` state with `remaining: 10`
**When** `TICK` action is dispatched
**Then** `remaining` becomes 9 and status stays `running`

**Given** a timer in `running` state with `remaining: 1`
**When** `TICK` action is dispatched
**Then** `remaining` becomes 0 and status becomes `alert`

**Given** a timer in `alert` state
**When** `DISMISS_ALERT` action is dispatched
**Then** status becomes `stopped` and `remaining` equals `defaultSeconds`

**Given** a timer in any state
**When** `RESET` action is dispatched
**Then** status becomes `stopped` and `remaining` equals `defaultSeconds`

**Given** `SET_DEFAULT` action with a valid seconds value
**When** dispatched while timer is `stopped`
**Then** `defaultSeconds` and `remaining` both update to the new value

**Given** `timerReducer` is a pure function
**When** called twice with identical inputs
**Then** it returns identical outputs with no side effects

**Given** `src/renderer/src/timer/timerReducer.test.ts` exists
**When** `npx vitest` runs
**Then** all state transition tests pass

---

### Story 1.4: TimerWidget component — display and controls

As Ian,
I want to see each timer with its icon, time readout, and Start/Pause/Reset buttons,
So that I can monitor and individually control each health reminder.

**Acceptance Criteria:**

**Given** `TimerWidget.tsx` receives props `icon`, `label`, `defaultSeconds`
**When** rendered
**Then** it displays the icon, the label text, and the time formatted as HH:MM:SS via `formatSeconds`

**Given** the timer is in `stopped` state
**When** the Start button is clicked
**Then** the timer transitions to `running` and the display begins decrementing each second

**Given** the timer is in `running` state
**When** the Pause button is clicked
**Then** the timer transitions to `paused` and the display freezes

**Given** the timer is in `paused` state
**When** the Resume/Pause button is clicked
**Then** the timer transitions to `running` and the display resumes decrementing

**Given** the timer is in any state
**When** the Reset button is clicked
**Then** the timer returns to `stopped` with `remaining` equal to `defaultSeconds`

**Given** the timer is `running`
**When** 1 second elapses (via `setInterval` in `useEffect`)
**Then** `TICK` is dispatched and `remaining` decrements by exactly 1

**Given** the timer status is not `running`
**When** the `useEffect` cleanup runs
**Then** `clearInterval` is called and no interval remains active

**Given** the component unmounts (app close)
**When** any timers were running
**Then** all intervals are cleared automatically with no memory leaks

---

### Story 1.5: Alert behavior — blink animation and icon-click dismiss

As Ian,
I want the timer's icon to blink red and white when a timer reaches zero, and to dismiss it by clicking the icon,
So that I notice the health reminder even while focused on other work.

**Acceptance Criteria:**

**Given** a timer in `running` state with `remaining: 1`
**When** `TICK` fires
**Then** the timer enters `alert` state with `remaining: 0`

**Given** the timer is in `alert` state
**When** the component renders
**Then** the CSS class `alerting` (or equivalent from `TimerWidget.module.css`) is applied to the icon element

**Given** the `.alerting` CSS class is active
**When** rendered in a browser
**Then** the icon alternates between color `#FF0000` and color `#FFFFFF` via a CSS `animation: blink 1s step-end infinite` keyframe — no JavaScript color manipulation occurs

**Given** the timer is in `alert` state
**When** the user clicks the icon
**Then** `DISMISS_ALERT` is dispatched, the `alerting` class is removed, and the timer is in `stopped` state at `defaultSeconds`

**Given** the timer is in a non-alert state
**When** the icon is clicked
**Then** nothing happens

**Given** two timers are simultaneously in `alert` state
**When** the user clicks one icon
**Then** only that timer resets; the other continues blinking independently

**Given** the app is covered by another window while in `alert` state
**When** the alert triggers
**Then** no system notification, sound, or OS-level popup is produced

---

### Story 1.6: Inline default value editing

As Ian,
I want to change a timer's default value by clicking on its time display,
So that I can customize each reminder interval directly in the app.

**Acceptance Criteria:**

**Given** the timer is in `stopped` state
**When** the user clicks the displayed time value
**Then** the display transforms into an inline `<input type="text">` pre-filled with the current value in HH:MM:SS format

**Given** the inline input is active and the user types a valid value
**When** the user presses Enter
**Then** `parseTimeInput` validates it, `SET_DEFAULT` is dispatched with the new seconds value, and the display returns to label mode

**Given** the inline input is active
**When** the user presses Escape
**Then** the input is cancelled, the original value is restored, and display mode returns

**Given** the inline input is active
**When** the user clicks outside (blur event)
**Then** the same save-and-validate logic as Enter applies

**Given** the user enters a value below 5 seconds (e.g. "00:00:04")
**When** confirmed via Enter or blur
**Then** the value is rejected (parseTimeInput returns null), the previous value is restored, and no dispatch occurs

**Given** the user enters a value above 11:59:59 (e.g. "12:00:00")
**When** confirmed
**Then** the value is rejected and the previous value is restored

**Given** the user enters an invalid format string
**When** confirmed
**Then** the value is rejected and the previous value is restored

**Given** the timer is in `running` or `paused` state
**When** the user clicks the time display
**Then** the inline editor does NOT activate

**Given** the timer is in `alert` state
**When** the user clicks the time display area
**Then** the inline editor does NOT activate

---

### Story 1.7: Always-on-top window toggle

As Ian,
I want a button to keep the Health Timer window always visible above other windows,
So that I can see my timers while working in any application.

**Acceptance Criteria:**

**Given** the app launches
**When** the window opens
**Then** always-on-top is OFF and the toggle button reflects the inactive state

**Given** the toggle button is in OFF state
**When** the user clicks it
**Then** `window.electronAPI.setAlwaysOnTop(true)` is called, the OS window floats above all others, and the button reflects active state

**Given** the toggle button is in ON state
**When** the user clicks it again
**Then** `window.electronAPI.setAlwaysOnTop(false)` is called, the window returns to normal stacking, and the button reflects inactive state

**Given** the IPC handler in `main/index.ts`
**When** `'set-always-on-top'` is received with `true`
**Then** `win.setAlwaysOnTop(true)` is called on the BrowserWindow instance

**Given** the app is closed and relaunched
**When** the window opens
**Then** always-on-top is OFF regardless of previous session state

**Given** always-on-top is active on macOS
**When** another app is brought to fullscreen
**Then** the Health Timer window remains visible on top

**Given** always-on-top is active on Windows 11
**When** another app is in focus
**Then** the Health Timer window remains above it

---

### Story 1.8: WIP heart rate band

As Ian,
I want a placeholder zone for future heart rate functionality at the bottom of the app,
So that the layout is prepared for the upcoming feature without it being functional today.

**Acceptance Criteria:**

**Given** `src/renderer/src/wip/WipBand.tsx` exists
**When** rendered
**Then** it displays as a horizontal band occupying the bottom portion of the 216 px window

**Given** the WIP band is rendered
**When** the user looks at it
**Then** it shows the text "WIP" where the heart rate reading would appear

**Given** the WIP band is rendered
**When** the user looks at it
**Then** it includes an ON/OFF button with `disabled` attribute and greyed visual styling

**Given** the disabled ON/OFF button
**When** the user clicks it
**Then** nothing happens (no state change, no event dispatch)

**Given** the WIP band styling
**When** rendered
**Then** the entire zone uses `--ht-muted` or equivalent greyed styling that visually signals it is inactive/placeholder

**Given** the window is 216 px tall with 4 timer widgets above
**When** the WIP band is present
**Then** it does not cause overflow, scrollbars, or clipping of timer content

---

### Story 1.9: Root layout — full application composition

As Ian,
I want to see all 4 health timers and the WIP band arranged in the app window,
So that I have a complete, functional Health Timer application ready for daily use.

**Acceptance Criteria:**

**Given** `App.tsx` renders
**When** the window opens
**Then** it contains exactly 4 `<TimerWidget>` instances and 1 `<WipBand>` at the bottom

**Given** the 4 timers are rendered at launch
**When** the window opens
**Then** timer 1 shows health gestures icon + "00:59:59", timer 2 shows long break icon + "01:59:59", timer 3 shows eye icon + "00:19:59", timer 4 shows sitting icon + "00:29:59"

**Given** all 4 timers are in stopped state on launch
**When** the app starts
**Then** none begin decrementing automatically

**Given** all 4 timers are running simultaneously
**When** the window is at 384×216 px
**Then** all timer displays and controls are visible without overflow, scrollbars, or clipping

**Given** the dark theme CSS custom properties are defined at `:root`
**When** the app renders
**Then** the background, surfaces, and text use `--ht-bg`, `--ht-surface`, and `--ht-text` consistently

**Given** 2 timers reach 0 simultaneously
**When** both enter `alert` state
**Then** both icons blink independently without interfering with each other

**Given** all timers are running and the app is closed
**When** the app relaunches
**Then** all timers are in `stopped` state at their hardcoded default values

---

## Epic 2: Application distribuable

L'utilisateur peut installer l'application sur macOS (.dmg) et Windows 11 (.exe) sans outillage de développement.

### Story 2.1: Packaging configuration and distribution builds

As Ian,
I want to build installable packages for macOS and Windows 11,
So that I can install Health Timer on any of my machines without needing Node.js or a terminal.

**Acceptance Criteria:**

**Given** `electron-builder.yml` exists at the project root
**When** the file is read
**Then** it defines `appId` (e.g. `fr.ianfraser.health-timer`), `productName: "Health Timer"`, macOS target `dmg` with `arch: ["x64", "arm64"]`, and Windows target `nsis`

**Given** `npm run package` is executed on macOS
**When** the build completes without errors
**Then** a `.dmg` file is produced in `out/` for both x64 and arm64 architectures

**Given** `npm run package` is executed on a Windows build environment
**When** the build completes without errors
**Then** an NSIS `.exe` installer is produced in `out/`

**Given** the macOS `.dmg` is opened and the app is dragged to Applications
**When** Health Timer is launched
**Then** the window opens correctly at 384×216 px with dark theme

**Given** the Windows `.exe` installer is run
**When** installation completes
**Then** Health Timer can be launched from the Start menu and the window opens correctly

**Given** the distributed app runs on macOS or Windows 11
**When** launched on a machine with no Node.js or developer tools
**Then** the application works fully without any additional setup

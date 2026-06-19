---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
lastStep: 8
status: 'complete'
completedAt: '2026-06-19'
inputDocuments:
  - PRD/Health Timer.md
workflowType: 'architecture'
project_name: 'Health Timer'
user_name: 'Ian'
date: '2026-06-19'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
11 functional requirements across three categories:
- Timer management: 4 independent timer instances sharing an identical state machine (stopped → running → paused → alert). One combined timer covers hydration/stretching/breathing; separate timers for long break, eye rest, and sitting posture.
- User interactions: individual start/pause/reset controls per timer; inline value editing (click-to-edit HH:MM:SS field, no modal); pictogram click to dismiss alert and reset timer.
- Session lifecycle: no state persisted between sessions; always-on-top toggle (non-persistent); no system notifications; timers reset to defaults on close.

**Non-Functional Requirements:**
- Cross-platform native: macOS and Windows 11, no emulation — primary architectural driver
- Open source + free components only
- Compact window: ~384×216 px at 1080p (20%×20%)
- Dark theme mandatory
- No network, no database, no backend — fully local, in-memory state

**Scale & Complexity:**

- Primary domain: desktop GUI application
- Complexity level: low
- Estimated architectural components: 4 (UI shell, timer engine, window manager, WIP placeholder)

### Technical Constraints & Dependencies

- Must ship native binaries for both macOS and Windows 11 — framework must support both without emulation or compatibility layers
- No internet connectivity required or permitted (no telemetry, no update checks)
- No persistence layer: all state lives in process memory and is discarded on exit
- Always-on-top requires platform window API access (OS-level privilege, not just CSS z-index)

### Cross-Cutting Concerns Identified

- **Timer state machine**: 4 identical instances — should be a shared reusable component/class
- **1 Hz tick loop**: drives both countdown and blink animation; must be stable and not drift
- **HH:MM:SS formatting and validation**: shared across display and inline editor
- **Dark theme**: global styling concern, applied at the root level
- **Platform window API**: always-on-top toggle must work on both target OSes

## Starter Template Evaluation

### Primary Technology Domain

Cross-platform desktop GUI application (macOS + Windows 11), identified from the cross-platform NFR and the always-on-top, timer, and windowing requirements.

### Starter Options Considered

| Option | Bundle | Languages | Notes |
|--------|--------|-----------|-------|
| Electron v41 + Vite + React + TS | ~150 MB | TypeScript only | Very mature, maximum AI corpus |
| Tauri v2 + React + TS | ~5-8 MB | TypeScript + Rust | Lighter, but two languages required |

### Selected Starter: electron-vite (Electron v41 + Vite + React + TypeScript)

**Rationale for Selection:**
All three PRD criteria are met: (1) cross-platform macOS+Windows via Electron's BrowserWindow, (2) fully open source (MIT), (3) TypeScript + React has the largest AI training corpus of any desktop stack, with no second language (Rust) required. Bundle size (~150 MB) is irrelevant for a personal desktop tool.

**Initialization Command:**

```bash
npm create electron-vite@latest health-timer -- --template react-ts
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
TypeScript throughout — main process (Electron) and renderer process (React).

**UI Framework:**
React 18 — component-based, state management via useState/useReducer per timer instance.

**Build Tooling:**
Vite — fast HMR in development, optimized production builds via electron-builder.

**Styling Solution:**
CSS Modules or plain CSS — no external library needed; dark theme via CSS custom properties at `:root` level.

**Testing Framework:**
Vitest (included) for unit tests; Playwright available for E2E.

**Code Organization:**
Standard electron-vite structure:
- `src/main/` — Electron main process (window management, always-on-top)
- `src/preload/` — contextBridge API surface
- `src/renderer/` — React app (UI, timer logic, state)

**Development Experience:**
Hot module replacement (Vite HMR) in renderer; auto-reload in main process on changes.

**Note:** Project initialization using this command should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Timer logic process placement (renderer)
- IPC surface definition (setAlwaysOnTop only)
- State management pattern (useReducer per timer)

**Important Decisions (Shape Architecture):**
- Styling approach (CSS Modules + custom properties)
- Icon library (Lucide React)
- Component architecture (shared TimerWidget)

**Deferred Decisions (Post-MVP):**
- Packaging configuration details (electron-builder targets) — needed before first release, not before first story

### Data Architecture

N/A — no database, no persistence layer, no backend. All state is in-memory and discarded on process exit by design (PRD requirement).

### Authentication & Security

N/A — single-user local desktop application with no network access, no accounts, no personal data.

### API & Communication Patterns

**Electron IPC Surface (minimal by design):**
- Single exposed method via `contextBridge` in preload: `electronAPI.setAlwaysOnTop(enabled: boolean) => void`
- All other logic (timers, state, UI) lives entirely in the renderer process — no IPC required
- `contextBridge` isolates the renderer from Node.js APIs (security best practice)

**Rationale:** Timer logic in the renderer via `setInterval` is sufficient — drift is negligible for countdowns ranging from 5 seconds to 12 hours. Keeping logic in the renderer eliminates bidirectional IPC complexity.

### Frontend Architecture

**State Management: `useReducer` per TimerWidget**

Each `<TimerWidget>` component owns a `useReducer` instance with a shared `timerReducer` function. Timer state machine:

```
stopped ──START──→ running ──PAUSE──→ paused
   ↑                  |                  |
   └──DISMISS_ALERT── ↓    ←──RESUME────┘
                    alert  ←──TICK (at 0)
   └──RESET──────── any state
```

Actions: `START | PAUSE | RESUME | RESET | TICK | DISMISS_ALERT`

State shape per timer:
```typescript
type TimerState = {
  status: 'stopped' | 'running' | 'paused' | 'alert';
  remaining: number;      // seconds
  defaultSeconds: number; // editable, non-persistent
}
```

**Component Architecture: Single `<TimerWidget>` Component**

Props: `icon: LucideIcon`, `label: string`, `defaultSeconds: number`

Encapsulates: countdown logic, blink animation, inline editor, start/pause/reset controls. Instantiated 4 times in the root layout.

**Styling: CSS Modules + CSS Custom Properties**

Dark theme defined at `:root` in `global.css`:
```css
:root {
  --bg: #1a1a1a;
  --surface: #242424;
  --text: #efefef;
  --muted: #888;
  --alert-red: #FF0000;
  --alert-white: #FFFFFF;
}
```

Each component uses a `.module.css` file for scoped styles. No external styling library.

**Icons: Lucide React (MIT)**

Icons used: `Droplet` (health gestures), `Coffee` (long break), `Eye` (eye rest), `Armchair` (sitting posture), `Heart` (WIP heart rate placeholder).

**Blink Animation:**

Implemented via a CSS animation class toggled in the `alert` state, not via JavaScript color manipulation:
```css
@keyframes alert-blink {
  0%, 100% { color: var(--alert-red); }
  50% { color: var(--alert-white); }
}
```
Applied at 1Hz (animation-duration: 1s, animation-iteration-count: infinite).

**Inline Timer Editing:**

Click on the displayed time value → `<input type="text">` replaces the `<span>`, pre-filled with current `HH:MM:SS`. On blur or Enter: validate range [5s, 43199s], update `defaultSeconds` in state, revert to display. On Escape: cancel edit.

### Infrastructure & Deployment

**Packaging: electron-builder (included in electron-vite template)**

Targets:
- macOS: `.dmg` (arm64 + x64 universal)
- Windows 11: `.exe` NSIS installer

No auto-updater, no code signing required for personal use. Build config in `electron-builder.yml`.

### Decision Impact Analysis

**Implementation Sequence:**
1. Project scaffold (`npm create electron-vite@latest`)
2. Window config (size, dark frame, always-on-top IPC)
3. `timerReducer` + `TimerState` types
4. `<TimerWidget>` component (display + controls)
5. Blink animation (CSS keyframes)
6. Inline editor
7. Root layout (4 timer instances + WIP band)
8. Packaging config

**Cross-Component Dependencies:**
- `timerReducer` is shared logic — must be stable before `TimerWidget` is built
- CSS custom properties are global — must be defined before any component styling
- `contextBridge` preload must be set up before the always-on-top toggle can be wired

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:** 7 areas where AI agents could make different choices without explicit rules.

### Naming Patterns

**Files and Components:**
- React components: `PascalCase.tsx` → `TimerWidget.tsx`, `WipBand.tsx`
- CSS Modules: same name as component → `TimerWidget.module.css`
- Custom hooks: `camelCase` prefixed with `use` → `useTimerReducer.ts`
- Reducer/types: `timerReducer.ts`, `timerTypes.ts` under `src/renderer/timer/`
- Utilities: `camelCase.ts` → `formatTime.ts`, `parseTime.ts`

**Variables and Constants:**
- Global constants: `SCREAMING_SNAKE_CASE` → `DEFAULT_HEALTH_SECONDS`, `MAX_SECONDS`, `MIN_SECONDS`
- Props: `camelCase` → `defaultSeconds`, `icon`, `label`
- Reducer action types: `SCREAMING_SNAKE_CASE` → `START`, `PAUSE`, `RESUME`, `RESET`, `TICK`, `DISMISS_ALERT`

**CSS Custom Properties:**
All variables use the `--ht-` prefix (Health Timer) to avoid conflicts with Lucide or Electron defaults:
```css
--ht-bg, --ht-surface, --ht-text, --ht-muted, --ht-alert-red, --ht-alert-white
```

### Structure Patterns

**File Organization:**
```
src/
  main/
    index.ts          ← main process entry point
    windowConfig.ts   ← BrowserWindow configuration
  preload/
    index.ts          ← contextBridge only
  renderer/
    main.tsx          ← React entry point
    App.tsx           ← root layout (4 TimerWidgets + WipBand)
    timer/
      TimerWidget.tsx
      TimerWidget.module.css
      timerReducer.ts  ← reducer + types + constants
    wip/
      WipBand.tsx
      WipBand.module.css
    styles/
      global.css       ← :root CSS custom properties + reset
```

**Tests:** co-located with source files → `timerReducer.test.ts` next to `timerReducer.ts`.

### Behavior Patterns

**Timer Loop (critical):**
`setInterval` always inside a `useEffect` with mandatory cleanup. No `setInterval` outside `useEffect`. Ticks dispatch to the reducer — no direct state mutation.

```typescript
// CORRECT
useEffect(() => {
  if (state.status !== 'running') return;
  const id = setInterval(() => dispatch({ type: 'TICK' }), 1000);
  return () => clearInterval(id);
}, [state.status]);
```

**Blink Animation:**
CSS keyframes only — no separate `setInterval` for blinking, no inline JS color manipulation. The blink is triggered by adding/removing an `alerting` CSS class on the icon element.

```css
/* TimerWidget.module.css */
.alerting {
  animation: blink 1s step-end infinite;
}
@keyframes blink {
  0%, 100% { color: var(--ht-alert-red); }
  50%       { color: var(--ht-alert-white); }
}
```

**Inline Editing:**
Local `isEditing: boolean` state managed by `useState` inside `TimerWidget` (separate from the reducer — editing is not a timer state). Parsing via `parseTimeInput(str): number | null` in `formatTime.ts`. Validation on blur and Enter key. Escape cancels without applying.

### IPC Pattern

Single IPC call declared in `preload/index.ts`:

```typescript
contextBridge.exposeInMainWorld('electronAPI', {
  setAlwaysOnTop: (enabled: boolean) => ipcRenderer.send('set-always-on-top', enabled),
});
```

Type declaration in `src/renderer/env.d.ts`:
```typescript
interface Window {
  electronAPI: { setAlwaysOnTop: (enabled: boolean) => void; };
}
```

Main process handler: `ipcMain.on('set-always-on-top', (_, enabled) => win.setAlwaysOnTop(enabled))`.

### Enforcement Guidelines

**All AI Agents MUST:**
1. Never create a `setInterval` outside a `useEffect` with cleanup
2. Blink animation is 100% CSS — no JS touches icon color in alert state
3. `timerReducer` is a pure function — no side-effects inside the reducer
4. All CSS custom properties carry the `--ht-` prefix
5. `contextBridge` exposes only one `electronAPI` object — never call `ipcRenderer` directly from the renderer
6. `parseTimeInput` and `formatSeconds` are the only time-conversion functions — no inline parsing elsewhere

**Anti-Patterns to Avoid:**
- ❌ `setInterval` at module level or in event handlers
- ❌ `win.webContents.send('tick')` to drive the timer from the main process
- ❌ Separate `setInterval` for the blink animation
- ❌ CSS variables without `--ht-` prefix
- ❌ Duplicate time parsing logic in multiple components

## Project Structure & Boundaries

### Complete Project Directory Structure

```
health-timer/
├── electron.vite.config.ts       ← Vite + Electron build config
├── electron-builder.yml          ← Packaging: macOS dmg + Windows NSIS
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── tsconfig.web.json
├── .gitignore
├── resources/
│   └── icon.png                  ← App icon (macOS + Windows)
├── src/
│   ├── main/
│   │   ├── index.ts              ← Main process entry; BrowserWindow creation; IPC registration
│   │   └── windowConfig.ts      ← BrowserWindow options (size ~384×216, dark bg, no alwaysOnTop default)
│   ├── preload/
│   │   └── index.ts              ← contextBridge: exposes electronAPI.setAlwaysOnTop only
│   └── renderer/
│       ├── index.html
│       └── src/
│           ├── main.tsx           ← React entry point
│           ├── App.tsx            ← Root layout: 4 TimerWidgets + WipBand + always-on-top toggle
│           ├── env.d.ts           ← Window.electronAPI type declaration
│           ├── styles/
│           │   └── global.css     ← :root CSS custom properties (--ht-*) + box-sizing reset
│           ├── timer/
│           │   ├── TimerWidget.tsx          ← Component: countdown, controls, blink, inline edit
│           │   ├── TimerWidget.module.css   ← Scoped styles + .alerting keyframe animation
│           │   ├── timerReducer.ts          ← Pure reducer + TimerState type + action types + DEFAULT constants
│           │   └── timerReducer.test.ts     ← Unit tests: all state transitions
│           ├── utils/
│           │   ├── formatTime.ts            ← formatSeconds(n: number): string  (→ "HH:MM:SS")
│           │   ├── parseTime.ts             ← parseTimeInput(str: string): number | null
│           │   └── formatTime.test.ts       ← Unit tests: edge cases (0, 5, 43199, invalid)
│           └── wip/
│               ├── WipBand.tsx              ← WIP placeholder: heart rate zone + disabled ON/OFF
│               └── WipBand.module.css
└── out/                           ← Build output (gitignored)
    ├── main/
    ├── preload/
    └── renderer/
```

### Architectural Boundaries

**Process Boundary (main ↔ renderer):**
Single crossing point: `ipcRenderer.send('set-always-on-top', bool)` via `contextBridge`.
No timer data, no UI state, and no tick events cross this boundary.

**Component Boundaries:**
Each `<TimerWidget>` is fully self-contained — its `useReducer` state is local.
No shared state between the 4 timer instances. `App.tsx` only composes them.

**Style Boundary:**
`global.css` owns all CSS custom properties. Component `.module.css` files own only their scoped selectors. No component writes a CSS custom property.

**Utility Boundary:**
`formatTime.ts` and `parseTime.ts` are pure functions with no imports from React or Electron.

### Requirements to Structure Mapping

| Requirement | Location |
|-------------|----------|
| FR-01: 4 timer instances | `App.tsx` (4× `<TimerWidget>`) |
| FR-02: Countdown logic | `timerReducer.ts` (TICK) + `TimerWidget.tsx` (useEffect/setInterval) |
| FR-03: Alert blink (1Hz red/white) | `TimerWidget.module.css` (`.alerting` keyframe) + reducer `alert` state |
| FR-04: Inline value edit | `TimerWidget.tsx` (isEditing useState) + `parseTime.ts` |
| FR-05: Always-on-top toggle | `App.tsx` (button) + `preload/index.ts` + `main/index.ts` (ipcMain) |
| FR-06: No session persistence | Enforced by omission — no localStorage/file writes anywhere |
| FR-07: WIP heart rate zone | `wip/WipBand.tsx` + `WipBand.module.css` |
| Default timer values | `timerReducer.ts` (exported constants: `DEFAULT_HEALTH_SECONDS` etc.) |

### Data Flow

```
User click → TimerWidget dispatch(action) → timerReducer → new state → re-render
User click → App.tsx toggle → window.electronAPI.setAlwaysOnTop(bool) → IPC → main/index.ts → win.setAlwaysOnTop()
setInterval tick → dispatch({ type: 'TICK' }) → timerReducer → remaining-- or status: 'alert'
```

No data flows to disk, network, or main process except the single always-on-top IPC call.

### Development Workflow

**Dev:** `npm run dev` → Vite HMR for renderer + auto-reload for main process  
**Build:** `npm run build` → compiles TS → electron-builder bundles → `out/` artifacts  
**Test:** `npx vitest` → runs `*.test.ts` files co-located with source  
**Package:** `npm run package` → produces `.dmg` (macOS) and `.exe` (Windows)

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
All technology choices are mutually compatible: Electron v41 + Vite + React 18 + TypeScript + CSS Modules + Lucide React (MIT) + useReducer + contextBridge IPC. No version conflicts. All packages are MIT-licensed.

**Pattern Consistency:**
Naming conventions (PascalCase components, SCREAMING_SNAKE constants, --ht- CSS vars), structure (feature folders, co-located tests), and behavior patterns (pure reducer, CSS-only blink, useEffect cleanup) are internally consistent and aligned with the React/TypeScript ecosystem conventions.

**Structure Alignment:**
The project tree supports all architectural decisions: `timerReducer.ts` supports the useReducer decision; `preload/index.ts` enforces the single IPC boundary; `styles/global.css` enforces the centralized CSS custom property decision.

### Requirements Coverage Validation ✅

**Functional Requirements Coverage:**
All 7 FRs are architecturally supported (see Requirements to Structure Mapping). FR-06 (no persistence) is enforced by deliberate omission — no localStorage, IndexedDB, or file write calls appear anywhere in the defined architecture.

**Non-Functional Requirements Coverage:**
- Cross-platform (macOS + Windows 11): ✅ Electron BrowserWindow + electron-builder targets
- Open source + free: ✅ All dependencies are MIT licensed
- Compact window (~384×216 px): ✅ BrowserWindow dimensions in windowConfig.ts
- Dark theme: ✅ CSS custom properties at :root in global.css
- No network: ✅ No fetch, WebSocket, or IPC network calls in design

### Implementation Readiness Validation ✅

**Decision Completeness:**
All critical decisions have version numbers (Electron v41, Vite, React 18) and rationale. IPC surface is minimal and fully specified. State shape and action types are defined.

**Structure Completeness:**
Complete file tree with every file named and purpose annotated. All integration points (contextBridge, ipcMain handler, React entry) are located.

**Pattern Completeness:**
6 mandatory enforcement rules, anti-patterns listed, CSS animation approach specified with code examples. Timer loop lifecycle (useEffect + cleanup) is fully specified.

### Gap Analysis Results

**Important Gaps (non-blocking):**
- `windowConfig.ts` pixel dimensions: use `width: 384, height: 216, minWidth: 384, minHeight: 216, resizable: false` as initial implementation guidance
- Always-on-top initial state: must be `false` on every app launch (PRD: "non persisté") — `alwaysOnTop: false` in BrowserWindow constructor; toggle state managed as `useState(false)` in App.tsx

**Nice-to-Have Gaps (deferred):**
- `electron-builder.yml` details: `appId`, `productName`, icon paths — to be finalized in packaging story
- Vitest config: defaults from electron-vite template are sufficient to start

### Architecture Completeness Checklist

**Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed (low complexity, desktop GUI)
- [x] Technical constraints identified (cross-platform, open source, compact window)
- [x] Cross-cutting concerns mapped (timer state machine, 1Hz tick, HH:MM:SS format, dark theme, window API)

**Architectural Decisions**
- [x] Critical decisions documented with versions (Electron v41, React 18, Vite)
- [x] Technology stack fully specified (electron-vite + React + TS + Lucide + CSS Modules)
- [x] Integration patterns defined (single contextBridge IPC method)
- [x] Performance considerations addressed (setInterval drift acceptable; CSS animation for blink)

**Implementation Patterns**
- [x] Naming conventions established (files, vars, constants, CSS vars)
- [x] Structure patterns defined (feature folders, co-located tests)
- [x] Communication patterns specified (IPC surface, contextBridge shape)
- [x] Process patterns documented (timer loop lifecycle, edit lifecycle, blink via CSS)

**Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established (self-contained TimerWidget, isolated WipBand)
- [x] Integration points mapped (preload ↔ main ↔ renderer)
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High

**Key Strengths:**
- Minimal IPC surface eliminates most Electron complexity
- Pure reducer with no side-effects makes the timer logic trivially testable
- CSS-only blink animation removes a common source of JS complexity
- Self-contained TimerWidget means stories can be implemented and tested in isolation
- No persistence requirement eliminates an entire category of implementation risk

**Areas for Future Enhancement:**
- Heart rate zone (WIP): when implemented, will require a new IPC channel for BLE/sensor data
- Packaging: electron-builder config needs finalization before first release
- Accessibility: keyboard navigation for timer controls not specified in PRD; could be added

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented
- Use implementation patterns consistently across all components
- Respect process and style boundaries (especially: no setInterval outside useEffect, no JS color manipulation for blink)
- Refer to this document for all architectural questions

**First Implementation Priority:**

```bash
npm create electron-vite@latest health-timer -- --template react-ts
```

Then: configure `windowConfig.ts` (384×216, dark background color, `alwaysOnTop: false`), set up `preload/index.ts` contextBridge, define `global.css` CSS custom properties.

---
baseline_commit: 789accb719523db9bfa13020013db1225637ae28
---

# Story 1.1: Project Scaffold and Window Configuration

Status: review

## Story

As a developer,
I want to scaffold the Electron + Vite + React + TypeScript project and configure the application window,
so that the app launches as a compact, dark-themed, non-resizable window on both macOS and Windows.

## Acceptance Criteria

1. Running `npm create electron-vite@latest health-timer -- --template react-ts` produces a working Electron app and `npm run dev` launches the window without errors.
2. The BrowserWindow is configured with `width: 384, height: 216, minWidth: 384, minHeight: 216, resizable: false`.
3. The BrowserWindow uses `backgroundColor: '#1a1a1a'` and `alwaysOnTop: false` in its constructor.
4. `src/renderer/src/styles/global.css` defines all six CSS custom properties at `:root`: `--ht-bg` (#1a1a1a), `--ht-surface` (#242424), `--ht-text` (#efefef), `--ht-muted` (#888888), `--ht-alert-red` (#FF0000), `--ht-alert-white` (#FFFFFF).
5. `src/renderer/src/env.d.ts` declares `Window.electronAPI` with `setAlwaysOnTop: (enabled: boolean) => void`.
6. `src/preload/index.ts` exposes exactly one `contextBridge` object (`electronAPI`) with a single method `setAlwaysOnTop` that sends the `'set-always-on-top'` IPC message.
7. `src/main/index.ts` registers an `ipcMain.on('set-always-on-top', ...)` handler that calls `win.setAlwaysOnTop(enabled)`.
8. App launches without errors on macOS (native) and Windows 11.

## Tasks / Subtasks

- [x] Task 1 — Scaffold the project (AC: #1)
  - [x] Run `npm create electron-vite@latest health-timer -- --template react-ts` in the target directory
  - [x] Verify `npm run dev` launches the default Electron window without errors
  - [x] Remove or replace boilerplate content in `App.tsx` with a placeholder `<div>Health Timer</div>`

- [x] Task 2 — Configure BrowserWindow size and appearance (AC: #2, #3)
  - [x] Create `src/main/windowConfig.ts` exporting the BrowserWindow options object
  - [x] Set `width: 384, height: 216, minWidth: 384, minHeight: 216, resizable: false`
  - [x] Set `backgroundColor: '#1a1a1a'` and `alwaysOnTop: false`
  - [x] Import and apply the config in `src/main/index.ts`

- [x] Task 3 — Set up global CSS custom properties (AC: #4)
  - [x] Create `src/renderer/src/styles/global.css`
  - [x] Define `:root` block with all six `--ht-*` CSS variables (exact hex values from AC #4)
  - [x] Add `*, *::before, *::after { box-sizing: border-box; }` reset
  - [x] Import `global.css` in `src/renderer/src/main.tsx`

- [x] Task 4 — Set up contextBridge IPC (AC: #5, #6, #7)
  - [x] Replace contents of `src/preload/index.ts` with the `contextBridge.exposeInMainWorld` call (see Dev Notes)
  - [x] Create `src/renderer/src/env.d.ts` with the `Window` interface extension
  - [x] Add the `ipcMain.on('set-always-on-top', ...)` handler in `src/main/index.ts`

- [x] Task 5 — Verify cross-platform launch (AC: #8)
  - [x] Run `npm run dev` on the current platform; confirm window dimensions and dark background
  - [x] Confirm no TypeScript compile errors (`npx tsc --noEmit`)

## Dev Notes

### Critical Implementation Details

**Scaffold command — exact, do not alter:**
```bash
npm create electron-vite@latest health-timer -- --template react-ts
```
This creates the project in a sub-folder `health-timer/`. All subsequent paths are relative to that folder root.

**Window config (`src/main/windowConfig.ts`):**
```typescript
import { BrowserWindowConstructorOptions } from 'electron';

export const windowConfig: BrowserWindowConstructorOptions = {
  width: 384,
  height: 216,
  minWidth: 384,
  minHeight: 216,
  resizable: false,
  backgroundColor: '#1a1a1a',
  alwaysOnTop: false,
  webPreferences: {
    preload: join(__dirname, '../preload/index.js'),
    sandbox: false,
  },
};
```
Import `join` from `'path'` (already available in the main process). The `webPreferences.preload` path is standard for the electron-vite template — do not change it.

**Preload (`src/preload/index.ts`):**
```typescript
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  setAlwaysOnTop: (enabled: boolean) => ipcRenderer.send('set-always-on-top', enabled),
});
```
**Rule:** Only ONE `exposeInMainWorld` call. Never call `ipcRenderer` directly from the renderer.

**Type declaration (`src/renderer/src/env.d.ts`):**
```typescript
/// <reference types="vite/client" />

interface Window {
  electronAPI: {
    setAlwaysOnTop: (enabled: boolean) => void;
  };
}
```

**Main process IPC handler (`src/main/index.ts`):**
```typescript
import { ipcMain } from 'electron';

// After `win` is created:
ipcMain.on('set-always-on-top', (_event, enabled: boolean) => {
  win.setAlwaysOnTop(enabled);
});
```
Wire this after the `BrowserWindow` instance exists, before `win.loadURL/loadFile`.

**Global CSS (`src/renderer/src/styles/global.css`):**
```css
*, *::before, *::after {
  box-sizing: border-box;
}

:root {
  --ht-bg: #1a1a1a;
  --ht-surface: #242424;
  --ht-text: #efefef;
  --ht-muted: #888888;
  --ht-alert-red: #FF0000;
  --ht-alert-white: #FFFFFF;
}

body {
  margin: 0;
  background-color: var(--ht-bg);
  color: var(--ht-text);
  font-family: system-ui, sans-serif;
  overflow: hidden;
}
```

**Import in `src/renderer/src/main.tsx`:**
```typescript
import './styles/global.css';
```
Add this as the first import (before React imports) so CSS variables are available globally.

### Architecture Enforcement Rules (MUST Follow)

These rules apply to ALL stories — establish them correctly here:

1. **All CSS custom properties use `--ht-` prefix** — never define a variable as `--bg` or `--surface`
2. **`contextBridge` exposes only `electronAPI`** — one object, one method for now
3. **`alwaysOnTop` starts `false` every launch** — never persist this between sessions
4. **No `setInterval` outside `useEffect`** — not relevant for this story but set the precedent in the codebase

### Anti-Patterns to Avoid

- ❌ Do NOT use `win.setAlwaysOnTop(false)` after `win.show()` — set it in the BrowserWindow constructor via `alwaysOnTop: false`
- ❌ Do NOT put BrowserWindow configuration inline in `index.ts` — use `windowConfig.ts`
- ❌ Do NOT use CSS variables without `--ht-` prefix anywhere in the project
- ❌ Do NOT use `ipcRenderer.invoke` for `set-always-on-top` — fire-and-forget `ipcRenderer.send` is correct

### Project Structure Notes

Files created by this story (all paths relative to `health-timer/`):
```
src/
  main/
    index.ts              ← MODIFY: import windowConfig + register IPC handler
    windowConfig.ts       ← NEW: BrowserWindow options
  preload/
    index.ts              ← REPLACE: contextBridge only
  renderer/
    src/
      main.tsx            ← MODIFY: import global.css
      App.tsx             ← MODIFY: replace boilerplate with placeholder
      env.d.ts            ← NEW: Window.electronAPI type
      styles/
        global.css        ← NEW: :root CSS custom properties + reset
```

Files explicitly NOT touched in this story:
- `electron.vite.config.ts` — use template defaults
- `tsconfig*.json` — use template defaults
- `package.json` — use template defaults (no extra deps needed for this story)

### Lucide React — Install Later

Lucide React is needed for timer icons (Story 1.4). Do NOT install it in this story. The placeholder `App.tsx` requires no icon library.

### References

- BrowserWindow configuration: [architecture.md — Infrastructure & Deployment / Complete Project Directory Structure](../_bmad-output/planning-artifacts/architecture.md)
- IPC pattern: [architecture.md — IPC Pattern](../_bmad-output/planning-artifacts/architecture.md)
- CSS custom properties: [architecture.md — Styling: CSS Modules + CSS Custom Properties](../_bmad-output/planning-artifacts/architecture.md)
- Naming conventions: [architecture.md — Naming Patterns](../_bmad-output/planning-artifacts/architecture.md)
- Enforcement rules: [architecture.md — Enforcement Guidelines](../_bmad-output/planning-artifacts/architecture.md)
- Acceptance criteria source: [epics.md — Story 1.1](../_bmad-output/planning-artifacts/epics.md)

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- `create-electron-vite@0.7.1` is interactive-only (no `--template` flag support) and creates `vite-plugin-electron` structure, not the `electron-vite` framework structure the architecture requires. Project was created manually following the electron-vite template.
- `@vitejs/plugin-react@6.x` requires `vite@^8` which conflicts with `electron-vite@5` (supports vite@5-7). Used `@vitejs/plugin-react@5.2.0` instead.
- `typescript@6.0.3` deprecates `baseUrl` in tsconfig. Added `"ignoreDeprecations": "6.0"` to `tsconfig.web.json`.
- Architecture said Electron v41; actual latest available is v42.4.1. Used v42.

### Completion Notes List

- Project scaffolded manually with correct `electron-vite` framework structure (`src/main/`, `src/preload/`, `src/renderer/` layout)
- All six `--ht-*` CSS custom properties defined in `global.css` with exact hex values
- `contextBridge` exposes single `electronAPI.setAlwaysOnTop` method only
- `ipcMain.on('set-always-on-top')` handler wired in `src/main/index.ts`
- `npm run typecheck` (node + web) passes with 0 errors
- `npm run build` produces `out/main/index.js`, `out/preload/index.js`, `out/renderer/index.html`
- `npm run dev` starts electron-vite dev server + Electron window without errors

### File List

- `health-timer/.gitignore` (new)
- `health-timer/package.json` (new)
- `health-timer/electron.vite.config.ts` (new)
- `health-timer/tsconfig.json` (new)
- `health-timer/tsconfig.node.json` (new)
- `health-timer/tsconfig.web.json` (new)
- `health-timer/src/main/index.ts` (new)
- `health-timer/src/main/windowConfig.ts` (new)
- `health-timer/src/preload/index.ts` (new)
- `health-timer/src/renderer/index.html` (new)
- `health-timer/src/renderer/src/main.tsx` (new)
- `health-timer/src/renderer/src/App.tsx` (new)
- `health-timer/src/renderer/src/env.d.ts` (new)
- `health-timer/src/renderer/src/styles/global.css` (new)

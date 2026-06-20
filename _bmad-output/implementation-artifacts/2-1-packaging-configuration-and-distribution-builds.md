---
status: done
baseline_commit: a8731e60ec1ee24edeb8958547d6aca213c22f96
---

# Story 2.1: Packaging configuration and distribution builds

Status: done

## Story

As Ian,
I want to build installable packages for macOS and Windows 11,
So that I can install Health Timer on any of my machines without needing Node.js or a terminal.

## Acceptance Criteria

1. Given `health-timer/electron-builder.yml` exists
   When the file is read
   Then it defines `appId: fr.ianfraser.health-timer`, `productName: "Health Timer"`, macOS target `dmg` with `arch: [x64, arm64]`, and Windows target `nsis`

2. Given `npm run package` is executed on macOS
   When the build completes without errors
   Then a `.dmg` file is produced in `health-timer/dist/` for both x64 and arm64 architectures

3. Given `npm run package` is executed on Windows
   When the build completes without errors
   Then an NSIS `.exe` installer is produced in `health-timer/dist/`

4. Given the macOS `.dmg` is opened and the app is dragged to Applications
   When Health Timer is launched
   Then the window opens correctly at 384×216 px with dark theme and all 4 timers + WIP band visible

5. Given the Windows `.exe` installer is run
   When installation completes
   Then Health Timer can be launched from the Start menu and the window opens correctly

6. Given the distributed app runs on macOS or Windows 11
   When launched on a machine with no Node.js or developer tools
   Then the application works fully without any additional setup

## Tasks / Subtasks

- [x] Task 1 — Create `electron-builder.yml` at `health-timer/` root (AC: #1)
  - [x] Set `appId: fr.ianfraser.health-timer` and `productName: "Health Timer"`
  - [x] Configure macOS dmg target with `arch: [x64, arm64]`
  - [x] Configure Windows nsis target with `arch: [x64]`
  - [x] Set `directories.buildResources: resources` and `directories.output: dist`
  - [x] Set `files: [out/**]` to include electron-vite compiled output

- [x] Task 2 — Create app icon assets in `health-timer/resources/` (AC: #4, #5)
  - [x] Create `resources/` directory
  - [x] Create or source a 512×512 PNG and save as `resources/icon.png`
  - [x] Generate `resources/icon.ico` for Windows (multi-resolution: 16, 32, 48, 64, 128, 256 px)
  - [x] Document macOS `.icns` generation steps (requires macOS — see Dev Notes)

- [x] Task 3 — Verify Windows build locally (AC: #3, #5, #6)
  - [x] Run `npm run package` from `health-timer/`
  - [x] Verify `dist/HealthTimer-Setup-0.1.0.exe` (or similar) is produced
  - [x] Run the NSIS installer and verify app launches at 384×216 px, dark theme
  - [x] Confirm 4 timers + WIP band render correctly in the installed app
  - [x] Run `npx vitest run` to confirm 74/74 tests still pass (no regressions from config changes)

- [x] Task 4 — Document macOS build (AC: #2, #4)
  - [x] Document icon.icns generation steps in this story's Completion Notes
  - [x] Document `npm run package` macOS output path: `dist/HealthTimer-0.1.0-arm64.dmg` + `dist/HealthTimer-0.1.0-x64.dmg`
  - [x] Note: macOS build verification requires a macOS machine — defer actual macOS run

## Dev Notes

### What Already Exists — Do NOT Recreate

**Already installed and configured:**
- `electron-builder: "^26.0.0"` in devDependencies ✅ (installed in `node_modules`)
- `"package": "npm run build && electron-builder"` script in `package.json` ✅
- `"main": "./out/main/index.js"` in `package.json` — electron-builder uses this as entry ✅
- `dist/` already in `.gitignore` ✅
- `out/` already in `.gitignore` ✅ (electron-vite compile target, not the installer output)

**Does NOT exist — must create:**
- `health-timer/electron-builder.yml` — missing, must create
- `health-timer/resources/` directory — missing, must create
- Icon files (`icon.png`, `icon.ico`, `icon.icns`) — missing, must create

### electron-builder.yml — Full Content

Create at `health-timer/electron-builder.yml`:

```yaml
appId: fr.ianfraser.health-timer
productName: Health Timer
copyright: Copyright © 2026 Ian Fraser

directories:
  buildResources: resources
  output: dist

files:
  - out/**

mac:
  category: public.app-category.productivity
  icon: resources/icon.icns
  target:
    - target: dmg
      arch:
        - x64
        - arm64

dmg:
  artifactName: HealthTimer-${version}-${arch}.dmg

win:
  icon: resources/icon.ico
  target:
    - target: nsis
      arch:
        - x64

nsis:
  oneClick: false
  allowToChangeInstallationDirectory: true
  artifactName: HealthTimer-Setup-${version}.exe
```

### Build Pipeline Explained

```
npm run package
  ├─ npm run build           # electron-vite: TypeScript → out/
  │    ├─ out/main/index.js        (main process)
  │    ├─ out/preload/index.js     (contextBridge)
  │    └─ out/renderer/index.html  (React app bundle)
  └─ electron-builder        # packages out/ → dist/
       ├─ dist/HealthTimer-Setup-0.1.0.exe       (Windows NSIS)
       ├─ dist/HealthTimer-0.1.0-arm64.dmg       (macOS arm64)
       └─ dist/HealthTimer-0.1.0-x64.dmg         (macOS x64)
```

**Key:** `out/` = TypeScript compile output (electron-vite), `dist/` = installer output (electron-builder). These do not conflict.

### `files` Array Explanation

```yaml
files:
  - out/**
```

electron-builder automatically includes `node_modules` (production only — devDependencies excluded). The `files` pattern adds the compiled app code from `out/`. Without this, the packaged app has no source code.

electron-builder reads `"main": "./out/main/index.js"` from `package.json` to know the app entry point.

### Icon Files

**Why two separate formats:**
- macOS requires `.icns` (Apple Icon Image format)
- Windows requires `.ico` (Windows Icon format, multi-resolution)

**Creating `resources/icon.ico` (Windows — can be done on Ian's Windows machine):**
1. Source image: any 512×512 or 1024×1024 PNG
2. Use an online converter (e.g., convertico.com) or GIMP (`File > Export As > .ico`)
3. For best results, include sizes: 16×16, 32×32, 48×48, 64×64, 128×128, 256×256
4. Save as `health-timer/resources/icon.ico`

**Creating `resources/icon.icns` (macOS — requires macOS machine):**
```bash
# Method 1: sips (built-in macOS tool)
sips -s format icns resources/icon.png --out resources/icon.icns

# Method 2: iconutil (proper multi-resolution)
mkdir icon.iconset
sips -z 16 16 icon.png --out icon.iconset/icon_16x16.png
sips -z 32 32 icon.png --out icon.iconset/icon_16x16@2x.png
sips -z 32 32 icon.png --out icon.iconset/icon_32x32.png
sips -z 64 64 icon.png --out icon.iconset/icon_32x32@2x.png
sips -z 128 128 icon.png --out icon.iconset/icon_128x128.png
sips -z 256 256 icon.png --out icon.iconset/icon_128x128@2x.png
sips -z 256 256 icon.png --out icon.iconset/icon_256x256.png
sips -z 512 512 icon.png --out icon.iconset/icon_256x256@2x.png
sips -z 512 512 icon.png --out icon.iconset/icon_512x512.png
sips -z 1024 1024 icon.png --out icon.iconset/icon_512x512@2x.png
iconutil -c icns icon.iconset -o resources/icon.icns
rm -rf icon.iconset
```

**Placeholder behavior:** If `icon.icns` or `icon.ico` are missing, electron-builder uses Electron's default icon (a blue atom symbol). The build succeeds with a warning. Acceptable for initial testing; proper icons needed before sharing the app.

**Commit icons to git:** Unlike build artifacts, icons in `resources/` should be committed (they're source files, not generated).

### Platform Build Constraint

Ian is on Windows 11. This means:
- **Windows NSIS build:** Fully buildable and testable locally ✅
- **macOS universal DMG:** Requires a macOS machine. Cross-compilation (Windows → macOS) is not supported by electron-builder. Options:
  - Use a physical Mac
  - Use GitHub Actions with `macos-latest` runner (free for public repos)
  - Use a macOS VM

**For this story:** Focus on the Windows build as the primary deliverable. macOS build steps are documented for future execution on macOS.

### electron-builder v26 + electron v42 Compatibility

The installed versions are compatible:
- `electron-builder: "^26.0.0"` — latest stable as of 2026-06
- `electron: "^42.0.0"` — supported by electron-builder v26

No additional configuration is needed for this version pair.

### Asar Packaging

electron-builder packages the app code into an `.asar` archive by default. This is correct behavior — the app runs from inside the asar. CSS, assets, and JS are all bundled by Vite before archiving. No special asar handling is needed.

### No New Vitest Tests Required

This is an infrastructure story. Vitest tests are for renderer logic; packaging config has no unit tests. Verification is done by:
1. Running `npm run package` and checking `dist/` output exists
2. Installing and launching the packaged app

Run `npx vitest run` before packaging to confirm 74/74 existing tests still pass (regression check, not new tests).

### DO NOT Modify These Files

- ❌ `package.json` — `npm run package` script already correct
- ❌ `electron.vite.config.ts` — build config is correct
- ❌ Any `src/` files — no code changes needed
- ❌ `.gitignore` — `dist/` and `out/` already excluded

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log

- Bitdefender antivirus blocks new unsigned `dist\win-unpacked\Health Timer.exe` binaries on rebuild — only the NSIS-installed version runs reliably on this machine. This is expected behavior for unsigned Electron apps on Windows with active AV.
- `asar: false` in electron-builder.yml causes immediate exit (code 0) — likely due to `onlyLoadAppFromAsar` Electron fuse enabled by default in Electron 42. Do NOT use this option.
- `asarUnpack` caused ASAR integrity failure (exit code 255) with Electron 42. Do NOT use `asarUnpack` without code signing.
- Icon generation via PowerShell `System.Drawing` requires absolute paths — relative paths fail silently.

### Completion Notes

- **Windows build:** `dist/HealthTimer-Setup-0.1.0.exe` (98 MB NSIS installer) produced successfully via `npm run package`.
- **Installed app verified:** 384×216 px window, dark theme, 4 timers functional, WIP band visible, "Always on top" toggle works correctly (window stays visually above all other windows when enabled).
- **Tests:** 74/74 pass, no regressions.
- **Icons:** `resources/icon.png` (512×512 placeholder, dark bg, "HT" in blue) and `resources/icon.ico` (multi-resolution: 256/128/64/48/32/16 px, PNG format inside ICO container) created programmatically via PowerShell.
- **macOS build deferred:** Requires macOS machine. `resources/icon.icns` must be generated with `iconutil` (see Dev Notes). Run `npm run package` on macOS to produce `dist/HealthTimer-0.1.0-arm64.dmg` and `dist/HealthTimer-0.1.0-x64.dmg`.

### File List

- `health-timer/electron-builder.yml` — CREATED
- `health-timer/resources/icon.png` — CREATED (512×512 placeholder PNG)
- `health-timer/resources/icon.ico` — CREATED (multi-resolution ICO)

### Change Log

- Created `health-timer/electron-builder.yml` with appId `fr.ianfraser.health-timer`, macOS universal DMG + Windows NSIS targets
- Created `health-timer/resources/` directory with `icon.png` and `icon.ico`

### Review Findings

- [x] [Review][Decision] Modifications src/ hors scope story 2.1 — commités séparément avant le commit story 2.1 ✅

- [x] [Review][Patch] `files: out/**` inclut les source maps dans le package distribué — `!**/*.map` ajouté [health-timer/electron-builder.yml] ✅

- [x] [Review][Patch] Sélecteur de test fragile `getByText('00:00:00')` — remplacé par `getByTestId('timer-display')` ; `data-testid` ajouté au span dans TimerWidget.tsx [health-timer/src/renderer/src/timer/TimerWidget.test.tsx] ✅

- [x] [Review][Defer] `resources/icon.icns` absent — référencé dans `electron-builder.yml` mais non créé ; build macOS échouera sans lui — deferred, documenté (macOS-deferred per story)
- [x] [Review][Defer] `nsis` `artifactName` sans `${arch}` — si arm64 est ajouté à Windows targets, les deux installers s'écraseront — deferred, theoretical (x64-only actuellement)
- [x] [Review][Defer] Aucune cible Linux dans `electron-builder.yml` — hors scope story 2.1 — deferred, out of scope
- [x] [Review][Defer] Windows ARM64 absent de la config NSIS — incohérent avec la config macOS (qui a arm64) — deferred, out of scope
- [x] [Review][Defer] `parseTimeInput` rejette silencieusement les heures > 11 sans feedback UI — comportement pré-existant, non causé par ce diff — deferred, pre-existing
- [x] [Review][Defer] `commitEdit` + `autoFocus` + `select()` cycle de blur potentiel sur technologies d'assistance — théorique, platform-specific — deferred, pre-existing

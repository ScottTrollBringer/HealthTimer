---
status: review
baseline_commit: e700a6a0d2603d6f44c248b8ff4fa6e4283dce90
---

# Story 1.9: Root Layout — Full Application Composition

## Story

As Ian,
I want to see all 4 health timers and the WIP band arranged in the app window,
So that I have a complete, functional Health Timer application ready for daily use.

## Acceptance Criteria

**AC1 — Composition complète**
Given `App.tsx` renders
When the window opens
Then it contains exactly 4 `<TimerWidget>` instances and 1 `<WipBand>` at the bottom

**AC2 — Valeurs initiales des timers**
Given the 4 timers are rendered at launch
When the window opens
Then :
- timer 1 affiche l'icône health gestures + "00:59:59"
- timer 2 affiche l'icône long break + "01:59:59"
- timer 3 affiche l'icône eye rest + "00:19:59"
- timer 4 affiche l'icône sitting posture + "00:29:59"

**AC3 — Pas de démarrage automatique**
Given all 4 timers are in stopped state on launch
When the app starts
Then none begin decrementing automatically

**AC4 — Pas d'overflow**
Given all 4 timers are running simultaneously
When the window is at 384×216 px
Then all timer displays and controls are visible without overflow, scrollbars, or clipping

**AC5 — Dark theme cohérent**
Given the dark theme CSS custom properties are defined at `:root`
When the app renders
Then the background, surfaces, and text use `--ht-bg`, `--ht-surface`, and `--ht-text` consistently

**AC6 — Alertes indépendantes**
Given 2 timers reach 0 simultaneously
When both enter `alert` state
Then both icons blink independently without interfering with each other

**AC7 — Reset au relaunch**
Given all timers are running and the app is closed
When the app relaunches
Then all timers are in `stopped` state at their hardcoded default values

## Tasks / Subtasks

- [x] **T1 — Tests RED (App.test.tsx)**
  - [x] T1a — Ajouter `describe('App — root layout')` dans `App.test.tsx` (garder les 3 tests Story 1.7)
  - [x] T1b — Test : 4 boutons "Start" présents (4 TimerWidgets en état stopped)
  - [x] T1c — Test : texte "WIP" présent (WipBand)
  - [x] T1d — Test : "00:59:59" visible (timer 1)
  - [x] T1e — Test : "01:59:59" visible (timer 2)
  - [x] T1f — Test : "00:19:59" visible (timer 3)
  - [x] T1g — Test : "00:29:59" visible (timer 4)
  - [x] T1h — Confirmer 6 tests RED (les 3 tests Story 1.7 restent verts)

- [x] **T2 — Mise à jour App.tsx**
  - [x] T2a — Ajouter imports : `Droplet, Coffee, Eye, Armchair` depuis `lucide-react`
  - [x] T2b — Ajouter import : `{ TimerWidget }` depuis `./timer/TimerWidget` (named export)
  - [x] T2c — Ajouter import : `WipBand` (default) depuis `./wip/WipBand`
  - [x] T2d — Ajouter imports des constantes : `DEFAULT_HEALTH_SECONDS, DEFAULT_LONG_BREAK_SECONDS, DEFAULT_EYE_SECONDS, DEFAULT_SITTING_SECONDS` depuis `./timer/timerReducer`
  - [x] T2e — Garder INTÉGRALEMENT le bloc `alwaysOnTop` + `handleToggle` + bouton toggle (Story 1.7)
  - [x] T2f — Ajouter après le bouton toggle dans le JSX : 4 × `<TimerWidget>` + `<WipBand />`

- [x] **T3 — Mise à jour App.module.css**
  - [x] T3a — Modifier `.toggleBtn` : remplacer `padding: 2px 6px` par `padding: 0 6px` (suppression du padding vertical pour économiser ~4px de hauteur)
  - [x] T3b — Vérifier que `.app` a bien `display: flex; flex-direction: column; height: 100%`

- [x] **T4 — Mise à jour global.css**
  - [x] T4a — Ajouter `html { height: 100%; }` et `body { height: 100%; }` pour propager la hauteur viewport jusqu'à `.app`

- [x] **T5 — Mise à jour windowConfig.ts**
  - [x] T5a — Ajouter `useContentSize: true` dans `windowConfig` (les `width: 384, height: 216` correspondent à la zone de contenu, pas à la fenêtre outer incluant la title bar Windows)

- [x] **T6 — Green + full suite**
  - [x] T6a — Confirmer 73 tests GREEN (67 existants + 6 nouveaux)

## Dev Notes

### Fichiers modifiés (cette story)

| Fichier | Type | Ce qui change |
|---------|------|---------------|
| `health-timer/src/renderer/src/App.tsx` | UPDATE | Ajouter 4 TimerWidgets + WipBand ; garder toggle |
| `health-timer/src/renderer/src/App.module.css` | UPDATE | `padding: 2px 6px` → `padding: 0 6px` sur `.toggleBtn` |
| `health-timer/src/renderer/src/App.test.tsx` | UPDATE | Ajouter describe Story 1.9 (6 tests) |
| `health-timer/src/renderer/src/styles/global.css` | UPDATE | Ajouter `html, body { height: 100%; }` |
| `health-timer/src/main/windowConfig.ts` | UPDATE | Ajouter `useContentSize: true` |

**Fichiers à NE PAS toucher :**
- `TimerWidget.tsx` / `TimerWidget.module.css` — ne pas modifier
- `timerReducer.ts` — ne pas modifier
- `WipBand.tsx` / `WipBand.module.css` — ne pas modifier

### App.tsx actuel (à préserver)

```tsx
// État ACTUEL de App.tsx (Story 1.7 — à garder intact)
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

### App.tsx cible (après Story 1.9)

```tsx
import { useState } from 'react'
import { Droplet, Coffee, Eye, Armchair } from 'lucide-react'
import { TimerWidget } from './timer/TimerWidget'
import WipBand from './wip/WipBand'
import {
  DEFAULT_HEALTH_SECONDS,
  DEFAULT_LONG_BREAK_SECONDS,
  DEFAULT_EYE_SECONDS,
  DEFAULT_SITTING_SECONDS,
} from './timer/timerReducer'
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
      <TimerWidget icon={Droplet} label="Health gestures" defaultSeconds={DEFAULT_HEALTH_SECONDS} />
      <TimerWidget icon={Coffee} label="Long break" defaultSeconds={DEFAULT_LONG_BREAK_SECONDS} />
      <TimerWidget icon={Eye} label="Eye rest" defaultSeconds={DEFAULT_EYE_SECONDS} />
      <TimerWidget icon={Armchair} label="Sitting" defaultSeconds={DEFAULT_SITTING_SECONDS} />
      <WipBand />
    </div>
  )
}

export default App
```

### Constantes à importer (timerReducer.ts)

```typescript
export const DEFAULT_HEALTH_SECONDS = 3599      // 00:59:59
export const DEFAULT_LONG_BREAK_SECONDS = 7199  // 01:59:59
export const DEFAULT_EYE_SECONDS = 1199         // 00:19:59
export const DEFAULT_SITTING_SECONDS = 1799     // 00:29:59
```

### Props de TimerWidget

```typescript
// Export NOMMÉ — import { TimerWidget } from './timer/TimerWidget'
type TimerWidgetProps = {
  icon: LucideIcon   // composant Lucide (type LucideIcon de lucide-react)
  label: string
  defaultSeconds: number
}
```

### WipBand

```typescript
// Export DEFAULT — import WipBand from './wip/WipBand'
// Aucun prop — composant statique
```

### Analyse layout — CONTRAINTE CRITIQUE

Le `width: 384, height: 216` dans `windowConfig.ts` est la taille OUTER (incluant la title bar Windows ~32px). Sans `useContentSize: true`, la zone content = ~184px.

**Hauteurs approximatives :**
- Toggle button actuel (padding 2px): ~19px → après T3a (padding 0): **~15px**
- TimerWidget × 4 : (~16px header + 2px margin + ~17px controls + 8px padding + 1px border) × 4 = **~176px**
- WipBand : 8px padding + ~17px content = **~25px**
- **Total = 15 + 176 + 25 = 216px**

Avec `useContentSize: true` (T5a), la zone content = exactement 216px → **juste à la limite ✅**

**Ne pas ajouter de gap ou margin supplémentaire entre les éléments** — chaque pixel compte.

### Tests à ajouter dans App.test.tsx

L'`App.test.tsx` actuel a 3 tests (Story 1.7). Ajouter un nouveau `describe` :

```tsx
describe('App — root layout', () => {
  it('renders 4 TimerWidget Start buttons (stopped state)', () => {
    render(<App />)
    expect(screen.getAllByRole('button', { name: 'Start' }).length).toBe(4)
  })

  it('renders WipBand with WIP text', () => {
    render(<App />)
    expect(screen.getByText('WIP')).toBeTruthy()
  })

  it('timer 1 shows 00:59:59', () => {
    render(<App />)
    expect(screen.getByText('00:59:59')).toBeTruthy()
  })

  it('timer 2 shows 01:59:59', () => {
    render(<App />)
    expect(screen.getByText('01:59:59')).toBeTruthy()
  })

  it('timer 3 shows 00:19:59', () => {
    render(<App />)
    expect(screen.getByText('00:19:59')).toBeTruthy()
  })

  it('timer 4 shows 00:29:59', () => {
    render(<App />)
    expect(screen.getByText('00:29:59')).toBeTruthy()
  })
})
```

**Important** : L'`electronAPI` mock du `beforeEach` existant couvre aussi ces nouveaux tests (même fichier). Pas besoin de le dupliquer.

### Mise à jour global.css

```css
/* Ajouter avant le bloc :root */
html {
  height: 100%;
}

*, *::before, *::after {
  box-sizing: border-box;
}
/* ... reste inchangé ... */
body {
  margin: 0;
  height: 100%;          /* ← AJOUTER */
  background-color: var(--ht-bg);
  color: var(--ht-text);
  font-family: system-ui, sans-serif;
  overflow: hidden;
}
```

### Mise à jour windowConfig.ts

```typescript
export const windowConfig: BrowserWindowConstructorOptions = {
  width: 384,
  height: 216,
  minWidth: 384,
  minHeight: 216,
  resizable: false,
  useContentSize: true,   // ← AJOUTER
  backgroundColor: '#1a1a1a',
  alwaysOnTop: false,
  show: false,
  autoHideMenuBar: true,
  webPreferences: {
    preload: join(__dirname, '../preload/index.js'),
    sandbox: true,
    contextIsolation: true
  }
}
```

### AC6 — Alertes indépendantes

AC6 est garanti structurellement : chaque `TimerWidget` possède son propre `useReducer` local. Il n'y a aucun état partagé. Deux timers en `alert` simultanément ont chacun leur propre animation CSS `.alerting` (via `@keyframes blink` scopé au module CSS). Aucun code additionnel requis.

### AC7 — Reset au relaunch

AC7 est garanti structurellement : aucun `localStorage`, aucune persistance. Le `createInitialState(defaultSeconds)` est appelé à chaque montage. Aucun code additionnel requis.

### Patterns établis (story précédente 1.8)

- `React.JSX.Element` comme return type sans `import React` (JSX transform)
- Pas de `import userEvent` — `fireEvent` de `@testing-library/react` si interaction nécessaire
- `cleanup()` dans `afterEach`
- Test jsdom : `// @vitest-environment jsdom` en tête de fichier (App.test.tsx l'a déjà)

### État des tests au démarrage

Suite actuelle : **67 tests, 5 fichiers** — tous GREEN.
À la fin : **73 tests, 5 fichiers** — tous GREEN (App.test.tsx passe de 3 à 9 tests).

## Dev Agent Record

### Debug Log
- RED : 6 tests échouent, 67 existants verts — import/render absent dans App.tsx
- GREEN : 73/73 après implémentation complète en cycle unique

### Completion Notes
- App.tsx : 4 TimerWidgets + WipBand ajoutés, toggle Story 1.7 préservé intégralement
- `useContentSize: true` ajouté à windowConfig — 216px devient la zone content (pas outer)
- `html { height: 100%; }` + `body { height: 100%; }` propagent la hauteur viewport
- `.toggleBtn` padding 2px → 0px vertical libère ~4px pour respecter la contrainte 216px
- AC6 et AC7 garantis structurellement (state local par widget, pas de persistence)

## File List

- `health-timer/src/renderer/src/App.tsx` — MODIFIED (4 TimerWidgets + WipBand ajoutés)
- `health-timer/src/renderer/src/App.module.css` — MODIFIED (toggleBtn padding 2px → 0px)
- `health-timer/src/renderer/src/App.test.tsx` — MODIFIED (6 tests Story 1.9 ajoutés)
- `health-timer/src/renderer/src/styles/global.css` — MODIFIED (html/body height: 100%)
- `health-timer/src/main/windowConfig.ts` — MODIFIED (useContentSize: true)
- `_bmad-output/implementation-artifacts/1-9-root-layout-full-application-composition.md` — MODIFIED (story tracking)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — MODIFIED (status → review)

## Change Log

| Date | Change |
|------|--------|
| 2026-06-20 | Story créée (CS workflow) |
| 2026-06-20 | Implémentation complète — 5 fichiers modifiés, 73/73 tests verts (DS workflow) |

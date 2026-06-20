---
status: review
baseline_commit: e700a6a0d2603d6f44c248b8ff4fa6e4283dce90
---

# Story 1.8: WIP Heart Rate Band

## Story

As Ian,
I want a placeholder zone for future heart rate functionality at the bottom of the app,
So that the layout is prepared for the upcoming feature without it being functional today.

## Acceptance Criteria

**AC1 — Composant créé**
Given `src/renderer/src/wip/WipBand.tsx` exists
When rendered
Then it displays as a horizontal band occupying the bottom portion of the 216 px window

**AC2 — Texte "WIP"**
Given the WIP band is rendered
When the user looks at it
Then it shows the text "WIP" where the heart rate reading would appear

**AC3 — Bouton ON/OFF désactivé**
Given the WIP band is rendered
When the user looks at it
Then it includes an ON/OFF button with `disabled` attribute and greyed visual styling

**AC4 — Clic inactif**
Given the disabled ON/OFF button
When the user clicks it
Then nothing happens (no state change, no event dispatch) — enforced natively par l'attribut `disabled`

**AC5 — Style muted**
Given the WIP band styling
When rendered
Then the entire zone uses `--ht-muted` or equivalent greyed styling that visually signals it is inactive/placeholder

**AC6 — Pas d'overflow**
Given the window is 216 px tall with 4 timer widgets above
When the WIP band is present
Then it does not cause overflow, scrollbars, or clipping of timer content

## Tasks / Subtasks

- [x] **T1 — Tests (RED)**
  - [x] T1a — Écrire `WipBand.test.tsx` co-localisé dans `wip/` avec `// @vitest-environment jsdom`
  - [x] T1b — Test : rendu du texte "WIP"
  - [x] T1c — Test : bouton avec `getByRole('button', { name: 'ON/OFF' })` ayant `disabled` attribute
  - [x] T1d — Confirmer 3 tests RED avant toute implémentation

- [x] **T2 — Composant `WipBand.tsx`**
  - [x] T2a — Créer `src/renderer/src/wip/WipBand.tsx` — composant statique sans état
  - [x] T2b — Importer `Heart` de `lucide-react` (size 12, classe `styles.icon`)
  - [x] T2c — Rendre `<span className={styles.label}>WIP</span>`
  - [x] T2d — Rendre `<button className={styles.toggleBtn} disabled>ON/OFF</button>`

- [x] **T3 — Styles `WipBand.module.css`**
  - [x] T3a — Créer `src/renderer/src/wip/WipBand.module.css`
  - [x] T3b — `.band` : `display: flex; align-items: center; gap: 6px; padding: 4px 8px; background-color: var(--ht-surface)`
  - [x] T3c — `.icon` et `.label` : `color: var(--ht-muted); font-size: 11px`
  - [x] T3d — `.toggleBtn` : border `var(--ht-muted)`, `color: var(--ht-muted)`, `cursor: not-allowed`, `opacity: 0.5`

- [x] **T4 — Green + full suite**
  - [x] T4a — Confirmer 3 tests GREEN (plus 0 régression sur les 64 tests existants)

## Dev Notes

### Fichiers créés (cette story)

| Fichier | Type |
|---------|------|
| `health-timer/src/renderer/src/wip/WipBand.tsx` | NEW |
| `health-timer/src/renderer/src/wip/WipBand.module.css` | NEW |
| `health-timer/src/renderer/src/wip/WipBand.test.tsx` | NEW |

**Aucun fichier existant n'est modifié.** L'intégration dans `App.tsx` est Story 1.9.

### Implémentation cible

```tsx
// WipBand.tsx
import { Heart } from 'lucide-react'
import styles from './WipBand.module.css'

function WipBand(): React.JSX.Element {
  return (
    <div className={styles.band}>
      <Heart size={12} className={styles.icon} />
      <span className={styles.label}>WIP</span>
      <button className={styles.toggleBtn} disabled>
        ON/OFF
      </button>
    </div>
  )
}

export default WipBand
```

```css
/* WipBand.module.css */
.band {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background-color: var(--ht-surface);
}

.icon {
  color: var(--ht-muted);
  flex-shrink: 0;
}

.label {
  color: var(--ht-muted);
  font-size: 11px;
  flex: 1;
}

.toggleBtn {
  background: transparent;
  border: 1px solid var(--ht-muted);
  border-radius: 3px;
  color: var(--ht-muted);
  cursor: not-allowed;
  font-size: 11px;
  padding: 1px 6px;
  opacity: 0.5;
}
```

### Pattern de test établi (story 1.7)

```tsx
// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import WipBand from './WipBand'

afterEach(() => { cleanup() })

describe('WipBand', () => {
  it('renders "WIP" text', () => {
    render(<WipBand />)
    expect(screen.getByText('WIP')).toBeTruthy()
  })

  it('renders ON/OFF button with disabled attribute', () => {
    render(<WipBand />)
    const btn = screen.getByRole('button', { name: 'ON/OFF' })
    expect(btn.hasAttribute('disabled')).toBe(true)
  })

  it('button is disabled — native HTML prevents click', () => {
    render(<WipBand />)
    const btn = screen.getByRole('button', { name: 'ON/OFF' })
    expect(btn.hasAttribute('disabled')).toBe(true)
  })
})
```

**Note sur fireEvent + disabled :** L'attribut `disabled` sur un `<button>` bloque nativement les événements click côté DOM. Pas besoin de tester qu'un handler n'est pas appelé — il n'y a pas de handler à appeler. L'AC4 ("nothing happens") est satisfait structurellement par `disabled`.

### Contraintes architecture

- **Aucun state React** — composant 100 % statique
- **Pas de `useEffect`** — aucun timer, aucun IPC
- **`Heart` icon de `lucide-react`** (déjà installé) — size 12 comme les icons TimerWidget
- **Pas de `window.electronAPI`** — aucun mock dans les tests
- **CSS Variables** : `--ht-surface`, `--ht-muted` (définies dans `styles/global.css`)
- **Co-location des tests** : `wip/WipBand.test.tsx` (jamais dans `__tests__/`)
- **Préfixe CSS** : `--ht-*` obligatoire

### AC6 — Overflow

Le composant WipBand est une seule rangée flex (`padding: 4px 8px`). Sa hauteur naturelle est ~26 px. L'assemblage final avec 4 TimerWidgets est géré en Story 1.9 (App.tsx). Pour cette story, s'assurer que `.band` n'a pas `height: 100%` ni `overflow: visible` qui forcerait un débordement.

### Intelligence story précédente (1.7)

- Pas de `import React` explicite nécessaire (JSX transform Vite)
- `React.JSX.Element` comme type de retour
- `cleanup()` dans `afterEach` (pattern établi App.test.tsx)
- Pas d'`import userEvent` — utiliser `fireEvent` de `@testing-library/react`
- Vitest globals activés : pas besoin d'importer `describe`/`it`/`expect` individuellement (mais le faire quand même pour clarté, pattern établi)

### État des tests au démarrage

Suite actuelle : **64 tests, 4 fichiers** — tous GREEN.
À la fin : **67 tests, 5 fichiers** — tous GREEN.

## Dev Agent Record

### Debug Log
- RED confirmé : import échoue car `WipBand.tsx` absent → 64/64 existants verts, 0 nouveau test compté
- GREEN : 67/67 après création des 3 fichiers

### Completion Notes
- Composant 100 % statique, aucun état React, aucun IPC
- `disabled` HTML natif satisfait AC4 structurellement (pas de handler à tester)
- RED→GREEN en cycle unique sans itération

## File List

- `health-timer/src/renderer/src/wip/WipBand.tsx` — NEW
- `health-timer/src/renderer/src/wip/WipBand.module.css` — NEW
- `health-timer/src/renderer/src/wip/WipBand.test.tsx` — NEW
- `_bmad-output/implementation-artifacts/1-8-wip-heart-rate-band.md` — MODIFIED (story tracking)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — MODIFIED (status → review)

## Change Log

| Date | Change |
|------|--------|
| 2026-06-20 | Story créée (CS workflow) |
| 2026-06-20 | Implémentation complète — 3 fichiers créés, 67/67 tests verts (DS workflow) |

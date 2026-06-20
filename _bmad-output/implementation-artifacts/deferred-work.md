# Deferred Work

## Deferred from: code review of stories 1.1, 1.2, 1.3 (2026-06-19)

- **[Story 1.4 responsibility] setInterval not cleared when status transitions to alert** — when TICK fires and the reducer returns status:'alert', the setInterval in TimerWidget's useEffect must be cleared. The useEffect cleanup must react to all status changes (not just paused/stopped), otherwise an orphaned interval fires indefinitely while the alert is displayed. Document and test this in Story 1.4.

- **[Story 1.4 responsibility] RESET from running state — interval may not clear** — RESET has no status guard in the reducer (intentional: RESET works from any state). If the Story 1.4 useEffect cleanup only watches for the PAUSE path, a direct RESET from running will orphan the setInterval. Story 1.4 must ensure the useEffect dependency on `state.status` correctly clears the interval on any transition out of 'running'.

- **[Story 1.2 — low priority] formatSeconds has no guard for negative or non-integer inputs** — `Math.floor` on negative values produces negative output (e.g. `formatSeconds(-1)` → `"-1:-1:-1"`). In the app's normal code path, `remaining` is always a non-negative integer from the reducer. No realistic path produces invalid input today. If future stories add external data sources, add `if (n < 0) n = 0` guard.

- **[Story 1.3 — cascades from SET_DEFAULT decision] DISMISS_ALERT restores potentially corrupted defaultSeconds** — if SET_DEFAULT ever accepts an out-of-range payload (see decision_needed finding in Story 1.3), DISMISS_ALERT will restore to that corrupted value. Resolving the SET_DEFAULT validation decision eliminates this concern.

## Deferred from: code review of story 1.9 (2026-06-20)

- **[UX — Story 2 ou polish] `#root` div manque `height: 100%`** — La chaîne `html → body → #root → .app` est incomplète : `html { height: 100% }` et `body { height: 100% }` sont définis mais `#root` reste en `height: auto`. Impact zéro (`body { overflow: hidden }` absorbe le débordement), mais lacune sémantique à corriger si du contenu défilable est introduit. Fix : ajouter `#root { height: 100%; }` dans `global.css` ou l'`index.html`.

## Deferred from: code review of stories 1.4–1.7 (2026-06-20)

- **[UX — Story 1.9 or future] Start button clickable during inline editing** — When `isEditing=true` and `status=stopped`, the Start button remains visible and clickable. Clicking it transitions to `running`, which unmounts the input (onBlur fires → commitEdit → SET_DEFAULT no-op on running reducer), silently discarding the typed value. Functionally correct but UX-confusing. Fix: hide or disable the Start button while `isEditing=true`, or commit the draft before starting. Defer to Story 1.9 (App composition) or a dedicated UX polish story.

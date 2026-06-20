# Deferred Work

## Deferred from: code review of stories 1.1, 1.2, 1.3 (2026-06-19)

- **[Story 1.4 responsibility] setInterval not cleared when status transitions to alert** — when TICK fires and the reducer returns status:'alert', the setInterval in TimerWidget's useEffect must be cleared. The useEffect cleanup must react to all status changes (not just paused/stopped), otherwise an orphaned interval fires indefinitely while the alert is displayed. Document and test this in Story 1.4.

- **[Story 1.4 responsibility] RESET from running state — interval may not clear** — RESET has no status guard in the reducer (intentional: RESET works from any state). If the Story 1.4 useEffect cleanup only watches for the PAUSE path, a direct RESET from running will orphan the setInterval. Story 1.4 must ensure the useEffect dependency on `state.status` correctly clears the interval on any transition out of 'running'.

- **[Story 1.2 — low priority] formatSeconds has no guard for negative or non-integer inputs** — `Math.floor` on negative values produces negative output (e.g. `formatSeconds(-1)` → `"-1:-1:-1"`). In the app's normal code path, `remaining` is always a non-negative integer from the reducer. No realistic path produces invalid input today. If future stories add external data sources, add `if (n < 0) n = 0` guard.

- **[Story 1.3 — cascades from SET_DEFAULT decision] DISMISS_ALERT restores potentially corrupted defaultSeconds** — if SET_DEFAULT ever accepts an out-of-range payload (see decision_needed finding in Story 1.3), DISMISS_ALERT will restore to that corrupted value. Resolving the SET_DEFAULT validation decision eliminates this concern.

## Deferred from: code review of story 1.9 (2026-06-20)

- **[UX — Story 2 ou polish] `#root` div manque `height: 100%`** — La chaîne `html → body → #root → .app` est incomplète : `html { height: 100% }` et `body { height: 100% }` sont définis mais `#root` reste en `height: auto`. Impact zéro (`body { overflow: hidden }` absorbe le débordement), mais lacune sémantique à corriger si du contenu défilable est introduit. Fix : ajouter `#root { height: 100%; }` dans `global.css` ou l'`index.html`.

## Deferred from: code review of 1-4-timerwidget-component-display-and-controls (2026-06-20, Round 3)

- **[W1 — documentation] Minimum-seconds validation contract not visible in TimerWidget** — `commitEdit` dispatches `SET_DEFAULT` for any non-null result from `parseTimeInput`, but doesn't explicitly check for the 5-second minimum. Tests pass (61/61), so validation is enforced somewhere (parseTimeInput or reducer), but the location is undocumented. Should be annotated for future maintainers.
- **[W2 — precision tradeoff] Sub-second drift on Pause→Resume** — `startedAt = Date.now()` is captured fresh each time the interval effect runs (every time status becomes 'running'). A paused timer discards the fractional second that had already elapsed. Acceptable precision tradeoff for a health reminder app.
- **[W3 — by-design] No test for defaultSeconds prop change at runtime** — `useReducer` with a lazy initializer only runs `createInitialState` once; the component does not re-initialize if the parent re-renders with a new `defaultSeconds`. This is intentional; the component manages its own state. No test needed unless design changes.

## Deferred from: code review of 1-7-always-on-top-window-toggle (2026-06-20)

- **[W1 — architecture tradeoff] Fire-and-forget IPC for always-on-top toggle** — `handleToggle` updates React state optimistically before IPC confirms. If the main process silently fails, UI and window state diverge. Accepted trade-off; `ipcRenderer.invoke` would be the robust fix if reliability becomes a concern.
- **[W2 — pre-existing, Story 1.1] `win?.setAlwaysOnTop` no-ops silently if `win` is null** — The IPC handler in `main/index.ts` uses optional chaining; if the main window hasn't been created yet during a startup race, the call is silently dropped. Not introduced by Story 1.7.
- **[W3 — test style] `act()` wrapping `fireEvent` in App.test.tsx** — Unnecessary since `fireEvent` is synchronous, but matches the established pattern across the test suite (stories 1.4–1.6). Defer until a test suite style pass.

## Deferred from: code review of stories 1.4–1.7 (2026-06-20)

- **[UX — Story 1.9 or future] Start button clickable during inline editing** — When `isEditing=true` and `status=stopped`, the Start button remains visible and clickable. Clicking it transitions to `running`, which unmounts the input (onBlur fires → commitEdit → SET_DEFAULT no-op on running reducer), silently discarding the typed value. Functionally correct but UX-confusing. Fix: hide or disable the Start button while `isEditing=true`, or commit the draft before starting. Defer to Story 1.9 (App composition) or a dedicated UX polish story.

## Deferred from: code review of 2-1-packaging-configuration-and-distribution-builds (2026-06-20)

- **[macOS build] `resources/icon.icns` absent** — référencé dans `electron-builder.yml` mais non créé ; le build macOS échouera sans ce fichier. Génération via `iconutil` depuis `icon.png` sur macOS (voir Dev Notes story 2.1). Déféré car nécessite une machine macOS.
- **[quality] `nsis` `artifactName` sans `${arch}`** — si Windows arm64 est ajouté aux targets NSIS, les deux installers produiront `HealthTimer-Setup-{version}.exe` et le second écrasera le premier. Fix : ajouter `${arch}` au nom ou rester x64-only.
- **[scope] Aucune cible Linux** — `electron-builder.yml` n'a pas de section `linux`. Un build Linux produirait une AppImage avec la config par défaut d'Electron. À ajouter si Linux est dans le scope futur.
- **[scope] Windows ARM64 absent** — config macOS inclut `arm64` mais pas Windows. À aligner si des machines Windows ARM sont dans la cible utilisateur.
- **[UX] `parseTimeInput` rejette silencieusement les heures > 11** — entrer `12:00:00` revient à la valeur précédente sans message d'erreur. Comportement pré-existant. Fix : ajouter un message de validation visible ou étendre la limite.
- **[a11y] `commitEdit` + `autoFocus` + `select()` cycle de blur** — sur certaines technologies d'assistance ou JSDOM, `select()` peut déclencher un cycle refocus/blur avant que `cancelledRef` soit positionné. Risque très faible en pratique mais non testé sur AT.

## Deferred from: code review of 1-6-inline-default-value-editing (2026-06-20)

- **[W1 — test coverage] No test for Start-clicked-while-editing scenario** — Behavior is correct (blur→commitEdit resets isEditing; SET_DEFAULT is a no-op since reducer guards status≠stopped), but the path is undocumented by tests. Low priority; behavior is intentional and safe. See also "Start button clickable during inline editing" UX note above.

---
baseline_commit: e700a6a0d2603d6f44c248b8ff4fa6e4283dce90
---

# Story 1.2: Shared Time Utility Functions

Status: done

## Story

As a developer,
I want shared pure functions for formatting and parsing time values,
so that all components handle HH:MM:SS conversion consistently without duplicating logic.

## Acceptance Criteria

1. `formatSeconds(n: number): string` exists in `src/renderer/src/utils/formatTime.ts` and returns "00:00:00" for n=0.
2. `formatSeconds(5)` returns "00:00:05".
3. `formatSeconds(3599)` returns "00:59:59".
4. `formatSeconds(43199)` returns "11:59:59".
5. `parseTimeInput(str: string): number | null` exists in `src/renderer/src/utils/parseTime.ts` and returns 5400 for "01:30:00".
6. `parseTimeInput("00:00:05")` returns 5 (minimum valid value).
7. `parseTimeInput("11:59:59")` returns 43199 (maximum valid value).
8. `parseTimeInput("00:00:04")` returns null (below 5-second minimum).
9. `parseTimeInput("12:00:00")` returns null (above 11:59:59 maximum).
10. `parseTimeInput("abc")` and `parseTimeInput("99:99:99")` return null (invalid format).
11. `src/renderer/src/utils/formatTime.test.ts` exists with all above edge cases and `npx vitest run` passes.

## Tasks / Subtasks

- [x] Task 1 — Create Vitest config so `npx vitest run` works (prerequisite for AC: #11)
  - [x] Create `health-timer/vitest.config.ts` with `environment: 'node'` and correct include glob
  - [x] Add `"test": "vitest run"` script to `package.json`

- [x] Task 2 — Implement `formatSeconds` (AC: #1–4)
  - [x] Create `src/renderer/src/utils/formatTime.ts`
  - [x] Export `formatSeconds(n: number): string` — converts total seconds to "HH:MM:SS"
  - [x] Handle all values in range 0–43199 (0 → "00:00:00", 43199 → "11:59:59")

- [x] Task 3 — Implement `parseTimeInput` (AC: #5–10)
  - [x] Create `src/renderer/src/utils/parseTime.ts`
  - [x] Export `parseTimeInput(str: string): number | null`
  - [x] Validate format "HH:MM:SS" strictly — reject anything else
  - [x] Validate range: return null if result < 5 or result > 43199
  - [x] Return null for any non-parseable input

- [x] Task 4 — Write co-located tests (AC: #11)
  - [x] Create `src/renderer/src/utils/formatTime.test.ts`
  - [x] Cover all AC cases: formatSeconds(0), (5), (3599), (43199)
  - [x] Cover all AC cases: parseTimeInput("01:30:00"), ("00:00:05"), ("11:59:59"), ("00:00:04"), ("12:00:00"), ("abc"), ("99:99:99")
  - [x] Run `npx vitest run` and confirm all tests pass

### Review Findings

- [x] [Review][Patch] parseTimeInput — no explicit hours upper bound guard (h > 11) — relies solely on total > MAX_SECONDS ceiling [src/renderer/src/utils/parseTime.ts]
- [x] [Review][Patch] vitest.config.ts missing @renderer alias — any future test using @renderer/... imports will fail [health-timer/vitest.config.ts]

## Dev Notes

### Context from Story 1.1

The project was manually scaffolded (not via CLI) with this structure under `health-timer/`:
- `electron-vite@5.0.0`, `typescript@6.0.3`, `vitest@4.1.9` already installed in `node_modules`
- `tsconfig.web.json` covers `src/renderer/src/**/*` with `"strict": true`
- No Vitest config file exists yet — `npx vitest run` will fail until Task 1 is done
- The `utils/` directory does NOT yet exist — create it

### Task 1: Vitest Configuration (Required First)

**`health-timer/vitest.config.ts`** (create at project root):
```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/renderer/src/**/*.test.ts']
  }
})
```

**Why `node` environment**: `formatSeconds` and `parseTimeInput` are pure functions with zero browser/DOM dependencies. `node` environment is faster and avoids jsdom overhead.

**Add to `health-timer/package.json`** scripts:
```json
"test": "vitest run",
"test:watch": "vitest"
```

### Task 2: `formatSeconds` Implementation

**File**: `src/renderer/src/utils/formatTime.ts`

```typescript
export function formatSeconds(n: number): string {
  const h = Math.floor(n / 3600)
  const m = Math.floor((n % 3600) / 60)
  const s = n % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
```

**Constraints (MUST follow)**:
- No imports from React, Electron, or any library — pure TypeScript only
- Single exported function `formatSeconds` — nothing else
- Function name is `formatSeconds` (not `formatTime`, `secondsToHMS`, etc.)
- All stories depend on this exact name — do not rename

**Boundary verification**:
- `formatSeconds(0)` → `"00:00:00"` ✓
- `formatSeconds(43199)` → h=11, m=59, s=59 → `"11:59:59"` ✓

### Task 3: `parseTimeInput` Implementation

**File**: `src/renderer/src/utils/parseTime.ts`

```typescript
const MIN_SECONDS = 5
const MAX_SECONDS = 43199 // 11:59:59

export function parseTimeInput(str: string): number | null {
  const match = str.match(/^(\d{2}):(\d{2}):(\d{2})$/)
  if (!match) return null

  const h = parseInt(match[1], 10)
  const m = parseInt(match[2], 10)
  const s = parseInt(match[3], 10)

  if (m >= 60 || s >= 60) return null

  const total = h * 3600 + m * 60 + s
  if (total < MIN_SECONDS || total > MAX_SECONDS) return null

  return total
}
```

**Constraints (MUST follow)**:
- No imports from React, Electron, or any library — pure TypeScript only
- Function name is `parseTimeInput` — not `parseTime`, `parseHMS`, etc.
- Must reject `"99:99:99"` (m≥60 or s≥60 check)
- Must reject `"00:00:04"` (total < MIN_SECONDS)
- Must reject `"12:00:00"` (total > MAX_SECONDS = 43199)
- The `^(\d{2}):(\d{2}):(\d{2})$` regex is exact — no partial matches

**Range constants**: `MIN_SECONDS = 5`, `MAX_SECONDS = 43199`. These are local to the file only — NOT exported. The canonical default timer values are in `timerReducer.ts` (Story 1.3).

### Task 4: Test File

**File**: `src/renderer/src/utils/formatTime.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { formatSeconds } from './formatTime'
import { parseTimeInput } from './parseTime'
```

**Note**: One test file covers both functions. File is named `formatTime.test.ts` as specified in the architecture and epics.

### Architecture Enforcement (Applies to This Story)

1. **Pure functions only** — `formatTime.ts` and `parseTime.ts` have NO imports from React or Electron
2. **CSS custom properties** (`--ht-*`) — not relevant here
3. **Utility boundary** — `formatTime.ts` and `parseTime.ts` are the ONLY time-conversion functions in the codebase. When Story 1.4 (TimerWidget) needs HH:MM:SS, it imports from these files — do NOT inline conversion logic
4. **Co-located tests** — test file lives in `src/renderer/src/utils/`, NOT in a separate `__tests__/` directory

### Anti-Patterns to Avoid

- ❌ Do NOT export `MIN_SECONDS`/`MAX_SECONDS` from `parseTime.ts` — they're implementation details
- ❌ Do NOT create a `timeUtils.ts` combining both functions — keep them in separate files per architecture
- ❌ Do NOT use `Number()` or `+str` to parse HH:MM:SS — use regex + parseInt
- ❌ Do NOT add a `parseTime.test.ts` — all tests go in `formatTime.test.ts` per epics spec
- ❌ Do NOT use `jsdom` environment for these pure-function tests — use `node`

### Project Structure Notes

**New files for this story** (relative to `health-timer/`):
```
vitest.config.ts                              ← NEW: Vitest configuration
src/renderer/src/utils/
  formatTime.ts                               ← NEW: formatSeconds()
  parseTime.ts                                ← NEW: parseTimeInput()
  formatTime.test.ts                          ← NEW: all unit tests
```

**Modified files**:
```
package.json                                  ← ADD scripts: test, test:watch
```

**Files NOT touched**:
- `src/renderer/src/App.tsx` — placeholder stays as-is
- `electron.vite.config.ts` — no changes needed
- `tsconfig.web.json` — already covers `src/renderer/src/**/*`

### Story 1.3 Context (Do Not Implement — For Awareness Only)

Story 1.3 creates `timerReducer.ts` which will export the DEFAULT timer constants:
- `DEFAULT_HEALTH_SECONDS = 3599`
- `DEFAULT_LONG_BREAK_SECONDS = 7199`
- `DEFAULT_EYE_SECONDS = 1199`
- `DEFAULT_SITTING_SECONDS = 1799`

Do NOT put these constants in `parseTime.ts` or `formatTime.ts`. They belong in `timerReducer.ts`.

### References

- Utility functions spec: [epics.md — Story 1.2](../_bmad-output/planning-artifacts/epics.md)
- Architecture utility boundary: [architecture.md — Utility Boundary](../_bmad-output/planning-artifacts/architecture.md)
- Architecture naming: [architecture.md — Naming Patterns](../_bmad-output/planning-artifacts/architecture.md)
- Previous story: [1-1-project-scaffold-and-window-configuration.md](./1-1-project-scaffold-and-window-configuration.md)

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- `vitest.config.ts` created at project root with `environment: 'node'` targeting `src/renderer/src/**/*.test.ts`
- `package.json` updated with `test` and `test:watch` scripts
- `formatSeconds`: pure implementation using integer math — no floating-point risk
- `parseTimeInput`: strict regex `^(\d{2}):(\d{2}):(\d{2})$` + explicit m/s range check + total range check
- `formatTime.test.ts`: 11 tests covering all AC cases (4 for formatSeconds, 7 for parseTimeInput)
- `npx vitest run` — 1 file, 11 tests, all passed in 289ms
- `npm run typecheck` — 0 errors (node + web)

### File List

- `health-timer/vitest.config.ts` (new)
- `health-timer/package.json` (modified — added test/test:watch scripts)
- `health-timer/src/renderer/src/utils/formatTime.ts` (new)
- `health-timer/src/renderer/src/utils/parseTime.ts` (new)
- `health-timer/src/renderer/src/utils/formatTime.test.ts` (new)

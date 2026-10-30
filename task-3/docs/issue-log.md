# EventPulse — Issue Log

Documents bugs, technical challenges, and their resolutions encountered during Weeks 1 and 2 of BuildLab Stage 1.

---

## Issue 1 — `aria-hidden` Blocking Focused Descendant (Accessibility)

**Discovered:** Week 1  
**Severity:** High (Accessibility / WCAG 4.1.2)

### Problem
The browser console showed the warning:
> "Blocked aria-hidden on an element because its descendant retained focus."

This occurred on all three dialogs (Event Detail Modal, Email Reminder Modal, and Schedule Drawer). When these overlays were initially hidden using `aria-hidden="true"` on the backdrop, and then toggled to `aria-hidden="false"` on open, the close button inside was still being focused — causing a conflict where a focused element had an `aria-hidden` ancestor.

### Root Cause
Using `setAttribute('aria-hidden', 'true')` to hide dialogs does not prevent focus from moving inside them. When JS called `.focus()` on a child button, the browser correctly blocked it and raised the warning.

### Fix Applied
Replaced all `aria-hidden` toggle logic with the native HTML `hidden` attribute (`element.hidden = true / false`). The `hidden` attribute removes the element from the accessibility tree entirely and prevents focus, while the `.is-open` CSS class still controls the visual animation/transition.

---

## Issue 2 — Focus Not Returning to Trigger After Closing Modal (Accessibility)

**Discovered:** Week 1  
**Severity:** Medium (WCAG 2.4.3 Focus Order)

### Problem
After closing the Event Detail Modal, keyboard focus was left at `document.body` instead of returning to the card's "Details" button that originally opened it. This broke keyboard navigation flow for screen reader users.

### Root Cause
No reference to the trigger element was being stored before the modal was opened. `document.activeElement` changes once the modal opens and the close button is focused.

### Fix Applied
Added `let modalTriggerElement = null` to capture the triggering button at the moment `openEventModal(id, triggerEl)` is called. On close, `modalTriggerElement.focus()` is called to restore the exact element that was active before. The same pattern was applied to the drawer (`drawerTriggerElement`) and email modal (`emailTriggerElement`).

---

## Issue 3 — ES Module CORS Error When Opening `index.html` Directly

**Discovered:** Week 1  
**Severity:** Medium (Developer Experience)

### Problem
Opening `index.html` directly via `file:///` in the browser resulted in:
> "Access to script at 'file:///…/scripts/app.js' from origin 'null' has been blocked by CORS policy."

The app appeared completely blank and no JavaScript ran.

### Root Cause
ES Modules (`type="module"`) enforce CORS even for local files. Browsers reject `file://` origins for cross-origin module imports. Because `app.js` imports from `icons.js` and `data.js`, the browser blocked them all.

### Fix Applied
All development and testing was done through a local HTTP server:
- `python -m http.server 8000` during development  
- Vercel deployment (`https://eventpulse-lime.vercel.app/`) serves files over HTTPS, resolving the issue in production

Added a note to the README instructing developers to always use a local server.

---

## Issue 4 — Duplicate `id` Attributes After Switching to Async Fetch (Week 2)

**Discovered:** Week 2  
**Severity:** Medium (DOM correctness / Accessibility)

### Problem
After refactoring to use `fetch()` for data, events were sometimes rendered twice on initial load — causing duplicate `id` attributes like `id="title-evt-01"` on multiple elements. Screen readers and anchor navigation both behave incorrectly when IDs are not unique.

### Root Cause
The `initFilterBar` callback was firing before `state.events` was populated from the JSON fetch. A race between the `DOMContentLoaded` listener initialising the filter bar (which called `renderEvents()`) and the async `loadEvents()` completing caused a double render.

### Fix Applied
Added a guard in the FilterBar callback: `if (state.events.length > 0) renderEvents()`. This ensures the filter-driven render only runs after data is loaded. The initial render is handled exclusively by `showEvents()` after `fetch()` resolves.

---

## Issue 5 — `fetch()` Fails Silently on Vercel if `data/` Folder Not Committed

**Discovered:** Week 2  
**Severity:** High (Production data loss)

### Problem
After deploying the Week 2 refactor to Vercel, the live site showed the error state ("Could not load events") even though events loaded correctly on the local server.

### Root Cause
The `data/` directory was not tracked in Git. The `.gitignore` file had a broad pattern that accidentally excluded newly-created directories. Because Vercel deploys from the GitHub repository, files not committed are not deployed — the `data/events.json` file was missing on the server.

### Fix Applied
- Ran `git status` to identify untracked files
- Explicitly staged `data/events.json` with `git add data/events.json`
- Verified the file appeared in the commit and was pushed to GitHub before the Vercel deployment
- Added a check in README to remind that all data files must be committed

---

*Log maintained as part of BuildLab Stage 1 — EventPulse Frontend Project.*

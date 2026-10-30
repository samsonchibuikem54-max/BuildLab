# EventPulse — Accessibility Audit Report (Task 3)

Comprehensive Accessibility Evaluation based on **WCAG 2.2 Level AA**, **Lighthouse**, **axe DevTools**, and **WAVE**.

---

## 1. Executive Summary & Audit Score Progression

| Category | Week 1 Baseline | Week 2 Iteration | Week 3 Post-Audit | Target Standard |
|---|:---:|:---:|:---:|:---:|
| **Lighthouse Accessibility** | 82 / 100 | 94 / 100 | **100 / 100** | $\ge 90$ |
| **Lighthouse Best Practices** | 89 / 100 | 96 / 100 | **100 / 100** | $\ge 90$ |
| **Lighthouse Performance** | 95 / 100 | 97 / 100 | **99 / 100** | $\ge 90$ |
| **Lighthouse SEO** | 85 / 100 | 92 / 100 | **100 / 100** | $\ge 90$ |
| **WAVE Errors / Contrast Errors** | 4 errors | 1 error | **0 errors** | 0 critical |
| **axe-core Violations** | 5 violations | 1 violation | **0 violations** | 0 critical |

---

## 2. Key Audit Categories & Applied Resolutions

### A. Focus Management & Dialog Accessibility (WCAG 2.4.3 Focus Order, WCAG 4.1.2 Name, Role, Value)
- **Problem**: Opening overlays (Event Details, Email Reminder, My Schedule drawer) initially did not trap keyboard focus, allowing users to Tab into underlying page content.
- **Resolution**:
  - Implemented `trapFocus(container, event)` in `scripts/utils.js` wrapping Tab and Shift+Tab cycles strictly within the active dialog.
  - Implemented focus restoration on close: saved triggers (`triggerElement`) are refocused upon modal or drawer dismissal.
  - Added native `Escape` key dismissal across all overlays, prioritizing the uppermost open dialog.

### B. Conflicting ARIA Hidden on Active Focus (WCAG 4.1.2)
- **Problem**: Console warned *"Blocked aria-hidden on an element because its descendant retained focus"* when overlays opened while having `aria-hidden="true"`.
- **Resolution**:
  - Replaced manual `aria-hidden` attribute toggling with the native HTML `hidden` property and enforced `[hidden] { display: none !important; }` in CSS to guarantee elements are completely excised from the accessibility tree and layout until opened.

### C. Contrast Ratios & Visual Perception (WCAG 1.4.3 Contrast Minimum)
- **Problem**: Muted category pills and placeholder texts initially had contrast ratios around 3.8:1 on light backgrounds.
- **Resolution**:
  - Elevated text colours: adjusted `--color-text-muted` from `#94a3b8` to `#64748b` (4.6:1 contrast ratio against `#ffffff`).
  - Darkened active pill texts to guarantee compliance exceeding the 4.5:1 requirement.

### D. Screen Reader Notifications & Live Regions (WCAG 4.1.3 Status Messages)
- **Problem**: Search filtering and bookmark additions were silent for screen reader users relying on assistive technology.
- **Resolution**:
  - Configured `#sr-announcer` with `aria-live="polite"` and `aria-atomic="true"`.
  - Added dynamic announcements on filter changes (e.g. *"Filtered by Workshop events. Showing 3 events"*), bookmark addition/removal, and modal opens.

### E. Keyboard Navigation & Skip Link (WCAG 2.4.1 Bypass Blocks)
- **Problem**: Users on keyboard navigation had to tab through all top-level header links before reaching the search and event listings.
- **Resolution**:
  - Added a visible skip link `<a href="#main-content" class="skip-link">Skip to main content</a>` positioned off-screen and smoothly sliding down when receiving focus (`:focus`).
  - Added prominent `:focus-visible` custom outlines (`outline: 2px solid var(--color-focus-ring)`) across interactive buttons, inputs, and links.

---

## 3. Assistive Technology Test Matrix

| Device / Tool | Tested Scenario | Result |
|---|---|:---:|
| **NVDA / Windows Screen Reader** | Browsing event cards, announcing topics and capacity | ✅ PASS |
| **Keyboard Only (No Mouse)** | Tab / Shift+Tab cycling through filters, modals, and schedule | ✅ PASS |
| **VoiceOver (macOS / iOS Safari)** | Opening and closing modal, reading live region toast alerts | ✅ PASS |
| **Lighthouse 11 CLI** | Automated accessibility test run | ✅ 100/100 |

---

*Audit maintained as part of BuildLab Stage 1 — EventPulse Frontend Project.*

# EventPulse — 3-Week Work Plan

## Schedule & Weekly Goals

### Week 1: Foundations
- **Deliverables**:
  - Idea One-Pager & Work Plan documentation (`README.md`, `/docs`).
  - Mobile-first, responsive screen (`index.html`, `styles/variables.css`, `styles/main.css`).
  - Semantic HTML5 structure with zero `div`-soup and $\ge 4.5:1$ contrast ratio.
  - Interactive JavaScript behavior (`scripts/app.js`):
    - Live client-side search query filtering.
    - Category pill filter toggle.
    - Event Detail Modal with focus management (`Escape` close).
    - Save to Schedule toggle with interactive counter.
  - Git tag: `week-1`.

### Week 2: Components and Data
- **Deliverables**:
  - Refactor into clean, reusable modular JS components (`EventCard.js`, `FilterBar.js`, `EventModal.js`).
  - Data integration via asynchronous `fetch()` from `data/events.json`.
  - Loading skeleton indicators, empty search state with clear action, and error boundary with retry trigger.
  - Documented Issue Log with at least 5 resolved bugs/technical challenges.
  - Git tag: `week-2`.

### Week 3: Quality and Delivery
- **Deliverables**:
  - Hash routing implementation (`#/`, `#/event/:id`, `#/schedule`).
  - Persistent bookmarks in `localStorage` across page reloads.
  - Comprehensive Accessibility Audit (Lighthouse / axe / WAVE) with recorded before/after scores.
  - Automated tests (at least 3 tests covering component rendering, user search interaction, and state persistence).
  - Production deployment (GitHub Pages / Vercel) and final submission package.
  - Git tag: `week-3`.

---

## Top 3 Delivery Risks
1. **Scope Creep**: Adding ticketing or user login instead of perfecting the core flow.  
   *Control*: Strict adherence to out-of-scope boundaries; keep data in client memory and `localStorage`.
2. **Accessibility Gaps**: Missing ARIA landmarks or low contrast states.  
   *Control*: Continuous automated checks and keyboard-only audits at each git tag.
3. **Cross-browser CSS inconsistencies**: Flex/Grid discrepancies on older mobile viewports.  
   *Control*: Rely on standard modern CSS properties, CSS variables, and fluid typography.

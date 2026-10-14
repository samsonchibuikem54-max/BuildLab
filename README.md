# EventPulse 🎓⚡
> Discover, filter, and track campus & local tech events, workshops, and hackathons. Built with pure Vanilla HTML5, CSS3, and JavaScript for BuildLab Stage 1.

## 📌 Idea One-Pager

- **Track:** Frontend Development
- **Stack:** Semantic HTML5, Modern CSS3 (Grid & Flexbox), Vanilla JavaScript (ES6 Modules)
- **Target User:** University students, bootcamp coders, and early-career software developers looking for campus tech meetups, hackathons, and workshops.
- **Problem:** Campus tech events are posted across fragmented social channels, flyers, and group chats. Students miss out on registration deadlines, speaker workshops, and vital networking opportunities.
- **Core Flow:**
  `Browse Event List` ➔ `Search & Category Filter` ➔ `View Event Details` ➔ `Save to My Schedule (LocalStorage)`
- **Data Source:** Curated Campus Tech Events dataset (In-memory mock for Week 1, async JSON fetch in Week 2).

### Scope
- **In Scope:**
  - Fully responsive, mobile-first design (320px to 4K).
  - Semantic HTML5 landmarks (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<button>`).
  - WCAG AA accessibility: 4.5:1+ contrast ratio, explicit focus rings, keyboard navigability, screen-reader labels.
  - Client-side search and category filtering with empty state handling.
  - Interactive Event Detail modal with focus trapping and `Escape` key support.
  - Save to Schedule toggle with live counter badge.
- **Out of Scope:**
  - Backend user authentication (kept client-side for rapid zero-dependency reliability).
  - Ticket transactions or payments.
  - Real-time social chat.

---

## 📅 3-Week Work Plan

| Week | Focus | Key Deliverables | Git Tag |
| :--- | :--- | :--- | :--- |
| **Week 1** | Foundations | Idea One-Pager, Work Plan, Responsive Accessible Screen, Vanilla JS Interactivity, README docs | `week-1` |
| **Week 2** | Components & Data | Component refactoring, Async JSON data integration, Loading/Empty/Error states, Issue Log | `week-2` |
| **Week 3** | Quality & Delivery | Multi-view routing (`#/`), State persistence (`localStorage`), Accessibility audit, Automated tests, Live deploy | `week-3` |

### Top 3 Risks & Mitigation
1. **Modal Accessibility:** Unmanaged focus in custom dialogs can confuse keyboard/screen reader users.  
   *Mitigation:* Use standard HTML5 `<dialog>` or custom focus-trap handling with `Escape` dismiss.
2. **Mobile Viewport Overflow:** Small screens (320px) breaking layout.  
   *Mitigation:* Mobile-first media queries and CSS grid `minmax(0, 1fr)` patterns.
3. **State Desynchronization:** Keeping bookmark state consistent between list and detail modal.  
   *Mitigation:* Single source of truth in the JavaScript application state object.

---

## 🚀 How to Run Locally

Because this project uses pure modern web standards, no bundlers or Node.js installations are required!

1. Clone or download this repository:
   ```bash
   git clone https://github.com/<your-username>/BuildLab.git
   cd BuildLab
   ```
2. Open `index.html` directly in any modern browser:
   - Double click `index.html`, OR
   - Run a local static server:
     ```bash
     # Using Python
     python -m http.server 8000
     # Or using npx
     npx serve .
     ```
3. Visit `http://localhost:8000` in your browser.

---

## ⚡ Interactive Behaviors (Task 1.2)

1. **Real-time Live Search & Filter**:
   - As you type in the search box, the event list dynamically updates matching event titles, locations, and tags.
   - Clicking category pills (e.g., *Workshop*, *Hackathon*, *Meetup*, *Career*) filters events instantly.
   - If no events match, an accessible empty state with a "Reset Filters" action is displayed.
2. **Event Detail Modal with Keyboard Trap**:
   - Selecting "View Details" opens an accessible modal with full event agenda, speaker info, and prerequisites.
   - The user can close it via the close button, clicking the backdrop, or pressing the `Escape` key.
3. **Schedule Bookmark Toggle**:
   - Clicking the bookmark icon on any event card toggles its saved status.
   - The header badge updates its count in real time, with an accessible announcement.

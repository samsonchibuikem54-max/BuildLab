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
2. Start a local static web server (required for JavaScript ES Module imports):
   - Using Python (built into most systems):
     ```bash
     python -m http.server 8000
     ```
   - OR using Node.js:
     ```bash
     npx serve .
     ```
   - OR using the VS Code "Live Server" extension (Right click `index.html` -> "Open with Live Server").
3. Visit `http://localhost:8000` (or the port shown in your terminal) in your browser.

> [!NOTE]
> Modern browsers enforce CORS security policies on native ES Modules (`import`/`export`), which prevents scripts from loading when opening files directly via `file:///`. Running a local static server provides a seamless, standard-compliant experience without needing any build tools.

---

## ⚡ Interactive Behaviors (Task 1.2)

1. **Real-time Live Search & Filter**:
   - As you type in the search box, the event list dynamically updates matching event titles, locations, and tags.
   - Clicking category pills (e.g., *Workshop*, *Hackathon*, *Meetup*, *Career*) filters events instantly.
   - If no events match, an accessible empty state with a "Reset Filters" action is displayed.
2. **Accessible Dialog Modals with Full Keyboard Focus Trap & Restoration**:
   - Selecting "View Details" opens the event modal, while clicking "Email Reminder" opens the notification modal.
   - **Focus Trap:** Tabbing wraps within the open dialog/drawer and prevents keyboard focus from escaping into background elements.
   - **Focus Restoration:** Upon closing (via `Escape`, close button, or backdrop click), keyboard focus automatically returns to the button that triggered it.
3. **Interactive Schedule Drawer with Persistence**:
   - Clicking "My Schedule" slides open an accessible drawer listing all saved events.
   - Saved bookmarks persist in `localStorage` across page reloads.
   - Users can remove items with immediate visual and screen-reader confirmation.
4. **Email Reminder Service & Form Validation**:
   - Users can request a reminder with real-time email format validation and accessible inline error alerts.
   - Generates pre-formatted calendar invites dispatched via native email clients.

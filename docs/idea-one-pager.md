# EventPulse — Campus & Local Tech Event Finder

**Track:** Frontend Development  
**Stack:** Plain Vanilla HTML5, Modern CSS3, JavaScript (ES6+)  
**Target User:** University students, boot camp attendees, and junior tech professionals looking for local or campus-based tech events, workshops, and hackathons.  

**Problem:**  
Campus tech events and local developer meetups are scattered across fragmented channels (WhatsApp/Telegram groups, departmental flyers, Discord servers, and social media). Students frequently discover events after registration has closed or struggle to organize and keep track of relevant networking opportunities.

**Core Flow:**  
Browse Event Directory -> Search & Filter by category/date -> View Event Details (modal/drawer) -> Save/Bookmark to "My Schedule" (stored locally).

**Data Source:**  
Curated campus tech events dataset (initially in-memory mock data for Week 1, migrating to async JSON fetch with loading/empty/error states in Week 2).

---

### Scope
#### In Scope
- Mobile-first, responsive interface (320px to 4K desktop).
- Semantic HTML5 landmark structure (`header`, `nav`, `main`, `section`, `article`, `footer`).
- WCAG AA accessibility compliance: minimum 4.5:1 text contrast, distinct `:focus-visible` outlines, screen-reader labels (`aria-label`, `aria-live`, `aria-expanded`).
- Real-time search query matching across event titles, organizers, and tags.
- Multi-category filtering (All, Workshop, Hackathon, Meetup, Career Fair).
- Interactive Event Detail drawer/modal with keyboard trap (`Escape` to dismiss).
- Save to "My Schedule" with persistent bookmark counter and quick-toggle.
- Empty states and active filter resets.

#### Out of Scope
- Ticket purchases or payment gateway integrations (avoids complexity).
- User authentication / backend database accounts (uses browser client storage).
- Real-time attendee chat or social messaging.
- Host dashboard for event ticket scanning.

---

### Top 3 Risks & Mitigation
1. **Risk:** Keyboard accessibility and focus trap issues in custom modal dialogs.  
   *Mitigation:* Implement standard native `<dialog>` element or strict JavaScript focus-trapping with keyboard listeners (`Tab`, `Shift+Tab`, `Escape`).
2. **Risk:** Responsive layout breakage on small mobile devices (~320px).  
   *Mitigation:* Strictly build mobile-first with CSS flexbox and fluid grid (`minmax()`), testing continuously with mobile viewport constraints.
3. **Risk:** State synchronization between the event list and saved items without a framework.  
   *Mitigation:* Use a centralized vanilla state management pattern with event-driven custom events or state subscriber functions.

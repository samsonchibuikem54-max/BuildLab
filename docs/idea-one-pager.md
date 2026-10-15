# EventPulse — Idea One-Pager

Track: Frontend Development

Technology Stack: HTML5, CSS3, Vanilla JavaScript (ES Modules), and LocalStorage.

### 1. Project Overview
EventPulse is a web application designed to help students discover and keep track of campus and local technology events. It provides a simple interface for finding events, viewing their details, and bookmarking events of interest.

### 2. Target Users
The primary users are students and young people who want to discover technology events, workshops, seminars, conferences, and other learning opportunities.

### 3. Problem Statement
Students may find it difficult to discover relevant technology events and keep track of the ones they want to attend. EventPulse aims to make this process easier by bringing event information into one place and providing search, category filtering, and bookmarking features.

### 4. Core User Flow
**Browse Events → Search or Filter Events → View Event Details → Bookmark an Event → Revisit Saved Events**

Users can browse the available events, find relevant ones using search and category filters, view event details in a modal, and bookmark events for later reference.

### 5. Data Source
The current version uses sample event data stored locally in the application. Bookmarks are saved in the browser using LocalStorage. The next development stage will focus on integrating asynchronous JSON data loading and handling loading, empty, and error states.

### 6. Project Scope

**In Scope**
- A responsive event-listing interface for mobile and desktop screens.
- Search events by title, organizer, location, or topic.
- Filter events by category.
- Display event details in a modal.
- Bookmark and revisit saved events.
- Provide basic keyboard accessibility and clear user feedback.

Out of Scope
- Online ticket purchases or payment processing.
- Real-time event registration and attendance tracking.
- User accounts and server-side authentication.
- A complete event-management system for organizers.

### 7. Top Three Risks
1. **Responsive design:** Some layouts or controls may not display correctly on smaller screens. I will test the application at different viewport widths and correct any layout issues.
2. **Accessibility:** Keyboard navigation, focus management, and colour contrast may need improvement. I will test these features and make the necessary adjustments.
3. **Data reliability:** Local sample data does not provide automatically updated event information. I will work on asynchronous data integration and appropriate loading, empty, and error states in the next development stage.

### 8. Expected Outcome
The expected outcome is a responsive, accessible, and interactive event-discovery application that helps users find relevant events and save the ones they are interested in. The project will be developed incrementally over the three-week BuildLab programme.
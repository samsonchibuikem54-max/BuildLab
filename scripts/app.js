import { initialEvents } from './data.js';
import { icons } from './icons.js';

// Application State
const state = {
  events: [...initialEvents],
  searchQuery: '',
  selectedCategory: 'All',
  savedEventIds: new Set(JSON.parse(localStorage.getItem('eventpulse_saved') || '[]')),
  activeEventModalId: null,
  isDrawerOpen: false,
};

// Save to localStorage helper
function persistSaved() {
  localStorage.setItem('eventpulse_saved', JSON.stringify([...state.savedEventIds]));
}

// DOM Element References
const elements = {
  searchInput: document.getElementById('search-input'),
  filterButtons: document.querySelectorAll('.filter-btn'),
  eventsGrid: document.getElementById('events-grid'),
  emptyState: document.getElementById('empty-state'),
  resetFiltersBtn: document.getElementById('reset-filters-btn'),
  resultsCount: document.getElementById('results-count'),
  scheduleCount: document.getElementById('schedule-count'),
  headerScheduleBtn: document.getElementById('header-schedule-btn'),
  
  // Drawer elements
  drawerBackdrop: document.getElementById('schedule-drawer-backdrop'),
  drawerCloseBtn: document.getElementById('drawer-close-btn'),
  drawerBody: document.getElementById('drawer-body'),
  drawerCount: document.getElementById('drawer-count'),
  
  // Modal elements
  modalBackdrop: document.getElementById('event-modal-backdrop'),
  modalCloseBtn: document.getElementById('modal-close-btn'),
  modalDismissBtn: document.getElementById('modal-dismiss-btn'),
  modalTitle: document.getElementById('modal-title'),
  modalCategory: document.getElementById('modal-category'),
  modalDate: document.getElementById('modal-date'),
  modalTime: document.getElementById('modal-time'),
  modalLocation: document.getElementById('modal-location'),
  modalOrganizer: document.getElementById('modal-organizer'),
  modalDescription: document.getElementById('modal-description'),
  modalPrerequisites: document.getElementById('modal-prerequisites'),
  modalTags: document.getElementById('modal-tags'),
  modalBookmarkBtn: document.getElementById('modal-bookmark-btn'),
  modalRemindBtn: document.getElementById('modal-remind-btn'),
  
  // Accessibility & Toast
  announcer: document.getElementById('sr-announcer'),
  toastContainer: document.getElementById('toast-container'),
};

// Accessibility announcer
function announce(message) {
  if (elements.announcer) {
    elements.announcer.textContent = message;
  }
}

// Toast Notification
function showToast(message, icon = icons.calendar) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `${icon} <span>${escapeHTML(message)}</span>`;
  elements.toastContainer.appendChild(toast);
  announce(message);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 200ms ease';
    setTimeout(() => toast.remove(), 250);
  }, 3500);
}

// Filter Logic
function getFilteredEvents() {
  const query = state.searchQuery.trim().toLowerCase();
  return state.events.filter(event => {
    const matchesCategory =
      state.selectedCategory === 'All' || event.category === state.selectedCategory;
    const matchesQuery =
      query === '' ||
      event.title.toLowerCase().includes(query) ||
      event.organizer.toLowerCase().includes(query) ||
      event.location.toLowerCase().includes(query) ||
      event.tags.some(tag => tag.toLowerCase().includes(query));

    return matchesCategory && matchesQuery;
  });
}

// Render Event Cards
function renderEvents() {
  const filtered = getFilteredEvents();
  elements.resultsCount.textContent = `Showing ${filtered.length} event${filtered.length === 1 ? '' : 's'}`;

  if (filtered.length === 0) {
    elements.eventsGrid.innerHTML = '';
    elements.eventsGrid.hidden = true;
    elements.emptyState.hidden = false;
    announce('No events found matching your criteria.');
    return;
  }

  elements.emptyState.hidden = true;
  elements.eventsGrid.hidden = false;

  elements.eventsGrid.innerHTML = filtered
    .map(event => {
      const isBookmarked = state.savedEventIds.has(event.id);
      const spotsLeft = event.capacity - event.registered;
      const bookmarkIcon = isBookmarked ? icons.bookmarkFilled : icons.bookmarkOutline;

      return `
        <li>
          <article class="event-card" aria-labelledby="title-${event.id}">
            <div class="card-top">
              <span class="category-tag" data-cat="${event.category}">${event.category}</span>
              <button 
                type="button" 
                class="bookmark-toggle" 
                data-id="${event.id}" 
                aria-pressed="${isBookmarked}" 
                title="${isBookmarked ? 'Remove from schedule' : 'Save to schedule'}"
                aria-label="${isBookmarked ? 'Remove ' + event.title + ' from my schedule' : 'Save ' + event.title + ' to my schedule'}">
                ${bookmarkIcon}
              </button>
            </div>
            
            <h3 id="title-${event.id}" class="event-title">${escapeHTML(event.title)}</h3>
            
            <div class="event-meta">
              <span class="meta-item">
                ${icons.calendar}
                <time datetime="${event.date}">${formatDate(event.date)}</time>
              </span>
              <span class="meta-item">
                ${icons.clock}
                <span>${event.time}</span>
              </span>
              <span class="meta-item">
                ${icons.mapPin}
                <span>${escapeHTML(event.location)}</span>
              </span>
              <span class="meta-item">
                ${icons.users}
                <span>${escapeHTML(event.organizer)}</span>
              </span>
            </div>

            <p class="event-desc">${escapeHTML(event.description)}</p>

            <ul class="tag-list" aria-label="Event topics">
              ${event.tags.map(tag => `<li class="tag-item">#${escapeHTML(tag)}</li>`).join('')}
            </ul>

            <div class="card-actions">
              <span class="capacity-indicator">
                <span class="pulse-dot" aria-hidden="true"></span>
                <span>${spotsLeft > 0 ? `${spotsLeft} spots left` : 'Full'}</span>
              </span>
              <button 
                type="button" 
                class="btn-detail" 
                data-action="view-detail" 
                data-id="${event.id}"
                aria-haspopup="dialog">
                <span>Details</span>
                ${icons.arrowRight}
              </button>
            </div>
          </article>
        </li>
      `;
    })
    .join('');
}

// Render Saved Schedule Drawer
function renderScheduleDrawer() {
  const savedEvents = state.events.filter(e => state.savedEventIds.has(e.id));
  elements.drawerCount.textContent = `(${savedEvents.length})`;

  if (savedEvents.length === 0) {
    elements.drawerBody.innerHTML = `
      <div class="drawer-empty">
        <div style="font-size: 2rem; margin-bottom: 0.5rem;" aria-hidden="true">🔖</div>
        <h4 style="font-weight: 700; margin-bottom: 0.25rem;">No saved events yet</h4>
        <p style="font-size: 0.875rem;">Click the bookmark icon on any event card to add it to your schedule!</p>
      </div>
    `;
    return;
  }

  elements.drawerBody.innerHTML = `
    <ul class="drawer-list" aria-label="Saved events list">
      ${savedEvents
        .map(
          ev => `
        <li class="drawer-item">
          <div class="drawer-item-header">
            <span class="category-tag" data-cat="${ev.category}">${ev.category}</span>
            <button type="button" class="drawer-item-remove" data-remove-id="${ev.id}" aria-label="Remove ${ev.title}">
              ${icons.close}
            </button>
          </div>
          <h4 class="drawer-item-title">${escapeHTML(ev.title)}</h4>
          <div class="drawer-item-meta">
            <span>📅 ${formatDate(ev.date)} • ${ev.time}</span>
            <span>📍 ${escapeHTML(ev.location)}</span>
          </div>
          <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
            <button type="button" class="btn-detail" data-action="view-detail" data-id="${ev.id}" style="padding: 0.35rem 0.75rem; font-size: 0.75rem;">
              View Details
            </button>
            <button type="button" class="btn-schedule" data-calendar-id="${ev.id}" style="padding: 0.35rem 0.75rem; font-size: 0.75rem;">
              🗓️ Add Reminder
            </button>
          </div>
        </li>
      `
        )
        .join('')}
    </ul>
  `;
}

// Helpers
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatDate(isoDate) {
  const options = { weekday: 'short', month: 'short', day: 'numeric' };
  const d = new Date(isoDate + 'T00:00:00');
  return d.toLocaleDateString(undefined, options);
}

// Toggle Bookmark
function toggleBookmark(eventId) {
  const targetEvent = state.events.find(e => e.id === eventId);
  if (!targetEvent) return;

  if (state.savedEventIds.has(eventId)) {
    state.savedEventIds.delete(eventId);
    showToast(`Removed from schedule`, icons.close);
  } else {
    state.savedEventIds.add(eventId);
    showToast(`Saved to My Schedule!`, icons.bookmarkFilled);
  }

  persistSaved();
  elements.scheduleCount.textContent = state.savedEventIds.size;
  renderEvents();
  renderScheduleDrawer();

  if (state.activeEventModalId === eventId) {
    syncModalBookmarkButton(eventId);
  }
}

function syncModalBookmarkButton(eventId) {
  const isBookmarked = state.savedEventIds.has(eventId);
  elements.modalBookmarkBtn.setAttribute('aria-pressed', isBookmarked);
  const icon = isBookmarked ? icons.bookmarkFilled : icons.bookmarkOutline;
  const label = isBookmarked ? 'Saved to Schedule' : 'Save to Schedule';
  elements.modalBookmarkBtn.innerHTML = `${icon} <span>${label}</span>`;
}

// Add Calendar / Reminder Export Helper (.ics file generation)
function downloadCalendarReminder(event) {
  // Format for iCalendar (YYYYMMDDTHHmmSS)
  const cleanDate = event.date.replace(/-/g, '');
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//EventPulse//Campus Event Finder//EN',
    'BEGIN:VEVENT',
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description}\\nOrganizer: ${event.organizer}`,
    `LOCATION:${event.location}`,
    `DTSTART:${cleanDate}T090000Z`,
    `DTEND:${cleanDate}T120000Z`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${event.id}-reminder.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showToast(`Reminder downloaded! Open to add to Google/Apple Calendar.`);
}

// Drawer Open/Close
function openScheduleDrawer() {
  renderScheduleDrawer();
  elements.drawerBackdrop.classList.add('is-open');
  elements.drawerBackdrop.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  elements.drawerCloseBtn.focus();
  state.isDrawerOpen = true;
  announce('Opened My Schedule drawer');
}

function closeScheduleDrawer() {
  elements.drawerBackdrop.classList.remove('is-open');
  elements.drawerBackdrop.setAttribute('aria-hidden', 'true');
  if (!state.activeEventModalId) {
    document.body.style.overflow = '';
  }
  state.isDrawerOpen = false;
  elements.headerScheduleBtn.focus();
  announce('Closed My Schedule drawer');
}

// Modal Management with Focus Control
let lastFocusedElement = null;

function openEventModal(eventId) {
  const event = state.events.find(e => e.id === eventId);
  if (!event) return;

  lastFocusedElement = document.activeElement;
  state.activeEventModalId = eventId;

  elements.modalTitle.textContent = event.title;
  elements.modalCategory.textContent = event.category;
  elements.modalCategory.setAttribute('data-cat', event.category);
  elements.modalDate.textContent = formatDate(event.date);
  elements.modalTime.textContent = event.time;
  elements.modalLocation.textContent = event.location;
  elements.modalOrganizer.textContent = event.organizer;
  elements.modalDescription.textContent = event.description;
  elements.modalPrerequisites.textContent = event.prerequisites || 'None';

  elements.modalTags.innerHTML = event.tags
    .map(tag => `<li class="tag-item">#${escapeHTML(tag)}</li>`)
    .join('');

  syncModalBookmarkButton(eventId);

  elements.modalBackdrop.classList.add('is-open');
  elements.modalBackdrop.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  elements.modalCloseBtn.focus();
  announce(`Opened details for ${event.title}`);
}

function closeEventModal() {
  if (!state.activeEventModalId) return;

  elements.modalBackdrop.classList.remove('is-open');
  elements.modalBackdrop.setAttribute('aria-hidden', 'true');
  if (!state.isDrawerOpen) {
    document.body.style.overflow = '';
  }
  state.activeEventModalId = null;

  if (lastFocusedElement) {
    lastFocusedElement.focus();
  }
  announce('Closed event details dialog.');
}

// Event Listeners Setup
function initEventListeners() {
  // Real-time Search input
  elements.searchInput.addEventListener('input', e => {
    state.searchQuery = e.target.value;
    renderEvents();
  });

  // Category filter button group
  elements.filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      elements.filterButtons.forEach(b => b.setAttribute('aria-pressed', 'false'));
      btn.setAttribute('aria-pressed', 'true');
      state.selectedCategory = btn.dataset.category;
      renderEvents();
      announce(`Filtered by ${state.selectedCategory} events.`);
    });
  });

  // Reset filters button
  elements.resetFiltersBtn.addEventListener('click', () => {
    state.searchQuery = '';
    state.selectedCategory = 'All';
    elements.searchInput.value = '';

    elements.filterButtons.forEach(b => {
      b.setAttribute('aria-pressed', b.dataset.category === 'All' ? 'true' : 'false');
    });

    renderEvents();
    elements.searchInput.focus();
  });

  // Header "My Schedule" click opens Drawer!
  elements.headerScheduleBtn.addEventListener('click', openScheduleDrawer);
  elements.drawerCloseBtn.addEventListener('click', closeScheduleDrawer);
  elements.drawerBackdrop.addEventListener('click', e => {
    if (e.target === elements.drawerBackdrop) {
      closeScheduleDrawer();
    }
  });

  // Drawer interactions (Remove and Calendar reminder)
  elements.drawerBody.addEventListener('click', e => {
    const removeBtn = e.target.closest('[data-remove-id]');
    if (removeBtn) {
      toggleBookmark(removeBtn.dataset.removeId);
      return;
    }

    const calBtn = e.target.closest('[data-calendar-id]');
    if (calBtn) {
      const event = state.events.find(ev => ev.id === calBtn.dataset.calendarId);
      if (event) downloadCalendarReminder(event);
      return;
    }

    const detailBtn = e.target.closest('[data-action="view-detail"]');
    if (detailBtn) {
      openEventModal(detailBtn.dataset.id);
    }
  });

  // Event Delegation for Grid
  elements.eventsGrid.addEventListener('click', e => {
    const bookmarkBtn = e.target.closest('.bookmark-toggle');
    if (bookmarkBtn) {
      const id = bookmarkBtn.dataset.id;
      toggleBookmark(id);
      return;
    }

    const detailBtn = e.target.closest('[data-action="view-detail"]');
    if (detailBtn) {
      const id = detailBtn.dataset.id;
      openEventModal(id);
    }
  });

  // Modal interactions
  elements.modalCloseBtn.addEventListener('click', closeEventModal);
  elements.modalDismissBtn.addEventListener('click', closeEventModal);
  elements.modalBookmarkBtn.addEventListener('click', () => {
    if (state.activeEventModalId) {
      toggleBookmark(state.activeEventModalId);
    }
  });
  elements.modalRemindBtn.addEventListener('click', () => {
    if (state.activeEventModalId) {
      const ev = state.events.find(e => e.id === state.activeEventModalId);
      if (ev) downloadCalendarReminder(ev);
    }
  });

  // Backdrop click to dismiss modal
  elements.modalBackdrop.addEventListener('click', e => {
    if (e.target === elements.modalBackdrop) {
      closeEventModal();
    }
  });

  // Keyboard trap & Escape dismissal
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (state.activeEventModalId) {
        closeEventModal();
      } else if (state.isDrawerOpen) {
        closeScheduleDrawer();
      }
    }
  });
}

// App Initialization
document.addEventListener('DOMContentLoaded', () => {
  initEventListeners();
  elements.scheduleCount.textContent = state.savedEventIds.size;
  renderEvents();
});

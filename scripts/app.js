import { initialEvents } from './data.js';
import { icons } from './icons.js';

// Application State
const state = {
  events: [...initialEvents],
  searchQuery: '',
  selectedCategory: 'All',
  savedEventIds: new Set(),
  activeEventModalId: null,
};

// DOM Element References
const elements = {
  searchInput: document.getElementById('search-input'),
  filterButtons: document.querySelectorAll('.filter-btn'),
  eventsGrid: document.getElementById('events-grid'),
  emptyState: document.getElementById('empty-state'),
  resetFiltersBtn: document.getElementById('reset-filters-btn'),
  resultsCount: document.getElementById('results-count'),
  scheduleCount: document.getElementById('schedule-count'),
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
  announcer: document.getElementById('sr-announcer'),
};

// Accessibility: Live region announcer for screen readers
function announce(message) {
  if (elements.announcer) {
    elements.announcer.textContent = message;
  }
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
    announce(`Removed ${targetEvent.title} from schedule.`);
  } else {
    state.savedEventIds.add(eventId);
    announce(`Saved ${targetEvent.title} to schedule.`);
  }

  // Update schedule badge
  elements.scheduleCount.textContent = state.savedEventIds.size;
  renderEvents();

  // If modal is open for this event, sync modal button
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

  // Move focus into the modal close button for keyboard users
  elements.modalCloseBtn.focus();
  announce(`Opened details for ${event.title}`);
}

function closeEventModal() {
  if (!state.activeEventModalId) return;

  elements.modalBackdrop.classList.remove('is-open');
  elements.modalBackdrop.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  state.activeEventModalId = null;

  // Restore previous keyboard focus
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

  // Reset filters button in empty state
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

  // Backdrop click to dismiss
  elements.modalBackdrop.addEventListener('click', e => {
    if (e.target === elements.modalBackdrop) {
      closeEventModal();
    }
  });

  // Keyboard trap & Escape dismissal
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && state.activeEventModalId) {
      closeEventModal();
    }
  });
}

// App Initialization
document.addEventListener('DOMContentLoaded', () => {
  initEventListeners();
  renderEvents();
});

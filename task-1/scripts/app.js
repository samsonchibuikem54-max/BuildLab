
// Dropdown menu toggle helper
function initTasksDropdown() {
  const container = document.getElementById('tasks-dropdown');
  const btn = document.getElementById('tasks-dropdown-btn');
  if (!container || !btn) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = container.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  document.addEventListener('click', (e) => {
    if (!container.contains(e.target)) {
      container.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && container.classList.contains('is-open')) {
      container.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
      btn.focus();
    }
  });
}

import { initialEvents } from './data.js';
import { icons } from './icons.js';

// Application State
const state = {
  events: [...initialEvents],
  searchQuery: '',
  selectedCategory: 'All',
  savedEventIds: new Set(JSON.parse(localStorage.getItem('eventpulse_saved') || '[]')),
  activeEventModalId: null,
  activeEmailReminderEventId: null,
  isDrawerOpen: false,
};

// Persist saved IDs in localStorage
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
  drawerPanel: document.querySelector('.drawer-panel'),
  drawerCloseBtn: document.getElementById('drawer-close-btn'),
  drawerBody: document.getElementById('drawer-body'),
  drawerCount: document.getElementById('drawer-count'),
  
  // Event Detail Modal elements
  modalBackdrop: document.getElementById('event-modal-backdrop'),
  modalCard: document.querySelector('#event-modal-backdrop .modal-content'),
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
  
  // Email Reminder Modal elements
  emailModalBackdrop: document.getElementById('email-modal-backdrop'),
  emailModalCard: document.querySelector('#email-modal-backdrop .modal-content'),
  emailModalCloseBtn: document.getElementById('email-modal-close-btn'),
  emailModalDismissBtn: document.getElementById('email-modal-dismiss-btn'),
  emailForm: document.getElementById('email-reminder-form'),
  emailInput: document.getElementById('reminder-email-input'),
  emailError: document.getElementById('email-error-msg'),
  emailModalTitle: document.getElementById('email-modal-title'),
  emailPreviewEventTitle: document.getElementById('email-preview-event-title'),
  emailPreviewMeta: document.getElementById('email-preview-meta'),
  
  // Accessibility & Toast
  announcer: document.getElementById('sr-announcer'),
  toastContainer: document.getElementById('toast-container'),
};

// Track which button opened which modal/drawer for focus restoration
let modalTriggerElement = null;
let emailModalTriggerElement = null;
let drawerTriggerElement = null;

// Accessibility announcer
function announce(message) {
  if (elements.announcer) {
    elements.announcer.textContent = '';
    // small timeout ensures screen readers detect text mutation
    setTimeout(() => {
      elements.announcer.textContent = message;
    }, 50);
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

// Universal Focus Trap Helper for Dialogs and Drawers
function trapFocus(containerElement, event) {
  if (event.key !== 'Tab') return;

  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(', ');

  const focusables = Array.from(containerElement.querySelectorAll(focusableSelectors))
    .filter(el => el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement);

  if (focusables.length === 0) {
    event.preventDefault();
    return;
  }

  const firstFocusable = focusables[0];
  const lastFocusable = focusables[focusables.length - 1];

  if (event.shiftKey) {
    // Shift + Tab
    if (document.activeElement === firstFocusable || !containerElement.contains(document.activeElement)) {
      event.preventDefault();
      lastFocusable.focus();
    }
  } else {
    // Tab
    if (document.activeElement === lastFocusable || !containerElement.contains(document.activeElement)) {
      event.preventDefault();
      firstFocusable.focus();
    }
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
  const countText = `Showing ${filtered.length} event${filtered.length === 1 ? '' : 's'}`;
  elements.resultsCount.textContent = countText;

  if (filtered.length === 0) {
    elements.eventsGrid.innerHTML = '';
    elements.eventsGrid.hidden = true;
    elements.emptyState.hidden = false;
    announce('No events found matching your search. Use Reset All Filters button to view all.');
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
                aria-haspopup="dialog"
                aria-label="View details for ${escapeHTML(event.title)}">
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
        <div class="drawer-empty-icon" aria-hidden="true">
          ${icons.bookmarkOutline}
        </div>
        <h4 style="font-weight: 800; font-size: 1.15rem; margin-bottom: 0.35rem;">No saved events yet</h4>
        <p style="font-size: 0.875rem; color: var(--color-text-muted); line-height: 1.5;">Click the bookmark star on any campus event card to add it to your schedule.</p>
      </div>
    `;
    return;
  }

  elements.drawerBody.innerHTML = `
    <ul class="drawer-list" aria-label="Saved events list">
      ${savedEvents
        .map(
          ev => `
        <li class="drawer-card">
          <div class="drawer-card-top">
            <span class="category-tag" data-cat="${ev.category}">${ev.category}</span>
            <button type="button" class="btn-remove-drawer" data-remove-id="${ev.id}" title="Remove from schedule" aria-label="Remove ${escapeHTML(ev.title)} from schedule">
              ${icons.trash}
            </button>
          </div>
          
          <h4 class="drawer-card-title">${escapeHTML(ev.title)}</h4>
          
          <div class="drawer-card-meta">
            <div style="display: flex; align-items: center; gap: 0.4rem;">
              ${icons.calendar}
              <span>${formatDate(ev.date)} • ${ev.time}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.4rem;">
              ${icons.mapPin}
              <span>${escapeHTML(ev.location)}</span>
            </div>
          </div>

          <div class="drawer-card-actions">
            <button type="button" class="btn-action-primary" data-action="view-detail" data-id="${ev.id}" aria-label="View details for ${escapeHTML(ev.title)}">
              <span>View Details</span>
            </button>
            <button type="button" class="btn-action-email" data-email-reminder-id="${ev.id}" aria-label="Set email reminder for ${escapeHTML(ev.title)}">
              ${icons.mail}
              <span>Email Reminder</span>
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

// Drawer Open/Close with Focus Trap & Restoration
function openScheduleDrawer(triggerEl = null) {
  drawerTriggerElement = triggerEl || document.activeElement;
  renderScheduleDrawer();
  elements.drawerBackdrop.hidden = false;
  elements.drawerBackdrop.classList.add('is-open');
  elements.headerScheduleBtn.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
  
  // Set focus to the close button inside the drawer
  setTimeout(() => {
    elements.drawerCloseBtn.focus();
  }, 50);

  state.isDrawerOpen = true;
  announce('Opened My Schedule drawer. Press Escape to close.');
}

function closeScheduleDrawer() {
  elements.drawerBackdrop.classList.remove('is-open');
  elements.drawerBackdrop.hidden = true;
  elements.headerScheduleBtn.setAttribute('aria-expanded', 'false');

  if (!state.activeEventModalId && !state.activeEmailReminderEventId) {
    document.body.style.overflow = '';
  }
  state.isDrawerOpen = false;

  // Restore focus to trigger
  if (drawerTriggerElement && typeof drawerTriggerElement.focus === 'function') {
    drawerTriggerElement.focus();
  }
  announce('Closed My Schedule drawer');
}

// Email Reminder Modal with Validation, Focus Trap & Restoration
function openEmailReminderModal(eventId, triggerEl = null) {
  const event = state.events.find(e => e.id === eventId);
  if (!event) return;

  emailModalTriggerElement = triggerEl || document.activeElement;
  state.activeEmailReminderEventId = eventId;
  elements.emailPreviewEventTitle.textContent = event.title;
  elements.emailPreviewMeta.textContent = `${formatDate(event.date)} at ${event.time} • ${event.location}`;

  // Reset errors
  if (elements.emailError) {
    elements.emailError.textContent = '';
    elements.emailError.hidden = true;
  }
  elements.emailInput.removeAttribute('aria-invalid');

  // Pre-fill user email if remembered
  const rememberedEmail = localStorage.getItem('eventpulse_user_email') || '';
  elements.emailInput.value = rememberedEmail;

  elements.emailModalBackdrop.hidden = false;
  elements.emailModalBackdrop.classList.add('is-open');
  document.body.style.overflow = 'hidden';

  setTimeout(() => {
    elements.emailInput.focus();
  }, 50);

  announce(`Open email reminder dialog for ${event.title}`);
}

function closeEmailReminderModal() {
  elements.emailModalBackdrop.classList.remove('is-open');
  elements.emailModalBackdrop.hidden = true;
  state.activeEmailReminderEventId = null;

  if (!state.isDrawerOpen && !state.activeEventModalId) {
    document.body.style.overflow = '';
  }

  // Restore focus to trigger
  if (emailModalTriggerElement && typeof emailModalTriggerElement.focus === 'function') {
    emailModalTriggerElement.focus();
  }
  announce('Closed email reminder dialog');
}

// Handle Email Reminder Submission with clear accessible error feedback
function handleEmailReminderSubmit(e) {
  e.preventDefault();
  const email = elements.emailInput.value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || !emailRegex.test(email)) {
    if (elements.emailError) {
      elements.emailError.textContent = 'Please enter a valid email address (e.g. name@university.edu).';
      elements.emailError.hidden = false;
    }
    elements.emailInput.setAttribute('aria-invalid', 'true');
    elements.emailInput.focus();
    announce('Validation error: Please enter a valid email address.');
    return;
  }

  const event = state.events.find(ev => ev.id === state.activeEmailReminderEventId);
  if (!event) return;

  localStorage.setItem('eventpulse_user_email', email);

  const subject = encodeURIComponent(`📅 Reminder: ${event.title}`);
  const body = encodeURIComponent(
    `Hi,\n\nHere is your campus event reminder for:\n` +
    `📌 Event: ${event.title}\n` +
    `🗓 Date & Time: ${formatDate(event.date)} at ${event.time}\n` +
    `📍 Location: ${event.location}\n` +
    `👥 Organizer: ${event.organizer}\n\n` +
    `About: ${event.description}\n\n` +
    `— EventPulse Campus Tech Event Finder`
  );

  window.location.href = `mailto:${encodeURIComponent(email)}?subject=${subject}&body=${body}`;

  closeEmailReminderModal();
  showToast(`Reminder created for ${email}!`, icons.check);
}

// Event Details Modal with Focus Trap & Restoration
function openEventModal(eventId, triggerEl = null) {
  const event = state.events.find(e => e.id === eventId);
  if (!event) return;

  modalTriggerElement = triggerEl || document.activeElement;
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

  elements.modalBackdrop.hidden = false;
  elements.modalBackdrop.classList.add('is-open');
  document.body.style.overflow = 'hidden';

  setTimeout(() => {
    elements.modalCloseBtn.focus();
  }, 50);

  announce(`Opened details dialog for ${event.title}. Press Escape to close.`);
}

function closeEventModal() {
  if (!state.activeEventModalId) return;

  elements.modalBackdrop.classList.remove('is-open');
  elements.modalBackdrop.hidden = true;
  if (!state.isDrawerOpen && !state.activeEmailReminderEventId) {
    document.body.style.overflow = '';
  }
  state.activeEventModalId = null;

  // Restore focus to trigger
  if (modalTriggerElement && typeof modalTriggerElement.focus === 'function') {
    modalTriggerElement.focus();
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
      announce(`Filtered by ${state.selectedCategory} events. ${elements.resultsCount.textContent}`);
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
    announce('Filters reset. Showing all events.');
  });

  // Header "My Schedule" click opens Drawer!
  elements.headerScheduleBtn.addEventListener('click', (e) => {
    openScheduleDrawer(e.currentTarget);
  });
  elements.drawerCloseBtn.addEventListener('click', closeScheduleDrawer);
  elements.drawerBackdrop.addEventListener('click', e => {
    if (e.target === elements.drawerBackdrop) {
      closeScheduleDrawer();
    }
  });

  // Drawer interactions (Remove and Email reminder)
  elements.drawerBody.addEventListener('click', e => {
    const removeBtn = e.target.closest('[data-remove-id]');
    if (removeBtn) {
      toggleBookmark(removeBtn.dataset.removeId);
      return;
    }

    const emailBtn = e.target.closest('[data-email-reminder-id]');
    if (emailBtn) {
      openEmailReminderModal(emailBtn.dataset.emailReminderId, emailBtn);
      return;
    }

    const detailBtn = e.target.closest('[data-action="view-detail"]');
    if (detailBtn) {
      openEventModal(detailBtn.dataset.id, detailBtn);
    }
  });

  // Email modal actions
  elements.emailForm.addEventListener('submit', handleEmailReminderSubmit);
  elements.emailModalCloseBtn.addEventListener('click', closeEmailReminderModal);
  elements.emailModalDismissBtn.addEventListener('click', closeEmailReminderModal);
  elements.emailModalBackdrop.addEventListener('click', e => {
    if (e.target === elements.emailModalBackdrop) {
      closeEmailReminderModal();
    }
  });

  // Event Grid Delegation
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
      openEventModal(id, detailBtn);
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
  elements.modalRemindBtn.addEventListener('click', (e) => {
    if (state.activeEventModalId) {
      openEmailReminderModal(state.activeEventModalId, e.currentTarget);
    }
  });

  // Backdrop click to dismiss modal
  elements.modalBackdrop.addEventListener('click', e => {
    if (e.target === elements.modalBackdrop) {
      closeEventModal();
    }
  });

  // Universal Keydown Listener: Escape to Dismiss & Tab Focus Traps
  document.addEventListener('keydown', e => {
    // 1. Escape Key Dismissal (Hierarchical: Top-most layer first)
    if (e.key === 'Escape') {
      if (state.activeEmailReminderEventId) {
        closeEmailReminderModal();
      } else if (state.activeEventModalId) {
        closeEventModal();
      } else if (state.isDrawerOpen) {
        closeScheduleDrawer();
      }
      return;
    }

    // 2. Focus Trap Enforcement
    if (state.activeEmailReminderEventId) {
      trapFocus(elements.emailModalCard, e);
    } else if (state.activeEventModalId) {
      trapFocus(elements.modalCard, e);
    } else if (state.isDrawerOpen) {
      trapFocus(elements.drawerPanel, e);
    }
  });
}

// App Initialization
document.addEventListener('DOMContentLoaded', () => {
  initTasksDropdown();
  initEventListeners();
  elements.scheduleCount.textContent = state.savedEventIds.size;
  renderEvents();
});

/**
 * EventPulse — Main Application Orchestrator (Week 2 refactor)
 *
 * Responsibilities:
 *  - Fetch event data asynchronously from data/events.json
 *  - Manage top-level application state
 *  - Wire FilterBar, EventCard, EventModal, and Schedule Drawer components together
 *  - Handle loading, error, and empty UI states
 */

import { icons } from './icons.js';
import { escapeHTML, formatDate, trapFocus } from './utils.js';
import { createEventCardHTML } from './components/EventCard.js';
import { initFilterBar } from './components/FilterBar.js';
import { initEventModal } from './components/EventModal.js';

// ---------------------------------------------------------------------------
// Application State
// ---------------------------------------------------------------------------
const state = {
  events: [],
  searchQuery: '',
  selectedCategory: 'All',
  savedEventIds: new Set(JSON.parse(localStorage.getItem('eventpulse_saved') || '[]')),
  activeEventModalId: null,
  activeEmailReminderEventId: null,
  isDrawerOpen: false,
};

// ---------------------------------------------------------------------------
// DOM Element References
// ---------------------------------------------------------------------------
const el = {
  eventsGrid:        document.getElementById('events-grid'),
  emptyState:        document.getElementById('empty-state'),
  loadingState:      document.getElementById('loading-state'),
  errorState:        document.getElementById('error-state'),
  retryBtn:          document.getElementById('retry-btn'),
  resultsCount:      document.getElementById('results-count'),
  scheduleCount:     document.getElementById('schedule-count'),
  headerScheduleBtn: document.getElementById('header-schedule-btn'),

  // Drawer
  drawerBackdrop:  document.getElementById('schedule-drawer-backdrop'),
  drawerPanel:     document.querySelector('.drawer-panel'),
  drawerCloseBtn:  document.getElementById('drawer-close-btn'),
  drawerBody:      document.getElementById('drawer-body'),
  drawerCount:     document.getElementById('drawer-count'),

  // Email Reminder Modal
  emailModalBackdrop:  document.getElementById('email-modal-backdrop'),
  emailModalCard:      document.querySelector('#email-modal-backdrop .modal-content'),
  emailModalCloseBtn:  document.getElementById('email-modal-close-btn'),
  emailModalDismissBtn:document.getElementById('email-modal-dismiss-btn'),
  emailForm:           document.getElementById('email-reminder-form'),
  emailInput:          document.getElementById('reminder-email-input'),
  emailError:          document.getElementById('email-error-msg'),
  emailPreviewTitle:   document.getElementById('email-preview-event-title'),
  emailPreviewMeta:    document.getElementById('email-preview-meta'),

  // Accessibility & Toast
  announcer:      document.getElementById('sr-announcer'),
  toastContainer: document.getElementById('toast-container'),
};

// ---------------------------------------------------------------------------
// Accessibility Announcer
// ---------------------------------------------------------------------------
function announce(message) {
  if (!el.announcer) return;
  el.announcer.textContent = '';
  setTimeout(() => { el.announcer.textContent = message; }, 50);
}

// ---------------------------------------------------------------------------
// Toast Notification
// ---------------------------------------------------------------------------
function showToast(message, icon = icons.calendar) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `${icon} <span>${escapeHTML(message)}</span>`;
  el.toastContainer.appendChild(toast);
  announce(message);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 200ms ease';
    setTimeout(() => toast.remove(), 250);
  }, 3500);
}

// ---------------------------------------------------------------------------
// localStorage Persistence
// ---------------------------------------------------------------------------
function persistSaved() {
  localStorage.setItem('eventpulse_saved', JSON.stringify([...state.savedEventIds]));
}

// ---------------------------------------------------------------------------
// Loading / Error / Events UI state switcher
// ---------------------------------------------------------------------------
function showLoading() {
  el.loadingState.hidden = false;
  el.errorState.hidden   = true;
  el.eventsGrid.hidden   = true;
  el.emptyState.hidden   = true;
  el.resultsCount.textContent = 'Loading events\u2026';
}

function showError() {
  el.loadingState.hidden = true;
  el.errorState.hidden   = false;
  el.eventsGrid.hidden   = true;
  el.emptyState.hidden   = true;
  el.resultsCount.textContent = 'Could not load events';
}

function showEvents() {
  el.loadingState.hidden = true;
  el.errorState.hidden   = true;
  renderEvents();
}

// ---------------------------------------------------------------------------
// Render Event Cards
// ---------------------------------------------------------------------------
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

function renderEvents() {
  const filtered = getFilteredEvents();
  const countText = `Showing ${filtered.length} event${filtered.length === 1 ? '' : 's'}`;
  el.resultsCount.textContent = countText;

  if (filtered.length === 0) {
    el.eventsGrid.innerHTML = '';
    el.eventsGrid.hidden = true;
    el.emptyState.hidden = false;
    announce('No events found. Use Reset All Filters to view all events.');
    return;
  }

  el.emptyState.hidden = true;
  el.eventsGrid.hidden = false;
  el.eventsGrid.innerHTML = filtered
    .map(event => createEventCardHTML(event, state.savedEventIds.has(event.id)))
    .join('');
}

// ---------------------------------------------------------------------------
// Bookmark Toggle
// ---------------------------------------------------------------------------
function toggleBookmark(eventId) {
  if (!state.events.find(e => e.id === eventId)) return;

  if (state.savedEventIds.has(eventId)) {
    state.savedEventIds.delete(eventId);
    showToast('Removed from schedule', icons.close);
  } else {
    state.savedEventIds.add(eventId);
    showToast('Saved to My Schedule!', icons.bookmarkFilled);
  }

  persistSaved();
  el.scheduleCount.textContent = state.savedEventIds.size;
  renderEvents();
  renderScheduleDrawer();

  if (state.activeEventModalId === eventId) {
    eventModal.syncBookmark(eventId);
  }
}

// ---------------------------------------------------------------------------
// Schedule Drawer
// ---------------------------------------------------------------------------
let drawerTriggerElement = null;

function renderScheduleDrawer() {
  const savedEvents = state.events.filter(e => state.savedEventIds.has(e.id));
  el.drawerCount.textContent = `(${savedEvents.length})`;

  if (savedEvents.length === 0) {
    el.drawerBody.innerHTML = `
      <div class="drawer-empty">
        <div class="drawer-empty-icon" aria-hidden="true">${icons.bookmarkOutline}</div>
        <h4 style="font-weight:800;font-size:1.15rem;margin-bottom:0.35rem;">No saved events yet</h4>
        <p style="font-size:0.875rem;color:var(--color-text-muted);line-height:1.5;">
          Click the bookmark star on any event card to add it to your schedule.
        </p>
      </div>
    `;
    return;
  }

  el.drawerBody.innerHTML = `
    <ul class="drawer-list" aria-label="Saved events list">
      ${savedEvents.map(ev => `
        <li class="drawer-card">
          <div class="drawer-card-top">
            <span class="category-tag" data-cat="${ev.category}">${ev.category}</span>
            <button type="button" class="btn-remove-drawer" data-remove-id="${ev.id}"
              title="Remove from schedule"
              aria-label="Remove ${escapeHTML(ev.title)} from schedule">
              ${icons.trash}
            </button>
          </div>
          <h4 class="drawer-card-title">${escapeHTML(ev.title)}</h4>
          <div class="drawer-card-meta">
            <div style="display:flex;align-items:center;gap:0.4rem;">
              ${icons.calendar}
              <span>${formatDate(ev.date)} \u2022 ${ev.time}</span>
            </div>
            <div style="display:flex;align-items:center;gap:0.4rem;">
              ${icons.mapPin}
              <span>${escapeHTML(ev.location)}</span>
            </div>
          </div>
          <div class="drawer-card-actions">
            <button type="button" class="btn-action-primary" data-action="view-detail" data-id="${ev.id}"
              aria-label="View details for ${escapeHTML(ev.title)}">
              <span>View Details</span>
            </button>
            <button type="button" class="btn-action-email" data-email-reminder-id="${ev.id}"
              aria-label="Set email reminder for ${escapeHTML(ev.title)}">
              ${icons.mail}<span>Email Reminder</span>
            </button>
          </div>
        </li>
      `).join('')}
    </ul>
  `;
}

function openScheduleDrawer(triggerEl = null) {
  drawerTriggerElement = triggerEl || document.activeElement;
  renderScheduleDrawer();
  el.drawerBackdrop.hidden = false;
  el.drawerBackdrop.classList.add('is-open');
  el.headerScheduleBtn.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
  setTimeout(() => el.drawerCloseBtn.focus(), 50);
  state.isDrawerOpen = true;
  announce('Opened My Schedule drawer. Press Escape to close.');
}

function closeScheduleDrawer() {
  el.drawerBackdrop.classList.remove('is-open');
  el.drawerBackdrop.hidden = true;
  el.headerScheduleBtn.setAttribute('aria-expanded', 'false');
  if (!state.activeEventModalId && !state.activeEmailReminderEventId) {
    document.body.style.overflow = '';
  }
  state.isDrawerOpen = false;
  if (drawerTriggerElement && typeof drawerTriggerElement.focus === 'function') {
    drawerTriggerElement.focus();
  }
  announce('Closed My Schedule drawer');
}

// ---------------------------------------------------------------------------
// Email Reminder Modal
// ---------------------------------------------------------------------------
let emailTriggerElement = null;

function openEmailReminderModal(eventId, triggerEl = null) {
  const event = state.events.find(e => e.id === eventId);
  if (!event) return;

  emailTriggerElement = triggerEl || document.activeElement;
  state.activeEmailReminderEventId = eventId;
  el.emailPreviewTitle.textContent = event.title;
  el.emailPreviewMeta.textContent  =
    `${formatDate(event.date)} at ${event.time} \u2022 ${event.location}`;

  if (el.emailError) {
    el.emailError.textContent = '';
    el.emailError.hidden = true;
  }
  el.emailInput.removeAttribute('aria-invalid');
  el.emailInput.value = localStorage.getItem('eventpulse_user_email') || '';

  el.emailModalBackdrop.hidden = false;
  el.emailModalBackdrop.classList.add('is-open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => el.emailInput.focus(), 50);
  announce(`Open email reminder dialog for ${event.title}`);
}

function closeEmailReminderModal() {
  el.emailModalBackdrop.classList.remove('is-open');
  el.emailModalBackdrop.hidden = true;
  state.activeEmailReminderEventId = null;
  if (!state.isDrawerOpen && !state.activeEventModalId) {
    document.body.style.overflow = '';
  }
  if (emailTriggerElement && typeof emailTriggerElement.focus === 'function') {
    emailTriggerElement.focus();
  }
  announce('Closed email reminder dialog');
}

function handleEmailSubmit(e) {
  e.preventDefault();
  const email = el.emailInput.value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || !emailRegex.test(email)) {
    if (el.emailError) {
      el.emailError.textContent = 'Please enter a valid email address (e.g. name@university.edu).';
      el.emailError.hidden = false;
    }
    el.emailInput.setAttribute('aria-invalid', 'true');
    el.emailInput.focus();
    announce('Validation error: Please enter a valid email address.');
    return;
  }

  const event = state.events.find(ev => ev.id === state.activeEmailReminderEventId);
  if (!event) return;

  localStorage.setItem('eventpulse_user_email', email);

  const subject = encodeURIComponent(`\uD83D\uDCC5 Reminder: ${event.title}`);
  const body = encodeURIComponent(
    `Hi,\n\nHere is your campus event reminder for:\n` +
    `\uD83D\uDCCC Event: ${event.title}\n` +
    `\uD83D\uDDD3 Date & Time: ${formatDate(event.date)} at ${event.time}\n` +
    `\uD83D\uDCCD Location: ${event.location}\n` +
    `\uD83D\uDC65 Organizer: ${event.organizer}\n\n` +
    `About: ${event.description}\n\n` +
    `\u2014 EventPulse Campus Tech Event Finder`
  );

  window.location.href = `mailto:${encodeURIComponent(email)}?subject=${subject}&body=${body}`;
  closeEmailReminderModal();
  showToast(`Reminder created for ${email}!`, icons.check);
}

// ---------------------------------------------------------------------------
// Init Event Modal component
// ---------------------------------------------------------------------------
let eventModal;

function setupEventModal() {
  eventModal = initEventModal({
    getEventById:     id => state.events.find(e => e.id === id),
    getActiveModalId: () => state.activeEventModalId,
    setActiveModalId: id => { state.activeEventModalId = id; },
    isSaved:          id => state.savedEventIds.has(id),
    onBookmarkToggle: toggleBookmark,
    onOpenEmailModal: openEmailReminderModal,
    announce,
    trapFocus,
    isDrawerOpen:     () => state.isDrawerOpen,
    isEmailModalOpen: () => !!state.activeEmailReminderEventId,
  });
}

// ---------------------------------------------------------------------------
// Event Listeners
// ---------------------------------------------------------------------------
function initEventListeners() {
  // Header schedule button opens drawer
  el.headerScheduleBtn.addEventListener('click', e => openScheduleDrawer(e.currentTarget));
  el.drawerCloseBtn.addEventListener('click', closeScheduleDrawer);
  el.drawerBackdrop.addEventListener('click', e => {
    if (e.target === el.drawerBackdrop) closeScheduleDrawer();
  });

  // Drawer body delegation (remove, email reminder, view detail)
  el.drawerBody.addEventListener('click', e => {
    const removeBtn = e.target.closest('[data-remove-id]');
    if (removeBtn) { toggleBookmark(removeBtn.dataset.removeId); return; }

    const emailBtn = e.target.closest('[data-email-reminder-id]');
    if (emailBtn) { openEmailReminderModal(emailBtn.dataset.emailReminderId, emailBtn); return; }

    const detailBtn = e.target.closest('[data-action="view-detail"]');
    if (detailBtn) eventModal.open(detailBtn.dataset.id, detailBtn);
  });

  // Email modal
  el.emailForm.addEventListener('submit', handleEmailSubmit);
  el.emailModalCloseBtn.addEventListener('click', closeEmailReminderModal);
  el.emailModalDismissBtn.addEventListener('click', closeEmailReminderModal);
  el.emailModalBackdrop.addEventListener('click', e => {
    if (e.target === el.emailModalBackdrop) closeEmailReminderModal();
  });

  // Events grid delegation (bookmark + view detail)
  el.eventsGrid.addEventListener('click', e => {
    const bookmarkBtn = e.target.closest('.bookmark-toggle');
    if (bookmarkBtn) { toggleBookmark(bookmarkBtn.dataset.id); return; }

    const detailBtn = e.target.closest('[data-action="view-detail"]');
    if (detailBtn) eventModal.open(detailBtn.dataset.id, detailBtn);
  });

  // Retry button on error state
  if (el.retryBtn) {
    el.retryBtn.addEventListener('click', () => loadEvents());
  }

  // Global keyboard: Escape + Focus Traps
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (state.activeEmailReminderEventId) { closeEmailReminderModal(); }
      else if (state.activeEventModalId)    { eventModal.close(); }
      else if (state.isDrawerOpen)          { closeScheduleDrawer(); }
      return;
    }
    if (state.activeEmailReminderEventId) {
      trapFocus(el.emailModalCard, e);
    } else if (state.activeEventModalId) {
      trapFocus(eventModal.getContainer(), e);
    } else if (state.isDrawerOpen) {
      trapFocus(el.drawerPanel, e);
    }
  });
}

// ---------------------------------------------------------------------------
// Data Fetching (Week 2 — replaces static import)
// ---------------------------------------------------------------------------
async function loadEvents() {
  showLoading();
  try {
    const res = await fetch('/data/events.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    state.events = await res.json();
    showEvents();
    announce(`Loaded ${state.events.length} events.`);
  } catch (err) {
    console.error('EventPulse: failed to load events.json', err);
    showError();
    announce('Failed to load events. Please try again.');
  }
}

// ---------------------------------------------------------------------------
// App Initialisation
// ---------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  setupEventModal();

  // Init FilterBar — it drives state.searchQuery & state.selectedCategory
  initFilterBar(({ query, category }) => {
    state.searchQuery    = query;
    state.selectedCategory = category;
    if (state.events.length > 0) renderEvents();
  }, announce);

  el.scheduleCount.textContent = state.savedEventIds.size;

  loadEvents();
});

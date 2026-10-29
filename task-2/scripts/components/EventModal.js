/**
 * EventModal Component
 * Owns all Event Detail modal DOM logic:
 * open, close, populate content, focus trap, Escape dismissal, focus restoration.
 */

import { icons } from '../icons.js';
import { escapeHTML, formatDate } from '../utils.js';

/**
 * @param {Object}   deps
 * @param {Function} deps.getEventById        - (id: string) => event | undefined
 * @param {Function} deps.getActiveModalId    - () => string | null
 * @param {Function} deps.setActiveModalId    - (id: string | null) => void
 * @param {Function} deps.isSaved             - (id: string) => boolean
 * @param {Function} deps.onBookmarkToggle    - (id: string) => void
 * @param {Function} deps.onOpenEmailModal    - (id: string, triggerEl: Element) => void
 * @param {Function} deps.announce            - Accessibility announcer
 * @param {Function} deps.trapFocus           - (container: Element, event: KeyboardEvent) => void
 * @param {Function} deps.isDrawerOpen        - () => boolean
 * @param {Function} deps.isEmailModalOpen    - () => boolean
 */
export function initEventModal({
  getEventById,
  getActiveModalId,
  setActiveModalId,
  isSaved,
  onBookmarkToggle,
  onOpenEmailModal,
  announce,
  trapFocus,
  isDrawerOpen,
  isEmailModalOpen,
}) {
  const backdrop      = document.getElementById('event-modal-backdrop');
  const modalCard     = backdrop.querySelector('.modal-content');
  const closeBtn      = document.getElementById('modal-close-btn');
  const dismissBtn    = document.getElementById('modal-dismiss-btn');
  const bookmarkBtn   = document.getElementById('modal-bookmark-btn');
  const remindBtn     = document.getElementById('modal-remind-btn');
  const titleEl       = document.getElementById('modal-title');
  const categoryEl    = document.getElementById('modal-category');
  const dateEl        = document.getElementById('modal-date');
  const timeEl        = document.getElementById('modal-time');
  const locationEl    = document.getElementById('modal-location');
  const organizerEl   = document.getElementById('modal-organizer');
  const descriptionEl = document.getElementById('modal-description');
  const prerequisitesEl = document.getElementById('modal-prerequisites');
  const tagsEl        = document.getElementById('modal-tags');

  let triggerElement = null;

  function syncBookmarkButton(eventId) {
    const saved = isSaved(eventId);
    bookmarkBtn.setAttribute('aria-pressed', saved);
    const icon  = saved ? icons.bookmarkFilled : icons.bookmarkOutline;
    const label = saved ? 'Saved to Schedule' : 'Save to Schedule';
    bookmarkBtn.innerHTML = `${icon} <span>${label}</span>`;
  }

  function openModal(eventId, triggerEl = null) {
    const event = getEventById(eventId);
    if (!event) return;

    triggerElement = triggerEl || document.activeElement;
    setActiveModalId(eventId);

    titleEl.textContent        = event.title;
    categoryEl.textContent     = event.category;
    categoryEl.setAttribute('data-cat', event.category);
    dateEl.textContent         = formatDate(event.date);
    timeEl.textContent         = event.time;
    locationEl.textContent     = event.location;
    organizerEl.textContent    = event.organizer;
    descriptionEl.textContent  = event.description;
    prerequisitesEl.textContent = event.prerequisites || 'None';

    tagsEl.innerHTML = event.tags
      .map(tag => `<li class="tag-item">#${escapeHTML(tag)}</li>`)
      .join('');

    syncBookmarkButton(eventId);

    backdrop.hidden = false;
    backdrop.classList.add('is-open');
    document.body.style.overflow = 'hidden';

    setTimeout(() => closeBtn.focus(), 50);
    announce(`Opened details dialog for ${event.title}. Press Escape to close.`);
  }

  function closeModal() {
    const activeId = getActiveModalId();
    if (!activeId) return;

    backdrop.classList.remove('is-open');
    backdrop.hidden = true;

    if (!isDrawerOpen() && !isEmailModalOpen()) {
      document.body.style.overflow = '';
    }

    setActiveModalId(null);

    if (triggerElement && typeof triggerElement.focus === 'function') {
      triggerElement.focus();
    }
    announce('Closed event details dialog.');
  }

  // --- Event Listeners ---
  closeBtn.addEventListener('click', closeModal);
  dismissBtn.addEventListener('click', closeModal);

  bookmarkBtn.addEventListener('click', () => {
    const activeId = getActiveModalId();
    if (activeId) {
      onBookmarkToggle(activeId);
      syncBookmarkButton(activeId);
    }
  });

  remindBtn.addEventListener('click', e => {
    const activeId = getActiveModalId();
    if (activeId) onOpenEmailModal(activeId, e.currentTarget);
  });

  backdrop.addEventListener('click', e => {
    if (e.target === backdrop) closeModal();
  });

  // Public API
  return {
    open: openModal,
    close: closeModal,
    syncBookmark: syncBookmarkButton,
    getContainer: () => modalCard,
  };
}

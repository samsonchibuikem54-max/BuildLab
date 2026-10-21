/**
 * Shared utility helpers used across multiple modules.
 */

/**
 * Safely escapes a string for insertion into HTML to prevent XSS.
 * @param {string} str
 * @returns {string}
 */
export function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Formats an ISO date string (YYYY-MM-DD) into a readable short date.
 * e.g. "2026-10-24" -> "Sat, Oct 24"
 * @param {string} isoDate
 * @returns {string}
 */
export function formatDate(isoDate) {
  const options = { weekday: 'short', month: 'short', day: 'numeric' };
  const d = new Date(isoDate + 'T00:00:00');
  return d.toLocaleDateString(undefined, options);
}

/**
 * Universal focus trap for dialogs and drawers.
 * Call this from a keydown handler when a dialog/drawer is open.
 * @param {Element} containerElement - The dialog or drawer container
 * @param {KeyboardEvent} event
 */
export function trapFocus(containerElement, event) {
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
  const lastFocusable  = focusables[focusables.length - 1];

  if (event.shiftKey) {
    if (document.activeElement === firstFocusable || !containerElement.contains(document.activeElement)) {
      event.preventDefault();
      lastFocusable.focus();
    }
  } else {
    if (document.activeElement === lastFocusable || !containerElement.contains(document.activeElement)) {
      event.preventDefault();
      firstFocusable.focus();
    }
  }
}

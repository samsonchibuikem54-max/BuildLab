/**
 * EventCard Component
 * Pure function — returns the HTML string for a single event card.
 * Has no DOM side effects, making it easy to test and reuse.
 */

import { icons } from '../icons.js';
import { escapeHTML, formatDate } from '../utils.js';

/**
 * @param {Object} event       - Event data object
 * @param {boolean} isBookmarked - Whether the event is currently bookmarked
 * @returns {string} HTML string for a <li> containing an <article> event card
 */
export function createEventCardHTML(event, isBookmarked) {
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
            aria-label="${isBookmarked ? 'Remove ' + escapeHTML(event.title) + ' from my schedule' : 'Save ' + escapeHTML(event.title) + ' to my schedule'}">
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
}

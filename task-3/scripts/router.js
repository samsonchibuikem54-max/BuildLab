/**
 * EventPulse — Hash Router (Task 3)
 * Handles client-side hash routing:
 *   - #/ or empty: Default list view
 *   - #/event/:id: Deep-link to event details modal
 *   - #/schedule: Deep-link to saved schedule drawer
 */

export function initRouter({ onRouteHome, onRouteEvent, onRouteSchedule, onRouteNotFound }) {
  function handleHashChange() {
    const rawHash = window.location.hash.trim();
    const hash = rawHash.startsWith('#') ? rawHash.slice(1) : rawHash;
    const cleanPath = hash.startsWith('/') ? hash : '/' + hash;

    if (cleanPath === '/' || cleanPath === '') {
      onRouteHome();
      return;
    }

    if (cleanPath === '/schedule') {
      onRouteSchedule();
      return;
    }

    const eventMatch = cleanPath.match(/^\/event\/([a-zA-Z0-9_-]+)$/);
    if (eventMatch) {
      const eventId = eventMatch[1];
      onRouteEvent(eventId);
      return;
    }

    // Unmatched hash pattern
    onRouteNotFound(cleanPath);
  }

  window.addEventListener('hashchange', handleHashChange);

  // Return helper methods to programmatically navigate
  return {
    start: () => handleHashChange(),
    navigateHome: () => {
      if (window.location.hash !== '' && window.location.hash !== '#/' && window.location.hash !== '#') {
        history.pushState(null, '', '#/');
      }
    },
    navigateEvent: (id) => {
      const target = `#/event/${id}`;
      if (window.location.hash !== target) {
        history.pushState(null, '', target);
      }
    },
    navigateSchedule: () => {
      const target = `#/schedule`;
      if (window.location.hash !== target) {
        history.pushState(null, '', target);
      }
    }
  };
}

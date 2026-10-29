/**
 * FilterBar Component
 * Owns all search input and category pill filter interactions.
 * Calls onFilterChange({ query, category }) on every user interaction.
 */

/**
 * @param {Function} onFilterChange - Callback: ({ query: string, category: string }) => void
 * @param {Function} announce       - Accessibility announcer function
 * @returns {{ resetFilters: Function }} - Public API to reset filters from outside
 */
export function initFilterBar(onFilterChange, announce) {
  const searchInput    = document.getElementById('search-input');
  const filterButtons  = document.querySelectorAll('.filter-btn');
  const resetFiltersBtn = document.getElementById('reset-filters-btn');
  const resultsCount   = document.getElementById('results-count');

  // Internal state owned by this module
  let currentQuery    = '';
  let currentCategory = 'All';

  function notifyChange() {
    onFilterChange({ query: currentQuery, category: currentCategory });
  }

  // Real-time search
  searchInput.addEventListener('input', e => {
    currentQuery = e.target.value;
    notifyChange();
  });

  // Category pill buttons
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.setAttribute('aria-pressed', 'false'));
      btn.setAttribute('aria-pressed', 'true');
      currentCategory = btn.dataset.category;
      notifyChange();
      if (announce) {
        const count = resultsCount ? resultsCount.textContent : '';
        announce(`Filtered by ${currentCategory} events. ${count}`);
      }
    });
  });

  // Reset all filters
  resetFiltersBtn.addEventListener('click', () => {
    currentQuery    = '';
    currentCategory = 'All';
    searchInput.value = '';

    filterButtons.forEach(b => {
      b.setAttribute('aria-pressed', b.dataset.category === 'All' ? 'true' : 'false');
    });

    notifyChange();
    searchInput.focus();
    if (announce) announce('Filters reset. Showing all events.');
  });

  // Public API
  return {
    resetFilters() {
      resetFiltersBtn.click();
    }
  };
}

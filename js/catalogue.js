// Catalogue filter + search — Storiel errand zone.
// Conventional, immediate, no ceremony. See STORIEL_BRIEF.md §3, §7.

const grid = document.getElementById('catalogue-grid');
const cards = Array.from(grid.querySelectorAll('.catalogue-card'));
const searchInput = document.getElementById('catalogue-search');
const filterButtons = Array.from(document.querySelectorAll('.filter-chip'));
const emptyMessage = document.getElementById('catalogue-empty');

let activeOccasion = 'all';

function applyFilters() {
  const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
  let visibleCount = 0;

  cards.forEach((card) => {
    const matchesOccasion = activeOccasion === 'all' || card.dataset.occasion === activeOccasion;
    const matchesSearch = query === '' || card.dataset.search.includes(query);
    const visible = matchesOccasion && matchesSearch;
    card.hidden = !visible;
    if (visible) visibleCount += 1;
  });

  emptyMessage.hidden = visibleCount > 0;
}

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    activeOccasion = button.dataset.occasion;
    filterButtons.forEach((b) => b.classList.toggle('is-active', b === button));
    applyFilters();
  });
});

if (searchInput) searchInput.addEventListener('input', applyFilters);

// Category page: client-side filter over the numbered index.
const root = document.querySelector<HTMLElement>('[data-filter]');
const input = root?.querySelector<HTMLInputElement>('[data-filter-input]');
const statusEl = root?.querySelector<HTMLElement>('[data-filter-status]');
const empty = document.querySelector<HTMLElement>('[data-filter-empty]');
const items = Array.from(document.querySelectorAll<HTMLElement>('[data-filter-item]'));

if (root && input) {
  root.hidden = false; // needs JS, so it is only revealed when JS runs
  input.addEventListener('input', () => {
    const terms = input.value.toLowerCase().split(/\s+/).filter(Boolean);
    let shown = 0;
    for (const item of items) {
      const text = item.dataset.filterText ?? '';
      const match = terms.every((term) => text.includes(term));
      item.hidden = !match;
      if (match) shown++;
    }
    if (empty) empty.hidden = shown > 0;
    if (statusEl) statusEl.textContent = terms.length ? `${shown} of ${items.length} shown` : '';
  });
}

export {};

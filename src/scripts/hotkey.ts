// "/" focuses the search box on every page (unless the user is already typing).
document.addEventListener('keydown', (event) => {
  if (event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey) return;
  const target = event.target as HTMLElement | null;
  if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
  const input = document.querySelector<HTMLInputElement>('[data-search-input]');
  if (!input) return;
  event.preventDefault();
  input.focus();
  input.select();
});

export {};

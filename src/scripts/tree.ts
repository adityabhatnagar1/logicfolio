// Sidebar: category rows expand to their component lists.
document.addEventListener('click', (event) => {
  const toggle = (event.target as Element).closest<HTMLButtonElement>('[data-tree-toggle]');
  if (!toggle) return;
  const wasOpen = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!wasOpen));
  const list = document.getElementById(toggle.getAttribute('aria-controls') ?? '');
  if (list) list.hidden = wasOpen;
});

export {};

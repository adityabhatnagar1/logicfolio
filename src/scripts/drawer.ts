// Mobile drawer for the archive sidebar: focus trap, Esc to close, backdrop click, focus restore.
const aside = document.querySelector<HTMLElement>('#archive-nav');
const backdrop = document.querySelector<HTMLElement>('[data-drawer-backdrop]');
const openers = document.querySelectorAll<HTMLElement>('[data-drawer-open]');
const closer = document.querySelector<HTMLElement>('[data-drawer-close]');
const inertTargets = document.querySelectorAll<HTMLElement>('[data-drawer-inert]');
const isHome = document.body.classList.contains('shell--home');

let lastOpener: HTMLElement | null = null;

const isOpen = () => aside?.classList.contains('is-open') ?? false;

function focusables(): HTMLElement[] {
  if (!aside) return [];
  return Array.from(aside.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')).filter(
    (el) => el.getClientRects().length > 0,
  );
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    event.preventDefault();
    close();
    return;
  }
  if (event.key !== 'Tab') return;
  const items = focusables();
  const first = items[0];
  const last = items[items.length - 1];
  if (!first || !last) return;
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  } else if (!aside?.contains(document.activeElement)) {
    event.preventDefault();
    first.focus();
  }
}

function open(opener: HTMLElement): void {
  if (!aside || isOpen()) return;
  lastOpener = opener;
  aside.classList.add('is-open');
  aside.setAttribute('role', 'dialog');
  aside.setAttribute('aria-modal', 'true');
  aside.setAttribute('aria-label', 'Browse the archive');
  if (backdrop) backdrop.hidden = false;
  inertTargets.forEach((el) => (el.inert = true));
  openers.forEach((el) => el.setAttribute('aria-expanded', 'true'));
  document.documentElement.classList.add('drawer-lock');
  document.addEventListener('keydown', onKeydown);
  (closer ?? focusables()[0])?.focus();
}

function close(restoreFocus = true): void {
  if (!aside || !isOpen()) return;
  aside.classList.remove('is-open');
  aside.removeAttribute('role');
  aside.removeAttribute('aria-modal');
  aside.removeAttribute('aria-label');
  if (backdrop) backdrop.hidden = true;
  inertTargets.forEach((el) => (el.inert = false));
  openers.forEach((el) => el.setAttribute('aria-expanded', 'false'));
  document.documentElement.classList.remove('drawer-lock');
  document.removeEventListener('keydown', onKeydown);
  if (restoreFocus) lastOpener?.focus();
}

openers.forEach((el) => el.addEventListener('click', () => (isOpen() ? close() : open(el))));
closer?.addEventListener('click', () => close());
backdrop?.addEventListener('click', () => close());

// The sidebar is permanent on wide non-home pages, so a stale open drawer must not linger.
if (!isHome) {
  window.matchMedia('(min-width: 64em)').addEventListener('change', (e) => {
    if (e.matches) close(false);
  });
}

export {};

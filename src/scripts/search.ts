// Search page: Pagefind (built into dist/pagefind by `npm run build`) with category filters,
// ?q= / ?category= URL sync and keyboard navigation. No Pagefind default UI.
interface PagefindResultData {
  url: string;
  excerpt: string;
  meta: Record<string, string | undefined>;
}
interface PagefindResult {
  data(): Promise<PagefindResultData>;
}
interface PagefindResponse {
  results: PagefindResult[];
}
interface PagefindModule {
  search(term: string | null, options?: { filters?: Record<string, string> }): Promise<PagefindResponse>;
}
type SearchState = 'idle' | 'searching' | 'results' | 'empty' | 'error' | 'no-index';

const PAGE_SIZE = 20;

const root = document.querySelector<HTMLElement>('[data-search-page]');
const form = root?.querySelector<HTMLFormElement>('[data-search-form]');
const input = root?.querySelector<HTMLInputElement>('input[name="q"]');
const status = root?.querySelector<HTMLElement>('[data-search-status]');
const countEl = root?.querySelector<HTMLElement>('[data-filter-count]');
const list = root?.querySelector<HTMLElement>('[data-search-results]');
const template = root?.querySelector<HTMLTemplateElement>('[data-result-template]');
const moreWrap = root?.querySelector<HTMLElement>('[data-more-wrap]');
const moreButton = root?.querySelector<HTMLButtonElement>('[data-more]');
const retryButton = root?.querySelector<HTMLButtonElement>('[data-retry]');
const chips = root ? [...root.querySelectorAll<HTMLButtonElement>('[data-filter-chip]')] : [];

if (root && form && input && status && countEl && list && template && moreWrap && moreButton) {
  const base = root.dataset.base ?? '';
  let loader: Promise<PagefindModule> | null = null;
  let latest = 0;
  let timer = 0;
  let category = '';
  let pending: PagefindResult[] = [];
  let shown = 0;
  let total = 0;

  const load = (): Promise<PagefindModule> => (loader ??= import(/* @vite-ignore */ `${base}/pagefind/pagefind.js`) as Promise<PagefindModule>);
  const setState = (state: SearchState): void => {
    root.dataset.state = state;
  };
  const chipFor = (slug: string): HTMLButtonElement | undefined => chips.find((c) => (c.dataset.slug ?? '') === slug);
  const plural = (n: number): string => `${n} result${n === 1 ? '' : 's'}`;

  function setCategory(slug: string): void {
    category = chipFor(slug) ? slug : '';
    for (const chip of chips) chip.setAttribute('aria-pressed', (chip.dataset.slug ?? '') === category ? 'true' : 'false');
  }

  function syncUrl(): void {
    const next = new URL(location.href);
    const q = input!.value.trim();
    if (q) next.searchParams.set('q', q);
    else next.searchParams.delete('q');
    if (category) next.searchParams.set('category', category);
    else next.searchParams.delete('category');
    history.replaceState(null, '', next);
  }

  function renderExcerpt(target: HTMLElement, html: string): void {
    // Pagefind excerpts only contain text and <mark>; rebuild them node by node.
    const doc = new DOMParser().parseFromString(html, 'text/html');
    target.replaceChildren();
    doc.body.childNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName === 'MARK') {
        const mark = document.createElement('mark');
        mark.textContent = node.textContent;
        target.append(mark);
      } else {
        target.append(document.createTextNode(node.textContent ?? ''));
      }
    });
  }

  function renderItem(item: PagefindResultData, position: number): HTMLElement | null {
    const card = template!.content.firstElementChild?.cloneNode(true) as HTMLElement | undefined;
    if (!card) return null;
    const pick = <T extends HTMLElement>(sel: string): T | null => card.querySelector<T>(sel);
    const num = pick('[data-result-num]');
    const link = pick<HTMLAnchorElement>('[data-result-link]');
    const cat = pick('[data-result-category]');
    const sep = pick('[data-result-sep]');
    const date = pick<HTMLTimeElement>('[data-result-date]');
    const excerpt = pick('[data-result-excerpt]');
    const thumb = pick('[data-result-thumb]');
    const img = pick<HTMLImageElement>('[data-result-thumb-img]');
    if (num) num.textContent = String(position).padStart(2, '0');
    if (link) {
      link.href = base + (item.url.startsWith('/') ? item.url : `/${item.url}`);
      link.textContent = item.meta.title ?? item.url;
    }
    if (cat) cat.textContent = item.meta.category ?? '';
    if (date) {
      date.textContent = item.meta.updated ?? '';
      if (item.meta.updated) date.dateTime = item.meta.updated;
    }
    if (sep && (!item.meta.category || !item.meta.updated)) sep.hidden = true;
    if (excerpt) renderExcerpt(excerpt, item.excerpt);
    const thumbUrl = item.meta.thumb;
    if (thumb && img && thumbUrl) {
      img.addEventListener('error', () => {
        thumb.hidden = true;
      });
      img.src = base + thumbUrl;
      thumb.hidden = false;
    }
    return card;
  }

  async function showMore(): Promise<void> {
    const mine = latest;
    const batch = pending.slice(shown, shown + PAGE_SIZE);
    const data = await Promise.all(batch.map((r) => r.data()));
    if (mine !== latest) return;
    data.forEach((item, i) => {
      const card = renderItem(item, shown + i + 1);
      if (card) list!.append(card);
    });
    shown += batch.length;
    moreWrap!.hidden = shown >= total;
    const q = input!.value.trim();
    const where = category ? ` in ${chipFor(category)?.dataset.value ?? category}` : '';
    status!.textContent = `Showing ${shown} of ${plural(total)}${q ? ` for “${q}”` : ''}${where}.`;
  }

  async function updateChipCounts(pagefind: PagefindModule, query: string, mine: number): Promise<void> {
    const counted = await Promise.all(
      chips.map(async (chip) => {
        const value = chip.dataset.value ?? '';
        if (!value) return { chip, n: -1 };
        const found = await pagefind.search(query || null, { filters: { category: value } });
        return { chip, n: found.results.length };
      }),
    );
    if (mine !== latest) return;
    const sum = counted.reduce((n, c) => n + Math.max(c.n, 0), 0);
    for (const { chip, n } of counted) {
      const el = chip.querySelector<HTMLElement>('[data-chip-count]');
      if (el) el.textContent = String(n < 0 ? sum : n);
    }
  }

  async function run(): Promise<void> {
    const query = input!.value.trim();
    const mine = ++latest;
    list!.replaceChildren();
    moreWrap!.hidden = true;
    countEl!.textContent = '';
    if (!query && !category) {
      status!.textContent = '';
      setState('idle');
      return;
    }
    if (import.meta.env.DEV) {
      status!.textContent = 'Search needs a built index.';
      setState('no-index');
      return;
    }
    setState('searching');
    status!.textContent = 'Searching…';
    try {
      const pagefind = await load();
      const filterValue = category ? chipFor(category)?.dataset.value : undefined;
      const found = await pagefind.search(query || null, filterValue ? { filters: { category: filterValue } } : undefined);
      if (mine !== latest) return;
      pending = found.results;
      total = pending.length;
      shown = 0;
      void updateChipCounts(pagefind, query, mine);
      countEl!.textContent = plural(total);
      if (total === 0) {
        status!.textContent = query ? `No results for “${query}”.` : 'No results.';
        setState('empty');
        return;
      }
      await showMore();
      if (mine === latest) setState('results');
    } catch {
      if (mine !== latest) return;
      loader = null;
      status!.textContent = 'Search is not available right now.';
      setState('error');
    }
  }

  function update(): void {
    syncUrl();
    void run();
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    window.clearTimeout(timer);
    update();
  });
  input.addEventListener('input', () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(update, 200);
  });
  for (const chip of chips) {
    chip.addEventListener('click', () => {
      setCategory(chip.dataset.slug ?? '');
      update();
    });
  }
  moreButton.addEventListener('click', () => void showMore());
  retryButton?.addEventListener('click', update);

  root.addEventListener('keydown', (event) => {
    const target = event.target as HTMLElement;
    const links = [...list.querySelectorAll<HTMLAnchorElement>('[data-result-link]')];
    if (event.key === 'Escape') {
      if (!input.value) return;
      event.preventDefault();
      window.clearTimeout(timer);
      input.value = '';
      input.focus();
      update();
      return;
    }
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    if (links.length === 0) return;
    const index = target instanceof HTMLAnchorElement ? links.indexOf(target) : -1;
    if (target === input && event.key === 'ArrowDown') {
      event.preventDefault();
      links[0]?.focus();
    } else if (index >= 0) {
      event.preventDefault();
      if (event.key === 'ArrowDown') links[Math.min(index + 1, links.length - 1)]?.focus();
      else if (index === 0) input.focus();
      else links[index - 1]?.focus();
    }
  });

  const params = new URLSearchParams(location.search);
  input.value = params.get('q') ?? '';
  setCategory(params.get('category') ?? '');
  void run();
}

export {};

// Copy buttons on every code block. "Copied" is announced through the #a11y-live region.
const live = document.getElementById('a11y-live');

function announce(message: string): void {
  if (!live) return;
  live.textContent = '';
  window.setTimeout(() => (live.textContent = message), 50);
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.append(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  }
}

document.addEventListener('click', async (event) => {
  const button = (event.target as Element).closest<HTMLButtonElement>('[data-copy]');
  const pre = button?.closest('.codeblock')?.querySelector('pre');
  if (!button || !pre) return;
  const ok = await copyText(pre.textContent ?? '');
  announce(ok ? 'Copied' : 'Copy failed');
  button.textContent = ok ? 'Copied' : 'Failed';
  window.setTimeout(() => (button.textContent = 'Copy'), 2000);
});

export {};

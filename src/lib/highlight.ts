import { codeToHtml } from 'shiki';

/** High-contrast pair so code passes WCAG AA on --code-bg in both themes. */
export const SHIKI_THEMES = {
  light: 'github-light-high-contrast',
  dark: 'github-dark-high-contrast',
} as const;

export const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Highlighted code block with a filename bar and a copy button (wired in scripts/copy.ts). */
export async function renderCode(code: string, filename: string, lang = 'verilog'): Promise<string> {
  const pre = await codeToHtml(code.replace(/\s+$/, ''), { lang, themes: SHIKI_THEMES, defaultColor: false });
  const name = escapeHtml(filename);
  return (
    `<div class="codeblock"><div class="codeblock-bar" data-pagefind-ignore>` +
    `<span class="meta">${name}</span>` +
    `<button type="button" class="copy-btn" data-copy aria-label="Copy ${name} to clipboard">Copy</button>` +
    `</div>${pre}</div>`
  );
}

// Reads archive/ with Node fs at build time. Folders are the only source of truth:
// add or delete a folder and pages, sidebar entries and counts follow.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { url } from './paths';

const ARCHIVE_DIR = path.resolve(process.cwd(), 'archive');
const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']);
const byName = (a: string, b: string) => a.localeCompare(b, 'en', { numeric: true });

export interface SourceFile { name: string; code: string }
export interface NoteFile { name: string; text: string; format: 'md' | 'txt' }
export interface AssetFile { name: string; kind: 'image' | 'pdf'; absolutePath: string }

export interface Component {
  slug: string;
  name: string;
  categorySlug: string;
  categoryName: string;
  designs: SourceFile[];
  testbenches: SourceFile[];
  readme: string | null;
  notes: NoteFile[];
  assets: AssetFile[];
  /** First meaningful README line, shown in indexes. */
  summary: string;
  /** Last git commit date of the folder; file mtime when git has nothing. */
  updated: Date;
}

export interface Category { slug: string; name: string; components: Component[] }

export function titleCase(slug: string): string {
  return slug
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

const stripInline = (s: string) =>
  s.replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[*_`$]/g, '').replace(/\s+/g, ' ').trim();
const truncate = (s: string, max = 140) => (s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s);

/** First non-heading prose line of a README; falls back to the first heading. */
export function summarise(markdown: string): string {
  let heading = '';
  let inFence = false;
  for (const raw of markdown.split(/\r?\n/)) {
    const line = raw.trim();
    if (/^(```|~~~)/.test(line)) { inFence = !inFence; continue; }
    if (inFence || !line) continue;
    if (line.startsWith('#')) { heading ||= stripInline(line.replace(/^#+\s*/, '')); continue; }
    if (/^(\$\$|---|\||>|[-*+]\s|\d+\.\s)/.test(line)) continue;
    const text = stripInline(line);
    if (text) return truncate(text);
  }
  return truncate(heading);
}

function lastCommitDate(dir: string): Date | null {
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cI', '--', dir], {
      cwd: process.cwd(),
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    const date = new Date(out);
    return out && !Number.isNaN(date.getTime()) ? date : null;
  } catch {
    return null;
  }
}

function newestMtime(dir: string): Date {
  let newest = fs.statSync(dir).mtimeMs;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isFile()) newest = Math.max(newest, fs.statSync(path.join(dir, entry.name)).mtimeMs);
  }
  return new Date(newest);
}

function listDirs(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith('.') && !e.name.startsWith('_'))
    .map((e) => e.name)
    .sort(byName);
}

function loadComponent(category: { slug: string; name: string }, slug: string): Component {
  const dir = path.join(ARCHIVE_DIR, category.slug, slug);
  const designs: SourceFile[] = [];
  const testbenches: SourceFile[] = [];
  const notes: NoteFile[] = [];
  const assets: AssetFile[] = [];
  let readme: string | null = null;

  const files = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isFile() && !e.name.startsWith('.'))
    .map((e) => e.name)
    .sort(byName);

  for (const name of files) {
    const absolutePath = path.join(dir, name);
    const ext = path.extname(name).toLowerCase();
    if (ext === '.v') {
      const code = fs.readFileSync(absolutePath, 'utf8');
      (code.includes('$dumpfile') ? testbenches : designs).push({ name, code });
    } else if (name.toLowerCase() === 'readme.md') {
      readme = fs.readFileSync(absolutePath, 'utf8');
    } else if (ext === '.md' || ext === '.txt') {
      notes.push({ name, text: fs.readFileSync(absolutePath, 'utf8'), format: ext === '.md' ? 'md' : 'txt' });
    } else if (ext === '.pdf') {
      assets.push({ name, kind: 'pdf', absolutePath });
    } else if (IMAGE_EXT.has(ext)) {
      assets.push({ name, kind: 'image', absolutePath });
    }
  }

  return {
    slug,
    name: titleCase(slug),
    categorySlug: category.slug,
    categoryName: category.name,
    designs,
    testbenches,
    readme,
    notes,
    assets,
    summary: readme ? summarise(readme) : '',
    updated: lastCommitDate(dir) ?? newestMtime(dir),
  };
}

let cache: Category[] | null = null;

/** Categories with at least one component, alphabetical. Re-read on every call in dev. */
export function getCategories(): Category[] {
  if (cache && !import.meta.env.DEV) return cache;
  cache = listDirs(ARCHIVE_DIR)
    .map((slug) => {
      const category = { slug, name: titleCase(slug) };
      const components = listDirs(path.join(ARCHIVE_DIR, slug)).map((c) => loadComponent(category, c));
      return { ...category, components };
    })
    .filter((category) => category.components.length > 0);
  return cache;
}

export const getCategory = (slug: string) => getCategories().find((c) => c.slug === slug);

export function getComponent(categorySlug: string, slug: string): Component | undefined {
  return getCategory(categorySlug)?.components.find((c) => c.slug === slug);
}

export function getRecent(limit: number): Component[] {
  return getCategories()
    .flatMap((c) => c.components)
    .sort((a, b) => b.updated.getTime() - a.updated.getTime() || byName(a.name, b.name))
    .slice(0, limit);
}

export const categoryHref = (category: { slug: string }) => url(`/${category.slug}/`);
export const componentHref = (c: { categorySlug: string; slug: string }) => url(`/${c.categorySlug}/${c.slug}/`);
export const assetHref = (c: Component, asset: AssetFile) =>
  url(`/${c.categorySlug}/${c.slug}/files/${encodeURIComponent(asset.name)}`);
export const formatDate = (d: Date) => d.toISOString().slice(0, 10);
export const pad = (n: number) => String(n).padStart(2, '0');

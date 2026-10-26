// Serves the images and PDFs found in an archive folder at /<category>/<component>/files/<name>.
import fs from 'node:fs';
import path from 'node:path';
import type { APIRoute } from 'astro';
import { getCategories, getComponent } from '../../../../lib/archive';

const MIME: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
};

export function getStaticPaths() {
  return getCategories().flatMap((cat) =>
    cat.components.flatMap((c) =>
      c.assets.map((a) => ({ params: { category: cat.slug, component: c.slug, file: a.name } })),
    ),
  );
}

export const GET: APIRoute = ({ params }) => {
  const asset = getComponent(params.category ?? '', params.component ?? '')?.assets.find((a) => a.name === params.file);
  if (!asset) return new Response('Not found', { status: 404 });
  const type = MIME[path.extname(asset.name).toLowerCase()] ?? 'application/octet-stream';
  return new Response(new Uint8Array(fs.readFileSync(asset.absolutePath)), { headers: { 'Content-Type': type } });
};

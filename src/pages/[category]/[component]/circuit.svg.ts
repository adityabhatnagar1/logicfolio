// Serves the generated block-view circuit at /<category>/<component>/circuit.svg (search thumbnails).
import type { APIRoute } from 'astro';
import { getCategories, getComponent } from '../../../lib/archive';

export function getStaticPaths() {
  return getCategories().flatMap((cat) =>
    cat.components
      .filter((c) => c.generated.circuitBlock)
      .map((c) => ({ params: { category: cat.slug, component: c.slug } })),
  );
}

export const GET: APIRoute = ({ params }) => {
  const svg = getComponent(params.category ?? '', params.component ?? '')?.generated.circuitBlock;
  if (!svg) return new Response('Not found', { status: 404 });
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml' } });
};

/** The only place internal links are built. Always use url('/some/path/'). */
export const baseUrl = import.meta.env.BASE_URL.replace(/\/+$/, '');

export function url(path = '/'): string {
  return baseUrl + (path.startsWith('/') ? path : `/${path}`);
}

// @ts-check
import { defineConfig } from 'astro/config';

// GitHub Pages project site: GITHUB_REPOSITORY is "owner/repo" in CI.
// Locally it is unset, so `site` stays undefined and `base` is "/".
const [owner, repo] = (process.env.GITHUB_REPOSITORY ?? '').split('/');
const isUserSite = repo?.toLowerCase() === `${owner}.github.io`.toLowerCase();

export default defineConfig({
  site: owner ? `https://${owner}.github.io` : undefined,
  base: repo && !isUserSite ? `/${repo}` : '/',
  output: 'static',
  trailingSlash: 'always',
  compressHTML: true,
  build: { inlineStylesheets: 'always' },
  devToolbar: { enabled: false },
});

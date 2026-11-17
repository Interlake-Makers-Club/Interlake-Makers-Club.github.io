// @ts-check
import { defineConfig } from 'astro/config';

// The repo is named <account>.github.io, so the site serves from the domain root.
// Moving to a custom domain: change `site` here and add public/CNAME (see README).
export default defineConfig({
  site: 'https://interlake-makers-club.github.io',
});

# Rules for AI coding tools

This is the Interlake Makers' Club website: one page, built with Astro, published to
GitHub Pages. The people asking you for changes are club officers who may not code.

## Rules

- Content changes edit `src/content/site.yaml` and add files under `src/assets/` or `public/models/` only. Never put copy inside components.
- Never add a color, font size or spacing value outside `src/styles/tokens.css`.
- Never add a new section, page, dependency or animation without an officer approving it in the pull request description.
- Every image needs real alt text that describes what is in it.
- Run `npm run check` and `npm run build` before committing; both must pass.
- Quotes need `permission: true`, which means written permission was received.
- Update `stats.asOf` whenever a stat number changes.

## Where things are

| You want to change | Edit |
| --- | --- |
| Projects, stats, quotes, officers, email, Instagram, mission, FAQ values, form link | `src/content/site.yaml` |
| Field limits (e.g. summary max 90 characters) | `src/content.config.ts` (only with officer approval) |
| Colors, fonts, sizes, spacing | `src/styles/tokens.css` |
| Fixed wording of a section | the section's file in `src/components/` (only with officer approval) |
| Hero 3D model files | `public/models/` + `heroModels` in `site.yaml` |

## Images

- Project photos go in `src/assets/projects/`, officer photos in `src/assets/officers/`,
  hero poster photos in `src/assets/posters/`. Reference them from `site.yaml` as `../assets/...`.
- Phone photos can be added as-is (JPG/PNG/WebP); the build resizes and compresses them.
- A project's first photo must still look right cropped to 4:3. Officer photos are cropped square.

## Placeholders

Lines marked `TODO(Q#)` and files named `placeholder-*` are stand-ins waiting on real
club content. `npm run todo` lists every one that is left. When replacing a placeholder
file, delete the placeholder and update its path in `site.yaml`.

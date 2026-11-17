# Interlake Makers' Club website

Live at **https://interlake-makers-club.github.io/**

One page that gets people to request a free 3D print or contact the club. All content
lives in one file: [`src/content/site.yaml`](src/content/site.yaml).

## Editing the site (no coding needed)

1. Open this repo in an AI coding tool (Claude Code, Cursor, etc.) and describe the change,
   e.g. "add this project with these 3 photos". The tool follows [AGENTS.md](AGENTS.md).
2. Preview it: `npm install` (first time only), then `npm run dev` and open
   http://localhost:4321. Check it on desktop and at phone width.
3. Commit on a new branch and open a pull request. When the green check passes, merge it.
   The live site updates in about 2 minutes.

You can also edit `src/content/site.yaml` directly on github.com (pencil icon) and choose
"Create a new branch and start a pull request".

If something in `site.yaml` is wrong (too long, missing alt text, bad link), the build
stops with a message naming the field, and the live site is not touched.

## What's still a placeholder

```
npm run todo
```

lists every placeholder left, with its file, line and open-question number (Q#) from the PRD.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Local preview at http://localhost:4321 |
| `npm run check` | Type and content check |
| `npm run build` | Production build into `dist/` |
| `npm run todo` | List remaining placeholders |
| `npm run og` | Rebuild `public/og.png` (the link-preview image) after changing the logo |
| `npm run placeholders` | Regenerate placeholder images/models (never overwrites real files) |

Requires Node 24 (see `.nvmrc`).

## Adding a hero 3D model (STL to GLB)

1. In Blender 4.x (free): File → Import → STL. Select the object. If the status bar shows
   more than 100k triangles, add a Decimate modifier and lower the ratio until it is under.
2. File → Export → glTF 2.0. Format: glTF Binary (.glb). Under Data → Mesh, tick
   Compression (Draco). Keep the result under 3 MB.
3. Put the `.glb` in `public/models/`, and a 1200 × 1200 photo of the real print in
   `src/assets/posters/`.
4. Add an entry to `heroModels` in `site.yaml` with `color` set to the filament's hex code.

The hero shows 3 to 5 models. On phones and tablets the 3D viewer loads after the
visitor's first scroll or touch (the poster photo shows until then), which keeps the
page fast on mobile.

## Moving to a custom domain later

1. Buy the domain on an account the club owns.
2. Add `public/CNAME` containing just the domain (e.g. `interlakemakers.org`).
3. DNS: four A records to GitHub Pages (185.199.108.153, 185.199.109.153, 185.199.110.153,
   185.199.111.153) and a `www` CNAME to `interlake-makers-club.github.io`.
4. Change `site` in `astro.config.mjs` to the new domain.
5. Repo Settings → Pages: enter the domain and tick Enforce HTTPS.

## Ownership

This repo belongs to the club's GitHub account (`Interlake-Makers-Club`), not to any one
student, so it survives graduations. Officers who need to edit are added as collaborators
(Settings → Collaborators).

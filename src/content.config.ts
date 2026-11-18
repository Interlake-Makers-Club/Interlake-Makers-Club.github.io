// Schema for src/content/site.yaml. Every limit here comes from the PRD's
// Content inventory. If an edit breaks a rule, `npm run build` stops and
// names the field, so a broken edit never reaches the live site.
import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { z } from 'astro/zod';
import { parse } from 'yaml';
import { existsSync, statSync } from 'node:fs';

const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
const maxWords = (n: number) => (s: string) => words(s) <= n;
const hex = z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Use a 6-digit hex color like "#C2410C"');
const kebab = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Use lowercase-with-dashes, e.g. "prosthetic-hand"');
const alt = z.string().trim().min(1, 'Alt text is required: describe what is in the image');

const site = defineCollection({
  loader: file('src/content/site.yaml', {
    parser: (text) => [{ id: 'site', ...parse(text) }],
  }),
  schema: ({ image }) =>
    z
      .object({
        requestFormUrl: z
          .url()
          .regex(/^https:\/\/(forms\.gle|docs\.google\.com\/forms)\//, 'Must be a Google Form link (forms.gle or docs.google.com/forms)'),
        email: z.email(),
        instagram: z.string().regex(/^[A-Za-z0-9._]+$/, 'Instagram handle without the @'),
        extraLinks: z
          .array(
            z.object({
              label: z.string().min(1),
              url: z.url(),
              icon: z.enum(['tiktok', 'youtube', 'discord']),
            }),
          )
          .max(3),
        stats: z.object({
          members: z.object({ value: z.number().int().min(0), suffix: z.enum(['', '+']) }),
          prints: z.object({ value: z.number().int().min(0), suffix: z.enum(['', '+']) }),
          donated: z.object({ value: z.number().int().min(0), suffix: z.enum(['', '+']) }),
          donatedLabel: z.enum(['items donated', 'people helped', 'teachers helped']),
          asOf: z.string().regex(/^\d{4}-\d{2}$/, 'Use YYYY-MM'),
        }),
        policy: z.object({
          maxSize: z.string().min(1),
          maxCopies: z.number().int().min(1),
          turnaround: z.string().min(1),
        }),
        meeting: z.object({
          time: z.string().min(1),
          room: z.string().min(1),
        }),
        mission: z.string().refine(maxWords(60), 'Mission must be 60 words or fewer'),
        heroModels: z
          .array(
            z.object({
              model: z.string().regex(/^\/models\/[^/]+\.glb$/, 'Path like /models/name.glb (file goes in public/models/)'),
              poster: image(),
              caption: z.string().min(1).max(40),
              color: hex,
              alt,
              projectId: kebab.optional(),
            }),
          )
          .min(3, 'The hero needs at least 3 models')
          .max(5, 'The hero takes at most 5 models'),
        projects: z
          .array(
            z.object({
              id: kebab,
              title: z.string().min(1).max(40),
              summary: z.string().min(1).max(90),
              description: z.string().min(1).refine(maxWords(120), 'Description must be 120 words or fewer'),
              images: z.array(z.object({ src: image(), alt })).min(1).max(4),
              year: z.number().int().min(2000).max(2100),
              madeFor: z.string().max(40).optional(),
              order: z.number(),
            }),
          )
          .min(3, 'Launch needs at least 3 projects'),
        quotes: z.array(
          z.object({
            text: z.string().min(1).max(280),
            name: z.string().min(1),
            role: z.string().min(1),
            projectId: kebab.optional(),
            permission: z.literal(true, { message: 'permission must be true (written permission received)' }),
          }),
        ),
        officers: z
          .array(
            z.object({
              name: z.string().min(1),
              role: z.string().min(1),
              photo: image(),
              order: z.number(),
            }),
          )
          .min(1),
      })
      .superRefine((d, ctx) => {
        const ids = new Set<string>();
        d.projects.forEach((p, i) => {
          if (ids.has(p.id)) ctx.addIssue({ code: 'custom', path: ['projects', i, 'id'], message: `Duplicate project id "${p.id}"` });
          ids.add(p.id);
        });
        d.heroModels.forEach((m, i) => {
          const f = `public${m.model}`;
          if (!existsSync(f)) ctx.addIssue({ code: 'custom', path: ['heroModels', i, 'model'], message: `File not found: ${f}` });
          else if (statSync(f).size > 3 * 1024 * 1024)
            ctx.addIssue({ code: 'custom', path: ['heroModels', i, 'model'], message: `${f} is over 3 MB; compress it (see README)` });
          if (m.projectId && !ids.has(m.projectId))
            ctx.addIssue({ code: 'custom', path: ['heroModels', i, 'projectId'], message: `No project with id "${m.projectId}"` });
        });
        d.quotes.forEach((q, i) => {
          if (q.projectId && !ids.has(q.projectId))
            ctx.addIssue({ code: 'custom', path: ['quotes', i, 'projectId'], message: `No project with id "${q.projectId}"` });
        });
      }),
});

export const collections = { site };

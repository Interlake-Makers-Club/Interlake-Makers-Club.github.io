import { getEntry } from 'astro:content';

// The one content entry, loaded from src/content/site.yaml and sorted by `order`.
export async function getSite() {
  const entry = await getEntry('site', 'site');
  if (!entry) throw new Error('src/content/site.yaml is missing');
  const d = entry.data;
  return {
    ...d,
    projects: [...d.projects].sort((a, b) => a.order - b.order),
    officers: [...d.officers].sort((a, b) => a.order - b.order),
  };
}

export type Site = Awaited<ReturnType<typeof getSite>>;

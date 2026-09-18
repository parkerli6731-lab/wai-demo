// Lightweight Edge & Client Auto Parts Indexing Engine
import rawCatalog from '@/data/catalog_client.json';
import { AutoPart, CatalogData } from '@/types/autoparts';

export interface CompactItem {
  s: string;   // sku
  n: string;   // name
  c: string;   // category
  p: string;   // parentCategory
  i: string;   // primary image
  a: number;   // has authentic image (1 or 0)
  f: number;   // is fallback image (1 or 0)
  u?: string;  // unit type / description
  r?: string;  // interchanges string
  m?: string[]; // makes
  y?: number[]; // years
}

interface CompactCatalog {
  meta: CatalogData['meta'];
  items: CompactItem[];
}

const compactCatalog = rawCatalog as unknown as CompactCatalog;

// Reconstitute into lightweight AutoPart representation
let cachedParts: AutoPart[] | null = null;

export function getAllParts(): AutoPart[] {
  if (cachedParts) return cachedParts;

  cachedParts = compactCatalog.items.map((item) => ({
    sku: item.s,
    name: item.n,
    category: item.c,
    parent_category: item.p,
    image: item.i,
    gallery: [item.i],
    has_authentic_image: item.a === 1,
    is_fallback_image: item.f === 1,
    used_on_raw: item.u || '',
    replaces_raw: item.r || '',
    applications: [],
    interchanges: [],
    specs: (item.u ? { 'Unit Type': item.u } : {}) as Record<string, string | number>,
    makes: item.m || [],
    years: item.y || [],
    search_index: `${item.s} ${item.n} ${item.c} ${item.p} ${item.r || ''} ${(item.m || []).join(' ')}`.toLowerCase()
  }));

  return cachedParts;
}

export function searchParts(params: {
  query?: string;
  year?: string;
  make?: string;
  category?: string;
  parentCategory?: string;
  parent_category?: string;
  limit?: number;
}): { items: AutoPart[]; total: number } {
  const all = getAllParts();
  const q = params.query?.trim().toLowerCase();
  const yearNum = params.year ? parseInt(params.year, 10) : undefined;
  const make = params.make?.trim().toLowerCase();
  const category = params.category?.trim().toLowerCase();
  const parent = (params.parentCategory || params.parent_category)?.trim().toLowerCase();

  const matched = all.filter((part) => {
    if (category && part.category.toLowerCase() !== category) {
      return false;
    }
    if (parent && (part.parent_category || '').toLowerCase() !== parent) {
      return false;
    }
    if (make) {
      const hasMake = part.makes.some((m) => m.toLowerCase().includes(make));
      if (!hasMake) return false;
    }
    if (yearNum) {
      const hasYear = part.years.includes(yearNum);
      if (!hasYear && part.years.length > 0) return false;
    }
    if (q) {
      const words = q.split(/\s+/).filter(Boolean);
      const isMatch = words.every((word) => part.search_index.includes(word));
      if (!isMatch) return false;
    }
    return true;
  });

  const limit = params.limit || 1000;
  return {
    items: matched.slice(0, limit),
    total: matched.length
  };
}

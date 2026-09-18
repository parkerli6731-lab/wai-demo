import rawCatalog from '@/data/catalog_client.json';
import topSkusCache from '@/data/top_skus_cache.json';
import PartDetailClient from '@/components/PartDetailClient';
import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import { AutoPart } from '@/types/autoparts';

interface CompactItem {
  s: string;
  n: string;
  c: string;
  p: string;
  i: string;
  a: number;
  f: number;
  u?: string;
  r?: string;
  m?: string[];
  y?: number[];
}

const itemsList = rawCatalog.items as CompactItem[];

// Pre-render top parts statically at build time, all other parts are dynamic client-side on export
export async function generateStaticParams() {
  const topParts = itemsList.slice(0, 50);
  return topParts.map((item) => ({
    sku: encodeURIComponent(item.s)
  }));
}

// Full detailed parts reader (reading on demand from category chunks without memory overhead)
function getFullPartDetail(sku: string): AutoPart | null {
  const decoded = decodeURIComponent(sku).toLowerCase();
  
  // 1. Check instant cache for top SKUs
  if ((topSkusCache as Record<string, AutoPart>)[decoded]) {
    return (topSkusCache as Record<string, AutoPart>)[decoded];
  }

  // 2. Find category first from light catalog
  const light = itemsList.find((it) => it.s.toLowerCase() === decoded);
  if (!light) return null;

  const catName = light.c;
  const safeName = catName.toLowerCase().replace(/ /g, '_').replace(/&/g, '_');
  const catPath = path.join(process.cwd(), 'src/data/categories', `${safeName}.json`);
  const chunkDir = path.join(process.cwd(), 'src/data/categories', safeName);

  // 2a. Check if category is chunked
  if (fs.existsSync(chunkDir) && fs.existsSync(path.join(chunkDir, 'manifest.json'))) {
    try {
      const manifest = JSON.parse(fs.readFileSync(path.join(chunkDir, 'manifest.json'), 'utf8'));
      const chunkIdx = manifest.skuMap?.[decoded];
      if (typeof chunkIdx === 'number') {
        const chunkFile = path.join(chunkDir, `chunk_${chunkIdx}.json`);
        if (fs.existsSync(chunkFile)) {
          const catItems = JSON.parse(fs.readFileSync(chunkFile, 'utf8')) as AutoPart[];
          const fullItem = catItems.find((p) => p.sku.toLowerCase() === decoded);
          if (fullItem) return fullItem;
        }
      }
    } catch (e) {
      console.error('Error reading chunked category file:', e);
    }
  }

  // 2b. Check monolithic category file if not chunked
  if (fs.existsSync(catPath)) {
    try {
      const catItems = JSON.parse(fs.readFileSync(catPath, 'utf8')) as AutoPart[];
      const fullItem = catItems.find((p) => p.sku.toLowerCase() === decoded);
      if (fullItem) return fullItem;
    } catch (e) {
      console.error('Error reading category file:', e);
    }
  }

  // Fallback to light part object
  return {
    sku: light.s,
    name: light.n,
    category: light.c,
    parent_category: light.p,
    image: light.i,
    gallery: [light.i],
    has_authentic_image: light.a === 1,
    is_fallback_image: light.f === 1,
    used_on_raw: light.u || '',
    replaces_raw: light.r || '',
    applications: [],
    interchanges: [],
    specs: {},
    search_index: `${light.s} ${light.n} ${light.c} ${light.p}`.toLowerCase(),
    makes: light.m || [],
    years: light.y || []
  };
}

export default async function PartPage({ params }: { params: Promise<{ sku: string }> }) {
  const { sku } = await params;
  const part = getFullPartDetail(sku);

  if (!part) {
    notFound();
  }

  return (
    <div className="py-6">
      <PartDetailClient part={part} />
    </div>
  );
}

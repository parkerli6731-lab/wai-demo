export interface AutoApplication {
  make: string;
  full_make: string;
  model?: string;
  engine?: string;
  years: number[];
  raw: string;
}

export interface Interchange {
  number: string;
  brand: string;
}

export interface AutoPart {
  sku: string;
  name: string;
  category: string;
  parent_category?: string;
  image: string;
  gallery: string[];
  has_authentic_image: boolean;
  is_fallback_image?: boolean;
  used_on_raw: string;
  replaces_raw: string;
  applications: AutoApplication[];
  interchanges: Interchange[];
  specs: Record<string, string | number>;
  makes: string[];
  years: number[];
  search_index: string;
}

export interface CatalogMeta {
  total: number;
  makes: string[];
  years: number[];
  categories: string[];
  parent_categories: string[];
  category_tree: Record<string, string[]>;
  category_counts: Record<string, number>;
  parent_counts: Record<string, number>;
}

export interface CatalogData {
  items: AutoPart[];
  meta: CatalogMeta;
}

export interface RFQItem {
  part: AutoPart;
  qty: number;
  note?: string;
}

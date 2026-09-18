"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { searchParts } from "@/lib/search";
import catalogMeta from "@/data/catalog_meta.json";
import { CatalogMeta } from "@/types/autoparts";
import YMMSearchWidget from "@/components/YMMSearchWidget";
import PartCard from "@/components/PartCard";
import { Layers, Shield, Gauge, CheckCircle, Package } from "lucide-react";

const meta = catalogMeta as CatalogMeta;

export default function HomeClient() {
  const searchParams = useSearchParams();
  const urlParent = searchParams.get("parent");
  const urlCategory = searchParams.get("category");

  const [activeFilters, setActiveFilters] = useState<{
    query: string;
    year: number | null;
    make: string | null;
    category: string | null;
    parentCategory: string | null;
  }>({
    query: "",
    year: null,
    make: null,
    category: urlCategory,
    parentCategory: urlParent,
  });

  // Keep state in sync with URL search params (e.g. clicking categories from Header dropdown)
  useEffect(() => {
    setActiveFilters((prev) => ({
      ...prev,
      parentCategory: urlParent,
      category: urlCategory,
    }));
  }, [urlParent, urlCategory]);

  const [page, setPage] = useState(1);
  const pageSize = 24;

  const filteredParts = useMemo(() => {
    return searchParts({
      query: activeFilters.query,
      year: activeFilters.year ? String(activeFilters.year) : undefined,
      make: activeFilters.make || undefined,
      category: activeFilters.category || undefined,
      parent_category: activeFilters.parentCategory || undefined,
      limit: 100000
    }).items;
  }, [activeFilters]);

  const pagedParts = useMemo(() => {
    return filteredParts.slice(0, page * pageSize);
  }, [filteredParts, page]);

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-800/80 text-blue-400 text-xs font-medium mb-4">
          <Shield className="w-3.5 h-3.5 text-blue-400" />
          Comprehensive Global Automotive Replacement & OE Crossover Catalog
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-tight">
          Complete Industrial Coverage. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-400">
            {meta.parent_categories.length} Product Lines • {meta.total} Active SKUs
          </span>
        </h1>
        <p className="mt-3 text-slate-400 text-sm sm:text-base max-w-3xl mx-auto">
          Migrated directly from WAI Global official catalog with authentic high-resolution multi-angle photography, 
          covering Rotating Electrical, Small Motor, Engine Management, Brake Systems, Wipers & Washers, and Body & Exterior.
        </p>

        {/* Feature badges */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            3,570+ Official High-Res Real Photos
          </span>
          <span className="flex items-center gap-1.5">
            <Gauge className="w-4 h-4 text-blue-400" />
            319 Vehicle Makes (1948 - 2026)
          </span>
          <span className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-indigo-400" />
            Instant In-Memory YMMS Cross-Matching
          </span>
          <span className="flex items-center gap-1.5">
            <Package className="w-4 h-4 text-purple-400" />
            Full B2B RFQ Inquiry Basket
          </span>
        </div>
      </section>

      {/* YMMS Lookup Search Engine */}
      <section>
        <YMMSearchWidget
          meta={meta}
          initialParentCategory={activeFilters.parentCategory}
          initialCategory={activeFilters.category}
          onSearch={(filters) => {
            setActiveFilters(filters);
            setPage(1);
          }}
        />
      </section>

      {/* Results Header */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Matching Components</span>
              <span className="text-xs bg-slate-800 text-slate-300 font-mono px-2.5 py-0.5 rounded-full border border-slate-700">
                {filteredParts.length} parts found
              </span>
              {activeFilters.parentCategory && (
                <span className="text-xs bg-blue-900/60 text-blue-300 border border-blue-700/50 px-2 py-0.5 rounded-md">
                  {activeFilters.parentCategory}
                </span>
              )}
              {activeFilters.category && (
                <span className="text-xs bg-indigo-900/60 text-indigo-300 border border-indigo-700/50 px-2 py-0.5 rounded-md">
                  {activeFilters.category}
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Instant search across OEM, WAI, Bosch, Denso, Valeo, Ford, GM, Delco, Hitachi part numbers
            </p>
          </div>
        </div>

        {/* Part Grid */}
        {filteredParts.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-slate-800">
            <p className="text-slate-300 text-base font-semibold">No matching parts found</p>
            <p className="text-slate-500 text-xs mt-1">
              Try searching by universal number (e.g. 11140, BC1101, CAM102, 172186) or adjusting Category/Make filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {pagedParts.map((part) => (
              <PartCard key={part.sku} part={part} />
            ))}
          </div>
        )}

        {/* Load More */}
        {pagedParts.length < filteredParts.length && (
          <div className="mt-10 text-center">
            <button
              onClick={() => setPage((p) => p + 1)}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium text-xs px-6 py-3 rounded-xl transition shadow-lg"
            >
              Load Next {Math.min(pageSize, filteredParts.length - pagedParts.length)} Parts (
              {pagedParts.length} of {filteredParts.length} shown)
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

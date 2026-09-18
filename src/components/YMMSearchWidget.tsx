"use client";

import React, { useEffect, useState } from "react";
import { CatalogMeta } from "@/types/autoparts";
import { Search, RotateCcw, Filter } from "lucide-react";

interface YMMSProps {
  meta: CatalogMeta;
  initialParentCategory?: string | null;
  initialCategory?: string | null;
  onSearch: (filters: {
    query: string;
    year: number | null;
    make: string | null;
    category: string | null;
    parentCategory: string | null;
  }) => void;
}

export default function YMMSearchWidget({
  meta,
  initialParentCategory = null,
  initialCategory = null,
  onSearch,
}: YMMSProps) {
  const [query, setQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMake, setSelectedMake] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
  const [selectedParentCategory, setSelectedParentCategory] = useState<string | null>(
    initialParentCategory
  );

  // Sync when initial props change from URL
  useEffect(() => {
    setSelectedParentCategory(initialParentCategory);
    setSelectedCategory(initialCategory);
  }, [initialParentCategory, initialCategory]);

  const handleApply = (
    q = query,
    y = selectedYear,
    m = selectedMake,
    c = selectedCategory,
    pc = selectedParentCategory
  ) => {
    onSearch({ query: q, year: y, make: m, category: c, parentCategory: pc });
  };

  const handleReset = () => {
    setQuery("");
    setSelectedYear(null);
    setSelectedMake(null);
    setSelectedCategory(null);
    setSelectedParentCategory(null);
    onSearch({ query: "", year: null, make: null, category: null, parentCategory: null });
  };

  // Determine available sub-categories based on selected parent category
  const availableSubCategories = selectedParentCategory
    ? meta.category_tree?.[selectedParentCategory] || []
    : meta.categories;

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <span className="text-xs font-semibold tracking-wider text-blue-400 uppercase">
            Global OE & Cross-Reference Engine
          </span>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-500" />
            Universal Automotive Lookup (YMMS & OE Search)
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">
            Active Catalog: <strong className="text-emerald-400 font-mono">{meta.total}</strong> Parts across{" "}
            <strong className="text-blue-400 font-mono">{meta.categories.length}</strong> Product Lines
          </span>
          <button
            onClick={handleReset}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* Main Lines Quick Switcher */}
      <div className="flex flex-wrap gap-2 pt-1">
        <button
          onClick={() => {
            setSelectedParentCategory(null);
            setSelectedCategory(null);
            handleApply(query, selectedYear, selectedMake, null, null);
          }}
          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
            !selectedParentCategory
              ? "bg-blue-600 text-white shadow-md shadow-blue-900/30"
              : "bg-slate-800/80 text-slate-300 hover:bg-slate-700"
          }`}
        >
          All Product Lines ({meta.parent_categories.length})
        </button>
        {meta.parent_categories.map((pc) => {
          const count = meta.parent_counts?.[pc] || 0;
          return (
            <button
              key={pc}
              onClick={() => {
                const newPc = selectedParentCategory === pc ? null : pc;
                setSelectedParentCategory(newPc);
                setSelectedCategory(null);
                handleApply(query, selectedYear, selectedMake, null, newPc);
              }}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                selectedParentCategory === pc
                  ? "bg-blue-600 text-white shadow-md shadow-blue-900/30"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-700"
              }`}
            >
              <span>{pc}</span>
              <span className={`text-[10px] px-1 py-0.2 rounded font-mono ${
                selectedParentCategory === pc ? "bg-blue-700 text-white" : "bg-slate-900 text-slate-400"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Category */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            1. Sub-Category
          </label>
          <select
            value={selectedCategory || ""}
            onChange={(e) => {
              const val = e.target.value || null;
              setSelectedCategory(val);
              handleApply(query, selectedYear, selectedMake, val, selectedParentCategory);
            }}
            className="w-full bg-slate-800/90 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">
              {selectedParentCategory
                ? `All ${selectedParentCategory} (${availableSubCategories.length})`
                : `All Categories (${meta.categories.length})`}
            </option>
            {availableSubCategories.map((c) => {
              const count = meta.category_counts?.[c] || 0;
              return (
                <option key={c} value={c}>
                  {c} ({count})
                </option>
              );
            })}
          </select>
        </div>

        {/* Year */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            2. Year
          </label>
          <select
            value={selectedYear || ""}
            onChange={(e) => {
              const val = e.target.value ? Number(e.target.value) : null;
              setSelectedYear(val);
              handleApply(query, val, selectedMake, selectedCategory, selectedParentCategory);
            }}
            className="w-full bg-slate-800/90 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Year (All {meta.years.length})</option>
            {meta.years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Make */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            3. Make / Brand
          </label>
          <select
            value={selectedMake || ""}
            onChange={(e) => {
              const val = e.target.value || null;
              setSelectedMake(val);
              handleApply(query, selectedYear, val, selectedCategory, selectedParentCategory);
            }}
            className="w-full bg-slate-800/90 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Make (All {meta.makes.length})</option>
            {meta.makes.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Universal OE / SKU Search Input */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            4. Part / OE / Competitor #
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="e.g. 11140N, BC1101D, CAM102, 172186..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                handleApply(e.target.value, selectedYear, selectedMake, selectedCategory, selectedParentCategory);
              }}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>
        </div>
      </div>
    </div>
  );
}

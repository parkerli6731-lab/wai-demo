"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRFQ } from "@/context/RFQContext";
import catalogMeta from "@/data/catalog_meta.json";
import { CatalogMeta } from "@/types/autoparts";
import {
  FileText,
  ChevronDown,
  Layers,
  Zap,
  Shield,
  Menu,
  X,
} from "lucide-react";

const meta = catalogMeta as CatalogMeta;

export default function Header() {
  const { setIsOpen, totalCount } = useRFQ();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectCategory = (parent: string | null, cat: string | null) => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);

    const params = new URLSearchParams();
    if (parent) params.set("parent", parent);
    if (cat) params.set("category", cat);

    const queryStr = params.toString();
    const targetUrl = queryStr ? `/?${queryStr}` : "/";
    router.push(targetUrl);
  };

  const categoryTree = meta.category_tree || {};
  const parentCategories = meta.parent_categories || [];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand & Navigation */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-blue-600 group-hover:bg-blue-500 transition flex items-center justify-center font-black text-white text-lg tracking-tight shadow-md shadow-blue-500/20">
              W
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-lg tracking-tight">
                  WAI<span className="text-blue-500">Global</span>
                </span>
                <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded bg-blue-900/50 text-blue-300 border border-blue-700/50">
                  Headless v2
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                Edge-Native Automotive Aftermarket Catalog
              </p>
            </div>
          </Link>

          {/* Categories Dropdown Menu (Desktop) */}
          <div className="hidden lg:relative lg:block" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition border ${
                dropdownOpen
                  ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-900/40"
                  : "bg-slate-900/80 text-slate-200 border-slate-800 hover:bg-slate-800 hover:border-slate-700"
              }`}
            >
              <Layers className="w-4 h-4 text-blue-400 group-hover:text-white" />
              <span>Browse Categories</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Mega Dropdown Panel */}
            {dropdownOpen && (
              <div className="absolute left-0 mt-2 w-[720px] rounded-2xl bg-slate-950 border border-slate-700 shadow-2xl shadow-black p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Product Hierarchy
                    </span>
                    <span className="text-[11px] text-slate-400">
                      ({meta.total} active SKUs across {parentCategories.length} product lines)
                    </span>
                  </div>
                  <button
                    onClick={() => handleSelectCategory(null, null)}
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium transition"
                  >
                    View All Products &rarr;
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  {parentCategories.map((parent) => {
                    const subCats = categoryTree[parent] || [];
                    const parentCount = meta.parent_counts?.[parent] || 0;
                    return (
                      <div key={parent} className="space-y-2.5">
                        {/* Parent Category Header / Link */}
                        <div
                          onClick={() => handleSelectCategory(parent, null)}
                          className="group cursor-pointer flex items-center justify-between pb-1.5 border-b border-slate-800/80 hover:border-blue-500/50 transition"
                        >
                          <span className="text-xs font-bold text-white group-hover:text-blue-400 transition">
                            {parent}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 bg-slate-800/80 px-1.5 py-0.5 rounded">
                            {parentCount}
                          </span>
                        </div>

                        {/* Sub-categories Links */}
                        <ul className="space-y-1">
                          {subCats.map((sub) => {
                            const count = meta.category_counts?.[sub] || 0;
                            return (
                              <li key={sub}>
                                <button
                                  onClick={() => handleSelectCategory(parent, sub)}
                                  className="w-full text-left flex items-center justify-between text-[11px] py-1 px-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-800/80 transition"
                                >
                                  <span className="truncate pr-1">{sub}</span>
                                  <span className="text-[10px] text-slate-500 font-mono">
                                    {count}
                                  </span>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center: Quick Indicators */}
        <div className="hidden md:flex items-center gap-6 text-xs text-slate-300">
          <div className="flex items-center gap-1.5 text-emerald-400 font-mono">
            <Zap className="w-3.5 h-3.5" />
            <span>TTFB &lt; 0.5ms (Edge)</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span>100% Verified OEM Fit</span>
          </div>
        </div>

        {/* Right CTA / Inquiry Cart Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-3.5 py-2 rounded-lg text-xs font-semibold transition"
          >
            <FileText className="w-4 h-4 text-blue-400" />
            <span>Inquiry Basket</span>
            {totalCount > 0 && (
              <span className="bg-blue-500 text-white rounded-full px-2 py-0.2 text-[11px] font-mono">
                {totalCount}
              </span>
            )}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-slate-800 text-slate-200 hover:text-white border border-slate-700"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-950 p-4 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-white uppercase">Categories</span>
            <button
              onClick={() => handleSelectCategory(null, null)}
              className="text-xs text-blue-400"
            >
              All Parts ({meta.total})
            </button>
          </div>

          <div className="space-y-4">
            {parentCategories.map((parent) => (
              <div key={parent} className="space-y-2">
                <div
                  onClick={() => handleSelectCategory(parent, null)}
                  className="flex items-center justify-between text-xs font-bold text-slate-200 cursor-pointer"
                >
                  <span>{parent}</span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {meta.parent_counts?.[parent]}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1 pl-2">
                  {(categoryTree[parent] || []).map((sub) => (
                    <button
                      key={sub}
                      onClick={() => handleSelectCategory(parent, sub)}
                      className="text-left text-[11px] text-slate-400 hover:text-white py-1 px-1.5 rounded hover:bg-slate-900 truncate"
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

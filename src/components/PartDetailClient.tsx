"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AutoPart } from "@/types/autoparts";
import { useRFQ } from "@/context/RFQContext";
import {
  ArrowLeft,
  ShieldCheck,
  Plus,
  Check,
  Share2,
  FileCheck2,
  Car,
  Layers,
  Search,
  CheckCircle,
} from "lucide-react";

export default function PartDetailClient({
  part,
  relatedParts = [],
}: {
  part: AutoPart;
  relatedParts?: AutoPart[];
}) {
  const { addToRFQ, items } = useRFQ();
  const [selectedImg, setSelectedImg] = useState(part.image);
  const [added, setAdded] = useState(false);
  const [copied, setCopied] = useState(false);

  const isInCart = items.some((i) => i.part.sku === part.sku);

  const handleAdd = () => {
    addToRFQ(part, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between gap-4 text-xs text-slate-400">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-medium transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Catalog Search
        </Link>
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-lg text-slate-300 transition"
        >
          <Share2 className="w-3.5 h-3.5 text-blue-400" />
          {copied ? "Link Copied!" : "Share Component Spec"}
        </button>
      </div>

      {/* Main Product Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 lg:p-8 backdrop-blur-md">
        {/* Left Gallery (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative aspect-[4/3] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center p-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedImg}
              alt={part.name}
              className="w-full h-full object-contain hover:scale-105 transition duration-300"
            />
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-900/90 text-blue-400 border border-blue-900/50 backdrop-blur-md">
                {part.category}
              </span>
              {part.has_authentic_image ? (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-950/90 text-emerald-300 border border-emerald-800/50 backdrop-blur-md flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Verified WAI Official Photos
                </span>
              ) : (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-900/90 text-slate-400 border border-slate-700 backdrop-blur-md flex items-center gap-1">
                  Category Representative Image
                </span>
              )}
            </div>
          </div>

          {/* Thumbnails */}
          {part.gallery && part.gallery.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {part.gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImg(img)}
                  className={`relative w-20 h-16 rounded-lg overflow-hidden border flex-shrink-0 bg-slate-950 p-1 transition ${
                    selectedImg === img
                      ? "border-blue-500 ring-2 ring-blue-500/40"
                      : "border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt={`${part.sku}-${idx}`}
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Info (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="font-mono text-2xl sm:text-3xl font-black text-white tracking-tight">
                {part.sku}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono bg-emerald-950/60 border border-emerald-800/50 px-2.5 py-1 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" />
                100% Factory Pre-Tested
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-semibold text-slate-200">
              {part.name}
            </h1>

            {/* Replaces OE Tag */}
            {part.replaces_raw && (
              <div className="bg-slate-950/70 rounded-xl p-4 border border-slate-800/90 space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                  Original Equipment (OE) Numbers Replaced:
                </span>
                <p className="font-mono text-sm text-amber-300 break-words">
                  {part.replaces_raw}
                </p>
              </div>
            )}

            {/* Quick Specs Grid */}
            {Object.keys(part.specs).length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                {Object.entries(part.specs).map(([k, v]) => (
                  <div
                    key={k}
                    className="bg-slate-950/50 border border-slate-800 p-2.5 rounded-lg text-xs"
                  >
                    <span className="text-slate-500 block truncate capitalize">
                      {k.replace(/_/g, " ")}
                    </span>
                    <span className="font-mono text-white font-medium truncate block mt-0.5">
                      {String(v)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleAdd}
              className={`w-full sm:flex-1 py-3 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition shadow-xl ${
                added || isInCart
                  ? "bg-emerald-600/20 text-emerald-300 border border-emerald-500/50"
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/40"
              }`}
            >
              {added || isInCart ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  Added to Wholesale RFQ List
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add to Quotation Inquiry
                </>
              )}
            </button>

            <a
              href={`https://www.google.com/search?q=${encodeURIComponent(
                "WAI " + part.sku + " " + part.replaces_raw
              )}`}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <Search className="w-4 h-4 text-slate-400" />
              Cross-Check Industry Data
            </a>
          </div>
        </div>
      </div>

      {/* Tabs & Detailed Technical Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Vehicle Applications */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
            <Car className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold text-white">
              Vehicle Applications & Compatibility
            </h2>
          </div>
          {part.used_on_raw ? (
            <div className="space-y-4 text-xs">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-slate-300 leading-relaxed font-sans">
                {part.used_on_raw}
              </div>
              {part.applications && part.applications.length > 0 && (
                <div className="space-y-2">
                  <span className="text-slate-400 font-medium block">
                    Structured Application Breakdown:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {part.applications.map((app, i) => (
                      <div
                        key={i}
                        className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80 flex justify-between items-center"
                      >
                        <span className="font-semibold text-white">
                          {app.make}
                        </span>
                        <span className="font-mono text-slate-400">
                          {app.years.length > 0
                            ? `${app.years[0]} - ${app.years[app.years.length - 1]}`
                            : "All Years"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              Universal OE replacement application. Check physical specs.
            </p>
          )}
        </div>

        {/* Competitor & Brand Cross-References */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-bold text-white">
                Brand & Interchanges Cross Reference
              </h2>
            </div>
            <span className="text-xs bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded-md">
              {part.interchanges.length} Cross Matches
            </span>
          </div>

          {part.interchanges && part.interchanges.length > 0 ? (
            <div className="max-h-80 overflow-y-auto pr-1 space-y-2 scrollbar-thin">
              {part.interchanges.map((ic, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs hover:border-slate-700 transition"
                >
                  <span className="font-mono font-bold text-slate-200">
                    {ic.number}
                  </span>
                  <span className="font-medium text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-900/50">
                    {ic.brand}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              Direct OE fitment. Additional interchange numbers available upon inquiry.
            </p>
          )}
        </div>
      </div>

      {/* Industrial Verification Guarantee */}
      <div className="bg-gradient-to-r from-blue-950/40 via-slate-900/60 to-slate-950 border border-blue-900/30 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-5">
        <div className="p-3 bg-blue-600/10 border border-blue-500/30 rounded-xl text-blue-400">
          <FileCheck2 className="w-8 h-8" />
        </div>
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-sm font-bold text-white">
            100% Factory Traceability & OEM Cross-Check Verified
          </h3>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Every component in this catalog is cross-referenced against ISO/TS-16949 certified manufacturing standards. 
            Direct wholesale inquiries receive full QC test curves, raw material analysis, and packaging configuration drawings.
          </p>
        </div>
      </div>

      {/* Related Category Parts */}
      {relatedParts && relatedParts.length > 0 && (
        <div className="pt-6 border-t border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">
              Related Components in <span className="text-blue-400">{part.category}</span>
            </h2>
            <span className="text-xs text-slate-400">Direct Category Complements</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedParts.map((rp) => (
              <Link
                key={rp.sku}
                href={`/part/${encodeURIComponent(rp.sku)}`}
                className="group bg-slate-900/60 border border-slate-800 hover:border-blue-500/50 rounded-xl p-3 transition flex flex-col justify-between"
              >
                <div className="aspect-[4/3] bg-slate-950 rounded-lg overflow-hidden relative mb-2 flex items-center justify-center">
                  <img
                    src={rp.image}
                    alt={rp.name}
                    className="w-full h-full object-contain p-2 group-hover:scale-105 transition duration-300"
                    loading="lazy"
                  />
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-white group-hover:text-blue-400 transition">
                    {rp.sku}
                  </div>
                  <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                    {rp.name}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

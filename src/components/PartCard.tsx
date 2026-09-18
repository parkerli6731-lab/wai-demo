"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AutoPart } from "@/types/autoparts";
import { useRFQ } from "@/context/RFQContext";
import { Plus, Check, ShieldCheck, ArrowRight, Camera } from "lucide-react";

export default function PartCard({ part }: { part: AutoPart }) {
  const { addToRFQ, items } = useRFQ();
  const [added, setAdded] = useState(false);

  const isInCart = items.some((i) => i.part.sku === part.sku);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToRFQ(part, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 hover:shadow-xl hover:shadow-blue-950/20 transition flex flex-col justify-between group">
      <div>
        {/* Product Image preview with Link */}
        <Link href={`/part/${encodeURIComponent(part.sku)}`} className="block relative aspect-[4/3] bg-slate-950 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={part.image}
            alt={part.name}
            loading="lazy"
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition duration-300"
          />
          <div className="absolute top-2.5 left-2.5">
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-md text-blue-400 border border-blue-900/50">
              {part.category}
            </span>
          </div>
          {part.has_authentic_image ? (
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1 text-[10px] font-medium bg-emerald-950/90 border border-emerald-700/60 text-emerald-300 px-2 py-0.5 rounded-md backdrop-blur-md">
              <Camera className="w-3 h-3" />
              <span>{part.gallery.length} Photos</span>
            </div>
          ) : (
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1 text-[10px] font-medium bg-slate-900/90 border border-slate-700 text-slate-400 px-2 py-0.5 rounded-md backdrop-blur-md">
              <span>Category Preview</span>
            </div>
          )}
        </Link>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <Link
              href={`/part/${encodeURIComponent(part.sku)}`}
              className="text-base font-bold text-white group-hover:text-blue-400 transition font-mono tracking-tight"
            >
              {part.sku}
            </Link>
            <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              OE Spec
            </span>
          </div>

          <p className="text-xs text-slate-300 line-clamp-1 mb-2.5">{part.name}</p>

          {/* Applications preview */}
          {part.used_on_raw && (
            <div className="mb-2.5 text-[11px] bg-slate-950/80 rounded-lg p-2 border border-slate-800/80">
              <span className="text-slate-400 block font-medium mb-0.5">
                Applications:
              </span>
              <span className="text-slate-300 line-clamp-2 leading-relaxed">
                {part.used_on_raw}
              </span>
            </div>
          )}

          {/* Replaces / OE */}
          {part.replaces_raw && (
            <div className="text-[11px] line-clamp-1">
              <span className="text-slate-500">Replaces: </span>
              <span className="text-amber-300/90 font-mono">
                {part.replaces_raw}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Card Actions */}
      <div className="p-3.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between gap-2">
        <button
          onClick={handleAdd}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition ${
            added || isInCart
              ? "bg-emerald-600/20 text-emerald-300 border border-emerald-500/40"
              : "bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-900/30"
          }`}
        >
          {added || isInCart ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              In Inquiry
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              Add to RFQ
            </>
          )}
        </button>

        <Link
          href={`/part/${encodeURIComponent(part.sku)}`}
          className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
          title="View Full Specifications & OE Cross Checks"
        >
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

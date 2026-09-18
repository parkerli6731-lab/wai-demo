"use client";

import React, { useState } from "react";
import { useRFQ } from "@/context/RFQContext";
import { X, Trash2, Send, FileText, CheckCircle2 } from "lucide-react";

export default function RFQDrawer() {
  const { items, removeFromRFQ, updateQty, clearRFQ, isOpen, setIsOpen, totalCount } =
    useRFQ();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    country: "",
    notes: "",
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate RFQ instant edge submission
    setSubmitted(true);
    setTimeout(() => {
      clearRFQ();
      setSubmitted(false);
      setIsOpen(false);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-xl bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">
              B2B Inquiry Cart (RFQ)
            </h2>
            <span className="text-xs bg-blue-900/60 text-blue-300 font-mono px-2 py-0.5 rounded-full">
              {totalCount} items
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {submitted ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <CheckCircle2 className="w-16 h-16 text-emerald-400 animate-bounce" />
              <h3 className="text-xl font-bold text-white">Inquiry Request Sent!</h3>
              <p className="text-sm text-slate-300 max-w-md">
                Our global export desk will respond with factory pricing, MOQ, and shipping lead time within 2 hours.
              </p>
            </div>
          ) : items.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400">
              <p className="text-sm">Your RFQ basket is currently empty.</p>
              <p className="text-xs text-slate-500 mt-1">
                Use the search engine to add automotive parts and request instant wholesale quotes.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {items.map(({ part, qty }) => (
                  <div
                    key={part.sku}
                    className="flex items-center justify-between gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-white">
                          {part.sku}
                        </span>
                        <span className="text-xs text-slate-400 truncate">
                          ({part.category})
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {part.replaces_raw || part.name}
                      </p>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        value={qty}
                        onChange={(e) =>
                          updateQty(part.sku, parseInt(e.target.value) || 1)
                        }
                        className="w-16 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white text-center font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => removeFromRFQ(part.sku)}
                        className="text-slate-500 hover:text-red-400 p-1"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Inquiry Form */}
              <form onSubmit={handleSubmit} className="pt-4 border-t border-slate-800 space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Direct Factory Quotation Details
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    required
                    type="text"
                    placeholder="Your Name / Title"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <input
                    required
                    type="email"
                    placeholder="Work Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    required
                    type="text"
                    placeholder="Company / Distributor Name"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <input
                    required
                    type="text"
                    placeholder="Target Country / Port"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <textarea
                  rows={2}
                  placeholder="Target quantity, packaging specs, or custom brand requirements..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-slate-800/90 border border-slate-700 rounded px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                ></textarea>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-blue-900/40"
                  >
                    <Send className="w-4 h-4" />
                    Request Global Quote (B2B Priority)
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

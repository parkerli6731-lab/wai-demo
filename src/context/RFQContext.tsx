"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { AutoPart, RFQItem } from "@/types/autoparts";

interface RFQContextType {
  items: RFQItem[];
  addToRFQ: (part: AutoPart, qty?: number) => void;
  removeFromRFQ: (sku: string) => void;
  updateQty: (sku: string, qty: number) => void;
  clearRFQ: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  totalCount: number;
}

const RFQContext = createContext<RFQContextType | undefined>(undefined);

export function RFQProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<RFQItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("wai_rfq_basket");
      if (saved) setItems(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("wai_rfq_basket", JSON.stringify(items));
    } catch {}
  }, [items]);

  const addToRFQ = (part: AutoPart, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.part.sku === part.sku);
      if (existing) {
        return prev.map((i) =>
          i.part.sku === part.sku ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [...prev, { part, qty }];
    });
    setIsOpen(true);
  };

  const removeFromRFQ = (sku: string) => {
    setItems((prev) => prev.filter((i) => i.part.sku !== sku));
  };

  const updateQty = (sku: string, qty: number) => {
    if (qty <= 0) {
      removeFromRFQ(sku);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.part.sku === sku ? { ...i, qty } : i))
    );
  };

  const clearRFQ = () => setItems([]);

  const totalCount = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <RFQContext.Provider
      value={{
        items,
        addToRFQ,
        removeFromRFQ,
        updateQty,
        clearRFQ,
        isOpen,
        setIsOpen,
        totalCount,
      }}
    >
      {children}
    </RFQContext.Provider>
  );
}

export function useRFQ() {
  const ctx = useContext(RFQContext);
  if (!ctx) throw new Error("useRFQ must be used within RFQProvider");
  return ctx;
}

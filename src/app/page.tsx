import { Suspense } from "react";
import HomeClient from "@/components/HomeClient";

export default function Home() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-slate-500 text-xs">Loading Catalog...</div>}>
      <HomeClient />
    </Suspense>
  );
}

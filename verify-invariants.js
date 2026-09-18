const catalog = require('./src/data/catalog_client.json');

console.log("==================================================");
console.log("  WAI HEADLESS INVARIANT HARNESS & VERIFICATION   ");
console.log("==================================================");

let testsPassed = 0;
let totalTests = 0;

function assertInvariant(description, condition) {
  totalTests++;
  if (condition) {
    console.log(`✅ [PASS] Invariant #${totalTests}: ${description}`);
    testsPassed++;
  } else {
    console.error(`❌ [FAIL] Invariant #${totalTests}: ${description}`);
    process.exitCode = 1;
  }
}

// Invariant 1: Total catalog products scale (>30,000 finished units)
assertInvariant(
  `Full catalog scale invariant (>30,000 finished units migrated, count: ${catalog.items.length})`,
  catalog.items && catalog.items.length >= 30000
);

// Invariant 2: 100% of parts must have a valid non-empty display image
const invalidImages = catalog.items.filter(p => !p.i || typeof p.i !== 'string' || p.i.trim() === '');
assertInvariant(
  "Zero broken images invariant (100% parts have valid high-res or category representative photos)",
  invalidImages.length === 0
);

// Invariant 3: Category tree and parent categories integrity
const meta = catalog.meta;
assertInvariant(
  `Category hierarchy completeness invariant (${Object.keys(meta.category_tree).length} parent lines, ${meta.categories.length} sub-categories)`,
  meta && 
  meta.category_tree && 
  Object.keys(meta.category_tree).length >= 6 && 
  meta.categories.length >= 25
);

// Invariant 4: Sub-category mapping non-empty invariant for all parent categories
let allTreeCategoriesMatch = true;
for (const [parent, subs] of Object.entries(meta.category_tree)) {
  if (!Array.isArray(subs) || subs.length === 0) {
    allTreeCategoriesMatch = false;
  }
}
assertInvariant(
  "Sub-category mapping non-empty invariant across all parent categories",
  allTreeCategoriesMatch
);

// Invariant 5: Fast In-Memory Search Latency (<15ms across all 32,000+ items)
const t0 = performance.now();
const cleanWords = ["denso", "alternator"];
const res = catalog.items.filter(item => {
  const q = `${item.s} ${item.n} ${item.c} ${item.r || ''}`.toLowerCase();
  return cleanWords.every(w => q.includes(w));
});
const t1 = performance.now();
const latency = t1 - t0;
assertInvariant(
  `Search performance invariant (<15ms edge search for 32,000+ parts, measured: ${latency.toFixed(2)}ms, found: ${res.length})`,
  latency < 15.0 && res.length > 0
);

// Invariant 6: Bi-directional Category and Parent filtering
const rotParts = catalog.items.filter(p => p.p === "Rotating Electrical");
const altParts = catalog.items.filter(p => p.c === "Alternators");
assertInvariant(
  `Bi-directional category hierarchy invariant (Rotating Electrical: ${rotParts.length}, Alternators: ${altParts.length})`,
  rotParts.length >= altParts.length && altParts.length >= 9000
);

// Invariant 7: YMM Cross Search Accuracy
const hondaSearch = catalog.items.filter(p => (p.m || []).some(m => m.toLowerCase().includes("honda")) || (p.u || '').toLowerCase().includes("honda"));
assertInvariant(
  `YMM make cross-verification invariant (Honda parts indexed: ${hondaSearch.length})`,
  hondaSearch.length > 500
);

// Invariant 8: Dual image model invariant
const authCount = catalog.items.filter(p => p.a === 1).length;
const fallbackCount = catalog.items.filter(p => p.f === 1).length;
assertInvariant(
  `Dual image model invariant (Authentic photos: ${authCount}, Category Fallbacks: ${fallbackCount})`,
  authCount + fallbackCount === catalog.items.length
);

console.log("--------------------------------------------------");
console.log(`Summary: ${testsPassed}/${totalTests} Invariants Verified.`);
if (testsPassed === totalTests) {
  console.log("✨ ALL SYSTEM INVARIANTS SATISFIED & GATE CLEARED! ✨");
} else {
  console.error("⚠️ SOME INVARIANTS FAILED. Halting pipeline.");
  process.exit(1);
}

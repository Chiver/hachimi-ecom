#!/usr/bin/env tsx
/**
 * Validate every JSON file under src/data/ against the Zod schema in src/types.
 * Run with: pnpm validate
 * Fails (exit 1) on first invalid file so build/CI catches bad data early.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import {
  CountryDataSchema,
  CountrySchema,
  GlossaryEntrySchema,
  DecisionKnowledgeSchema,
  LebesgueCpmSchema,
  CategoryCatalogSchema,
  RoiBenchmarksSchema,
} from "../src/types";

const ROOT = join(__dirname, "..", "src", "data");
let errors = 0;

function parseJson(file: string): unknown {
  try {
    return JSON.parse(readFileSync(file, "utf-8"));
  } catch (err) {
    console.error(`✗ ${file}: invalid JSON — ${(err as Error).message}`);
    errors += 1;
    return null;
  }
}

function check<T>(label: string, schema: z.ZodType<T>, data: unknown) {
  const result = schema.safeParse(data);
  if (result.success) {
    console.log(`✓ ${label}`);
    return result.data;
  }
  errors += 1;
  console.error(`✗ ${label}:`);
  const verbose = process.env.VALIDATE_VERBOSE === "1";
  const limit = verbose ? result.error.issues.length : 8;
  for (const issue of result.error.issues.slice(0, limit)) {
    console.error(
      `    ${issue.path.join(".") || "<root>"}: ${issue.message}`,
    );
  }
  if (!verbose && result.error.issues.length > 8) {
    console.error(`    … +${result.error.issues.length - 8} more issues (re-run with VALIDATE_VERBOSE=1)`);
  }
  return null;
}

// 1. countries-meta.json
const metaPath = join(ROOT, "countries-meta.json");
const meta = parseJson(metaPath);
if (meta) check(`countries-meta.json (${(meta as unknown[]).length} countries)`, z.array(CountrySchema), meta);

// 2. glossary.json
const glossPath = join(ROOT, "glossary.json");
const gloss = parseJson(glossPath);
if (gloss)
  check(`glossary.json (${(gloss as unknown[]).length} entries)`, z.array(GlossaryEntrySchema), gloss);

// 3. decision-knowledge.json
const knowPath = join(ROOT, "decision-knowledge.json");
const know = parseJson(knowPath);
if (know) {
  const data = know as { payments?: unknown[]; carriers?: unknown[]; warehouses?: unknown[] };
  check(
    `decision-knowledge.json (${data.payments?.length ?? 0} payments / ${data.carriers?.length ?? 0} carriers / ${data.warehouses?.length ?? 0} warehouses)`,
    DecisionKnowledgeSchema,
    know,
  );
}

// 4. lebesgue-cpm.json
const lebPath = join(ROOT, "lebesgue-cpm.json");
const leb = parseJson(lebPath);
if (leb) {
  const d = leb as { by_country?: Record<string, unknown> };
  const count = Object.keys(d.by_country ?? {}).length;
  check(`lebesgue-cpm.json (${count} countries)`, LebesgueCpmSchema, leb);
}

// 5. category-catalog.json
const catPath = join(ROOT, "category-catalog.json");
const cat = parseJson(catPath);
if (cat) {
  const d = cat as { categories?: unknown[] };
  check(
    `category-catalog.json (${d.categories?.length ?? 0} categories)`,
    CategoryCatalogSchema,
    cat,
  );
}

// 6. roi-benchmarks.json
const roiPath = join(ROOT, "roi-benchmarks.json");
const roi = parseJson(roiPath);
if (roi) {
  const d = roi as { modes?: unknown[]; regions?: unknown[]; categories?: unknown[] };
  check(
    `roi-benchmarks.json (${d.modes?.length ?? 0} modes / ${d.regions?.length ?? 0} regions / ${d.categories?.length ?? 0} categories)`,
    RoiBenchmarksSchema,
    roi,
  );
}

// 3. countries/*.json
const countryDir = join(ROOT, "countries");
const countryFiles = readdirSync(countryDir).filter((f) => f.endsWith(".json"));
console.log(`\nFound ${countryFiles.length} country file(s):`);
for (const f of countryFiles) {
  const data = parseJson(join(countryDir, f));
  if (data) check(`countries/${f}`, CountryDataSchema, data);
}

console.log("");
if (errors > 0) {
  console.error(`\n❌ ${errors} validation error(s). Refusing to build.\n`);
  process.exit(1);
}
console.log(`✅ All JSON valid (${countryFiles.length} countries + glossary + meta).\n`);

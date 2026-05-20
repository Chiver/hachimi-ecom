import { z } from "zod";
import {
  CountrySchema,
  CountryDataSchema,
  GlossaryEntrySchema,
  DecisionKnowledgeSchema,
  LebesgueCpmSchema,
  CategoryCatalogSchema,
  RoiBenchmarksSchema,
  type Country,
  type CountryData,
  type GlossaryEntry,
  type PolicyEvent,
  type DecisionKnowledge,
  type LebesgueCpm,
  type CategoryCatalog,
  type RoiBenchmarks,
  type PaymentInfo,
  type CarrierInfo,
  type WarehouseInfo,
} from "@/types";

import countriesMetaRaw from "@/data/countries-meta.json";
import glossaryRaw from "@/data/glossary.json";
import decisionKnowledgeRaw from "@/data/decision-knowledge.json";
import lebesgueCpmRaw from "@/data/lebesgue-cpm.json";
import categoryCatalogRaw from "@/data/category-catalog.json";
import roiBenchmarksRaw from "@/data/roi-benchmarks.json";

// Statically import every country JSON. Add a line per country as data ships.
// 32 countries (Phase 1 batch — May 2026).
import areRaw from "@/data/countries/are.json";
import argRaw from "@/data/countries/arg.json";
import ausRaw from "@/data/countries/aus.json";
import braRaw from "@/data/countries/bra.json";
import canRaw from "@/data/countries/can.json";
import cheRaw from "@/data/countries/che.json";
import chlRaw from "@/data/countries/chl.json";
import deuRaw from "@/data/countries/deu.json";
import espRaw from "@/data/countries/esp.json";
import fraRaw from "@/data/countries/fra.json";
import gbrRaw from "@/data/countries/gbr.json";
import idnRaw from "@/data/countries/idn.json";
import indRaw from "@/data/countries/ind.json";
import itaRaw from "@/data/countries/ita.json";
import jpnRaw from "@/data/countries/jpn.json";
import korRaw from "@/data/countries/kor.json";
import mexRaw from "@/data/countries/mex.json";
import mysRaw from "@/data/countries/mys.json";
import nldRaw from "@/data/countries/nld.json";
import norRaw from "@/data/countries/nor.json";
import phlRaw from "@/data/countries/phl.json";
import polRaw from "@/data/countries/poland.json";
import rouRaw from "@/data/countries/rou.json";
import rusRaw from "@/data/countries/rus.json";
import sauRaw from "@/data/countries/sau.json";
import sgpRaw from "@/data/countries/sgp.json";
import sweRaw from "@/data/countries/swe.json";
import thaRaw from "@/data/countries/tha.json";
import turRaw from "@/data/countries/tur.json";
import usaRaw from "@/data/countries/usa.json";
import vnmRaw from "@/data/countries/vnm.json";
import zafRaw from "@/data/countries/zaf.json";

/** ISO alpha3 → raw country JSON. Add new countries here when shipped. */
const COUNTRY_FILES: Record<string, unknown> = {
  ARE: areRaw, ARG: argRaw, AUS: ausRaw, BRA: braRaw, CAN: canRaw,
  CHE: cheRaw, CHL: chlRaw, DEU: deuRaw, ESP: espRaw, FRA: fraRaw,
  GBR: gbrRaw, IDN: idnRaw, IND: indRaw, ITA: itaRaw, JPN: jpnRaw,
  KOR: korRaw, MEX: mexRaw, MYS: mysRaw, NLD: nldRaw, NOR: norRaw,
  PHL: phlRaw, POL: polRaw, ROU: rouRaw, RUS: rusRaw, SAU: sauRaw,
  SGP: sgpRaw, SWE: sweRaw, THA: thaRaw, TUR: turRaw, USA: usaRaw,
  VNM: vnmRaw, ZAF: zafRaw,
};

const CountriesMetaSchema = z.array(CountrySchema);

let _validatedCountries: Country[] | null = null;
let _validatedCountryData: Map<string, CountryData> | null = null;
let _validatedGlossary: GlossaryEntry[] | null = null;

function loadCountriesMeta(): Country[] {
  if (_validatedCountries) return _validatedCountries;
  try {
    _validatedCountries = CountriesMetaSchema.parse(countriesMetaRaw);
    return _validatedCountries;
  } catch (err) {
    throw new Error(
      `[data] countries-meta.json failed Zod validation: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

function loadCountryData(): Map<string, CountryData> {
  if (_validatedCountryData) return _validatedCountryData;
  const map = new Map<string, CountryData>();
  for (const [iso, raw] of Object.entries(COUNTRY_FILES)) {
    try {
      const parsed = CountryDataSchema.parse(raw);
      map.set(iso, parsed);
    } catch (err) {
      throw new Error(
        `[data] countries/${iso}.json failed Zod validation: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
  _validatedCountryData = map;
  return map;
}

function loadGlossary(): GlossaryEntry[] {
  if (_validatedGlossary) return _validatedGlossary;
  try {
    _validatedGlossary = z.array(GlossaryEntrySchema).parse(glossaryRaw);
    return _validatedGlossary;
  } catch (err) {
    throw new Error(
      `[data] glossary.json failed Zod validation: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

export function getAllCountries(): Country[] {
  return loadCountriesMeta();
}

export function getCountryMeta(iso: string): Country | null {
  return getAllCountries().find((c) => c.iso_alpha3 === iso.toUpperCase()) ?? null;
}

export function getCountryData(iso: string): CountryData | null {
  return loadCountryData().get(iso.toUpperCase()) ?? null;
}

export function getAvailableCountryIsos(): string[] {
  return Array.from(loadCountryData().keys());
}

export function hasCountryData(iso: string): boolean {
  return loadCountryData().has(iso.toUpperCase());
}

export function getGlossary(): GlossaryEntry[] {
  return loadGlossary();
}

export function getGlossaryTerm(term: string): GlossaryEntry | null {
  return getGlossary().find((g) => g.term.toLowerCase() === term.toLowerCase()) ?? null;
}

let _validatedKnowledge: DecisionKnowledge | null = null;
function loadDecisionKnowledge(): DecisionKnowledge {
  if (_validatedKnowledge) return _validatedKnowledge;
  try {
    _validatedKnowledge = DecisionKnowledgeSchema.parse(decisionKnowledgeRaw);
    return _validatedKnowledge;
  } catch (err) {
    throw new Error(
      `[data] decision-knowledge.json failed Zod validation: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

/**
 * Look up a payment method by its country-JSON `payment_method` string.
 * Matching is fuzzy: normalised lowercase, strips parenthetical extras, trims.
 */
export function getPaymentInfo(method: string): PaymentInfo | null {
  const k = loadDecisionKnowledge();
  const norm = (s: string) =>
    s.toLowerCase().replace(/\s*\([^)]*\)/g, "").trim();
  const target = norm(method);
  return (
    k.payments.find(
      (p) => norm(p.id) === target || norm(p.display_name) === target,
    ) ?? null
  );
}

export function getCarrierInfo(name: string): CarrierInfo | null {
  const k = loadDecisionKnowledge();
  const norm = (s: string) => s.toLowerCase().trim();
  return (
    k.carriers.find(
      (c) => norm(c.id) === norm(name) || norm(c.display_name).includes(norm(name)),
    ) ?? null
  );
}

export function getWarehouseInfo(name: string): WarehouseInfo | null {
  const k = loadDecisionKnowledge();
  const norm = (s: string) => s.toLowerCase().trim();
  return (
    k.warehouses.find(
      (w) => norm(w.id) === norm(name) || norm(w.display_name).includes(norm(name)),
    ) ?? null
  );
}

let _validatedLebesgue: LebesgueCpm | null = null;
function loadLebesgueCpm(): LebesgueCpm {
  if (_validatedLebesgue) return _validatedLebesgue;
  try {
    _validatedLebesgue = LebesgueCpmSchema.parse(lebesgueCpmRaw);
    return _validatedLebesgue;
  } catch (err) {
    throw new Error(
      `[data] lebesgue-cpm.json failed Zod validation: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

export type LebesgueCpmEntry = {
  cpm_usd: number;
  source_name: string;
  source_url: string;
  period: string;
  fetched_at: string;
  confidence: "H" | "M" | "L";
};

/** Look up Lebesgue's Meta CPM for a country (returns null if not covered). */
export function getLebesgueMetaCpm(iso: string): LebesgueCpmEntry | null {
  const k = loadLebesgueCpm();
  const v = k.by_country[iso.toUpperCase()];
  if (v == null || !Number.isFinite(v)) return null;
  return {
    cpm_usd: v,
    source_name: k._source_name,
    source_url: k._source_url,
    period: k._period,
    fetched_at: k._fetched_at,
    confidence: k._confidence,
  };
}

export function getLebesgueMetadata(): LebesgueCpm {
  return loadLebesgueCpm();
}

let _validatedRoi: RoiBenchmarks | null = null;
export function getRoiBenchmarks(): RoiBenchmarks {
  if (_validatedRoi) return _validatedRoi;
  try {
    _validatedRoi = RoiBenchmarksSchema.parse(roiBenchmarksRaw);
    return _validatedRoi;
  } catch (err) {
    throw new Error(
      `[data] roi-benchmarks.json failed Zod validation: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

let _validatedCatalog: CategoryCatalog | null = null;
export function getCategoryCatalog(): CategoryCatalog {
  if (_validatedCatalog) return _validatedCatalog;
  try {
    _validatedCatalog = CategoryCatalogSchema.parse(categoryCatalogRaw);
    return _validatedCatalog;
  } catch (err) {
    throw new Error(
      `[data] category-catalog.json failed Zod validation: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

export type PolicyEventWithCountry = PolicyEvent & { source_country: string };

export function getPolicyEvents(): PolicyEventWithCountry[] {
  const events: PolicyEventWithCountry[] = [];
  for (const data of loadCountryData().values()) {
    for (const event of data.policy_events ?? []) {
      events.push({ ...event, source_country: data.country.iso_alpha3 });
    }
  }
  return events.sort((a, b) => a.event_date.localeCompare(b.event_date));
}

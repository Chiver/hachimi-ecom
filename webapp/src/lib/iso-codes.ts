/**
 * Numeric ISO 3166-1 → alpha-3 mapping for the 32 countries Hachimi tracks.
 * Used to join the world-atlas TopoJSON (which keys by numeric ISO) with
 * our Country data (keyed by alpha-3).
 */
export const NUMERIC_TO_ALPHA3: Record<string, string> = {
  "840": "USA",
  "124": "CAN",
  "484": "MEX",
  "826": "GBR",
  "276": "DEU",
  "250": "FRA",
  "380": "ITA",
  "724": "ESP",
  "528": "NLD",
  "752": "SWE",
  "578": "NOR",
  "756": "CHE",
  "616": "POL",
  "642": "ROU",
  "792": "TUR",
  "643": "RUS",
  "360": "IDN",
  "764": "THA",
  "704": "VNM",
  "608": "PHL",
  "458": "MYS",
  "702": "SGP",
  "356": "IND",
  "392": "JPN",
  "410": "KOR",
  "036": "AUS",
  "076": "BRA",
  "152": "CHL",
  "032": "ARG",
  "682": "SAU",
  "784": "ARE",
  "710": "ZAF",
};

export function numericToAlpha3(numericId: string | number): string | null {
  const key = String(numericId).padStart(3, "0");
  return NUMERIC_TO_ALPHA3[key] ?? null;
}

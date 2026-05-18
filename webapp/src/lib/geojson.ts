import { feature } from "topojson-client";
import type { FeatureCollection, Geometry, Position } from "geojson";
import type { Topology, Objects } from "topojson-specification";
import { numericToAlpha3 } from "./iso-codes";

export type CountryFeatureProps = {
  numeric_id: string;
  iso_a3: string | null;
  name: string;
};

/**
 * Split a polygon ring wherever a segment crosses the antimeridian (±180°).
 * Returns one or more rings. Without this fix, Russia (Chukotka jumps from
 * +180° to −170°) renders as a horizontal stripe across the entire Mercator
 * map.
 */
function splitRingAtAntimeridian(ring: Position[]): Position[][] {
  // Quick check: if no segment crosses, return as-is.
  let crosses = false;
  for (let i = 0; i < ring.length - 1; i++) {
    if (Math.abs(ring[i + 1][0] - ring[i][0]) > 180) {
      crosses = true;
      break;
    }
  }
  if (!crosses) return [ring];

  const out: Position[][] = [[]];
  let cur = out[0];

  for (let i = 0; i < ring.length - 1; i++) {
    const p1 = ring[i];
    const p2 = ring[i + 1];
    cur.push(p1);
    const dlon = p2[0] - p1[0];
    if (Math.abs(dlon) > 180) {
      // Crosses antimeridian. Interpolate to ±180.
      const sign = p1[0] > 0 ? 1 : -1;
      // Shift p2's longitude by ±360° so the segment becomes monotonic, then interp.
      const p2LonAdj = p2[0] + (dlon > 0 ? -360 : 360);
      const denom = p2LonAdj - p1[0];
      if (Math.abs(denom) < 1e-9) {
        // Degenerate segment along the antimeridian itself — don't try to cut.
        continue;
      }
      const ratio = (sign * 180 - p1[0]) / denom;
      const cutLat = p1[1] + ratio * (p2[1] - p1[1]);
      if (!Number.isFinite(cutLat)) {
        // Numerical issue (e.g. polar wraparound); bail out — caller falls back to original ring.
        return [ring];
      }
      cur.push([sign * 180, cutLat]);
      // Start a fresh ring on the opposite edge.
      cur = [[-sign * 180, cutLat]];
      out.push(cur);
    }
  }
  // Push the final vertex (which is the same as ring[0] for a closed ring).
  cur.push(ring[ring.length - 1]);

  // If we split into multiple pieces, the first and last pieces are actually
  // continuous around the original closing edge — merge them.
  if (out.length > 1) {
    const first = out[0];
    const last = out[out.length - 1];
    out[0] = [...last, ...first.slice(1)];
    out.pop();
  }

  // Close each ring (first == last) and discard degenerate rings.
  const cleaned = out
    .map((r) => {
      if (r.length < 3) return null;
      if (r[0][0] !== r[r.length - 1][0] || r[0][1] !== r[r.length - 1][1]) {
        r.push([...r[0]]);
      }
      // Guard against any NaN slipping through.
      if (r.some((p) => !Number.isFinite(p[0]) || !Number.isFinite(p[1]))) return null;
      return r;
    })
    .filter((r): r is Position[] => r !== null && r.length >= 4);

  // If cleaning erased everything (Antarctica-style polar polygon), fall back to original.
  return cleaned.length > 0 ? cleaned : [ring];
}

/** Apply antimeridian splitting to all rings of all polygons in a Geometry. */
function cutGeometryAtAntimeridian(geom: Geometry): Geometry {
  if (geom.type === "Polygon") {
    const newPolygons: Position[][][] = [];
    for (const ring of geom.coordinates) {
      const splits = splitRingAtAntimeridian(ring);
      for (const r of splits) newPolygons.push([r]);
    }
    if (newPolygons.length <= 1) {
      return { type: "Polygon", coordinates: newPolygons[0] ?? [] };
    }
    return { type: "MultiPolygon", coordinates: newPolygons };
  }
  if (geom.type === "MultiPolygon") {
    const newPolys: Position[][][] = [];
    for (const poly of geom.coordinates) {
      const rings = poly[0] ? splitRingAtAntimeridian(poly[0]) : [];
      const holes = poly.slice(1); // keep holes as-is (countries rarely have antimeridian-crossing holes)
      for (const r of rings) newPolys.push([r, ...holes]);
    }
    return { type: "MultiPolygon", coordinates: newPolys };
  }
  return geom;
}

export function topoToFeatureCollection(
  topo: Topology<Objects<{ name: string }>>,
): FeatureCollection<Geometry, CountryFeatureProps> {
  const obj = topo.objects.countries;
  if (!obj) throw new Error("world-110m: missing 'countries' object");
  const fc = feature(topo, obj) as unknown as FeatureCollection<
    Geometry,
    { name: string }
  >;
  const features = fc.features.map((f) => {
    const numericId = String(f.id ?? "");
    const iso_a3 = numericToAlpha3(numericId);
    // Only apply antimeridian cutting to countries we actually track / make
    // interactive. Untracked countries (Antarctica, Greenland, etc.) render
    // as a flat gray base, and the cutter can mangle polar polygons.
    const geometry =
      iso_a3 != null ? cutGeometryAtAntimeridian(f.geometry) : f.geometry;
    return {
      ...f,
      id: iso_a3 ?? numericId, // promote iso_a3 to feature.id for Mapbox feature-state
      geometry,
      properties: {
        numeric_id: numericId,
        iso_a3,
        name: f.properties?.name ?? "",
      },
    };
  });
  return { type: "FeatureCollection", features };
}

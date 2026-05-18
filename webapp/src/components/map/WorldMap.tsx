"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Map, {
  Source,
  Layer,
  type MapRef,
  type MapMouseEvent,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { useRouter } from "next/navigation";
import type { FeatureCollection } from "geojson";
import { topoToFeatureCollection, type CountryFeatureProps } from "@/lib/geojson";
import type { CountryScoreSummary } from "@/lib/scores";
import type { Country } from "@/types";
import { HoverPanel } from "./HoverPanel";
import { MetricFilter } from "./MetricFilter";
import {
  computeDomain,
  getMetric,
  valueToColor,
  type MetricKey,
} from "@/lib/metrics";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

type Props = {
  countries: Country[];
  scores: Record<string, CountryScoreSummary>;
};

export function WorldMap({ countries, scores }: Props) {
  const router = useRouter();
  const mapRef = useRef<MapRef | null>(null);
  const [geojson, setGeojson] = useState<FeatureCollection<
    GeoJSON.Geometry,
    CountryFeatureProps
  > | null>(null);
  const [hoveredIso, setHoveredIso] = useState<string | null>(null);
  const [cursor, setCursor] = useState<"grab" | "pointer">("grab");
  const [metricKey, setMetricKey] = useState<MetricKey>("composite_score");

  const metric = getMetric(metricKey);
  const domain = useMemo(() => computeDomain(metric, scores), [metric, scores]);

  // Load TopoJSON once on mount
  useEffect(() => {
    let cancelled = false;
    fetch("/world-110m.json")
      .then((r) => r.json())
      .then((topo) => {
        if (cancelled) return;
        setGeojson(topoToFeatureCollection(topo));
      })
      .catch((err) => {
        console.error("Failed to load world-110m.json", err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Pre-compute the fill-color paint expression (Mapbox match-by-iso_a3)
  // for the currently selected metric.
  const fillColorExpression = useMemo(() => {
    type Expr = string | number | Expr[];
    const match: Expr[] = [
      "match",
      ["coalesce", ["get", "iso_a3"], ""],
    ];
    for (const c of countries) {
      const summary = scores[c.iso_alpha3];
      match.push(c.iso_alpha3);
      match.push(valueToColor(metric, summary ? metric.accessor(summary) : null, domain));
    }
    match.push("#11172a"); // default: untracked countries
    return match;
  }, [countries, scores, metric, domain]);

  const hovered = hoveredIso ? scores[hoveredIso] ?? null : null;
  const hoveredCountry = hoveredIso
    ? countries.find((c) => c.iso_alpha3 === hoveredIso) ?? null
    : null;

  const onMouseMove = (e: MapMouseEvent) => {
    const feature = e.features?.[0];
    if (!feature) {
      if (hoveredIso) setHoveredIso(null);
      setCursor("grab");
      return;
    }
    const iso = (feature.properties?.iso_a3 as string | null) ?? null;
    if (iso !== hoveredIso) setHoveredIso(iso);
    setCursor(iso ? "pointer" : "grab");
  };

  const onClick = (e: MapMouseEvent) => {
    const feature = e.features?.[0];
    const iso = feature?.properties?.iso_a3 as string | null;
    if (iso) router.push(`/country/${iso}`);
  };

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center text-[var(--color-text-dim)]">
        <div className="max-w-md">
          <h3 className="mb-2 text-lg font-semibold text-[var(--color-text)]">
            缺少 Mapbox token
          </h3>
          <p className="text-sm">
            请在 <code className="rounded bg-[var(--color-surface)] px-1.5 py-0.5">.env.local</code>{" "}
            中设置：
          </p>
          <pre className="mt-3 rounded-md bg-[var(--color-surface)] p-3 text-left text-xs">
            NEXT_PUBLIC_MAPBOX_TOKEN=pk.xxxx
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{ latitude: 20, longitude: 10, zoom: 1.5 }}
        minZoom={1}
        maxZoom={6}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        projection="mercator"
        renderWorldCopies={false}
        maxBounds={[
          [-180, -78],
          [180, 84],
        ]}
        interactiveLayerIds={["country-fill"]}
        cursor={cursor}
        onMouseMove={onMouseMove}
        onMouseLeave={() => setHoveredIso(null)}
        onClick={onClick}
      >
        {geojson && (
          <Source id="countries" type="geojson" data={geojson} promoteId="iso_a3">
            <Layer
              id="country-fill"
              type="fill"
              paint={{
                "fill-color": fillColorExpression as unknown as
                  | string
                  | mapboxgl.Expression,
                "fill-opacity": [
                  "case",
                  ["boolean", ["feature-state", "hover"], false],
                  0.92,
                  0.78,
                ] as unknown as number,
              }}
            />
            <Layer
              id="country-border"
              type="line"
              paint={{
                "line-color": "#2a335a",
                "line-width": 0.4,
              }}
            />
            <Layer
              id="country-border-hover"
              type="line"
              filter={["==", ["get", "iso_a3"], hoveredIso ?? "__none__"]}
              paint={{
                "line-color": "#10b981",
                "line-width": 1.6,
              }}
            />
          </Source>
        )}
      </Map>

      {/* Bottom-left: metric filter (color dimension switcher + legend) */}
      <MetricFilter
        value={metricKey}
        onChange={setMetricKey}
        domain={domain}
        metric={metric}
      />

      {/* Hover side panel */}
      {hoveredCountry && (
        <HoverPanel
          country={hoveredCountry}
          summary={hovered}
          activeMetric={metricKey}
        />
      )}
    </div>
  );
}

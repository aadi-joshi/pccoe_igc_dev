"use client";

import { useMemo } from "react";
import type { MetLevel, Site, Station, SunExposure } from "@/lib/types";
import { ZONES, zoneKey } from "@/lib/zones";

/**
 * Pune district station map.
 *
 * Deliberately not a tile map. A Leaflet/Mapbox basemap needs a live tile
 * server, which is exactly the dependency you do not want on a conference
 * hall's WiFi during a five-minute demo. Projecting the real coordinates
 * ourselves costs nothing, cannot fail, and reads as designed rather than
 * as a default.
 *
 * Longitude is scaled by cos(latitude) so the district is not stretched.
 */

const VIEW_W = 300;
const VIEW_H = 260;
const PAD = 22;

export function StationMap({
  stations,
  sites,
  activeSiteId,
  metLevel,
  exposure,
  onSelectSite,
}: {
  stations: Station[];
  sites: Site[];
  activeSiteId: string;
  metLevel: MetLevel;
  exposure: SunExposure;
  onSelectSite: (id: string) => void;
}) {
  const key = zoneKey(metLevel, exposure);

  const project = useMemo(() => {
    const lats = [...stations.map((s) => s.lat), ...sites.map((s) => s.lat)];
    const lons = [...stations.map((s) => s.lon), ...sites.map((s) => s.lon)];
    if (lats.length === 0) return null;

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);
    const midLat = (minLat + maxLat) / 2;
    const kx = Math.cos((midLat * Math.PI) / 180);

    const spanLon = Math.max(1e-6, (maxLon - minLon) * kx);
    const spanLat = Math.max(1e-6, maxLat - minLat);
    // One scale for both axes keeps the geography undistorted.
    const scale = Math.min((VIEW_W - PAD * 2) / spanLon, (VIEW_H - PAD * 2) / spanLat);

    const offsetX = (VIEW_W - spanLon * scale) / 2;
    const offsetY = (VIEW_H - spanLat * scale) / 2;

    return (lat: number, lon: number) => ({
      x: offsetX + (lon - minLon) * kx * scale,
      // Latitude increases northward, SVG y increases downward.
      y: offsetY + (maxLat - lat) * scale,
    });
  }, [stations, sites]);

  if (!project) return null;

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className="block h-auto w-full"
      role="img"
      aria-label={`${stations.length} SHRAM stations across Pune district with ${sites.length} registered work sites`}
    >
      <rect width={VIEW_W} height={VIEW_H} fill="var(--color-paper-sunk)" opacity={0.5} />

      {/* Faint graticule, purely to give the plot a frame of reference */}
      {Array.from({ length: 7 }, (_, i) => (
        <line
          key={`v${i}`}
          x1={(VIEW_W / 6) * i}
          x2={(VIEW_W / 6) * i}
          y1={0}
          y2={VIEW_H}
          stroke="var(--color-rule)"
          strokeWidth={0.5}
          opacity={0.6}
        />
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <line
          key={`h${i}`}
          x1={0}
          x2={VIEW_W}
          y1={(VIEW_H / 5) * i}
          y2={(VIEW_H / 5) * i}
          stroke="var(--color-rule)"
          strokeWidth={0.5}
          opacity={0.6}
        />
      ))}

      {stations.map((s) => {
        const p = project(s.lat, s.lon);
        const zone = s.zones[key] ?? 1;
        return (
          <g key={s.id}>
            <circle
              cx={p.x}
              cy={p.y}
              r={4}
              fill={ZONES[zone].colorVar}
              stroke="var(--color-paper-raised)"
              strokeWidth={1}
              opacity={0.92}
            >
              <title>
                {`${s.name} — Zone ${zone}, ${s.tempC.toFixed(1)}°C, ${s.rhPct.toFixed(0)}% RH`}
              </title>
            </circle>
          </g>
        );
      })}

      {sites.map((site) => {
        const p = project(site.lat, site.lon);
        const active = site.id === activeSiteId;
        return (
          <g
            key={site.id}
            onClick={() => onSelectSite(site.id)}
            className="cursor-pointer"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelectSite(site.id);
              }
            }}
          >
            <title>{`${site.name} — ${site.locality}`}</title>
            {active && (
              <circle
                cx={p.x}
                cy={p.y}
                r={11}
                fill="none"
                stroke="var(--color-ink)"
                strokeWidth={1}
                opacity={0.45}
              />
            )}
            <rect
              x={p.x - 4.5}
              y={p.y - 4.5}
              width={9}
              height={9}
              fill={active ? "var(--color-ink)" : "var(--color-paper-raised)"}
              stroke="var(--color-ink)"
              strokeWidth={1.5}
              transform={`rotate(45 ${p.x} ${p.y})`}
            />
          </g>
        );
      })}

      <text
        x={PAD - 10}
        y={VIEW_H - 8}
        className="label"
        fontSize={8.5}
        fill="var(--color-ink-faint)"
      >
        PUNE DISTRICT · {stations.length} SHRAM STATIONS
      </text>
    </svg>
  );
}

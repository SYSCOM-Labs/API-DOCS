import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import type { GpsMarker } from "../types";

const carIcon = (directionDeg = 0) =>
  L.divIcon({
    className: "fleet-car-marker",
    html: `<div class="fleet-car-marker-inner" style="transform:rotate(${directionDeg}deg)" aria-hidden="true">🚗</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

interface FleetMapProps {
  markers: GpsMarker[] | Record<string, GpsMarker>;
  trails?: Record<string, Array<{ lat: number; lng: number }>>;
  staleSerials?: Set<string>;
  emptyHint?: string;
  height?: string;
  /** Serial principal para centrar el mapa (evita saltos entre vehículos). */
  focusSerial?: string;
}

function MapRecenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  const last = useRef<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (last.current?.lat === lat && last.current?.lng === lng) return;
    last.current = { lat, lng };
    map.flyTo([lat, lng], 14, { duration: 0.6 });
  }, [lat, lng, map]);

  return null;
}

export function FleetMap({
  markers,
  trails = {},
  staleSerials,
  emptyHint,
  height = "280px",
  focusSerial,
}: FleetMapProps) {
  const list = (Array.isArray(markers) ? markers : Object.values(markers)).sort((a, b) =>
    a.deviceSerial.localeCompare(b.deviceSerial)
  );
  const hasMarkers = list.length > 0;
  const focus =
    (focusSerial ? list.find((m) => m.deviceSerial === focusSerial) : undefined) ??
    list[0] ??
    null;
  const center: [number, number] = focus
    ? [focus.lat, focus.lng]
    : [28.628561, -106.070414];

  return (
    <div
      style={{ height }}
      className="relative overflow-hidden rounded-2xl border border-black/[0.08] shadow-card"
    >
      <MapContainer
        center={center}
        zoom={hasMarkers ? 14 : 12}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {focus && <MapRecenter lat={focus.lat} lng={focus.lng} />}
        {Object.entries(trails).map(([serial, points]) => {
          const marker = list.find((m) => m.deviceSerial === serial);
          if (!marker || points.length < 2) return null;
          const trailPoints = points.map((p) => [p.lat, p.lng] as [number, number]);
          const last = trailPoints[trailPoints.length - 1];
          if (last[0] !== marker.lat || last[1] !== marker.lng) {
            trailPoints.push([marker.lat, marker.lng]);
          }
          return (
            <Polyline
              key={`trail-${serial}`}
              positions={trailPoints}
              pathOptions={{ color: "#38bdf8", weight: 3, opacity: 0.85 }}
            />
          );
        })}
        {list.map((m) => {
          const stale = staleSerials?.has(m.deviceSerial);
          return (
            <Marker
              key={m.deviceSerial}
              position={[m.lat, m.lng]}
              icon={carIcon(m.directionDeg)}
              opacity={stale ? 0.75 : 1}
            >
              <Popup>
                <strong>{m.licensePlate || m.deviceSerial}</strong>
                {stale && (
                  <>
                    <br />
                    <span className="text-xs text-amber-600">Última posición conocida</span>
                  </>
                )}
                <br />
                {m.speedKmh} km/h · {m.directionDeg}°
                <br />
                <span className="text-xs">{m.lastUpdate}</span>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {!hasMarkers && emptyHint && (
        <div className="pointer-events-none absolute inset-0 z-[500] flex items-center justify-center bg-white/60 p-6 backdrop-blur-[2px]">
          <div className="max-w-sm rounded-2xl bg-white px-5 py-4 text-center text-sm leading-relaxed text-ink-secondary shadow-panel">
            {emptyHint}
          </div>
        </div>
      )}
    </div>
  );
}

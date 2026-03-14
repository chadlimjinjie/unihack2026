"use client";

import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

export default function EmbeddedMap(): JSX.Element {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!MAPBOX_TOKEN) {
      console.warn("Missing Mapbox token. Set NEXT_PUBLIC_MAPBOX_TOKEN in your environment.");
      return;
    }

    mapboxgl.accessToken = MAPBOX_TOKEN;

    if (mapContainer.current && !mapRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [145.1330, -37.9105],
        zoom: 16,
      });

      mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");

      mapRef.current.on("load", async () => {
        let locations: Array<any> = [];
        try {
          const res = await fetch('/api/map/locations');
          if (res.ok) {
            const json = await res.json();
            locations = json.locations ?? [];
          } else {
            console.warn('GET /api/map/locations returned', res.status);
          }
        } catch (err) {
          console.warn('Failed to fetch saved locations', err);
        }

        locations.forEach((loc: any) => {
          const coords = loc.coordinates ?? loc.lnglat ?? loc.location;
          if (!coords || (loc.type !== 'basketball' && loc.type !== 'key')) return;

          const el = document.createElement('div');
                    if (loc.type === 'basketball') {
                      el.innerHTML = `<img src="/icons/basketball-15.svg" alt="Basketball court" style="width:28px;height:28px;display:inline-block;transform:translate(-50%,-50%);"/>`;
                      el.style.width = '28px';
                      el.style.height = '28px';
                      el.style.display = 'inline-block';
                      el.style.transform = 'translate(-50%, -50%)';
                      el.setAttribute('aria-label', loc.title ?? 'Basketball court');
                      el.setAttribute('role', 'img');
                    } else {
            el.style.width = '14px';
            el.style.height = '14px';
            el.style.background = 'rgba(30, 144, 255, 0.85)';
            el.style.border = '2px solid rgba(255,255,255,0.9)';
            el.style.borderRadius = '50%';
            el.style.boxShadow = '0 1px 4px rgba(0,0,0,0.35)';
            el.style.transform = 'translate(-50%, -50%)';
            el.setAttribute('aria-label', loc.title ?? 'Key location');
            el.setAttribute('role', 'img');
          }

                    const popupHtml = `
                      <div style="min-width:160px">
                        <strong>${loc.title ?? ''}</strong>
                        ${loc.subtitle ? `<div style="font-size:12px;color:var(--muted-foreground)">${loc.subtitle}</div>` : ''}
                        ${loc.courtId ? `<div style="margin-top:6px"><a href="/courts/${loc.courtId}" style="color:#0070f3">View court</a></div>` : ''}
                      </div>
                    `;

                    const marker = new mapboxgl.Marker({ element: el })
                        .setLngLat(coords as [number, number])
                        .setPopup(new mapboxgl.Popup({ offset: 12 }).setHTML(popupHtml))
                        .addTo(mapRef.current as mapboxgl.Map);

          markersRef.current.push(marker);
        });
      });
    }

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="p-4">
        <h3 className="text-lg font-medium">Mapbox token not found</h3>
        <p className="text-sm text-muted-foreground">Set NEXT_PUBLIC_MAPBOX_TOKEN in your environment.</p>
      </div>
    );
  }

  return (
    <div style={{ height: "100%", width: "100%", position: "relative" }}>
      <div ref={mapContainer} style={{ position: "absolute", inset: 0 }} id="map" />
    </div>
  );
}

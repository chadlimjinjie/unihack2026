"use client";

import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

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
        style: "mapbox://styles/mapbox/streets-v12",
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

        const map = mapRef.current;

        locations.forEach((loc: any) => {
          const coords = loc.coordinates ?? loc.lnglat ?? loc.location;
          if (!coords || (loc.type !== 'basketball' && loc.type !== 'key')) return;

          const el = document.createElement('div');
          el.className = 'map-marker-basketball';
          if (loc.type === 'basketball') {
            el.innerHTML = `<img src="/icons/basketball-15.svg" alt="Basketball court" style="width:28px;height:28px;display:block;transform:translate(-50%,-50%);pointer-events:none;"/>`;
            el.style.width = '28px';
            el.style.height = '28px';
            el.style.cursor = 'pointer';
            el.style.transform = 'translate(-50%, -50%)';
            el.setAttribute('aria-label', loc.title ?? 'Basketball court');
            el.setAttribute('role', 'button');
          } else {
            el.style.width = '14px';
            el.style.height = '14px';
            el.style.background = 'rgba(30, 144, 255, 0.85)';
            el.style.border = '2px solid rgba(255,255,255,0.9)';
            el.style.borderRadius = '50%';
            el.style.boxShadow = '0 1px 4px rgba(0,0,0,0.35)';
            el.style.transform = 'translate(-50%, -50%)';
            el.style.cursor = 'pointer';
            el.setAttribute('aria-label', loc.title ?? 'Key location');
            el.setAttribute('role', 'img');
          }

          const imageUrl = loc.image ?? '';
          const rating = loc.rating != null ? Number(loc.rating) : null;
          const reviewCount = Number(loc.reviewCount) || 0;
          const starLabel =
            rating != null
              ? reviewCount > 0
                ? `★ ${rating.toFixed(1)} (${reviewCount} ${reviewCount === 1 ? 'review' : 'reviews'})`
                : `★ ${rating.toFixed(1)}`
              : '';
          const ratingHtml = starLabel
            ? `<div style="font-size:13px;margin-bottom:6px;color:#0f172a;">${escapeHtml(starLabel)}</div>`
            : '';
          const popupHtml = `
            <div class="mapbox-popup-blurb" style="min-width:200px;max-width:260px;">
              <strong style="display:block;font-size:14px;margin-bottom:4px;">${escapeHtml(loc.title ?? '')}</strong>
              ${ratingHtml}
              ${loc.subtitle ? `<div style="font-size:12px;color:#64748b;margin-bottom:8px;">${escapeHtml(loc.subtitle)}</div>` : ''}
              ${imageUrl ? `<img src="${escapeHtml(imageUrl)}" alt="" style="width:100%;height:100px;object-fit:cover;border-radius:6px;margin-bottom:8px;display:block;" />` : ''}
              ${loc.courtId ? `<a href="/courts/${escapeHtml(loc.courtId)}" class="mapbox-popup-view-btn" style="display:inline-block;margin-top:6px;padding:6px 12px;background:var(--primary);color:var(--primary-foreground);border-radius:6px;font-size:13px;font-weight:500;text-decoration:none;border:none;cursor:pointer;">View court</a>` : ''}
            </div>
          `;

          const popup = new mapboxgl.Popup({ offset: 12 }).setHTML(popupHtml);

          const marker = new mapboxgl.Marker({ element: el })
            .setLngLat(coords as [number, number])
            .setPopup(popup)
            .addTo(map);

          el.addEventListener('click', () => {
            map.flyTo({ center: coords as [number, number], zoom: 17, duration: 800 });
          });

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

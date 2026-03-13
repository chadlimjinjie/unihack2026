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
                        el.innerHTML = `
                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                              <circle cx="12" cy="12" r="10" fill="#ff6b00" />
                              <path d="M2 12a10 10 0 0 0 20 0" stroke="#fff" stroke-width="1.2" fill="none" />
                              <path d="M12 2a10 10 0 0 0 0 20" stroke="#fff" stroke-width="1.2" fill="none" />
                              <path d="M5 5l14 14" stroke="#fff" stroke-width="1" stroke-linecap="round" />
                              <path d="M19 5L5 19" stroke="#fff" stroke-width="1" stroke-linecap="round" />
                            </svg>
                        `;
                        el.style.width = '28px';
                        el.style.height = '28px';
                        el.style.display = 'inline-block';
                        el.style.transform = 'translate(-50%, -50%)';
                        el.setAttribute('aria-label', loc.title ?? 'Basketball');
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

                    const marker = new mapboxgl.Marker({ element: el })
                        .setLngLat(coords as [number, number])
                        .setPopup(new mapboxgl.Popup({ offset: 12 }).setText(loc.title ?? ''))
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

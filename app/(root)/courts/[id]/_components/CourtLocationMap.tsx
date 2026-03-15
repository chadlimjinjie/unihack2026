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

type Props = {
  latitude: number;
  longitude: number;
  courtName: string | null;
};

export default function CourtLocationMap({
  latitude,
  longitude,
  courtName,
}: Props): React.JSX.Element {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const center: [number, number] = [longitude, latitude];

  useEffect(() => {
    if (!MAPBOX_TOKEN) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    if (mapContainer.current && !mapRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center,
        zoom: 16,
      });

      mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");

      mapRef.current.on("load", () => {
        const map = mapRef.current;
        if (!map) return;

        const el = document.createElement("div");
        el.className = "court-location-marker";
        el.innerHTML = `<img src="/icons/basketball-15.svg" alt="Court" style="width:32px;height:32px;display:block;transform:translate(-50%,-50%);pointer-events:none;"/>`;
        el.style.width = "32px";
        el.style.height = "32px";
        el.style.cursor = "pointer";

        const popup = new mapboxgl.Popup({ offset: 16 }).setHTML(
          `<div style="min-width:140px;"><strong>${escapeHtml(courtName ?? "Court")}</strong></div>`
        );

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat(center)
          .setPopup(popup)
          .addTo(map);
        markerRef.current = marker;
      });
    }

    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [latitude, longitude, courtName]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="rounded-xl border border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        Map unavailable. Set NEXT_PUBLIC_MAPBOX_TOKEN to show the court location.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div ref={mapContainer} className="h-64 w-full" />
    </div>
  );
}

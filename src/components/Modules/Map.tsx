"use client";

import hoopIcon from "@/assets/dashboard/basketball-hoop.png";
import { useEffect, useRef, useState } from "react";

export type Pin = {
  id: number | string;
  lat: number;
  lng: number;
  title?: string;
  address?: string;
  url?: string;
};

// High-definition glowing basketball hoop SVG marker
const HOOP_MARKER_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="46" height="46" viewBox="0 0 46 46" fill="none">
  <defs>
    <filter id="aura" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="3.5" result="blur" />
      <feColorMatrix type="matrix" values="
        1 0 0 0 0.984
        0 0.639 0 0 0.059
        0 0 0 0 0
        0 0 0 0.95 0" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <!-- Glowing Outer Aura -->
  <g filter="url(#aura)">
    <!-- Backboard -->
    <rect x="9" y="8" width="28" height="20" rx="4.5" stroke="#FBA30F" stroke-width="2.5" fill="#141416" fill-opacity="0.9" />
    <!-- Inner Target Square -->
    <rect x="17" y="14" width="12" height="9" rx="1.5" stroke="#FBA30F" stroke-width="1.8" fill="none" opacity="0.95" />
    <!-- Rim -->
    <ellipse cx="23" cy="27.5" rx="7.5" ry="2.2" stroke="#FBA30F" stroke-width="2.2" fill="none" />
    <!-- Net Grid -->
    <path d="M17 28.5 L19.5 37.5 L23 39.5 L26.5 37.5 L29 28.5" stroke="#FBA30F" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none" />
    <path d="M20 28.5 L23 37.5 L26 28.5" stroke="#FBA30F" stroke-width="1.3" fill="none" />
    <path d="M18 33 L28 33" stroke="#FBA30F" stroke-width="1.3" fill="none" opacity="0.85" />
  </g>
</svg>
`)}`;

export default function Map({
  pins,
  center = { lat: 26.22, lng: -98.25 },
  zoom = 11,
}: {
  pins: Pin[];
  center?: { lat: number; lng: number };
  zoom?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const circlesRef = useRef<any[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  // 1. Initialize Map Instance Once
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!key) return;

    const existing = document.querySelector(`script[data-google-maps]`);
      const initMap = () => {
      if (!ref.current || mapRef.current) return;

      mapRef.current = new (window as any).google.maps.Map(ref.current, {
        center,
        zoom,
        disableDefaultUI: true,
        zoomControl: true,
        styles: [
          { elementType: "geometry", stylers: [{ color: "#141417" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#141417" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#8a8a94" }] },
          {
            featureType: "administrative.locality",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
          },
          {
            featureType: "poi",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
          },
          {
            featureType: "poi.park",
            elementType: "geometry",
            stylers: [{ color: "#18201a" }],
          },
          {
            featureType: "poi.park",
            elementType: "labels.text.fill",
            stylers: [{ color: "#6b9a76" }],
          },
          {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#222226" }],
          },
          {
            featureType: "road",
            elementType: "geometry.stroke",
            stylers: [{ color: "#17171a" }],
          },
          {
            featureType: "road",
            elementType: "labels.text.fill",
            stylers: [{ color: "#8a8a94" }],
          },
          {
            featureType: "road.highway",
            elementType: "geometry",
            stylers: [{ color: "#333338" }],
          },
          {
            featureType: "road.highway",
            elementType: "geometry.stroke",
            stylers: [{ color: "#1a1a1f" }],
          },
          {
            featureType: "road.highway",
            elementType: "labels.text.fill",
            stylers: [{ color: "#f3d19c" }],
          },
          {
            featureType: "transit",
            elementType: "geometry",
            stylers: [{ color: "#242429" }],
          },
          {
            featureType: "transit.station",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#0a0a0d" }],
          },
          {
            featureType: "water",
            elementType: "labels.text.fill",
            stylers: [{ color: "#3d4450" }],
          },
          {
            featureType: "water",
            elementType: "labels.text.stroke",
            stylers: [{ color: "#0a0a0d" }],
          },
        ],
      });

      setMapLoaded(true);
    };

    if (existing) {
      if (!(window as any).google) {
        existing.addEventListener("load", initMap);
      } else {
        initMap();
      }
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}`;
    script.defer = true;
    script.setAttribute("data-google-maps", "true");
    script.onload = initMap;
    document.head.appendChild(script);
  }, []); // Run only once on mount

  // 2. Handle Pins and Markers
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !(window as any).google) return;

    // Clear old markers and circles
    markersRef.current.forEach((m) => m.setMap(null));
    circlesRef.current.forEach((c) => c.setMap(null));
    markersRef.current = [];
    circlesRef.current = [];

    const infoWindow = new (window as any).google.maps.InfoWindow({
      disableAutoPan: false,
      pixelOffset: new (window as any).google.maps.Size(0, -14),
    });

    const closeInfoWindow = () => infoWindow.close();

    // Add Custom Hoop Markers matching Image 1
    pins.forEach((p) => {
      const marker = new (window as any).google.maps.Marker({
        position: { lat: p.lat, lng: p.lng },
        map: mapRef.current,
        icon: {
          url: HOOP_MARKER_SVG,
          scaledSize: new (window as any).google.maps.Size(42, 42),
          anchor: new (window as any).google.maps.Point(21, 21),
        },
        title: p.title || "Basketball Court",
      });

      // Glowing halo circle on the ground
      const circle = new (window as any).google.maps.Circle({
        strokeWeight: 0,
        fillColor: "#FBA30F",
        fillOpacity: 0.18,
        map: mapRef.current,
        center: { lat: p.lat, lng: p.lng },
        radius: 70,
      });

      markersRef.current.push(marker);
      circlesRef.current.push(circle);

      marker.addListener("click", () => {
        closeInfoWindow();

        const title = p.title || "Astoria Park Courts";
        const address = p.address || "350 5th Ave, New York NY 10118";
        const url = p.url || `/all-court/${p.id}`;

        // InfoWindow Content matching Image 2 perfectly
        infoWindow.setContent(`
          <div style="width: 270px; background: #111111; color: #ffffff; border-radius: 18px; padding: 18px 18px 18px; box-shadow: 0 20px 45px rgba(0,0,0,0.9), 0 0 25px rgba(251,163,15,0.22); font-family: Inter, system-ui, -apple-system, sans-serif; position: relative; box-sizing: border-box; text-align: center;">
            
            <!-- Close Button -->
            <button id="map-popup-close" aria-label="Close" style="position: absolute; right: 12px; top: 12px; width: 24px; height: 24px; border: 0; background: transparent; color: #9ca3af; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 18px; line-height: 1; transition: color 0.2s;">
              ✕
            </button>

            <!-- Basketball Hoop Icon -->
            <div style="display: flex; justify-content: center; margin-top: 4px; margin-bottom: 12px;">
              <div style="width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 0 10px rgba(251,163,15,0.7));">
                <svg width="44" height="44" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="9" y="8" width="28" height="20" rx="4.5" stroke="#ffffff" stroke-width="2.5" fill="#18181b" />
                  <rect x="17" y="14" width="12" height="9" rx="1.5" stroke="#ffffff" stroke-width="1.8" fill="none" opacity="0.9" />
                  <ellipse cx="23" cy="27.5" rx="7.5" ry="2.2" stroke="#ffffff" stroke-width="2.2" fill="none" />
                  <path d="M17 28.5 L19.5 37.5 L23 39.5 L26.5 37.5 L29 28.5" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none" />
                  <path d="M20 28.5 L23 37.5 L26 28.5" stroke="#ffffff" stroke-width="1.3" fill="none" />
                  <path d="M18 33 L28 33" stroke="#ffffff" stroke-width="1.3" fill="none" opacity="0.85" />
                </svg>
              </div>
            </div>

            <!-- Court Title -->
            <div style="font-size: 19px; font-weight: 700; color: #ffffff; line-height: 1.25; margin-bottom: 6px; letter-spacing: -0.2px;">
              ${title}
            </div>

            <!-- Court Address -->
            <div style="font-size: 13px; color: #9ca3af; margin-bottom: 18px; line-height: 1.4; font-weight: 400;">
              ${address}
            </div>

            <!-- View Court Action Button -->
            <a href="${url}" style="display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; box-sizing: border-box; border-radius: 12px; padding: 12px 16px; background: linear-gradient(90deg, #FBA30F 0%, #D25A00 100%); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px; box-shadow: 0 4px 16px rgba(251,163,15,0.4); transition: transform 0.15s, opacity 0.15s;">
              <span>View Court</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M7 17l9.2-9.2M17 17V7H7"/>
              </svg>
            </a>
          </div>
        `);

        infoWindow.open({
          anchor: marker,
          map: mapRef.current,
          shouldFocus: false,
        });

        window.setTimeout(() => {
          const closeButton = document.getElementById("map-popup-close");
          if (closeButton) {
            closeButton.onclick = closeInfoWindow;
            closeButton.onmouseover = () => {
              closeButton.style.color = "#ffffff";
            };
            closeButton.onmouseout = () => {
              closeButton.style.color = "#9ca3af";
            };
          }
        }, 0);
      });

      marker.addListener("mouseover", () => {
        marker.setZIndex(9999);
      });
    });

    // Auto-fit bounds if multiple pins exist
    if (pins.length > 0) {
      const bounds = new (window as any).google.maps.LatLngBounds();
      let valid = 0;
      pins.forEach((p) => {
        if (typeof p.lat === "number" && typeof p.lng === "number") {
          bounds.extend({ lat: p.lat, lng: p.lng });
          valid++;
        }
      });
      if (valid > 1) {
        mapRef.current.fitBounds(bounds);
      } else if (valid === 1) {
        mapRef.current.setCenter({ lat: pins[0].lat, lng: pins[0].lng });
      }
    } else if (center) {
      mapRef.current.setCenter(center);
    }

    const clickListener = mapRef.current.addListener("click", closeInfoWindow);
    
    return () => {
      if ((window as any).google?.maps?.event) {
        (window as any).google.maps.event.removeListener(clickListener);
      }
    };
  }, [pins, mapLoaded, center]);

  return (
    <div className="relative min-h-[620px] overflow-hidden rounded-2xl border border-white/10">
      {/* Global CSS to style Google Maps InfoWindow to match Image 2 */}
      <style jsx global>{`
        .gm-style .gm-style-iw-c {
          background-color: #111111 !important;
          border: 1px solid rgba(251, 163, 15, 0.35) !important;
          border-radius: 18px !important;
          padding: 0 !important;
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.9), 0 0 25px rgba(251, 163, 15, 0.25) !important;
          max-width: 300px !important;
        }
        .gm-style .gm-style-iw-d {
          overflow: visible !important;
          padding: 0 !important;
          max-height: none !important;
        }
        .gm-style .gm-style-iw-tc::after {
          background-color: #111111 !important;
        }
        .gm-style-iw-chr {
          display: none !important;
        }
        .gm-ui-hover-effect {
          display: none !important;
        }
      `}</style>
      <div ref={ref} className="h-[720px] w-full rounded-2xl" />
      {!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/60 text-white">
          <p className="text-sm">
            Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to display the map
          </p>
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const TILE_URL = 'https://cdn.th.gl/once-human/map-tiles/default/{z}/{y}/{x}.webp';
const TILE_SIZE = 512;
const MIN_ZOOM = 0;
const MAX_NATIVE_ZOOM = 4;
const MAX_ZOOM = 6;
// At zoom 0, 1 tile of 512px → bounds [0,0] to [-512, 512] in CRS.Simple
const MAP_SIZE = 512;

// Convert percentage coords (0-100) to Leaflet CRS.Simple coords
export function pctToLatLng(x, y) {
  return L.latLng(-(y / 100) * MAP_SIZE, (x / 100) * MAP_SIZE);
}

// Convert Leaflet CRS.Simple coords back to percentage
export function latLngToPct(latlng) {
  return { x: (latlng.lng / MAP_SIZE) * 100, y: (-latlng.lat / MAP_SIZE) * 100 };
}

function createPinIcon(color) {
  return L.divIcon({
    className: 'custom-pin',
    html: `<div style="
      width:12px;height:12px;border-radius:50%;
      background:${color};
      border:2px solid rgba(10,10,10,0.8);
      box-shadow:0 0 12px ${color}80, 0 0 4px ${color}40;
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

export default function LeafletMap({ pins, selectedPin, onMapClick, onPinClick }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const onMapClickRef = useRef(onMapClick);
  const onPinClickRef = useRef(onPinClick);

  onMapClickRef.current = onMapClick;
  onPinClickRef.current = onPinClick;

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      crs: L.CRS.Simple,
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      zoomSnap: 1,
      zoomDelta: 1,
      zoomControl: false,
      attributionControl: false,
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    L.tileLayer(TILE_URL, {
      tileSize: TILE_SIZE,
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      maxNativeZoom: MAX_NATIVE_ZOOM,
      noWrap: true,
    }).addTo(map);

    const bounds = L.latLngBounds(
      L.latLng(0, 0),
      L.latLng(-MAP_SIZE, MAP_SIZE),
    );
    map.fitBounds(bounds);
    map.setMaxBounds(bounds.pad(0.1));

    map.on('click', (e) => {
      const pct = latLngToPct(e.latlng);
      if (pct.x >= 0 && pct.x <= 100 && pct.y >= 0 && pct.y <= 100) {
        onMapClickRef.current?.(pct);
      }
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = {};
    };
  }, []);

  // Sync markers with pins
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const currentIds = new Set(pins.map(p => p.id));
    // Remove markers for deleted pins
    for (const id of Object.keys(markersRef.current)) {
      if (!currentIds.has(Number(id))) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    }

    // Add/update markers
    for (const pin of pins) {
      const latlng = pctToLatLng(pin.x, pin.y);
      if (markersRef.current[pin.id]) {
        markersRef.current[pin.id].setLatLng(latlng);
        markersRef.current[pin.id].setIcon(createPinIcon(pin.color));
      } else {
        const marker = L.marker(latlng, { icon: createPinIcon(pin.color) });
        // Label tooltip
        marker.bindTooltip(pin.label, {
          permanent: true,
          direction: 'top',
          offset: [0, -10],
          className: 'pin-tooltip',
        });
        marker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          onPinClickRef.current?.(pin);
        });
        marker.addTo(map);
        markersRef.current[pin.id] = marker;
      }
    }
  }, [pins]);

  // Fly to selected pin
  useEffect(() => {
    if (!selectedPin || !mapRef.current) return;
    const latlng = pctToLatLng(selectedPin.x, selectedPin.y);
    mapRef.current.setView(latlng, 3, { animate: true });
  }, [selectedPin]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        minHeight: 500,
        borderRadius: 14,
        overflow: 'hidden',
        border: '1px solid var(--border)',
      }}
    />
  );
}

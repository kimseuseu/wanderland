'use client';

import { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const TILE_URL = 'https://cdn.th.gl/once-human/map-tiles/default/{z}/{y}/{x}.webp';
const TILE_SIZE = 512;
const MIN_ZOOM = 0;
const MAX_NATIVE_ZOOM = 4;
const MAX_ZOOM = 6;

// ── Game coordinate constants (Once Human: 16km x 16km, 1 unit ≈ 1m) ──
// Adjust these if coordinates don't match in-game values
const GAME_MIN_X = -8192;
const GAME_MAX_X = 8192;
const GAME_MIN_Y = -8192;
const GAME_MAX_Y = 8192;
const GAME_WIDTH = GAME_MAX_X - GAME_MIN_X;   // 16384
const GAME_HEIGHT = GAME_MAX_Y - GAME_MIN_Y;  // 16384

// Custom CRS: maps game coordinates directly to tile pixel space
// At zoom 0, tile covers 512px. Transformation maps game coords → pixels.
// pixel_x = game_x * (TILE_SIZE/GAME_WIDTH) + (-GAME_MIN_X * TILE_SIZE/GAME_WIDTH)
// pixel_y = game_y * (-TILE_SIZE/GAME_HEIGHT) + (GAME_MAX_Y * TILE_SIZE/GAME_HEIGHT)
const GameCRS = L.Util.extend({}, L.CRS.Simple, {
  transformation: new L.Transformation(
    TILE_SIZE / GAME_WIDTH,                    // a = 0.03125
    -GAME_MIN_X * TILE_SIZE / GAME_WIDTH,      // b = 256
    -TILE_SIZE / GAME_HEIGHT,                   // c = -0.03125 (invert Y)
    GAME_MAX_Y * TILE_SIZE / GAME_HEIGHT        // d = 256
  ),
});

// Convert game coords (x, y) to Leaflet LatLng
// Leaflet uses (lat, lng) = (y, x)
export function gameToLatLng(x, y) {
  return L.latLng(y, x);
}

// Convert Leaflet LatLng to game coords
export function latLngToGame(latlng) {
  return { x: Math.round(latlng.lng), y: Math.round(latlng.lat) };
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
  const coordsRef = useRef(null);
  const onMapClickRef = useRef(onMapClick);
  const onPinClickRef = useRef(onPinClick);

  onMapClickRef.current = onMapClick;
  onPinClickRef.current = onPinClick;

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      crs: GameCRS,
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

    // Set bounds in game coordinates
    const bounds = L.latLngBounds(
      L.latLng(GAME_MIN_Y, GAME_MIN_X),  // southwest
      L.latLng(GAME_MAX_Y, GAME_MAX_X),  // northeast
    );
    map.fitBounds(bounds);
    map.setMaxBounds(bounds.pad(0.1));

    // Coordinate overlay
    const coordsDiv = L.DomUtil.create('div', 'map-coords-overlay');
    coordsDiv.textContent = '(0, 0)';
    containerRef.current.appendChild(coordsDiv);
    coordsRef.current = coordsDiv;

    map.on('mousemove', (e) => {
      const coords = latLngToGame(e.latlng);
      coordsDiv.textContent = `(${coords.x}, ${coords.y})`;
    });

    map.on('click', (e) => {
      const coords = latLngToGame(e.latlng);
      if (coords.x >= GAME_MIN_X && coords.x <= GAME_MAX_X &&
          coords.y >= GAME_MIN_Y && coords.y <= GAME_MAX_Y) {
        onMapClickRef.current?.(coords);
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
      const latlng = gameToLatLng(pin.x, pin.y);
      if (markersRef.current[pin.id]) {
        markersRef.current[pin.id].setLatLng(latlng);
        markersRef.current[pin.id].setIcon(createPinIcon(pin.color));
      } else {
        const marker = L.marker(latlng, { icon: createPinIcon(pin.color) });
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
    const latlng = gameToLatLng(selectedPin.x, selectedPin.y);
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
        position: 'relative',
      }}
    />
  );
}

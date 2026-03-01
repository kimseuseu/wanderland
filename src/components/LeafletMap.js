'use client';

import { useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const TILE_URL = 'https://cdn.th.gl/once-human/map-tiles/default/{z}/{y}/{x}.webp';
const TILE_SIZE = 512;
const MIN_ZOOM = 0;
const MAX_NATIVE_ZOOM = 4;
const MAX_ZOOM = 6;

// ── Game coordinate constants (Once Human: 16km x 16km, 1 unit ≈ 1m) ──
const GAME_MIN_X = -8192;
const GAME_MAX_X = 8192;
const GAME_MIN_Y = -8192;
const GAME_MAX_Y = 8192;
const GAME_WIDTH = GAME_MAX_X - GAME_MIN_X;   // 16384
const GAME_HEIGHT = GAME_MAX_Y - GAME_MIN_Y;  // 16384

const GameCRS = L.Util.extend({}, L.CRS.Simple, {
  transformation: new L.Transformation(
    TILE_SIZE / GAME_WIDTH,
    -GAME_MIN_X * TILE_SIZE / GAME_WIDTH,
    -TILE_SIZE / GAME_HEIGHT,
    GAME_MAX_Y * TILE_SIZE / GAME_HEIGHT
  ),
});

export function gameToLatLng(x, y) {
  return L.latLng(y, x);
}

export function latLngToGame(latlng) {
  return { x: Math.round(latlng.lng), y: Math.round(latlng.lat) };
}

const CATEGORY_ICONS = {
  boss: '💀',
  resource: '⛏️',
  dungeon: '🏛️',
  teleport: '🔷',
  npc: '👤',
  chest: '📦',
  landmark: '🏔️',
  etc: '📍',
};

function createPinIcon(color, category) {
  const emoji = CATEGORY_ICONS[category] || CATEGORY_ICONS.etc;
  return L.divIcon({
    className: 'custom-pin',
    html: `<div style="
      display:flex;align-items:center;justify-content:center;
      width:24px;height:24px;border-radius:50%;
      background:${color};
      border:2px solid rgba(10,10,10,0.8);
      box-shadow:0 0 12px ${color}80, 0 0 4px ${color}40;
      font-size:12px;line-height:1;
    ">${emoji}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

const LeafletMap = forwardRef(function LeafletMap(
  { pins, selectedPin, onMapClick, onPinClick, routes = [], drawingMode, drawingColor = '#ffaa44', onRoutePoint },
  ref
) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const coordsRef = useRef(null);
  const routeLayersRef = useRef([]);
  const drawingLayerRef = useRef(null);
  const drawingPointsRef = useRef([]);
  const onMapClickRef = useRef(onMapClick);
  const onPinClickRef = useRef(onPinClick);
  const onRoutePointRef = useRef(onRoutePoint);
  const drawingModeRef = useRef(drawingMode);

  onMapClickRef.current = onMapClick;
  onPinClickRef.current = onPinClick;
  onRoutePointRef.current = onRoutePoint;
  drawingModeRef.current = drawingMode;

  // Expose map methods to parent
  useImperativeHandle(ref, () => ({
    getMap: () => mapRef.current,
    clearDrawing: () => {
      if (drawingLayerRef.current) {
        drawingLayerRef.current.remove();
        drawingLayerRef.current = null;
      }
      drawingPointsRef.current = [];
    },
    getDrawingPoints: () => drawingPointsRef.current.map(latLngToGame),
  }), []);

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

    const bounds = L.latLngBounds(
      L.latLng(GAME_MIN_Y, GAME_MIN_X),
      L.latLng(GAME_MAX_Y, GAME_MAX_X),
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
      if (coords.x < GAME_MIN_X || coords.x > GAME_MAX_X ||
          coords.y < GAME_MIN_Y || coords.y > GAME_MAX_Y) return;

      if (drawingModeRef.current) {
        // Drawing mode: add point to polyline
        drawingPointsRef.current.push(e.latlng);
        if (drawingLayerRef.current) {
          drawingLayerRef.current.addLatLng(e.latlng);
        } else {
          drawingLayerRef.current = L.polyline([e.latlng], {
            color: drawingColor,
            weight: 3,
            opacity: 0.8,
            dashArray: '8, 6',
          }).addTo(map);
        }
        onRoutePointRef.current?.(coords);
      } else {
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

  // Update drawing polyline color
  useEffect(() => {
    if (drawingLayerRef.current) {
      drawingLayerRef.current.setStyle({ color: drawingColor });
    }
  }, [drawingColor]);

  // Sync markers with pins
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const currentIds = new Set(pins.map(p => p.id));
    for (const id of Object.keys(markersRef.current)) {
      if (!currentIds.has(Number(id))) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    }

    for (const pin of pins) {
      const latlng = gameToLatLng(pin.x, pin.y);
      if (markersRef.current[pin.id]) {
        markersRef.current[pin.id].setLatLng(latlng);
        markersRef.current[pin.id].setIcon(createPinIcon(pin.color, pin.category));
      } else {
        const marker = L.marker(latlng, { icon: createPinIcon(pin.color, pin.category) });
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

  // Sync routes (saved polylines)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old route layers
    for (const layer of routeLayersRef.current) {
      layer.remove();
    }
    routeLayersRef.current = [];

    // Draw saved routes
    for (const route of routes) {
      if (!route.points || route.points.length < 2) continue;
      const latlngs = route.points.map((p) => gameToLatLng(p.x, p.y));
      const polyline = L.polyline(latlngs, {
        color: route.color || '#ffaa44',
        weight: 3,
        opacity: 0.7,
        dashArray: '8, 6',
      }).addTo(map);
      if (route.label) {
        polyline.bindTooltip(route.label, { permanent: true, direction: 'center', className: 'route-tooltip' });
      }
      routeLayersRef.current.push(polyline);
    }
  }, [routes]);

  // Fly to selected pin
  useEffect(() => {
    if (!selectedPin || !mapRef.current) return;
    const latlng = gameToLatLng(selectedPin.x, selectedPin.y);
    mapRef.current.setView(latlng, 3, { animate: true });
  }, [selectedPin]);

  // Toggle cursor style for drawing mode
  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.style.cursor = drawingMode ? 'crosshair' : '';
  }, [drawingMode]);

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
});

export default LeafletMap;

'use client';

import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster';

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

// POI 카테고리 이모지 매핑
const POI_ICONS = {
  monolith: '🏛️', silo: '🔒', worldstone: '💠', village: '🏘️', camp: '⛺', transport: '🚁',
  crate_mystical: '✨', crate_weapon: '🗡️', crate_gear: '⚙️', crate_morphic: '🧬', hoard: '📦',
  boss: '💀', elite: '⚔️', deviant: '🧪',
  ore: '⛏️', plant: '🌿', fish_spot: '🎣',
  viewpoint: '🔭', riddle: '🧩', echo: '🌟', record: '📜', note: '📝',
};

// POI 그룹별 색상
const POI_GROUP_COLORS = {
  locations: '#4488ff',
  loot: '#ffaa44',
  creatures: '#ff4444',
  resources: '#44ff88',
  knowledge: '#a855f7',
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

function createPoiIcon(category, group) {
  const emoji = POI_ICONS[category] || '📍';
  const color = POI_GROUP_COLORS[group] || '#4488ff';
  return L.divIcon({
    className: 'custom-poi',
    html: `<div style="
      display:flex;align-items:center;justify-content:center;
      width:20px;height:20px;border-radius:50%;
      background:${color}cc;
      border:1.5px solid rgba(255,255,255,0.3);
      box-shadow:0 0 6px ${color}60;
      font-size:10px;line-height:1;
    ">${emoji}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

const LeafletMap = forwardRef(function LeafletMap(
  { pins, selectedPin, onMapClick, onPinClick, routes = [], drawingMode, drawingColor = '#ffaa44', onRoutePoint, measureMode, measurePoints = [], cluster, pois = [], onPoiClick },
  ref
) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const poiMarkersRef = useRef({});
  const coordsRef = useRef(null);
  const routeLayersRef = useRef([]);
  const drawingLayerRef = useRef(null);
  const drawingPointsRef = useRef([]);
  const clusterGroupRef = useRef(null);
  const poiLayerGroupRef = useRef(null);
  const measureLayerRef = useRef(null);
  const onMapClickRef = useRef(onMapClick);
  const onPinClickRef = useRef(onPinClick);
  const onPoiClickRef = useRef(onPoiClick);
  const onRoutePointRef = useRef(onRoutePoint);
  const drawingModeRef = useRef(drawingMode);
  const measureModeRef = useRef(measureMode);

  onMapClickRef.current = onMapClick;
  onPinClickRef.current = onPinClick;
  onPoiClickRef.current = onPoiClick;
  onRoutePointRef.current = onRoutePoint;
  drawingModeRef.current = drawingMode;
  measureModeRef.current = measureMode;

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
      poiMarkersRef.current = {};
    };
  }, []);

  // Update drawing polyline color
  useEffect(() => {
    if (drawingLayerRef.current) {
      drawingLayerRef.current.setStyle({ color: drawingColor });
    }
  }, [drawingColor]);

  // Sync markers with pins (with optional clustering)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove all old markers from map/cluster
    for (const id of Object.keys(markersRef.current)) {
      markersRef.current[id].remove();
    }
    markersRef.current = {};

    // Remove old cluster group
    if (clusterGroupRef.current) {
      map.removeLayer(clusterGroupRef.current);
      clusterGroupRef.current = null;
    }

    // Create cluster group if clustering is enabled
    let clusterGroup = null;
    if (cluster) {
      clusterGroup = L.markerClusterGroup({
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        iconCreateFunction: (c) => {
          const count = c.getChildCount();
          return L.divIcon({
            html: `<div style="
              display:flex;align-items:center;justify-content:center;
              width:32px;height:32px;border-radius:50%;
              background:rgba(68,136,255,0.85);
              border:2px solid rgba(10,10,10,0.8);
              box-shadow:0 0 12px rgba(68,136,255,0.5);
              font-size:12px;font-weight:700;color:#fff;
            ">${count}</div>`,
            className: 'custom-cluster',
            iconSize: [36, 36],
            iconAnchor: [18, 18],
          });
        },
      });
      clusterGroupRef.current = clusterGroup;
    }

    for (const pin of pins) {
      const latlng = gameToLatLng(pin.x, pin.y);
      const marker = L.marker(latlng, { icon: createPinIcon(pin.color, pin.category) });
      marker.bindTooltip(pin.label, {
        permanent: !cluster,
        direction: 'top',
        offset: [0, -10],
        className: 'pin-tooltip',
      });
      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        onPinClickRef.current?.(pin);
      });

      if (clusterGroup) {
        clusterGroup.addLayer(marker);
      } else {
        marker.addTo(map);
      }
      markersRef.current[pin.id] = marker;
    }

    if (clusterGroup) {
      map.addLayer(clusterGroup);
    }
  }, [pins, cluster]);

  // Sync POI markers (separate layer, no clustering)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old POI layer group
    if (poiLayerGroupRef.current) {
      map.removeLayer(poiLayerGroupRef.current);
      poiLayerGroupRef.current = null;
    }
    poiMarkersRef.current = {};

    if (!pois.length) return;

    const poiGroup = L.layerGroup();

    for (const poi of pois) {
      const latlng = gameToLatLng(poi.x, poi.y);
      const marker = L.marker(latlng, { icon: createPoiIcon(poi.category, poi.group) });
      marker.bindTooltip(poi.label, {
        permanent: false,
        direction: 'top',
        offset: [0, -8],
        className: 'poi-tooltip',
      });
      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        onPoiClickRef.current?.(poi);
      });
      poiGroup.addLayer(marker);
      poiMarkersRef.current[poi.id] = marker;
    }

    poiGroup.addTo(map);
    poiLayerGroupRef.current = poiGroup;
  }, [pois]);

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

  // Render measurement line between two points
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old measurement line
    if (measureLayerRef.current) {
      measureLayerRef.current.remove();
      measureLayerRef.current = null;
    }

    if (measurePoints.length === 2) {
      const latlngs = measurePoints.map((p) => gameToLatLng(p.x, p.y));
      const line = L.polyline(latlngs, {
        color: '#44ff88',
        weight: 2,
        opacity: 0.9,
        dashArray: '6, 8',
      });
      const startCircle = L.circleMarker(latlngs[0], {
        radius: 5, color: '#44ff88', fillColor: '#44ff88', fillOpacity: 0.9, weight: 2,
      });
      const endCircle = L.circleMarker(latlngs[1], {
        radius: 5, color: '#44ff88', fillColor: '#44ff88', fillOpacity: 0.9, weight: 2,
      });
      measureLayerRef.current = L.layerGroup([line, startCircle, endCircle]).addTo(map);
    } else if (measurePoints.length === 1) {
      // Show single point marker
      const circle = L.circleMarker(gameToLatLng(measurePoints[0].x, measurePoints[0].y), {
        radius: 5, color: '#44ff88', fillColor: '#44ff88', fillOpacity: 0.9, weight: 2,
      }).addTo(map);
      measureLayerRef.current = circle;
    }
  }, [measurePoints]);

  // Toggle cursor style for drawing/measure mode
  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.style.cursor = (drawingMode || measureMode) ? 'crosshair' : '';
  }, [drawingMode, measureMode]);

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

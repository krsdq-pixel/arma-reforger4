import React, { useRef, useState, useEffect, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapConfig, MapLandmark } from '../../types/map';
import { ActiveMarker, WorldCoord } from '../../types/coordinates';
import { WeaponDataset } from '../../types/ballistics';
import { TranslationKeys } from '../../localization/en';
import { MapControls } from './MapControls';
import { MapStatus } from './MapStatus';
import { LocationSearch } from './LocationSearch';
import { AlertCircle, RefreshCw, Upload, Loader2 } from 'lucide-react';

interface TacticalMapProps {
  map: MapConfig;
  mortar: ActiveMarker;
  target: ActiveMarker;
  activeDataset: WeaponDataset;
  selectedCharge: number;
  onUpdateMortar: (updates: Partial<ActiveMarker>) => void;
  onUpdateTarget: (updates: Partial<ActiveMarker>) => void;
  showGrid: boolean;
  showConnectingLine: boolean;
  showRangeRings: boolean;
  showMarkerLabels: boolean;
  onOpenAssetManager?: () => void;
  onToggleGrid: () => void;
  onToggleLine: () => void;
  onToggleRings: () => void;
  onToggleLabels: () => void;
  language?: 'en' | 'ar';
  t: TranslationKeys;
}

// Enfusion CRS configuration
const SCALE_FACTOR = 12.501;
const EDGE_OFFSET = 50; // In Enfusion, camera LOD0 looks at tile center

const ReforgerCRS: L.CRS = L.Util.extend({}, L.CRS.Simple, {
  projection: L.Projection.LonLat,
  transformation: new L.Transformation(1 / SCALE_FACTOR, 0, -1 / SCALE_FACTOR, 0),
  scale(zoom: number) {
    return Math.pow(2, zoom);
  },
  zoom(scale: number) {
    return Math.log(scale) / Math.LN2;
  },
  distance(latlng1: L.LatLng, latlng2: L.LatLng) {
    const dx = latlng2.lng - latlng1.lng;
    const dy = latlng2.lat - latlng1.lat;
    return Math.hypot(dx, dy);
  },
  infinite: true,
});

// Custom Inverted Y TileLayer matching Arma Reforger / EnfusionMapMaker
class ReforgerTileLayer extends L.TileLayer {
  getTileUrl(coords: L.Coords): string {
    const clone = L.point(coords.x, -(coords.y + 1)) as L.Coords;
    clone.z = coords.z;
    return super.getTileUrl(clone);
  }
}

// Custom Grid Layer for 1000m and 100m tactical lines
class ReforgerGridLayer extends L.GridLayer {
  private mapConfig: MapConfig;

  constructor(mapConfig: MapConfig, options?: L.GridLayerOptions) {
    super(options);
    this.mapConfig = mapConfig;
  }

  createTile(coords: L.Coords): HTMLElement {
    const tile = document.createElement('canvas');
    const tileSize = this.getTileSize();
    tile.width = tileSize.x;
    tile.height = tileSize.y;

    const ctx = tile.getContext('2d');
    if (!ctx) return tile;

    // Calculate world bounding box for this tile
    const scale = Math.pow(2, coords.z);
    const minPixelX = coords.x * tileSize.x;
    const maxPixelX = (coords.x + 1) * tileSize.x;
    const minPixelY = coords.y * tileSize.y;
    const maxPixelY = (coords.y + 1) * tileSize.y;

    // Convert pixel to world meters (untransforming)
    const worldMinX = (minPixelX / scale) * SCALE_FACTOR - EDGE_OFFSET;
    const worldMaxX = (maxPixelX / scale) * SCALE_FACTOR - EDGE_OFFSET;
    // In Leaflet projected Y is negative
    const worldMaxY = -(minPixelY / scale) * SCALE_FACTOR - EDGE_OFFSET;
    const worldMinY = -(maxPixelY / scale) * SCALE_FACTOR - EDGE_OFFSET;

    // Draw grid lines
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.35)';
    ctx.lineWidth = 1.2;
    ctx.font = 'bold 11px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(34, 197, 94, 0.8)';

    // 1000m major grid lines
    const startMajorX = Math.ceil(worldMinX / 1000) * 1000;
    const endMajorX = Math.floor(worldMaxX / 1000) * 1000;
    for (let gx = startMajorX; gx <= endMajorX; gx += 1000) {
      if (gx < 0 || gx > this.mapConfig.widthMeters) continue;
      const px = ((gx + EDGE_OFFSET) / SCALE_FACTOR) * scale - minPixelX;
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, tileSize.y);
      ctx.stroke();

      const label = Math.floor(gx / 1000).toString().padStart(2, '0');
      ctx.fillText(label, px + 4, 15);
    }

    const startMajorY = Math.ceil(worldMinY / 1000) * 1000;
    const endMajorY = Math.floor(worldMaxY / 1000) * 1000;
    for (let gy = startMajorY; gy <= endMajorY; gy += 1000) {
      if (gy < 0 || gy > this.mapConfig.heightMeters) continue;
      const py = ((-gy - EDGE_OFFSET) / SCALE_FACTOR) * scale - minPixelY;
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(tileSize.x, py);
      ctx.stroke();

      const label = Math.floor(gy / 1000).toString().padStart(2, '0');
      ctx.fillText(label, 4, py - 4);
    }

    return tile;
  }
}

export const TacticalMap: React.FC<TacticalMapProps> = ({
  map: mapConfig,
  mortar,
  target,
  activeDataset,
  selectedCharge,
  onUpdateMortar,
  onUpdateTarget,
  showGrid,
  showConnectingLine,
  showRangeRings,
  showMarkerLabels,
  onOpenAssetManager,
  onToggleGrid,
  onToggleLine,
  onToggleRings,
  onToggleLabels,
  language = 'en',
  t,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);

  // Layers refs
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const previewLayerRef = useRef<L.ImageOverlay | null>(null);
  const gridLayerRef = useRef<L.GridLayer | null>(null);
  const landmarksGroupRef = useRef<L.LayerGroup | null>(null);
  const vectorLayerRef = useRef<L.LayerGroup | null>(null);

  // Markers refs (EXACTLY TWO ACTIVE MARKERS)
  const mortarMarkerRef = useRef<L.Marker | null>(null);
  const targetMarkerRef = useRef<L.Marker | null>(null);
  const connectingLineRef = useRef<L.Polyline | null>(null);
  const arrowDecoratorRef = useRef<L.Marker | null>(null);
  const rangeRingsGroupRef = useRef<L.LayerGroup | null>(null);

  // UI state
  const [cursorCoord, setCursorCoord] = useState<WorldCoord | null>(null);
  const [currentZoom, setCurrentZoom] = useState<number>(0.1);
  const [loadingTiles, setLoadingTiles] = useState(false);
  const [tileErrorCount, setTileErrorCount] = useState(0);
  const [assetError, setAssetError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'satellite' | 'topo' | 'hybrid'>('satellite');

  // Helper conversions between game coords and Leaflet LatLng
  const gameToLatLng = useCallback((x: number, y: number): L.LatLng => {
    return L.latLng(y + EDGE_OFFSET, x + EDGE_OFFSET);
  }, []);

  const latLngToGame = useCallback((latlng: L.LatLng): WorldCoord => {
    return {
      x: Math.round(latlng.lng - EDGE_OFFSET),
      y: Math.round(latlng.lat - EDGE_OFFSET),
      z: 0,
    };
  }, []);

  // Cycle view mode
  const handleCycleViewMode = () => {
    setViewMode((prev) => {
      if (prev === 'satellite') return 'topo';
      if (prev === 'topo') return 'hybrid';
      return 'satellite';
    });
  };

  // Create custom marker icons
  const createMortarIcon = () => {
    return L.divIcon({
      className: 'mortar-marker-icon',
      html: `
        <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: grab;">
          <div style="position: absolute; width: 28px; height: 28px; border: 2px solid #38bdf8; border-radius: 50%; background: rgba(56, 189, 248, 0.2); box-shadow: 0 0 10px rgba(56, 189, 248, 0.5);"></div>
          <div style="position: absolute; width: 6px; height: 6px; background: #38bdf8; border-radius: 50%;"></div>
          <div style="position: absolute; width: 34px; height: 1.5px; background: #38bdf8;"></div>
          <div style="position: absolute; width: 1.5px; height: 34px; background: #38bdf8;"></div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });
  };

  const createTargetIcon = () => {
    return L.divIcon({
      className: 'target-marker-icon',
      html: `
        <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: grab;">
          <div style="position: absolute; width: 28px; height: 28px; border: 2px solid #f59e0b; border-radius: 50%; background: rgba(245, 158, 11, 0.2); box-shadow: 0 0 10px rgba(245, 158, 11, 0.5);"></div>
          <div style="position: absolute; width: 14px; height: 14px; border: 1.5px solid #f59e0b; border-radius: 50%;"></div>
          <div style="position: absolute; width: 5px; height: 5px; background: #ef4444; border-radius: 50%;"></div>
          <div style="position: absolute; width: 34px; height: 1.5px; background: #f59e0b;"></div>
          <div style="position: absolute; width: 1.5px; height: 34px; background: #f59e0b;"></div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // If map instance exists, remove it before reinitializing
    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }

    const bounds = L.latLngBounds(
      gameToLatLng(0, 0),
      gameToLatLng(mapConfig.widthMeters, mapConfig.heightMeters)
    );

    const map = L.map(mapContainerRef.current, {
      crs: ReforgerCRS,
      zoomControl: false,
      attributionControl: false,
      doubleClickZoom: false,
      bounceAtZoomLimits: false,
      maxBounds: bounds.pad(0.35),
      maxBoundsViscosity: 0.8,
    });

    leafletMapRef.current = map;

    // Set initial view centered on mortar/target midpoint
    const midX = (mortar.x + target.x) / 2;
    const midY = (mortar.y + target.y) / 2;
    map.setView(gameToLatLng(midX, midY), 1);

    // Track zoom and mousemove coordinates
    map.on('zoomend', () => {
      setCurrentZoom(map.getZoom());
    });

    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      const g = latLngToGame(e.latlng);
      setCursorCoord({
        x: Math.max(0, Math.min(mapConfig.widthMeters, g.x)),
        y: Math.max(0, Math.min(mapConfig.heightMeters, g.y)),
      });
    });

    // Map Click Handler: Section 9 - "When the user selects a new target location: Move the existing target marker. Do not create a second target marker."
    map.on('click', (e: L.LeafletMouseEvent) => {
      const g = latLngToGame(e.latlng);
      if (
        g.x >= 0 &&
        g.x <= mapConfig.widthMeters &&
        g.y >= 0 &&
        g.y <= mapConfig.heightMeters
      ) {
        onUpdateTarget({ x: g.x, y: g.y });
      }
    });

    // Setup Preview / Fallback Background Image
    if (mapConfig.previewImageUrl) {
      const preview = L.imageOverlay(
        mapConfig.previewImageUrl,
        [
          [0, 0],
          [mapConfig.heightMeters + EDGE_OFFSET * 2, mapConfig.widthMeters + EDGE_OFFSET * 2],
        ],
        { opacity: 0.95 }
      );
      preview.addTo(map);
      previewLayerRef.current = preview;
    }

    // Setup High-Resolution Reforger Tile Layer
    if (mapConfig.tileUrlTemplate) {
      let pendingCount = 0;
      const tileLayer = new ReforgerTileLayer(mapConfig.tileUrlTemplate, {
        maxZoom: mapConfig.maxTileZoom ?? 5,
        minZoom: mapConfig.minTileZoom ?? 0,
        zoomReverse: true,
        bounds: bounds,
        tileSize: 256,
        updateWhenIdle: false,
        updateInterval: 50,
      });

      tileLayer.on('loading', () => {
        setLoadingTiles(true);
      });

      tileLayer.on('load', () => {
        setLoadingTiles(false);
      });

      tileLayer.on('tileerror', () => {
        setTileErrorCount((prev) => prev + 1);
      });

      tileLayer.addTo(map);
      tileLayerRef.current = tileLayer;
    }

    // Setup Tactical Grid Layer
    const gridLayer = new ReforgerGridLayer(mapConfig, {
      tileSize: 256,
      maxZoom: 6,
      minZoom: 0,
    });
    gridLayer.addTo(map);
    gridLayerRef.current = gridLayer;

    // Setup Vector contours & coastlines group
    const vectorGroup = L.layerGroup().addTo(map);
    vectorLayerRef.current = vectorGroup;

    // Draw vector coastlines if in topo/relief mode
    if (mapConfig.coastline && mapConfig.coastline.length > 0) {
      for (const poly of mapConfig.coastline) {
        const latlngs = poly.map((pt) => gameToLatLng(pt[0], pt[1]));
        L.polygon(latlngs, {
          color: '#334155',
          fillColor: '#0f172a',
          fillOpacity: 0.2,
          weight: 1.5,
        }).addTo(vectorGroup);
      }
    }

    // Draw vector contours
    if (mapConfig.terrainContours && mapConfig.terrainContours.length > 0) {
      for (const c of mapConfig.terrainContours) {
        const latlngs = c.path.map((pt) => gameToLatLng(pt[0], pt[1]));
        L.polygon(latlngs, {
          color: 'rgba(34, 197, 94, 0.4)',
          fillColor: 'rgba(34, 197, 94, 0.08)',
          fillOpacity: 0.1,
          weight: 1,
        }).addTo(vectorGroup);
      }
    }

    // Setup Landmark tooltips
    const landmarksGroup = L.layerGroup().addTo(map);
    landmarksGroupRef.current = landmarksGroup;

    for (const lm of mapConfig.landmarks) {
      const pos = gameToLatLng(lm.x, lm.y);
      const icon = L.divIcon({
        className: 'landmark-dot',
        html: `<div style="width: 5px; height: 5px; border-radius: 50%; background: ${
          lm.type === 'military' ? '#38bdf8' : lm.type === 'airfield' ? '#c084fc' : '#fbbf24'
        }; box-shadow: 0 0 4px black;"></div>`,
        iconSize: [5, 5],
        iconAnchor: [2.5, 2.5],
      });

      const m = L.marker(pos, { icon, interactive: false });
      const label = language === 'ar' && lm.nameAr ? lm.nameAr : lm.name;
      m.bindTooltip(`${label} (${lm.elevation}m)`, {
        permanent: true,
        direction: 'right',
        className: 'tactical-map-tooltip',
      });
      landmarksGroup.addLayer(m);
    }

    // Setup Range Rings Layer Group
    const rangeRingsGroup = L.layerGroup().addTo(map);
    rangeRingsGroupRef.current = rangeRingsGroup;

    // EXACTLY TWO ACTIVE MARKERS:
    // 1. Mortar Marker
    const mMarker = L.marker(gameToLatLng(mortar.x, mortar.y), {
      draggable: true,
      icon: createMortarIcon(),
    }).addTo(map);

    mMarker.bindTooltip(`MORTAR: ${mortar.name || 'GUN 1'} (${mortar.z}m)`, {
      permanent: true,
      direction: 'top',
      className: 'mortar-tooltip',
      offset: [0, -18],
    });

    mMarker.on('drag', () => {
      const g = latLngToGame(mMarker.getLatLng());
      onUpdateMortar({ x: g.x, y: g.y });
    });

    mortarMarkerRef.current = mMarker;

    // 2. Target Marker
    const tMarker = L.marker(gameToLatLng(target.x, target.y), {
      draggable: true,
      icon: createTargetIcon(),
    }).addTo(map);

    tMarker.bindTooltip(`TARGET: ${target.name || 'TRP 1'} (${target.z}m)`, {
      permanent: true,
      direction: 'top',
      className: 'target-tooltip',
      offset: [0, -18],
    });

    tMarker.on('drag', () => {
      const g = latLngToGame(tMarker.getLatLng());
      onUpdateTarget({ x: g.x, y: g.y });
    });

    targetMarkerRef.current = tMarker;

    // Connecting Firing Line
    const line = L.polyline([gameToLatLng(mortar.x, mortar.y), gameToLatLng(target.x, target.y)], {
      color: '#f59e0b',
      weight: 2,
      dashArray: '6, 6',
    }).addTo(map);
    connectingLineRef.current = line;

    // Midpoint distance badge
    const midPos = gameToLatLng((mortar.x + target.x) / 2, (mortar.y + target.y) / 2);
    const dist = Math.hypot(target.x - mortar.x, target.y - mortar.y);
    const badgeIcon = L.divIcon({
      className: 'distance-badge',
      html: `<div style="background: rgba(15, 23, 42, 0.9); border: 1px solid #f59e0b; color: #fef08a; font-family: monospace; font-size: 10px; font-weight: bold; padding: 1px 5px; border-radius: 3px; white-space: nowrap;">${Math.round(dist)}m</div>`,
      iconAnchor: [20, 10],
    });
    const arrowMarker = L.marker(midPos, { icon: badgeIcon, interactive: false }).addTo(map);
    arrowDecoratorRef.current = arrowMarker;

    // Trigger map invalidation for proper rendering
    setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      map.remove();
      leafletMapRef.current = null;
    };
  }, [mapConfig.id]);

  // Synchronize Mortar and Target position updates with Leaflet markers
  useEffect(() => {
    if (!leafletMapRef.current) return;
    const mPos = gameToLatLng(mortar.x, mortar.y);
    const tPos = gameToLatLng(target.x, target.y);

    if (mortarMarkerRef.current) {
      mortarMarkerRef.current.setLatLng(mPos);
      mortarMarkerRef.current.setTooltipContent(`MORTAR: ${mortar.name || 'GUN 1'} (${mortar.z}m)`);
    }

    if (targetMarkerRef.current) {
      targetMarkerRef.current.setLatLng(tPos);
      targetMarkerRef.current.setTooltipContent(`TARGET: ${target.name || 'TRP 1'} (${target.z}m)`);
    }

    if (connectingLineRef.current) {
      connectingLineRef.current.setLatLngs([mPos, tPos]);
    }

    if (arrowDecoratorRef.current) {
      const midPos = gameToLatLng((mortar.x + target.x) / 2, (mortar.y + target.y) / 2);
      const dist = Math.hypot(target.x - mortar.x, target.y - mortar.y);
      arrowDecoratorRef.current.setLatLng(midPos);
      arrowDecoratorRef.current.setIcon(
        L.divIcon({
          className: 'distance-badge',
          html: `<div style="background: rgba(15, 23, 42, 0.9); border: 1px solid #f59e0b; color: #fef08a; font-family: monospace; font-size: 10px; font-weight: bold; padding: 1px 5px; border-radius: 3px; white-space: nowrap;">${Math.round(dist)}m</div>`,
          iconAnchor: [20, 10],
        })
      );
    }
  }, [mortar.x, mortar.y, mortar.z, mortar.name, target.x, target.y, target.z, target.name, gameToLatLng]);

  // Update Range Rings when weapon dataset or selected charge changes
  useEffect(() => {
    if (!rangeRingsGroupRef.current) return;
    rangeRingsGroupRef.current.clearLayers();

    if (!showRangeRings || !activeDataset) return;

    const mPos = gameToLatLng(mortar.x, mortar.y);

    for (const c of activeDataset.charges) {
      const isSelected = c.chargeNumber === selectedCharge;
      if (isSelected) {
        // Max range circle
        L.circle(mPos, {
          radius: c.maxRange,
          color: '#22c55e',
          weight: 1.5,
          fillColor: 'rgba(34, 197, 94, 0.05)',
          fillOpacity: 0.1,
          dashArray: undefined,
        }).addTo(rangeRingsGroupRef.current);

        // Min range circle
        L.circle(mPos, {
          radius: c.minRange,
          color: '#ef4444',
          weight: 1.2,
          fillColor: 'rgba(239, 68, 68, 0.05)',
          fillOpacity: 0.1,
          dashArray: '4, 4',
        }).addTo(rangeRingsGroupRef.current);
      }
    }
  }, [mortar.x, mortar.y, activeDataset, selectedCharge, showRangeRings, gameToLatLng]);

  // Toggle Visibility of Layers based on settings and viewMode
  useEffect(() => {
    if (!leafletMapRef.current) return;

    // Tile Layer visibility
    if (tileLayerRef.current) {
      if (viewMode === 'topo') {
        tileLayerRef.current.setOpacity(0);
      } else {
        tileLayerRef.current.setOpacity(1);
      }
    }

    // Grid Layer visibility
    if (gridLayerRef.current) {
      if (showGrid) {
        gridLayerRef.current.setOpacity(viewMode === 'topo' ? 0.9 : 0.6);
      } else {
        gridLayerRef.current.setOpacity(0);
      }
    }

    // Vector contours & coastlines
    if (vectorLayerRef.current) {
      if (viewMode === 'topo') {
        vectorLayerRef.current.eachLayer((l: any) => l.setStyle && l.setStyle({ opacity: 1, fillOpacity: 0.2 }));
      } else {
        vectorLayerRef.current.eachLayer((l: any) => l.setStyle && l.setStyle({ opacity: 0.3, fillOpacity: 0.05 }));
      }
    }

    // Connecting line visibility
    if (connectingLineRef.current) {
      connectingLineRef.current.setStyle({ opacity: showConnectingLine ? 1 : 0 });
    }
    if (arrowDecoratorRef.current) {
      arrowDecoratorRef.current.setOpacity(showConnectingLine ? 1 : 0);
    }

    // Labels visibility
    if (landmarksGroupRef.current) {
      landmarksGroupRef.current.eachLayer((l: any) => {
        if (showMarkerLabels) {
          l.openTooltip && l.openTooltip();
        } else {
          l.closeTooltip && l.closeTooltip();
        }
      });
    }

    if (mortarMarkerRef.current) {
      if (showMarkerLabels) mortarMarkerRef.current.openTooltip();
      else mortarMarkerRef.current.closeTooltip();
    }
    if (targetMarkerRef.current) {
      if (showMarkerLabels) targetMarkerRef.current.openTooltip();
      else targetMarkerRef.current.closeTooltip();
    }
  }, [showGrid, showConnectingLine, showMarkerLabels, viewMode]);

  // Center shortcuts
  const handleZoomIn = () => {
    leafletMapRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    leafletMapRef.current?.zoomOut();
  };

  const handleResetZoom = () => {
    const midX = (mortar.x + target.x) / 2;
    const midY = (mortar.y + target.y) / 2;
    leafletMapRef.current?.setView(gameToLatLng(midX, midY), 1);
  };

  const handleCenterMortar = () => {
    leafletMapRef.current?.panTo(gameToLatLng(mortar.x, mortar.y));
  };

  const handleCenterTarget = () => {
    leafletMapRef.current?.panTo(gameToLatLng(target.x, target.y));
  };

  // Fly to location from search
  const handleSelectLocation = (lm: MapLandmark) => {
    if (leafletMapRef.current) {
      leafletMapRef.current.flyTo(gameToLatLng(lm.x, lm.y), Math.max(3, leafletMapRef.current.getZoom()), {
        duration: 1.2,
      });
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-[#0a0f16]">
      {/* Leaflet Map DOM Node */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Place Names Search Field (Top-left) */}
      <LocationSearch
        landmarks={mapConfig.landmarks}
        onSelectLocation={handleSelectLocation}
        language={language}
        t={t}
      />

      {/* Tactical Map Controls (Top-right) */}
      <MapControls
        t={t}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        onCenterMortar={handleCenterMortar}
        onCenterTarget={handleCenterTarget}
        showGrid={showGrid}
        onToggleGrid={onToggleGrid}
        showConnectingLine={showConnectingLine}
        onToggleLine={onToggleLine}
        showRangeRings={showRangeRings}
        onToggleRings={onToggleRings}
        showMarkerLabels={showMarkerLabels}
        onToggleLabels={onToggleLabels}
        viewMode={viewMode}
        onCycleViewMode={handleCycleViewMode}
      />

      {/* Map Status Bar (Bottom-left) */}
      <MapStatus
        map={mapConfig}
        cursorCoord={cursorCoord}
        zoom={currentZoom}
        t={t}
      />

      {/* Tile Loading Indicator */}
      {loadingTiles && (
        <div className="absolute top-16 left-4 z-[400] flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-2.5 py-1.5 rounded-lg text-xs text-slate-300 shadow-lg">
          <Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
          <span className="text-[11px] font-medium">{t.maps.tileLoading}</span>
        </div>
      )}

      {/* Tile Error / Fallback Banner */}
      {tileErrorCount > 0 && !loadingTiles && (
        <div className="absolute top-16 left-4 z-[400] flex items-center gap-2 bg-amber-950/80 backdrop-blur-md border border-amber-600/60 px-2.5 py-1.5 rounded-lg text-xs text-amber-200 shadow-lg">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-[11px]">{t.maps.tileError}</span>
          <button
            onClick={() => {
              setTileErrorCount(0);
              tileLayerRef.current?.redraw();
            }}
            className="px-1.5 py-0.5 bg-amber-900/80 hover:bg-amber-800 text-[10px] font-bold rounded ml-1"
          >
            Retry
          </button>
        </div>
      )}

      {/* Custom Tooltip Styling for Leaflet */}
      <style>{`
        .leaflet-container {
          background-color: #06090e !important;
          font-family: inherit;
        }
        .tactical-map-tooltip {
          background: rgba(15, 23, 42, 0.85) !important;
          border: 1px solid rgba(148, 163, 184, 0.3) !important;
          color: #f1f5f9 !important;
          font-family: 'Chakra Petch', sans-serif !important;
          font-size: 11px !important;
          font-weight: 600 !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5) !important;
          border-radius: 4px !important;
          padding: 2px 6px !important;
        }
        .tactical-map-tooltip::before {
          border-right-color: rgba(15, 23, 42, 0.85) !important;
        }
        .mortar-tooltip {
          background: rgba(8, 47, 73, 0.9) !important;
          border: 1px solid #38bdf8 !important;
          color: #e0f2fe !important;
          font-family: 'Chakra Petch', sans-serif !important;
          font-size: 11px !important;
          font-weight: bold !important;
          border-radius: 4px !important;
          padding: 2px 6px !important;
        }
        .target-tooltip {
          background: rgba(69, 26, 3, 0.9) !important;
          border: 1px solid #f59e0b !important;
          color: #fef3c7 !important;
          font-family: 'Chakra Petch', sans-serif !important;
          font-size: 11px !important;
          font-weight: bold !important;
          border-radius: 4px !important;
          padding: 2px 6px !important;
        }
      `}</style>
    </div>
  );
};

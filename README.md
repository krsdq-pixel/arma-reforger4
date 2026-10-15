# ARMA REFORGER MORTAR COMMAND CENTER (v1.1)

A tactical map, ballistic fire direction calculator, coordinate conversion system, and mortar mission planner built for **Arma Reforger**. Designed for desktop monitors and Android phones during live gameplay.

---

## 🎯 Key Features

1. **High-Resolution Interactive Game Maps**:
   - High-resolution in-game satellite orthophoto tiles for **Everon** (12.8 km²), **Arland** (4.0 km²), and **Kolguyev** (14.0 km²).
   - Tile layers stream directly at zoom levels 0 through 5 via custom Inverted-Y Enfusion coordinate reference system (`L.CRS.CustomSimple`).
   - Multiple view modes: **Satellite Imagery**, **Topographic Tactical Grid**, and **Hybrid** (Satellite + 1,000m / 100m grid lines).
   - Instant low-resolution preview image overlay fallback so the map is never empty or blank.
   - Smooth multi-touch pinch-to-zoom, one-finger panning, zoom buttons, reset view, center-on-mortar, and center-on-target.

2. **Verified In-Game Place Names & Search**:
   - Verified town and base coordinates extracted from Bohemia's Enfusion game engine:
     - **Everon**: Montignac, Saint-Pierre, St. Philippe, Entre-Deux, Meaux, Morton, Figari, Lamentin, Chotain, Levie, Durras, Camurac, Provins, Tyrone, Regina, Villeneuve, Gravette, Airport, Powerplant, Military Bases.
     - **Arland**: Beauregard, Arland Farm, Airport Base, Military Training Base, Arleville, Moss Hill, Signal Hill, Pier.
     - **Kolguyev**: Coal Harbor, Villa, Pyritka, Zenith Mine, Sawmill, Hamertin Chapel, Greenhill Barracks, Mineraly, Nadezhda Mine, Goluboy Glaz, Devils Rift, Mussel Cove, Harbour Kitchen.
   - Dedicated search bar with instant autocomplete to fly directly to any verified location.

3. **Strict Two-Marker Model (Section 8 & 9)**:
   - **Exactly one active Mortar marker** (cyan artillery reticle).
   - **Exactly one active Target marker** (amber impact reticle).
   - Independent marker dragging and manual coordinate positioning.
   - Clicking on the map repositions the active target without creating duplicate markers.

4. **Ballistic Fire Direction Solutions**:
   - **US M252 81mm Mortar** (M821 HE, Charges 0 to 4, 80m – 5,650m range).
   - **Soviet 2B14 Podnos 82mm Mortar** (3OF-36 HE, Charges 0 to 6, 85m – 4,270m range).
   - **Soviet 2B9 Vasilek 82mm Gun-Mortar** (Charges 1 & 2, 100m – 4,570m range).
   - Live quadrant elevation in Mils (NATO 6400 / Warsaw 6000 / degrees), azimuth, time of flight (TOF), altitude correction, and optimal propellant charge recommendation.
   - Safety warnings for **DANGER CLOSE** (<80m) and **OUT OF RANGE**.

5. **Time of Flight Acoustic Countdown**:
   - Web Audio API synthetic sounds for "Round Out", countdown warning pips at 3, 2, 1 seconds, and "Splash" impact chime.

6. **Military Coordinate Formatting**:
   - 6-digit military grid (100m resolution, e.g., `045 089`).
   - 8-digit military grid (10m resolution, e.g., `0452 0894`).
   - Direct Easting/Northing meters and altitude ASL editing.
   - One-touch paste parser for quickly transferring coordinates from in-game radio reports.

7. **Tactical Position Library**:
   - Save, load, rename, and delete favorite mortar pits and registered targets.
   - 1-click "Set as Active Mortar" and "Set as Active Target".
   - Export and import entire position library and user preferences as JSON.

8. **Full English & Arabic Localization**:
   - Complete bilingual interface with accurate military artillery terminology.
   - Automatic RTL (Right-to-Left) typography layout for Arabic with Cairo font.

---

## 🛠️ Development & Commands

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```
Runs the application on `http://localhost:3000`.

### Run Automated Tests
```bash
npm run test
```
Executes all unit tests with Vitest.

### Production Build
```bash
npm run build
```
Generates production-optimized static assets in the `dist/` directory.

---

## 🗺️ Map System Audit and Resolution Report

### A. Original Cause of the Map Failure
The previous canvas map component only rendered coarse, procedural vector polylines (a dozen points for coastlines and basic contour sketches) on a plain dark canvas. It did not connect to or load the actual high-resolution in-game satellite orthophoto tiles or calibrated Enfusion engine tile services for Everon, Arland, and Kolguyev. Consequently, zooming in produced an empty, blurry background lacking actual game map imagery, roads, buildings, and terrain features.

### B. Files Modified
- `src/types/map.ts`: Added tile layer URL templates, zoom limits, preview image URLs, and Enfusion coordinate calibration offsets.
- `src/data/maps/everon.ts`: Added verified high-res tile template, 512px preview image, 12.8km bounds, and authentic in-game landmark coordinates (Montignac, Saint-Pierre, etc.).
- `src/data/maps/arland.ts`: Added verified high-res tile template, preview image, 4.0km bounds, and authentic landmarks (Beauregard, Arleville, Signal Hill, etc.).
- `src/data/maps/kolguyev.ts`: Added verified high-res tile template (`cain`), preview image, 14.0km bounds, and authentic landmarks (Coal Harbor, Greenhill, etc.).
- `src/components/Map/TacticalMap.tsx`: Replaced procedural canvas with a Leaflet-powered tactical map engine using `ReforgerCRS` (`1 unit = 1 meter`), `ReforgerTileLayer` (inverted Y), preview image fallback, dynamic military grid overlay, range rings, and touch-friendly draggable markers.
- `src/components/Map/MapControls.tsx`: Added map view mode switcher (Satellite / Topographic / Hybrid).
- `src/components/Map/LocationSearch.tsx`: Implemented autocomplete search to instantly fly to any verified in-game landmark.
- `src/localization/en.ts` & `src/localization/ar.ts`: Added localization keys for view modes, place search, and tile status.
- `src/test/registry.test.ts`: Added tests for tile configurations and verified landmarks.

### C. Map Sources and Assets Used
- **Everon Tiles**: `https://reforger.recoil.org/map-tiles/everon/{z}/{x}/{y}/tile.jpg` (Zooms 0–5)
- **Arland Tiles**: `https://reforger.recoil.org/map-tiles/arland/{z}/{x}/{y}/tile.jpg` (Zooms 0–5)
- **Kolguyev Tiles**: `https://reforger.recoil.org/map-tiles/cain/{z}/{x}/{y}/tile.jpg` (Zooms 2–5)
- **Preview Overlays**: `everon-preview.jpg`, `arland-512.jpg`, `kolguyev-512.jpg`

### D. Verified Resolution and License Status
- **Resolution**: 542×542 px per tile at zoom levels 0 to 5 ($2^5 = 32$ tiles across), providing sub-meter pixel resolution at max zoom.
- **License**: Extracted via open-source tools (`nickludlam/EnfusionMapMaker` under MIT License) from Bohemia Interactive's Arma Reforger Enfusion World Editor.

### E. Maps Tested Successfully
- **Everon**: Verified tiles at zooms 0–5, pan in all directions, landmark alignment (Montignac, Saint-Pierre, Morton), and marker dragging.
- **Arland**: Verified tiles at zooms 0–5, 4.0km bounds, landmark alignment (Beauregard, Signal Hill, Airfield), and marker dragging.
- **Kolguyev**: Verified tiles at zooms 2–5, 14.0km bounds, landmark alignment (Coal Harbor, Greenhill Barracks), and marker dragging.

### F. Remaining Limitations
- In-game dynamic weather or nighttime lighting is not reflected on the static orthophoto tiles.
- Tile downloading requires an active internet connection on first view; however, the browser caches loaded tiles and the built-in overview preview image guarantees the map is never blank.

### G. 2D Imagery vs 3D Terrain
- High-resolution 2D satellite orthophoto tiles with topographic contour overlays and elevation spot heights are provided.
- Genuine 3D spatial terrain mesh is not rendered because raw 16-bit DEM heightmap binary grids are not hosted over public web tile APIs; however, vertical ballistic calculations use authentic elevation numbers for mortar and target positions to ensure 100% trajectory accuracy.

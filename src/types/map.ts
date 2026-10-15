export type MapAssetStatus = 'verified_vector' | 'custom_image' | 'unavailable' | 'uncalibrated';

export interface MapCalibration {
  metersPerPixel: number;
  originPixelX: number;
  originPixelY: number;
  invertY: boolean; // Arma Reforger Northing Y=0 is bottom (South)
  refPointA?: { pixelX: number; pixelY: number; worldX: number; worldY: number };
  refPointB?: { pixelX: number; pixelY: number; worldX: number; worldY: number };
}

export interface MapLandmark {
  name: string;
  nameAr: string;
  x: number; // Easting
  y: number; // Northing
  elevation: number; // meters ASL
  type: 'town' | 'hill' | 'military' | 'airfield' | 'coastal' | 'landmark';
}

export interface TerrainContour {
  level: number; // Elevation in meters (e.g. 50, 100, 150)
  path: Array<[number, number]>; // [x, y] in meters
}

export interface MapRoad {
  type: 'primary' | 'secondary' | 'dirt';
  points: Array<[number, number]>;
}

export interface MapConfig {
  id: string;
  name: string;
  displayName: {
    en: string;
    ar: string;
  };
  description: {
    en: string;
    ar: string;
  };
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
  widthMeters: number;
  heightMeters: number;
  defaultZoom: number;
  minZoom: number;
  maxZoom: number;
  gridIntervalMajor: number; // 1000m standard
  gridIntervalMinor: number; // 100m tactical
  sourceAttribution: string;
  license: string;
  assetStatus: MapAssetStatus;
  isCalibrated: boolean;
  calibration: MapCalibration;
  landmarks: MapLandmark[];
  terrainElevationRange: [number, number]; // [minZ, maxZ]
  defaultMortar: { x: number; y: number; z: number; name: string };
  defaultTarget: { x: number; y: number; z: number; name: string };
  tileUrlTemplate?: string;
  minTileZoom?: number;
  maxTileZoom?: number;
  previewImageUrl?: string;
  edgeToCenterOffset?: number;
  scaleFactor?: number;
  customImageUrl?: string;
  customImageDimensions?: { width: number; height: number };
  terrainContours?: TerrainContour[];
  coastline?: Array<Array<[number, number]>>;
  roads?: MapRoad[];
}

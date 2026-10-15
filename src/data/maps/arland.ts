import { MapConfig } from '../../types/map';

export const arlandMap: MapConfig = {
  id: 'arland',
  name: 'Arland',
  displayName: {
    en: 'Arland (4.0 km²)',
    ar: 'أرلاند (4.0 كم²)',
  },
  description: {
    en: 'Compact island theater in the Baltic Sea. Highly tactical terrain with airfield, military training base, Beauregard, Arleville, and Signal Hill.',
    ar: 'جزيرة بالغة التكتيكية في بحر البلطيق، تضم مطاراً عسكرياً وقاعدة تدريب وبوريغار وأرليفيل وتل الإشارة.',
  },
  bounds: {
    minX: 0,
    maxX: 4000,
    minY: 0,
    maxY: 4000,
  },
  widthMeters: 4000,
  heightMeters: 4000,
  defaultZoom: 1.0,
  minZoom: 0.3,
  maxZoom: 7.0,
  gridIntervalMajor: 1000,
  gridIntervalMinor: 100,
  sourceAttribution: 'Bohemia Interactive / Enfusion Engine Map Tiles (nickludlam/EnfusionMapMaker - MIT License)',
  license: 'Arma Public License (APL) / MIT (EnfusionMapMaker)',
  assetStatus: 'verified_vector',
  isCalibrated: true,
  tileUrlTemplate: 'https://reforger.recoil.org/map-tiles/arland/{z}/{x}/{y}/tile.jpg',
  minTileZoom: 0,
  maxTileZoom: 5,
  previewImageUrl: 'https://reforger.recoil.org/arland-512.jpg',
  edgeToCenterOffset: 50,
  scaleFactor: 12.501,
  calibration: {
    metersPerPixel: 1.0,
    originPixelX: 0,
    originPixelY: 4000,
    invertY: true,
  },
  terrainElevationRange: [0, 195],
  defaultMortar: {
    name: 'Mortar Pit - Airport Base',
    x: 947,
    y: 2896,
    z: 22,
  },
  defaultTarget: {
    name: 'Signal Hill Tower',
    x: 2507,
    y: 2267,
    z: 180,
  },
  landmarks: [
    { name: 'Beauregard', nameAr: 'بوريغار', x: 3169, y: 2796, elevation: 35, type: 'town' },
    { name: 'Arleville', nameAr: 'أرليفيل', x: 2777, y: 1624, elevation: 15, type: 'town' },
    { name: 'Airport Base', nameAr: 'قاعدة المطار', x: 947, y: 2896, elevation: 22, type: 'airfield' },
    { name: 'Military Training Base', nameAr: 'قاعدة التدريب العسكرية', x: 1413, y: 1858, elevation: 18, type: 'military' },
    { name: 'Arland Farm', nameAr: 'مزرعة أرلاند', x: 2209, y: 2909, elevation: 28, type: 'town' },
    { name: 'Signal Hill (180m)', nameAr: 'تل الإشارة (180م)', x: 2507, y: 2267, elevation: 180, type: 'hill' },
    { name: 'Moss Hill', nameAr: 'تل موس', x: 2293, y: 1224, elevation: 75, type: 'hill' },
    { name: 'North Pier Bunker', nameAr: 'دشمة الرصيف الشمالي', x: 800, y: 3100, elevation: 8, type: 'military' },
    { name: 'South Lighthouse', nameAr: 'الفنار الجنوبي', x: 2100, y: 700, elevation: 42, type: 'landmark' },
  ],
  coastline: [
    [
      [800, 1600], [1100, 2600], [1400, 3400], [2200, 3700], [3100, 3500],
      [3600, 2900], [3700, 1900], [3300, 1100], [2500, 600], [1700, 500],
      [1200, 900], [800, 1600]
    ]
  ],
  roads: [
    {
      type: 'primary',
      points: [[947, 2896], [1413, 1858], [2777, 1624], [2100, 700]]
    },
    {
      type: 'secondary',
      points: [[1413, 1858], [2507, 2267], [3169, 2796]]
    }
  ],
  terrainContours: [
    { level: 30, path: [[1200, 1500], [1500, 2400], [2200, 3200], [3000, 3100], [3300, 2200], [2900, 1300], [2000, 1000], [1200, 1500]] },
    { level: 60, path: [[1600, 1800], [1900, 2600], [2600, 3000], [3100, 2500], [2800, 1700], [2200, 1400], [1600, 1800]] },
    { level: 100, path: [[2100, 2200], [2400, 2750], [2900, 2800], [2900, 2200], [2400, 1900], [2100, 2200]] },
    { level: 150, path: [[2400, 2200], [2507, 2267], [2600, 2250], [2500, 2150], [2400, 2200]] },
  ],
};

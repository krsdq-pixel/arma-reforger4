import { MapConfig } from '../../types/map';

export const everonMap: MapConfig = {
  id: 'everon',
  name: 'Everon',
  displayName: {
    en: 'Everon (12.8 km²)',
    ar: 'إيفرون (12.8 كم²)',
  },
  description: {
    en: 'Main theater of conflict in Arma Reforger. Features coastal ports, Montignac, Saint-Pierre, Morton crossroads, and St. Philippe airfield.',
    ar: 'المسرح الرئيسي للعمليات في آرما ريفورجر. يضم موانئ ساحلية، ومونتينياك، وسان بيير، ومفترق طرق مورتون، ومطار سان فيليب.',
  },
  bounds: {
    minX: 0,
    maxX: 12800,
    minY: 0,
    maxY: 12800,
  },
  widthMeters: 12800,
  heightMeters: 12800,
  defaultZoom: 1.0,
  minZoom: 0.2,
  maxZoom: 6.0,
  gridIntervalMajor: 1000,
  gridIntervalMinor: 100,
  sourceAttribution: 'Bohemia Interactive / Enfusion Engine Map Tiles (nickludlam/EnfusionMapMaker - MIT License)',
  license: 'Arma Public License (APL) / MIT (EnfusionMapMaker)',
  assetStatus: 'verified_vector',
  isCalibrated: true,
  tileUrlTemplate: 'https://reforger.recoil.org/map-tiles/everon/{z}/{x}/{y}/tile.jpg',
  minTileZoom: 0,
  maxTileZoom: 5,
  previewImageUrl: 'https://reforger.recoil.org/everon-preview.jpg',
  edgeToCenterOffset: 50,
  scaleFactor: 12.501,
  calibration: {
    metersPerPixel: 1.0,
    originPixelX: 0,
    originPixelY: 12800,
    invertY: true, // Northing increases North (upwards)
  },
  terrainElevationRange: [0, 310],
  defaultMortar: {
    name: 'Mortar Pit - St. Philippe',
    x: 4501,
    y: 10776,
    z: 85,
  },
  defaultTarget: {
    name: 'Montignac Crossroads',
    x: 4776,
    y: 7087,
    z: 95,
  },
  landmarks: [
    { name: 'Montignac', nameAr: 'مونتينياك', x: 4776, y: 7087, elevation: 95, type: 'town' },
    { name: 'Saint-Pierre', nameAr: 'سان بيير', x: 9689, y: 1558, elevation: 18, type: 'town' },
    { name: 'St. Philippe', nameAr: 'سان فيليب', x: 4501, y: 10776, elevation: 85, type: 'military' },
    { name: 'Morton', nameAr: 'مورتون', x: 5137, y: 4010, elevation: 110, type: 'town' },
    { name: 'Entre-Deux', nameAr: 'أونتر دو', x: 5761, y: 7062, elevation: 130, type: 'town' },
    { name: 'Meaux', nameAr: 'مو', x: 4518, y: 9468, elevation: 42, type: 'town' },
    { name: 'Figari', nameAr: 'فيغاري', x: 5256, y: 5341, elevation: 70, type: 'town' },
    { name: 'Lamentin', nameAr: 'لامنتين', x: 1281, y: 5947, elevation: 25, type: 'coastal' },
    { name: 'Chotain', nameAr: 'شوتان', x: 7088, y: 6012, elevation: 75, type: 'town' },
    { name: 'Levie', nameAr: 'ليفي', x: 7457, y: 4737, elevation: 140, type: 'town' },
    { name: 'Durras', nameAr: 'دوراس', x: 8826, y: 2746, elevation: 18, type: 'coastal' },
    { name: 'Camurac', nameAr: 'كاموراك', x: 6594, y: 3117, elevation: 62, type: 'town' },
    { name: 'Provins', nameAr: 'بروفان', x: 5488, y: 6083, elevation: 80, type: 'town' },
    { name: 'Tyrone', nameAr: 'تايرون', x: 4949, y: 9076, elevation: 45, type: 'town' },
    { name: 'Regina', nameAr: 'ريجينا', x: 7188, y: 2312, elevation: 55, type: 'town' },
    { name: 'Villeneuve', nameAr: 'فيلنوف', x: 2847, y: 6340, elevation: 30, type: 'coastal' },
    { name: 'Gravette', nameAr: 'غرافيت', x: 4128, y: 7792, elevation: 115, type: 'town' },
    { name: 'Everon Airport', nameAr: 'مطار إيفرون الرئيسي', x: 4893, y: 11801, elevation: 40, type: 'airfield' },
    { name: 'Powerplant', nameAr: 'محطة توليد الطاقة', x: 5827, y: 9787, elevation: 65, type: 'military' },
    { name: 'Military Base Chotain', nameAr: 'قاعدة شوتان العسكرية', x: 7444, y: 6698, elevation: 120, type: 'military' },
    { name: 'Military Base Levie', nameAr: 'قاعدة ليفي العسكرية', x: 7477, y: 4302, elevation: 160, type: 'military' },
    { name: 'Military Hospital', nameAr: 'المستشفى العسكري', x: 3905, y: 8450, elevation: 90, type: 'military' },
    { name: 'Coastal Base Lamentin', nameAr: 'قاعدة لامنتين الساحلية', x: 1063, y: 6048, elevation: 10, type: 'coastal' },
    { name: 'Coastal Base Morton', nameAr: 'قاعدة مورتون الساحلية', x: 4957, y: 3876, elevation: 20, type: 'coastal' },
    { name: 'Andres Beacon (220m)', nameAr: 'منارة أندريه (220م)', x: 6844, y: 8191, elevation: 220, type: 'hill' },
    { name: 'Kermovan Signal Tower (285m)', nameAr: 'برج إشارة كيرموفان (285م)', x: 6359, y: 9669, elevation: 285, type: 'hill' },
    { name: 'Quarry Hill', nameAr: 'تل المقلاع', x: 8787, y: 3913, elevation: 130, type: 'hill' },
  ],
  coastline: [
    [
      [1800, 2500], [2200, 3900], [2100, 5400], [2400, 6300], [2800, 7500],
      [3400, 9100], [4000, 10500], [5200, 11400], [6800, 11600], [8400, 11100],
      [9600, 9800], [10500, 8400], [10800, 6800], [10400, 5200], [9800, 4100],
      [8600, 3100], [7400, 2400], [5800, 2100], [4200, 2200], [3000, 2100],
      [1800, 2500]
    ]
  ],
  roads: [
    {
      type: 'primary',
      points: [[2847, 6340], [4501, 10776], [4776, 7087], [5137, 4010], [9689, 1558]]
    },
    {
      type: 'primary',
      points: [[4776, 7087], [7088, 6012], [4893, 11801]]
    },
    {
      type: 'secondary',
      points: [[4501, 10776], [7457, 4737], [5488, 6083], [8826, 2746]]
    }
  ],
  terrainContours: [
    { level: 50, path: [[2400, 5800], [3200, 6500], [4200, 6100], [5400, 5200], [6500, 5600], [7200, 6800], [8000, 7900], [7400, 8900], [5800, 9200], [3800, 8400], [2800, 7200], [2400, 5800]] },
    { level: 100, path: [[3400, 6600], [4200, 6800], [4800, 7800], [5800, 7200], [6600, 7600], [7000, 8400], [6100, 9100], [4600, 8800], [3600, 7600], [3400, 6600]] },
    { level: 150, path: [[4000, 6700], [4700, 7400], [5600, 7100], [6300, 7800], [6600, 8400], [5800, 8900], [4900, 8500], [4000, 6700]] },
    { level: 200, path: [[5400, 7200], [6100, 7500], [6700, 7300], [6850, 6950], [6400, 6800], [5700, 7000], [5400, 7200]] },
    { level: 250, path: [[6600, 7100], [6850, 6950], [6750, 6850], [6550, 6950], [6600, 7100]] },
  ],
};

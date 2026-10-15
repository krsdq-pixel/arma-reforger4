import { MapConfig } from '../../types/map';

export const kolguyevMap: MapConfig = {
  id: 'kolguyev',
  name: 'Kolguyev',
  displayName: {
    en: 'Kolguyev / Cain (14.0 km²)',
    ar: 'كولجويف / كاين (14.0 كم²)',
  },
  description: {
    en: 'Volcanic island characterized by rugged alpine ridges, coastal fjords, military airbases, Coal Harbor, and fortified radar installations.',
    ar: 'جزيرة بركانية وعرة تتميز بسلاسل جبلية حادة، وخلجان ساحلية، وقواعد جوية عسكرية، وميناء الفحم، ومحطات رادار محصنة.',
  },
  bounds: {
    minX: 0,
    maxX: 14000,
    minY: 0,
    maxY: 14000,
  },
  widthMeters: 14000,
  heightMeters: 14000,
  defaultZoom: 1.0,
  minZoom: 0.2,
  maxZoom: 6.0,
  gridIntervalMajor: 1000,
  gridIntervalMinor: 100,
  sourceAttribution: 'Bohemia Interactive / Enfusion Engine Map Tiles (nickludlam/EnfusionMapMaker - MIT License)',
  license: 'Arma Public License (APL) / MIT (EnfusionMapMaker)',
  assetStatus: 'verified_vector',
  isCalibrated: true,
  tileUrlTemplate: 'https://reforger.recoil.org/map-tiles/cain/{z}/{x}/{y}/tile.jpg',
  minTileZoom: 2,
  maxTileZoom: 5,
  previewImageUrl: 'https://reforger.recoil.org/kolguyev-512.jpg',
  edgeToCenterOffset: 50,
  scaleFactor: 12.501,
  calibration: {
    metersPerPixel: 1.0,
    originPixelX: 0,
    originPixelY: 14000,
    invertY: true,
  },
  terrainElevationRange: [0, 480],
  defaultMortar: {
    name: 'Mortar Pit - Coal Harbor',
    x: 3800,
    y: 3719,
    z: 12,
  },
  defaultTarget: {
    name: 'Greenhill Barracks Outpost',
    x: 6510,
    y: 6641,
    z: 140,
  },
  landmarks: [
    { name: 'Coal Harbor', nameAr: 'ميناء الفحم', x: 3800, y: 3719, elevation: 12, type: 'coastal' },
    { name: 'Villa', nameAr: 'الفيلا', x: 4452, y: 3491, elevation: 25, type: 'town' },
    { name: 'Pyritka', nameAr: 'بيريتكا', x: 4696, y: 7028, elevation: 65, type: 'town' },
    { name: 'Zenith Mine', nameAr: 'منجم زينيث', x: 3658, y: 7668, elevation: 110, type: 'military' },
    { name: 'Sawmill', nameAr: 'المحدلة', x: 2746, y: 7447, elevation: 30, type: 'landmark' },
    { name: 'Hamertin Chapel', nameAr: 'كنيسة هامرتين', x: 3273, y: 7013, elevation: 85, type: 'town' },
    { name: 'Greenhill Barracks', nameAr: 'ثكنات غرينهيل', x: 6510, y: 6641, elevation: 140, type: 'military' },
    { name: 'Mineraly', nameAr: 'مينيرالي', x: 6041, y: 7980, elevation: 95, type: 'town' },
    { name: 'Nadezhda Mine', nameAr: 'منجم ناديجدا', x: 7585, y: 6815, elevation: 180, type: 'military' },
    { name: 'Goluboy Glaz', nameAr: 'غولوبوي غلاز', x: 5569, y: 5924, elevation: 210, type: 'hill' },
    { name: 'Devils Rift (260m)', nameAr: 'صدع الشياطين (260م)', x: 4343, y: 5846, elevation: 260, type: 'hill' },
    { name: 'Mussel Cove', nameAr: 'خليج بلح البحر', x: 7042, y: 8770, elevation: 15, type: 'coastal' },
    { name: 'Harbour Kitchen', nameAr: 'مطبخ الميناء', x: 5965, y: 8303, elevation: 40, type: 'town' },
    { name: 'Kolguyev Airbase', nameAr: 'قاعدة كولجويف الجوية', x: 6400, y: 3200, elevation: 35, type: 'airfield' },
    { name: 'Radar Dome Peak (480m)', nameAr: 'قمة قبة الرادار (480م)', x: 5800, y: 5400, elevation: 480, type: 'military' },
  ],
  coastline: [
    [
      [2200, 3100], [2800, 5200], [2400, 7200], [3600, 9400], [5400, 10800],
      [7800, 10400], [9800, 8800], [10600, 6800], [10200, 4200], [8600, 2400],
      [6400, 1800], [4200, 2100], [2200, 3100]
    ]
  ],
  roads: [
    {
      type: 'primary',
      points: [[3800, 3719], [4452, 3491], [6400, 3200], [7585, 6815]]
    },
    {
      type: 'secondary',
      points: [[6400, 3200], [5800, 5400], [6510, 6641], [7042, 8770]]
    }
  ],
  terrainContours: [
    { level: 50, path: [[2900, 3600], [3500, 5600], [4800, 8400], [6800, 9800], [8800, 8600], [9800, 6200], [8800, 3600], [5800, 2600], [2900, 3600]] },
    { level: 150, path: [[3800, 4200], [4200, 6000], [5200, 8200], [7200, 8400], [8200, 6800], [7800, 4500], [5400, 3800], [3800, 4200]] },
    { level: 250, path: [[4600, 4800], [5100, 6400], [6200, 7600], [7200, 6500], [6600, 4900], [4600, 4800]] },
    { level: 350, path: [[5200, 5100], [5700, 5800], [6400, 5700], [6100, 5000], [5200, 5100]] },
    { level: 450, path: [[5650, 5350], [5800, 5450], [5950, 5400], [5850, 5300], [5650, 5350]] },
  ],
};

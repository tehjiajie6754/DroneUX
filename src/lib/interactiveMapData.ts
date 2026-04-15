import mapCoordinateRaw from "../../map_coordinate.json";

type Vec3 = [number, number, number];

type RawMapModel = {
  name: string;
  coordinates: Vec3;
  source: string;
  uri: string | null;
};

type RawTargetBuilding = {
  target_name: string;
  building_name: string;
  building_coordinates: Vec3;
  nearest_survivor_name: string;
  nearest_survivor_coordinates: Vec3;
  distance_xy_m: number;
};

type RawMapCoordinate = {
  world_file: string;
  near_threshold_m: number;
  building_models: RawMapModel[];
  survivor_models: RawMapModel[];
  target_buildings: RawTargetBuilding[];
};

export type WorldPoint = {
  x: number;
  y: number;
};

export type NormalizedPoint = {
  x: number;
  y: number;
};

export type MapBounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

export type MapBuilding = {
  id: string;
  name: string;
  world: WorldPoint;
  point: NormalizedPoint;
  width: number;
  height: number;
  collapsed: boolean;
  color: string;
};

export type MapSurvivor = {
  id: string;
  name: string;
  world: WorldPoint;
  point: NormalizedPoint;
};

export type MapTarget = {
  id: string;
  name: string;
  buildingName: string;
  survivorName: string;
  world: WorldPoint;
  point: NormalizedPoint;
  distance: number;
};

export type ChargingStation = {
  id: string;
  name: string;
  world: WorldPoint;
  point: NormalizedPoint;
};

export type MapDrone = {
  id: string;
  label: string;
  stationId: string;
  world: WorldPoint;
  point: NormalizedPoint;
};

export type RoadSegment = {
  id: string;
  points: NormalizedPoint[];
};

export type InteractiveMapData = {
  mapSize: number;
  bounds: MapBounds;
  buildings: MapBuilding[];
  survivors: MapSurvivor[];
  targets: MapTarget[];
  stations: ChargingStation[];
  drones: MapDrone[];
  roads: RoadSegment[];
};

const raw = mapCoordinateRaw as RawMapCoordinate;
const MAP_SIZE = 2000;
const CORNER_PADDING = 10;

const getWorldPoint = (coordinates: Vec3): WorldPoint => ({
  x: coordinates[0],
  y: coordinates[1],
});

const getBuildingDimensions = (name: string): { width: number; height: number } => {
  const normalized = name.toLowerCase();
  if (normalized.includes("industrial")) return { width: 120, height: 90 };
  if (normalized.includes("fire_station")) return { width: 95, height: 75 };
  if (normalized.includes("police_station")) return { width: 100, height: 78 };
  if (normalized.includes("collapsed_house") || normalized.includes("house")) return { width: 82, height: 64 };
  return { width: 88, height: 70 };
};

const getBuildingColor = (name: string): string => {
  const normalized = name.toLowerCase();
  if (normalized.includes("collapsed_industrial")) return "rgba(230, 124, 56, 0.88)";
  if (normalized.includes("collapsed_fire_station")) return "rgba(192, 54, 68, 0.9)";
  if (normalized.includes("collapsed_police_station")) return "rgba(70, 92, 208, 0.86)";
  if (normalized.includes("collapsed_house")) return "rgba(138, 149, 171, 0.88)";
  if (normalized.includes("collapsed")) return "rgba(206, 122, 72, 0.85)";
  if (normalized.includes("indian_house") || normalized.includes("house")) return "rgba(174, 182, 201, 0.9)";
  return "rgba(114, 133, 189, 0.9)";
};

const chargingEntries = raw.building_models
  .filter((model) => model.name.startsWith("charging_center_"))
  .map((model, index) => ({
    id: `station-${index + 1}`,
    name: model.name,
    world: getWorldPoint(model.coordinates),
  }));

const stationExtents = chargingEntries.reduce(
  (acc, station) => {
    acc.minX = Math.min(acc.minX, station.world.x);
    acc.maxX = Math.max(acc.maxX, station.world.x);
    acc.minY = Math.min(acc.minY, station.world.y);
    acc.maxY = Math.max(acc.maxY, station.world.y);
    return acc;
  },
  {
    minX: Number.POSITIVE_INFINITY,
    maxX: Number.NEGATIVE_INFINITY,
    minY: Number.POSITIVE_INFINITY,
    maxY: Number.NEGATIVE_INFINITY,
  },
);

const bounds: MapBounds = {
  minX: stationExtents.minX - CORNER_PADDING,
  maxX: stationExtents.maxX + CORNER_PADDING,
  minY: stationExtents.minY - CORNER_PADDING,
  maxY: stationExtents.maxY + CORNER_PADDING,
};

const toNormalizedPoint = (world: WorldPoint): NormalizedPoint => {
  const xRatio = (world.x - bounds.minX) / (bounds.maxX - bounds.minX);
  const yRatio = (world.y - bounds.minY) / (bounds.maxY - bounds.minY);

  return {
    x: xRatio * MAP_SIZE,
    y: MAP_SIZE - yRatio * MAP_SIZE,
  };
};

const stations: ChargingStation[] = chargingEntries.map((entry) => ({
  ...entry,
  point: toNormalizedPoint(entry.world),
}));

const stationByName = new Map(stations.map((station) => [station.name, station]));

const drones: MapDrone[] = [
  { id: "Alpha-1", label: "drone_nw", stationId: "station-nw" },
  { id: "Bravo-2", label: "drone_ne", stationId: "station-ne" },
  { id: "Charlie-3", label: "drone_sw", stationId: "station-sw" },
  { id: "Delta-4", label: "drone_se", stationId: "station-se" },
].map((drone) => {
  const stationName = `charging_center_${drone.label.split("_")[1]}`;
  const station = stationByName.get(stationName);
  if (!station) {
    throw new Error(`Missing station for ${stationName}`);
  }

  return {
    ...drone,
    world: station.world,
    point: station.point,
  };
});

const buildings: MapBuilding[] = raw.building_models
  .filter((model) => !model.name.startsWith("charging_center_"))
  .map((model, index) => {
    const world = getWorldPoint(model.coordinates);
    const point = toNormalizedPoint(world);
    const { width, height } = getBuildingDimensions(model.name);

    return {
      id: `building-${index + 1}`,
      name: model.name,
      world,
      point,
      width,
      height,
      collapsed: model.name.toLowerCase().includes("collapsed"),
      color: getBuildingColor(model.name),
    };
  });

const survivors: MapSurvivor[] = raw.survivor_models.map((model, index) => {
  const world = getWorldPoint(model.coordinates);
  return {
    id: `survivor-${index + 1}`,
    name: model.name,
    world,
    point: toNormalizedPoint(world),
  };
});

const targets: MapTarget[] = raw.target_buildings.map((target, index) => {
  const world = getWorldPoint(target.building_coordinates);
  return {
    id: `target-${index + 1}`,
    name: target.target_name,
    buildingName: target.building_name,
    survivorName: target.nearest_survivor_name,
    world,
    point: toNormalizedPoint(world),
    distance: target.distance_xy_m,
  };
});

const V1 = 12;
const V2 = 50;
const V3 = 86;
const V4 = 132;
const H1 = 35;
const H2 = -2;
const H3 = -38;

const worldRoads: Array<Array<WorldPoint>> = [
  // Grid Verticals
  [ { x: V1, y: H1 }, { x: V1, y: H2 }, { x: V1, y: H3 } ],
  [ { x: V2, y: H1 }, { x: V2, y: H2 }, { x: V2, y: H3 } ],
  [ { x: V3, y: H1 }, { x: V3, y: H2 }, { x: V3, y: H3 } ],
  [ { x: V4, y: H1 }, { x: V4, y: H2 }, { x: V4, y: H3 } ],

  // Grid Horizontals
  [ { x: V1, y: H1 }, { x: V2, y: H1 }, { x: V3, y: H1 }, { x: V4, y: H1 } ],
  [ { x: V1, y: H2 }, { x: V2, y: H2 }, { x: V3, y: H2 }, { x: V4, y: H2 } ],
  [ { x: V1, y: H3 }, { x: V2, y: H3 }, { x: V3, y: H3 }, { x: V4, y: H3 } ],

  // NW Corner
  [ { x: -25, y: 85 }, { x: -15, y: 55 }, { x: V1, y: H1 } ],
  [ { x: -15, y: 55 }, { x: 20, y: 50 }, { x: V2, y: H1 } ],
  [ { x: -25, y: 85 }, { x: -5, y: 85 } ],

  // NE Corner Perimeter (Surrounding all buildings in the NE area)
  [ { x: 148, y: 85 }, { x: 154, y: 65 }, { x: 144, y: 45 }, { x: V4, y: H1 } ], // Right boundary
  [ { x: 148, y: 85 }, { x: 115, y: 83 }, { x: 75, y: 82 }, { x: 45, y: 65 }, { x: V2, y: H1 } ], // Top & Left boundary
  [ { x: 124, y: 83 }, { x: 124, y: H1 } ], // Vertical road separating collapsed_house_4 and target_building_5

  // SW Corner
  [ { x: -25, y: -90 }, { x: -5, y: -60 }, { x: V1, y: H3 } ],
  [ { x: -10, y: -75 }, { x: 20, y: -75 }, { x: V2, y: H3 } ],
  [ { x: V1, y: H3 }, { x: 30, y: -20 }, { x: V2, y: H2 } ], // SW inner diagonal connecting left to center

  // SE Corner
  [ { x: 148, y: -90 }, { x: 135, y: -60 }, { x: V4, y: H3 } ],
  [ { x: V4, y: H3 }, { x: 110, y: -20 }, { x: V3, y: H2 } ], // SE inner diagonal

  // Branch to collapsed_police_station_3
  [ { x: 94, y: H3 }, { x: 94, y: -52 } ]
];

const roads: RoadSegment[] = worldRoads.map((segment, index) => ({
  id: `road-${index + 1}`,
  points: segment.map(toNormalizedPoint),
}));

export const interactiveMapData: InteractiveMapData = {
  mapSize: MAP_SIZE,
  bounds,
  buildings,
  survivors,
  targets,
  stations,
  drones,
  roads,
};

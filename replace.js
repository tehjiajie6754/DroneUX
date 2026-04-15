const fs = require('fs');
const filePath = 'C:/Users/yeswa/OneDrive/Desktop/DroneUX/src/lib/interactiveMapData.ts';
let code = fs.readFileSync(filePath, 'utf8');

const startIdx = code.indexOf('const worldRoads: Array<Array<WorldPoint>> = [');
const endMarker = '];\n\nconst roads: RoadSegment[] = worldRoads.map';
const endIdx = code.indexOf(endMarker);

const newRoads = `const worldRoads: Array<Array<WorldPoint>> = [
  // 1: NW (Top-Left)
  [
    { x: -25, y: 85 },
    { x: 35, y: 85 },
  ],
  [
    { x: -25, y: 85 },
    { x: -10, y: 65 }, 
    { x: 15, y: 40 }, 
    { x: 48, y: 20 },
    { x: 78, y: 20 },
    { x: 124, y: 20 },
    { x: 145, y: 20 },
  ],
  [
    { x: -25, y: 85 },
    { x: -25, y: 55 },
    { x: -20, y: 30 },
    { x: -8, y: 5 },
    { x: 2, y: -6 },
    { x: 20, y: -6 },
    { x: 145, y: -6 },
  ],

  // 2: SW (Bottom-Left)
  [
    { x: -25, y: -90 },
    { x: 6, y: -90 },
    { x: 22, y: -90 },
    { x: 22, y: -50 },
    { x: 40, y: -30 },
    { x: 55, y: -14 },
    { x: 74, y: -6 },
  ],
  [
    { x: -25, y: -90 },
    { x: -5, y: -65 },
    { x: 10, y: -45 },
    { x: 22, y: -30 },
  ],

  // 3: SE (Bottom-Right)
  [
    { x: 145, y: -90 },
    { x: 145, y: -56 },
    { x: 145, y: -25 },
    { x: 135, y: 0 },
    { x: 110, y: 20 },
  ],
  [
    { x: 145, y: -90 },
    { x: 120, y: -75 },
    { x: 95, y: -60 },
    { x: 70, y: -45 },
    { x: 45, y: -30 },
    { x: 28, y: -15 },
    { x: 20, y: -6 },
  ],

  // 4: NE (Top-Right)
  [
    { x: 150, y: 85 },
    { x: 145, y: 76 },
    { x: 145, y: 62 },
    { x: 138, y: 54 },
    { x: 126, y: 38 },
    { x: 112, y: 25 },
    { x: 90, y: 5 },
    { x: 70, y: -6 },
  ],
  [
    { x: 138, y: 54 },
    { x: 120, y: 54 },
    { x: 90, y: 54 },
    { x: 70, y: 40 },
    { x: 50, y: 25 },
    { x: 22, y: 0 },
  ],
  [
    { x: 58, y: 15 },
    { x: 80, y: 35 },
    { x: 102, y: 55 },
    { x: 120, y: 70 },
  ]
`;

code = code.substring(0, startIdx) + newRoads + code.substring(endIdx);
fs.writeFileSync(filePath, code, 'utf8');

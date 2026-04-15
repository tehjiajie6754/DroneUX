"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CATEGORY_COLORS,
  classifyBuilding,
  type BuildingFootprint,
} from "@/lib/buildings";
import type { DroneFrame, DroneStatus, FleetFrame, MapData, RoadSegment } from "@/lib/telemetry";

export interface LayerToggles {
  label: boolean;
  heading: boolean;
  altitude: boolean;
  speed: boolean;
  trail: boolean;
  buildings: boolean;
  survivors: boolean;
  targets: boolean;
}

interface Props {
  mapData: MapData;
  frame: FleetFrame | null;
  previousFrame: FleetFrame | null;
  toggles: LayerToggles;
}

const VIEW_W = 1600;
const VIEW_H = 1000;
const TRAIL_LEN = 120;
const DRONE_COLORS: Record<string, string> = {
  drone_nw: "#f97316",
  drone_ne: "#22d3ee",
  drone_se: "#a855f7",
  drone_sw: "#eab308",
};

// Spawn poses match the pre-placed drone models in
// world/disaster_zone_newest.sdf; each drone sits on its charging pad.
const SPAWN_POSES: Array<{ id: string; x: number; y: number }> = [
  { id: "drone_nw", x: -25, y: 85 },
  { id: "drone_ne", x: 150, y: 85 },
  { id: "drone_se", x: 150, y: -90 },
  { id: "drone_sw", x: -25, y: -90 },
];

interface Transform {
  scale: number; // px per world meter
  tx: number; // translate x (screen px)
  ty: number; // translate y (screen px)
}

// World (east, north) -> screen. Y is flipped so +north is up.
function worldToScreen(x: number, y: number, t: Transform) {
  return { sx: x * t.scale + t.tx, sy: -y * t.scale + t.ty };
}

function screenToWorld(sx: number, sy: number, t: Transform) {
  return { x: (sx - t.tx) / t.scale, y: -(sy - t.ty) / t.scale };
}

// Pick a grid spacing (m) so lines stay legible regardless of zoom.
function pickGridStep(pxPerMeter: number): number {
  const targetPx = 80;
  const steps = [1, 2, 5, 10, 20, 50, 100, 200, 500];
  for (const s of steps) {
    if (s * pxPerMeter >= targetPx) return s;
  }
  return 1000;
}

export default function LiveMap({ mapData, frame, previousFrame, toggles }: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [transform, setTransform] = useState<Transform>({ scale: 4, tx: VIEW_W / 2, ty: VIEW_H / 2 });
  const [hoverWorld, setHoverWorld] = useState<{ x: number; y: number } | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; tx: number; ty: number } | null>(null);

  const footprints: BuildingFootprint[] = useMemo(
    () => (mapData.building_models || []).map(classifyBuilding),
    [mapData],
  );

  // Fit to content on first render / when map data changes.
  const didFit = useRef(false);
  useEffect(() => {
    if (didFit.current || footprints.length === 0) return;
    const xs: number[] = [];
    const ys: number[] = [];
    for (const f of footprints) {
      xs.push(f.x);
      ys.push(f.y);
    }
    for (const s of mapData.survivor_models || []) {
      xs.push(s.coordinates[0]);
      ys.push(s.coordinates[1]);
    }
    if (xs.length === 0) return;
    const minX = Math.min(...xs) - 20;
    const maxX = Math.max(...xs) + 20;
    const minY = Math.min(...ys) - 20;
    const maxY = Math.max(...ys) + 20;
    const spanX = maxX - minX || 1;
    const spanY = maxY - minY || 1;
    const scale = Math.min(VIEW_W / spanX, VIEW_H / spanY) * 0.9;
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    setTransform({
      scale,
      tx: VIEW_W / 2 - cx * scale,
      ty: VIEW_H / 2 + cy * scale,
    });
    didFit.current = true;
  }, [footprints, mapData]);

  // Interpolated drone positions so 20 Hz updates look smooth.
  const [interp, setInterp] = useState<DroneFrame[]>([]);
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    if (!frame) return;
    if (!previousFrame) {
      setInterp(frame.drones);
      return;
    }
    const startT = performance.now();
    const span = Math.max(1, (frame.ts - previousFrame.ts) * 1000);
    const prevById = new Map(previousFrame.drones.map((d) => [d.id, d]));
    const step = () => {
      const t = Math.min(1, (performance.now() - startT) / span);
      const out = frame.drones.map((d) => {
        const p = prevById.get(d.id);
        if (!p) return d;
        return {
          ...d,
          x: p.x + (d.x - p.x) * t,
          y: p.y + (d.y - p.y) * t,
          z: p.z + (d.z - p.z) * t,
        };
      });
      setInterp(out);
      if (t < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [frame, previousFrame]);

  // Trail buffer per drone.
  const trailRef = useRef<Map<string, Array<{ x: number; y: number }>>>(new Map());
  useEffect(() => {
    if (!frame) return;
    const trails = trailRef.current;
    for (const d of frame.drones) {
      let arr = trails.get(d.id);
      if (!arr) {
        arr = [];
        trails.set(d.id, arr);
      }
      const last = arr[arr.length - 1];
      if (!last || Math.hypot(last.x - d.x, last.y - d.y) > 0.05) {
        arr.push({ x: d.x, y: d.y });
      }
      if (arr.length > TRAIL_LEN) arr.splice(0, arr.length - TRAIL_LEN);
    }
  }, [frame]);

  // Interaction: wheel zoom around cursor, drag to pan.
  const onWheel = useCallback((e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = ((e.clientX - rect.left) / rect.width) * VIEW_W;
    const py = ((e.clientY - rect.top) / rect.height) * VIEW_H;
    const world = screenToWorld(px, py, transform);
    const factor = Math.exp(-e.deltaY * 0.0015);
    const newScale = Math.min(40, Math.max(0.3, transform.scale * factor));
    setTransform({
      scale: newScale,
      tx: px - world.x * newScale,
      ty: py + world.y * newScale,
    });
  }, [transform]);

  const onPointerDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    (e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      tx: transform.tx,
      ty: transform.ty,
    };
  }, [transform]);

  const onPointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (rect) {
      const px = ((e.clientX - rect.left) / rect.width) * VIEW_W;
      const py = ((e.clientY - rect.top) / rect.height) * VIEW_H;
      setHoverWorld(screenToWorld(px, py, transform));
    }
    const d = dragRef.current;
    if (!d || !rect) return;
    const dx = ((e.clientX - d.startX) / rect.width) * VIEW_W;
    const dy = ((e.clientY - d.startY) / rect.height) * VIEW_H;
    setTransform((prev) => ({ ...prev, tx: d.tx + dx, ty: d.ty + dy }));
  }, [transform]);

  const onPointerUp = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    dragRef.current = null;
    try {
      (e.currentTarget as SVGSVGElement).releasePointerCapture(e.pointerId);
    } catch {}
  }, []);

  const onPointerLeave = useCallback(() => {
    dragRef.current = null;
    setHoverWorld(null);
  }, []);

  // Derived: grid step + visible bounds.
  const gridStep = pickGridStep(transform.scale);
  const topLeft = screenToWorld(0, 0, transform);
  const bottomRight = screenToWorld(VIEW_W, VIEW_H, transform);
  const gridMinX = Math.floor(topLeft.x / gridStep) * gridStep;
  const gridMaxX = Math.ceil(bottomRight.x / gridStep) * gridStep;
  const gridMinY = Math.floor(bottomRight.y / gridStep) * gridStep;
  const gridMaxY = Math.ceil(topLeft.y / gridStep) * gridStep;

  const showLabels = transform.scale >= 2.5;
  const survivorLookup = new Map(
    (mapData.survivor_models || []).map((s) => [s.name, s]),
  );

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      preserveAspectRatio="xMidYMid meet"
      style={{
        width: "100%",
        height: "100%",
        borderRadius: 12,
        cursor: dragRef.current ? "grabbing" : "grab",
        display: "block",
        touchAction: "none",
        userSelect: "none",
      }}
      onWheel={onWheel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerLeave}
    >
      <defs>
        <radialGradient id="ground" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#020617" />
        </radialGradient>
        <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
          <feOffset dx="0" dy="1" result="offsetblur" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.5" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="survivorPulse" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f87171" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#f87171" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* background */}
      <rect x={0} y={0} width={VIEW_W} height={VIEW_H} fill="url(#ground)" />

      {/* grid */}
      <g stroke="#1e293b" strokeWidth={1}>
        {Array.from({ length: Math.floor((gridMaxX - gridMinX) / gridStep) + 1 }).map((_, i) => {
          const wx = gridMinX + i * gridStep;
          const { sx } = worldToScreen(wx, 0, transform);
          return <line key={`vx${i}`} x1={sx} y1={0} x2={sx} y2={VIEW_H} />;
        })}
        {Array.from({ length: Math.floor((gridMaxY - gridMinY) / gridStep) + 1 }).map((_, i) => {
          const wy = gridMinY + i * gridStep;
          const { sy } = worldToScreen(0, wy, transform);
          return <line key={`hy${i}`} x1={0} y1={sy} x2={VIEW_W} y2={sy} />;
        })}
      </g>

      {/* major axes */}
      <g stroke="#334155" strokeWidth={1.5}>
        <line x1={0} y1={worldToScreen(0, 0, transform).sy} x2={VIEW_W} y2={worldToScreen(0, 0, transform).sy} />
        <line x1={worldToScreen(0, 0, transform).sx} y1={0} x2={worldToScreen(0, 0, transform).sx} y2={VIEW_H} />
      </g>

      {/* grid coord labels */}
      <g fill="#475569" fontSize={10} fontFamily="ui-monospace, monospace">
        {Array.from({ length: Math.floor((gridMaxX - gridMinX) / gridStep) + 1 }).map((_, i) => {
          const wx = gridMinX + i * gridStep;
          const { sx } = worldToScreen(wx, 0, transform);
          if (sx < 20 || sx > VIEW_W - 20) return null;
          return (
            <text key={`lx${i}`} x={sx + 3} y={VIEW_H - 6}>
              {wx}m
            </text>
          );
        })}
        {Array.from({ length: Math.floor((gridMaxY - gridMinY) / gridStep) + 1 }).map((_, i) => {
          const wy = gridMinY + i * gridStep;
          const { sy } = worldToScreen(0, wy, transform);
          if (sy < 12 || sy > VIEW_H - 12) return null;
          return (
            <text key={`ly${i}`} x={6} y={sy - 3}>
              {wy}m
            </text>
          );
        })}
      </g>

      {/* roads — drawn above the grid but below all markers and buildings */}
      {(mapData.roads ?? []).map((r) => {
        const { sx, sy } = worldToScreen(r.cx, r.cy, transform);
        // Use proper rotation so diagonal curved segments render correctly.
        // yaw is the angle of the road's long axis from east (radians, CCW positive).
        // SVG rotate() is clockwise-positive, so negate yaw to match world convention.
        const sw = r.length * transform.scale;
        const sh = r.width  * transform.scale;
        return (
          <g key={r.name} transform={`translate(${sx},${sy}) rotate(${(-r.yaw * 180) / Math.PI})`}>
            <rect
              x={-sw / 2}
              y={-sh / 2}
              width={sw}
              height={sh}
              fill="#1e1e1e"
              stroke="#2a2a2a"
              strokeWidth={0.5}
              opacity={0.92}
            />
          </g>
        );
      })}

      {/* buildings */}
      {toggles.buildings && (
        <g filter="url(#softShadow)">
          {footprints.map((f) => {
            const { sx, sy } = worldToScreen(f.x, f.y, transform);
            const w = f.width * transform.scale;
            const h = f.depth * transform.scale;
            const colors = CATEGORY_COLORS[f.category];
            return (
              <g key={f.name} transform={`translate(${sx}, ${sy}) rotate(${(-f.yaw * 180) / Math.PI})`}>
                <rect
                  x={-w / 2}
                  y={-h / 2}
                  width={w}
                  height={h}
                  rx={2}
                  fill={colors.fill}
                  fillOpacity={0.85}
                  stroke={colors.stroke}
                  strokeWidth={1.2}
                />
                {showLabels && (
                  <text
                    x={0}
                    y={h / 2 + 12}
                    fontSize={10}
                    textAnchor="middle"
                    fill="#cbd5e1"
                    fontFamily="ui-sans-serif, sans-serif"
                  >
                    {f.name}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      )}

      {/* survivors */}
      {toggles.survivors && (
        <g>
          {(mapData.survivor_models || []).map((s) => {
            const { sx, sy } = worldToScreen(s.coordinates[0], s.coordinates[1], transform);
            return (
              <g key={s.name}>
                <circle cx={sx} cy={sy} r={18} fill="url(#survivorPulse)">
                  <animate attributeName="r" values="14;22;14" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx={sx} cy={sy} r={5} fill="#f87171" stroke="#fee2e2" strokeWidth={1.5} />
                {showLabels && (
                  <text x={sx + 9} y={sy + 3} fontSize={10} fill="#fca5a5">
                    {s.name}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      )}

      {/* target rings + links to nearest survivor */}
      {toggles.targets && (
        <g>
          {(mapData.target_buildings || []).map((t) => {
            const { sx, sy } = worldToScreen(
              t.building_coordinates[0],
              t.building_coordinates[1],
              transform,
            );
            const link = t.nearest_survivor_name
              ? survivorLookup.get(t.nearest_survivor_name)
              : undefined;
            const linkPts = link
              ? worldToScreen(link.coordinates[0], link.coordinates[1], transform)
              : null;
            return (
              <g key={t.target_name}>
                <circle
                  cx={sx}
                  cy={sy}
                  r={16}
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth={2}
                  strokeDasharray="4 3"
                />
                {linkPts && (
                  <line
                    x1={sx}
                    y1={sy}
                    x2={linkPts.sx}
                    y2={linkPts.sy}
                    stroke="#4ade80"
                    strokeWidth={1.2}
                    strokeDasharray="3 3"
                    opacity={0.7}
                  />
                )}
                {showLabels && (
                  <text x={sx + 20} y={sy + 4} fontSize={10} fill="#86efac">
                    {t.target_name}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      )}

      {/* drone trails */}
      {toggles.trail && (
        <g>
          {Array.from(trailRef.current.entries()).map(([id, arr]) => {
            const color = DRONE_COLORS[id] ?? "#ef4444";
            const pts = arr
              .map((p) => {
                const { sx, sy } = worldToScreen(p.x, p.y, transform);
                return `${sx.toFixed(1)},${sy.toFixed(1)}`;
              })
              .join(" ");
            return (
              <polyline
                key={`trail-${id}`}
                points={pts}
                fill="none"
                stroke={color}
                strokeWidth={2}
                opacity={0.7}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            );
          })}
        </g>
      )}

      {/* placeholder drones at spawn poses when no live telemetry yet */}
      {interp.length === 0 && (
        <g>
          {SPAWN_POSES.map((p) => {
            const { sx, sy } = worldToScreen(p.x, p.y, transform);
            return (
              <DroneIcon
                key={`spawn-${p.id}`}
                sx={sx}
                sy={sy}
                id={p.id}
                yawDeg={0}
                placeholder
                showLabel={toggles.label}
              />
            );
          })}
        </g>
      )}

      {/* live drones */}
      <g>
        {interp.map((d) => {
          const { sx, sy } = worldToScreen(d.x, d.y, transform);
          const stale = d.source === "stale" || d.source === "init";
          return (
            <DroneIcon
              key={d.id}
              sx={sx}
              sy={sy}
              id={d.id}
              yawDeg={d.heading}
              stale={stale}
              showLabel={toggles.label}
              showHeading={toggles.heading}
              showAltitude={toggles.altitude}
              showSpeed={toggles.speed}
              altitude={d.z}
              speed={d.speed}
              battery={d.battery}
              status={d.status}
            />
          );
        })}
      </g>

      {/* scale bar (bottom-left) */}
      <ScaleBar transform={transform} />

      {/* compass (top-right) */}
      <g transform={`translate(${VIEW_W - 70}, 70)`}>
        <circle r={30} fill="#0f172a" opacity={0.7} stroke="#334155" />
        <polygon points="0,-22 6,0 0,-4 -6,0" fill="#ef4444" />
        <polygon points="0,22 6,0 0,4 -6,0" fill="#64748b" />
        <text y={-32} textAnchor="middle" fontSize={10} fill="#e2e8f0">
          N
        </text>
      </g>

      {/* hover readout */}
      {hoverWorld && (
        <g>
          <rect x={VIEW_W - 220} y={VIEW_H - 50} width={210} height={34} rx={6} fill="#0f172a" opacity={0.75} />
          <text x={VIEW_W - 210} y={VIEW_H - 30} fontSize={11} fill="#94a3b8" fontFamily="ui-monospace, monospace">
            x {hoverWorld.x.toFixed(1)}  y {hoverWorld.y.toFixed(1)} m
          </text>
          <text x={VIEW_W - 210} y={VIEW_H - 18} fontSize={10} fill="#64748b" fontFamily="ui-monospace, monospace">
            zoom {transform.scale.toFixed(1)}× · grid {gridStep}m
          </text>
        </g>
      )}
    </svg>
  );
}

interface DroneIconProps {
  sx: number;
  sy: number;
  id: string;
  yawDeg: number;
  stale?: boolean;
  placeholder?: boolean;
  showLabel?: boolean;
  showHeading?: boolean;
  showAltitude?: boolean;
  showSpeed?: boolean;
  altitude?: number;
  speed?: number;
  battery?: number;
  status?: DroneStatus;
}

// Top-down quadcopter glyph: central body, 4 arms at 45°, rotor rings.
// Fixed pixel size so it stays legible regardless of map zoom.
function DroneIcon({
  sx,
  sy,
  id,
  yawDeg,
  stale = false,
  placeholder = false,
  showLabel = true,
  showHeading = true,
  showAltitude = false,
  showSpeed = false,
  altitude,
  speed,
  battery,
  status,
}: DroneIconProps) {
  const color = DRONE_COLORS[id] ?? "#ef4444";
  // SVG rotates clockwise; yaw is CCW from +x, so invert for the group.
  const rot = -yawDeg;
  const opacity = placeholder ? 0.6 : stale ? 0.45 : 1;
  const armLen = 18;
  const rotorR = 7;
  const isCharging = status === "charging";
  return (
    <g transform={`translate(${sx}, ${sy})`} opacity={opacity}>
      {/* charging halo: pulsing yellow ring while parked and refilling */}
      {isCharging && (
        <g>
          <circle r={32} fill="none" stroke="#facc15" strokeWidth={2.5}>
            <animate attributeName="r" values="22;38;22" dur="1.4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.95;0.15;0.95" dur="1.4s" repeatCount="indefinite" />
          </circle>
          <circle r={26} fill="#facc15" opacity={0.12}>
            <animate attributeName="opacity" values="0.22;0.05;0.22" dur="1.4s" repeatCount="indefinite" />
          </circle>
        </g>
      )}
      {/* signal halo */}
      <circle r={26} fill={color} opacity={0.08} />
      <circle r={16} fill={color} opacity={0.14} />

      <g transform={`rotate(${rot})`}>
        {/* heading cone showing facing direction */}
        {showHeading && (
          <path
            d={`M 0 0 L ${armLen + 18} -9 L ${armLen + 22} 0 L ${armLen + 18} 9 Z`}
            fill={color}
            opacity={0.35}
          />
        )}

        {/* arms (X config) */}
        <g stroke={placeholder ? color : "#0f172a"} strokeWidth={3} strokeLinecap="round">
          <line x1={-armLen} y1={-armLen} x2={armLen} y2={armLen} />
          <line x1={-armLen} y1={armLen} x2={armLen} y2={-armLen} />
        </g>
        <g stroke={color} strokeWidth={1.5} strokeLinecap="round">
          <line x1={-armLen} y1={-armLen} x2={armLen} y2={armLen} />
          <line x1={-armLen} y1={armLen} x2={armLen} y2={-armLen} />
        </g>

        {/* rotors */}
        {[
          [armLen, armLen],
          [-armLen, armLen],
          [-armLen, -armLen],
          [armLen, -armLen],
        ].map(([rx, ry], i) => (
          <g key={i} transform={`translate(${rx}, ${ry})`}>
            <circle r={rotorR} fill="#0f172a" stroke={color} strokeWidth={2} />
            {!placeholder && (
              <g>
                <line
                  x1={-rotorR + 1}
                  y1={0}
                  x2={rotorR - 1}
                  y2={0}
                  stroke={color}
                  strokeWidth={1.5}
                  opacity={0.85}
                >
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0"
                    to="360"
                    dur="0.25s"
                    repeatCount="indefinite"
                  />
                </line>
              </g>
            )}
          </g>
        ))}

        {/* central body */}
        <circle r={8} fill="#0f172a" stroke={color} strokeWidth={2.5} />
        {/* forward indicator */}
        <circle cx={5} cy={0} r={2} fill={color} />
      </g>

      {showLabel && (
        <text x={armLen + 6} y={-armLen - 2} fontSize={12} fontWeight={700} fill="#f8fafc">
          {id}
        </text>
      )}
      {placeholder && showLabel && (
        <text x={armLen + 6} y={-armLen + 12} fontSize={9} fill="#64748b">
          spawn
        </text>
      )}
      {showAltitude && altitude != null && (
        <text x={armLen + 6} y={-armLen + 12} fontSize={10} fill="#e2e8f0">
          z {altitude.toFixed(1)}m
        </text>
      )}
      {showSpeed && speed != null && (
        <text x={armLen + 6} y={-armLen + 24} fontSize={10} fill="#e2e8f0">
          {speed.toFixed(1)} m/s
        </text>
      )}
      {!placeholder && battery != null && (
        <g transform={`translate(0, ${-armLen - 14})`}>
          <rect x={-18} y={-4} width={36} height={8} rx={2} fill="#0f172a" stroke="#334155" strokeWidth={1} />
          <rect x={16} y={-2} width={2} height={4} fill="#334155" />
          <rect
            x={-17}
            y={-3}
            width={Math.max(0, Math.min(34, (battery / 100) * 34))}
            height={6}
            fill={battery > 50 ? "#22c55e" : battery > 20 ? "#eab308" : "#ef4444"}
          />
          <text x={22} y={3} fontSize={9} fill="#e2e8f0" fontFamily="ui-monospace, monospace">
            {battery.toFixed(0)}%
          </text>
          {isCharging && (
            <text x={0} y={3} fontSize={10} textAnchor="middle" fill="#facc15" fontWeight={700}>
              ⚡
            </text>
          )}
        </g>
      )}
    </g>
  );
}

function ScaleBar({ transform }: { transform: Transform }) {
  const target = 160; // target bar length in px
  const meters = target / transform.scale;
  // Nice round number
  const pow = Math.pow(10, Math.floor(Math.log10(meters)));
  const base = meters / pow;
  const nice = base >= 5 ? 5 : base >= 2 ? 2 : 1;
  const stepM = nice * pow;
  const barPx = stepM * transform.scale;
  return (
    <g transform={`translate(24, ${VIEW_H - 30})`}>
      <rect x={-6} y={-18} width={barPx + 60} height={26} rx={6} fill="#0f172a" opacity={0.7} />
      <line x1={0} y1={0} x2={barPx} y2={0} stroke="#e2e8f0" strokeWidth={3} />
      <line x1={0} y1={-4} x2={0} y2={4} stroke="#e2e8f0" strokeWidth={2} />
      <line x1={barPx} y1={-4} x2={barPx} y2={4} stroke="#e2e8f0" strokeWidth={2} />
      <text x={barPx + 8} y={4} fontSize={11} fill="#e2e8f0" fontFamily="ui-monospace, monospace">
        {stepM} m
      </text>
    </g>
  );
}

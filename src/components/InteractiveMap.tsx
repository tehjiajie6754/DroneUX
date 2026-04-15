"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { interactiveMapData, type MapBuilding, type MapDrone, type MapSurvivor, type MapTarget, type ChargingStation } from "@/lib/interactiveMapData";

type ToggleState = {
  drones: boolean;
  stations: boolean;
  buildings: boolean;
  survivors: boolean;
  targets: boolean;
};

type SelectedEntity =
  | { type: "drone"; data: MapDrone }
  | { type: "station"; data: ChargingStation }
  | { type: "building"; data: MapBuilding }
  | { type: "survivor"; data: MapSurvivor }
  | { type: "target"; data: MapTarget };

const LABEL_FONT = "600 13px ui-sans-serif, system-ui, -apple-system";
const INFO_FONT = "500 11px ui-sans-serif, system-ui, -apple-system";
const MAP_PADDING = 100;

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

export default function InteractiveMap({ focusedDroneId }: { focusedDroneId?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(0.45);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState<SelectedEntity | null>(null);
  const [selected, setSelected] = useState<SelectedEntity | null>(null);
  const [toggles, setToggles] = useState<ToggleState>({
    drones: true,
    stations: true,
    buildings: true,
    survivors: true,
    targets: true,
  });

  const mapSize = interactiveMapData.mapSize;

  const world = useMemo(
    () => ({
      width: mapSize + MAP_PADDING * 2,
      height: mapSize + MAP_PADDING * 2,
    }),
    [mapSize],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const resizeObserver = new ResizeObserver(() => {
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      canvas.width = width;
      canvas.height = height;
      setViewport({ width, height });
    });

    resizeObserver.observe(parent);
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;
    setViewport({ width: parent.clientWidth, height: parent.clientHeight });

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!viewport.width || !viewport.height) return;

    const centeredScale = focusedDroneId ? 1.1 : Math.min(viewport.width / world.width, viewport.height / world.height) * 0.9;
    setScale(centeredScale);
    setOffset({
      x: viewport.width / 2 - (world.width * centeredScale) / 2,
      y: viewport.height / 2 - (world.height * centeredScale) / 2,
    });
  }, [viewport.width, viewport.height, world.width, world.height, focusedDroneId]);

  const findDroneForFocus = useCallback((id?: string) => {
    if (!id) return null;
    const direct = interactiveMapData.drones.find((drone) => drone.id === id);
    if (direct) return direct;

    const order = ["Alpha-1", "Bravo-2", "Charlie-3", "Delta-4"];
    const index = order.indexOf(id);
    return index >= 0 ? interactiveMapData.drones[index] : null;
  }, []);

  const getActiveTransform = useCallback(() => {
    if (focusedDroneId && viewport.width && viewport.height) {
      const focusedDrone = findDroneForFocus(focusedDroneId);
      if (focusedDrone) {
        const lockScale = 1.35;
        const x = focusedDrone.point.x + MAP_PADDING;
        const y = focusedDrone.point.y + MAP_PADDING;
        return {
          scale: lockScale,
          offset: {
            x: viewport.width / 2 - x * lockScale,
            y: viewport.height / 2 - y * lockScale,
          },
        };
      }
    }

    return { scale, offset };
  }, [findDroneForFocus, focusedDroneId, offset, scale, viewport.height, viewport.width]);

  const getEntityAtPoint = useCallback((screenX: number, screenY: number): SelectedEntity | null => {
    const transform = getActiveTransform();
    const mapX = (screenX - transform.offset.x) / transform.scale - MAP_PADDING;
    const mapY = (screenY - transform.offset.y) / transform.scale - MAP_PADDING;

    if (toggles.drones) {
      for (const drone of interactiveMapData.drones) {
        if (Math.hypot(drone.point.x - mapX, drone.point.y - mapY) <= 24) {
          return { type: "drone", data: drone };
        }
      }
    }

    if (toggles.stations) {
      for (const station of interactiveMapData.stations) {
        if (Math.hypot(station.point.x - mapX, station.point.y - mapY) <= 28) {
          return { type: "station", data: station };
        }
      }
    }

    if (toggles.targets) {
      for (const target of interactiveMapData.targets) {
        const d = Math.hypot(target.point.x - mapX, target.point.y - mapY);
        if (d <= 44) {
          return { type: "target", data: target };
        }
      }
    }

    if (toggles.survivors) {
      for (const survivor of interactiveMapData.survivors) {
        if (Math.hypot(survivor.point.x - mapX, survivor.point.y - mapY) <= 18) {
          return { type: "survivor", data: survivor };
        }
      }
    }

    if (toggles.buildings) {
      for (const building of interactiveMapData.buildings) {
        const halfW = building.width / 2;
        const halfH = building.height / 2;
        if (
          mapX >= building.point.x - halfW &&
          mapX <= building.point.x + halfW &&
          mapY >= building.point.y - halfH &&
          mapY <= building.point.y + halfH
        ) {
          return { type: "building", data: building };
        }
      }
    }

    return null;
  }, [getActiveTransform, toggles.buildings, toggles.drones, toggles.stations, toggles.survivors, toggles.targets]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrame = 0;

    const draw = () => {
      const transform = getActiveTransform();
      const now = performance.now();
      const pulse = (Math.sin(now / 350) + 1) / 2;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGradient.addColorStop(0, "#ecf3ff");
      bgGradient.addColorStop(1, "#dce9ff");
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(transform.offset.x, transform.offset.y);
      ctx.scale(transform.scale, transform.scale);
      ctx.translate(MAP_PADDING, MAP_PADDING);

      ctx.fillStyle = "#f5f9ff";
      ctx.fillRect(0, 0, mapSize, mapSize);

      ctx.strokeStyle = "rgba(59, 130, 246, 0.12)";
      ctx.lineWidth = 1;
      for (let x = 0; x <= mapSize; x += 200) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, mapSize);
        ctx.stroke();
      }
      for (let y = 0; y <= mapSize; y += 200) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(mapSize, y);
        ctx.stroke();
      }

      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      for (const road of interactiveMapData.roads) {
        if (road.points.length < 2) continue;

        ctx.beginPath();
        ctx.moveTo(road.points[0].x, road.points[0].y);
        for (let i = 1; i < road.points.length; i += 1) {
          const prev = road.points[i - 1];
          const current = road.points[i];
          const cx = (prev.x + current.x) / 2;
          const cy = (prev.y + current.y) / 2;
          ctx.quadraticCurveTo(prev.x, prev.y, cx, cy);
        }
        const last = road.points[road.points.length - 1];
        ctx.lineTo(last.x, last.y);

        // Dark grey outer border
        ctx.strokeStyle = "rgba(35, 38, 43, 0.98)";
        ctx.lineWidth = 36;
        ctx.stroke();

        // Dark grey inner lanes
        ctx.strokeStyle = "rgba(75, 80, 90, 0.95)";
        ctx.lineWidth = 32;
        ctx.stroke();

        // Dotted center line
        ctx.setLineDash([12, 16]);
        ctx.strokeStyle = "rgba(240, 240, 245, 0.7)";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      if (toggles.buildings) {
        for (const building of interactiveMapData.buildings) {
          const selectedBuilding = selected?.type === "building" && selected.data.id === building.id;
          drawRoundedRect(
            ctx,
            building.point.x - building.width / 2,
            building.point.y - building.height / 2,
            building.width,
            building.height,
            8,
          );
          ctx.fillStyle = building.color;
          ctx.fill();
          ctx.strokeStyle = selectedBuilding ? "#0f172a" : "rgba(255, 255, 255, 0.3)";
          ctx.lineWidth = selectedBuilding ? 4 : 1.5;
          ctx.stroke();

          if (toggles.buildings) {
            ctx.fillStyle = "rgba(37, 52, 92, 0.9)";
            ctx.font = INFO_FONT;
            ctx.textAlign = "center";
            ctx.fillText(building.name, building.point.x, building.point.y + building.height / 2 + 14);
          }
        }
      }

      if (toggles.targets) {
        for (const target of interactiveMapData.targets) {
          const selectedTarget = selected?.type === "target" && selected.data.id === target.id;
          ctx.beginPath();
          ctx.arc(target.point.x, target.point.y, 38, 0, Math.PI * 2);
          ctx.setLineDash([8, 8]);
          ctx.strokeStyle = selectedTarget ? "rgba(16, 185, 129, 1)" : "rgba(16, 185, 129, 0.82)";
          ctx.lineWidth = selectedTarget ? 4 : 3;
          ctx.stroke();
          ctx.setLineDash([]);

          if (toggles.targets) {
            ctx.fillStyle = "rgba(11, 130, 97, 0.95)";
            ctx.font = LABEL_FONT;
            ctx.textAlign = "left";
            ctx.fillText(target.name, target.point.x + 10, target.point.y + 6);
          }
        }
      }

      if (toggles.survivors) {
        for (const survivor of interactiveMapData.survivors) {
          const selectedSurvivor = selected?.type === "survivor" && selected.data.id === survivor.id;
          const radius = selectedSurvivor ? 16 : 12;
          const glow = 18 + pulse * 14;

          const gradient = ctx.createRadialGradient(
            survivor.point.x,
            survivor.point.y,
            1,
            survivor.point.x,
            survivor.point.y,
            glow,
          );
          gradient.addColorStop(0, "rgba(251, 113, 133, 0.95)");
          gradient.addColorStop(1, "rgba(251, 113, 133, 0)");
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(survivor.point.x, survivor.point.y, glow, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.arc(survivor.point.x, survivor.point.y, radius, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(252, 94, 109, 0.95)";
          ctx.fill();
          ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.fillStyle = "rgba(146, 31, 59, 0.88)";
          ctx.font = INFO_FONT;
          ctx.textAlign = "left";
          ctx.fillText(survivor.name, survivor.point.x + 16, survivor.point.y + 2);
        }
      }

      if (toggles.stations) {
        for (const station of interactiveMapData.stations) {
          const selectedStation = selected?.type === "station" && selected.data.id === station.id;
          drawRoundedRect(ctx, station.point.x - 36, station.point.y - 36, 72, 72, 12);
          ctx.fillStyle = "rgba(93, 146, 230, 0.3)";
          ctx.fill();
          ctx.strokeStyle = selectedStation ? "#2563eb" : "rgba(53, 109, 203, 0.8)";
          ctx.lineWidth = selectedStation ? 4 : 2;
          ctx.stroke();

          ctx.fillStyle = "rgba(36, 86, 175, 0.95)";
          ctx.font = LABEL_FONT;
          ctx.textAlign = "center";
          ctx.fillText(station.name, station.point.x, station.point.y + 58);
        }
      }

      if (toggles.drones) {
        for (const drone of interactiveMapData.drones) {
          const selectedDrone = selected?.type === "drone" && selected.data.id === drone.id;
          const dronePulse = 20 + pulse * 10;

          const glow = ctx.createRadialGradient(
            drone.point.x,
            drone.point.y,
            1,
            drone.point.x,
            drone.point.y,
            dronePulse,
          );
          glow.addColorStop(0, "rgba(52, 119, 246, 0.95)");
          glow.addColorStop(1, "rgba(52, 119, 246, 0)");
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(drone.point.x, drone.point.y, dronePulse, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.arc(drone.point.x, drone.point.y, selectedDrone ? 14 : 11, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(27, 98, 231, 0.95)";
          ctx.fill();
          ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
          ctx.lineWidth = selectedDrone ? 3 : 2;
          ctx.stroke();

          ctx.fillStyle = "rgba(28, 68, 152, 0.95)";
          ctx.font = LABEL_FONT;
          ctx.textAlign = "left";
          ctx.fillText(drone.label, drone.point.x + 14, drone.point.y - 6);
          ctx.font = INFO_FONT;
          ctx.fillText("100%", drone.point.x + 14, drone.point.y - 20);
        }
      }

      if (selected) {
        let p: { x: number; y: number } | null = null;
        if (selected.type === "building") p = selected.data.point;
        if (selected.type === "target") p = selected.data.point;
        if (selected.type === "survivor") p = selected.data.point;
        if (selected.type === "station") p = selected.data.point;
        if (selected.type === "drone") p = selected.data.point;

        if (p) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 52, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(30, 64, 175, 0.45)";
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      ctx.restore();

      animationFrame = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animationFrame);
  }, [getActiveTransform, mapSize, selected, toggles]);

  const handleWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
    if (focusedDroneId) return;

    event.preventDefault();
    const nextScale = Math.min(Math.max(0.3, scale - event.deltaY * 0.001), 2.4);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const cursorX = event.clientX - rect.left;
    const cursorY = event.clientY - rect.top;

    const newOffsetX = cursorX - ((cursorX - offset.x) * nextScale) / scale;
    const newOffsetY = cursorY - ((cursorY - offset.y) * nextScale) / scale;

    setScale(nextScale);
    setOffset({ x: newOffsetX, y: newOffsetY });
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (focusedDroneId) return;
    setIsDragging(true);
    setDragStart({ x: event.clientX - offset.x, y: event.clientY - offset.y });
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    setMouse({ x, y });

    if (isDragging && !focusedDroneId) {
      setOffset({
        x: event.clientX - dragStart.x,
        y: event.clientY - dragStart.y,
      });
      return;
    }

    setHovered(getEntityAtPoint(x, y));
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    setIsDragging(false);
    if (!focusedDroneId) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    setSelected(getEntityAtPoint(x, y));
  };

  const toggleOption = (key: keyof ToggleState) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="absolute inset-0 w-full h-full bg-blue-50">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={handleClick}
      />

      <div className="absolute top-4 right-4 z-30 pointer-events-auto bg-white/85 backdrop-blur rounded-xl border border-slate-200 shadow-md p-3 min-w-[180px]">
        <p className="text-xs font-bold tracking-wide text-slate-700 mb-2">LABEL TOGGLES</p>
        {([
          ["drones", "Drones"],
          ["stations", "Stations"],
          ["buildings", "Buildings"],
          ["survivors", "Survivors"],
          ["targets", "Targets"],
        ] as Array<[keyof ToggleState, string]>).map(([key, label]) => (
          <label key={key} className="flex items-center justify-between py-1 text-xs text-slate-700">
            <span>{label}</span>
            <input
              type="checkbox"
              className="accent-blue-600"
              checked={toggles[key]}
              onChange={() => toggleOption(key)}
            />
          </label>
        ))}
      </div>

      {hovered && (
        <div
          className="absolute z-40 pointer-events-none bg-white rounded-lg border border-slate-200 shadow-lg px-3 py-2 text-xs"
          style={{ left: mouse.x + 16, top: mouse.y + 16 }}
        >
          <p className="font-semibold text-slate-800">{hovered.type.toUpperCase()}</p>
          <p className="text-slate-600">
            {"name" in hovered.data ? hovered.data.name : hovered.data.label}
          </p>
        </div>
      )}

      {selected && (
        <div className="absolute bottom-4 left-4 z-40 bg-white/90 border border-slate-200 rounded-xl shadow-lg p-4 min-w-[260px] pointer-events-auto">
          <p className="text-sm font-bold text-slate-800 mb-1">Selected {selected.type}</p>
          <p className="text-xs text-slate-700">
            Name: {"name" in selected.data ? selected.data.name : selected.data.label}
          </p>
          <p className="text-xs text-slate-700">
            World: ({selected.data.world.x.toFixed(2)}, {selected.data.world.y.toFixed(2)})
          </p>
          {selected.type === "target" && (
            <>
              <p className="text-xs text-slate-700">Building: {selected.data.buildingName}</p>
              <p className="text-xs text-slate-700">Nearest survivor: {selected.data.survivorName}</p>
              <p className="text-xs text-slate-700">Distance: {selected.data.distance.toFixed(2)} m</p>
            </>
          )}
          {selected.type === "drone" && (
            <p className="text-xs text-slate-700">Assigned station: {selected.data.stationId}</p>
          )}
        </div>
      )}
    </div>
  );
}

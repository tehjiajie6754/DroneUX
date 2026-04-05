"use client";

import { useEffect, useRef, useState } from "react";
import { useSwarmStore, Drone, Survivor } from "@/store/useSwarmStore";

const GRID_SIZE = 100;
const CELL_SIZE = 20;

export default function MapCanvas({ focusedDroneId }: { focusedDroneId?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Viewport transform
  // Start at a zoom level of 0.35 (slightly smaller to match the tactical view)
  const [scale, setScale] = useState(focusedDroneId ? 1.5 : 0.35);
  const [offset, setOffset] = useState({ 
    x: typeof window !== 'undefined' ? window.innerWidth / 2 - (GRID_SIZE * CELL_SIZE * 0.35) / 2 : 200, 
    y: typeof window !== 'undefined' ? window.innerHeight / 2 - (GRID_SIZE * CELL_SIZE * 0.35) / 2 : 100 
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredEntity, setHoveredEntity] = useState<Drone | Survivor | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  // Game state
  const { drones, survivors, exploredCells } = useSwarmStore();

  // Draw loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    let animationFrameId: number;
    
    const draw = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      
      // Calculate active transform
      let currentOffset = offset;
      let currentScale = scale;

      // FPP Mode Logic
      if (focusedDroneId) {
        const drone = drones.find(d => d.id === focusedDroneId);
        if (drone) {
          // Center drone
          const dronePixelX = drone.x * CELL_SIZE + CELL_SIZE / 2;
          const dronePixelY = drone.y * CELL_SIZE + CELL_SIZE / 2;
          currentScale = 1.2; // Fixed zoom for FPP
          currentOffset = {
            x: canvas.width / 2 - dronePixelX * currentScale,
            y: canvas.height / 2 - dronePixelY * currentScale
          };
        }
      }

      // Apply transform
      ctx.translate(currentOffset.x, currentOffset.y);
      ctx.scale(currentScale, currentScale);
      
      // Draw grid
      ctx.strokeStyle = "rgba(100, 116, 139, 0.1)"; // slate-500 with opacity
      ctx.lineWidth = 1;
      
      ctx.beginPath();
      for (let x = 0; x <= GRID_SIZE; x++) {
        ctx.moveTo(x * CELL_SIZE, 0);
        ctx.lineTo(x * CELL_SIZE, GRID_SIZE * CELL_SIZE);
      }
      for (let y = 0; y <= GRID_SIZE; y++) {
        ctx.moveTo(0, y * CELL_SIZE);
        ctx.lineTo(GRID_SIZE * CELL_SIZE, y * CELL_SIZE);
      }
      ctx.stroke();
      
      // Draw map content (Mocked for now)

      // Predefined city layout (avoiding 4 corners: 0-5 and 95-100 ranges)
      const BUILDINGS = [
        // Top-left sector
        { x: 8, y: 8, w: 10, h: 12, c: "rgba(148, 163, 184, 0.8)" },
        { x: 22, y: 6, w: 15, h: 10, c: "rgba(100, 116, 139, 0.85)" },
        { x: 42, y: 8, w: 12, h: 15, c: "rgba(71, 85, 105, 0.9)" },
        { x: 8, y: 25, w: 20, h: 15, c: "rgba(51, 65, 85, 0.9)" },
        
        // Top-right sector
        { x: 60, y: 8, w: 18, h: 12, c: "rgba(148, 163, 184, 0.8)" },
        { x: 82, y: 10, w: 12, h: 15, c: "rgba(71, 85, 105, 0.9)" },
        { x: 58, y: 25, w: 12, h: 10, c: "rgba(100, 116, 139, 0.85)" },
        { x: 74, y: 28, w: 18, h: 18, c: "rgba(51, 65, 85, 0.9)" },
        
        // Center-left sector
        { x: 10, y: 45, w: 15, h: 18, c: "rgba(71, 85, 105, 0.9)" },
        { x: 30, y: 40, w: 12, h: 22, c: "rgba(51, 65, 85, 0.9)" },
        { x: 46, y: 35, w: 10, h: 15, c: "rgba(148, 163, 184, 0.8)" },
        
        // Center-right sector
        { x: 60, y: 42, w: 22, h: 15, c: "rgba(100, 116, 139, 0.85)" },
        { x: 86, y: 50, w: 10, h: 20, c: "rgba(148, 163, 184, 0.8)" },
        { x: 45, y: 55, w: 12, h: 12, c: "rgba(71, 85, 105, 0.9)" },
        { x: 68, y: 62, w: 15, h: 15, c: "rgba(51, 65, 85, 0.9)" },
        
        // Bottom-left sector
        { x: 8, y: 68, w: 12, h: 12, c: "rgba(148, 163, 184, 0.8)" },
        { x: 25, y: 68, w: 18, h: 10, c: "rgba(100, 116, 139, 0.85)" },
        { x: 10, y: 85, w: 20, h: 8, c: "rgba(71, 85, 105, 0.9)" },
        { x: 35, y: 82, w: 10, h: 12, c: "rgba(51, 65, 85, 0.9)" },
        
        // Bottom-right sector
        { x: 50, y: 75, w: 12, h: 18, c: "rgba(148, 163, 184, 0.8)" },
        { x: 66, y: 82, w: 18, h: 10, c: "rgba(100, 116, 139, 0.85)" },
        { x: 88, y: 75, w: 8, h: 15, c: "rgba(71, 85, 105, 0.9)" },

        // Extra scattered buildings
        { x: 33, y: 22, w: 8, h: 8, c: "rgba(148, 163, 184, 0.8)" },
        { x: 45, y: 25, w: 8, h: 6, c: "rgba(100, 116, 139, 0.85)" },
        { x: 28, y: 65, w: 6, h: 8, c: "rgba(71, 85, 105, 0.9)" },
        { x: 40, y: 70, w: 8, h: 8, c: "rgba(148, 163, 184, 0.8)" },
        { x: 80, y: 40, w: 6, h: 6, c: "rgba(100, 116, 139, 0.85)" }
      ];

      // Draw Buildings
      BUILDINGS.forEach(b => {
        ctx.fillStyle = b.c;
        ctx.fillRect(b.x * CELL_SIZE, b.y * CELL_SIZE, b.w * CELL_SIZE, b.h * CELL_SIZE);
      });
      
      // Charging Stations (4 corners)
      ctx.fillStyle = "rgba(234, 179, 8, 0.2)"; // yellow-500
      ctx.fillRect(0, 0, 5 * CELL_SIZE, 5 * CELL_SIZE); // Top left
      ctx.fillRect((GRID_SIZE - 5) * CELL_SIZE, 0, 5 * CELL_SIZE, 5 * CELL_SIZE); // Top right
      ctx.fillRect(0, (GRID_SIZE - 5) * CELL_SIZE, 5 * CELL_SIZE, 5 * CELL_SIZE); // Bottom left
      ctx.fillRect((GRID_SIZE - 5) * CELL_SIZE, (GRID_SIZE - 5) * CELL_SIZE, 5 * CELL_SIZE, 5 * CELL_SIZE); // Bottom right

      // Draw fog of war only on unexplored cells
      ctx.fillStyle = "rgba(15, 23, 42, 0.4)"; // slate-900 fog
      ctx.beginPath();
      for (let x = 0; x < GRID_SIZE; x++) {
        for (let y = 0; y < GRID_SIZE; y++) {
          if (!exploredCells.has(`${x},${y}`)) {
            ctx.rect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
          }
        }
      }
      ctx.fill();

      // Survivors
      survivors.forEach(s => {
          if (s.discovered) {
              ctx.fillStyle = "rgba(239, 68, 68, 1)"; // red-500
          } else {
              ctx.fillStyle = "rgba(148, 163, 184, 0.5)"; // slate-400
          }
          ctx.fillRect(s.x * CELL_SIZE + 2, s.y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4);
      });

      // Drones
      drones.forEach(d => {
        ctx.fillStyle = "#3b82f6"; // blue-500
        ctx.beginPath();
        ctx.arc(
            d.x * CELL_SIZE + CELL_SIZE / 2, 
            d.y * CELL_SIZE + CELL_SIZE / 2, 
            CELL_SIZE / 2 - 2, 
            0, 
            Math.PI * 2
        );
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      ctx.restore();
      animationFrameId = requestAnimationFrame(draw);
    };
    
    draw();
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [scale, offset, drones, survivors, exploredCells]);

  // Container resize handler
  useEffect(() => {
    if (!canvasRef.current) return;
    const parent = canvasRef.current.parentElement;
    if (!parent) return;

    const resizeObserver = new ResizeObserver(() => {
      if (canvasRef.current && canvasRef.current.parentElement) {
        canvasRef.current.width = canvasRef.current.parentElement.clientWidth;
        canvasRef.current.height = canvasRef.current.parentElement.clientHeight;
      }
    });

    resizeObserver.observe(parent);
    
    // Initial size
    canvasRef.current.width = parent.clientWidth;
    canvasRef.current.height = parent.clientHeight;

    return () => resizeObserver.disconnect();
  }, []);

  // Event handlers for pan/zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomSensitivity = 0.001;
    // Allow zooming out up to 0.25x 
    const newScale = Math.min(Math.max(0.25, scale - e.deltaY * zoomSensitivity), 5);
    
    // Zoom towards cursor
    if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const cursorX = e.clientX - rect.left;
        const cursorY = e.clientY - rect.top;
        
        // Calculate new offset so that cursor stays over same point
        const newOffsetX = cursorX - (cursorX - offset.x) * (newScale / scale);
        const newOffsetY = cursorY - (cursorY - offset.y) * (newScale / scale);
        
        setOffset({ x: newOffsetX, y: newOffsetY });
    }
    
    setScale(newScale);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    if (canvasRef.current) canvasRef.current.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });

    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
      return;
    }

    if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const cursorX = e.clientX - rect.left;
        const cursorY = e.clientY - rect.top;

        const worldX = (cursorX - offset.x) / scale;
        const worldY = (cursorY - offset.y) / scale;

        const gridX = Math.floor(worldX / CELL_SIZE);
        const gridY = Math.floor(worldY / CELL_SIZE);

        let found: Drone | Survivor | null = null;
        
        const drone = drones.find(d => d.x === gridX && d.y === gridY);
        if (drone) found = drone;
        else {
            const survivor = survivors.find(s => s.x === gridX && s.y === gridY && s.discovered);
            if (survivor) found = survivor;
        }
        
        setHoveredEntity(found);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    if (canvasRef.current) canvasRef.current.releasePointerCapture(e.pointerId);
  };

  return (
    <div className="w-full h-full absolute inset-0 bg-blue-50">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />
      {hoveredEntity && (
        <div 
          className="absolute z-50 bg-white shadow-lg border border-slate-200 rounded-lg p-3 text-sm pointer-events-none transform -translate-x-1/2 -translate-y-full mt-[-10px]"
          style={{ left: mousePos.x, top: mousePos.y }}
        >
          {'battery' in hoveredEntity ? (
            // Drone Tooltip
            <div>
              <p className="font-bold text-blue-600 mb-1">Drone {(hoveredEntity as Drone).id}</p>
              <p className="text-slate-600"><span className="font-medium">Battery:</span> {(hoveredEntity as Drone).battery}%</p>
              <p className="text-slate-600"><span className="font-medium">Loc:</span> {hoveredEntity.x}, {hoveredEntity.y}</p>
              <p className="text-slate-600"><span className="font-medium">Found:</span> {(hoveredEntity as Drone).survivorsFound}</p>
            </div>
          ) : (
            // Survivor Tooltip
            <div>
              <p className="font-bold text-red-600 mb-1">Survivor Found</p>
              <p className="text-slate-600"><span className="font-medium">Loc:</span> {hoveredEntity.x}, {hoveredEntity.y}</p>
              <p className="text-slate-600"><span className="font-medium">Body Temp:</span> {(hoveredEntity as Survivor).bodyTemp?.toFixed(1)}°C</p>
              <p className="text-slate-600 text-xs mt-1 text-slate-400">{(hoveredEntity as Survivor).timeFound ? new Date((hoveredEntity as Survivor).timeFound!).toLocaleTimeString() : 'Unknown'}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

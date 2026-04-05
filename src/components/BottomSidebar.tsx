"use client";

import { useSwarmStore } from "@/store/useSwarmStore";
import { Play, Square, RotateCcw, Crosshair, Map, Activity, Zap, Cpu } from "lucide-react";
import { useState } from "react";

export default function BottomSidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const { isRunning, setRunning, reset, survivors, exploredCells, drones, totalSurvivors } = useSwarmStore();

  const foundCount = survivors.filter(s => s.discovered).length;
  const coverageCount = exploredCells.size;
  const activeDrones = drones.filter(d => d.status !== 'charging').length;
  const avgBattery = drones.length > 0 ? Math.round(drones.reduce((acc, d) => acc + d.battery, 0) / drones.length) : 0;

  return (
    <div 
      className={`fixed bottom-0 left-0 w-[calc(100%-380px)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] z-40 pointer-events-auto ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
      onWheel={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* Seamless Glass Background Mask */}
      <div className="absolute inset-0 -z-10 [mask-image:linear-gradient(to_right,white_calc(100%-80px),transparent)]">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/30 backdrop-blur-xl [mask-image:linear-gradient(to_bottom,transparent,black_40px)]" />
      </div>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white/30 backdrop-blur-md px-6 border-t border-l border-r border-slate-200/40 rounded-t-lg shadow-sm text-slate-800 [text-shadow:_0_1px_2px_rgb(255_255_255)] font-bold text-xs py-1"
      >
        {isOpen ? 'Minimize Controls' : 'Show Controls'}
      </button>

      <div className="flex pl-6 pr-10 py-4 justify-between items-center w-full overflow-x-auto gap-8">
        
        <div className="flex flex-col gap-3 shrink-0 justify-center">
          {!isRunning ? (
            <button 
              onClick={() => setRunning(true)}
              className="flex w-[120px] items-center justify-center gap-1.5 bg-blue-600/90 hover:bg-blue-700/90 backdrop-blur-sm text-white px-2 py-2 rounded-lg shadow-sm font-semibold transition-colors text-[13px] whitespace-nowrap"
            >
              <Play className="w-3.5 h-3.5 fill-current shrink-0" /> Next Turn
            </button>
          ) : (
            <button 
              onClick={() => setRunning(false)}
              className="flex w-[120px] items-center justify-center gap-1.5 bg-red-600/90 hover:bg-red-700/90 backdrop-blur-sm text-white px-2 py-2 rounded-lg shadow-sm font-semibold transition-colors text-[13px] whitespace-nowrap"
            >
              <Square className="w-3.5 h-3.5 fill-current shrink-0" /> Stop
            </button>
          )}

          <button 
            onClick={reset}
            className="flex w-[120px] items-center justify-center gap-1.5 bg-white/40 backdrop-blur-md border-2 border-slate-200/40 hover:border-slate-300 hover:bg-white/60 text-slate-700 px-2 py-2 rounded-lg font-semibold transition-colors text-[13px] whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" /> Restart
          </button>
        </div>

        <div className="flex flex-1 gap-5 max-w-5xl justify-end">
          
          {/* Box 1: Survivors */}
          <div className="bg-white/30 backdrop-blur-md p-4 rounded-xl border border-slate-200/40 flex-1 min-w-[160px] shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-slate-800 [text-shadow:_0_1px_3px_rgb(255_255_255)] uppercase flex items-center gap-1.5 tracking-wider"><Crosshair className="w-4 h-4" /> Survivors</span>
              <span className="text-base font-extrabold text-slate-800">{foundCount} / {totalSurvivors}</span>
            </div>
            <div className="w-full bg-slate-200/50 rounded-full h-2 mt-auto">
              <div 
                className="bg-emerald-500/90 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${(foundCount / totalSurvivors) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Box 2: Discovery */}
          <div className="bg-white/30 backdrop-blur-md p-4 rounded-xl border border-slate-200/40 flex-1 min-w-[160px] shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-slate-800 [text-shadow:_0_1px_3px_rgb(255_255_255)] uppercase flex items-center gap-1.5 tracking-wider"><Map className="w-4 h-4" /> Map Coverage</span>
              <span className="text-base font-extrabold text-slate-800">{(coverageCount / 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-200/50 rounded-full h-2 mt-auto">
              <div 
                className="bg-blue-500/90 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${coverageCount / 100}%` }}
              ></div>
            </div>
          </div>

          {/* Box 3: Global Power */}
          <div className="bg-white/30 backdrop-blur-md p-4 rounded-xl border border-slate-200/40 flex-1 min-w-[160px] shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-slate-800 [text-shadow:_0_1px_3px_rgb(255_255_255)] uppercase flex items-center gap-1.5 tracking-wider"><Zap className="w-4 h-4" /> Average Battery</span>
              <span className="text-base font-extrabold text-slate-800">{avgBattery}%</span>
            </div>
            <div className="w-full bg-slate-200/50 rounded-full h-2 mt-auto">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${avgBattery < 30 ? 'bg-red-500/90' : avgBattery < 60 ? 'bg-amber-500/90' : 'bg-emerald-500/90'}`} 
                style={{ width: `${avgBattery}%` }}
              ></div>
            </div>
          </div>

          {/* Box 4: System Status */}
          <div className="bg-white/30 backdrop-blur-md p-4 rounded-xl border border-slate-200/40 flex-none w-[190px] shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-slate-800 [text-shadow:_0_1px_3px_rgb(255_255_255)] uppercase flex items-center gap-1.5 mb-1.5 tracking-wider"><Cpu className="w-4 h-4" /> System Array</span>
                <span className="text-base font-extrabold text-slate-800">{activeDrones} Drones Active</span>
              </div>
              <div className="h-full flex items-center pt-1.5">
                <span className={`block h-3.5 w-3.5 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-red-500'} shadow-[0_0_8px_rgba(0,0,0,0.2)] ${isRunning ? 'shadow-green-500/50' : 'shadow-red-500/50'}`}></span>
              </div>
            </div>
            <p className="text-[10px] text-slate-800 [text-shadow:_0_1px_3px_rgb(255_255_255)] font-bold tracking-widest mt-auto opacity-70">
              {isRunning ? 'SIMULATION RUNNING' : 'SYSTEM STANDBY'}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

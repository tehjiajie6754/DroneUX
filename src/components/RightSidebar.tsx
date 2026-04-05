"use client";

import { useSwarmStore, Drone } from "@/store/useSwarmStore";
import { Bot, Plane, BatteryCharging, ChevronRight, ChevronLeft, X } from "lucide-react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

export default function RightSidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const { drones, orchestratorReason, orchestratorHistory } = useSwarmStore();

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed right-0 top-1/2 -translate-y-1/2 bg-white/30 backdrop-blur-md p-2 rounded-l-md shadow-md z-40 pointer-events-auto transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isOpen ? 'translate-x-full' : 'translate-x-0'}`}
      >
        <ChevronLeft className="w-5 h-5 text-slate-800 [text-shadow:_0_1px_3px_rgb(255_255_255)]" />
      </button>

      <div className={`fixed right-0 top-0 h-full w-[380px] z-50 flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-auto ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        onWheel={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
      {/* Seamless Glass Background Mask */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-white/5 to-white/30 backdrop-blur-xl [mask-image:linear-gradient(to_right,transparent,black_40px)]" />

      {/* Top Cell: Drone Orchestrator */}
      <div className="relative shrink-0 z-10">
        {/* Soft bottom edge mask for Orchestrator background */}
        <div className="absolute inset-0 bg-white/30 backdrop-blur-xl [mask-image:linear-gradient(to_bottom,black_80%,transparent)] -z-10" />
        
        <div className="p-5 px-6 flex flex-col gap-3">
          
          {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="bg-[#eaf3f8] p-2.5 rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-[#145a80]" />
            </div>
            <div>
              <h2 className="text-[17px] font-extrabold text-[#112a46] leading-tight tracking-tight">
                DRONE ORCHESTRATOR
              </h2>
              <p className="text-[10px] font-bold text-[#0284c7] tracking-wider uppercase mt-0.5">
                Autonomous AI Command
              </p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-slate-800 [text-shadow:_0_1px_3px_rgb(255_255_255)] hover:text-slate-900 bg-white/40 hover:bg-white/70 p-1.5 rounded-md shadow-sm backdrop-blur-md transition-all mt-1">
            <ChevronRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Agentic Reasoning Box */}
        <div 
          className="bg-[#0f172a]/85 backdrop-blur-xl shadow-lg rounded-lg p-6 mt-4 min-h-[160px] flex flex-col justify-start cursor-pointer hover:bg-[#1e293b]/90 transition-colors group relative"
          onClick={() => setIsHistoryOpen(true)}
        >
          <div className="flex justify-between items-center mb-3">
            <p className="text-[#10b981] text-[12px] font-mono opacity-90">
              &gt; Global Agentic Reasoning:
            </p>
            <span className="text-[#10b981] text-[10px] uppercase tracking-wider font-bold bg-[#10b981]/15 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
              View History
            </span>
          </div>
          <p className="text-[#10b981] text-[13px] leading-relaxed font-mono">
            "{orchestratorReason}"
          </p>
        </div>
      </div>
      </div>

      {/* Divider */}
      <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-slate-300/80 to-transparent shrink-0 blur-[1px] relative z-10 -mt-2"></div>

      {/* Bottom Cells: Drones */}
      <div className="flex flex-col flex-1 overflow-y-auto pb-24 styled-scrollbar gap-4 px-5 pt-4">
        {drones.map((drone) => (
          <div key={drone.id} className="flex flex-col p-5 shrink-0 bg-white/20 backdrop-blur-sm border border-slate-200/40 rounded-xl shadow-sm">
            <DroneCard drone={drone} />
          </div>
        ))}
      </div>

      {/* History Modal */}
      {isHistoryOpen && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm pointer-events-auto" 
          onClick={() => setIsHistoryOpen(false)}
        >
          <div 
            className="bg-[#0f172a] rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden border border-slate-700 m-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-[#1e293b] shrink-0">
              <h3 className="font-bold text-[#10b981] flex items-center gap-3 font-mono text-[14px]">
                <Bot className="w-5 h-5 text-[#10b981]" />
                ORCHESTRATOR_LOGS.TXT
              </h3>
              <button 
                onClick={() => setIsHistoryOpen(false)} 
                className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-md hover:bg-slate-700 pointer-events-auto"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-2 styled-scrollbar bg-[#0f172a]">
              {[...orchestratorHistory].reverse().map((item, idx) => (
                <div key={idx} className="flex gap-4 group">
                  <div className="flex flex-col items-center">
                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${idx === 0 ? 'bg-[#10b981] ring-4 ring-[#10b981]/20' : 'bg-slate-600'}`}></div>
                    {idx !== orchestratorHistory.length - 1 && <div className="w-px h-full bg-slate-700 mt-2 min-h-[30px]"></div>}
                  </div>
                  <div className="flex-1 pb-6">
                    <p className="text-slate-500 text-[11px] font-mono mb-1.5 tracking-wider">
                      {new Date(item.timestamp).toLocaleTimeString()} - SYSTEM
                    </p>
                    <p className={`text-[13px] leading-relaxed font-mono ${idx === 0 ? 'text-[#10b981] font-medium' : 'text-slate-400'}`}>
                      "{item.reason}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
    </>
  );
}

function CircularProgress({ percentage, colorClass }: { percentage: number, colorClass: string }) {
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  let strokeColor = "#10b981"; // emerald-500
  if (colorClass.includes("yellow") || colorClass.includes("orange")) strokeColor = "#f59e0b"; // amber-500
  if (colorClass.includes("red")) strokeColor = "#ef4444"; // red-500

  return (
    <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
      <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 40 40">
        {/* Background circle */}
        <circle 
          cx="20" cy="20" r={radius} 
          className="stroke-[#e2e8f0]" 
          strokeWidth="3.5" 
          fill="none" 
        />
        {/* Progress circle */}
        <circle 
          cx="20" cy="20" r={radius} 
          stroke={strokeColor}
          strokeWidth="3.5" 
          fill="none" 
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-in-out"
        />
      </svg>
      <div className="relative z-10 flex items-center justify-center">
        {percentage < 20 ? (
          <BatteryCharging className={`w-5 h-5 ${colorClass}`} />
        ) : (
          <Plane className={`w-5 h-5 ${colorClass}`} />
        )}
      </div>
    </div>
  );
}

function DroneCard({ drone }: { drone: Drone }) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const isLowBattery = drone.battery < 20;
  const isMedBattery = drone.battery < 60 && drone.battery >= 20;
  
  const textColor = isLowBattery ? "text-[#ef4444]" : isMedBattery ? "text-[#f59e0b]" : "text-[#10b981]";
  
  return (
    <div className="flex flex-col h-full justify-center gap-4">
      <div className="flex items-center justify-between">
        
        <div className="flex items-center gap-4">
          <CircularProgress percentage={drone.battery} colorClass={textColor} />
          
          <div className="flex flex-col">
            <h3 className="font-bold text-[#112a46] text-[15px]">Drone {(drone.id.includes('-') ? drone.id : drone.id).replace('-', ' ')}</h3>
            <p className="text-[12px] font-medium text-slate-800 [text-shadow:_0_1px_3px_rgb(255_255_255)] mt-0.5">
              Pos: {drone.x.toFixed(2)}, {drone.y.toFixed(2)} | Survivors: {drone.survivorsFound}
            </p>
          </div>
        </div>

        <div className={`font-bold text-[13px] ${textColor}`}>
          {drone.battery}%
        </div>
      </div>

      <div 
        className="bg-white/30 backdrop-blur-md rounded-md p-4 text-[13px] leading-relaxed font-medium text-slate-800 [text-shadow:_0_1px_3px_rgb(255_255_255)] italic border border-slate-200/40 min-h-[90px] flex flex-col justify-start relative group cursor-pointer hover:bg-white/50 transition-colors"
        onClick={() => setIsHistoryOpen(true)}
      >
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[10px] uppercase font-bold bg-white/50 backdrop-blur-md text-slate-800 [text-shadow:_0_1px_3px_rgb(255_255_255)] px-1.5 py-0.5 rounded shadow-sm">View Logs</span>
        </div>
        <span className="mt-1">"{drone.reason}"</span>
      </div>

      {/* Drone History Modal */}
      {isHistoryOpen && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm pointer-events-auto cursor-default" 
          onClick={(e) => { e.stopPropagation(); setIsHistoryOpen(false); }}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden border border-slate-200 m-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="font-bold text-[#112a46] flex items-center gap-3 font-mono text-[14px]">
                <Plane className="w-5 h-5 text-[#0284c7]" />
                DRONE_{drone.id.replace('-', '_').toUpperCase()}_LOGS.TXT
              </h3>
              <button 
                onClick={() => setIsHistoryOpen(false)} 
                className="text-slate-400 hover:text-slate-700 transition-colors p-1.5 rounded-md hover:bg-slate-200 pointer-events-auto"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-2 styled-scrollbar bg-white">
              {[...drone.history].reverse().map((item, idx) => (
                <div key={idx} className="flex gap-4 group">
                  <div className="flex flex-col items-center">
                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${idx === 0 ? 'bg-[#0284c7] ring-4 ring-[#0284c7]/20' : 'bg-slate-300'}`}></div>
                    {idx !== drone.history.length - 1 && <div className="w-px h-full bg-slate-200 mt-2 min-h-[30px]"></div>}
                  </div>
                  <div className="flex-1 pb-6">
                    <p className="text-slate-400 text-[11px] font-mono mb-1.5 tracking-wider">
                      {new Date(item.timestamp).toLocaleTimeString()} - {drone.id}
                    </p>
                    <p className={`text-[13px] leading-relaxed italic ${idx === 0 ? 'text-slate-700 font-medium' : 'text-slate-500'}`}>
                      "{item.reason}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

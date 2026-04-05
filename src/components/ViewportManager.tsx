"use client";

import dynamic from 'next/dynamic';
import { useSwarmStore } from '@/store/useSwarmStore';
import { LayoutGrid, Maximize } from 'lucide-react';

const MapCanvas = dynamic(() => import('@/components/MapCanvas'), { ssr: false });

export default function ViewportManager() {
    const { viewMode, setViewMode, drones } = useSwarmStore();

    return (
        <>
            {/* Viewport content */}
            <div className={`w-full h-full absolute inset-0 ${viewMode === 'FPP' ? 'pr-[380px] pb-[160px]' : ''}`}>
                {viewMode === 'TPP' ? (
                    <MapCanvas />
                ) : (
                    // In FPP mode, split into quadrants, but restrict the area to avoid sidebars covering it
                    // The wrapper already has pr-[380px] pb-[160px] to make space for the UI
                    <div className="grid grid-cols-2 grid-rows-2 w-full h-full bg-slate-900 overflow-hidden relative">
                        {/* 4 Quadrants */}
                        {drones.slice(0, 4).map((drone, idx) => (
                            <div key={drone.id} className="relative w-full h-full min-h-0 border-[0.5px] border-slate-700/50 pointer-events-auto shadow-inner">
                                <div className="absolute inset-0">
                                    <MapCanvas focusedDroneId={drone.id} />
                                </div>
                                <div className="absolute bottom-4 left-4 z-10 bg-slate-900/60 backdrop-blur border border-slate-700/50 rounded-lg px-3 py-1.5 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
                                    <span className="text-[11px] font-mono text-blue-400 font-bold uppercase tracking-wider">{drone.id} CAM</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* View Mode Toggle Controls */}
            <div className="fixed top-6 right-[400px] z-50 pointer-events-auto flex items-center gap-1 bg-white/30 backdrop-blur-md rounded-lg p-1 border border-slate-200/40 shadow-sm">
                <button
                    onClick={() => setViewMode('TPP')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] font-bold tracking-wide transition-colors ${
                        viewMode === 'TPP' 
                            ? 'bg-blue-600 text-white shadow-sm' 
                            : 'text-slate-600 hover:bg-white/40'
                    }`}
                >
                    <Maximize className="w-3.5 h-3.5" />
                    TPP VIEW
                </button>
                <button
                    onClick={() => setViewMode('FPP')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] font-bold tracking-wide transition-colors ${
                        viewMode === 'FPP' 
                            ? 'bg-blue-600 text-white shadow-sm' 
                            : 'text-slate-600 hover:bg-white/40'
                    }`}
                >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    SPLIT FPP
                </button>
            </div>
        </>
    );
}
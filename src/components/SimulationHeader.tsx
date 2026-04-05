"use client";

import { useSwarmStore } from "@/store/useSwarmStore";
import { Save, Layers, MapPin, Map, Calendar, Database, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SimulationHeader() {
  const router = useRouter();
  const { exploredCells, survivors, totalSurvivors } = useSwarmStore();
  const [deploymentInfo, setDeploymentInfo] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem("current_deployment");
    if (data) {
      setDeploymentInfo(JSON.parse(data));
    }
  }, []);

  const handleRecord = async () => {
    const timeUsed = deploymentInfo ? Math.round((new Date().getTime() - deploymentInfo.startTime) / 1000) : 0;
    const survivorsFound = survivors.filter((s) => s.discovered).length;
    const coverage = ((exploredCells.size / (100 * 100)) * 100).toFixed(1); // Grid is 100x100
    
    const record = {
      id: crypto.randomUUID(),
      location: deploymentInfo?.locationName || "Unknown Sector",
      address: deploymentInfo?.address || "Unknown Coordinates",
      date: deploymentInfo?.displayDate || new Date().toLocaleString(),
      survivorsFound,
      totalSurvivors,
      coverage: parseFloat(coverage),
      timeUsed, // in seconds
    };

    try {
      await fetch('/api/deployments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });
    } catch(err) {
      console.error('Failed to write to offline database');
    }

    router.push("/database");
  };

  return (
    <header className="p-6 pointer-events-auto shrink-0 flex items-start justify-between relative z-50">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 drop-shadow-sm flex items-center gap-2">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`text-blue-600 transition-all cursor-pointer shadow-sm relative group p-1.5 rounded-lg border ${isOpen ? 'bg-blue-600 text-white border-blue-600 shadow-blue-600/30' : 'bg-blue-100/80 hover:bg-blue-200 border-blue-200'}`}
            title="Toggle Deployment Info"
          >
            <Layers className="w-6 h-6" />
          </button>
          God's Eye
        </h1>
        <p className="text-sm font-medium text-slate-500 mt-1 pl-12 uppercase tracking-widest">Swarm Orchestration</p>
      </div>

      <div 
        className={`absolute top-20 left-6 bg-white/95 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-2xl w-80 overflow-hidden origin-top-left transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? 'opacity-100 scale-100 translate-y-0 translate-x-0 visible' : 'opacity-0 scale-0 -translate-y-12 -translate-x-4 invisible'
        }`}
      >
        <div className="bg-slate-50/80 border-b border-slate-100 px-5 py-4 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-600" />
              Deployment Focus
            </h3>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-1 bg-slate-200/50 rounded-full">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="p-5 space-y-4">
            {deploymentInfo ? (
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1.5 ml-1">Location Code Name</p>
                  <p className="font-semibold text-slate-800 flex items-center gap-2.5 text-sm bg-slate-50 p-2.5 rounded-xl border border-slate-100 shadow-sm">
                    <Map className="w-4 h-4 text-blue-500" />
                    {deploymentInfo.locationName}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1.5 ml-1">Target Address</p>
                  <p className="font-semibold text-slate-800 flex items-start gap-2.5 text-sm bg-slate-50 p-2.5 rounded-xl border border-slate-100 shadow-sm">
                    <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="line-clamp-2 leading-relaxed">{deploymentInfo.address}</span>
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1.5 ml-1">System Initialization</p>
                  <p className="font-semibold text-slate-800 flex items-center gap-2.5 text-sm bg-slate-50 p-2.5 rounded-xl border border-slate-100 shadow-sm">
                    <Calendar className="w-4 h-4 text-orange-500" />
                    {deploymentInfo.displayDate}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic p-4 text-center bg-slate-50 rounded-xl border border-slate-100">No deployment setup found.</p>
            )}

            <div className="pt-3 border-t border-slate-100 mt-2">
              <button 
                onClick={handleRecord}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-bold uppercase tracking-wider text-sm transition-all shadow-lg shadow-blue-600/20 group"
              >
                <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Record in databases
              </button>
            </div>
          </div>
        </div>
    </header>
  );
}

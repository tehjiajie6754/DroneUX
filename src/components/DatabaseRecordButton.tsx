"use client";

import { useSwarmStore } from "@/store/useSwarmStore";
import { Save, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DatabaseRecordButton() {
  const router = useRouter();
  const { exploredCells, survivors, totalSurvivors } = useSwarmStore();
  const [deploymentInfo, setDeploymentInfo] = useState<any>(null);

  useEffect(() => {
    const data = localStorage.getItem("current_deployment");
    if (data) {
      setDeploymentInfo(JSON.parse(data));
    }
  }, []);

  const handleRecord = () => {
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

    const historyData = localStorage.getItem("deployments_history");
    const history = historyData ? JSON.parse(historyData) : [];
    history.push(record);
    localStorage.setItem("deployments_history", JSON.stringify(history));

    router.push("/database");
  };

  return (
    <div className="flex items-center gap-3">
      {deploymentInfo && (
        <div className="px-4 py-2 bg-blue-100/80 backdrop-blur border border-blue-200/50 rounded-xl text-blue-800 text-sm font-bold flex flex-col shadow-sm">
          <span className="text-[10px] text-blue-600/80 uppercase tracking-widest">Active Deployment</span>
          {deploymentInfo.locationName}
        </div>
      )}
      <button 
        onClick={handleRecord}
        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold uppercase tracking-wider text-sm transition-all shadow-md shadow-emerald-600/20"
      >
        <Save className="w-4 h-4" />
        Record to Database
      </button>
    </div>
  );
}
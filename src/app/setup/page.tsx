"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, PlaneTakeoff, Target, Clock } from "lucide-react";
import HomeHeroCanvas from "@/components/HomeHeroCanvas";

export default function MissionSetup() {
  const router = useRouter();
  const [locationName, setLocationName] = useState("");
  const [address, setAddress] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    // Auto-update time every second
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLaunch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationName || !address) return;

    localStorage.setItem(
      "current_deployment",
      JSON.stringify({
        locationName,
        address,
        displayDate: currentTime,
        startTime: Date.now(),
      })
    );
    router.push("/simulation");
  };

  return (
    <>
      <HomeHeroCanvas />
      
      <main className="text-slate-800 font-[family-name:var(--font-geist-sans)] relative w-full min-h-screen overflow-x-clip flex items-center justify-center py-12 px-6">
        
        {/* Edge Glow Orbs for ambient framing */}
        <div className="absolute top-0 left-0 w-[50vw] h-[50vw] -translate-x-1/3 -translate-y-1/3 bg-blue-300/30 blur-[130px] rounded-full pointer-events-none z-0"></div>
        <div className="absolute bottom-0 right-0 w-[50vw] h-[50vw] translate-x-1/4 translate-y-1/4 bg-indigo-300/20 blur-[130px] rounded-full pointer-events-none z-0"></div>

        <div className="relative z-10 w-full max-w-[480px] bg-white/60 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="bg-blue-100/80 w-16 h-16 rounded-full flex items-center justify-center border border-blue-200/50 mb-6 text-blue-600 shadow-sm">
              <PlaneTakeoff className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-800 mb-2 uppercase">
              Mission Setup
            </h1>
            <p className="text-xs text-blue-500 tracking-[0.15em] font-bold uppercase">
              Initialize Deployment Parameters
            </p>
          </div>

          <form onSubmit={handleLaunch} className="space-y-6">
            
            {/* Location Name */}
            <div className="space-y-2 relative">
              <label htmlFor="locationName" className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-blue-600 mb-2">
                <Target className="w-3 h-3" />
                Location Name
              </label>
              <input
                id="locationName"
                type="text"
                required
                placeholder="e.g. Jarkarta, Indonesia"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full bg-white/50 border border-slate-300/60 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium shadow-sm backdrop-blur-md"
              />
            </div>

            {/* Location Address/Coordinates */}
            <div className="space-y-2 relative">
              <label htmlFor="address" className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-blue-600 mb-2">
                <MapPin className="w-3 h-3" />
                Location Address
              </label>
              <input
                id="address"
                type="text"
                required
                placeholder="e.g. 123 Main St, City, Country"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-white/50 border border-slate-300/60 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium shadow-sm backdrop-blur-md"
              />
            </div>

            {/* Auto Capture Time */}
            <div className="space-y-2 relative">
              <label className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-blue-600 mb-2">
                <Clock className="w-3 h-3" />
                Initialization Timestamp
              </label>
              <div className="w-full bg-slate-100/50 border border-slate-200/60 rounded-xl px-4 py-3 text-slate-600 flex items-center justify-between font-mono text-sm shadow-inner backdrop-blur-md">
                <span>{currentTime || "Synchronizing..."}</span>
                <span className="flex items-center gap-2 text-blue-600 text-xs tracking-widest uppercase font-bold">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                  Live
                </span>
              </div>
            </div>

            <div className="pt-6 flex gap-4">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="w-1/3 py-4 px-4 rounded-xl font-bold tracking-wider text-slate-600 bg-white/50 hover:bg-slate-100 border border-slate-200/80 transition-colors uppercase text-xs sm:text-sm text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-2/3 py-4 px-6 rounded-xl font-bold tracking-wider text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-3 uppercase text-xs sm:text-sm group"
              >
                Launch Sequence
                <PlaneTakeoff className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </div>
            
          </form>
        </div>
      </main>
    </>
  );
}

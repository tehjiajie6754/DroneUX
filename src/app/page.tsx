import Link from "next/link";
import HomeHeroCanvas from "@/components/HomeHeroCanvas";
import { ArrowRight, Database, Navigation, Cpu, Network, Activity } from "lucide-react";

export default function Home() {
  return (
    <>
      {/* Interactive Background Canvas */}
      <HomeHeroCanvas />
      
      <main className="text-slate-800 selection:bg-blue-500/30 font-[family-name:var(--font-geist-sans)] relative w-full overflow-x-clip">
        {/* Hero Section */}
      <section className="relative h-screen w-full flex flex-col items-center justify-center px-6 snap-start">
        {/* Edge Glow Orbs for ambient framing (Corners, keeping center clean) */}
        <div className="absolute top-0 left-0 w-[50vw] h-[50vw] -translate-x-1/3 -translate-y-1/3 bg-blue-300/30 blur-[130px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-[60vw] h-[60vw] translate-x-1/4 translate-y-1/4 bg-indigo-300/20 blur-[130px] rounded-full pointer-events-none"></div>

        <div className="z-10 flex flex-col items-center max-w-4xl text-center space-y-6 -translate-y-6 md:-translate-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 border border-slate-200/80 backdrop-blur-md text-sm font-medium text-slate-600 mb-2 tracking-wider uppercase shadow-sm">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            SWARM INTELLIGENCE PROTOCOL
          </div>
          
          <h1 className="text-7xl md:text-[9rem] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-blue-900 via-slate-800 to-slate-900 drop-shadow-xl font-sans relative pr-8 pb-8" style={{ lineHeight: 1.1 }}>
            {/* Tech Corner Accents */}
            <div className="absolute -top-4 -left-8 w-6 h-6 border-t-2 border-l-2 border-blue-400/40 rounded-tl-lg"></div>
            <div className="absolute -bottom-4 -right-8 w-6 h-6 border-b-2 border-r-2 border-blue-400/40 rounded-br-lg"></div>
            
            God's Eye
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-600 font-light tracking-wide max-w-2xl text-balance mt-6 bg-white/50 px-6 py-3 rounded-2xl border border-white/60 shadow-sm backdrop-blur-md">
            Autonomous Decentralized Rescue & Orchestration System
          </p>
          
          <div className="mt-8 flex items-center justify-center opacity-90">
            <span className="text-slate-500 font-mono tracking-widest text-sm uppercase flex items-center gap-3">
              <span className="w-8 h-[1px] bg-slate-300"></span>
              Created by <strong className="text-slate-800 font-semibold">T-Junction Team</strong>
              <span className="w-8 h-[1px] bg-slate-300"></span>
            </span>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-80">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-full border border-slate-300/60 bg-white/40 shadow-sm backdrop-blur-md animate-bounce">
            <ArrowRight className="w-4 h-4 text-blue-500 rotate-90" />
          </div>
          <span className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-500">Initialize</span>
        </div>
      </section>

      {/* Modules Section */}
      <section className="relative min-h-screen w-full py-32 px-6 lg:px-12 flex flex-col justify-center z-10 snap-start">
        {/* Ambient edge glows for connection (Top-Right & Bottom-Left) */}
        <div className="absolute top-0 right-0 w-[50vw] h-[50vw] translate-x-1/3 -translate-y-1/4 bg-blue-300/30 blur-[130px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] -translate-x-1/3 translate-y-1/4 bg-indigo-300/20 blur-[130px] rounded-full pointer-events-none"></div>

        <div className="w-full max-w-7xl mx-auto relative z-10">
          <div className="mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-800 mb-4">
              Core Modules
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl">
              Select an operational interface to begin your simulation or review intelligence logs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
          
          {/* Card 1: 3D Simulation */}
          <Link href="/setup" className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white/60 backdrop-blur-xl aspect-[4/3] flex flex-col justify-end p-8 transition-all duration-700 hover:border-blue-300 hover:shadow-[0_10px_40px_rgba(59,130,246,0.12)] hover:bg-white/80">
            <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
              {/* Fallback abstract background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-slate-50/90 mix-blend-overlay"></div>
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1508614589041-895b88991e3e?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat opacity-30 group-hover:opacity-60 transition-opacity duration-700 mix-blend-multiply"></div>
            </div>
            
            <div className="relative z-10 transform transition-transform duration-500 group-hover:-translate-y-2">
              <div className="bg-blue-100/80 w-14 h-14 rounded-2xl flex items-center justify-center backdrop-blur-md border border-blue-200/50 mb-6 text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-500 shadow-sm">
                <Navigation className="w-7 h-7" />
              </div>
              <h3 className="text-3xl font-bold text-slate-800 mb-3 tracking-tight">New Drone Deployment</h3>
              <p className="text-slate-700 mb-6 leading-relaxed font-medium">
                Enter deployment locations, configure swarm parameters, and immediately map uncharted terrains.
              </p>
              
              <div className="inline-flex items-center gap-2 text-sm font-bold tracking-wider uppercase text-blue-600 group-hover:text-blue-500 transition-colors">
                Launch System <ArrowRight className="w-4 h-4 transform transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </div>
          </Link>

          {/* Card 2: Historical Databases */}
          <Link href="/database" className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white/60 backdrop-blur-xl aspect-[4/3] flex flex-col justify-end p-8 transition-all duration-700 hover:border-emerald-300 hover:shadow-[0_10px_40px_rgba(16,185,129,0.12)] hover:bg-white/80">
            <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-slate-50/90 mix-blend-overlay"></div>
              <div className="absolute inset-0 bg-[url('https://www.lineofdeparture.army.mil/portals/144/Images/Journals/Aviation-Digest/Data-Driven/3.png')] bg-cover bg-center bg-no-repeat opacity-30 group-hover:opacity-60 transition-opacity duration-700 mix-blend-multiply"></div>
            </div>
            
            <div className="relative z-10 transform transition-transform duration-500 group-hover:-translate-y-2">
              <div className="bg-emerald-100/80 w-14 h-14 rounded-2xl flex items-center justify-center backdrop-blur-md border border-emerald-200/50 mb-6 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-500 shadow-sm">
                <Database className="w-7 h-7" />
              </div>
              <h3 className="text-3xl font-bold text-slate-800 mb-3 tracking-tight">Historical Databases</h3>
              <p className="text-slate-700 mb-6 leading-relaxed font-medium">
                Access decentralized logs, post-mission intel, and telemetry archives from previous swarm deployments.
              </p>
              
              <div className="inline-flex items-center gap-2 text-sm font-bold tracking-wider uppercase text-emerald-600 group-hover:text-emerald-500 transition-colors">
                Open Database <ArrowRight className="w-4 h-4 transform transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </div>
          </Link>

          </div>
        </div>
      </section>
      </main>
    </>
  );
}

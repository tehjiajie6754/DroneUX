import Link from "next/link";
import HomeHeroCanvas from "@/components/HomeHeroCanvas";
import { ArrowRight, Database, Navigation, Cpu, Network, Activity } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen text-slate-800 selection:bg-blue-500/30 font-[family-name:var(--font-geist-sans)] relative scroll-smooth overflow-x-hidden">
      {/* Interactive Background Canvas */}
      <HomeHeroCanvas />

      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center px-6 snap-start">
        <div className="z-10 flex flex-col items-center max-w-4xl text-center space-y-6 -translate-y-6 md:-translate-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 border border-slate-200/80 backdrop-blur-md text-sm font-medium text-slate-600 mb-2 tracking-wider uppercase shadow-sm">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            SWARM INTELLIGENCE PROTOCOL
          </div>
          
          <h1 className="text-7xl md:text-[9rem] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-slate-600 via-slate-800 to-black drop-shadow-xl font-sans" style={{ lineHeight: 1.1 }}>
            God's Eye
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-600 font-light tracking-wide max-w-2xl text-balance mt-4">
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
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-70 animate-bounce">
          <span className="text-xs uppercase tracking-widest text-slate-500 font-bold">Discover</span>
          <div className="w-px h-12 bg-gradient-to-b from-slate-400 to-transparent"></div>
        </div>
      </section>

      {/* Modules Section */}
      <section className="relative min-h-screen py-32 px-6 lg:px-12 flex flex-col justify-center max-w-7xl mx-auto z-10 snap-start">
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
          <Link href="/simulation" className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white/60 backdrop-blur-xl aspect-[4/3] flex flex-col justify-end p-8 transition-all duration-700 hover:border-blue-300 hover:shadow-[0_10px_40px_rgba(59,130,246,0.12)] hover:bg-white/80">
            <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
              {/* Fallback abstract background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-slate-50/90 mix-blend-overlay"></div>
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1508614589041-895b88991e3e?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat opacity-30 group-hover:opacity-60 transition-opacity duration-700 mix-blend-multiply"></div>
            </div>
            
            <div className="relative z-10 transform transition-transform duration-500 group-hover:-translate-y-2">
              <div className="bg-blue-100/80 w-14 h-14 rounded-2xl flex items-center justify-center backdrop-blur-md border border-blue-200/50 mb-6 text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-500 shadow-sm">
                <Navigation className="w-7 h-7" />
              </div>
              <h3 className="text-3xl font-bold text-slate-800 mb-3 tracking-tight">3D Environment Simulation</h3>
              <p className="text-slate-700 mb-6 leading-relaxed font-medium">
                Monitor autonomous drone swarms, track survivors, and oversee real-time map coverage.
              </p>
              
              <div className="inline-flex items-center gap-2 text-sm font-bold tracking-wider uppercase text-blue-600 group-hover:text-blue-500 transition-colors">
                Launch Interface <ArrowRight className="w-4 h-4 transform transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </div>
          </Link>

          {/* Card 2: Historical Databases */}
          <Link href="#" className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white/60 backdrop-blur-xl aspect-[4/3] flex flex-col justify-end p-8 transition-all duration-700 hover:border-emerald-300 hover:shadow-[0_10px_40px_rgba(16,185,129,0.12)] hover:bg-white/80">
            <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-slate-50/90 mix-blend-overlay"></div>
              <div className="absolute inset-0 bg-[url('https://plus.unsplash.com/premium_photo-1661877737564-3e6f5daee6b9?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat opacity-20 group-hover:opacity-40 transition-opacity duration-700 mix-blend-multiply"></div>
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
                View Records (Coming Soon) <ArrowRight className="w-4 h-4 transform transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </div>
          </Link>

        </div>
      </section>

      {/* Operational Capabilities */}
      <section className="relative py-24 px-6 lg:px-12 flex flex-col justify-center max-w-7xl mx-auto z-10">
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold tracking-widest text-blue-600 uppercase mb-3">Architecture</h2>
          <h3 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-800">
            System Capabilities
          </h3>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Cap 1 */}
          <div className="p-8 rounded-3xl bg-white/40 border border-slate-200/60 backdrop-blur-sm hover:bg-white/80 transition-colors hover:shadow-sm">
            <Cpu className="w-8 h-8 text-slate-800 mb-5" />
            <h4 className="text-xl font-bold text-slate-800 mb-2">Distributed Edge AI</h4>
            <p className="text-slate-600 leading-relaxed font-medium">
              Every unit executes local pathfinding and vision models, ensuring mission continuity even without a central server connection.
            </p>
          </div>
          {/* Cap 2 */}
          <div className="p-8 rounded-3xl bg-white/40 border border-slate-200/60 backdrop-blur-sm hover:bg-white/80 transition-colors hover:shadow-sm">
            <Network className="w-8 h-8 text-blue-600 mb-5" />
            <h4 className="text-xl font-bold text-slate-800 mb-2">Ad-hoc Mesh Routing</h4>
            <p className="text-slate-600 leading-relaxed font-medium">
              Dynamic peer-to-peer network topology self-heals when drones enter or leave the operation perimeter.
            </p>
          </div>
          {/* Cap 3 */}
          <div className="p-8 rounded-3xl bg-white/40 border border-slate-200/60 backdrop-blur-sm hover:bg-white/80 transition-colors hover:shadow-sm">
            <Activity className="w-8 h-8 text-emerald-600 mb-5" />
            <h4 className="text-xl font-bold text-slate-800 mb-2">Biometric Telemetry</h4>
            <p className="text-slate-600 leading-relaxed font-medium">
              Multi-spectral analysis instantly isolates heat signatures and movement, flagging potential survivors in real-time.
            </p>
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="relative border-t border-slate-200/60 bg-white/30 backdrop-blur-md z-10 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 font-medium text-sm">
            &copy; 2026 T-Junction Team. All systems operational.
          </p>
          <div className="flex items-center gap-8 text-sm font-bold text-slate-400">
            <span className="hover:text-blue-600 cursor-pointer transition-colors">SYSTEM STATUS</span>
            <span className="hover:text-blue-600 cursor-pointer transition-colors">API DOCS</span>
            <span className="text-slate-800 hover:text-blue-600 cursor-pointer transition-colors">SECURE LOGIN</span>
          </div>
        </div>
      </footer>

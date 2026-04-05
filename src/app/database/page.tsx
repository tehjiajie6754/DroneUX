"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Database, MapPin, Clock, Search, ShieldAlert, Thermometer, ChevronRight, Activity, Percent, Crosshair, Map, RefreshCw, Trash2, LineChart as LineChartIcon, ListFilter } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, BarChart, Bar, Legend } from 'recharts';

interface DeploymentRecord {
  id: string;
  location: string;
  address: string;
  date: string;
  survivorsFound: number;
  totalSurvivors: number;
  coverage: number;
  timeUsed: number;
}

// Some professional-looking dummy history data
const dummyData: DeploymentRecord[] = [
  {
    id: "OP-SGP-T001",
    location: "Jurong Port Chemical Spill",
    address: "Jurong Island Industrial Estate",
    date: "4/6/2026, 06:15:00 AM",
    survivorsFound: 11,
    totalSurvivors: 11,
    coverage: 99.9,
    timeUsed: 890, // 14.8m
  },
  {
    id: "OP-IDN-S312",
    location: "Sunda Strait Tsunami Zone",
    address: "Banten Coastal Region · -6.11°S, 105.88°E",
    date: "4/5/2026, 08:30:00 AM",
    survivorsFound: 24,
    totalSurvivors: 24,
    coverage: 98.7,
    timeUsed: 1120, // 18m 40s
  },
  {
    id: "OP-THA-B114",
    location: "Bangkok Urban Flooding",
    address: "Chao Phraya River Basin",
    date: "4/5/2026, 02:45:00 AM",
    survivorsFound: 41,
    totalSurvivors: 41,
    coverage: 97.5,
    timeUsed: 1205, // 20m
  },
  {
    id: "OP-PHL-J891",
    location: "Luzon Earthquake Epicenter",
    address: "Cordillera Central · 17.02°N, 120.94°E",
    date: "4/4/2026, 02:15:00 PM",
    survivorsFound: 18,
    totalSurvivors: 19,
    coverage: 96.5,
    timeUsed: 1345, // 22m 25s
  },
  {
    id: "OP-KHM-A772",
    location: "Siem Reap Flash Flood",
    address: "Tonle Sap Lake Periphery",
    date: "4/3/2026, 09:20:00 PM",
    survivorsFound: 28,
    totalSurvivors: 29,
    coverage: 93.0,
    timeUsed: 1420, // 23m
  },
  {
    id: "OP-VNM-M442",
    location: "Mekong Delta Floodlands",
    address: "Can Tho Province Sector D",
    date: "4/3/2026, 05:40:00 AM",
    survivorsFound: 32,
    totalSurvivors: 32,
    coverage: 91.8,
    timeUsed: 1580, // 26m 20s
  },
  {
    id: "OP-IDN-M201",
    location: "Merapi Volcanic Ash Zone",
    address: "Central Java · -7.54°S, 110.44°E",
    date: "4/2/2026, 04:10:00 PM",
    survivorsFound: 14,
    totalSurvivors: 16,
    coverage: 86.4,
    timeUsed: 1800, // 30m
  },
  {
    id: "OP-MYS-K992",
    location: "Sabah Landslide Area",
    address: "Mount Kinabalu Foothills · 6.07°N, 116.55°E",
    date: "4/2/2026, 09:12:00 AM",
    survivorsFound: 6,
    totalSurvivors: 8,
    coverage: 83.2,
    timeUsed: 1940, // 32m 20s
  },
  {
    id: "OP-LAO-P505",
    location: "Phongsali Deforestation Slide",
    address: "Northern Highlands Sector 3",
    date: "4/1/2026, 11:30:00 AM",
    survivorsFound: 10,
    totalSurvivors: 12,
    coverage: 78.5,
    timeUsed: 2300, // 38m
  },
  {
    id: "OP-49A-X920",
    location: "Java Sea Maritime Search",
    address: "Jakarta Outer Bay · -5.82°S, 106.66°E",
    date: "4/1/2026, 03:14:00 AM",
    survivorsFound: 4,
    totalSurvivors: 6,
    coverage: 75.1,
    timeUsed: 2650, // 44m 10s
  },
  {
    id: "OP-MMR-Y331",
    location: "Yangon Cyclone Impact Zone",
    address: "Irrawaddy Delta Region",
    date: "3/31/2026, 07:05:00 AM",
    survivorsFound: 19,
    totalSurvivors: 25,
    coverage: 66.8,
    timeUsed: 2750, // 45m
  },
  {
    id: "OP-THA-P882",
    location: "Phuket Coastal Storm Surge",
    address: "Andaman Sea Coastline",
    date: "3/29/2026, 05:22:00 PM",
    survivorsFound: 15,
    totalSurvivors: 22,
    coverage: 58.4,
    timeUsed: 2900, // 48m
  },
  {
    id: "OP-BRN-B001",
    location: "Belait River Basin Flood",
    address: "Kuala Belait District",
    date: "3/27/2026, 08:15:00 AM",
    survivorsFound: 8,
    totalSurvivors: 14,
    coverage: 52.0,
    timeUsed: 3200, // 53m
  },
  {
    id: "OP-IDN-S999",
    location: "Sumatra Earthquake Ruins",
    address: "Padang Urban Center",
    date: "3/25/2026, 02:30:00 PM",
    survivorsFound: 12,
    totalSurvivors: 20,
    coverage: 45.5,
    timeUsed: 3600, // 60m
  }
];

export default function DatabasePage() {
  const [records, setRecords] = useState<DeploymentRecord[]>(dummyData);
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<'logs' | 'analytics'>('logs');

  const fetchDeployments = async () => {
    try {
      // First fetch the db rows
      const res = await fetch('/api/deployments');
      const data: DeploymentRecord[] = await res.json();
      
      // Merge API Data + Dummy Data
      const combined = [...data, ...dummyData];
      
      // Simple dedupe by ID
      const uniqueRecords = combined.filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i);
      setRecords(uniqueRecords);
    } catch(err) {
      console.error(err);
      setRecords([...dummyData]);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this mission log from the SQL database?")) return;

    try {
      const res = await fetch(`/api/deployments?id=${id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        // Update local UI immediately without requerying to make it snappy
        setRecords(prev => prev.filter(r => r.id !== id));
        
        // As a fallback, check localStorage too just in case it was a locally migrated un-deleted row
        const historyData = localStorage.getItem("deployments_history");
        if (historyData) {
            const parsedLocal: DeploymentRecord[] = JSON.parse(historyData);
            const newLocal = parsedLocal.filter(r => r.id !== id);
            localStorage.setItem("deployments_history", JSON.stringify(newLocal));
        }
      } else {
        alert("Failed to delete the record from SQL Database.");
      }
    } catch(err) {
      console.error(err);
      alert("Error occurred while deleting record.");
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchDeployments();
  }, []);

  if (!mounted) return null;

  // Analytics Calculations
  const averageCoverage = records.length > 0 ? (records.reduce((acc, r) => acc + r.coverage, 0) / records.length).toFixed(1) : 0;
  const totalRescued = records.reduce((acc, r) => acc + r.survivorsFound, 0);
  const avgTimeMins = records.length > 0 ? Math.round((records.reduce((acc, r) => acc + r.timeUsed, 0) / records.length) / 60) : 0;

  // Prepare Chart Data
  // Sort records chronologically (oldest to newest) for proper time series graphing
  const chartData = [...records].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(r => ({
    name: new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    survivorsFound: r.survivorsFound,
    totalSurvivors: r.totalSurvivors,
    coverage: parseFloat(r.coverage.toFixed(1)),
    timeMins: parseFloat((r.timeUsed / 60).toFixed(1)),
    rescueRate: Math.round((r.survivorsFound / r.totalSurvivors) * 100)
  }));

  return (
    <main className="min-h-screen bg-blue-50 text-slate-800 font-[family-name:var(--font-geist-sans)] pb-20">
      {/* Glow Orbs */}
      <div className="fixed top-0 right-0 w-[40vw] h-[40vw] translate-x-1/3 -translate-y-1/4 bg-blue-300/30 blur-[130px] rounded-full pointer-events-none -z-10"></div>
      <div className="fixed bottom-0 left-0 w-[50vw] h-[50vw] -translate-x-1/3 translate-y-1/4 bg-indigo-300/20 blur-[130px] rounded-full pointer-events-none -z-10"></div>

      <header className="p-8 pb-12 flex flex-col bg-white/40 border-b border-slate-200/50 backdrop-blur-xl shrink-0 gap-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors w-fit">
          <ArrowLeft className="w-4 h-4" /> RETURN TO HOMEPAGE
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-100/80 w-14 h-14 rounded-2xl flex items-center justify-center backdrop-blur-md border border-emerald-200/50 text-emerald-600 shadow-sm">
              <Database className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Historical Databases</h1>
              <p className="text-slate-500 font-medium">Decentralized logs and mission intelligence archives</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 -mt-6">
        {/* Top Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/70 border border-slate-200/60 rounded-3xl p-6 shadow-sm backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold tracking-widest text-slate-500 uppercase flex items-center gap-2">
                <Crosshair className="w-4 h-4" /> Success Rate
              </h3>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-slate-800 tracking-tighter">{totalRescued}</span>
              <span className="text-sm font-semibold text-slate-500">Targets Found</span>
            </div>
          </div>

          <div className="bg-white/70 border border-slate-200/60 rounded-3xl p-6 shadow-sm backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold tracking-widest text-slate-500 uppercase flex items-center gap-2">
                <Map className="w-4 h-4" /> Avg Coverage
              </h3>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-blue-600 tracking-tighter">{averageCoverage}<span className="text-3xl ml-1">%</span></span>
              <span className="text-sm font-semibold text-slate-500">Scan Density</span>
            </div>
          </div>

          <div className="bg-white/70 border border-slate-200/60 rounded-3xl p-6 shadow-sm backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold tracking-widest text-slate-500 uppercase flex items-center gap-2">
                <Clock className="w-4 h-4" /> Swarm Speed
              </h3>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-emerald-600 tracking-tighter">{avgTimeMins}</span>
              <span className="text-sm font-semibold text-slate-500">Minutes Avg Time</span>
            </div>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center gap-2 mb-10 border-b border-slate-200/50 pb-4">
            <button 
                onClick={() => setViewMode('logs')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold tracking-wide text-sm transition-all ${viewMode === 'logs' ? 'bg-blue-600 shadow-md text-white shadow-blue-500/20' : 'bg-transparent text-slate-500 hover:bg-slate-100'}`}
            >
                <ListFilter className="w-4 h-4" />
                Mission Logs
            </button>            
            <button 
                onClick={() => setViewMode('analytics')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold tracking-wide text-sm transition-all ${viewMode === 'analytics' ? 'bg-blue-600 shadow-md text-white shadow-blue-500/20' : 'bg-transparent text-slate-500 hover:bg-slate-100'}`}
            >
                <LineChartIcon className="w-4 h-4" />
                Performance Analytics
            </button>
        </div>

        {viewMode === 'analytics' ? (
            <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Chart 1: Area Coverage Over Time */}
                    <div className="bg-white/80 border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col h-[400px]">
                        <h2 className="text-slate-800 font-bold mb-6 tracking-tight flex items-center gap-2">
                            <Map className="w-5 h-5 text-blue-500" />
                            Area Coverage (%) Over Time
                        </h2>
                        <div className="flex-1 w-full h-full min-h-0">
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorCover" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} domain={[0, 100]} />
                                    <Tooltip 
                                        contentStyle={{borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '12px'}}
                                        itemStyle={{fontWeight: 'bold'}}
                                    />
                                    <Area type="monotone" dataKey="coverage" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCover)" activeDot={{r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2}} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-slate-400">Not enough data</div>
                            )}
                        </div>
                    </div>

                    {/* Chart 2: Swarm Sortie Time */}
                    <div className="bg-white/80 border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col h-[400px]">
                        <h2 className="text-slate-800 font-bold mb-6 tracking-tight flex items-center gap-2">
                            <Clock className="w-5 h-5 text-rose-500" />
                            Swarm Sortie Duration (Mins)
                        </h2>
                        <div className="flex-1 w-full h-full min-h-0">
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}}/>
                                    <Tooltip 
                                        contentStyle={{borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '12px'}}
                                        itemStyle={{fontWeight: 'bold', color: '#f43f5e'}}
                                    />
                                    <Line type="monotone" dataKey="timeMins" name="Duration" stroke="#f43f5e" strokeWidth={3} activeDot={{r: 6, fill: '#f43f5e', stroke: '#fff', strokeWidth: 2}} />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-slate-400">Not enough data</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Chart 3: Survivors Found vs Total Over Time */}
                <div className="bg-white/80 border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col h-[450px]">
                    <h2 className="text-slate-800 font-bold mb-6 tracking-tight flex items-center gap-2">
                        <Crosshair className="w-5 h-5 text-emerald-500" />
                        Target Acquisition Ratio
                    </h2>
                    <div className="flex-1 w-full h-full min-h-0">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={(props: any) => {
                                        const { x, y, payload } = props;
                                        const dataPoint = chartData.find(d => d.name === payload.value);
                                        return (
                                            <g transform={`translate(${x},${y})`}>
                                                <text x={0} y={0} dy={14} textAnchor="middle" fill="#64748b" fontSize={12}>{payload.value}</text>
                                                {dataPoint && (
                                                    <text x={0} y={0} dy={30} textAnchor="middle" fill="#10b981" fontSize={11} fontWeight="bold">
                                                        {dataPoint.rescueRate}%
                                                    </text>
                                                )}
                                            </g>
                                        );
                                    }} 
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                <Tooltip 
                                    cursor={{fill: '#f1f5f9'}}
                                    contentStyle={{borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '12px'}}
                                />
                                <Legend wrapperStyle={{paddingTop: '20px'}} iconType="circle" />
                                <Bar dataKey="survivorsFound" name="Discovered" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={60} />
                                <Bar dataKey="totalSurvivors" name="Total Known/Estimated" fill="#cbd5e1" radius={[4, 4, 0, 0]} maxBarSize={60} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-slate-400">Not enough data</div>
                        )}
                    </div>
                </div>
            </div>
        ) : (
            <div className="space-y-4">
                <div className="flex items-center justify-between mb-4 px-2">
                    <h2 className="text-slate-800 font-bold text-xl tracking-tight flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-500" />
                    Mission Logs
                    </h2>
                    <span className="text-sm font-semibold text-slate-400">{records.length} Deployments</span>
                </div>
                
                {records.map((r, idx) => (
            <div key={idx} className="bg-white/80 border border-slate-200/80 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] backdrop-blur-lg hover:border-blue-300 hover:shadow-[0_4px_20px_rgba(59,130,246,0.1)] transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group">
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded font-mono text-[10px] font-bold border border-slate-200">{r.id.substring(0,10).toUpperCase()}</span>
                  <span className="text-xs text-slate-400 font-medium flex items-center gap-1"><Clock className="w-3 h-3" />{r.date}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-1">{r.location}</h3>
                <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {r.address}
                </p>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="flex items-center gap-8 bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Found</span>
                  <div className="font-bold text-lg text-slate-800">
                    <span className="text-blue-600">{r.survivorsFound}</span> / {r.totalSurvivors}
                  </div>
                </div>

                <div className="w-px h-8 bg-slate-200"></div>

                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Coverage</span>
                  <div className="font-bold text-lg text-emerald-600">
                    {r.coverage}%
                  </div>
                </div>

                <div className="w-px h-8 bg-slate-200"></div>

                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Time</span>
                  <div className="font-bold text-lg text-slate-700">
                    {Math.floor(r.timeUsed / 60)}<span className="text-sm font-medium text-slate-500">m</span> {r.timeUsed % 60}<span className="text-sm font-medium text-slate-500">s</span>
                  </div>
                </div>
              </div>

                <button 
                  onClick={() => handleDeleteRecord(r.id)}
                  title="Delete from Database"
                  className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
          {records.length === 0 && (
             <div className="bg-white/40 border border-slate-200 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center text-center">
               <Database className="w-10 h-10 text-slate-300 mb-3" />
               <h3 className="font-bold text-slate-700 text-lg">No Records Found</h3>
               <p className="text-slate-500 mt-2">Deploy a new autonomous swarm to record logic entries.</p>
             </div>
          )}
        </div>
        )}
      </div>
    </main>
  );
}
import { create } from 'zustand';

export interface Drone {
    id: string;
    x: number;
    y: number;
    battery: number;
    survivorsFound: number;
    status: 'idle' | 'searching' | 'charging' | 'returning';
    reason: string;
    history: ReasoningHistory[];
}

export interface Survivor {
    id: string;
    x: number;
    y: number;
    discovered: boolean;
    bodyTemp?: number;
    timeFound?: number;
}

export type Point = { x: number; y: number };

export interface ReasoningHistory {
    timestamp: number;
    reason: string;
}

interface SwarmState {
    drones: Drone[];
    survivors: Survivor[];
    exploredCells: Set<string>; // 'x,y' format
    isRunning: boolean;
    orchestratorReason: string;
    orchestratorHistory: ReasoningHistory[];
    totalSurvivors: number;
    viewMode: 'TPP' | 'FPP';
    
    // Actions
    setRunning: (isRunning: boolean) => void;
    updateDrone: (id: string, data: Partial<Drone>) => void;
    discoverSurvivor: (id: string) => void;
    addExploredCell: (x: number, y: number) => void;
    setViewMode: (mode: 'TPP' | 'FPP') => void;
    reset: () => void;
}

const createMockHistory = (id: string): ReasoningHistory[] => [
    { timestamp: Date.now() - 120000, reason: `System initialization. Drone ${id} online.` },
    { timestamp: Date.now() - 60000, reason: `Diagnostics passed. Lift off from dock.` },
    { timestamp: Date.now(), reason: 'Awaiting commands' }
];

const INITIAL_DRONES: Drone[] = [
    { id: 'Alpha-1', x: 2, y: 2, battery: 100, survivorsFound: 0, status: 'idle', reason: 'Awaiting commands', history: createMockHistory('Alpha-1') },
    { id: 'Bravo-2', x: 97, y: 2, battery: 100, survivorsFound: 0, status: 'idle', reason: 'Awaiting commands', history: createMockHistory('Bravo-2') },
    { id: 'Charlie-3', x: 2, y: 97, battery: 100, survivorsFound: 0, status: 'idle', reason: 'Awaiting commands', history: createMockHistory('Charlie-3') },
    { id: 'Delta-4', x: 97, y: 97, battery: 100, survivorsFound: 0, status: 'idle', reason: 'Awaiting commands', history: createMockHistory('Delta-4') }
];

const INITIAL_HISTORY: ReasoningHistory[] = [
    { timestamp: Date.now() - 120000, reason: "System initialized. Booting up initial drone telemetry..." },
    { timestamp: Date.now() - 60000, reason: "Calibration complete. Generating initial search coordinates based on historical survivor data." },
    { timestamp: Date.now(), reason: 'Analyzing 100x100 grid topology to dispatch drones...' }
];

// Pre-fill some explored zones so we can see the effect without starting
const INITIAL_EXPLORED_CELLS = new Set<string>();

// Hardcoded circle-like patches of explored cells for visual testing
const addExploredCircle = (cx: number, cy: number, r: number) => {
    for (let x = cx - r; x <= cx + r; x++) {
        for (let y = cy - r; y <= cy + r; y++) {
            if ((x - cx)**2 + (y - cy)**2 <= r**2 && x >= 0 && x <= 100 && y >= 0 && y <= 100) {
                INITIAL_EXPLORED_CELLS.add(`${x},${y}`);
            }
        }
    }
};

// Expand corners slightly
addExploredCircle(2, 2, 6);
addExploredCircle(97, 2, 6);
addExploredCircle(2, 97, 6);
addExploredCircle(97, 97, 6);

// Hardcode a scanning path for Alpha 1
for (let i = 0; i <= 20; i++) {
    addExploredCircle(2 + i, 2 + i * 1.5, 3);
}
// Add a scanning patch near a building
addExploredCircle(30, 35, 8);

// Mock 50 survivors
const INITIAL_SURVIVORS: Survivor[] = Array.from({ length: 50 }).map((_, i) => {
    if (i === 0) return { id: 'survivor-0', x: 18, y: 22, discovered: true, bodyTemp: 36.5, timeFound: Date.now() - 30000 };
    if (i === 1) return { id: 'survivor-1', x: 30, y: 35, discovered: true, bodyTemp: 35.8, timeFound: Date.now() - 15000 };
    if (i === 2) return { id: 'survivor-2', x: 2, y: 7, discovered: true, bodyTemp: 37.1, timeFound: Date.now() - 120000 };

    return {
        id: `survivor-${i}`,
        x: Math.floor(Math.random() * 80) + 10,
        y: Math.floor(Math.random() * 80) + 10,
        discovered: false,
        bodyTemp: 35.5 + Math.random() * 2,
    };
});

export const useSwarmStore = create<SwarmState>()((set) => ({
    drones: INITIAL_DRONES,
    survivors: INITIAL_SURVIVORS,
    exploredCells: INITIAL_EXPLORED_CELLS,
    isRunning: false,
    orchestratorReason: 'Analyzing 100x100 grid topology to dispatch drones...',
    orchestratorHistory: INITIAL_HISTORY,
    totalSurvivors: 50,
    viewMode: 'TPP',

    setRunning: (isRunning) => set({ isRunning }),
    
    updateDrone: (id, data) => set((state) => ({
        drones: state.drones.map(d => d.id === id ? { ...d, ...data } : d)
    })),
    
    discoverSurvivor: (id) => set((state) => ({
        survivors: state.survivors.map(s => s.id === id ? { 
            ...s, 
            discovered: true, 
            timeFound: Date.now() 
        } : s)
    })),

    addExploredCell: (x, y) => set((state) => {
        const newSet = new Set(state.exploredCells);
        newSet.add(`${x},${y}`);
        return { exploredCells: newSet };
    }),

    setViewMode: (viewMode) => set({ viewMode }),

    reset: () => set({
        drones: INITIAL_DRONES,
        survivors: INITIAL_SURVIVORS,
        exploredCells: new Set(),
        isRunning: false,
        orchestratorReason: 'Analyzing 100x100 grid topology to dispatch drones...',
        orchestratorHistory: INITIAL_HISTORY
    })
}));

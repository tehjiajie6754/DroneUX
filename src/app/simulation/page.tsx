import dynamic from 'next/dynamic';
import RightSidebar from '@/components/RightSidebar';
import BottomSidebar from '@/components/BottomSidebar';
import ViewportManager from '@/components/ViewportManager';
import SimulationHeader from '@/components/SimulationHeader';

export default function Home() {
  return (
    <main className="fixed inset-0 w-screen h-screen bg-blue-50 overflow-hidden flex flex-col font-[family-name:var(--font-geist-sans)] overscroll-none touch-none">
      {/*
        Viewport Manager Handles Maps
      */}
      <ViewportManager />

      {/* 
        Overlay UI Elements 
        Pointer events are passed through most of the screen except on exactly interactive elements
      */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between overflow-hidden">
        
        {/* Top bar (minimalist header) */}
        <SimulationHeader />

        {/* Right Sidebar (Drone Status - Collapsible Drawer) */}
        <RightSidebar />
        
        {/* Bottom Sidebar (Controls & Analytics) */}
        <BottomSidebar />
      </div>
    </main>
  );
}

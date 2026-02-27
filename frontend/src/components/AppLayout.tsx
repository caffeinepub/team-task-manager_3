import React from 'react';
import AppSidebar from './AppSidebar';
import RightPanel from './RightPanel';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Left Sidebar */}
      <AppSidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto min-w-0">
        {children}
      </main>

      {/* Right Panel */}
      <RightPanel />
    </div>
  );
}

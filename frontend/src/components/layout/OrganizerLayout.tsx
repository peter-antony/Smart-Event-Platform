import React, { useState } from 'react';
import { OrganizerHeader } from './OrganizerHeader';
import { OrganizerSidebar } from './OrganizerSidebar';
import { NavTab } from '../../types/event';

interface OrganizerLayoutProps {
  children: React.ReactNode;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
}

export const OrganizerLayout: React.FC<OrganizerLayoutProps> = ({
  children,
  activeTab,
  setActiveTab
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isAuthPage = activeTab === 'login';

  if (isAuthPage) {
    return (
      <div className="h-screen w-screen flex flex-col bg-[#0B0F19] items-center justify-center p-4 overflow-y-auto">
        <main className="w-full max-w-md">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0B0F19] text-gray-100 font-sans overflow-hidden">
      {/* Top Header */}
      <OrganizerHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex-1 flex max-w-[1600px] w-full mx-auto overflow-hidden">
        {/* Left Sidebar */}
        <OrganizerSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 h-full p-4 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

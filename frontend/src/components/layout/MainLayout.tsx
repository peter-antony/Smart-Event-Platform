import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { NavTab } from '../../types/event';

interface MainLayoutProps {
  children: React.ReactNode;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, activeTab, setActiveTab }) => {
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
    <div className="h-screen w-screen flex flex-col bg-[#0B0F19] overflow-hidden">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        
        <main className="flex-1 h-full p-4 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

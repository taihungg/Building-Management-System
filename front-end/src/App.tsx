import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { ResidentManagement } from './components/ResidentManagement';
import { ApartmentManagement } from './components/ApartmentManagement';
import { BillManagement } from './components/BillManagement';
import { ServiceManagement } from './components/ServiceManagement';
import { Notifications } from './components/Notifications';
import { Recommendations } from './components/Recommendations';
import { Profile } from './components/Profile';
import { Settings } from './components/Settings';
import { useEffect } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const handleToggleSidebar = () => {
      setIsSidebarOpen(prev => !prev);
    };

    window.addEventListener('toggleSidebar', handleToggleSidebar);
    return () => window.removeEventListener('toggleSidebar', handleToggleSidebar);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'residents':
        return <ResidentManagement />;
      case 'apartments':
        return <ApartmentManagement />;
      case 'bills':
        return <BillManagement />;
      case 'services':
        return <ServiceManagement />;
      case 'notifications':
        return <Notifications />;
      case 'recommendations':
        return <Recommendations />;
      case 'profile':
        return <Profile />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col">
        <Header 
          onMenuClick={() => setIsSidebarOpen(true)}
          onNavigate={(page) => setActiveTab(page)}
        />
        <main className="flex-1 overflow-y-auto pt-20">
          <div className="max-w-[1680px] mx-auto p-8">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
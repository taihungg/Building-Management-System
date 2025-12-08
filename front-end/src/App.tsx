import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ResidentSidebar } from './components/ResidentSidebar';
import { ResidentHeader } from './components/ResidentHeader';
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
import { ResidentDashboard } from './components/ResidentDashboard';
import { ResidentAnnouncements } from './components/ResidentAnnouncements';
import { ResidentBills } from './components/ResidentBills';
import { BuildingRules } from './components/BuildingRules';
import { ResidentProfile } from './components/ResidentProfile';
import { ResidentSettings } from './components/ResidentSettings';
import { useEffect } from 'react';

type UserRole = 'admin' | 'resident' | null;

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);

  useEffect(() => {
    const handleToggleSidebar = () => {
      setIsSidebarOpen(prev => !prev);
    };

    window.addEventListener('toggleSidebar', handleToggleSidebar);
    return () => window.removeEventListener('toggleSidebar', handleToggleSidebar);
  }, []);

  const handleLogin = (role: 'admin' | 'resident') => {
    setUserRole(role);
    setIsAuthenticated(true);
    if (role === 'resident') {
      setActiveTab('resident-dashboard');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setActiveTab('dashboard');
  };

  const renderAdminContent = () => {
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

  const renderResidentContent = () => {
    switch (activeTab) {
      case 'resident-dashboard':
        return <ResidentDashboard onNavigate={(page) => setActiveTab(page)} />;
      case 'resident-announcements':
        return <ResidentAnnouncements />;
      case 'resident-bills':
        return <ResidentBills />;
      case 'building-rules':
        return <BuildingRules />;
      case 'profile':
        return <ResidentProfile />;
      case 'settings':
        return <ResidentSettings />;
      default:
        return <ResidentDashboard />;
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  // Resident View
  if (userRole === 'resident') {
    return (
      <div className="flex h-screen bg-gray-50">
        <ResidentSidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onLogout={handleLogout}
        />
        <div className="flex-1 flex flex-col">
          <ResidentHeader 
            onMenuClick={() => setIsSidebarOpen(true)}
            onNavigate={(page) => {
              if (page === 'logout') {
                handleLogout();
              } else {
                setActiveTab(page);
              }
            }}
          />
          <main className="flex-1 overflow-y-auto pt-20">
            <div className="max-w-[1680px] mx-auto p-8">
              {renderResidentContent()}
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Admin View
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
          onNavigate={(page) => {
            if (page === 'logout') {
              handleLogout();
            } else {
              setActiveTab(page);
            }
          }}
        />
        <main className="flex-1 overflow-y-auto pt-20">
          <div className="max-w-[1680px] mx-auto p-8">
            {renderAdminContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
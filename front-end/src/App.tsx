import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ResidentSidebar } from './components/ResidentSidebar';
import { ResidentHeader } from './components/ResidentHeader';
// import { AccountingSidebar } from './components/AccountingSidebar';
// import { AccountingHeader } from './components/AccountingHeader';
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
// import { AccountingDashboard } from './components/AccountingDashboard';
// import { DebtManagement } from './components/DebtManagement';
// import { InvoiceCreation } from './components/InvoiceCreation';
// import { AccountingProfile } from './components/AccountingProfile';
import { useEffect } from 'react';
import { Signup } from './components/Signup';
import { ForgotPassword } from './components/ForgotPassword';

type UserRole = 'admin' | 'resident' | null; // 'accountant' temporarily disabled
type AuthPage = 'login' | 'signup' | 'forgot';

const adminTabToPath: Record<string, string> = {
  'dashboard': '/admin/dashboard',
  'residents': '/admin/residents',
  'apartments': '/admin/apartments',
  'bills': '/admin/bills',
  'services': '/admin/services',
  'notifications': '/admin/notifications',
  'recommendations': '/admin/recommendations',
  'profile': '/admin/profile',
  'settings': '/admin/settings',
};

const residentTabToPath: Record<string, string> = {
  'resident-dashboard': '/resident/dashboard',
  'resident-announcements': '/resident/announcement',
  'resident-bills': '/resident/invoice',
  'building-rules': '/resident/rules',
  'profile': '/resident/profile',
  'settings': '/resident/settings',
};

// const accountingTabToPath: Record<string, string> = {
//   'accounting-dashboard': '/accounting/dashboard',
//   'debt-management': '/accounting/debt',
//   'invoice-creation': '/accounting/invoice',
//   'profile': '/accounting/profile',
//   'settings': '/accounting/settings',
// };

const adminPathToTab: Record<string, string> = Object.fromEntries(
  Object.entries(adminTabToPath).map(([tab, path]) => [path, tab])
);

const residentPathToTab: Record<string, string> = Object.fromEntries(
  Object.entries(residentTabToPath).map(([tab, path]) => [path, tab])
);

// const accountingPathToTab: Record<string, string> = Object.fromEntries(
//   Object.entries(accountingTabToPath).map(([tab, path]) => [path, tab])
// );

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [authPage, setAuthPage] = useState<AuthPage>('login');

  useEffect(() => {
    const handleToggleSidebar = () => {
      setIsSidebarOpen(prev => !prev);
    };
    window.addEventListener('toggleSidebar', handleToggleSidebar);
    return () => window.removeEventListener('toggleSidebar', handleToggleSidebar);
  }, []);

  // Set initial auth page based on URL for unauthenticated users
  useEffect(() => {
    if (!isAuthenticated) {
      const path = window.location.pathname;
      if (path === '/signup') {
        setAuthPage('signup');
      } else if (path === '/forgot') {
        setAuthPage('forgot');
      } else {
        setAuthPage('login');
        if (path !== '/login') {
          window.history.replaceState({}, '', '/login');
        }
      }
    }
  }, [isAuthenticated]);

  // Sync tab with browser history
  useEffect(() => {
    const onPopState = () => {
      const path = window.location.pathname;
      if (!isAuthenticated) {
        if (path === '/signup') setAuthPage('signup');
        else if (path === '/forgot') setAuthPage('forgot');
        else {
          setAuthPage('login');
        }
        return;
      }
      if (userRole === 'admin') {
        const tab = adminPathToTab[path];
        if (tab) setActiveTab(tab);
      } else if (userRole === 'resident') {
        const tab = residentPathToTab[path];
        if (tab) setActiveTab(tab);
      } 
      // else if (userRole === 'accountant') {
      //   const tab = accountingPathToTab[path];
      //   if (tab) setActiveTab(tab);
      // }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [userRole]);

  const pushPathForTab = (tab: string, role: UserRole) => {
    let path: string | undefined;
    if (role === 'admin') {
      path = adminTabToPath[tab];
    } else if (role === 'resident') {
      path = residentTabToPath[tab];
    } 
    // else if (role === 'accountant') {
    //   path = accountingTabToPath[tab];
    // }
    if (path) {
      window.history.pushState({}, '', path);
    }
  };

  const handleSetActiveTab = (tab: string) => {
    setActiveTab(tab);
    pushPathForTab(tab, userRole);
  };

  const handleLogin = (role: 'admin' | 'resident' | 'accountant') => {
    // Temporarily disable accountant role
    if (role === 'accountant') {
      alert('Tính năng kế toán tạm thời bị vô hiệu hóa');
      return;
    }
    setUserRole(role);
    setIsAuthenticated(true);
    const initialTab = role === 'resident' ? 'resident-dashboard' : 'dashboard';
    setActiveTab(initialTab);
    pushPathForTab(initialTab, role);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setActiveTab('dashboard');
    window.history.pushState({}, '', '/');
    setAuthPage('login');
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
        return <ResidentDashboard onNavigate={(page) => handleSetActiveTab(page)} />;
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

  // const renderAccountingContent = () => {
  //   switch (activeTab) {
  //     case 'accounting-dashboard':
  //       return <AccountingDashboard />;
  //     case 'debt-management':
  //       return <DebtManagement />;
  //     case 'invoice-creation':
  //       return <InvoiceCreation />;
  //     case 'profile':
  //       return <AccountingProfile />;
  //     case 'settings':
  //       return <Settings />;
  //     default:
  //       return <AccountingDashboard />;
  //   }
  // };

  if (!isAuthenticated) {
    if (authPage === 'signup') {
      return (
        <Signup
          onBack={() => {
            setAuthPage('login');
            window.history.pushState({}, '', '/login');
          }}
          onSuccess={() => {
            setAuthPage('login');
            window.history.pushState({}, '', '/login');
          }}
        />
      );
    }

    if (authPage === 'forgot') {
      return (
        <ForgotPassword
          onBack={() => {
            setAuthPage('login');
            window.history.pushState({}, '', '/login');
          }}
        />
      );
    }

    return (
      <Login 
        onLogin={handleLogin} 
        onNavigateAuth={(page) => {
          setAuthPage(page);
          const path = page === 'signup' ? '/signup' : page === 'forgot' ? '/forgot' : '/login';
          window.history.pushState({}, '', path);
        }}
      />
    );
  }

  // Resident View
  if (userRole === 'resident') {
    return (
      <div className="flex h-screen bg-gray-50">
        <ResidentSidebar 
          activeTab={activeTab} 
          setActiveTab={handleSetActiveTab}
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
                handleSetActiveTab(page);
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

  // Accounting View - Temporarily disabled
  // if (userRole === 'accountant') {
  //   return (
  //     <div className="flex h-screen bg-gray-50">
  //       <AccountingSidebar 
  //         activeTab={activeTab} 
  //         setActiveTab={handleSetActiveTab}
  //         isOpen={isSidebarOpen}
  //         onClose={() => setIsSidebarOpen(false)}
  //         onLogout={handleLogout}
  //       />
  //       <div className="flex-1 flex flex-col">
  //         <AccountingHeader 
  //           onMenuClick={() => setIsSidebarOpen(true)}
  //           onNavigate={(page) => {
  //             if (page === 'logout') {
  //               handleLogout();
  //             } else {
  //               handleSetActiveTab(page);
  //             }
  //           }}
  //         />
  //         <main className="flex-1 overflow-y-auto pt-20">
  //           <div className="max-w-[1680px] mx-auto p-8">
  //             {renderAccountingContent()}
  //           </div>
  //         </main>
  //       </div>
  //     </div>
  //   );
  // }

  // Admin View
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={handleSetActiveTab}
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
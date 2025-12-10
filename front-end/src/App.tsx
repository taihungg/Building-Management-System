import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React from 'react';

// === Imports cho Admin ===
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { ResidentManagement } from './components/ResidentManagement';
import { ApartmentManagement } from './components/ApartmentManagement';
import { BillManagement } from './components/BillManagement';
import { ServiceManagement } from './components/ServiceManagement';
import { Notifications } from './components/Notifications';
import { Recommendations } from './components/Recommendations';
import { Profile } from './components/Profile';
import { Settings } from './components/Settings';

// === Imports cho Resident ===
import { ResidentSidebar } from './components/ResidentSidebar';
import { ResidentHeader } from './components/ResidentHeader';
import { ResidentDashboard } from './components/ResidentDashboard';
import { ResidentAnnouncements } from './components/ResidentAnnouncements';
import { ResidentBills } from './components/ResidentBills';
import { BuildingRules } from './components/BuildingRules';
import { ResidentProfile } from './components/ResidentProfile';
import { ResidentSettings } from './components/ResidentSettings';

// === Imports cho Accounting ===
import { AccountingSidebar } from './components/AccountingSidebar';
import { AccountingHeader } from './components/AccountingHeader';
import { AccountingDashboard } from './components/AccountingDashboard';
import { AccountingProfile } from './components/AccountingProfile';
import { InvoiceCreation } from './components/InvoiceCreation';
import { DebtManagement } from './components/DebtManagement';

// === Import cho Login ===
import { Login } from './components/Login';

// Định nghĩa kiểu cho vai trò người dùng
type UserRole = 'admin' | 'resident' | 'accounting' | null;

// Component PrivateRoute (Giữ nguyên không sử dụng)
const PrivateRoute = ({ children, allowedRoles }: { children: JSX.Element, allowedRoles: UserRole[] }) => {
    const [userRole, setUserRole] = useState<UserRole>('admin'); 
    return children;
};

// =================================================================
// COMPONENT CHÍNH
// =================================================================

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  
  // --- Login/Logout Handlers ---
  const handleLogin = (role: 'admin' | 'resident' | 'accounting') => {
    setUserRole(role);
    setIsAuthenticated(true);
    localStorage.setItem('userRole', role);
    localStorage.setItem('isAuthenticated', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    localStorage.removeItem('userRole');
    localStorage.removeItem('isAuthenticated');
  };

  // --- Sidebar Toggle Effect ---
  useEffect(() => {
    const storedRole = localStorage.getItem('userRole') as UserRole | null;
    const storedAuth = localStorage.getItem('isAuthenticated') === 'true';
    if (storedRole && storedAuth) {
      setUserRole(storedRole);
      setIsAuthenticated(true);
    }

    const handleToggleSidebar = () => {
      setIsSidebarOpen(prev => !prev);
    };
    window.addEventListener('toggleSidebar', handleToggleSidebar);
    return () => window.removeEventListener('toggleSidebar', handleToggleSidebar);
  }, []); // [] đảm bảo logic này chỉ chạy 1 lần khi App được load

  // Ensure path matches role; redirect to default if not
  useEffect(() => {
    if (!isAuthenticated || !userRole) return;
    const path = window.location.pathname;
    const allowed: Record<Exclude<UserRole, null>, { paths: string[]; fallback: string }> = {
      admin: {
        paths: [
          '/dashboard', '/residents', '/apartments', '/bills', '/services',
          '/notifications', '/recommendations', '/profile', '/settings', '/'
        ],
        fallback: '/dashboard'
      },
      resident: {
        paths: [
          '/resident-dashboard', '/resident-announcements', '/resident-bills',
          '/building-rules', '/profile', '/settings', '/'
        ],
        fallback: '/resident-dashboard'
      },
      accounting: {
        paths: [
          '/accounting-dashboard', '/debt-management', '/invoice-creation',
          '/profile', '/settings', '/'
        ],
        fallback: '/accounting-dashboard'
      }
    };
    const cfg = allowed[userRole];
    const matched = cfg.paths.some(p => path === p || path.startsWith(p + '/'));
    if (!matched) {
      window.history.replaceState(null, '', cfg.fallback);
    }
  }, [isAuthenticated, userRole]);

  // --- Conditional Renders ---

  // 1. CHƯA ĐĂNG NHẬP
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  // 2. ĐÃ ĐĂNG NHẬP (Sử dụng Router cho cả Admin và Resident)

  // Hàm Layout chung cho cả Admin và Resident để bớt lặp code
  const MainLayout = ({ sidebar, header, routes }: { sidebar: JSX.Element, header: JSX.Element, routes: JSX.Element }) => (
    <div className="flex h-screen bg-gray-50">
        {sidebar}
        <div className="flex-1 flex flex-col">
            {header}
            <main className="flex-1 overflow-y-auto pt-20">
                <div className="max-w-[1680px] mx-auto p-8">
                    <Routes>
                        {routes}
                        {/* Trang 404 cho trường hợp không khớp route nào trong vai trò đó */}
                        <Route path="*" element={<div className="p-4">404 Not Found</div>} />
                    </Routes>
                </div>
            </main>
        </div>
    </div>
  );

  const adminRoutes = (
    <>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/residents" element={<ResidentManagement />} />
        <Route path="/apartments" element={<ApartmentManagement />} />
        <Route path="/bills" element={<BillManagement />} />
        <Route path="/services" element={<ServiceManagement />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
    </>
  );

  const residentRoutes = (
    <>
        <Route path="/" element={<Navigate to="/resident-dashboard" replace />} />
        <Route path="/resident-dashboard" element={<ResidentDashboard />} />
        <Route path="/resident-announcements" element={<ResidentAnnouncements />} />
        <Route path="/resident-bills" element={<ResidentBills />} />
        <Route path="/building-rules" element={<BuildingRules />} />
        <Route path="/profile" element={<ResidentProfile />} />
        <Route path="/settings" element={<ResidentSettings />} />
    </>
  );

  const accountingRoutes = (
    <>
      <Route path="/" element={<Navigate to="/accounting-dashboard" replace />} />
      <Route path="/accounting-dashboard" element={<AccountingDashboard />} />
      <Route path="/debt-management" element={<DebtManagement />} />
      <Route path="/invoice-creation" element={<InvoiceCreation />} />
      <Route path="/profile" element={<AccountingProfile />} />
      <Route path="/settings" element={<Settings />} />
    </>
  );

  // Dựa vào userRole để xác định layout và routes
  let sidebarComponent, headerComponent, appRoutes;

  if (userRole === 'admin') {
      sidebarComponent = (
          <Sidebar 
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
          />
      );
      headerComponent = (
          <Header 
              onMenuClick={() => setIsSidebarOpen(true)}
              onLogout={handleLogout} 
          />
      );
      appRoutes = adminRoutes;
  } else if (userRole === 'resident') {
      sidebarComponent = (
          <ResidentSidebar 
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
              onLogout={handleLogout} 
          />
      );
      headerComponent = (
          <ResidentHeader 
              onMenuClick={() => setIsSidebarOpen(true)}
              onLogout={handleLogout}
          />
      );
      appRoutes = residentRoutes;
  } else if (userRole === 'accounting') {
      sidebarComponent = (
          <AccountingSidebar 
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
              onLogout={handleLogout}
          />
      );
      headerComponent = (
          <AccountingHeader 
              onMenuClick={() => setIsSidebarOpen(true)}
          />
      );
      appRoutes = accountingRoutes;
  } else {
      // Nếu có lỗi vai trò nhưng đã đăng nhập (Không nên xảy ra với hardcode)
      return <div className="p-4 text-red-600">Lỗi: Không xác định được vai trò người dùng.</div>;
  }


  return (
    <Router>
        <MainLayout 
            sidebar={sidebarComponent} 
            header={headerComponent} 
            routes={appRoutes} 
        />
    </Router>
  );
}
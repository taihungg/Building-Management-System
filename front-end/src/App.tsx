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

// === Import cho Login ===
import { Login } from './components/Login';

// Định nghĩa kiểu cho vai trò người dùng
type UserRole = 'admin' | 'resident' | null;

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
  const handleLogin = (role: 'admin' | 'resident') => {
    setUserRole(role);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
  };

  // --- Sidebar Toggle Effect ---
  useEffect(() => {
    // ===========================================================
    // HARDCODE TÀI KHOẢN RESIDENT ĐỂ TEST (BỎ QUA MÀN HÌNH LOGIN)
    // ===========================================================
    setIsAuthenticated(true);
    setUserRole('resident'); 
    // Nếu muốn test Admin, đổi thành: setUserRole('admin');
    
    const handleToggleSidebar = () => {
      setIsSidebarOpen(prev => !prev);
    };
    window.addEventListener('toggleSidebar', handleToggleSidebar);
    return () => window.removeEventListener('toggleSidebar', handleToggleSidebar);
  }, []); // [] đảm bảo logic này chỉ chạy 1 lần khi App được load

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
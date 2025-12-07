import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import các components
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
import React from 'react';

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Giả lập check login
    setIsAuthenticated(true);

    const handleToggleSidebar = () => {
      setIsSidebarOpen(prev => !prev);
    };
    window.addEventListener('toggleSidebar', handleToggleSidebar);
    return () => window.removeEventListener('toggleSidebar', handleToggleSidebar);
  }, []);

  // Nếu chưa đăng nhập, hiển thị Login
  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <Router>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar: Không cần truyền activeTab nữa, Sidebar sẽ tự xử lý bằng NavLink */}
        <Sidebar 
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <Header 
            onMenuClick={() => setIsSidebarOpen(true)}
          />

          {/* Main Content: Chứa các Routes */}
          <main className="flex-1 overflow-y-auto pt-20">
            <div className="max-w-[1680px] mx-auto p-8">
              <Routes>
                {/* Mặc định vào "/" sẽ chuyển hướng sang "/dashboard" */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* Định nghĩa các trang */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/residents" element={<ResidentManagement />} />
                <Route path="/apartments" element={<ApartmentManagement />} />
                <Route path="/bills" element={<BillManagement />} />
                <Route path="/services" element={<ServiceManagement />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/recommendations" element={<Recommendations />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />

                {/* Trang 404 (Optional) */}
                <Route path="*" element={<div className="p-4">404 Not Found</div>} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </Router>
  );
}
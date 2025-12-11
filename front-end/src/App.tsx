import { useState, useEffect, useCallback } from 'react';
// Sửa lỗi: Import useNavigate từ react-router-dom
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'; 
import React from 'react';

// === Imports Components ===
// Admin Components
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

// Resident Components
import { ResidentSidebar } from './components/ResidentSidebar';
import { ResidentHeader } from './components/ResidentHeader';
import { ResidentDashboard } from './components/ResidentDashboard';
import { ResidentAnnouncements } from './components/ResidentAnnouncements';
import { ResidentBills } from './components/ResidentBills';
import { BuildingRules } from './components/BuildingRules';
import { ResidentProfile } from './components/ResidentProfile';
import { ResidentSettings } from './components/ResidentSettings';

// Accounting Components
import { AccountingSidebar } from './components/AccountingSidebar';
import { AccountingHeader } from './components/AccountingHeader';
import { AccountingDashboard } from './components/AccountingDashboard';
import { DebtManagement } from './components/DebtManagement';
import { InvoiceCreation } from './components/InvoiceCreation';
import { AccountingProfile } from './components/AccountingProfile';

// Auth Components
import { Login } from './components/Login';
import { Signup } from './components/Signup';
import { ForgotPassword } from './components/ForgotPassword';


// === Định nghĩa kiểu và Maps ===
type UserRole = 'admin' | 'resident' | 'accountant' | null;
type AuthPage = 'login' | 'signup' | 'forgot';

// Map: Tên Tab -> Đường dẫn URL
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
  'resident-announcements': '/resident/announcements',
  'resident-bills': '/resident/invoice',
  'building-rules': '/resident/rules',
  'profile': '/resident/profile',
  'settings': '/resident/settings',
};

const accountingTabToPath: Record<string, string> = {
  'accounting-dashboard': '/accounting/dashboard',
  'debt-management': '/accounting/debt',
  'invoice-creation': '/accounting/invoice',
  'profile': '/accounting/profile',
  'settings': '/accounting/settings',
};

// Map: Đường dẫn URL -> Tên Tab
const adminPathToTab: Record<string, string> = Object.fromEntries(
  Object.entries(adminTabToPath).map(([tab, path]) => [path, tab])
);
const residentPathToTab: Record<string, string> = Object.fromEntries(
  Object.entries(residentTabToPath).map(([tab, path]) => [path, tab])
);
const accountingPathToTab: Record<string, string> = Object.fromEntries(
  Object.entries(accountingTabToPath).map(([tab, path]) => [path, tab])
);


// =================================================================
// HÀM LAYOUT VÀ ROUTE CHO TỪNG VAI TRÒ
// =================================================================

const MainLayout = ({ sidebar, header, routes }: { sidebar: JSX.Element, header: JSX.Element, routes: JSX.Element }) => (
    <div className="flex h-screen bg-gray-50">
        {sidebar}
        <div className="flex-1 flex flex-col">
            {header}
            <main className="flex-1 overflow-y-auto pt-20">
                <div className="max-w-[1680px] mx-auto p-8">
                    <Routes>
                        {routes}
                        <Route path="*" element={<div className="p-4 text-3xl text-red-600">404 Not Found</div>} />
                    </Routes>
                </div>
            </main>
        </div>
    </div>
);

// Admin Routes
const adminRoutes = (
    <>
        <Route path="/" element={<Navigate to="dashboard" replace />} />
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

// Resident Routes
const residentRoutes = (
    <>
        <Route path="/" element={<Navigate to="dashboard" replace />} />
        <Route path="/dashboard" element={<ResidentDashboard onNavigate={(page) => { console.log("Navigate to", page); }} />} />
        <Route path="/announcements" element={<ResidentAnnouncements />} />
        <Route path="/invoice" element={<ResidentBills />} />
        <Route path="/rules" element={<BuildingRules />} />
        <Route path="/profile" element={<ResidentProfile />} />
        <Route path="/settings" element={<ResidentSettings />} />
    </>
);

// Accounting Routes
const accountingRoutes = (
    <>
        <Route path="/" element={<Navigate to="dashboard" replace />} />
        <Route path="/dashboard" element={<AccountingDashboard />} />
        <Route path="/debt" element={<DebtManagement />} />
        <Route path="/invoice" element={<InvoiceCreation />} />
        <Route path="/profile" element={<AccountingProfile />} />
        <Route path="/settings" element={<Settings />} />
    </>
);


// =================================================================
// APP CONTENT: SỬ DỤNG HOOKS ĐIỀU HƯỚNG
// =================================================================

function AppContent() {
    // SỬ DỤNG HOOK useNavigate TẠI ĐÂY để kích hoạt React Router
    const navigate = useNavigate(); 
    
    // States
    const [activeTab, setActiveTab] = useState('dashboard'); 
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState<UserRole>(null);
    const [authPage, setAuthPage] = useState<AuthPage>('login');

    
    // --- Điều hướng: Thay thế window.history.pushState bằng navigate ---
    
    // Hàm đẩy URL mới khi click vào tab (SỬA ĐỔI)
    const pushPathForTab = useCallback((tab: string, role: UserRole) => {
        let path: string | undefined;
        if (role === 'admin') {
            path = adminTabToPath[tab];
        } else if (role === 'resident') {
            path = residentTabToPath[tab];
        } else if (role === 'accountant') {
            path = accountingTabToPath[tab];
        }
        
        if (path && path !== window.location.pathname) {
            navigate(path); // Dùng navigate để đảm bảo Routes render lại
        }
    }, [navigate]); 

    // Hàm xử lý khi click vào Sidebar item
    const handleSetActiveTab = useCallback((tab: string) => {
        setActiveTab(tab);
        pushPathForTab(tab, userRole);
    }, [userRole, pushPathForTab]);

    const handleLogin = (role: 'admin' | 'resident' | 'accountant') => {
        setUserRole(role);
        setIsAuthenticated(true);
        
        let initialTab: string;
        let initialPath: string;
        
        if (role === 'resident') {
            initialTab = 'resident-dashboard';
            initialPath = residentTabToPath[initialTab];
        } else if (role === 'accountant') {
            initialTab = 'accounting-dashboard';
            initialPath = accountingTabToPath[initialTab];
        } else {
            initialTab = 'dashboard';
            initialPath = adminTabToPath[initialTab];
        }

        setActiveTab(initialTab);
        // Dùng navigate với replace: true để xóa trang login khỏi lịch sử
        navigate(initialPath, { replace: true });
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setUserRole(null);
        setActiveTab('dashboard'); 
        navigate('/login'); 
        setAuthPage('login');
    };
    

    // === useEffects ===

    // 1. Toggle Sidebar Listener (Giữ nguyên)
    useEffect(() => {
        const handleToggleSidebar = () => {
            setIsSidebarOpen(prev => !prev);
        };
        window.addEventListener('toggleSidebar', handleToggleSidebar);
        return () => window.removeEventListener('toggleSidebar', handleToggleSidebar);
    }, []);


    // 2. Sync tab and auth page with browser history (Đã tối ưu hóa)
    useEffect(() => {
        const syncStateFromPath = () => {
            const path = window.location.pathname;
            
            // --- Xử lý trang Auth ---
            if (!isAuthenticated) {
                if (path === '/signup') setAuthPage('signup');
                else if (path === '/forgot') setAuthPage('forgot');
                else if (path !== '/login' && path !== '/') {
                    setAuthPage('login');
                    // navigate thay thế window.history.replaceState
                    navigate('/login', { replace: true }); 
                } else {
                    setAuthPage('login');
                }
                return;
            }
            
            // --- Xử lý trang chính (Authenticated) ---
            let tab = '';
            let base = '';
            let defaultTab = '';

            if (userRole === 'admin') {
                tab = adminPathToTab[path];
                base = '/admin';
                defaultTab = 'dashboard';
            } else if (userRole === 'resident') {
                tab = residentPathToTab[path];
                base = '/resident';
                defaultTab = 'resident-dashboard';
            } else if (userRole === 'accountant') {
                tab = accountingPathToTab[path];
                base = '/accounting';
                defaultTab = 'accounting-dashboard';
            }
            
            if (tab) {
                setActiveTab(tab);
            } 
            // Nếu URL nằm trong khu vực vai trò nhưng không khớp tab nào (ví dụ: /admin/abc),
            // chuyển activeTab về default (dashboard) để sidebar không bị lỗi highlight
            else if (base && path.startsWith(base)) {
                setActiveTab(defaultTab);
            }
        };

        // Bắt sự kiện back/forward của trình duyệt (Popstate)
        const handlePopState = () => syncStateFromPath();
        window.addEventListener('popstate', handlePopState);
        
        // Chạy lần đầu khi component mount/role change
        syncStateFromPath();

        return () => window.removeEventListener('popstate', handlePopState);
        
    }, [isAuthenticated, userRole, navigate]); 
    

    // --- Conditional Renders ---

    // 1. CHƯA ĐĂNG NHẬP (Authentication Routes)
    if (!isAuthenticated) {
        if (authPage === 'signup') {
            return (
                <Signup
                    onBack={() => navigate('/login')}
                    onSuccess={() => navigate('/login')}
                />
            );
        }

        if (authPage === 'forgot') {
            return (
                <ForgotPassword
                    onBack={() => navigate('/login')}
                />
            );
        }

        return (
            <Login 
                onLogin={handleLogin} 
                onNavigateAuth={(page) => {
                    setAuthPage(page);
                    const path = page === 'signup' ? '/signup' : page === 'forgot' ? '/forgot' : '/login';
                    navigate(path);
                }}
            />
        );
    }

    // 2. ĐÃ ĐĂNG NHẬP (Main Application Router)
    
    let sidebarComponent, headerComponent, appRoutes, baseUrl;

    if (userRole === 'admin') {
        sidebarComponent = (
            <Sidebar 
                activeTab={activeTab} 
                setActiveTab={handleSetActiveTab} 
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onLogout={handleLogout} 
            />
        );
        headerComponent = (
            <Header 
                onMenuClick={() => setIsSidebarOpen(true)}
                onLogout={handleLogout} 
            />
        );
        appRoutes = adminRoutes;
        baseUrl = '/admin/*';
        
    } else if (userRole === 'resident') {
        sidebarComponent = (
            <ResidentSidebar 
                activeTab={activeTab} 
                setActiveTab={handleSetActiveTab} 
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
        baseUrl = '/resident/*';
        
    } else if (userRole === 'accountant') {
        sidebarComponent = (
            <AccountingSidebar 
                activeTab={activeTab} 
                setActiveTab={handleSetActiveTab} 
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onLogout={handleLogout} 
            />
        );
        headerComponent = (
            <AccountingHeader 
              onMenuClick={() => setIsSidebarOpen(true)}
              onLogout={handleLogout}
            />
        );
        appRoutes = accountingRoutes;
        baseUrl = '/accounting/*';
        
    } else {
        // Fallback an toàn nếu role bị mất
        return <Navigate to="/login" replace />;
    }


    // Router cho người dùng đã đăng nhập
    return (
        <Routes>
            {/* 1. Tuyến chính cho vai trò hiện tại (VD: /admin/...) */}
            <Route path={baseUrl} element={
                <MainLayout 
                    sidebar={sidebarComponent} 
                    header={headerComponent} 
                    routes={appRoutes} 
                />
            } />
            
            {/* 2. Tuyến cho các trang Auth (Redirect ngược lại dashboard nếu đã đăng nhập) */}
            <Route path="/login" element={<Navigate to={`/${userRole}/dashboard`} replace />} />
            <Route path="/signup" element={<Navigate to={`/${userRole}/dashboard`} replace />} />
            <Route path="/forgot" element={<Navigate to={`/${userRole}/dashboard`} replace />} />

            {/* 3. Tuyến redirect cơ bản / -> dashboard của vai trò */}
            <Route path="/" element={<Navigate to={`/${userRole}/dashboard`} replace />} />
            
            {/* 4. Fallback 404 */}
            <Route path="*" element={<div className="p-4 text-3xl text-red-600">404 Not Found</div>} />

        </Routes>
    );
}


// =================================================================
// COMPONENT GỐC: CHỈ CÓ NHIỆM VỤ BỌC Router
// =================================================================
export default function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}
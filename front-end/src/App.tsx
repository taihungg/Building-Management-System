import { useState, useEffect, useCallback } from 'react';
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

// Authority Components (Components bạn cung cấp)
import { AuthoritySidebar } from './components/AuthoritySidebar';
import { AuthorityHeader } from './components/AuthorityHeader';
import { AuthorityDashboard } from './components/AuthorityDashboard';
import { AuthorityResidentManagement } from './components/AuthorityResidentManagement';
import { AuthorityAnnouncements } from './components/AuthorityAnnouncements';
import { AuthorityProfile } from './components/AuthorityProfile';
import { Login } from './components/Login'; 


// === Định nghĩa kiểu và Maps ===
type UserRole = 'admin' | 'resident' | 'accounting' | 'authority' | null; 
type AuthPage = 'login' | 'signup' | 'forgot';

// Map: Tên Tab -> Đường dẫn URL 
const adminTabToPath: Record<string, string> = {
  'dashboard': '/admin/dashboard',
  'residents': '/admin/residents',
  'apartments': '/admin/apartments',
  'bills': '/admin/bills',
  'services': '/admin/services',
  'notifications': '/admin/notifications',
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

// ✅ MAPS CHO VAI TRÒ AUTHORITY
const authorityTabToPath: Record<string, string> = {
  'authority-dashboard': '/authority/dashboard',
  'authority-residents': '/authority/residents',
  'authority-announcements': '/authority/announcements',
  'profile': '/authority/profile',
  'settings': '/authority/settings',
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
// ✅ PATHS CHO VAI TRÒ AUTHORITY
const authorityPathToTab: Record<string, string> = Object.fromEntries(
  Object.entries(authorityTabToPath).map(([tab, path]) => [path, tab])
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

// Admin Routes (Giữ nguyên)
const adminRoutes = (
    <>
        <Route path="/" element={<Navigate to="dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/residents" element={<ResidentManagement />} />
        <Route path="/apartments" element={<ApartmentManagement />} />
        <Route path="/bills" element={<BillManagement />} />
        <Route path="/services" element={<ServiceManagement />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
    </>
);

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

const authorityRoutes = (
    <>
        <Route path="/" element={<Navigate to="dashboard" replace />} />
        <Route path="/dashboard" element={<AuthorityDashboard />} />
        <Route path="/residents" element={<AuthorityResidentManagement />} />
        <Route path="/announcements" element={<AuthorityAnnouncements />} />
        <Route path="/profile" element={<AuthorityProfile />} />
        <Route path="/settings" element={<Settings />} /> {/* Dùng Settings chung */}
    </>
);


// =================================================================
// APP CONTENT
// =================================================================

function AppContent() {
    const navigate = useNavigate(); 
    
    // States
    const [activeTab, setActiveTab] = useState('dashboard'); 
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState<UserRole>(null); 
    const [authPage, setAuthPage] = useState<AuthPage>('login');

    
    // Hàm đẩy URL mới khi click vào tab
    const pushPathForTab = useCallback((tab: string, role: UserRole) => {
        let path: string | undefined;
        if (role === 'admin') {
            path = adminTabToPath[tab];
        } else if (role === 'resident') {
            path = residentTabToPath[tab];
        } else if (role === 'accounting') {
            path = accountingTabToPath[tab];
        } else if (role === 'authority') { // ✅ authority
            path = authorityTabToPath[tab];
        }
        
        if (path && path !== window.location.pathname) {
            navigate(path); 
        }
    }, [navigate]); 

    // Hàm xử lý khi click vào Sidebar item
    const handleSetActiveTab = useCallback((tab: string) => {
        setActiveTab(tab);
        pushPathForTab(tab, userRole);
    }, [userRole, pushPathForTab]);

    // Hàm xử lý Login
    const handleLogin = (role: UserRole) => {
        setUserRole(role);
        setIsAuthenticated(true);
        
        let initialTab: string;
        let initialPath: string;
        
        if (role === 'resident') {
            initialTab = 'resident-dashboard';
            initialPath = residentTabToPath[initialTab];
        } else if (role === 'accounting') {
            initialTab = 'accounting-dashboard';
            initialPath = accountingTabToPath[initialTab];
        } else if (role === 'authority') { // ✅ authority
            initialTab = 'authority-dashboard';
            initialPath = authorityTabToPath[initialTab];
        } else { // admin
            initialTab = 'dashboard';
            initialPath = adminTabToPath[initialTab];
        }

        setActiveTab(initialTab);
        navigate(initialPath, { replace: true });
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setUserRole(null);
        setActiveTab('dashboard'); 
        navigate('/login'); 
        setAuthPage('login');
    };
    

    // 2. Sync tab and auth page with browser history
    useEffect(() => {
        const syncStateFromPath = () => {
            const path = window.location.pathname;
            
            // --- Xử lý trang Auth ---
            if (!isAuthenticated) {
                // ... (Auth page logic) ...
                if (path === '/signup') setAuthPage('signup');
                else if (path === '/forgot') setAuthPage('forgot');
                else if (path !== '/login' && path !== '/') {
                    setAuthPage('login');
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
            } else if (userRole === 'accounting') {
                tab = accountingPathToTab[path];
                base = '/accounting';
                defaultTab = 'accounting-dashboard';
            } else if (userRole === 'authority') { // ✅ authority
                tab = authorityPathToTab[path];
                base = '/authority';
                defaultTab = 'authority-dashboard';
            }
            
            if (tab) {
                setActiveTab(tab);
            } 
            else if (base && path.startsWith(base)) {
                setActiveTab(defaultTab);
            }
        };

        const handlePopState = () => syncStateFromPath();
        window.addEventListener('popstate', handlePopState);
        syncStateFromPath();

        return () => window.removeEventListener('popstate', handlePopState);
        
    }, [isAuthenticated, userRole, navigate]); 
    

    // --- Conditional Renders ---

    if (!isAuthenticated) {
        // Placeholder components
        const Signup = () => <div className="p-8">Signup Page Placeholder</div>;
        const ForgotPassword = () => <div className="p-8">Forgot Password Page Placeholder</div>;

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
        
        // SỬ DỤNG COMPONENT LOGIN ĐÃ IMPORT
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

    // --- ĐÃ ĐĂNG NHẬP (Main Application Router) ---
    
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
        
    } else if (userRole === 'accounting') {
        sidebarComponent = (
            <AccountingSidebar 
                activeTab={activeTab} 
                setActiveTab={handleSetActiveTab} 
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onLogout={handleLogout} 
            />
        );
        // Handle navigation for accounting header
        const handleAccountingNavigate = (page: string) => {
          if (page === 'logout') {
            handleLogout();
          } else if (page === 'profile') {
            navigate('/accounting/profile');
          } else if (page === 'settings') {
            navigate('/accounting/settings');
          } else if (page === 'accounting-dashboard') {
            navigate('/accounting/dashboard');
          }
        };

        headerComponent = (
            <AccountingHeader 
              onMenuClick={() => setIsSidebarOpen(true)}
              onNavigate={handleAccountingNavigate}
            />
        );
        appRoutes = accountingRoutes;
        baseUrl = '/accounting/*';

    } else if (userRole === 'authority') { 
        sidebarComponent = (
            <AuthoritySidebar 
                activeTab={activeTab} 
                setActiveTab={handleSetActiveTab} 
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onLogout={handleLogout} 
            />
        );
        headerComponent = (
            <AuthorityHeader 
              onMenuClick={() => setIsSidebarOpen(true)}
              onLogout={handleLogout}
            />
        );
        appRoutes = authorityRoutes;
        baseUrl = '/authority/*';
        
    } else {
        return <Navigate to="/login" replace />;
    }


    // Router cho người dùng đã đăng nhập
    return (
        <Routes>
            <Route path={baseUrl} element={
                <MainLayout 
                    sidebar={sidebarComponent} 
                    header={headerComponent} 
                    routes={appRoutes} 
                />
            } />
            
            <Route path="/login" element={<Navigate to={`/${userRole}/dashboard`} replace />} />
            <Route path="/signup" element={<Navigate to={`/${userRole}/dashboard`} replace />} />
            <Route path="/forgot" element={<Navigate to={`/${userRole}/dashboard`} replace />} />
            <Route path="/" element={<Navigate to={`/${userRole}/dashboard`} replace />} />
            <Route path="*" element={<div className="p-4 text-3xl text-red-600">404 Not Found</div>} />

        </Routes>
    );
}


export default function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}
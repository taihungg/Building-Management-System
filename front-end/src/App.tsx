import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'; 
import React from 'react';
import { Toaster, toast } from 'sonner';

// === Imports Components ===
// management
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
import { ExtraServiceManagement } from './components/ExtraServiceManagement';
import { VoluntaryContribution } from './components/VoluntaryContribution';

// Resident
import { ResidentSidebar } from './components/ResidentSidebar';
import { ResidentHeader } from './components/ResidentHeader';
import { ResidentDashboard } from './components/ResidentDashboard';
import { ResidentAnnouncements } from './components/ResidentAnnouncements';
import { ResidentBills } from './components/ResidentBills';
import { BuildingRules } from './components/BuildingRules';
import { ResidentProfile } from './components/ResidentProfile';
import { ResidentSettings } from './components/ResidentSettings';

// Accounting
import { AccountingSidebar } from './components/AccountingSidebar';
import { AccountingHeader } from './components/AccountingHeader';
import { AccountingDashboard } from './components/AccountingDashboard';
import { DebtManagement } from './components/DebtManagement';
import { InvoiceCreation } from './components/InvoiceCreation';
import { AccountingProfile } from './components/AccountingProfile';
import { AccountingVoluntaryContribution } from './components/AccountingVoluntaryContribution';

// Authority
import { AuthoritySidebar } from './components/AuthoritySidebar';
import { AuthorityHeader } from './components/AuthorityHeader';
import { AuthorityDashboard } from './components/AuthorityDashboard';
import { AuthorityResidentManagement } from './components/AuthorityResidentManagement';
import { AuthorityAnnouncements } from './components/AuthorityAnnouncements';
import { AuthorityProfile } from './components/AuthorityProfile';

// Auth
import { Login } from './components/Login'; 

// === Định nghĩa kiểu và Maps ===
type UserRole = 'management' | 'resident' | 'accounting' | 'authority' | null; 
type AuthPage = 'login' | 'signup' | 'forgot';

// Bộ dịch vai trò từ Backend (In hoa) sang Frontend (In thường)
const ROLE_MAP: Record<string, UserRole> = {
  'MANAGEMENT': 'management',
  'RESIDENT': 'resident',
  'ACCOUNTANT': 'accounting',
  'STATE': 'authority'
};

const managementTabToPath: Record<string, string> = {
  'dashboard': '/management/dashboard', 'residents': '/management/residents', 'apartments': '/management/apartments',
  'bills': '/management/bills', 'services': '/management/services', 'notifications': '/management/notifications',
  'profile': '/management/profile', 'settings': '/management/settings', 'extra-services': '/management/extra-services', 
  'voluntary-contributions': '/management/voluntary-contributions'
};

const residentTabToPath: Record<string, string> = {
  'resident-dashboard': '/resident/dashboard', 'resident-announcements': '/resident/announcements',
  'resident-bills': '/resident/invoice', 'building-rules': '/resident/rules',
  'profile': '/resident/profile', 'settings': '/resident/settings',
};

const accountingTabToPath: Record<string, string> = {
  'accounting-dashboard': '/accounting/dashboard', 'debt-management': '/accounting/debt',
  'invoice-creation': '/accounting/invoice', 'profile': '/accounting/profile',
  'settings': '/accounting/settings', 'accounting-voluntary-contribution': '/accounting/voluntary-contribution'
};

const authorityTabToPath: Record<string, string> = {
  'authority-dashboard': '/authority/dashboard', 'authority-residents': '/authority/residents',
  'authority-announcements': '/authority/announcements', 'profile': '/authority/profile', 'settings': '/authority/settings',
};

// Maps ngược để sync URL
const managementPathToTab = Object.fromEntries(Object.entries(managementTabToPath).map(([t, p]) => [p, t]));
const residentPathToTab = Object.fromEntries(Object.entries(residentTabToPath).map(([t, p]) => [p, t]));
const accountingPathToTab = Object.fromEntries(Object.entries(accountingTabToPath).map(([t, p]) => [p, t]));
const authorityPathToTab = Object.fromEntries(Object.entries(authorityTabToPath).map(([t, p]) => [p, t]));

// =================================================================
// LAYOUT CHUNG
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

// =================================================================
// APP CONTENT
// =================================================================
function AppContent() {
    const navigate = useNavigate(); 
    const [activeTab, setActiveTab] = useState('dashboard'); 
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState<UserRole>(null); 
    const [authPage, setAuthPage] = useState<AuthPage>('login');

    // 1. Khôi phục phiên đăng nhập khi F5
    useEffect(() => {
        const savedRole = localStorage.getItem('user_role');
        if (savedRole && ROLE_MAP[savedRole]) {
            setUserRole(ROLE_MAP[savedRole]);
            setIsAuthenticated(true);
        }
    }, []);

    const pushPathForTab = useCallback((tab: string, role: UserRole) => {
        let path: string | undefined;
        if (role === 'management') path = managementTabToPath[tab];
        else if (role === 'resident') path = residentTabToPath[tab];
        else if (role === 'accounting') path = accountingTabToPath[tab];
        else if (role === 'authority') path = authorityTabToPath[tab];
        
        if (path && path !== window.location.pathname) navigate(path); 
    }, [navigate]); 

    const handleSetActiveTab = useCallback((tab: string) => {
        setActiveTab(tab);
        pushPathForTab(tab, userRole);
    }, [userRole, pushPathForTab]);

    // 2. Xử lý Login từ dữ liệu API thực tế
    const handleLogin = (data: { role: string; accountId: string; personId: string }) => {
        const mappedRole = ROLE_MAP[data.role];
        if (!mappedRole) {
            toast.error("Vai trò người dùng không hợp lệ");
            return;
        }

        setUserRole(mappedRole);
        setIsAuthenticated(true);
        
        let initialPath = '';
        if (mappedRole === 'resident') initialPath = residentTabToPath['resident-dashboard'];
        else if (mappedRole === 'accounting') initialPath = accountingTabToPath['accounting-dashboard'];
        else if (mappedRole === 'authority') initialPath = authorityTabToPath['authority-dashboard'];
        else initialPath = managementTabToPath['dashboard'];

        navigate(initialPath, { replace: true });
    };

    const handleLogout = () => {
        localStorage.clear();
        setIsAuthenticated(false);
        setUserRole(null);
        navigate('/login'); 
    };

    // 3. Đồng bộ URL và Tab
    useEffect(() => {
        const path = window.location.pathname;
        if (!isAuthenticated) {
            if (path === '/signup') setAuthPage('signup');
            else if (path === '/forgot') setAuthPage('forgot');
            else if (path !== '/login') navigate('/login', { replace: true });
            return;
        }

        let tab = '';
        if (userRole === 'management') tab = managementPathToTab[path];
        else if (userRole === 'resident') tab = residentPathToTab[path];
        else if (userRole === 'accounting') tab = accountingPathToTab[path];
        else if (userRole === 'authority') tab = authorityPathToTab[path];
        
        if (tab) setActiveTab(tab);
    }, [isAuthenticated, userRole, navigate]);

    if (!isAuthenticated) {
        return <Login onLogin={handleLogin} onNavigateAuth={(p) => { setAuthPage(p); navigate('/' + p); }} />;
    }

    // 4. Cấu hình Sidebar/Header theo vai trò
    let sidebar, header, routes, baseUrl;

    if (userRole === 'management') {
        sidebar = <Sidebar activeTab={activeTab} setActiveTab={handleSetActiveTab} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onLogout={handleLogout} />;
        header = <Header onMenuClick={() => setIsSidebarOpen(true)} onLogout={handleLogout} />;
        routes = (
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
                <Route path="/extra-services" element={<ExtraServiceManagement />} />
                <Route path="/voluntary-contributions" element={<VoluntaryContribution />} />
            </>
        );
        baseUrl = '/management/*';
    } else if (userRole === 'resident') {
        sidebar = <ResidentSidebar activeTab={activeTab} setActiveTab={handleSetActiveTab} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onLogout={handleLogout} />;
        header = <ResidentHeader onMenuClick={() => setIsSidebarOpen(true)} onLogout={handleLogout} />;
        routes = (
            <>
                <Route path="/" element={<Navigate to="dashboard" replace />} />
                <Route path="/dashboard" element={<ResidentDashboard onNavigate={() => {}} />} />
                <Route path="/announcements" element={<ResidentAnnouncements />} />
                <Route path="/invoice" element={<ResidentBills />} />
                <Route path="/rules" element={<BuildingRules />} />
                <Route path="/profile" element={<ResidentProfile />} />
                <Route path="/settings" element={<ResidentSettings />} />
            </>
        );
        baseUrl = '/resident/*';
    } else if (userRole === 'accounting') {
        sidebar = <AccountingSidebar activeTab={activeTab} setActiveTab={handleSetActiveTab} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onLogout={handleLogout} />;
        header = <AccountingHeader onMenuClick={() => setIsSidebarOpen(true)} onNavigate={(p) => p === 'logout' ? handleLogout() : navigate(`/accounting/${p}`)} />;
        routes = (
            <>
                <Route path="/" element={<Navigate to="dashboard" replace />} />
                <Route path="/dashboard" element={<AccountingDashboard />} />
                <Route path="/debt" element={<DebtManagement />} />
                <Route path="/invoice" element={<InvoiceCreation />} />
                <Route path="/profile" element={<AccountingProfile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/voluntary-contribution" element={<AccountingVoluntaryContribution />} />
            </>
        );
        baseUrl = '/accounting/*';
    } else if (userRole === 'authority') {
        sidebar = <AuthoritySidebar activeTab={activeTab} setActiveTab={handleSetActiveTab} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onLogout={handleLogout} />;
        header = <AuthorityHeader onMenuClick={() => setIsSidebarOpen(true)} onLogout={handleLogout} />;
        routes = (
            <>
                <Route path="/" element={<Navigate to="dashboard" replace />} />
                <Route path="/dashboard" element={<AuthorityDashboard />} />
                <Route path="/residents" element={<AuthorityResidentManagement />} />
                <Route path="/announcements" element={<AuthorityAnnouncements />} />
                <Route path="/profile" element={<AuthorityProfile />} />
                <Route path="/settings" element={<Settings />} />
            </>
        );
        baseUrl = '/authority/*';
    }

    return (
        <Routes>
            <Route path={baseUrl} element={<MainLayout sidebar={sidebar!} header={header!} routes={routes!} />} />
            <Route path="/login" element={<Navigate to={`/${userRole}/dashboard`} replace />} />
            <Route path="/" element={<Navigate to={`/${userRole}/dashboard`} replace />} />
            <Route path="*" element={<div className="p-4 text-3xl text-red-600">404 Not Found</div>} />
        </Routes>
    );
}

export default function App() {
    return (
        <Router>
            <Toaster position="top-right" richColors />
            <AppContent />
        </Router>
    );
}
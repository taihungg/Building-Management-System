import { 
  LayoutDashboard, 
  Users,
  Bell,
  ChevronLeft,
  Settings,
  User,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

interface AuthoritySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => void;
}

const menuItems = [
  { to: '/authority-dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/authority-residents', label: 'Quản Lý Cư Dân', icon: Users },
  { to: '/authority-announcements', label: 'Thông Báo Mất Đồ', icon: Bell },
];

const bottomItems = [
  { to: '/settings', label: 'Cài Đặt', icon: Settings },
  { to: '/profile', label: 'Hồ Sơ', icon: User },
  { id: 'logout', label: 'Đăng Xuất', icon: LogOut }, 
];

const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all no-underline ${
    isActive
      ? 'bg-blue-600 text-white shadow-lg'
      : 'text-gray-700 hover:bg-gray-100'
  }`;

export function AuthoritySidebar({ isOpen, onClose, onLogout }: AuthoritySidebarProps) {
  const navigate = useNavigate();
  
  const handleLogoutClick = (id: string) => {
    if (id === 'logout') {
      onLogout?.();
      onClose();
      return;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40"
          />

          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r-2 border-gray-200 flex flex-col z-50"
          >
            <div className="p-6 border-b-2 border-gray-100 flex items-center justify-between">
              <h1 className="text-xl text-blue-600 font-bold">BuildingHub</h1>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <nav className="flex-1 p-4 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    className={getNavLinkClass}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            <div className="p-4 border-t-2 border-gray-100 space-y-1">
              {bottomItems.map((item) => {
                const Icon = item.icon;
                
                if (item.id === 'logout') {
                    return (
                        <button
                          key={item.id}
                          onClick={() => handleLogoutClick(item.id)}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-all"
                        >
                          <Icon className="w-5 h-5" />
                          <span className="text-sm font-medium">{item.label}</span>
                        </button>
                    );
                }

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    className={({ isActive }) => 
                        `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all no-underline ${
                            isActive
                                ? 'bg-blue-100 text-blue-700 font-medium'
                                : 'text-gray-700 hover:bg-gray-100'
                        }`
                    }
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}


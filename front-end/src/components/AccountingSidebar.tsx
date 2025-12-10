import React from 'react';
import { LayoutDashboard, ChevronLeft, Settings, User, LogOut, CreditCard, PlusCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation, useNavigate } from 'react-router-dom';

interface AccountingSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => void;
}

const menuItems = [
  { path: '/accounting-dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/debt-management', label: 'Quản Lý Công Nợ', icon: CreditCard },
  { path: '/invoice-creation', label: 'Tạo Hóa Đơn', icon: PlusCircle },
  { path: '/settings', label: 'Cài Đặt', icon: Settings },
];

const profileItem = { path: '/profile', label: 'Hồ Sơ', icon: User };

export function AccountingSidebar({ isOpen, onClose, onLogout }: AccountingSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
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
              <h1 className="text-xl text-cyan-500">BuildingHub</h1>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <nav className="flex-1 p-4 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigate(item.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive ? 'bg-cyan-500 text-white' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="p-4 border-t-2 border-gray-100 space-y-1">
              {(() => {
                const ProfileIcon = profileItem.icon;
                return (
                  <button
                    onClick={() => handleNavigate(profileItem.path)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-all"
                  >
                    <ProfileIcon className="w-5 h-5" />
                    <span className="text-sm">{profileItem.label}</span>
                  </button>
                );
              })()}
              <button
                onClick={() => {
                  onLogout?.();
                  onClose();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm">Đăng Xuất</span>
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}


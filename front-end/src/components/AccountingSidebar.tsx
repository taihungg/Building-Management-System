import React from 'react';
import { LayoutDashboard, ChevronLeft, Settings, User, LogOut, CreditCard, PlusCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AccountingSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => void;
}

const menuItems = [
  { id: 'accounting-dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'debt-management', label: 'Quản Lý Công Nợ', icon: CreditCard },
  { id: 'invoice-creation', label: 'Tạo Hóa Đơn', icon: PlusCircle },
];

const bottomItems = [
  { id: 'settings', label: 'Cài Đặt', icon: Settings },
  { id: 'profile', label: 'Hồ Sơ', icon: User },
  { id: 'logout', label: 'Đăng Xuất', icon: LogOut },
];

export function AccountingSidebar({ activeTab, setActiveTab, isOpen, onClose, onLogout }: AccountingSidebarProps) {
  const handleItemClick = (id: string) => {
    if (id === 'logout') {
      onLogout?.();
      onClose();
      return;
    }
    setActiveTab(id);
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
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
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
              {bottomItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-all"
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}


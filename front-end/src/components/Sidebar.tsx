import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Receipt, 
  Wrench, 
  Bell, 
  Lightbulb,
  ChevronLeft,
  Settings,
  User,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
// 1. Import NavLink và useNavigate
import { NavLink, useNavigate } from 'react-router-dom';
import React from 'react'

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => void;
}

// 2. Thêm trường 'path' vào menuItems
const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'residents', label: 'Residents', icon: Users, path: '/residents' },
  { id: 'apartments', label: 'Apartments', icon: Building2, path: '/apartments' },
  { id: 'bills', label: 'Bills', icon: Receipt, path: '/bills' },
  { id: 'services', label: 'Services', icon: Wrench, path: '/services' },
  { id: 'notifications', label: 'Notifications', icon: Bell, path: '/notifications' },
  { id: 'recommendations', label: 'Recommendations', icon: Lightbulb, path: '/recommendations' },
];

const bottomItems = [
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
  // Logout xử lý riêng
  { id: 'logout', label: 'Logout', icon: LogOut, path: null }, 
];

export function Sidebar({ isOpen, onClose, onLogout }: SidebarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout?.();
    navigate('/');
  };

  return (
    <>
      {/* LƯU Ý QUAN TRỌNG: 
         Nếu muốn Sidebar luôn hiện trên Desktop và chỉ ẩn trên Mobile, 
         bạn cần chỉnh sửa logic CSS (hidden md:flex...) và bỏ AnimatePresence bao quanh trên Desktop.
         
         Tuy nhiên, dựa trên code gốc của bạn (dạng Drawer/Overlay), 
         mình giữ nguyên logic AnimatePresence để nó trượt ra/vào.
      */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop (Nền tối) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black z-40"
            />

            {/* Sidebar Container */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r-2 border-gray-200 flex flex-col z-50 shadow-2xl"
            >
              {/* Header */}
              <div className="p-6 border-b-2 border-gray-100 flex items-center justify-between">
                <h1 className="text-xl font-bold text-cyan-600">BuildingHub</h1>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Menu Items */}
              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  
                  return (
                    <NavLink
                      key={item.id}
                      to={item.path}
                      onClick={onClose} // Đóng sidebar khi click chọn menu (trải nghiệm tốt trên mobile)
                      className={({ isActive }) => `
                        w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium
                        ${isActive 
                          ? 'bg-cyan-500 text-white shadow-md shadow-cyan-200' // Style khi Active
                          : 'text-gray-600 hover:bg-gray-50 hover:text-cyan-600' // Style bình thường
                        }
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm">{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>

              {/* Bottom Items */}
              <div className="p-4 border-t-2 border-gray-100 space-y-1">
                {bottomItems.map((item) => {
                  const Icon = item.icon;
                  
                  // Xử lý riêng cho Logout (Dùng button)
                  if (item.id === 'logout') {
                    return (
                      <button
                        key={item.id}
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-medium"
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-sm">{item.label}</span>
                      </button>
                    );
                  }

                  // Các item khác (Settings, Profile) dùng NavLink
                  return (
                    <NavLink
                      key={item.id}
                      to={item.path || '#'}
                      onClick={onClose}
                      className={({ isActive }) => `
                        w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium
                        ${isActive 
                          ? 'bg-gray-100 text-cyan-600' 
                          : 'text-gray-600 hover:bg-gray-50'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm">{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
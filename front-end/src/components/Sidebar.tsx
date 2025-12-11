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
// Sửa lỗi: Import đúng từ 'framer-motion'
import { motion, AnimatePresence } from 'framer-motion'; 
// 1. Import NavLink và useNavigate
import { NavLink, useNavigate } from 'react-router-dom';
import React from 'react'

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void; // Thêm prop onLogout để tách biệt logic
}

// 2. Thêm tiền tố /admin vào tất cả các path (Nếu Sidebar này là của Admin)
const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
  { id: 'residents', label: 'Residents', icon: Users, path: '/admin/residents' },
  { id: 'apartments', label: 'Apartments', icon: Building2, path: '/admin/apartments' },
  { id: 'bills', label: 'Bills', icon: Receipt, path: '/admin/bills' },
  { id: 'services', label: 'Services', icon: Wrench, path: '/admin/services' },
  { id: 'notifications', label: 'Notifications', icon: Bell, path: '/admin/notifications' },
  { id: 'recommendations', label: 'Recommendations', icon: Lightbulb, path: '/admin/recommendations' },
];

const bottomItems = [
  { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' },
  { id: 'profile', label: 'Profile', icon: User, path: '/admin/profile' },
  { id: 'logout', label: 'Logout', icon: LogOut, path: null }, 
];

// Hàm này không cần logic logout, chỉ cần gọi prop được truyền từ AppContent
export function Sidebar({ isOpen, onClose, onLogout }: SidebarProps) {
  // Không cần useNavigate ở đây vì đã dùng NavLink và onLogout được truyền từ ngoài
  
  return (
    <>
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
                      onClick={onClose} 
                      className={({ isActive }) => `
                        w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium
                        ${isActive 
                          ? 'bg-cyan-500 text-white shadow-md shadow-cyan-200'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-cyan-600'
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
                  
                  if (item.id === 'logout') {
                    return (
                      <button
                        key={item.id}
                        onClick={onLogout} // Gọi prop onLogout được truyền từ AppContent
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-medium"
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-sm">{item.label}</span>
                      </button>
                    );
                  }

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
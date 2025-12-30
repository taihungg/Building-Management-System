import { LayoutDashboard, ChevronLeft, Settings, User, LogOut, CreditCard, PlusCircle, Heart, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';
// Import NavLink
import { NavLink } from 'react-router-dom';

interface AccountingSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void; // Thay đổi onLogout? thành onLogout bắt buộc (vì bạn cần xử lý logout)
}

// 🛠️ ĐÃ SỬA: Thêm đường dẫn tuyệt đối /accounting/path
const menuItems = [
  { id: 'accounting-dashboard', label: 'Tổng quan tài chính', icon: LayoutDashboard, path: '/accounting/dashboard' },
  { id: 'debt-management', label: 'Quản lý hóa đơn', icon: CreditCard, path: '/accounting/debt' },
  { id: 'invoice-creation', label: 'Dữ liệu sử dụng', icon: PlusCircle, path: '/accounting/invoice' },
  { id: 'extra-services', label: 'Dịch vụ phát sinh', icon: Lightbulb, path: '/accounting/extra-services' },
  {id:'accounting-voluntary-contribution', label: 'Quỹ đóng góp tự nguyện', icon: Heart, path:'/accounting/voluntary-contribution' }
];

const bottomItems = [
  { id: 'profile', label: 'Hồ sơ', icon: User, path: '/accounting/profile' },
  { id: 'settings', label: 'Cài đặt', icon: Settings, path: '/accounting/settings' },
  { id: 'logout', label: 'Đăng xuất', icon: LogOut, path: null },
];

export function AccountingSidebar({ isOpen, onClose, onLogout }: AccountingSidebarProps) {

  const handleLogoutClick = () => {
    onLogout();
    onClose();
  };

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  `w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all no-underline ${
    isActive 
      ? 'bg-cyan-500 text-white shadow-md' 
      : 'text-gray-700 hover:bg-gray-100'
  }`;

  const getBottomNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all no-underline ${
        isActive
          ? 'bg-cyan-100 text-cyan-700 font-medium'
          : 'text-gray-700 hover:bg-gray-100'
    }`;
    
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Lớp phủ (Overlay) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40"
          />

          {/* Sidebar chính */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.2 }}
            className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r-2 border-gray-200 flex flex-col z-50 shadow-xl"
          >
            {/* Header và nút đóng */}
            <div className="p-6 border-b-2 border-gray-100 flex items-center justify-between">
              <h1 className="text-xl font-semibold text-cyan-600">BuildingHub</h1>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Đóng Sidebar"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Menu chính */}
            <nav className="flex-1 p-4 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    onClick={onClose} // Đóng sidebar sau khi click
                    className={getNavLinkClass}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* Menu dưới (Settings, Profile, Logout) */}
            <div className="p-4 border-t-2 border-gray-100 space-y-1">
              {bottomItems.map((item) => {
                const Icon = item.icon;

                if (item.id === 'logout') {
                    return (
                        <button
                            key={item.id}
                            onClick={handleLogoutClick}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-gray-700 hover:bg-gray-100`}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="text-sm">{item.label}</span>
                        </button>
                    );
                }

                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    onClick={onClose}
                    className={getBottomNavLinkClass}
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
  );
}
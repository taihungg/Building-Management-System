import { 
  LayoutDashboard, 
  Users,
  Bell,
  ChevronLeft,
  Settings,
  User,
  LogOut,
  LucideIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, useNavigate } from 'react-router-dom';
import React from 'react';

// --- Định nghĩa Kiểu Dữ Liệu ---

interface MenuItem {
  to?: string; 
  id?: string; 
  label: string;
  icon: LucideIcon;
}

interface AuthoritySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => void;
}

// --- Dữ Liệu Menu (Đã dùng Đường dẫn Tuyệt đối) ---

const menuItems: MenuItem[] = [
  { to: '/authority/dashboard', label: 'An ninh và cư trú', icon: LayoutDashboard },
  { to: '/authority/residents', label: 'Quản lý cư dân', icon: Users },
  { to: '/authority/announcements', label: 'Thông báo mất đồ', icon: Bell },
];

const bottomItems: MenuItem[] = [
  { to: '/authority/settings', label: 'Cài đặt', icon: Settings },
  { to: '/authority/profile', label: 'Hồ sơ', icon: User },
  { id: 'logout', label: 'Đăng xuất', icon: LogOut }, 
];

// --- Hàm Tiện Ích: Định nghĩa Class cho NavLink ---

const getTopNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all no-underline text-sm font-medium ${
    isActive
      ? 'bg-blue-600 text-white shadow-lg'
      : 'text-gray-700 hover:bg-gray-100'
  }`;

const getBottomNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all no-underline text-sm ${
        isActive
            ? 'bg-blue-100 text-blue-700 font-medium'
            : 'text-gray-700 hover:bg-gray-100 font-normal'
    }`;

// --- Component Chính (Sử dụng Named Export) ---

export function AuthoritySidebar({ isOpen, onClose, onLogout }: AuthoritySidebarProps) {
  // Đổi từ function component không export thành named export function component

  const handleItemClick = (item: MenuItem) => {
    onClose();
    if (item.id === 'logout') {
      onLogout?.();
    }
  };

  const renderMenuItem = (item: MenuItem, isBottom: boolean = false) => {
    const Icon = item.icon;
    const isLogout = item.id === 'logout';

    // 1. Dùng button cho mục Đăng Xuất
    if (isLogout) {
      return (
        <button
          key={item.id}
          onClick={() => handleItemClick(item)}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-all text-sm font-medium"
        >
          <Icon className="w-5 h-5" />
          <span>{item.label}</span>
        </button>
      );
    }
    
    // 2. Dùng NavLink cho các mục điều hướng
    return (
      <NavLink
        key={item.to}
        to={item.to!} 
        onClick={onClose} 
        className={isBottom ? getBottomNavLinkClass : getTopNavLinkClass}
      >
        <Icon className="w-5 h-5" />
        <span>{item.label}</span>
      </NavLink>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop (Lớp phủ nền) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40"
          />

          {/* Sidebar */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r-2 border-gray-200 flex flex-col z-50 shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h1 className="text-xl text-blue-600 font-extrabold tracking-tight">BuildingHub</h1>
              <button 
                onClick={onClose}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Đóng Menu"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            </div>

            {/* Menu chính */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {menuItems.map((item) => renderMenuItem(item))}
            </nav>

            {/* Menu dưới/Cài đặt */}
            <div className="p-4 border-t border-gray-100 space-y-1">
              {bottomItems.map((item) => renderMenuItem(item, true))}
            </div>
            
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// Xóa export default. Thay vào đó, chúng ta export trực tiếp ở function definition.
import { 
  LayoutDashboard, 
  Bell, 
  Receipt, 
  FileText,
  ChevronLeft,
  Settings,
  User,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; 
import React from 'react';
import { NavLink } from 'react-router-dom'; // Chỉ cần NavLink

interface ResidentSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void; // Bắt buộc phải truyền prop này từ App.tsx
}

// 🛠️ ĐÃ SỬA: Thay đổi 'to' để khớp với cấu trúc /resident/path trong App.tsx
const menuItems = [
  { to: '/resident/dashboard', label: 'Quản lý căn hộ', icon: LayoutDashboard },
  { to: '/resident/announcements', label: 'Thông báo', icon: Bell },
  // Dùng '/invoice' vì trong App.tsx Route là /invoice
  { to: '/resident/invoice', label: 'Hóa đơn', icon: Receipt }, 
  { to: '/resident/rules', label: 'Nội quy', icon: FileText },
];

const bottomItems = [
  { to: '/resident/settings', label: 'Cài đặt', icon: Settings },
  { to: '/resident/profile', label: 'Hồ sơ', icon: User },
  // Mục logout không cần NavLink
  { id: 'logout', label: 'Đăng xuất', icon: LogOut }, 
];

// Hàm cấu hình NavLink class
const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all no-underline ${
    isActive
      ? 'bg-cyan-500 text-white shadow-lg'
      : 'text-gray-700 hover:bg-gray-100'
  }`;

export function ResidentSidebar({ isOpen, onClose, onLogout }: ResidentSidebarProps) {
  // Loại bỏ useNavigate vì logic logout đã được xử lý bằng onLogout prop
  
  // Logic xử lý Đăng Xuất (chỉ gọi prop onLogout được truyền vào)
  const handleLogoutClick = (id: string) => {
    if (id === 'logout') {
      onLogout(); // Gọi hàm logout từ AppContent
      onClose(); // Đóng sidebar
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
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
            className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r-2 border-gray-200 flex flex-col z-50"
          >
            {/* Header */}
            <div className="p-6 border-b-2 border-gray-100 flex items-center justify-between">
              <h1 className="text-xl text-cyan-500 font-bold">BuildingHub</h1>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Menu Items (Dùng NavLink) */}
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

            {/* Bottom Items (Dùng NavLink và Button) */}
            <div className="p-4 border-t-2 border-gray-100 space-y-1">
              {bottomItems.map((item) => {
                const Icon = item.icon;
                
                if (item.id === 'logout') {
                    // Xử lý nút Đăng Xuất bằng Button
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

                // Các mục khác dùng NavLink
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onClose} 
                    className={({ isActive }) => 
                        `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all no-underline ${
                            isActive
                                ? 'bg-indigo-100 text-indigo-700 font-medium'
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
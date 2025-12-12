import { Menu, Search, Bell, Clock } from 'lucide-react'; // Import icon Clock
import { useState, useRef, useEffect } from 'react';

interface HeaderProps {
  onMenuClick: () => void;
  onNavigate: (page: string) => void;
}

// Hàm tiện ích để định dạng thời gian
const formatTime = (date: Date) => {
    // Định dạng giờ:phút:giây và Ngày, Tháng, Năm
    const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
    
    const timeStr = date.toLocaleTimeString('vi-VN', timeOptions);
    const dateStr = date.toLocaleDateString('vi-VN', dateOptions);

    return { timeStr, dateStr };
};

export function Header({ onMenuClick, onNavigate }: HeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(formatTime(new Date())); // State mới cho thời gian
  const profileRef = useRef<HTMLDivElement>(null);

  // --- Logic Click Outside và Đồng hồ Thời gian ---

  useEffect(() => {
    // 1. Logic Click Outside
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    // 2. Logic Đồng hồ Thời gian Thực
    const timerId = setInterval(() => {
      setCurrentTime(formatTime(new Date()));
    }, 1000); // Cập nhật mỗi giây

    // Cleanup function
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      clearInterval(timerId); // Xóa interval khi component unmount
    };
  }, []);

  const handleProfileItemClick = (page: string) => {
    setIsProfileOpen(false);
    onNavigate(page);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b-2 border-gray-100 z-30">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left: Menu Button & Building Name */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          
          <button 
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">B</span>
            </div>
            <div className="text-left">
              <h1 className="text-xl text-gray-900 font-bold">BuildingHub</h1>
              <p className="text-xs text-gray-600">Management Portal</p>
            </div>
          </button>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-2xl mx-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm cư dân, căn hộ, hóa đơn..." // Dịch placeholder cho trực quan
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-gray-700 text-sm"
            />
          </div>
        </div>

        {/* Right: Real-time Clock, Notification & Profile */}
        <div className="flex items-center gap-6"> 
        
          {/* Real-time Clock */}
          <div className="hidden sm:flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
             <Clock className="w-5 h-5 text-cyan-600" />
             <div className="text-sm">
                <p className="font-semibold text-gray-800">{currentTime.timeStr}</p>
                <p className="text-xs text-gray-500">{currentTime.dateStr}</p>
             </div>
          </div>
        
          {/* Notification Bell */}
          <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-6 h-6 text-gray-700" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Profile Avatar with Dropdown */}
          <div className="relative" ref={profileRef}>
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-white hover:bg-cyan-600 transition-colors"
            >
              <span className="text-sm font-medium">AD</span>
            </button>

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden z-50"> {/* Tăng z-index */}
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">My Account</h3>
                  <p className="text-sm text-gray-500">administrator@hub.vn</p>
                </div>
                <div className="py-1">
                  <button 
                    onClick={() => handleProfileItemClick('profile')}
                    className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                  >
                    Hồ sơ
                  </button>
                  <button 
                    onClick={() => handleProfileItemClick('settings')}
                    className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                  >
                    Cài đặt
                  </button>
                </div>
                <div className="border-t border-gray-100">
                  <button 
                    onClick={() => handleProfileItemClick('logout')}
                    className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors font-medium"
                  >
                    Đăng Xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
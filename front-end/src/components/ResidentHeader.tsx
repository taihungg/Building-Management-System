import { Menu, Search, Clock } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { getCurrentPeriod } from '../utils/timeUtils';

// Hàm tiện ích để định dạng thời gian và ngày tháng
const formatTimeAndDate = (date: Date) => {
  // Định dạng giờ:phút:giây và Ngày, Tháng, Năm
  const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
  
  const timeStr = date.toLocaleTimeString('vi-VN', timeOptions);
  const dateStr = date.toLocaleDateString('vi-VN', dateOptions);

  return { timeStr, dateStr };
};

interface ResidentHeaderProps {
  onMenuClick: () => void;
  onNavigate: (page: string) => void;
}

export function ResidentHeader({ onMenuClick, onNavigate }: ResidentHeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(formatTimeAndDate(new Date()));
  const profileRef = useRef<HTMLDivElement>(null);
  const currentPeriod = getCurrentPeriod();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    // Real-time Clock (Cập nhật mỗi giây)
    const timerId = setInterval(() => {
      setCurrentTime(formatTimeAndDate(new Date()));
    }, 1000);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      clearInterval(timerId);
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
            onClick={() => onNavigate('resident-dashboard')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">B</span>
            </div>
            <div className="text-left">
              <h1 className="text-xl text-gray-900">BuildingHub</h1>
              <p className="text-xs text-gray-600">Cổng Thông Tin Cư Dân</p>
            </div>
          </button>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-2xl mx-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm thông báo, hóa đơn..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-gray-700 text-sm"
            />
          </div>
        </div>

        {/* Right: Clock & Profile */}
        <div className="flex items-center gap-4">
          {/* Real-time Clock Display */}
          <div className="hidden sm:flex items-center gap-3 bg-slate-100 px-6 py-2 rounded-full">
            <Clock className="w-4 h-4 text-gray-600 flex-shrink-0" />
            <div className="flex items-center gap-2">
              <span className="font-mono font-semibold text-gray-800">
                {currentTime.timeStr}
              </span>
              <span className="text-gray-400">|</span>
              <span className="text-sm text-gray-600">
                {currentPeriod} ({currentTime.dateStr})
              </span>
            </div>
          </div>

          {/* Profile Avatar with Dropdown */}
          <div className="relative" ref={profileRef}>
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-white hover:bg-cyan-600 transition-colors"
            >
              <span className="text-sm">CD</span>
            </button>

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden">
                <div className="p-6 border-b-2 border-gray-100">
                  <h3 className="text-xl text-gray-900">Tài Khoản Của Tôi</h3>
                </div>
                <div className="py-2">
                  <button 
                    onClick={() => handleProfileItemClick('profile')}
                    className="w-full px-6 py-4 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Hồ Sơ
                  </button>
                  <button 
                    onClick={() => handleProfileItemClick('settings')}
                    className="w-full px-6 py-4 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cài Đặt
                  </button>
                </div>
                <div className="border-t-2 border-gray-100">
                  <button 
                    onClick={() => handleProfileItemClick('logout')}
                    className="w-full px-6 py-4 text-left text-gray-700 hover:bg-gray-50 transition-colors"
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




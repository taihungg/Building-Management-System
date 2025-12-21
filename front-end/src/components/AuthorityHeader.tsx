import React, { useState, useRef, useEffect } from 'react';
import { Menu, Search, Clock, LogOut, User, Settings } from 'lucide-react'; // Import Clock icon
import { useNavigate } from 'react-router-dom';
import { getCurrentPeriod } from '../utils/timeUtils';

interface AuthorityHeaderProps {
  onMenuClick: () => void;
  onLogout?: () => void;
}

// Hàm tiện ích để định dạng thời gian và ngày tháng
const formatTimeAndDate = (date: Date) => {
    // Định dạng giờ:phút:giây và Ngày, Tháng, Năm
    const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
    
    const timeStr = date.toLocaleTimeString('vi-VN', timeOptions);
    const dateStr = date.toLocaleDateString('vi-VN', dateOptions);

    return { timeStr, dateStr };
};

export function AuthorityHeader({ onMenuClick, onLogout }: AuthorityHeaderProps) {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(formatTimeAndDate(new Date())); // State mới cho thời gian
  const profileRef = useRef<HTMLDivElement>(null);
  const currentPeriod = getCurrentPeriod();

  useEffect(() => {
    // 1. Logic Click Outside
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    // 2. Logic Đồng hồ Thời gian Thực (Cập nhật mỗi giây)
    const timerId = setInterval(() => {
        setCurrentTime(formatTimeAndDate(new Date()));
    }, 1000);

    // Cleanup function
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      clearInterval(timerId);
    };
  }, []);

  const handleProfileItemClick = (page: string) => {
    setIsProfileOpen(false);
    if (page === 'logout') {
      onLogout?.();
    } else {
      // Điều hướng đến đường dẫn đầy đủ của cơ quan chức năng
      navigate(`/authority/${page}`); 
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b-2 border-gray-100 z-30">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left: Menu Button & Building Name */}
        <div className="flex items-center gap-4">
          <button onClick={onMenuClick} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          
          <button 
            onClick={() => navigate('/authority/dashboard')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">B</span>
            </div>
            <div className="text-left">
              <h1 className="text-xl text-gray-900 font-semibold">BuildingHub</h1>
              <p className="text-xs text-gray-600">Quản lý Cư trú và an ninh</p>
            </div>
          </button>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-2xl mx-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm cư dân, thông báo..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 text-sm"
            />
          </div>
        </div>

        {/* Right: Real-time Clock & Profile */}
        <div className="flex items-center gap-6"> 
            
            {/* Real-time Clock Display (match accounting header style) */}
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
                className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold transition-transform hover:scale-105"
              >
                <span className="text-sm font-semibold">CQ</span>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden z-50">
                  {/* Cải thiện hiển thị dropdown */}
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">Tài Khoản Cơ Quan</h3>
                    <p className="text-sm text-gray-500">authority@hub.vn</p>
                  </div>
                  <div className="py-1">
                    <button 
                      onClick={() => handleProfileItemClick('profile')}
                      className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <User className="w-4 h-4 text-gray-500"/> Hồ Sơ
                    </button>
                    <button 
                      onClick={() => handleProfileItemClick('settings')}
                      className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4 text-gray-500"/> Cài Đặt
                    </button>
                  </div>
                  <div className="border-t border-gray-100">
                    <button 
                      onClick={() => handleProfileItemClick('logout')}
                      className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors font-medium flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4 text-red-600"/> Đăng Xuất
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
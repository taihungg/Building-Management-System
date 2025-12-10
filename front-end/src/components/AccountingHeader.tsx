import React from 'react';
import { Menu, Search } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { getCurrentPeriod } from '../utils/timeUtils';
import { useRealtime } from '../hooks/useRealtime';

interface AccountingHeaderProps {
  onMenuClick: () => void;
  onNavigate: (page: string) => void;
}

export function AccountingHeader({ onMenuClick, onNavigate }: AccountingHeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const currentTime = useRealtime(1000);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfileItemClick = (page: string) => {
    setIsProfileOpen(false);
    onNavigate(page);
  };

  const currentPeriod = getCurrentPeriod();
  const formattedTime = currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b-2 border-gray-100 z-30">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <button onClick={onMenuClick} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          
          <button 
            onClick={() => onNavigate('accounting-dashboard')}
            className="flex items-center gap-3 hover:opacity-85 transition-opacity"
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm" style={{ backgroundImage: 'linear-gradient(135deg, #22d3ee 0%, #2563eb 100%)' }}>
              <span className="text-white text-xl font-bold">B</span>
            </div>
            <div className="text-left">
              <h1 className="text-xl font-semibold text-gray-900">BuildingHub</h1>
              <p className="text-xs text-gray-600">Phòng Kế Toán</p>
            </div>
          </button>
        </div>

        <div className="flex-1 max-w-2xl mx-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm hóa đơn, báo cáo..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:border-[#0EA5E9] text-gray-700 text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-xs text-gray-500">Kỳ hiện tại</p>
            <p className="text-sm font-medium text-gray-900">{currentPeriod}</p>
            <p className="text-xs text-gray-400">{formattedTime}</p>
          </div>

          <div className="relative" ref={profileRef}>
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold shadow-sm transition-transform hover:scale-105"
              style={{ backgroundImage: 'linear-gradient(135deg, #22d3ee 0%, #2563eb 100%)' }}
            >
              <span className="text-sm font-semibold">KT</span>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden">
                <div className="p-6 border-b-2 border-gray-100">
                  <h3 className="text-xl text-gray-900">Tài Khoản Kế Toán</h3>
                </div>
                <div className="py-2">
                  <button onClick={() => handleProfileItemClick('profile')} className="w-full px-6 py-4 text-left text-gray-700 hover:bg-gray-50 transition-colors">Hồ Sơ</button>
                  <button onClick={() => handleProfileItemClick('settings')} className="w-full px-6 py-4 text-left text-gray-700 hover:bg-gray-50 transition-colors">Cài Đặt</button>
                </div>
                <div className="border-t-2 border-gray-100">
                  <button onClick={() => handleProfileItemClick('logout')} className="w-full px-6 py-4 text-left text-gray-700 hover:bg-gray-50 transition-colors">Đăng Xuất</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}


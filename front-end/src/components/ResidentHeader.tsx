import { Menu, Search, Clock, Bell, Wrench, Wallet, Info, AlertCircle, MoreVertical, MessageCircle, Users, Calendar, LayoutGrid } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentPeriod } from '../utils/timeUtils';
import { getAnnouncements, getUnreadCount, subscribe, markAsRead, markAllAsRead, type Announcement } from '../utils/announcements';
import { formatRelativeTime } from '../utils/timeUtils';

// Icon mapping for notification types
const getNotificationTypeIcon = (announcement: Announcement) => {
  const title = announcement.title.toLowerCase();
  
  // Meetings/Events (Lịch họp, Họp) - Check FIRST to avoid conflicts
  if (title.includes('lịch họp') || title.includes('họp cư dân') || title.includes('cuộc họp')) {
    return { Icon: Calendar, bgClass: 'bg-purple-50', textClass: 'text-purple-600' };
  }
  
  // Maintenance/Technical (Bảo trì, Hệ thống)
  if (title.includes('bảo trì') || title.includes('maintenance') || title.includes('hoàn thành bảo trì')) {
    return { Icon: Wrench, bgClass: 'bg-blue-50', textClass: 'text-blue-600' };
  }
  
  // Financial (Thu phí, Hóa đơn, Thanh toán)
  if (title.includes('thu phí') || title.includes('hóa đơn') || (title.includes('phí dịch vụ') && !title.includes('nội quy')) || title.includes('thanh toán') || title.includes('payment')) {
    return { Icon: Wallet, bgClass: 'bg-emerald-50', textClass: 'text-emerald-600' };
  }
  
  // Utilities/Services (Tiện ích, Dịch vụ tiện ích)
  if (title.includes('tiện ích') || title.includes('dịch vụ tiện ích') || title.includes('khu tiện ích')) {
    return { Icon: LayoutGrid, bgClass: 'bg-indigo-50', textClass: 'text-indigo-600' };
  }
  
  // Rules/Regulations (Nội quy, Quy định)
  if (title.includes('nội quy') || title.includes('quy định') || title.includes('rules')) {
    return { Icon: Info, bgClass: 'bg-orange-50', textClass: 'text-orange-600' };
  }
  
  // Default
  return { Icon: AlertCircle, bgClass: 'bg-blue-50', textClass: 'text-blue-600' };
};

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
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState<'all' | 'unread'>('all');
  const [currentTime, setCurrentTime] = useState(formatTimeAndDate(new Date()));
  const [announcements, setAnnouncements] = useState<Announcement[]>(getAnnouncements());
  const [unreadCount, setUnreadCount] = useState(getUnreadCount());
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const currentPeriod = getCurrentPeriod();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    // Real-time Clock (Cập nhật mỗi giây)
    const timerId = setInterval(() => {
      setCurrentTime(formatTimeAndDate(new Date()));
    }, 1000);

    // Subscribe to announcements
    const unsubscribeAnnouncements = subscribe((updatedAnnouncements) => {
      setAnnouncements(updatedAnnouncements);
      setUnreadCount(getUnreadCount());
    });

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      clearInterval(timerId);
      unsubscribeAnnouncements();
    };
  }, []);

  // Filter and format announcements
  const filteredAnnouncements = announcements
    .filter(ann => notificationFilter === 'all' || !ann.read)
    .slice(0, 10)
    .map(ann => ({
      ...ann,
      displayTime: ann.createdAt ? formatRelativeTime(ann.createdAt) : ann.time
    }));

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

        {/* Right: Clock, Notification & Profile */}
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

          {/* Notification Bell */}
          <div className="relative" ref={notificationRef}>
            <button 
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative p-2 hover:text-blue-500 text-gray-500 transition-colors rounded-lg hover:bg-gray-50"
            >
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>

            {/* Notification Dropdown - Facebook Style */}
            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-[480px] bg-white rounded-2xl shadow-2xl border border-gray-100 z-[999] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-4">
                  <h3 className="text-2xl font-bold text-gray-900">Thông báo</h3>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 px-4 pb-3">
                  <button
                    onClick={() => setNotificationFilter('all')}
                    className={`px-4 py-1.5 rounded-full text-[15px] font-medium transition-colors ${
                      notificationFilter === 'all'
                        ? 'bg-blue-100 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Tất cả
                  </button>
                  <button
                    onClick={() => setNotificationFilter('unread')}
                    className={`px-4 py-1.5 rounded-full text-[15px] font-medium transition-colors ${
                      notificationFilter === 'unread'
                        ? 'bg-blue-100 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Chưa đọc
                  </button>
                </div>

                {/* Notification List - Scrollable */}
                <div className="min-h-[300px] max-h-[500px] overflow-y-auto">
                  {filteredAnnouncements.length === 0 ? (
                    <div className="px-4 py-8 text-center text-gray-500">
                      <p className="text-sm">Không có thông báo</p>
                    </div>
                  ) : (
                    filteredAnnouncements.map((announcement) => {
                      const { Icon, bgClass, textClass } = getNotificationTypeIcon(announcement);
                      
                      return (
                        <button
                          key={announcement.id}
                          onClick={() => {
                            if (!announcement.read) {
                              markAsRead(announcement.id);
                            }
                            setIsNotificationOpen(false);
                            onNavigate('resident-announcements');
                          }}
                          className="w-full flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          {/* Left: Icon - Fixed size to ensure alignment */}
                          <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
                            <div className={`w-10 h-10 rounded-full ${bgClass} ${textClass} flex items-center justify-center`}>
                              <Icon className="w-5 h-5" />
                            </div>
                          </div>

                          {/* Right: Text Content (Title + Time stacked) - Aligned start */}
                          <div className="flex-1 flex flex-col min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-[14.5px] font-semibold text-gray-800 truncate flex-1 text-left">
                                {announcement.title}
                              </h4>
                              {!announcement.read && (
                                <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-gray-400 mt-1 text-left">
                              {announcement.displayTime}
                            </p>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Footer - Xem tất cả Button */}
                <button
                  onClick={() => {
                    setIsNotificationOpen(false);
                    if (onNavigate) {
                      onNavigate('resident-announcements');
                    }
                  }}
                  className="w-full py-3 text-center text-sm font-bold text-blue-600 bg-gray-50/50 hover:bg-gray-100 transition-all block no-underline"
                >
                  Xem tất cả
                </button>
              </div>
            )}
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
                    className="w-full px-6 py-4 text-left text-red-600 hover:bg-red-50 transition-colors"
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




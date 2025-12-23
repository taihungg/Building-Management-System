import { Bell, AlertCircle, Info, CheckCircle, Calendar, FileText, X, AlertTriangle, Wallet, Megaphone } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { getAnnouncements, markAsRead, markAllAsRead, getUnreadCount, subscribe, type Announcement } from '../utils/announcements';
import { formatRelativeTime, formatDate } from '../utils/timeUtils';
import { useRealtime } from '../hooks/useRealtime';

// Icon mapping function to match summary cards
const getNotificationIcon = (announcement: Announcement) => {
  const title = announcement.title.toLowerCase();
  
  // Urgent/Technical (bảo trì, hệ thống) - Red AlertTriangle (matches "Tin khẩn cấp" card)
  if (announcement.type === 'alert' || title.includes('bảo trì') || title.includes('hệ thống') || title.includes('maintenance')) {
    return { 
      Icon: AlertTriangle, 
      bgClass: 'bg-red-100', 
      textClass: 'text-red-600' 
    };
  }
  
  // Financial (thu phí, hóa đơn, thanh toán) - Green Wallet (matches "Tiền phí & Hóa đơn" card)
  if (title.includes('thu phí') || title.includes('hóa đơn') || title.includes('phí dịch vụ') || title.includes('thanh toán') || title.includes('payment')) {
    return { 
      Icon: Wallet, 
      bgClass: 'bg-emerald-100', 
      textClass: 'text-emerald-600' 
    };
  }
  
  // General/Rules (nội quy, quy định, lịch họp) - Blue Megaphone (matches "Tin tức chung" card)
  if (title.includes('nội quy') || title.includes('quy định') || title.includes('lịch họp') || title.includes('họp cư dân') || announcement.type === 'info') {
    return { 
      Icon: Megaphone, 
      bgClass: 'bg-blue-100', 
      textClass: 'text-blue-600' 
    };
  }
  
  // Success/Completion - Blue Megaphone (default for general news)
  return { 
    Icon: Megaphone, 
    bgClass: 'bg-blue-100', 
    textClass: 'text-blue-600' 
  };
};

export function ResidentAnnouncements() {
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [announcements, setAnnouncements] = useState<Announcement[]>(getAnnouncements());
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [unreadCount, setUnreadCount] = useState(getUnreadCount());
  const currentTime = useRealtime(60000); // Update every minute for real-time time display

  useEffect(() => {
    const unsubscribe = subscribe((updatedAnnouncements) => {
      setAnnouncements(updatedAnnouncements);
      setUnreadCount(getUnreadCount());
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Memoize filtered announcements with real-time time formatting
  const filteredAnnouncements = useMemo(() => {
    return announcements
      .filter(announcement => {
        if (filter === 'unread') return !announcement.read;
        if (filter === 'read') return announcement.read;
        return true;
      })
      .map(ann => ({
        ...ann,
        displayTime: ann.createdAt ? formatRelativeTime(ann.createdAt) : ann.time
      }));
  }, [announcements, filter, currentTime]);

  const handleMarkAsRead = (id: number) => {
    markAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleAnnouncementClick = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    // Auto mark as read when clicked
    if (!announcement.read) {
      markAsRead(announcement.id);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl text-gray-900">Thông Báo</h1>
        <p className="text-gray-600 mt-1">Cập nhật thông tin mới nhất từ Ban Quản Trị</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Card 1: Thông báo chưa đọc - Navy */}
        <div className="h-32 rounded-2xl p-6 flex justify-between items-center text-white shadow-sm relative overflow-hidden" style={{ backgroundColor: '#1e293b' }}>
          <div className="flex flex-col">
            <p className="text-3xl font-bold">{unreadCount}</p>
            <p className="text-sm font-medium opacity-80 mt-1">Thông báo chưa đọc</p>
          </div>
          <Bell className="w-12 h-12 opacity-20 flex-shrink-0" />
        </div>

        {/* Card 2: Tin khẩn cấp - Red */}
        <div className="h-32 rounded-2xl p-6 flex justify-between items-center text-white shadow-sm relative overflow-hidden" style={{ backgroundColor: '#dc2626' }}>
          <div className="flex flex-col">
            <p className="text-3xl font-bold">{announcements.filter(n => n.type === 'alert').length}</p>
            <p className="text-sm font-medium opacity-80 mt-1">Tin khẩn cấp</p>
          </div>
          <AlertTriangle className="w-12 h-12 opacity-20 flex-shrink-0" />
        </div>

        {/* Card 3: Tiền phí & Hóa đơn - Green */}
        <div className="h-32 rounded-2xl p-6 flex justify-between items-center text-white shadow-sm relative overflow-hidden" style={{ backgroundColor: '#059669' }}>
          <div className="flex flex-col">
            <p className="text-3xl font-bold">
              {announcements.filter(n => 
                n.type === 'info' && (n.title.toLowerCase().includes('phí') || n.title.toLowerCase().includes('hóa đơn') || n.title.toLowerCase().includes('thanh toán'))
              ).length}
            </p>
            <p className="text-sm font-medium opacity-80 mt-1">Tiền phí & Hóa đơn</p>
          </div>
          <Wallet className="w-12 h-12 opacity-20 flex-shrink-0" />
        </div>

        {/* Card 4: Tin tức chung - Blue */}
        <div className="h-32 rounded-2xl p-6 flex justify-between items-center text-white shadow-sm relative overflow-hidden" style={{ backgroundColor: '#2563eb' }}>
          <div className="flex flex-col">
            <p className="text-3xl font-bold">
              {announcements.filter(n => 
                n.type === 'info' && !(n.title.toLowerCase().includes('phí') || n.title.toLowerCase().includes('hóa đơn') || n.title.toLowerCase().includes('thanh toán'))
              ).length}
            </p>
            <p className="text-sm font-medium opacity-80 mt-1">Tin tức chung</p>
          </div>
          <Megaphone className="w-12 h-12 opacity-20 flex-shrink-0" />
        </div>
      </div>

      {/* Filter Tabs & Mark All as Read */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'unread', label: 'Chưa đọc' },
            { id: 'read', label: 'Đã đọc' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as typeof filter)}
              className={`text-sm font-medium px-4 py-2 rounded-xl transition-all ${
                filter === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button 
          onClick={handleMarkAllAsRead}
          disabled={unreadCount === 0}
          className={`text-sm font-medium transition-colors flex items-center gap-2 px-4 py-2 rounded-xl ${
            unreadCount === 0
              ? 'text-gray-400 cursor-not-allowed bg-gray-100'
              : 'text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700'
          }`}
        >
          Đánh dấu tất cả đã đọc
        </button>
      </div>

      {/* Announcements List */}
      <div className="space-y-3">
        {filteredAnnouncements.map((announcement) => {
          const { Icon, bgClass, textClass } = getNotificationIcon(announcement);
          
          return (
            <div 
              key={announcement.id} 
              onClick={() => handleAnnouncementClick(announcement)}
              className={`bg-white rounded-2xl p-6 border-2 transition-all hover:shadow-md cursor-pointer ${
                announcement.read ? 'border-gray-200' : 'border-blue-200 bg-blue-50/30'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-full ${bgClass} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${textClass}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="text-lg text-gray-900 font-semibold">{announcement.title}</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500 whitespace-nowrap">
                        {announcement.displayTime}
                      </span>
                      {!announcement.read && (
                        <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                  <p className="text-gray-600 mb-2 line-clamp-2">{announcement.message}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Ngày đăng: {announcement.createdAt ? formatDate(announcement.createdAt) : announcement.date}
                    </span>
                    {!announcement.read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(announcement.id);
                        }}
                        className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        Đánh dấu đã đọc
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Announcement Detail Modal */}
      {selectedAnnouncement && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedAnnouncement(null)}
        >
          <div 
            className="bg-white rounded-2xl p-8 max-w-2xl w-full border-2 border-gray-200 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start gap-4 flex-1">
                {(() => {
                  const { Icon, bgClass, textClass } = getNotificationIcon(selectedAnnouncement);
                  return (
                    <div className={`w-10 h-10 rounded-full ${bgClass} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${textClass}`} />
                    </div>
                  );
                })()}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedAnnouncement.title}</h2>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Ngày đăng: {selectedAnnouncement.createdAt ? formatDate(selectedAnnouncement.createdAt) : selectedAnnouncement.date}</span>
                      <span>•</span>
                      <span>{selectedAnnouncement.createdAt ? formatRelativeTime(selectedAnnouncement.createdAt) : selectedAnnouncement.time}</span>
                    </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {selectedAnnouncement.message}
              </p>
            </div>

            {!selectedAnnouncement.read && (
              <div className="mt-6 pt-6 border-t-2 border-gray-200">
                <button
                  onClick={() => {
                    handleMarkAsRead(selectedAnnouncement.id);
                    setSelectedAnnouncement(null);
                  }}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  Đánh dấu đã đọc
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {filteredAnnouncements.length === 0 && (
        <div className="bg-white rounded-2xl p-12 border-2 border-gray-200 text-center">
          <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Không có thông báo nào</p>
        </div>
      )}
    </div>
  );
}


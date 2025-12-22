import { Bell, Receipt, FileText, TrendingUp, Wallet, AlertCircle, CheckCircle, X, Info, ArrowRight } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getAnnouncements, getUnreadCount, subscribe, markAsRead, type Announcement } from '../utils/announcements';
import { getBills, subscribe as subscribeBills, type Bill } from '../utils/bills';
import { formatRelativeTime } from '../utils/timeUtils';

interface ResidentDashboardProps {
  onNavigate?: (page: string) => void;
}

const iconMap = {
  alert: AlertCircle,
  info: Info,
  success: CheckCircle,
};

export function ResidentDashboard({ onNavigate }: ResidentDashboardProps = {}) {
  const [unreadAnnouncements, setUnreadAnnouncements] = useState(getUnreadCount());
  const [announcements, setAnnouncements] = useState<Announcement[]>(getAnnouncements());
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [bills, setBills] = useState<Bill[]>(getBills());

  // Memoize recent announcements with real-time time formatting
  const recentAnnouncements = useMemo(() => {
    return announcements.slice(0, 3).map(ann => ({
      ...ann,
      displayTime: ann.createdAt ? formatRelativeTime(ann.createdAt) : ann.time
    }));
  }, [announcements]);

  useEffect(() => {
    const unsubscribeAnnouncements = subscribe((updatedAnnouncements) => {
      setAnnouncements(updatedAnnouncements);
      setUnreadAnnouncements(getUnreadCount());
    });
    
    const unsubscribeBills = subscribeBills((updatedBills) => {
      setBills(updatedBills);
    });
    
    return () => {
      unsubscribeAnnouncements();
      unsubscribeBills();
    };
  }, []);

  const unpaidBills = bills.filter(b => b.status !== 'Paid');
  const totalUnpaid = unpaidBills.reduce((sum, b) => sum + b.amount, 0);
  const recentBills = bills.slice(0, 3);

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
        <h1 className="text-3xl text-gray-900">Dashboard Cư Dân</h1>
        <p className="text-gray-600 mt-1">Chào mừng bạn trở lại! Đây là tổng quan về thông tin của bạn.</p>
      </div>

      {/* Stats Grid - KhaService Style Sync */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Card 1: Thông báo mới - Navy */}
        <div className="p-6 rounded-xl h-32 flex justify-between items-center text-white shadow-sm" style={{ backgroundColor: '#1e293b' }}>
          <div className="pl-6">
            <p className="text-3xl font-bold block mb-1">{unreadAnnouncements}</p>
            <p className="text-sm font-medium opacity-90 block">Thông báo mới</p>
          </div>
          <Bell className="w-12 h-12 text-white flex-shrink-0" />
        </div>

        {/* Card 2: Hóa đơn dịch vụ - Green */}
        <div className="p-6 rounded-xl h-32 flex justify-between items-center text-white shadow-sm" style={{ backgroundColor: '#059669' }}>
          <div className="pl-6">
            <p className="text-3xl font-bold block mb-1">{unpaidBills.length}</p>
            <p className="text-sm font-medium opacity-90 block">Hóa đơn dịch vụ</p>
          </div>
          <Receipt className="w-12 h-12 text-white flex-shrink-0" />
        </div>

        {/* Card 3: Dư nợ hiện tại - Blue */}
        <div className="p-6 rounded-xl h-32 flex justify-between items-center text-white shadow-sm" style={{ backgroundColor: '#2563eb' }}>
          <div className="pl-6">
            <p className="text-3xl font-bold block mb-1">{totalUnpaid.toLocaleString('vi-VN')} đ</p>
            <p className="text-sm font-medium opacity-90 block">Dư nợ hiện tại</p>
          </div>
          <Wallet className="w-12 h-12 text-white flex-shrink-0" />
        </div>

        {/* Card 4: Nội quy chung cư - Orange */}
        <Link
          to="/resident/rules"
          className="p-6 rounded-xl h-32 flex justify-between items-center text-white shadow-sm cursor-pointer no-underline"
          style={{ backgroundColor: '#ea580c' }}
        >
          <div className="pl-6">
            <p className="text-3xl font-bold block mb-1">Xem ngay</p>
            <p className="text-sm font-medium opacity-90 block">Nội quy chung cư</p>
          </div>
          <FileText className="w-12 h-12 text-white flex-shrink-0" />
        </Link>
      </div>

      {/* Recent Announcements & Bills */}
      <div className="grid grid-cols-2 gap-6">
        {/* Recent Announcements */}
        <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg text-gray-900">Thông báo mới nhất</h3>
            <button className="text-sm text-cyan-500 hover:text-cyan-600 transition-colors">
              Xem tất cả
            </button>
          </div>
          <div className="space-y-4">
            {recentAnnouncements.map((announcement) => {
              const Icon = iconMap[announcement.type];
              return (
                <div 
                  key={announcement.id} 
                  onClick={() => handleAnnouncementClick(announcement)}
                  className={`p-4 rounded-lg border-2 cursor-pointer hover:shadow-md transition-all ${
                    announcement.read ? 'border-gray-200 bg-gray-50' : 'border-blue-200 bg-blue-50/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">{announcement.title}</h4>
                      <p className="text-xs text-gray-600 line-clamp-2">{announcement.message}</p>
                      <p className="text-xs text-gray-500 mt-2">{announcement.displayTime}</p>
                    </div>
                    {!announcement.read && (
                      <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
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
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0 ${
                    selectedAnnouncement.color === 'orange' ? 'from-orange-400 to-orange-600' :
                    selectedAnnouncement.color === 'emerald' ? 'from-emerald-400 to-emerald-600' :
                    'from-blue-400 to-blue-600'
                  }`}>
                    {(() => {
                      const Icon = iconMap[selectedAnnouncement.type];
                      return <Icon className="w-6 h-6 text-white" />;
                    })()}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedAnnouncement.title}</h2>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Ngày đăng: {selectedAnnouncement.date}</span>
                      <span>•</span>
                      <span>{selectedAnnouncement.time}</span>
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
                      markAsRead(selectedAnnouncement.id);
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

        {/* Recent Bills */}
        <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg text-gray-900">Hóa đơn gần đây</h3>
            <button className="text-sm text-cyan-500 hover:text-cyan-600 transition-colors">
              Xem tất cả
            </button>
          </div>
          <div className="space-y-4">
            {recentBills.map((bill) => (
              <div key={bill.id} className="p-4 rounded-lg border-2 border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-900">{bill.type}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    bill.status === 'Paid' ? 'bg-green-100 text-green-700' :
                    bill.status === 'Pending' ? 'bg-orange-100 text-orange-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {bill.status === 'Paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">{bill.amount.toLocaleString('vi-VN')} đ</span>
                  <span className="text-xs text-gray-500">Hạn: {bill.dueDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


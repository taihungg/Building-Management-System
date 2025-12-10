import { Bell, Receipt, FileText, TrendingUp, AlertCircle, CheckCircle, X, Info, ArrowRight } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { getAnnouncements, getUnreadCount, subscribe, markAsRead, type Announcement } from '../utils/announcements';
import { getBills, subscribe as subscribeBills, type Bill } from '../utils/bills';
import { formatRelativeTime, getCurrentPeriod } from '../utils/timeUtils';
import { useRealtime } from '../hooks/useRealtime';

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
  const currentTime = useRealtime(60000); // Update every minute

  // Memoize recent announcements with real-time time formatting
  const recentAnnouncements = useMemo(() => {
    return announcements.slice(0, 3).map(ann => ({
      ...ann,
      displayTime: ann.createdAt ? formatRelativeTime(ann.createdAt) : ann.time
    }));
  }, [announcements, currentTime]);

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

  // Group bills by period (month)
  const monthlyBills = useMemo(() => {
    const grouped = new Map<string, Bill[]>();
    
    bills.forEach(bill => {
      if (!grouped.has(bill.period)) {
        grouped.set(bill.period, []);
      }
      grouped.get(bill.period)!.push(bill);
    });

    const monthly = Array.from(grouped.entries()).map(([period, periodBills]) => {
      const totalAmount = periodBills.reduce((sum, b) => sum + b.amount, 0);
      const paidBills = periodBills.filter(b => b.status === 'Paid');
      
      // Chỉ có thể thanh toán cả tháng, không có thanh toán một phần
      // Nếu tất cả đã thanh toán thì là Paid, còn lại là Pending
      const status: 'Paid' | 'Pending' = paidBills.length === periodBills.length ? 'Paid' : 'Pending';

      // Get the earliest due date for the month
      const dueDates = periodBills.map(b => new Date(b.dueDate));
      const earliestDueDate = new Date(Math.min(...dueDates.map(d => d.getTime())));

      return {
        period,
        bills: periodBills,
        totalAmount,
        status,
        dueDate: earliestDueDate.toISOString().split('T')[0],
        isOverdue: status === 'Pending' && earliestDueDate < new Date()
      };
    });

    // Sort by period (newest first)
    return monthly.sort((a, b) => {
      const aDate = new Date(a.period.replace('Tháng ', '').split('/').reverse().join('-'));
      const bDate = new Date(b.period.replace('Tháng ', '').split('/').reverse().join('-'));
      return bDate.getTime() - aDate.getTime();
    });
  }, [bills]);

  const unpaidMonthlyBills = monthlyBills.filter(m => m.status !== 'Paid');
  const totalUnpaid = unpaidMonthlyBills.reduce((sum, m) => sum + m.totalAmount, 0);
  const recentMonthlyBills = monthlyBills.slice(0, 3);

  const handleAnnouncementClick = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    // Auto mark as read when clicked
    if (!announcement.read) {
      markAsRead(announcement.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gray-900">Dashboard Cư Dân</h1>
          <p className="text-gray-600 mt-1">Chào mừng bạn trở lại! Đây là tổng quan về thông tin của bạn.</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Kỳ hiện tại</p>
          <p className="text-base text-gray-900">{getCurrentPeriod()}</p>
          <p className="text-xs text-gray-400 mt-1">
            {currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
          <div className="flex items-start justify-between">
            <div className={`w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center`}>
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div className={`flex items-center gap-1 px-3 py-1 rounded-lg ${
              unreadAnnouncements > 0 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
            }`}>
              {unreadAnnouncements > 0 ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
              <span className="text-sm">{unreadAnnouncements} mới</span>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-gray-500 text-sm">Thông báo chưa đọc</p>
            <p className="text-2xl text-gray-900 mt-1">{unreadAnnouncements}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
          <div className="flex items-start justify-between">
            <div className={`w-12 h-12 rounded-lg bg-purple-600 flex items-center justify-center`}>
              <Receipt className="w-6 h-6 text-white" />
            </div>
            <div className={`flex items-center gap-1 px-3 py-1 rounded-lg ${
              unpaidMonthlyBills.length > 0 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
            }`}>
              {unpaidMonthlyBills.length > 0 ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
              <span className="text-sm">{unpaidMonthlyBills.length} chưa thanh toán</span>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-gray-500 text-sm">Hóa đơn chưa thanh toán</p>
            <p className="text-2xl text-gray-900 mt-1">{unpaidMonthlyBills.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
          <div className="flex items-start justify-between">
            <div className={`w-12 h-12 rounded-lg bg-green-600 flex items-center justify-center`}>
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-gray-500 text-sm">Tổng tiền chưa thanh toán</p>
            <p className="text-2xl text-gray-900 mt-1">{totalUnpaid.toLocaleString('vi-VN')} đ</p>
          </div>
        </div>

        <button
          onClick={() => onNavigate?.('building-rules')}
          className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all text-left w-full group"
        >
          <div className="flex items-start justify-between">
            <div className={`w-12 h-12 rounded-lg bg-orange-600 flex items-center justify-center group-hover:bg-orange-700 transition-colors`}>
              <FileText className="w-6 h-6 text-white" />
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-orange-600 transition-colors" />
          </div>
          <div className="mt-4">
            <p className="text-gray-500 text-sm">Nội quy & Quy định</p>
            <p className="text-2xl text-gray-900 mt-1 group-hover:text-orange-600 transition-colors">Xem ngay</p>
          </div>
        </button>
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
            {recentMonthlyBills.map((monthlyBill) => (
              <div key={monthlyBill.period} className="p-4 rounded-lg border-2 border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-900">Hóa đơn {monthlyBill.period}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    monthlyBill.status === 'Paid' ? 'bg-green-100 text-green-700' :
                    monthlyBill.isOverdue ? 'bg-red-100 text-red-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {monthlyBill.status === 'Paid' ? 'Đã thanh toán' : 
                     monthlyBill.isOverdue ? 'Quá hạn' : 'Chưa thanh toán'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">{monthlyBill.totalAmount.toLocaleString('vi-VN')} đ</span>
                  <span className="text-xs text-gray-500">Hạn: {monthlyBill.dueDate}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{monthlyBill.bills.length} loại phí</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


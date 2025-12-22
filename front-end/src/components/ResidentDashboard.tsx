import { Bell, Receipt, FileText, TrendingUp, Wallet, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUnreadCount, subscribe } from '../utils/announcements';
import { getBills, subscribe as subscribeBills, type Bill } from '../utils/bills';

interface ResidentDashboardProps {
  onNavigate?: (page: string) => void;
}

export function ResidentDashboard({ onNavigate }: ResidentDashboardProps = {}) {
  const [unreadAnnouncements, setUnreadAnnouncements] = useState(getUnreadCount());
  const [bills, setBills] = useState<Bill[]>(getBills());

  useEffect(() => {
    const unsubscribeAnnouncements = subscribe(() => {
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
  const recentBills = bills.slice(0, 6);

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

      {/* Recent Bills - Full Width */}
      <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg text-gray-900">Hóa đơn gần đây</h3>
            <button className="text-sm text-cyan-500 hover:text-cyan-600 transition-colors">
              Xem tất cả
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentBills.map((bill) => (
              <div key={bill.id} className="p-4 rounded-lg border-2 border-gray-200 bg-gray-50 hover:shadow-md transition-all">
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
  );
}


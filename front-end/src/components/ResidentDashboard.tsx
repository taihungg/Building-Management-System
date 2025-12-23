import { Bell, Receipt, FileText, TrendingUp, Wallet, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUnreadCount, subscribe } from '../utils/announcements';
import { getBills, subscribe as subscribeBills, type Bill } from '../utils/bills';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

  // Dummy data for cost chart (6 months: June - December 2025)
  const costChartData = [
    { month: 'Tháng 6', electricity: 850000, water: 320000 },
    { month: 'Tháng 7', electricity: 920000, water: 350000 },
    { month: 'Tháng 8', electricity: 1100000, water: 380000 },
    { month: 'Tháng 9', electricity: 980000, water: 340000 },
    { month: 'Tháng 10', electricity: 1050000, water: 360000 },
    { month: 'Tháng 11', electricity: 1150000, water: 390000 },
  ];

  // Custom tooltip for cost chart
  const CostTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{payload[0].payload.month}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString('vi-VN')} đ
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl text-gray-900">Quản lý căn hộ</h1>
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

      {/* Charts and Recent Bills Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Left Section: Cost Chart (2/3 width) */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Biểu đồ chi phí</h3>
            <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
              6 tháng gần nhất
            </div>
          </div>
          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={costChartData}
                margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="#6b7280"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  stroke="#6b7280"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value: number) => {
                    if (value >= 1000000) {
                      return (value / 1000000).toFixed(1) + 'M';
                    }
                    return (value / 1000).toFixed(0) + 'K';
                  }}
                />
                <Tooltip content={<CostTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: 10 }} 
                  iconType="circle"
                  formatter={(value) => {
                    if (value === 'electricity') return 'Điện';
                    if (value === 'water') return 'Nước';
                    return value;
                  }}
                />
                <Bar 
                  dataKey="electricity" 
                  name="Điện" 
                  fill="#2563eb" 
                  barSize={40} 
                  radius={[4, 4, 0, 0]} 
                />
                <Bar 
                  dataKey="water" 
                  name="Nước" 
                  fill="#06b6d4" 
                  barSize={40} 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Section: Recent Bills (1/3 width) */}
        <div className="lg:col-span-1 bg-white rounded-xl p-6 border-2 border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Hóa đơn gần đây</h3>
            <Link 
              to="/resident/invoice"
              className="text-sm text-cyan-500 hover:text-cyan-600 transition-colors"
            >
              Xem tất cả
            </Link>
          </div>
          <div className="space-y-3">
            {recentBills.map((bill) => {
              // Extract month number from period (e.g., "Tháng 7/2025" -> "7")
              const monthMatch = bill.period.match(/Tháng\s+(\d+)/);
              const monthNumber = monthMatch ? monthMatch[1] : '';
              const billTitle = monthNumber ? `Hóa đơn tháng ${monthNumber}` : bill.type;
              
              return (
                <div 
                  key={bill.id} 
                  className="p-4 rounded-lg border-2 border-gray-200 bg-gray-50 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-900">{billTitle}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      bill.status === 'Paid' ? 'bg-green-100 text-green-700' :
                      bill.status === 'Pending' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {bill.status === 'Paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-lg font-bold text-gray-900">{bill.amount.toLocaleString('vi-VN')} đ</span>
                    <span className="text-xs text-gray-500">Hạn: {bill.dueDate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}


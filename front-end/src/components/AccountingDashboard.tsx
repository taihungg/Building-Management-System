import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Receipt, FileText, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getBills, subscribe as subscribeBills, type Bill } from '../utils/bills';
import { getCurrentPeriod } from '../utils/timeUtils';
import { toast } from 'sonner';

export function AccountingDashboard() {
  const [bills, setBills] = useState([]);
  const [isLoading,setIsLoading] = useState(false);

  

  const [stats1, setStats1] = useState({
    totalRevenue: 0,
    pendingAmount: 0,
    paidAmount: 0,
    unpaidAmount: 0,
    unpaidCount:0 ,
    pendingCount:0,
    paidCount:0

  });

  const fetchBills = async () => {
    setIsLoading(true);
    try {
      // 1. LOGIC XÂY DỰNG URL: Mặc định lấy theo năm
      let url = `http://localhost:8081/api/v1/accounting/invoices?year=2025`; 
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("Không thể tải dữ liệu hóa đơn");
      
      const res = await response.json();
      const data = res.data || [];
      
      setBills(data);
      calculateStats(data);
      
    } catch (error) {
      console.error("Lỗi tải hóa đơn:", error);
      toast.error("Lỗi tải dữ liệu", { description: error.message });
      setBills([]);
    } finally {
      setIsLoading(false);
    }
  };


useEffect(() => {
  fetchBills();
}, []); 

const calculateStats = (data) => {
  const initialStats = { 
    totalRevenue: 0, 
    pendingAmount: 0, 
    paidAmount: 0, 
    unpaidAmount: 0 ,
    unpaidCount:0 ,
    pendingCount:0,
    paidCount:0

  };
  
  const calculated = data.reduce((acc, bill) => {
    const amount = bill.totalAmount || 0; 
    
    acc.totalRevenue += amount;
    
    if (bill.status === 'PAID') {
      acc.paidAmount += amount;
      acc.paidCount+=1;
    } else if (bill.status === 'PENDING') {
      acc.pendingAmount += amount;
      acc.pendingCount+=1;
    } else { 
      acc.unpaidAmount += amount;
      acc.unpaidCount+=1;

    }

    return acc;
  }, initialStats);

  setStats1(calculated);
};

  
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      maximumFractionDigits: 0 
  }).format(amount);
};

/*
  const billStatusData = [
    { name: 'Đã thanh toán', value: paidBills.length, color: '#10B981' },
    { name: 'Chưa thanh toán', value: pendingBills.length - overdueBills.length, color: '#F59E0B' },
    { name: 'Quá hạn', value: overdueBills.length, color: '#EF4444' },
  ];
  */

  const stats = [
    { label: 'Tổng Doanh Thu', value: formatCurrency(stats1.paidAmount), change: '+8.2%', trend: 'up', icon: DollarSign, bgColor: 'bg-green-100', iconColor: 'text-green-600',billCount: stats1.paidCount, // Thêm chỉ số số lượng hóa đơn
      billCountLabel: 'Đã Thanh Toán' , countTextLabel: 'text-green-700' },
    { label: 'Chưa Thanh Toán', value: formatCurrency(stats1.unpaidAmount), trend: 'down', icon: Clock, bgColor: 'bg-orange-100', iconColor: 'text-orange-600',billCount: stats1.unpaidCount, // Thêm chỉ số số lượng hóa đơn
      billCountLabel: 'Chưa Thanh Toán',countTextLabel: 'text-yellow-700' },
    { label: 'Đang chờ xử lý', value: formatCurrency(stats1.pendingAmount),  trend: 'down', icon: AlertCircle, bgColor: 'bg-red-100', iconColor: 'text-red-600' ,billCount: stats1.pendingCount, // Thêm chỉ số số lượng hóa đơn
      billCountLabel: 'Đang chờ xử lý',countTextLabel: 'text-red-700' },
    { label: 'Tổng Hóa Đơn', value: bills.length,  trend: 'up', icon: Receipt, bgColor: 'bg-blue-100', iconColor: 'text-blue-600', billCount: bills.length, // Thêm chỉ số số lượng hóa đơn
      billCountLabel: 'Tổng số hoá đơn', countTextLabel: 'text-blue-700'  },
  ];

  const currentPeriod = getCurrentPeriod();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Kế Toán</h1>
          <p className="text-gray-600">Tổng quan tài chính và quản lý hóa đơn</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Kỳ hiện tại</p>
          <p className="text-base text-gray-900">{currentPeriod}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
          return (
            <div key={stat.label} className="bg-white rounded-xl p-6 border-2 border-gray-200">
              <div className="flex items-start justify-between">
                <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
                <div className={`flex items-center gap-1 px-3 py-1 rounded-lg ${stat.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  <TrendIcon className="w-4 h-4" />
                  <span className="text-sm">{stat.change}</span>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-gray-500 text-sm">{stat.label}</p>
                <p className="text-2xl text-gray-900 mt-1 font-semibold">{stat.value}</p>
                <p className={`text-sm mt-1 ${stat.countTextLabel}`}>
             {stat.billCount} hóa đơn 
          </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-xl p-6 border-2 border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Doanh Thu & Thanh Toán Theo Tháng</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart /*data={monthlyRevenue}*/>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" tickFormatter={(value: number) => value >= 1000000 ? (value / 1000000).toFixed(0) + 'M' : value >= 1000 ? (value / 1000).toFixed(0) + 'K' : value.toString()} />
              <Tooltip contentStyle={{ backgroundColor: 'white', border: '2px solid #e5e7eb', borderRadius: '8px' }} formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="revenue" fill="#2563eb" name="Tổng doanh thu" radius={[8, 8, 0, 0]} />
              <Bar dataKey="paid" fill="#10B981" name="Đã thanh toán" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

       <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trạng Thái Hóa Đơn</h3>
          <ResponsiveContainer width="100%" height={280}>
            <RechartsPieChart>
              <Pie data={bills} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value">
                {bills.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-2 mt-4">
            {bills.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hóa Đơn Đã Thanh Toán Gần Đây</h3>
          <div className="space-y-3">
            {bills.slice(0, 5).map((bill) => (
              <div key={bill.id} className="flex items-center justify-between p-4 rounded-lg border-2 border-gray-200 bg-green-50">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{bill.period}</p>
                  <p className="text-xs text-gray-500 mt-1">Đã thanh toán: {bill.paidDate}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-700">{formatCurrency(bill.amount)} ₫</p>
                  <div className="flex items-center gap-1 mt-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-green-600">Đã thanh toán</span>
                  </div>
                </div>
              </div>
            ))}
            {bills.length === 0 && <p className="text-center text-gray-500 py-8">Chưa có hóa đơn đã thanh toán</p>}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hóa Đơn Quá Hạn</h3>
          <div className="space-y-3">
            {bills.slice(0, 5).map((bill) => (
              <div key={bill.id} className="flex items-center justify-between p-4 rounded-lg border-2 border-red-200 bg-red-50">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{bill.period}</p>
                  <p className="text-xs text-red-600 mt-1">Hạn thanh toán: {bill.dueDate}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-red-700">{formatCurrency(bill.amount)} ₫</p>
                  <div className="flex items-center gap-1 mt-1">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="text-xs text-red-600">Quá hạn</span>
                  </div>
                </div>
              </div>
            ))}
            {bills.length === 0 && <p className="text-center text-gray-500 py-8">Không có hóa đơn quá hạn</p>}
          </div>
        </div>
      </div>
    </div>
  );
}


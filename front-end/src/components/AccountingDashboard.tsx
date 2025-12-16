import React, { useState, useEffect, useMemo } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Receipt, FileText, AlertCircle, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getBills, subscribe as subscribeBills, type Bill } from '../utils/bills'; // Đảm bảo type Bill đã được export nếu có
import { getCurrentPeriod } from '../utils/timeUtils';
import { toast } from 'sonner';


const initialMonthlyData = Array.from({ length: 12 }, (_, i) => ({
  month: `Tháng ${i + 1}`,
  revenue: 0,
  paid: 0,
}));


export function AccountingDashboard() {
  const [bills, setBills] = useState<any[]>([]); // Sử dụng any[] nếu không có type Bill
  const [isLoading, setIsLoading] = useState(false);
  const [monthlyRevenueData, setMonthlyRevenueData] = useState(initialMonthlyData);
  const [stats1, setStats1] = useState({
    totalRevenue: 0,
    pendingAmount: 0,
    paidAmount: 0,
    unpaidAmount: 0,
    unpaidCount: 0,
    pendingCount: 0,
    paidCount: 0
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(amount);
  };

  /**
   * Xử lý dữ liệu hóa đơn thô thành định dạng cho Bar Chart (Doanh thu theo tháng)
   * @param data Dữ liệu hóa đơn từ API
   * @returns Mảng dữ liệu đã nhóm theo tháng
   */
  const processMonthlyData = (data: any[]) => {
    const monthlyMap: { [key: number]: { revenue: number, paid: number } } = {};

    // Khởi tạo Map với 12 tháng
    for (let i = 1; i <= 12; i++) {
      monthlyMap[i] = { revenue: 0, paid: 0 };
    }

    data.forEach(bill => {
      const createdDate = new Date(bill.createdTime);
      const month = createdDate.getMonth() + 1; 

      if (monthlyMap[month]) {
        const amount = bill.totalAmount || 0;
        monthlyMap[month].revenue += amount;

        if (bill.status === 'PAID') {
          monthlyMap[month].paid += amount;
        }
      }
    });

    // Chuyển Map thành mảng Recharts
    const result = Object.keys(monthlyMap).map(key => {
      const month = parseInt(key);
      return {
        month: `Tháng ${month}`,
        revenue: monthlyMap[month].revenue,
        paid: monthlyMap[month].paid
      };
    }).sort((a, b) => {
      // Sắp xếp lại theo số tháng (từ 1 đến 12)
      return parseInt(a.month.split(' ')[1]) - parseInt(b.month.split(' ')[1]);
    });

    return result;
  };

  const calculateStats = (data: any[]) => {
    const initialStats = {
      totalRevenue: 0,
      pendingAmount: 0,
      paidAmount: 0,
      unpaidAmount: 0,
      unpaidCount: 0,
      pendingCount: 0,
      paidCount: 0
    };

    const calculated = data.reduce((acc, bill) => {
      const amount = bill.totalAmount || 0;

      acc.totalRevenue += amount; // Tổng giá trị hóa đơn đã tạo

      if (bill.status === 'PAID') {
        acc.paidAmount += amount;
        acc.paidCount += 1;
      } else if (bill.status === 'PENDING') {
        acc.pendingAmount += amount;
        acc.pendingCount += 1;
      } else { // UNPAID
        acc.unpaidAmount += amount;
        acc.unpaidCount += 1;
      }

      return acc;
    }, initialStats);

    setStats1(calculated);
    setMonthlyRevenueData(processMonthlyData(data)); // **GỌI HÀM XỬ LÝ DỮ LIỆU THÁNG**
  };


  const fetchBills = async () => {
    setIsLoading(true);
    try {
      // Giả định lấy dữ liệu năm 2025
      let url = `http://localhost:8081/api/v1/accounting/invoices?year=${new Date().getFullYear()}`; 

      const response = await fetch(url);
      if (!response.ok) throw new Error("Không thể tải dữ liệu hóa đơn");

      const res = await response.json();
      const data = res.data || [];

      setBills(data);
      calculateStats(data); 
      
    } catch (error) {
      console.error("Lỗi tải hóa đơn:", error);
      toast.error("Lỗi tải dữ liệu", { description: (error as Error).message });
      setBills([]);
      setMonthlyRevenueData(initialMonthlyData);
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    fetchBills();
  }, []);

  // Để xly pie chart
  const billStatusData = [
    { name: 'Đã thanh toán', value: stats1.paidCount, color: '#10B981', amount: stats1.paidAmount },
    { name: 'Đang chờ xử lý', value: stats1.pendingCount, color: '#F59E0B', amount: stats1.pendingAmount },
    { name: 'Chưa thanh toán', value: stats1.unpaidCount, color: '#EF4444', amount: stats1.unpaidAmount }, // Đổi màu sang đỏ để nổi bật hơn
  ];
  // Lọc bỏ các mục có value = 0 để Pie Chart không bị lỗi
  const filteredBillStatusData = billStatusData.filter(item => item.value > 0);

  const stats = useMemo(() => ([
    { 
      label: 'Thực thu', 
      value: formatCurrency(stats1.paidAmount), 
      icon: DollarSign, 
      borderColor: 'border-green-500',
      iconBg: 'bg-green-50', 
      iconColor: 'text-green-600',
      valueColor: 'text-green-700',
      billCount: stats1.paidCount, 
      billCountLabel: 'Đã thanh toán'
    },
    { 
      label: 'Công nợ', 
      value: formatCurrency(stats1.unpaidAmount), 
      icon: Clock, 
      borderColor: 'border-red-500',
      iconBg: 'bg-red-50', 
      iconColor: 'text-red-600',
      valueColor: 'text-red-700',
      billCount: stats1.unpaidCount, 
      billCountLabel: 'Chưa thanh toán'
    },
    { 
      label: 'Chờ xác nhận', 
      value: formatCurrency(stats1.pendingAmount),  
      icon: AlertCircle, 
      borderColor: 'border-amber-500',
      iconBg: 'bg-amber-50', 
      iconColor: 'text-amber-600',
      valueColor: 'text-amber-700',
      billCount: stats1.pendingCount, 
      billCountLabel: 'Đang chờ xử lý'
    },
    { 
      label: 'Tổng hóa đơn', 
      value: bills.length.toString(),  
      icon: Receipt, 
      borderColor: 'border-blue-500',
      iconBg: 'bg-blue-50', 
      iconColor: 'text-blue-600',
      valueColor: 'text-blue-700',
      billCount: bills.length, 
      billCountLabel: 'Tổng số hoá đơn'
    },
  ]), [stats1, bills.length]); // Sử dụng useMemo để tránh tính toán lại không cần thiết

  const currentPeriod = getCurrentPeriod();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tổng quan tài chính</h1>
        </div>
      </div>

      {/* --- PHẦN 1: THẺ TÓM TẮT THỐNG KÊ --- */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          // Color themes matching InvoiceCreation page
          const colorThemes = [
            // Card 1: Green/Emerald theme (like InvoiceCreation Card 4)
            { bg: '#ecfdf5', border: '#a7f3d0', text: '#047857' },
            // Card 2: Red theme (custom for unpaid)
            { bg: '#fef2f2', border: '#fecaca', text: '#dc2626' },
            // Card 3: Amber theme (like InvoiceCreation Card 2)
            { bg: '#fffbeb', border: '#fde68a', text: '#b45309' },
            // Card 4: Blue theme (like InvoiceCreation Card 1)
            { bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8' }
          ];
          const theme = colorThemes[index] || colorThemes[0];
          
          return (
            <div 
              key={stat.label} 
              className="rounded-xl p-4 shadow-sm"
              style={{ 
                backgroundColor: theme.bg,
                border: `2px solid ${theme.border}`
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium tracking-wide" style={{ color: theme.text }}>
                  {stat.label}
                </p>
                <Icon className="w-5 h-5" style={{ color: theme.text }} />
              </div>
              <p 
                className="text-2xl font-bold"
                style={{ color: theme.text }}
              >
                {stat.value}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {stat.billCount} hóa đơn {stat.billCountLabel}
              </p>
            </div>
          );
        })}
      </div>

      {/* --- PHẦN 2: BIỂU ĐỒ (BAR CHART & PIE CHART) --- */}
      <div className="grid grid-cols-3 gap-6">
        {/* BAR CHART: Doanh Thu & Thanh Toán Theo Tháng */}
        <div className="col-span-2 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Thực thu theo tháng</h3>
          {isLoading ? (
            <div className="flex justify-center items-center h-[280px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div style={{ width: '100%', height: '280px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyRevenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis 
                    stroke="#6b7280" 
                    tickFormatter={(value: number) => value >= 1000000 ? (value / 1000000).toFixed(0) + 'M' : value >= 1000 ? (value / 1000).toFixed(0) + 'K' : value.toString()}
                    label={{ value: 'Số tiền (VND)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '10px' }} 
                    formatter={(value: number, name: string) => [formatCurrency(value), name]} 
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
                  <Bar dataKey="revenue" fill="#3B82F6" name="Tổng doanh thu phát sinh" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="paid" fill="#10B981" name="Thực thu (Đã thanh toán)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* PIE CHART: Trạng Thái Hóa Đơn */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Thành phần nguồn thu</h3>
          {isLoading ? (
            <div className="flex justify-center items-center h-[280px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div style={{ width: '100%', height: '280px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie 
                      data={filteredBillStatusData.length > 0 ? filteredBillStatusData : [{ name: 'Không có dữ liệu', value: 1, color: '#e5e7eb' }]} 
                      cx="50%" cy="50%" 
                      innerRadius={70} 
                      outerRadius={110} 
                      paddingAngle={2} 
                      dataKey="value"
                      labelLine={false}
                    >
                      {(filteredBillStatusData.length > 0 ? filteredBillStatusData : [{ name: 'Không có dữ liệu', value: 1, color: '#e5e7eb' }]).map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '10px' }} 
                      formatter={(value: number, name: string) => [`${value} hóa đơn`, name]} 
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-2 mt-4">
                {filteredBillStatusData.length > 0 ? (
                  filteredBillStatusData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm text-gray-600">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-gray-900">{item.value}</span>
                        <span className="text-xs text-gray-500 block">{formatCurrency(item.amount)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center">Chưa có dữ liệu</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>

    </div>
  );
}
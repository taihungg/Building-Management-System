import React, { useState, useEffect, useMemo } from 'react';
import { DollarSign, Receipt, FileText, AlertCircle, Clock, Banknote, Loader2, Calendar } from 'lucide-react';
import { BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast, Toaster } from 'sonner';

export function AccountingDashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [monthlyRevenueData, setMonthlyRevenueData] = useState<any[]>([]);

  // --- STATE MỚI: Chọn số tháng hiển thị (Mặc định 12) ---
  const [viewRange, setViewRange] = useState<number>(12);

  const [dashboardMetrics, setDashboardMetrics] = useState({
    revenue: { totalAmount: 0, invoiceCount: 0 },
    receivable: { totalAmount: 0, invoiceCount: 0 },
    pending: { totalAmount: 0, invoiceCount: 0 },
    totalInvoices: 0
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const fetchDashboardData = async () => {
    setIsLoading(true);
    const currentYear = new Date().getFullYear();
    try {
      const [metricsRes, barchartRes] = await Promise.all([
        fetch(`https://building-management-system.fly.dev/api/v1/accounting/dashboard/fourmetrics`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // 2. Thêm header để ngrok không chặn dữ liệu trả về
            'ngrok-skip-browser-warning': 'true'
          }
        }),
        fetch(`https://building-management-system.fly.dev/api/v1/accounting/dashboard/barchart?year=${currentYear}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // 2. Thêm header để ngrok không chặn dữ liệu trả về
            'ngrok-skip-browser-warning': 'true'
          }
        })
      ]);

      if (!metricsRes.ok || !barchartRes.ok) throw new Error("Không thể tải dữ liệu");

      const metricsJson = await metricsRes.json();
      const barchartJson = await barchartRes.json();

      if (metricsJson.data) setDashboardMetrics(metricsJson.data);

      if (barchartJson.data) {
        const formattedData = barchartJson.data.map((item: any) => ({
          month: item.month, // Lưu lại số tháng để lọc
          monthLabel: `Tháng ${item.month}`,
          revenue: item.totalRevenue || 0,
          paid: item.paidRevenue || 0
        }));
        setMonthlyRevenueData(formattedData);
      }
    } catch (error: any) {
      toast.error("Lỗi tải dữ liệu", { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // --- LOGIC LỌC DỮ LIỆU THEO SỐ THÁNG ĐÃ CHỌN ---
  const filteredChartData = useMemo(() => {
    if (monthlyRevenueData.length === 0) return [];
    // Lấy 'viewRange' tháng cuối cùng trong mảng dữ liệu
    return monthlyRevenueData.slice(-viewRange);
  }, [monthlyRevenueData, viewRange]);

  const statsCards = useMemo(() => ([
    { label: 'Thực thu', value: formatCurrency(dashboardMetrics.revenue.totalAmount), icon: DollarSign, watermarkIcon: Banknote, bgColor: '#059669', count: dashboardMetrics.revenue.invoiceCount },
    { label: 'Công nợ', value: formatCurrency(dashboardMetrics.receivable.totalAmount), icon: Clock, watermarkIcon: AlertCircle, bgColor: '#dc2626', count: dashboardMetrics.receivable.invoiceCount },
    { label: 'Chờ xác nhận', value: formatCurrency(dashboardMetrics.pending.totalAmount), icon: AlertCircle, watermarkIcon: Clock, bgColor: '#d97706', count: dashboardMetrics.pending.invoiceCount },
    { label: 'Tổng hóa đơn', value: dashboardMetrics.totalInvoices.toString(), icon: Receipt, watermarkIcon: FileText, bgColor: '#2563eb', count: dashboardMetrics.totalInvoices },
  ]), [dashboardMetrics]);

  const pieData = [
    { name: 'Thực thu', value: dashboardMetrics.revenue.invoiceCount, color: '#059669', amount: dashboardMetrics.revenue.totalAmount },
    { name: 'Chờ xác nhận', value: dashboardMetrics.pending.invoiceCount, color: '#d97706', amount: dashboardMetrics.pending.totalAmount },
    { name: 'Công nợ', value: dashboardMetrics.receivable.invoiceCount, color: '#dc2626', amount: dashboardMetrics.receivable.totalAmount },
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      <Toaster richColors position="top-right" />
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Tổng quan tài chính</h1>
      </div>

      {/* 4 THẺ THỐNG KÊ */}
      <div className="grid grid-cols-4 gap-4">
        {statsCards.map((stat) => (
          <div key={stat.label} className="h-32 rounded-2xl p-6 shadow-md relative overflow-hidden transition-all hover:scale-[1.02]" style={{ backgroundColor: stat.bgColor }}>
            <stat.watermarkIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 opacity-20 text-white" />
            <div className="relative z-10 h-full flex flex-col justify-center pr-12">
              <p className="text-sm font-medium text-white opacity-90 uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              <p className="text-[10px] text-white mt-1 font-medium">{stat.count} hóa đơn</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* BIỂU ĐỒ BAR CHART CÓ BỘ CHỌN THÁNG */}
        <div className="col-span-2 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Phân tích dòng tiền</h3>

            {/* BỘ CHỌN KHOẢNG THỜI GIAN */}
            <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-200">
              {[3, 6, 12].map((range) => (
                <button
                  key={range}
                  onClick={() => setViewRange(range)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${viewRange === range
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  {range} tháng
                </button>
              ))}
            </div>
          </div>

          <div style={{ width: '100%', height: '300px' }}>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="monthLabel" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => v >= 1000000 ? `${v / 1000000}M` : v} />
                  <Tooltip cursor={{ fill: '#f9fafb' }} formatter={(val: number) => formatCurrency(val)} />
                  <Legend iconType="circle" verticalAlign="top" align="right" />
                  <Bar dataKey="revenue" fill="#3b82f6" name="Phải thu" radius={[4, 4, 0, 0]} barSize={viewRange === 3 ? 40 : 20} />
                  <Bar dataKey="paid" fill="#10b981" name="Thực thu" radius={[4, 4, 0, 0]} barSize={viewRange === 3 ? 40 : 20} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* PIE CHART GIỮ NGUYÊN */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex flex-col justify-between">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Cơ cấu nguồn thu</h3>
          <div style={{ width: '100%', height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie data={pieData.length > 0 ? pieData : [{ name: 'Trống', value: 1, color: '#f3f4f6' }]} innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v, name) => [`${v} hóa đơn`, name]} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-4">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-gray-600">{item.name}</span>
                </div>
                <span className="font-bold text-gray-900">{formatCurrency(item.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
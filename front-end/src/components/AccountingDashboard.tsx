import React, { useState, useEffect, useMemo } from 'react';
import { DollarSign, Receipt, AlertCircle, Clock } from 'lucide-react';
import { BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

// Màu sắc cho Pie Chart (Giữ nguyên)
const SERVICE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export function AccountingDashboard() {
  const [isLoading, setIsLoading] = useState(false);
  
  // 1. Logic State
  const [selectedPieMonth, setSelectedPieMonth] = useState(new Date().getMonth() + 1);
  const [monthlyRevenueData, setMonthlyRevenueData] = useState([]);
  const [filteredBillStatusData, setFilteredBillStatusData] = useState([]);
  const [metrics, setMetrics] = useState({
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

  // Logic fetch dữ liệu tổng quát (Metrics và Bar Chart)
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const year = new Date().getFullYear();
      const [resMetrics, resBar] = await Promise.all([
        fetch('http://localhost:8081/api/v1/accounting/dashboard/fourmetrics').then(r => r.json()),
        fetch(`http://localhost:8081/api/v1/accounting/dashboard/barchart?year=${year}`).then(r => r.json()),
      ]);

      if (resMetrics.statusCode === 200) setMetrics(resMetrics.data);

      if (resBar.statusCode === 200) {
        const mappedBar = resBar.data.map((item: any) => ({
          month: `Tháng ${item.month}`,
          revenue: item.totalRevenue,
          paid: item.paidRevenue
        }));
        setMonthlyRevenueData(mappedBar);
      }
    } catch (error) {
      console.error("Lỗi fetch dashboard:", error);
      toast.error("Không thể cập nhật dữ liệu mới");
    } finally {
      setIsLoading(false);
    }
  };

  // Logic fetch dữ liệu Pie Chart theo tháng
  const fetchPieData = async (month: number) => {
    try {
      const year = new Date().getFullYear();
      const response = await fetch(`http://localhost:8081/api/v1/accounting/dashboard/piechart?month=${month}&year=${year}`);
      const res = await response.json();
      
      if (res.statusCode === 200) {
        const mappedPie = res.data.map((item: any, index: number) => ({
          name: item.serviceName,
          value: item.totalAmount,
          amount: item.totalAmount,
          color: SERVICE_COLORS[index % SERVICE_COLORS.length]
        }));
        setFilteredBillStatusData(mappedPie);
      } else {
        setFilteredBillStatusData([]);
      }
    } catch (error) {
      console.error("Lỗi fetch piechart:", error);
      setFilteredBillStatusData([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchPieData(selectedPieMonth);
  }, [selectedPieMonth]);

  const stats = useMemo(() => ([
    { 
      label: 'Thực thu', 
      value: formatCurrency(metrics.revenue.totalAmount), 
      icon: DollarSign, 
      borderColor: 'border-green-500',
      iconBg: 'bg-green-50', 
      iconColor: 'text-green-600',
      valueColor: 'text-green-700',
      billCount: metrics.revenue.invoiceCount, 
      billCountLabel: 'Đã thanh toán'
    },
    { 
      label: 'Công nợ', 
      value: formatCurrency(metrics.receivable.totalAmount), 
      icon: Clock, 
      borderColor: 'border-red-500',
      iconBg: 'bg-red-50', 
      iconColor: 'text-red-600',
      valueColor: 'text-red-700',
      billCount: metrics.receivable.invoiceCount, 
      billCountLabel: 'Chưa thanh toán'
    },
    { 
      label: 'Chờ xác nhận', 
      value: formatCurrency(metrics.pending.totalAmount),  
      icon: AlertCircle, 
      borderColor: 'border-amber-500',
      iconBg: 'bg-amber-50', 
      iconColor: 'text-amber-600',
      valueColor: 'text-amber-700',
      billCount: metrics.pending.invoiceCount, 
      billCountLabel: 'Đang chờ xử lý'
    },
    { 
      label: 'Tổng hóa đơn', 
      value: metrics.totalInvoices.toString(),  
      icon: Receipt, 
      borderColor: 'border-blue-500',
      iconBg: 'bg-blue-50', 
      iconColor: 'text-blue-600',
      valueColor: 'text-blue-700',
      billCount: metrics.totalInvoices, 
      billCountLabel: 'Tổng số hoá đơn'
    },
  ]), [metrics]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tổng quan tài chính</h1>
        </div>
      </div>

      {/* Thẻ tóm tắt */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const colorThemes = [
            { bg: '#ecfdf5', border: '#a7f3d0', text: '#047857' },
            { bg: '#fef2f2', border: '#fecaca', text: '#dc2626' },
            { bg: '#fffbeb', border: '#fde68a', text: '#b45309' },
            { bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8' }
          ];
          const theme = colorThemes[index] || colorThemes[0];
          
          return (
            <div key={stat.label} className="rounded-xl p-4 shadow-sm" style={{ backgroundColor: theme.bg, border: `2px solid ${theme.border}` }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium tracking-wide" style={{ color: theme.text }}>{stat.label}</p>
                <Icon className="w-5 h-5" style={{ color: theme.text }} />
              </div>
              <p className="text-2xl font-bold" style={{ color: theme.text }}>{stat.value}</p>
              <p className="text-xs text-gray-400 mt-1">{stat.billCount} hóa đơn {stat.billCountLabel}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className="col-span-2 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Thực thu theo tháng</h3>
          {isLoading ? (
            <div className="flex justify-center items-center h-[280px]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
          ) : (
            <div style={{ width: '100%', height: '280px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyRevenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis tickFormatter={(v) => v >= 1000000 ? (v / 1000000).toFixed(0) + 'M' : v >= 1000 ? (v / 1000).toFixed(0) + 'K' : v.toString()} />
                  <Tooltip formatter={(v: number) => [formatCurrency(v), ""]} />
                  <Legend iconType="circle" />
                  <Bar dataKey="revenue" fill="#3B82F6" name="Tổng doanh thu phát sinh" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="paid" fill="#10B981" name="Thực thu (Đã thanh toán)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Pie Chart với Select bình thường */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Nguồn thu</h3>
            
            {/* Sử dụng SELECT HTML chuẩn */}
            <select 
              value={selectedPieMonth} 
              onChange={(e) => setSelectedPieMonth(parseInt(e.target.value))}
              className="text-xs border border-gray-300 rounded-md p-1 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white cursor-pointer"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  Tháng {i + 1}
                </option>
              ))}
            </select>
          </div>

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
                      key={filteredBillStatusData.length}
                      data={filteredBillStatusData.length > 0 ? filteredBillStatusData : [{ name: 'Trống', value: 1, color: '#f3f4f6' }]} 
                      cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={2} dataKey="value"
                    >
                      {filteredBillStatusData.length > 0 ? (
                        filteredBillStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))
                      ) : (
                        <Cell fill="#f3f4f6" />
                      )}
                    </Pie>
                    <Tooltip formatter={(v: number, name: string) => [formatCurrency(v), name]} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>

              {/* Danh sách chi tiết */}
              <div className="flex flex-col gap-2 mt-4 max-h-[150px] overflow-y-auto pr-1">
                {filteredBillStatusData.length > 0 ? (
                  filteredBillStatusData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between p-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-xs text-gray-600">{item.name}</span>
                      </div>
                      <span className="text-xs font-bold text-gray-900">{formatCurrency(item.amount)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-xs text-gray-400 italic py-4">Tháng này chưa phát sinh doanh thu</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
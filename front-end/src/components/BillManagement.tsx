import { Search, Clock, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
// Giả định Modal và Toaster được import từ thư viện/file nội bộ
import { Modal } from './Modal'; 
import { Toaster, toast } from 'sonner'; 
import { useState, useEffect, useCallback } from 'react'; // Đã thêm useCallback
import React from 'react';

// Cấu hình các nút lọc trạng thái
const STATUS_OPTIONS = [
    // Đã thay đổi 'none' thành 'gray' để tránh lỗi Tailwind cho trạng thái 'All'
    { label: 'Tất cả', value: 'All', color: 'gray' }, 
    { label: 'Đã thanh toán', value: 'PAID', icon: CheckCircle, color: 'green' }, // Dùng 'emerald' thay cho 'green'
    { label: 'Đang chờ', value: 'PENDING', icon: Clock, color: 'blue' },
    { label: 'Chưa thanh toán', value: 'UNPAID', icon: AlertCircle, color: 'orange' }, 
];

export function BillManagement() {
  const currentDate = new Date();
  
  // --- STATES ---
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); 
  const [isCreateBillOpen, setIsCreateBillOpen] = useState(false);

  const [bills, setBills] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 🔥 Khởi tạo selectedMonth bằng tháng hiện tại (1-12)
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1); 
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingAmount: 0,
    paidAmount: 0,
    unpaidAmount: 0
  });
  
  // --- DATA FETCHING & LOGIC (Đã dùng useCallback) ---
  const fetchBills = useCallback(async () => {
    setIsLoading(true);
    try {
      // Logic đã được điều chỉnh để luôn có month trong URL (vì selectedMonth >= 1)
      let url = `http://localhost:8081/api/v1/accounting/invoices?year=${selectedYear}`;
      
      // Nếu không muốn gọi API với tháng 0 (Tất cả), thì chỉ cần đảm bảo selectedMonth luôn > 0
      if (selectedMonth > 0) url += `&month=${selectedMonth}`; 
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("Không thể tải dữ liệu hóa đơn");
      const res = await response.json();
      const data = res.data || [];

      setBills(data);
      calculateStats(data);
    } catch (error) {
      console.error("Lỗi tải hóa đơn:", error);
      toast.error("Lỗi tải dữ liệu", { description: error.message || "Lỗi không xác định" });
      setBills([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth, selectedYear]); // Dependencies đã tối ưu

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  const calculateStats = (data) => {
    const calculated = data.reduce(
      (acc, bill) => {
        const amount = bill.totalAmount || 0;
        acc.totalRevenue += amount;
        if (bill.status === 'PAID') acc.paidAmount += amount;
        else if (bill.status === 'PENDING') acc.pendingAmount += amount;
        else acc.unpaidAmount += amount;
        return acc;
      },
      { totalRevenue: 0, pendingAmount: 0, paidAmount: 0, unpaidAmount: 0 }
    );
    setStats(calculated);
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(amount);

  const filteredBills = bills.filter(bill => {
    const matchStatus = statusFilter === 'All' || bill.status === statusFilter; 
    const term = searchTerm.toLowerCase();
    const matchSearch =
      bill.apartmentLabel && bill.apartmentLabel.toLowerCase().includes(term);
    return matchStatus && matchSearch;
  });

  const periodLabel = `Tháng ${selectedMonth}/${selectedYear}`;

  return (
    <div className="space-y-6">
      <Toaster position="top-right" richColors />

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl text-gray-900">Quản lý hóa đơn</h1>
          <p className="text-gray-600 mt-1">
            Theo dõi và quản lý tất cả các hóa đơn và thanh toán
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-xl shadow-sm">
            <Calendar className="w-5 h-5 text-gray-500" />
            
            {/* 🔥 BỘ CHỌN THÁNG - ĐÃ BỎ 'Tất cả các tháng' */}
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-transparent text-gray-700 font-medium focus:outline-none"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>Tháng {m}</option>
              ))}
            </select>
            {/* HẾT BỘ CHỌN THÁNG */}

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent text-gray-700 font-medium focus:outline-none"
            >
              {[currentDate.getFullYear() - 1, currentDate.getFullYear(), currentDate.getFullYear() + 1]
                .map(y => <option key={y} value={y}>Năm {y}</option>)}
            </select>
          </div>
        </div>
      </div>
      
      {/* SEARCH AND FILTER BUTTONS ROW (Gộp và Căn chỉnh) */}
      <div className="flex items-start gap-4">
          

<div 
    className="flex gap-4" 
    style={{ alignItems: 'center' }} 
>
          
    {/* SEARCH (Giữ 30% width) */}
    <div 
        className="bg-white rounded-xl shadow-lg border border-gray-100" 
        style={{ padding: '0.75rem', width : '30%', flexShrink: 0 }} 
    >
        <div className="relative">
            <Search 
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" 
                style={{ width: '1rem', height: '1rem', left: '0.75rem' }}
            />
            <input
                type="text"
                placeholder="Tìm theo số phòng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                style={{ 
                    paddingLeft: '2.5rem',
                    paddingRight: '1rem', 
                    paddingTop: '0.5rem', 
                    paddingBottom: '0.5rem',
                    height: '2.25rem' 
                }}
            />
        </div>
    </div>
          
    {/* FILTER BUTTONS ROW (Chiếm phần còn lại) */}
    <div className="flex flex-wrap gap-2"> 
        {STATUS_OPTIONS.map(option => (
            <button
                key={option.value}
                onClick={() => setStatusFilter(option.value)}
                // 🔥 Đã sửa logic màu Tailwind
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition duration-150
                    ${statusFilter === option.value
                        ? `bg-${option.color}-600 text-white shadow-md`
                        : `bg-white text-gray-600 border border-gray-300 hover:bg-gray-50`
                    }`}
            >
                {option.icon && <option.icon className="w-4 h-4" />}
                {option.label}
            </button>
        ))}
    </div>

</div>

      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max"> 
            <thead className="bg-gradient-to-r from-indigo-100 to-purple-100/70 text-gray-700">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">Đơn Vị</th>
                <th className="px-6 py-3 text-left font-semibold">Số Tiền</th>
                <th className="px-6 py-3 text-left font-semibold">Trạng Thái</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="text-center py-6 text-gray-500"> 
                    Đang tải hóa đơn...
                  </td>
                </tr>
              ) : filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-6 text-gray-500"> 
                    Không tìm thấy hóa đơn nào trong {periodLabel}.
                  </td>
                </tr>
              ) : (
                filteredBills.map(bill => (
                  <tr key={bill.id} className="hover:bg-indigo-50/50 transition duration-100">
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-800 rounded-lg font-medium text-sm">
                        {bill.apartmentLabel}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-bold text-gray-900">
                      {formatCurrency(bill.totalAmount)}
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium
                        ${bill.status === 'PAID'
                          ? 'bg-emerald-100 text-emerald-800'
                          : bill.status === 'PENDING'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-rose-100 text-rose-800'}`}>
                        {bill.status === 'PAID' && <CheckCircle className="w-4 h-4" />}
                        {bill.status === 'PENDING' && <Clock className="w-4 h-4" />}
                        {bill.status === 'UNPAID' && <AlertCircle className="w-4 h-4" />}
                        {bill.status === 'PAID'
                          ? 'Đã thanh toán'
                          : bill.status === 'PENDING'
                          ? 'Đang chờ'
                          : 'Chưa thanh toán'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE MODAL */}
      <Modal
        isOpen={isCreateBillOpen}
        onClose={() => setIsCreateBillOpen(false)}
        title="Tạo Hóa Đơn Mới"
      >
        <div className="p-6">
          <p>Nội dung form tạo hóa đơn...</p>
          {/* Thêm form logic tại đây */}
        </div>
      </Modal>
    </div>
  );
}
import { Search, Clock, CheckCircle, AlertCircle, Calendar, FileText, Settings, DollarSign, List } from 'lucide-react'; 
import { Modal } from './Modal'; 
import { Toaster, toast } from 'sonner'; 
import { useState, useEffect, useCallback } from 'react'; 
import React from 'react';

const STATUS_OPTIONS = [
    { label: 'Tất cả', value: 'All', color: 'gray' }, 
    { label: 'Đã thanh toán', value: 'PAID', icon: CheckCircle, color: 'green' }, 
    { label: 'Đang chờ', value: 'PENDING', icon: Clock, color: 'blue' },
    { label: 'Chưa thanh toán', value: 'UNPAID', icon: AlertCircle, color: 'orange' }, 
];

const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
        const date = new Date(dateString); 
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
        });
    } catch { return 'Ngày không hợp lệ'; }
};

export function BillManagement() {
  const currentDate = new Date();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); 
  const [isCreateBillOpen, setIsCreateBillOpen] = useState(false);
  const [bills, setBills] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1); 
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  // Đã cập nhật đầy đủ các trường đếm (count) để Stat Card hiển thị được
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingAmount: 0,
    paidAmount: 0,
    unpaidAmount: 0,
    totalCount: 0,
    paidCount: 0,
    pendingCount: 0,
    unpaidCount: 0
  });
  
  const fetchBills = useCallback(async () => {
    setIsLoading(true);
    try {
      let url = `http://localhost:8081/api/v1/accounting/invoices?year=${selectedYear}`;
      if (selectedMonth > 0) url += `&month=${selectedMonth}`; 
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("Không thể tải dữ liệu hóa đơn");
      const res = await response.json();
      const data = res.data || [];

      setBills(data);
      calculateStats(data);
    } catch (error) {
      console.error("Lỗi tải hóa đơn:", error);
      toast.error("Lỗi tải dữ liệu");
      setBills([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth, selectedYear]); 

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  const calculateStats = (data) => {
    const calculated = data.reduce(
      (acc, bill) => {
        const amount = bill.totalAmount || 0;
        acc.totalRevenue += amount;
        acc.totalCount += 1; // Tăng tổng số bill
        
        if (bill.status === 'PAID') {
            acc.paidAmount += amount;
            acc.paidCount += 1;
        } else if (bill.status === 'PENDING') {
            acc.pendingAmount += amount;
            acc.pendingCount += 1;
        } else {
            acc.unpaidAmount += amount;
            acc.unpaidCount += 1;
        }
        return acc;
      },
      { totalRevenue: 0, pendingAmount: 0, paidAmount: 0, unpaidAmount: 0, totalCount: 0, paidCount: 0, pendingCount: 0, unpaidCount: 0 }
    );
    setStats(calculated);
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency', currency: 'VND', maximumFractionDigits: 0
    }).format(amount);

  const filteredBills = bills.filter(bill => {
    const matchStatus = statusFilter === 'All' || bill.status === statusFilter; 
    const term = searchTerm.toLowerCase();
    const matchSearch = bill.apartmentLabel && bill.apartmentLabel.toLowerCase().includes(term);
    return matchStatus && matchSearch;
  });

  const periodLabel = `Tháng ${selectedMonth}/${selectedYear}`;

  const handleExportToExcel = () => {
    const promise = new Promise(async (resolve, reject) => {
        try {
            const url = `http://localhost:8081/api/v1/accounting/invoices/export?month=${selectedMonth}&year=${selectedYear}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error("Lỗi xuất báo cáo");
            const blob = await response.blob();
            const href = window.URL.createObjectURL(blob);
            const anchorElement = document.createElement('a');
            anchorElement.href = href;
            anchorElement.download = `HoaDon_${selectedMonth}_${selectedYear}.xlsx`;
            document.body.appendChild(anchorElement);
            anchorElement.click();
            document.body.removeChild(anchorElement);
            resolve(`Xuất file thành công!`);
        } catch (error) { reject(error); }
    });
    toast.promise(promise, { loading: `Đang xuất báo cáo...`, success: (m) => m, error: (e) => e.message });
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" richColors />

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl text-gray-900">Quản lý hóa đơn</h1>
          <p className="text-gray-600 mt-1">Theo dõi và quản lý tất cả các hóa đơn và thanh toán</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-xl shadow-sm">
            <Calendar className="w-5 h-5 text-gray-500" />
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className="bg-transparent text-gray-700 font-medium focus:outline-none">
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => <option key={m} value={m}>Tháng {m}</option>)}
            </select>
            <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="bg-transparent text-gray-700 font-medium focus:outline-none">
              {[currentDate.getFullYear() - 1, currentDate.getFullYear(), currentDate.getFullYear() + 1].map(y => <option key={y} value={y}>Năm {y}</option>)}
            </select>
          </div>
          
          <button onClick={handleExportToExcel} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-black rounded-xl shadow-md hover:bg-emerald-700 transition duration-150">
            <FileText className="w-5 h-5" /> Xuất báo cáo
          </button>
        </div>
      </div>
      
      {/* SEARCH AND FILTER BUTTONS ROW */}
      <div className="flex items-start gap-4">
        <div className="flex gap-4 w-full" style={{ alignItems: 'center' }}>
            <div className="bg-white rounded-xl shadow-lg border border-gray-100" style={{ padding: '0.75rem', width : '20%', flexShrink: 0 }}>
                <div className="relative">
                    <input type="text" placeholder="Tìm theo số phòng..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm px-10 py-2 h-9"
                    />
                </div>
            </div>
            <div className="flex flex-wrap gap-2"> 
                {STATUS_OPTIONS.map(option => (
                    <button key={option.value} onClick={() => setStatusFilter(option.value)}
                        style={{
                            backgroundColor: statusFilter === option.value ? (option.color === 'green' ? '#16a34a' : option.color === 'blue' ? '#2563eb' : option.color === 'orange' ? '#ea580c' : '#4b5563') : '#ffffff',
                            color: statusFilter === option.value ? '#ffffff' : '#4b5563'
                        }}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition duration-150 border ${statusFilter !== option.value ? 'border-gray-300 hover:bg-gray-50' : 'border-transparent shadow-md'}`}
                    >
                        {option.icon && <option.icon className="w-4 h-4" />}
                        {option.label}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* STATS CARDS - GIỮ NGUYÊN STYLE BẠN CHỌN */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <div style={{ padding: '12px', backgroundColor: '#f1f5f9', color: '#64748b', borderRadius: '16px', width: 'fit-content' }}>
            <List size={22} />
          </div>
          <div style={{ marginTop: '20px' }}>
            <p style={{ fontSize: '13px', fontWeight: 400, color: '#64748b', margin: 0 }}>Tổng doanh thu tháng {selectedMonth}</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <p style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b', margin: '2px 0 0 0' }}>{formatCurrency(stats.totalRevenue)}</p>
                <p style={{ fontSize: '12px', fontWeight: 500, color: '#94a3b8' }}>{stats.totalCount} bill</p>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <div style={{ padding: '12px', backgroundColor: '#ecfdf5', color: '#059669', borderRadius: '16px', width: 'fit-content' }}>
            <CheckCircle size={22} />
          </div>
          <div style={{ marginTop: '20px' }}>
            <p style={{ fontSize: '13px', fontWeight: 400, color: '#64748b', margin: 0 }}>Đã thanh toán</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <p style={{ fontSize: '22px', fontWeight: 700, color: '#059669', margin: '2px 0 0 0' }}>{formatCurrency(stats.paidAmount)}</p>
                <p style={{ fontSize: '12px', fontWeight: 500, color: '#94a3b8' }}>{stats.paidCount} bill</p>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <div style={{ padding: '12px', backgroundColor: '#eff6ff', color: '#2563eb', borderRadius: '16px', width: 'fit-content' }}>
            <Clock size={22} />
          </div>
          <div style={{ marginTop: '20px' }}>
            <p style={{ fontSize: '13px', fontWeight: 400, color: '#64748b', margin: 0 }}>Đang chờ xử lý</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <p style={{ fontSize: '22px', fontWeight: 700, color: '#2563eb', margin: '2px 0 0 0' }}>{formatCurrency(stats.pendingAmount)}</p>
                <p style={{ fontSize: '12px', fontWeight: 500, color: '#94a3b8' }}>{stats.pendingCount} bill</p>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '32px', border: '1px solid #ffe4e6', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <div style={{ padding: '12px', backgroundColor: '#fff1f2', color: '#e11d48', borderRadius: '16px', width: 'fit-content' }}>
            <AlertCircle size={22} />
          </div>
          <div style={{ marginTop: '20px' }}>
            <p style={{ fontSize: '13px', fontWeight: 400, color: '#64748b', margin: 0 }}>Chưa thanh toán</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <p style={{ fontSize: '22px', fontWeight: 700, color: '#e11d48', margin: '2px 0 0 0' }}>{formatCurrency(stats.unpaidAmount)}</p>
                <p style={{ fontSize: '12px', fontWeight: 500, color: '#94a3b8' }}>{stats.unpaidCount} bill</p>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max"> 
            <thead className="bg-gradient-to-r from-indigo-100 to-purple-100/70 text-gray-700">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">Căn hộ</th>
                <th className="px-6 py-3 text-left font-semibold">Số tiền</th>
                <th className="px-6 py-3 text-left font-semibold">Ngày tạo</th>
                <th className="px-6 py-3 text-left font-semibold">Ngày thanh toán</th>
                <th className="px-6 py-3 text-left font-semibold">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-6 text-gray-500">Đang tải hóa đơn...</td></tr>
              ) : filteredBills.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-6 text-gray-500">Không tìm thấy hóa đơn nào trong {periodLabel}.</td></tr>
              ) : (
                filteredBills.map(bill => (
                  <tr key={bill.id} className="hover:bg-indigo-50/50 transition duration-100">
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-800 rounded-lg font-medium text-sm">{bill.apartmentLabel}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">{formatCurrency(bill.totalAmount)}</td>
                    <td className="px-6 py-4 text-gray-600 font-medium text-sm">{formatDate(bill.createdTime)}</td>
                    <td className="px-6 py-4 text-gray-600 font-medium text-sm">{formatDate(bill.paymentDate)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium
                        ${bill.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : bill.status === 'PENDING' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'}`}>
                        {bill.status === 'PAID' ? 'Đã thanh toán' : bill.status === 'PENDING' ? 'Đang chờ' : 'Chưa thanh toán'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isCreateBillOpen} onClose={() => setIsCreateBillOpen(false)} title="Tạo Hóa Đơn Mới">
        <div className="p-6"><p>Nội dung form tạo hóa đơn...</p></div>
      </Modal>
    </div>
  );
}
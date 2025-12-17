import { Search, Clock, CheckCircle, AlertCircle, Calendar, FileText, Settings } from 'lucide-react'; 
// Giả định Modal và Toaster được import từ thư viện/file nội bộ
import { Modal } from './Modal'; 
import { Toaster, toast } from 'sonner'; 
import { useState, useEffect, useCallback } from 'react'; 
import React from 'react';

// Cấu hình các nút lọc trạng thái
const STATUS_OPTIONS = [
    { label: 'Tất cả', value: 'All', color: 'gray' }, 
    // Sử dụng 'green' cho Tailwind class, mặc dù icon dùng 'emerald'
    { label: 'Đã thanh toán', value: 'PAID', icon: CheckCircle, color: 'green' }, 
    { label: 'Đang chờ', value: 'PENDING', icon: Clock, color: 'blue' },
    { label: 'Chưa thanh toán', value: 'UNPAID', icon: AlertCircle, color: 'orange' }, 
];

// Hàm định dạng ngày
const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
        const date = new Date(dateString); 
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    } catch {
        return 'Ngày không hợp lệ';
    }
};

export function BillManagement() {
  const currentDate = new Date();
  
  // --- STATES ---
  const [searchTerm, setSearchTerm] = useState('');
  // 🔥 Mặc định là 'All'
  const [statusFilter, setStatusFilter] = useState('All'); 
  const [isCreateBillOpen, setIsCreateBillOpen] = useState(false);

  const [bills, setBills] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Khởi tạo selectedMonth bằng tháng hiện tại (1-12)
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1); 
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingAmount: 0,
    paidAmount: 0,
    unpaidAmount: 0
  });
  
  // --- DATA FETCHING & LOGIC ---
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
      toast.error("Lỗi tải dữ liệu", { description: error.message || "Lỗi không xác định" });
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

  // --- HÀM TẠO HÓA ĐƠN HÀNG LOẠT (POST) ---
  const handleGenerateInvoices = () => {
    const promise = new Promise(async (resolve, reject) => {
      try {
        const url = `http://localhost:8081/api/v1/accounting/invoices/generation?month=${selectedMonth}&year=${selectedYear}`;
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Lỗi: ${response.status} khi tạo hóa đơn.`);
        }

        const result = await response.json();
        
        await fetchBills(); 
        
        resolve(result.message || `Đã tạo thành công hóa đơn nháp tháng ${selectedMonth}/${selectedYear}.`);

      } catch (error) {
        console.error("Lỗi tạo hóa đơn hàng loạt:", error);
        reject(error);
      }
    });

    toast.promise(promise, {
      loading: `Đang tạo hóa đơn nháp tháng ${selectedMonth}/${selectedYear}...`,
      success: (message) => message, 
      error: (err) => `Tạo hóa đơn thất bại: ${err.message}`,
    });
  };
  
  // 🔥 HÀM XUẤT EXCEL (GET BLOB) ---
  const handleExportToExcel = () => {
    const promise = new Promise(async (resolve, reject) => {
        try {
            // Sử dụng API GET mới
            const url = `http://localhost:8081/api/v1/accounting/invoices/export?month=${selectedMonth}&year=${selectedYear}`;
            
            const response = await fetch(url);

            if (!response.ok) {
                // Thử đọc lỗi dưới dạng JSON nếu có
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Lỗi: ${response.status} khi xuất báo cáo.`);
            }

            // Lấy file Blob
            const blob = await response.blob();
            
            // Lấy tên file từ header Content-Disposition
            let fileName = `HoaDon_${selectedMonth}_${selectedYear}.xlsx`;
            const disposition = response.headers.get('Content-Disposition');
            if (disposition && disposition.indexOf('attachment') !== -1) {
                const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                const matches = filenameRegex.exec(disposition);
                if (matches != null && matches[1]) {
                    // Loại bỏ dấu nháy kép
                    fileName = matches[1].replace(/['"]/g, ''); 
                }
            }

            // Kích hoạt tải xuống
            const href = window.URL.createObjectURL(blob);
            const anchorElement = document.createElement('a');
            anchorElement.href = href;
            anchorElement.download = fileName;
            document.body.appendChild(anchorElement);
            anchorElement.click();
            document.body.removeChild(anchorElement);
            window.URL.revokeObjectURL(href);
            
            resolve(`Xuất file "${fileName}" thành công!`);

        } catch (error) {
            console.error("Lỗi xuất báo cáo:", error);
            reject(error);
        }
    });

    toast.promise(promise, {
      loading: `Đang xuất báo cáo tháng ${selectedMonth}/${selectedYear}...`,
      success: (message) => message, 
      error: (err) => `Xuất file thất bại: ${err.message}`,
    });
  };

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
          
          {/* BỘ CHỌN THÁNG/NĂM */}
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-xl shadow-sm">
            <Calendar className="w-5 h-5 text-gray-500" />
            
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-transparent text-gray-700 font-medium focus:outline-none"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>Tháng {m}</option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent text-gray-700 font-medium focus:outline-none"
            >
              {[currentDate.getFullYear() - 1, currentDate.getFullYear(), currentDate.getFullYear() + 1]
                .map(y => <option key={y} value={y}>Năm {y}</option>)}
            </select>
          </div>
          
          {/* NÚT TẠO HÓA ĐƠN THÁNG (Primary Action) */}
        
          
          {/* NÚT XUẤT EXCEL (Secondary Action) */}
          <button
            onClick={handleExportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-black rounded-xl shadow-md hover:bg-emerald-700 transition duration-150"
          >
            <FileText className="w-5 h-5" />
            Xuất báo cáo
          </button>
          
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
                // Đã sửa logic màu Tailwind
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
                <th className="px-6 py-3 text-left font-semibold">Căn hộ</th>
                <th className="px-6 py-3 text-left font-semibold">Số tiền</th>
                {/* Cột Ngày Tạo */}
                <th className="px-6 py-3 text-left font-semibold">Ngày tạo</th>
                {/* Cột Ngày Thanh Toán */}
                <th className="px-6 py-3 text-left font-semibold">Ngày thanh toán</th>
                <th className="px-6 py-3 text-left font-semibold">Trạng thái</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  {/* Cập nhật colspan lên 5 */}
                  <td colSpan={5} className="text-center py-6 text-gray-500"> 
                    Đang tải hóa đơn...
                  </td>
                </tr>
              ) : filteredBills.length === 0 ? (
                <tr>
                  {/* Cập nhật colspan lên 5 */}
                  <td colSpan={5} className="text-center py-6 text-gray-500"> 
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
                    
                    <td className="px-6 py-4 text-gray-600 font-medium text-sm">
                       {formatDate(bill.createdTime)} 
                    </td>

                    <td className="px-6 py-4 text-gray-600 font-medium text-sm">
                       {formatDate(bill.paymentDate)} 
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium
                        ${bill.status === 'PAID'
                          ? 'bg-emerald-100 text-emerald-800'
                          : bill.status === 'PENDING'
                          ? 'bg-blue-100 text-blue-800'
                          : bill.status === 'UNPAID'
                          ? 'bg-rose-100 text-rose-800' : 'bg-gray-100 text-gray-800'}`}>
                        {bill.status === 'PAID' && <CheckCircle className="w-4 h-4" />}
                        {bill.status === 'PENDING' && <Clock className="w-4 h-4" />}
                        {bill.status === 'UNPAID' && <AlertCircle className="w-4 h-4" />}
                        {bill.status === 'PAID'
                          ? 'Đã thanh toán'
                          : bill.status === 'PENDING'
                          ? 'Đang chờ'
                          : bill.status === 'UNPAID'
                          ? 'Chưa thanh toán' : 'Không xác định'}
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
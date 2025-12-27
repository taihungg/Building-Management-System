import { Search, Plus, Download, Clock, CheckCircle, AlertCircle, DollarSign, Calendar, CreditCard, List, X, Loader2, Upload, FileSpreadsheet } from 'lucide-react';
import { Modal } from './Modal';
import { Toaster, toast } from 'sonner';
import { useState, useEffect, useRef } from 'react';
import React from 'react';
import * as XLSX from 'xlsx';


export function DebtManagement() {
  const currentDate = new Date();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isCreateBillOpen, setIsCreateBillOpen] = useState(false);
  const [isUpdatePaymentOpen, setIsUpdatePaymentOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [paymentForm, setPaymentForm] = useState({
    status: 'UNPAID',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash'
  });
  const [createBillForm, setCreateBillForm] = useState({
    apartment: '',
    billType: 'Tiền thuê',
    amount: '',
    description: ''
  });

  const [bills, setBills] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Không dùng localStorage nữa, chỉ dùng API thật
  
  // State cho inline editing
  const [editingCell, setEditingCell] = useState<{ row: string; col: string } | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');
  
  // Bắt buộc chọn tháng (không có "Tất cả các tháng")
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1); 
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingAmount: 0,
    paidAmount: 0,
    unpaidAmount: 0
  });
  

  const fetchBills = async () => {
    setIsLoading(true);
    try {
      // Bắt buộc có tháng và năm
      const url = `http://localhost:8081/api/v1/accounting/invoices?year=${selectedYear}&month=${selectedMonth}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("Không thể tải dữ liệu hóa đơn");
      
      const res = await response.json();
      const data = res.data || [];
      
      // Chỉ dùng dữ liệu từ API, không dùng localStorage
      console.log('fetchBills - data from API:', data.length);
      
      // Chỉ dùng dữ liệu từ API
      setBills(data);
      calculateStats(data);
      setIsDataLoaded(data.length > 0);
      
    } catch (error) {
      console.error("Lỗi tải hóa đơn:", error);
      const errorMessage = error instanceof Error ? error.message : "Không thể tải dữ liệu hóa đơn";
      toast.error("Lỗi tải dữ liệu", { description: errorMessage });
      setBills([]);
      calculateStats([]);
      setIsDataLoaded(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file upload click
  const handleUploadClick = () => {
    if (isUploading) return;
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Hàm download template Excel
  const handleDownloadTemplate = () => {
    if (!selectedMonth || !selectedYear) {
      toast.error("Vui lòng chọn tháng và năm", { description: "Cần chọn Tháng và Năm trước khi tải template" });
      return;
    }

    try {
      // Headers theo yêu cầu
      const headers = [
        'STT',
        'Căn hộ',
        'Hóa đơn theo tháng đã chọn',
        'Số tiền',
        'Trạng thái'
      ];

      // Tạo dữ liệu mẫu
      const sampleData = [
        [1, 'P.101', `${selectedMonth}/${selectedYear}`, 5000000, 'PENDING'],
        [2, 'P.102', `${selectedMonth}/${selectedYear}`, 6000000, 'PENDING'],
        [3, 'P.103', `${selectedMonth}/${selectedYear}`, 5500000, 'PENDING']
      ];

      // Tạo worksheet
      const worksheetData = [headers, ...sampleData];
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

      // Tạo workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');

      // Xuất file Excel
      const fileName = `Template_hoa_don_${selectedMonth}_${selectedYear}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      toast.success("Đã tải template", { description: `File ${fileName} đã được tải xuống` });
    } catch (error) {
      console.error("Lỗi tải template:", error);
      toast.error("Lỗi tải template", { description: "Không thể tải template. Vui lòng thử lại." });
    }
  };

  // Handle file upload and generate invoices from file
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Kiểm tra bắt buộc chọn tháng và năm
    if (!selectedMonth || !selectedYear) {
      toast.error("Vui lòng chọn tháng và năm", { description: "Cần chọn Tháng và Năm trước khi tạo hóa đơn" });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Kiểm tra định dạng file
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      toast.error("Định dạng file không hợp lệ", { description: "Vui lòng chọn file Excel (.xlsx hoặc .xls)" });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setIsUploading(true);
    setIsGenerating(true);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        let jsonData: any[] = [];
        
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

          if (jsonData.length === 0) {
            toast.error("File Excel trống", { description: "Vui lòng kiểm tra lại file của bạn" });
            setIsUploading(false);
            setIsGenerating(false);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
            return;
          }

          console.log('Parsed invoice data from file:', jsonData);

          // Gọi API để tạo hóa đơn từ file
          const response = await fetch(
            `http://localhost:8081/api/v1/accounting/invoices/generation?month=${selectedMonth}&year=${selectedYear}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                data: jsonData
              })
            }
          );

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Không thể tạo hóa đơn");
          }

          const res = await response.json();
          
          // Lấy dữ liệu từ API response
          if (!res.data || res.data.length === 0) {
            throw new Error("API không trả về dữ liệu hóa đơn");
          }
          
          const newInvoices = res.data;
          
          // Chỉ lưu vào state tạm thời, KHÔNG lưu vào localStorage
          setBills(prev => [...prev, ...newInvoices]);
          setIsDataLoaded(true);
          
          toast.success("Tạo hóa đơn thành công", { description: res.message || `Đã tạo ${newInvoices.length} hóa đơn từ file ở trạng thái Pending` });
        } catch (error) {
          console.error("Lỗi xử lý file:", error);
          const errorMessage = error instanceof Error ? error.message : "Không thể tạo hóa đơn. Vui lòng thử lại.";
          toast.error("Lỗi tạo hóa đơn", { description: errorMessage });
        } finally {
          setIsUploading(false);
          setIsGenerating(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      };

      reader.onerror = () => {
        toast.error("Lỗi đọc file", { description: "Không thể đọc file. Vui lòng thử lại." });
        setIsUploading(false);
        setIsGenerating(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Lỗi upload file:", error);
      toast.error("Lỗi upload", { description: "Đã xảy ra lỗi khi upload file." });
      setIsUploading(false);
      setIsGenerating(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Approve all PENDING invoices (Duyệt tất cả) - Chuyển từ PENDING sang UNPAID
  const handleApproveAll = async () => {
    if (!isDataLoaded) {
      toast.error("Chưa có dữ liệu", { description: "Vui lòng tải lên file trước" });
      return;
    }

    const pendingBills = bills.filter(bill => bill.status === 'PENDING');
    if (pendingBills.length === 0) {
      toast.info("Không có hóa đơn cần duyệt", { description: "Tất cả hóa đơn đã được duyệt" });
      return;
    }

    setIsApproving(true);
    try {
      // Gọi API để duyệt tất cả hóa đơn PENDING
      const response = await fetch(`http://localhost:8081/api/v1/accounting/invoices/approve-all?month=${selectedMonth}&year=${selectedYear}`, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP ${response.status}: ${response.statusText}`);
      }

      const res = await response.json();
      
      // Reload dữ liệu từ API sau khi duyệt
      await fetchBills();
      
      toast.success("Đã duyệt tất cả hóa đơn", { description: res.message || `Đã duyệt ${pendingBills.length} hóa đơn` });
    } catch (error) {
      console.error("Lỗi duyệt hóa đơn:", error);
      toast.error("Lỗi duyệt hóa đơn", { description: (error as Error).message });
    } finally {
      setIsApproving(false);
    }
  };

  // Inline editing handlers
  const handleCellEdit = (billId: string, col: string, value: any) => {
    setEditingCell({ row: billId, col }); // Dùng billId thay vì index để tránh lỗi khi filter
    setEditingValue(String(value || ''));
  };

  const handleCellSave = async (billId: string, col: string) => {
    const bill = bills.find(b => b.id === billId);
    if (!bill) return;

    const newValue = Number(editingValue);
    if (isNaN(newValue) || newValue < 0) {
      toast.error("Giá trị không hợp lệ", { description: "Vui lòng nhập số dương" });
      setEditingCell(null);
      return;
    }

    try {
      // Gọi API để cập nhật hóa đơn
      const response = await fetch(`http://localhost:8081/api/v1/accounting/invoices/${billId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          totalAmount: newValue
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Reload dữ liệu từ API sau khi cập nhật
      await fetchBills();

      setEditingCell(null);
      toast.success("Đã cập nhật", { description: "Giá trị đã được cập nhật" });
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
      const errorMessage = error instanceof Error ? error.message : "Không thể cập nhật. Vui lòng thử lại.";
      toast.error("Lỗi cập nhật", { description: errorMessage });
      setEditingCell(null);
    }
  };

  const handleCellCancel = () => {
    setEditingCell(null);
    setEditingValue('');
  };

  // Pay invoice (Thanh toán) - Chuyển từ UNPAID sang PAID
  const handlePayInvoice = async (invoiceId: string) => {
    try {
      // Gọi API để thanh toán hóa đơn
      const response = await fetch(`http://localhost:8081/api/v1/accounting/invoices/${invoiceId}/pay`, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP ${response.status}: ${response.statusText}`);
      }

      const res = await response.json();
      
      // Reload dữ liệu từ API sau khi thanh toán
      await fetchBills();
      
      toast.success("Thanh toán thành công", { description: res.message || "Hóa đơn đã được thanh toán" });
    } catch (error) {
      console.error("Lỗi thanh toán:", error);
      toast.error("Lỗi thanh toán", { description: (error as Error).message });
    }
  };

  // Pay all UNPAID invoices (Thanh toán tất cả) - Chuyển từ UNPAID sang PAID
  const handlePayAll = async () => {
    const unpaidBills = bills.filter(bill => bill.status === 'UNPAID');
    if (unpaidBills.length === 0) {
      toast.info("Không có hóa đơn cần thanh toán", { description: "Tất cả hóa đơn đã được thanh toán" });
      return;
    }

    try {
      // Gọi API để thanh toán tất cả hóa đơn UNPAID
      const response = await fetch(`http://localhost:8081/api/v1/accounting/invoices/pay-all?month=${selectedMonth}&year=${selectedYear}`, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP ${response.status}: ${response.statusText}`);
      }

      const res = await response.json();
      
      // Reload dữ liệu từ API sau khi thanh toán
      await fetchBills();
      
      toast.success("Đã thanh toán tất cả hóa đơn", { description: res.message || `Đã thanh toán ${unpaidBills.length} hóa đơn` });
    } catch (error) {
      console.error("Lỗi thanh toán:", error);
      toast.error("Lỗi thanh toán", { description: (error as Error).message });
    }
  };

  useEffect(() => {
    fetchBills();
  }, [selectedMonth, selectedYear]); 
  
  const calculateStats = (data) => {
    const initialStats = { 
      totalRevenue: 0, 
      pendingAmount: 0, 
      paidAmount: 0, 
      unpaidAmount: 0 
    };
    
    const calculated = data.reduce((acc, bill) => {
      const amount = bill.totalAmount || 0; 
      
      acc.totalRevenue += amount;
      
      if (bill.status === 'PAID') {
        acc.paidAmount += amount;
      } else if (bill.status === 'PENDING') {
        acc.pendingAmount += amount;
      } else { 
        acc.unpaidAmount += amount;
      }

      return acc;
    }, initialStats);

    setStats(calculated);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND',
        maximumFractionDigits: 0 
    }).format(amount);
  };
  
  // Logic lọc client-side cho bảng
  const filteredBills = bills.filter(bill => {
      const matchStatus = statusFilter === 'All' || bill.status === statusFilter;
      const term = searchTerm.toLowerCase();
      const matchSearch = (bill.apartmentLabel && bill.apartmentLabel.toLowerCase().includes(term)); 
      return matchStatus && matchSearch;
  });
  
  // Tạo nhãn thời gian hiển thị
  const periodLabel = `Tháng ${selectedMonth}/${selectedYear}`;
  
  // Kiểm tra xem đã có hóa đơn chưa
  const hasInvoices = bills.length > 0;

  // Handle update payment button click
  const handleUpdatePaymentClick = (bill: any) => {
    setSelectedBill(bill);
    setPaymentForm({
      status: bill.status || 'UNPAID',
      paymentDate: bill.paymentDate ? new Date(bill.paymentDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      paymentMethod: 'Cash'
    });
    setIsUpdatePaymentOpen(true);
  };

  // Handle save payment update (Mock)
  const handleSavePaymentUpdate = () => {
    console.log('Updating payment status:', {
      billId: selectedBill?.id,
      apartmentLabel: selectedBill?.apartmentLabel,
      ...paymentForm
    });
    toast.success('Đã cập nhật trạng thái thanh toán', { description: 'Dữ liệu đã được lưu thành công' });
    setIsUpdatePaymentOpen(false);
    setSelectedBill(null);
  };

  // Handle create bill (Mock)
  const handleCreateBill = () => {
    if (!createBillForm.apartment || !createBillForm.amount) {
      toast.error('Vui lòng điền đầy đủ thông tin', { description: 'Căn hộ và số tiền là bắt buộc' });
      return;
    }
    
    console.log('Creating new bill:', createBillForm);
    toast.success('Đã tạo hóa đơn thành công', { description: `Hóa đơn cho ${createBillForm.apartment} đã được tạo` });
    setIsCreateBillOpen(false);
    setCreateBillForm({
      apartment: '',
      billType: 'Tiền thuê',
      amount: '',
      description: ''
    });
  };
  // --- HÀM XỬ LÝ XUẤT EXCEL ---
  const [isExporting, setIsExporting] = useState(false);
  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      // API đúng như chú gửi
      const url = `http://localhost:8081/api/v1/accounting/invoices/export?month=${selectedMonth}&year=${selectedYear}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Không thể xuất file hóa đơn');

      // Xử lý nhận file (Blob) và tự động tải xuống
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `Danh_Sach_Hoa_Don_T${selectedMonth}_${selectedYear}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toast.success("Xuất file Excel thành công!");
    } catch (error: any) {
      toast.error("Lỗi xuất file", { description: error.message });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" richColors />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl text-gray-900">Quản lý hóa đơn</h1>
        </div>
        
      </div>
      
      {/* First Row: Date Filter + Search */}
      <div className="flex items-center gap-3 mb-4">
        {/* Date/Year Filter */}
        <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm px-3 py-2 transition-all hover:border-blue-400 hover:shadow-md">
          <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0 mr-2" />
          
          {/* Select MONTH - Bắt buộc chọn */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="text-sm font-medium text-gray-700 bg-transparent border-none focus:ring-0 cursor-pointer outline-none appearance-none pr-6"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236b7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0 center', backgroundSize: '16px' }}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
              <option key={month} value={month}>Tháng {month}</option>
            ))}
          </select>
          
          {/* Divider */}
          <div className="w-px h-4 bg-gray-300 mx-2"></div>
          
          {/* Select YEAR */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="text-sm font-medium text-gray-700 bg-transparent border-none focus:ring-0 cursor-pointer outline-none appearance-none pr-6"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236b7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0 center', backgroundSize: '16px' }}
          >
            {[currentDate.getFullYear() - 1, currentDate.getFullYear(), currentDate.getFullYear() + 1].map(year => (
              <option key={year} value={year}>Năm {year}</option>
            ))}
          </select>
        </div>

        {/* Search Bar */}
        <div className="relative w-96">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm hoá đơn theo số phòng"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white rounded-full shadow-sm border border-gray-200 px-4 py-2 pl-12 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Second Row: Filter Tabs + Tạo hóa đơn Button */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex gap-3">
          <button
            onClick={() => setStatusFilter('All')}
            className={`rounded-xl border shadow-sm px-4 py-2 text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50 cursor-pointer transition-all ${
              statusFilter === 'All'
                ? 'bg-blue-50 text-blue-700 border-blue-500'
                : 'bg-white border-gray-200 text-gray-600'
            }`}
          >
            <List className="w-4 h-4" />
            Tất cả
          </button>
          <button
            onClick={() => setStatusFilter('PAID')}
            className={`rounded-xl border shadow-sm px-4 py-2 text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50 cursor-pointer transition-all ${
              statusFilter === 'PAID'
                ? 'bg-green-50 text-green-700 border-green-500'
                : 'bg-white border-gray-200 text-gray-600'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            Đã thanh toán
          </button>
          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`rounded-xl border shadow-sm px-4 py-2 text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50 cursor-pointer transition-all ${
              statusFilter === 'PENDING'
                ? 'bg-yellow-50 text-yellow-700 border-yellow-500'
                : 'bg-white border-gray-200 text-gray-600'
            }`}
          >
            <Clock className="w-4 h-4" />
            Chờ duyệt
          </button>
          <button
            onClick={() => setStatusFilter('UNPAID')}
            className={`rounded-xl border shadow-sm px-4 py-2 text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50 cursor-pointer transition-all ${
              statusFilter === 'UNPAID'
                ? 'bg-red-50 text-red-700 border-red-500'
                : 'bg-white border-gray-200 text-gray-600'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            Chưa thanh toán
          </button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
          disabled={isUploading}
        />

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Tạo hóa đơn Button */}
          <button
            onClick={handleUploadClick}
            disabled={isUploading || isGenerating}
            className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 ${
              isUploading || isGenerating
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
            }`}
          >
            {isUploading || isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang tạo...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Tạo hóa đơn
              </>
            )}
          </button>

          {/* Duyệt Button - Hiển thị khi đã upload file */}
          {isDataLoaded && bills.some(bill => bill.status === 'PENDING') && (
            <button
              onClick={handleApproveAll}
              disabled={isApproving}
              className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                isApproving
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg'
              }`}
            >
              {isApproving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang duyệt...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Duyệt
                </>
              )}
            </button>
          )}

          {/* Thanh toán Button - Hiển thị khi có hóa đơn đã duyệt (UNPAID) */}
          {bills.some(bill => bill.status === 'UNPAID') && (
            <button
              onClick={handlePayAll}
              className="px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg"
            >
              <CreditCard className="w-4 h-4" />
              Thanh toán
            </button>
          )}
          <button
            onClick={handleExportExcel}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
            ) : (
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            )}
            <span>Xuất file Excel</span>
          </button>
        </div>
      </div>

      {/* Empty State - Hiển thị khi chưa có hóa đơn */}
      {!hasInvoices && !isLoading && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có hóa đơn</h3>
          <p className="text-gray-600">Tháng {selectedMonth}/{selectedYear} chưa có hóa đơn. Hãy sử dụng nút "Tạo hóa đơn" ở trên để tạo hóa đơn.</p>
        </div>
      )}

      {/* Bills Table - SỬ DỤNG filteredBills */}
      {hasInvoices && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-center px-6 py-3 text-gray-500 font-bold text-sm uppercase tracking-wider">STT</th>
                  <th className="text-center px-6 py-3 text-gray-500 font-bold text-sm uppercase tracking-wider">Căn hộ</th>
                  <th className="text-center px-6 py-3 text-gray-500 font-bold text-sm uppercase tracking-wider">Hóa đơn</th>
                  <th className="text-center px-6 py-3 text-gray-500 font-bold text-sm uppercase tracking-wider">Số tiền</th>
                  <th className="text-center px-6 py-3 text-gray-500 font-bold text-sm uppercase tracking-wider">Trạng thái</th>
                  <th className="text-center px-6 py-3 text-gray-500 font-bold text-sm uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr><td colSpan={6} className="text-center py-6 text-gray-500">Đang tải hóa đơn...</td></tr>
                ) : filteredBills.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-6 text-gray-500">Không tìm thấy hóa đơn nào phù hợp với bộ lọc.</td></tr>
                ) : (
                  filteredBills.map((bill, index) => (
                    <tr 
                      key={bill.id} 
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-center align-middle text-gray-700 text-sm">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 text-center align-middle">
                        <span className="px-3 py-1 bg-gray-200 text-gray-800 rounded-lg text-sm whitespace-nowrap inline-block">
                          {bill.apartmentLabel || bill.apartmentNumber || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-700 text-sm align-middle">
                        {selectedMonth}/{selectedYear}
                      </td>
                      <td 
                        className="px-6 py-4 text-center align-middle"
                        onClick={() => {
                          if (bill.status === 'PENDING' && isDataLoaded) {
                            handleCellEdit(bill.id, 'totalAmount', bill.totalAmount);
                          }
                        }}
                        style={{ cursor: bill.status === 'PENDING' && isDataLoaded ? 'pointer' : 'default' }}
                      >
                        {editingCell && editingCell.row === bill.id && editingCell.col === 'totalAmount' ? (
                          <input
                            type="number"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onBlur={() => handleCellSave(bill.id, 'totalAmount')}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleCellSave(bill.id, 'totalAmount');
                              } else if (e.key === 'Escape') {
                                handleCellCancel();
                              }
                            }}
                            className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                            autoFocus
                          />
                        ) : (
                          <span className={`text-gray-900 font-bold ${bill.status === 'PENDING' && isDataLoaded ? 'hover:bg-blue-100 px-2 py-1 rounded' : ''}`}>
                            {formatCurrency(bill.totalAmount)}
                          </span>
                        )}
                      </td>
      
                      <td className="px-6 py-4 text-center align-middle">
                        <span className={`rounded-full px-3 py-1 inline-flex items-center gap-2 w-fit text-sm font-medium ${
                          bill.status === 'PAID' 
                            ? 'bg-green-100 text-green-700' 
                            : bill.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {bill.status === 'PAID' && <CheckCircle className="w-4 h-4" />}
                          {bill.status === 'PENDING' && <Clock className="w-4 h-4" />}
                          {bill.status === 'UNPAID' && <AlertCircle className="w-4 h-4" />}
                          {bill.status === 'PAID' ? 'Đã thanh toán' : 
                           bill.status === 'PENDING' ? 'Chờ duyệt' : 
                           'Chưa thanh toán'}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 text-center align-middle">
                        <div className="flex items-center justify-center gap-2">
                          {/* Xem chi tiết - Luôn có */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedInvoice(bill);
                            }}
                            className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                          >
                            Xem chi tiết
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Bill Modal */}
      <Modal
        isOpen={isCreateBillOpen}
        onClose={() => setIsCreateBillOpen(false)}
        title="Tạo hóa đơn mới"
      >
        {/* ... Modal Content ... */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">Chọn căn hộ</label>
              <select 
                value={createBillForm.apartment}
                onChange={(e) => setCreateBillForm({ ...createBillForm, apartment: e.target.value })}
                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- Chọn căn hộ --</option>
                <option value="Căn hộ 304 - Emma Johnson">Căn hộ 304 - Emma Johnson</option>
                <option value="Căn hộ 112 - Michael Chen">Căn hộ 112 - Michael Chen</option>
                <option value="Căn hộ 205 - Sarah Williams">Căn hộ 205 - Sarah Williams</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Loại hóa đơn</label>
              <select 
                value={createBillForm.billType}
                onChange={(e) => setCreateBillForm({ ...createBillForm, billType: e.target.value })}
                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Tiền thuê">Tiền thuê</option>
                <option value="Tiện ích">Tiện ích</option>
                <option value="Đỗ xe">Đỗ xe</option>
                <option value="Bảo trì">Bảo trì</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Số tiền</label>
              <input
                type="number"
                placeholder="0.00"
                value={createBillForm.amount}
                onChange={(e) => setCreateBillForm({ ...createBillForm, amount: e.target.value })}
                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">Mô tả (Tùy chọn)</label>
            <textarea
              rows={3}
              placeholder="Thêm chi tiết bổ sung..."
              value={createBillForm.description}
              onChange={(e) => setCreateBillForm({ ...createBillForm, description: e.target.value })}
              className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => setIsCreateBillOpen(false)}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
            >
              Hủy
            </button>
            <button 
              onClick={handleCreateBill}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-xl transition-all cursor-pointer"
              type="button"
            >
              Tạo hóa đơn
            </button>
          </div>
        </div>
      </Modal>

      {/* Update Payment Status Modal */}
      <Modal
        isOpen={isUpdatePaymentOpen}
        onClose={() => {
          setIsUpdatePaymentOpen(false);
          setSelectedBill(null);
        }}
        title="Cập nhật trạng thái thanh toán"
      >
        <div className="p-6 space-y-6">
          {/* Status Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Trạng thái</label>
            <div className="space-y-2">
              {[
                { value: 'UNPAID', label: 'Chưa thanh toán' },
                { value: 'PENDING', label: 'Đang chờ' },
                { value: 'PAID', label: 'Đã thanh toán' }
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value={option.value}
                    checked={paymentForm.status === option.value}
                    onChange={(e) => setPaymentForm({ ...paymentForm, status: e.target.value })}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Payment Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ngày thanh toán</label>
            <input
              type="date"
              value={paymentForm.paymentDate}
              onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
              className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hình thức</label>
            <select
              value={paymentForm.paymentMethod}
              onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
              className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Cash">Tiền mặt</option>
              <option value="BankTransfer">Chuyển khoản</option>
            </select>
          </div>

          {/* Footer Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                setIsUpdatePaymentOpen(false);
                setSelectedBill(null);
              }}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSavePaymentUpdate}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              Lưu cập nhật
            </button>
          </div>
        </div>
      </Modal>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 z-[9999]"
            onClick={() => setSelectedInvoice(null)}
          />
          
          {/* Modal Card */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div 
              className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedInvoice(null)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>

              {/* Header */}
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pr-8">Chi tiết hóa đơn</h2>

              {/* Section A: Customer Info */}
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="grid grid-cols-2 gap-y-2">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Căn hộ</p>
                    <p className="text-sm font-medium text-gray-900">{selectedInvoice.apartmentLabel || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Tòa nhà</p>
                    <p className="text-sm font-medium text-gray-900">Landmark 81</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Chủ hộ</p>
                    <p className="text-sm font-medium text-gray-900">Nguyễn Văn A</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">SĐT</p>
                    <p className="text-sm font-medium text-gray-900">0987.654.321</p>
                  </div>
                </div>
              </div>

              {/* Section B: Bill Breakdown */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Chi tiết phí</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tiền điện</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency((selectedInvoice.totalAmount || 0) * 0.6)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tiền nước</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency((selectedInvoice.totalAmount || 0) * 0.1)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tiền dịch vụ</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency((selectedInvoice.totalAmount || 0) * 0.2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tiền gửi xe</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency((selectedInvoice.totalAmount || 0) * 0.1)}
                    </span>
                  </div>
                  
                  {/* Separator */}
                  <div className="border-t border-dashed border-gray-300 my-3" />
                  
                  {/* Total */}
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-gray-900">TỔNG CỘNG</span>
                    <span className="text-lg font-bold text-blue-600">
                      {formatCurrency(selectedInvoice.totalAmount || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedInvoice(null)}
                className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Đóng
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
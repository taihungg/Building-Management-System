import { Search, Plus, Download, Clock, CheckCircle, AlertCircle, DollarSign, Calendar, CreditCard, List, X, Loader2, Upload, FileSpreadsheet } from 'lucide-react';
import { Modal } from './Modal';
import { Toaster, toast } from 'sonner';
import { useState, useEffect, useRef } from 'react';
import React from 'react';
import * as XLSX from 'xlsx';
import { authProvider } from './auth';


export function DebtManagement() {
  const currentDate = new Date();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isCreateBillOpen, setIsCreateBillOpen] = useState(false);
  const [isUpdatePaymentOpen, setIsUpdatePaymentOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number | ''>('');
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
  const [isConfirming, setIsConfirming] = useState(false);

  // Không dùng localStorage nữa, chỉ dùng API thật

  // State cho inline editing
  const [editingCell, setEditingCell] = useState<{ row: string; col: string } | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');

  // Bắt buộc chọn tháng (không có "Tất cả các tháng")
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [isLoadingData, setIsLoadingData] = useState(false);

  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingAmount: 0,
    paidAmount: 0,
    unpaidAmount: 0
  });
  const handleConfirmInvoices = async () => {
    // 1. Lấy thông tin từ "kho" authProvider
    const staffId = authProvider.getPersonId();

    if (!staffId) {
      toast.error("Không tìm thấy thông tin nhân viên. Vui lòng đăng nhập lại!");
      return;
    }
    setIsApproving(true);

    // Xác nhận lại với người dùng cho chắc (Eliminate Waste - tránh bấm nhầm)


    setIsConfirming(true);
    try {
      // 2. Xây dựng URL với các tham số từ State và authProvider
      const url = `https://building-management-system.fly.dev/api/v1/accounting/invoices/confirm?month=${selectedMonth}&year=${selectedYear}&staffId=${authProvider.getPersonId()}`;

      const response = await fetch(url, {
        method: 'PATCH', // Thường confirm là hành động thay đổi dữ liệu nên dùng POST
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Lỗi khi xác nhận hóa đơn");
      }

      // 3. Thông báo thành công (Amplify Learning - Phản hồi ngay cho người dùng)
      toast.success("Xác nhận hóa đơn thành công!", {
        description: `Hệ thống đã chốt dữ liệu tháng ${selectedMonth}/${selectedYear}`
      });

      // 4. Load lại danh sách để cập nhật trạng thái mới nhất trên màn hình
      await fetchBills();

    } catch (error: any) {
      console.error("Lỗi Confirm:", error);
      toast.error("Xác nhận thất bại", { description: error.message });
    } finally {
      setIsConfirming(false);
      setIsApproving(false)
    }
  };

  const fetchBills = async () => {
    setIsLoading(true);
    try {
      // Bắt buộc có tháng và năm
      const url = `https://building-management-system.fly.dev/api/v1/accounting/invoices?year=${selectedYear}&month=${selectedMonth}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // 2. Thêm header để ngrok không chặn dữ liệu trả về
          'ngrok-skip-browser-warning': 'true'
        }
      });
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

  const handleGenerateInvoices = async () => {
    if (!selectedMonth) {
      toast.error("Vui lòng chọn tháng trước khi tạo hóa đơn");
      return;
    }

    setIsLoadingData(true);// Tận dụng state loading có sẵn

    try {
      // Gọi API POST với month và year trên URL
      const url = `https://building-management-system.fly.dev/api/v1/accounting/invoices/generation?month=${selectedMonth}&year=${selectedYear}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        // Vì chú bảo không cần file, nên body có thể để trống hoặc gửi {}
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Lỗi khi tạo hóa đơn");
      }

      const res = await response.json();

      // Thông báo thành công rực rỡ
      toast.success(`Đã khởi tạo hóa đơn thành công cho tháng ${selectedMonth}/${selectedYear}`, {
        description: "Hệ thống đã tính toán tiền điện, nước và phí dịch vụ.",
      });

      fetchBills();

    } catch (error: any) {
      console.error("Lỗi:", error);
      toast.error("Tạo hóa đơn thất bại", { description: error.message });
    } finally {
      setIsLoadingData(false);
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
            `https://building-management-system.fly.dev/api/v1/accounting/invoices/generation?month=${selectedMonth}&year=${selectedYear}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true'
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
      const response = await fetch(`https://building-management-system.fly.dev/api/v1/accounting/invoices/approve-all?month=${selectedMonth}&year=${selectedYear}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
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
      const response = await fetch(`https://building-management-system.fly.dev/api/v1/accounting/invoices/${billId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
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

  // Open Payment Modal
  const handlePaymentClick = async (bill: any) => {
    // Show modal immediately with existing data or a loading state
    setSelectedBill({ ...bill, isLoading: true });
    setPaymentAmount('');
    setIsPaymentModalOpen(true);

    try {
      const url = `https://building-management-system.fly.dev/api/v1/accounting/invoices/${bill.id}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });

      if (response.ok) {
        const res = await response.json();
        const { invoice } = res.data;
        setSelectedBill({ ...invoice, isLoading: false });
      } else {
        setSelectedBill((prev: any) => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error("Error fetching latest invoice for payment:", error);
      setSelectedBill((prev: any) => ({ ...prev, isLoading: false }));
    }
  };

  // Confirm Payment
  const handleConfirmPayment = async () => {
    if (!selectedBill || !paymentAmount) return;

    const amount = Number(paymentAmount);
    const remaining = selectedBill.totalAmount - (selectedBill.paidAmount || 0);

    // Validation
    if (amount <= 0) {
      toast.error('Số tiền phải lớn hơn 0');
      return;
    }
    if (amount > remaining) {
      toast.error('Số tiền thanh toán không được vượt quá số tiền còn nợ', {
        description: `Còn nợ: ${formatCurrency(remaining)}`
      });
      return;
    }

    try {
      const url = `https://building-management-system.fly.dev/api/v1/accounting/invoices/${selectedBill.id}/payment`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          paymentAmount: amount
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Lỗi thanh toán');
      }

      toast.success('Thanh toán thành công', {
        description: `Đã thanh toán ${formatCurrency(amount)} cho hóa đơn ${selectedBill.apartmentLabel}`
      });

      setIsPaymentModalOpen(false);
      setPaymentAmount('');
      setSelectedBill(null);

      // Reload data
      fetchBills();

    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error('Thanh toán thất bại', { description: error.message });
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
      toast.info("Chưa hỗ trợ thanh toán hàng loạt", {
        description: "Backend hiện chưa có API /api/v1/accounting/invoices/pay-all",
      });
    } catch (error) {
      console.error("Lỗi thanh toán:", error);
      toast.error("Lỗi thanh toán", { description: (error as Error).message });
    }
  };

  useEffect(() => {
    fetchBills();
  }, [selectedMonth, selectedYear]);

  const calculateStats = (data: any[]) => {
    const initialStats: { totalRevenue: number; pendingAmount: number; paidAmount: number; unpaidAmount: number } = {
      totalRevenue: 0,
      pendingAmount: 0,
      paidAmount: 0,
      unpaidAmount: 0
    };

    const calculated = data.reduce((acc: typeof initialStats, bill: any) => {
      const amount = Number(bill?.totalAmount || 0);

      acc.totalRevenue += amount;

      if (bill.status === 'PAID') {
        acc.paidAmount += amount;
      } else if (bill.status === 'PENDING') {
        acc.pendingAmount += amount;
      } else if (bill.status === 'PARTIAL') {
        // Partial means some paid, some unpaid. The totalAmount is the full invoice amount.
        // We should add the remaining debt to unpaidAmount.
        // Or if we strictly want "Status-based" stats:
        acc.unpaidAmount += (amount - (bill.paidAmount || 0));
        acc.paidAmount += (bill.paidAmount || 0);
      } else {
        // UNPAID
        acc.unpaidAmount += amount;
      }

      return acc;
    }, initialStats);

    setStats(calculated);
  };

  const formatCurrency = (amount: number) => {
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
      const url = `https://building-management-system.fly.dev/api/v1/accounting/invoices/export?month=${selectedMonth}&year=${selectedYear}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
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

  const handleDownloadPDF = async (invoiceId: string, invoiceCode: string) => {
    try {
      toast.info("Đang tải xuống PDF...");
      // Assuming GET endpoint for PDF download
      const url = `https://building-management-system.fly.dev/api/v1/accounting/${invoiceId}/export-pdf`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (!response.ok) throw new Error('Không thể tải xuống PDF');

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `Hoa_don_${invoiceCode}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      toast.success("Tải xuống PDF thành công");
    } catch (error) {
      console.error("Download PDF error:", error);
      toast.error("Lỗi tải xuống PDF");
    }
  };

  const handleViewDetail = async (billId: string) => {
    try {
      // Find basic info locally first to show immediately
      const basicBill = bills.find(b => b.id === billId);
      if (basicBill) {
        setSelectedInvoice({ ...basicBill, details: [], isLoadingDetails: true });
      }

      const url = `https://building-management-system.fly.dev/api/v1/accounting/invoices/${billId}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });

      if (!response.ok) {
        const err = await response.text();
        console.error("Error fetching invoice details:", response.status, err);
        throw new Error(`Không thể tải chi tiết (${response.status})`);
      }

      const res = await response.json();
      const { invoice, details } = res.data;

      // Keep raw details for full display
      const processedDetails = details || [];

      setSelectedInvoice((prev: any) => ({
        ...prev,
        ...invoice,
        details: processedDetails,
        isLoadingDetails: false
      }));

    } catch (error) {
      console.error(error);
      toast.error("Không thể tải chi tiết hóa đơn");
    }
  };

  return (
    <div className="space-y-6">
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
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
            className={`rounded-xl border shadow-sm px-4 py-2 text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50 cursor-pointer transition-all ${statusFilter === 'All'
              ? 'bg-blue-50 text-blue-700 border-blue-500'
              : 'bg-white border-gray-200 text-gray-600'
              }`}
          >
            <List className="w-4 h-4" />
            Tất cả
          </button>
          <button
            onClick={() => setStatusFilter('PAID')}
            className={`rounded-xl border shadow-sm px-4 py-2 text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50 cursor-pointer transition-all ${statusFilter === 'PAID'
              ? 'bg-green-50 text-green-700 border-green-500'
              : 'bg-white border-gray-200 text-gray-600'
              }`}
          >
            <CheckCircle className="w-4 h-4" />
            Đã thanh toán
          </button>
          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`rounded-xl border shadow-sm px-4 py-2 text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50 cursor-pointer transition-all ${statusFilter === 'PENDING'
              ? 'bg-yellow-50 text-yellow-700 border-yellow-500'
              : 'bg-white border-gray-200 text-gray-600'
              }`}
          >
            <Clock className="w-4 h-4" />
            Chờ duyệt
          </button>
          <button
            onClick={() => setStatusFilter('UNPAID')}
            className={`rounded-xl border shadow-sm px-4 py-2 text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50 cursor-pointer transition-all ${statusFilter === 'UNPAID'
              ? 'bg-red-50 text-red-700 border-red-500'
              : 'bg-white border-gray-200 text-gray-600'
              }`}
          >
            <AlertCircle className="w-4 h-4" />
            Chưa thanh toán
          </button>
          <button
            onClick={() => setStatusFilter('PARTIAL')}
            className={`rounded-xl border shadow-sm px-4 py-2 text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50 cursor-pointer transition-all ${statusFilter === 'PARTIAL'
              ? 'bg-orange-50 text-orange-700 border-orange-500'
              : 'bg-white border-gray-200 text-gray-600'
              }`}
          >
            <Clock className="w-4 h-4" />
            Thanh toán một phần
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
            onClick={handleGenerateInvoices}
            disabled={isUploading || isGenerating}
            className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 ${isUploading || isGenerating
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

          {/* Duyệt Button - Hiển thị khi có hóa đơn PENDING */}
          {bills.some(bill => bill.status === 'PENDING') && (
            <button
              onClick={handleConfirmInvoices}
              disabled={isApproving}
              className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-md hover:shadow-lg ${isApproving
                ? 'bg-green-400 cursor-not-allowed' // Màu nhạt đi khi đang xử lý
                : 'bg-green-600 text-white hover:bg-green-700'
                }`}
            >
              {isApproving ? (
                <>
                  <Loader2 className="w-4 h-4" style={{ animation: 'spin 1s linear infinite' }} /> {/* Icon quay quay */}
                  <span>Đang duyệt...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Duyệt</span>
                </>
              )}
            </button>
          )}

          {/* Thanh toán Button - Hiển thị khi có hóa đơn đã duyệt (UNPAID) */}

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
      {isLoadingData && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center gap-3">
            {/* Vòng xoay quay tròn */}
            <div
              style={{
                width: '80px',
                height: '80px',
                border: '4px solid #e2e8f0', // Màu xám nhạt (blue-200)
                borderTop: '4px solid #2563eb', // Màu xanh đậm (blue-600)
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            >
              {/* Nhúng trực tiếp keyframes vào để trình duyệt hiểu lệnh 'spin' */}
              <style>{`
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `}</style>
            </div>
            <p className="text-sm font-bold text-gray-700">Đang xử lý, đợi tí...</p>
          </div>
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
                        <span className={`rounded-full px-3 py-1 inline-flex items-center gap-2 w-fit text-sm font-medium ${bill.status === 'PAID'
                          ? 'bg-green-100 text-green-700'
                          : bill.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-700'
                            : bill.status === 'PARTIAL'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                          {bill.status === 'PAID' && <CheckCircle className="w-4 h-4" />}
                          {bill.status === 'PENDING' && <Clock className="w-4 h-4" />}
                          {bill.status === 'PARTIAL' && <Clock className="w-4 h-4" />}
                          {bill.status === 'UNPAID' && <AlertCircle className="w-4 h-4" />}
                          {bill.status === 'PAID' ? 'Đã thanh toán' :
                            bill.status === 'PENDING' ? 'Chờ duyệt' :
                              bill.status === 'PARTIAL' ? 'Thanh toán một phần' :
                                'Chưa thanh toán'}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center align-middle">
                        <div className="flex items-center justify-center gap-2">
                          {/* Xem chi tiết - Luôn có */}
                          {/* Action Buttons */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetail(bill.id);
                              }}
                              className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                            >
                              Xem chi tiết
                            </button>

                            {/* Payment Button - Only for UNPAID or PARTIAL */}
                            {(bill.status === 'UNPAID' || bill.status === 'PARTIAL' || (bill.paidAmount || 0) < bill.totalAmount) && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePaymentClick(bill);
                                }}
                                className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors flex items-center gap-1"
                              >
                                <DollarSign className="w-4 h-4" />
                                Thanh toán
                              </button>
                            )}
                          </div>

                          {/* PDF Download Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadPDF(bill.id, bill.apartmentLabel || bill.apartmentNumber || 'Unknown');
                            }}
                            className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors flex items-center gap-1"
                            title="Tải PDF"
                          >
                            <Download className="w-4 h-4" />
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

      {/* Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Thanh toán hóa đơn"
      >
        <div className="p-6">
          {selectedBill && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2 relative">
                {selectedBill.isLoading && (
                  <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center rounded-lg z-10">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Căn hộ:</span>
                  <span className="font-semibold text-gray-900">{selectedBill.apartmentLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tổng hóa đơn:</span>
                  <span className="font-medium text-gray-900">{formatCurrency(selectedBill.totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Đã thanh toán:</span>
                  <span className="font-medium text-green-600">{formatCurrency(selectedBill.paidAmount || 0)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-gray-600 font-medium">Còn nợ:</span>
                  <span className="font-bold text-red-600">
                    {formatCurrency(selectedBill.totalAmount - (selectedBill.paidAmount || 0))}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số tiền thanh toán
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={paymentAmount === '' ? '' : Number(paymentAmount).toLocaleString('vi-VN')}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setPaymentAmount(val === '' ? '' : Number(val));
                    }}
                    className="w-full pr-12 pl-4 py-4 text-2xl font-bold text-blue-600 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-right shadow-inner bg-gray-50/30"
                    placeholder="0"
                    autoFocus
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-400">₫</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Nhập số tiền khách hàng thanh toán (không vượt quá số tiền còn nợ)
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmPayment}
                  disabled={!paymentAmount || Number(paymentAmount) <= 0}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <DollarSign className="w-4 h-4" />
                  Xác nhận thanh toán
                </button>
              </div>
            </div>
          )}
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
                </div>
              </div>


              {/* Section B: Bill Breakdown */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Chi tiết phí</h3>

                {selectedInvoice.isLoadingDetails ? (
                  <div className="flex justify-center py-4"><Loader2 className="animate-spin text-blue-500" /></div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                        <tr>
                          <th className="px-2 py-2">Dịch vụ</th>
                          <th className="px-2 py-2 text-center">SL</th>
                          <th className="px-2 py-2 text-right">Đơn giá</th>
                          <th className="px-2 py-2 text-right">Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {(selectedInvoice.details || []).map((detail: any, idx: number) => (
                          <tr key={idx}>
                            <td className="px-2 py-2">
                              <div className="font-medium text-gray-900">{detail.serviceTitle || detail.serviceName || detail.description}</div>
                              {(detail.oldIndex != null && detail.newIndex != null) && (
                                <div className="text-xs text-gray-500">
                                  {detail.oldIndex} → {detail.newIndex}
                                </div>
                              )}
                              {detail.description && detail.description !== detail.serviceTitle && (
                                <div className="text-xs text-gray-400 truncate max-w-[150px]" title={detail.description}>
                                  {detail.description}
                                </div>
                              )}
                            </td>
                            <td className="px-2 py-2 text-center text-gray-600">
                              {detail.quantity} <span className="text-xs">{(detail.serviceTitle === 'Phí quản lý') ? '' : detail.serviceUnit}</span>
                            </td>
                            <td className="px-2 py-2 text-right text-gray-600">
                              {detail.unitPrice ? formatCurrency(detail.unitPrice) : '-'}
                            </td>
                            <td className="px-2 py-2 text-right font-bold text-gray-900">
                              {formatCurrency(detail.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {(!selectedInvoice.details || selectedInvoice.details.length === 0) && (
                      <p className="text-sm text-gray-500 italic text-center py-2">Không có chi tiết dịch vụ.</p>
                    )}

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
                )}
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
      )
      }
    </div >
  );
}

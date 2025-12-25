import { Search, Plus, Download, Clock, CheckCircle, AlertCircle, DollarSign, Calendar, CreditCard, List, X } from 'lucide-react';
import { Modal } from './Modal';
import { Toaster, toast } from 'sonner';
import { useState, useEffect } from 'react';
import React from 'react';


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

  // Mock data for testing
  const mockBills = [
    {
      id: 1,
      apartmentLabel: 'P.1205',
      totalAmount: 2500000,
      paymentDate: '2025-02-15',
      status: 'UNPAID',
      createdTime: '2025-02-01T00:00:00'
    },
    {
      id: 2,
      apartmentLabel: 'P.1206',
      totalAmount: 3200000,
      paymentDate: '2025-02-20',
      status: 'PAID',
      createdTime: '2025-02-05T00:00:00'
    }
  ];

  const [bills, setBills] = useState(mockBills);
  const [isLoading, setIsLoading] = useState(false);
  
  // Mặc định là 0 để hiển thị "Tất cả các tháng"
  const [selectedMonth, setSelectedMonth] = useState(0); 
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
      // 1. LOGIC XÂY DỰNG URL: Mặc định lấy theo năm
      let url = `http://localhost:8081/api/v1/accounting/invoices?year=${selectedYear}`; 

      if (selectedMonth > 0) {
        url += `&month=${selectedMonth}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("Không thể tải dữ liệu hóa đơn");
      
      const res = await response.json();
      const data = res.data || [];
      
      // Use API data if available, otherwise use mock data
      if (data.length > 0) {
        setBills(data);
        calculateStats(data);
      } else {
        // Use mock data if API returns empty
        setBills(mockBills);
        calculateStats(mockBills);
      }
      
    } catch (error) {
      console.error("Lỗi tải hóa đơn:", error);
      // Keep mock data on error instead of clearing
      setBills(mockBills);
      calculateStats(mockBills);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Temporarily use mock data for testing
    setBills(mockBills);
    calculateStats(mockBills);
    // fetchBills(); // Commented out for testing
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
  const periodLabel = selectedMonth === 0 
    ? `Năm ${selectedYear}` 
    : `Tháng ${selectedMonth}/${selectedYear}`;

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


  return (
    <div className="space-y-6">
      <Toaster position="top-right" richColors />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl text-gray-900">Quản lý hóa đơn</h1>
        </div>
        
      </div>
      
      {/* Toolbar: Search + Filter Pills - Pill Design */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex w-full items-center justify-between gap-3">
          {/* Left Side: Date Picker + Search Input */}
          <div className="flex items-center gap-3">
            {/* Date Picker */}
            <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm px-3 py-2 transition-all hover:border-blue-400 hover:shadow-md">
              <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0 mr-2" />
              
              {/* Select MONTH */}
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="text-sm font-medium text-gray-700 bg-transparent border-none focus:ring-0 cursor-pointer outline-none appearance-none pr-6"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236b7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0 center', backgroundSize: '16px' }}
              >
                <option value={0}>Tất cả các tháng</option>
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

            {/* Search Input - Pill Style */}
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

          {/* Filter Buttons - Pill Chips */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStatusFilter('All')}
              className={`bg-white rounded-full border shadow-sm px-4 py-2 text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50 cursor-pointer transition-all ${
                statusFilter === 'All'
                  ? 'border-blue-500 text-blue-700'
                  : 'border-gray-200 text-gray-600'
              }`}
            >
              <List className="w-4 h-4" />
              Tất cả
            </button>
            <button
              onClick={() => setStatusFilter('PAID')}
              className={`bg-white rounded-full border shadow-sm px-4 py-2 text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50 cursor-pointer transition-all ${
                statusFilter === 'PAID'
                  ? 'border-blue-500 text-blue-700'
                  : 'border-gray-200 text-gray-600'
              }`}
            >
              <CheckCircle className="w-4 h-4 text-green-600" />
              Đã thanh toán
            </button>
            <button
              onClick={() => setStatusFilter('PENDING')}
              className={`bg-white rounded-full border shadow-sm px-4 py-2 text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50 cursor-pointer transition-all ${
                statusFilter === 'PENDING'
                  ? 'border-blue-500 text-blue-700'
                  : 'border-gray-200 text-gray-600'
              }`}
            >
              <Clock className="w-4 h-4 text-blue-600" />
              Đang chờ
            </button>
            <button
              onClick={() => setStatusFilter('UNPAID')}
              className={`bg-white rounded-full border shadow-sm px-4 py-2 text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50 cursor-pointer transition-all ${
                statusFilter === 'UNPAID'
                  ? 'border-blue-500 text-blue-700'
                  : 'border-gray-200 text-gray-600'
              }`}
            >
              <AlertCircle className="w-4 h-4 text-red-600" />
              Chưa thanh toán
            </button>
          </div>
        </div>
      </div>

      {/* Bills Table - SỬ DỤNG filteredBills */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-center px-6 py-3 text-gray-500 font-bold text-sm uppercase tracking-wider">Căn hộ</th>
                <th className="text-center px-6 py-3 text-gray-500 font-bold text-sm uppercase tracking-wider">Ngày thanh toán</th>
                <th className="text-center px-6 py-3 text-gray-500 font-bold text-sm uppercase tracking-wider">Số tiền</th>
                <th className="text-center px-6 py-3 text-gray-500 font-bold text-sm uppercase tracking-wider">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={4} className="text-center py-6 text-gray-500">Đang tải hóa đơn...</td></tr>
              ) : filteredBills.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-6 text-gray-500">Không tìm thấy hóa đơn nào trong {periodLabel}.</td></tr>
              ) : (
                filteredBills.map((bill) => (
                  <tr 
                    key={bill.id} 
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedInvoice(bill)}
                  >
                    <td className="px-6 py-4 text-center align-middle">
                      <span className="px-3 py-1 bg-gray-200 text-gray-800 rounded-lg text-sm whitespace-nowrap inline-block">
                        {bill.apartmentLabel}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-700 text-sm align-middle">
                      {bill.status === 'PAID' && bill.paymentDate 
                        ? new Date(bill.paymentDate).toLocaleDateString('vi-VN') 
                        : bill.status === 'UNPAID' 
                        ? '-' 
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-center align-middle">
                      <span className="text-gray-900 font-bold">{formatCurrency(bill.totalAmount)}</span>
                    </td>
    
                    <td className="px-6 py-4 text-center align-middle">
                      <span className={`rounded-full px-3 py-1 inline-flex items-center gap-2 w-fit text-sm font-medium ${
                        bill.status === 'PAID' 
                          ? 'bg-green-100 text-green-700' 
                          : bill.status === 'PENDING'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {bill.status === 'PAID' && <CheckCircle className="w-4 h-4" />}
                        {bill.status === 'PENDING' && <Clock className="w-4 h-4" />}
                        {bill.status === 'UNPAID' && <AlertCircle className="w-4 h-4" />}
                        {bill.status === 'PAID' ? 'Đã thanh toán' : 
                         bill.status === 'PENDING' ? 'Đang chờ' : 
                         'Chưa thanh toán'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
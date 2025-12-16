import { Search, Plus, Download, Clock, CheckCircle, AlertCircle, DollarSign, Calendar, CreditCard } from 'lucide-react';
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

  const [bills, setBills] = useState([]);
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
          <p className="text-gray-600 mt-1">Theo dõi và quản lý tất cả hóa đơn và thanh toán</p>
        </div>
        
        {/* UI CHỌN THÁNG VÀ NĂM */}
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-xl shadow-sm">
                <Calendar className="w-5 h-5 text-gray-500" />
                
                {/* Select MONTH */}
                <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="bg-transparent text-gray-700 font-medium focus:outline-none"
                >
                    <option value={0}>Tất cả các tháng</option> {/* Tùy chọn cho cả năm */}
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                        <option key={month} value={month}>Tháng {month}</option>
                    ))}
                </select>
                
                {/* Select YEAR */}
                <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="bg-transparent text-gray-700 font-medium focus:outline-none"
                >
                    {[currentDate.getFullYear() - 1, currentDate.getFullYear(), currentDate.getFullYear() + 1].map(year => (
                        <option key={year} value={year}>Năm {year}</option>
                    ))}
                </select>
            </div>
          
            <button 
                onClick={() => {
                  console.log('Button clicked, opening modal');
                  setIsCreateBillOpen(true);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-xl transition-all cursor-pointer"
                type="button"
            >
                <Plus className="w-5 h-5" />
                Tạo hóa đơn
            </button>
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo căn hộ, cư dân, hoặc loại hóa đơn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-100 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6">
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2">
        {[
          { value: 'All', label: 'Tất cả' },
          { value: 'PAID', label: 'Đã thanh toán' },
          { value: 'PENDING', label: 'Đang chờ' },
          { value: 'UNPAID', label: 'Chưa thanh toán' }
        ].map((status) => (
          <button
            key={status.value}
            onClick={() => setStatusFilter(status.value)}
            className={`px-6 py-3 rounded-xl transition-all ${
              statusFilter === status.value
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-indigo-100'
            }`}
          >
            {status.label}
          </button>
        ))}
      </div>

      {/* Bills Table - SỬ DỤNG filteredBills */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-indigo-100 to-purple-100 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm text-gray-700">Căn hộ</th>
                <th className="text-left px-6 py-4 text-sm text-gray-700">Ngày thanh toán</th>
                <th className="text-left px-6 py-4 text-sm text-gray-700">Số tiền</th>
                <th className="text-left px-6 py-4 text-sm text-gray-700">Trạng thái</th>
                <th className="text-left px-6 py-4 text-sm text-gray-700">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-6 text-gray-500">Đang tải hóa đơn...</td></tr>
              ) : filteredBills.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-6 text-gray-500">Không tìm thấy hóa đơn nào trong {periodLabel}.</td></tr>
              ) : (
                filteredBills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-indigo-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-gray-200 text-gray-800 rounded-lg">
                        {bill.apartmentLabel}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {bill.paymentDate ? new Date(bill.paymentDate).toLocaleDateString('vi-VN') : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-900">{formatCurrency(bill.totalAmount)}</span>
                    </td>
    
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                        bill.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                        bill.status === 'PENDING' ? 'bg-blue-100 text-blue-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {bill.status === 'PAID' && <CheckCircle className="w-4 h-4" />}
                        {bill.status === 'PENDING' && <Clock className="w-4 h-4" />}
                        {bill.status === 'UNPAID' && <AlertCircle className="w-4 h-4" />}
                        {bill.status === 'PAID' ? 'Đã thanh toán' : 
                         bill.status === 'PENDING' ? 'Đang chờ' : 
                         'Chưa thanh toán'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleUpdatePaymentClick(bill)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Cập nhật thanh toán"
                      >
                        <CreditCard className="w-5 h-5" />
                      </button>
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
    </div>
  );
}
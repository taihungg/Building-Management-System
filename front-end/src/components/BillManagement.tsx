import { Search, Plus, Download, Clock, CheckCircle, AlertCircle, DollarSign, Calendar } from 'lucide-react';
import { Modal } from './Modal';
import { Toaster, toast } from 'sonner';
import { useState, useEffect } from 'react';
import React from 'react';


export function BillManagement() {
  const currentDate = new Date();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isCreateBillOpen, setIsCreateBillOpen] = useState(false);

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
      let url = `http://localhost:8081/api/v1/accounting?year=${selectedYear}`; 

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


  return (
    <div className="space-y-6">
      <Toaster position="top-right" richColors />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl text-gray-900">Bill Management</h1>
          <p className="text-gray-600 mt-1">Track and manage all billing and payments</p>
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
                onClick={() => setIsCreateBillOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-xl transition-all"
            >
                <Plus className="w-5 h-5" />
                Create Bill
            </button>
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by unit, resident, or bill type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-100 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6">
        {/* PAID */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <p className="text-gray-600 text-sm">Paid</p>
          </div>
          <p className="text-2xl text-gray-900">{ formatCurrency(stats.paidAmount) }</p>
          <p className="text-sm text-emerald-700 mt-1">{bills.filter(b => b.status === 'PAID').length} bills</p>
        </div>

        {/* PENDING */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <p className="text-gray-600 text-sm">Pending</p>
          </div>
          <p className="text-2xl text-gray-900">{formatCurrency(stats.pendingAmount)}</p>
          <p className="text-sm text-blue-700 mt-1">{bills.filter(b => b.status === 'PENDING').length} bills</p>
        </div>

        {/* UNPAID / OVERDUE */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-rose-500 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <p className="text-gray-600 text-sm">Unpaid</p>
          </div>
          <p className="text-2xl text-gray-900">{formatCurrency(stats.unpaidAmount)}</p>
          <p className="text-sm text-rose-700 mt-1">{bills.filter(b => b.status === 'UNPAID').length} bills</p>
        </div>

        {/* TOTAL REVENUE */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <p className="text-gray-600 text-sm">Total Bills Value</p>
          </div>
          <p className="text-2xl text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
          <p className="text-sm text-purple-700 mt-1">Total {bills.length} bills</p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2">
        {['All', 'PAID', 'PENDING', 'UNPAID'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-6 py-3 rounded-xl transition-all ${
              statusFilter === status
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-indigo-100'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Bills Table - SỬ DỤNG filteredBills */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-indigo-100 to-purple-100 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm text-gray-700">Unit</th>
                <th className="text-left px-6 py-4 text-sm text-gray-700">Payment Date</th>
                <th className="text-left px-6 py-4 text-sm text-gray-700">Amount</th>
                <th className="text-left px-6 py-4 text-sm text-gray-700">Status</th>
                <th className="text-left px-6 py-4 text-sm text-gray-700">Action</th>
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
                        {bill.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {bill.status !== 'PAID' ? (
                        <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm rounded-lg hover:shadow-xl transition-all">
                          Mark Paid
                        </button>
                      ) : (
                        <span className="text-sm text-gray-500">Paid on {bill.paymentDate ? new Date(bill.paymentDate).toLocaleDateString('vi-VN') : 'N/A'}</span>
                      )}
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
        title="Create New Bill"
      >
        {/* ... Modal Content ... */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">Select Unit</label>
              <select className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Unit 304 - Emma Johnson</option>
                <option>Unit 112 - Michael Chen</option>
                <option>Unit 205 - Sarah Williams</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Bill Type</label>
              <select className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Rent</option>
                <option>Utilities</option>
                <option>Parking</option>
                <option>Maintenance</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Amount</label>
              <input
                type="number"
                placeholder="0.00"
                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">Description (Optional)</label>
            <textarea
              rows={3}
              placeholder="Add any additional details..."
              className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => setIsCreateBillOpen(false)}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-xl transition-all">
              Create Bill
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
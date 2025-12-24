import { useState, useEffect } from 'react';
import { Search, Download, Clock, CheckCircle, AlertCircle, DollarSign, Receipt, Calendar, CheckCircle2, Wallet, Banknote, AlertTriangle } from 'lucide-react';
import { getBills, payBill, subscribe, exportToCSV, type Bill } from '../utils/bills';
import { addAnnouncement } from '../utils/announcements';

export function ResidentBills() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Pending' | 'Overdue'>('All');
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [bills, setBills] = useState<Bill[]>(getBills());
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [paidBill, setPaidBill] = useState<Bill | null>(null);

  useEffect(() => {
    const unsubscribe = subscribe((updatedBills) => {
      setBills(updatedBills);
    });
    return unsubscribe;
  }, []);

  const filteredBills = bills.filter(bill => {
    const matchesSearch = bill.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.period.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || bill.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPaid = bills.filter(b => b.status === 'Paid').reduce((sum, b) => sum + b.amount, 0);
  const totalPending = bills.filter(b => b.status === 'Pending').reduce((sum, b) => sum + b.amount, 0);
  const totalOverdue = bills.filter(b => {
    if (b.status === 'Pending') {
      const dueDate = new Date(b.dueDate);
      const today = new Date();
      return dueDate < today;
    }
    return false;
  }).reduce((sum, b) => sum + b.amount, 0);

  const handlePayBill = (bill: Bill) => {
    const updatedBill = payBill(bill.id);
    if (updatedBill) {
      setPaidBill(updatedBill);
      setShowSuccessModal(true);
      setSelectedBill(null);
      
      // Add success announcement
      const now = new Date();
      const timeAgo = 'Vừa xong';
      addAnnouncement({
        type: 'success',
        icon: null,
        title: `Thanh toán thành công: ${bill.type}`,
        message: `Bạn đã thanh toán thành công hóa đơn ${bill.type} - ${bill.period} với số tiền ${bill.amount.toLocaleString('vi-VN')} đ. Cảm ơn bạn đã thanh toán đúng hạn!`,
        time: timeAgo,
        date: now.toISOString().split('T')[0],
        read: false,
        color: 'emerald'
      });
    }
  };

  const handleExport = () => {
    exportToCSV(bills);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl text-gray-900">Quản lý tài chính</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Card 1: Đã thanh toán - Green */}
        <div className="h-32 rounded-2xl p-6 flex justify-between items-center text-white shadow-sm relative overflow-hidden" style={{ backgroundColor: '#059669' }}>
          <div className="flex flex-col">
            <p className="text-3xl font-bold">{totalPaid.toLocaleString('vi-VN')} đ</p>
            <p className="text-sm font-medium opacity-80 mt-1">Đã thanh toán</p>
          </div>
          <CheckCircle className="w-12 h-12 opacity-20 flex-shrink-0" />
        </div>

        {/* Card 2: Phí cần đóng - Navy */}
        <div className="h-32 rounded-2xl p-6 flex justify-between items-center text-white shadow-sm relative overflow-hidden" style={{ backgroundColor: '#1e293b' }}>
          <div className="flex flex-col">
            <p className="text-3xl font-bold">{totalPending.toLocaleString('vi-VN')} đ</p>
            <p className="text-sm font-medium opacity-80 mt-1">Phí cần đóng</p>
          </div>
          <Wallet className="w-12 h-12 opacity-20 flex-shrink-0" />
        </div>

        {/* Card 3: Hóa đơn trễ hạn - Red */}
        <div className="h-32 rounded-2xl p-6 flex justify-between items-center text-white shadow-sm relative overflow-hidden" style={{ backgroundColor: '#dc2626' }}>
          <div className="flex flex-col">
            <p className="text-3xl font-bold">{totalOverdue.toLocaleString('vi-VN')} đ</p>
            <p className="text-sm font-medium opacity-80 mt-1">Hóa đơn trễ hạn</p>
          </div>
          <AlertTriangle className="w-12 h-12 opacity-20 flex-shrink-0" />
        </div>

        {/* Card 4: Sổ chi tiêu - Indigo */}
        <div className="h-32 rounded-2xl p-6 flex justify-between items-center text-white shadow-sm relative overflow-hidden" style={{ backgroundColor: '#4f46e5' }}>
          <div className="flex flex-col">
            <p className="text-3xl font-bold">{(totalPaid + totalPending).toLocaleString('vi-VN')} đ</p>
            <p className="text-sm font-medium opacity-80 mt-1">Sổ chi tiêu</p>
          </div>
          <Banknote className="w-12 h-12 opacity-20 flex-shrink-0" />
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo loại hóa đơn hoặc kỳ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Actions Row: Filter Tabs & Export Button */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          {['All', 'Paid', 'Pending', 'Overdue'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as typeof statusFilter)}
              className={`px-6 py-3 rounded-xl transition-all ${
                statusFilter === status
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {status === 'All' ? 'Tất cả' : 
               status === 'Paid' ? 'Đã thanh toán' :
               status === 'Pending' ? 'Chưa thanh toán' : 'Quá hạn'}
            </button>
          ))}
        </div>
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <Download className="w-5 h-5" />
          Xuất file
        </button>
      </div>

      {/* Bills List */}
      <div className="space-y-3">
        {filteredBills.map((bill) => {
          const isOverdue = bill.status === 'Pending' && new Date(bill.dueDate) < new Date();
          
          return (
            <div 
              key={bill.id} 
              className={`bg-white rounded-2xl p-6 border-2 transition-all hover:shadow-md ${
                isOverdue ? 'border-red-200 bg-red-50/30' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      bill.status === 'Paid' ? 'bg-emerald-100' :
                      isOverdue ? 'bg-red-100' : 'bg-blue-100'
                    }`}>
                      <Receipt className={`w-6 h-6 ${
                        bill.status === 'Paid' ? 'text-emerald-600' :
                        isOverdue ? 'text-red-600' : 'text-blue-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{bill.type}</h3>
                      <p className="text-sm text-gray-500">{bill.period}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Số tiền</p>
                      <p className="text-lg font-bold text-gray-900">{bill.amount.toLocaleString('vi-VN')} đ</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Hạn thanh toán</p>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <p className="text-sm text-gray-700">{bill.dueDate}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Trạng thái</p>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                        bill.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                        isOverdue ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {bill.status === 'Paid' && <CheckCircle className="w-4 h-4" />}
                        {(bill.status === 'Pending' && !isOverdue) && <Clock className="w-4 h-4" />}
                        {isOverdue && <AlertCircle className="w-4 h-4" />}
                        {bill.status === 'Paid' ? 'Đã thanh toán' : 
                         isOverdue ? 'Quá hạn' : 'Chưa thanh toán'}
                      </span>
                    </div>
                  </div>

                  {bill.paidDate && (
                    <p className="text-xs text-gray-500">Đã thanh toán vào: {bill.paidDate}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => setSelectedBill(bill)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm rounded-lg hover:shadow-lg transition-all"
                  >
                    Xem chi tiết
                  </button>
                  {bill.status === 'Pending' && (
                    <button 
                      onClick={() => handlePayBill(bill)}
                      className="px-4 py-2 bg-white text-blue-600 border-2 border-blue-600 text-sm rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      Thanh toán
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bill Details Modal */}
      {selectedBill && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedBill(null)}>
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full border-2 border-gray-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Chi Tiết Hóa Đơn</h2>
              <button
                onClick={() => setSelectedBill(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="text-gray-700">Loại hóa đơn:</span>
                <span className="font-semibold text-gray-900">{selectedBill.type}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="text-gray-700">Kỳ:</span>
                <span className="font-semibold text-gray-900">{selectedBill.period}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="text-gray-700">Hạn thanh toán:</span>
                <span className="font-semibold text-gray-900">{selectedBill.dueDate}</span>
              </div>
              
              <div className="border-t-2 border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Chi tiết các khoản phí:</h3>
                <div className="space-y-2">
                  {selectedBill.details.map((detail, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">{detail.item}</span>
                      <span className="font-semibold text-gray-900">{detail.amount.toLocaleString('vi-VN')} đ</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl mt-4">
                  <span className="text-lg font-semibold text-gray-900">Tổng cộng:</span>
                  <span className="text-xl font-bold text-gray-900">{selectedBill.amount.toLocaleString('vi-VN')} đ</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedBill(null)}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
              >
                Đóng
              </button>
              {selectedBill.status === 'Pending' && (
                <button 
                  onClick={() => handlePayBill(selectedBill)}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  Thanh toán ngay
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {filteredBills.length === 0 && (
        <div className="bg-white rounded-2xl p-12 border-2 border-gray-200 text-center">
          <Receipt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Không tìm thấy hóa đơn nào</p>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && paidBill && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowSuccessModal(false)}
        >
          <div 
            className="bg-white rounded-2xl p-8 max-w-md w-full border-2 border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán thành công!</h2>
              <p className="text-gray-600">Hóa đơn của bạn đã được thanh toán thành công.</p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Loại hóa đơn:</span>
                  <span className="font-semibold text-gray-900">{paidBill.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Kỳ:</span>
                  <span className="font-semibold text-gray-900">{paidBill.period}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Số tiền:</span>
                  <span className="font-semibold text-gray-900">{paidBill.amount.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ngày thanh toán:</span>
                  <span className="font-semibold text-gray-900">{paidBill.paidDate}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800">
                  Thông báo thanh toán đã được gửi đến hệ thống. Bạn có thể xem trong mục Thông Báo.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setShowSuccessModal(false);
                setPaidBill(null);
              }}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


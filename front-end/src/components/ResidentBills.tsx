import { useState, useEffect, useMemo } from 'react';
import { Search, Download, Clock, CheckCircle, AlertCircle, DollarSign, Receipt, Calendar, CheckCircle2 } from 'lucide-react';
import { getBills, payBill, subscribe, exportToCSV, type Bill } from '../utils/bills';
import { addAnnouncement } from '../utils/announcements';

interface MonthlyBill {
  period: string;
  bills: Bill[];
  totalAmount: number;
  status: 'Paid' | 'Pending';
  dueDate: string;
  paidDate: string | null;
  isOverdue: boolean;
}

export function ResidentBills() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Pending' | 'Overdue'>('All');
  const [selectedMonthlyBill, setSelectedMonthlyBill] = useState<MonthlyBill | null>(null);
  const [bills, setBills] = useState<Bill[]>(getBills());
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [paidBill, setPaidBill] = useState<Bill | null>(null);

  useEffect(() => {
    const unsubscribe = subscribe((updatedBills) => {
      setBills(updatedBills);
    });
    return unsubscribe;
  }, []);

  // Group bills by period (month)
  const monthlyBills = useMemo(() => {
    const grouped = new Map<string, Bill[]>();
    
    bills.forEach(bill => {
      if (!grouped.has(bill.period)) {
        grouped.set(bill.period, []);
      }
      grouped.get(bill.period)!.push(bill);
    });

    const monthly: MonthlyBill[] = Array.from(grouped.entries()).map(([period, periodBills]) => {
      const totalAmount = periodBills.reduce((sum, b) => sum + b.amount, 0);
      const paidBills = periodBills.filter(b => b.status === 'Paid');
      
      // Chỉ có thể thanh toán cả tháng, không có thanh toán một phần
      // Nếu tất cả đã thanh toán thì là Paid, còn lại là Pending
      const status: 'Paid' | 'Pending' = paidBills.length === periodBills.length ? 'Paid' : 'Pending';

      // Get the earliest due date for the month
      const dueDates = periodBills.map(b => new Date(b.dueDate));
      const earliestDueDate = new Date(Math.min(...dueDates.map(d => d.getTime())));
      const isOverdue = status === 'Pending' && earliestDueDate < new Date();

      // Get the latest paid date if all are paid
      const paidDates = periodBills.filter(b => b.paidDate).map(b => b.paidDate!);
      const latestPaidDate = paidDates.length > 0 ? paidDates.sort().reverse()[0] : null;

      return {
        period,
        bills: periodBills,
        totalAmount,
        status,
        dueDate: earliestDueDate.toISOString().split('T')[0],
        paidDate: latestPaidDate,
        isOverdue
      };
    });

    // Sort by period (newest first)
    return monthly.sort((a, b) => {
      const aDate = new Date(a.period.replace('Tháng ', '').split('/').reverse().join('-'));
      const bDate = new Date(b.period.replace('Tháng ', '').split('/').reverse().join('-'));
      return bDate.getTime() - aDate.getTime();
    });
  }, [bills]);

  const filteredMonthlyBills = monthlyBills.filter(monthlyBill => {
    const matchesSearch = monthlyBill.period.toLowerCase().includes(searchTerm.toLowerCase()) ||
      monthlyBill.bills.some(b => b.type.toLowerCase().includes(searchTerm.toLowerCase()));
    
    let matchesStatus = true;
    if (statusFilter === 'Paid') {
      matchesStatus = monthlyBill.status === 'Paid';
    } else if (statusFilter === 'Pending') {
      matchesStatus = monthlyBill.status === 'Pending';
    } else if (statusFilter === 'Overdue') {
      matchesStatus = monthlyBill.isOverdue;
    }
    
    return matchesSearch && matchesStatus;
  });

  const totalPaid = useMemo(() => {
    return monthlyBills
      .filter(m => m.status === 'Paid')
      .reduce((sum, m) => sum + m.totalAmount, 0);
  }, [monthlyBills]);

  const totalPending = useMemo(() => {
    return monthlyBills
      .filter(m => m.status === 'Pending')
      .reduce((sum, m) => sum + m.totalAmount, 0);
  }, [monthlyBills]);

  const totalOverdue = useMemo(() => {
    return monthlyBills
      .filter(m => m.isOverdue)
      .reduce((sum, m) => sum + m.totalAmount, 0);
  }, [monthlyBills]);

  const handlePayMonthlyBill = (monthlyBill: MonthlyBill) => {
    // Pay all pending bills in the month
    const pendingBills = monthlyBill.bills.filter(b => b.status === 'Pending');
    let lastPaidBill: Bill | null = null;
    
    pendingBills.forEach(bill => {
    const updatedBill = payBill(bill.id);
    if (updatedBill) {
        lastPaidBill = updatedBill;
      }
    });

    if (lastPaidBill) {
      setPaidBill(lastPaidBill);
      setShowSuccessModal(true);
      setSelectedMonthlyBill(null);
      
      // Add success announcement
      const now = new Date();
      const timeAgo = 'Vừa xong';
      addAnnouncement({
        type: 'success',
        icon: null,
        title: `Thanh toán thành công: ${monthlyBill.period}`,
        message: `Bạn đã thanh toán thành công tất cả hóa đơn ${monthlyBill.period} với tổng số tiền ${monthlyBill.totalAmount.toLocaleString('vi-VN')} đ. Cảm ơn bạn đã thanh toán đúng hạn!`,
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gray-900">Tra Cứu Hóa Đơn</h1>
          <p className="text-gray-600 mt-1">Lịch sử và chi tiết các khoản phí dịch vụ</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <Download className="w-5 h-5" />
            Xuất file
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tháng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <p className="text-gray-600 text-sm">Đã thanh toán</p>
          </div>
          <p className="text-2xl text-gray-900">{totalPaid.toLocaleString('vi-VN')} đ</p>
          <p className="text-sm text-emerald-700 mt-1">{monthlyBills.filter(m => m.status === 'Paid').length} tháng</p>
        </div>

        <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <p className="text-gray-600 text-sm">Chưa thanh toán</p>
          </div>
          <p className="text-2xl text-gray-900">{totalPending.toLocaleString('vi-VN')} đ</p>
          <p className="text-sm text-blue-700 mt-1">{monthlyBills.filter(m => m.status === 'Pending').length} tháng</p>
        </div>

        <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <p className="text-gray-600 text-sm">Quá hạn</p>
          </div>
          <p className="text-2xl text-gray-900">{totalOverdue.toLocaleString('vi-VN')} đ</p>
          <p className="text-sm text-red-700 mt-1">{monthlyBills.filter(m => m.isOverdue).length} tháng</p>
        </div>

        <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <p className="text-gray-600 text-sm">Tổng chi phí</p>
          </div>
          <p className="text-2xl text-gray-900">{(totalPaid + totalPending).toLocaleString('vi-VN')} đ</p>
          <p className="text-sm text-purple-700 mt-1">Tất cả hóa đơn</p>
        </div>
      </div>

      {/* Status Filter Tabs */}
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

      {/* Monthly Bills List */}
      <div className="space-y-3">
        {filteredMonthlyBills.map((monthlyBill) => {
          return (
            <div 
              key={monthlyBill.period} 
              className={`bg-white rounded-2xl p-6 border-2 transition-all hover:shadow-md ${
                monthlyBill.isOverdue ? 'border-red-200 bg-red-50/30' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      monthlyBill.status === 'Paid' ? 'bg-emerald-100' :
                      monthlyBill.isOverdue ? 'bg-red-100' : 'bg-blue-100'
                    }`}>
                      <Receipt className={`w-6 h-6 ${
                        monthlyBill.status === 'Paid' ? 'text-emerald-600' :
                        monthlyBill.isOverdue ? 'text-red-600' : 'text-blue-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Hóa đơn {monthlyBill.period}</h3>
                      <p className="text-sm text-gray-500">{monthlyBill.bills.length} loại phí</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Tổng tiền</p>
                      <p className="text-lg font-bold text-gray-900">{monthlyBill.totalAmount.toLocaleString('vi-VN')} đ</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Hạn thanh toán</p>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <p className="text-sm text-gray-700">{monthlyBill.dueDate}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Trạng thái</p>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                        monthlyBill.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                        monthlyBill.isOverdue ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {monthlyBill.status === 'Paid' && <CheckCircle className="w-4 h-4" />}
                        {(monthlyBill.status === 'Pending' && !monthlyBill.isOverdue) && <Clock className="w-4 h-4" />}
                        {monthlyBill.isOverdue && <AlertCircle className="w-4 h-4" />}
                        {monthlyBill.status === 'Paid' ? 'Đã thanh toán' : 
                         monthlyBill.isOverdue ? 'Quá hạn' : 'Chưa thanh toán'}
                      </span>
                    </div>
                  </div>

                  {monthlyBill.paidDate && (
                    <p className="text-xs text-gray-500">Đã thanh toán vào: {monthlyBill.paidDate}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => setSelectedMonthlyBill(monthlyBill)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm rounded-lg hover:shadow-lg transition-all"
                  >
                    Xem chi tiết
                  </button>
                  {monthlyBill.status === 'Pending' && (
                    <button 
                      onClick={() => handlePayMonthlyBill(monthlyBill)}
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

      {/* Monthly Bill Details Modal */}
      {selectedMonthlyBill && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedMonthlyBill(null)}>
          <div className="bg-white rounded-2xl p-8 max-w-3xl w-full border-2 border-gray-200 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Chi Tiết Hóa Đơn {selectedMonthlyBill.period}</h2>
              <button
                onClick={() => setSelectedMonthlyBill(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="text-gray-700">Kỳ:</span>
                <span className="font-semibold text-gray-900">{selectedMonthlyBill.period}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="text-gray-700">Hạn thanh toán:</span>
                <span className="font-semibold text-gray-900">{selectedMonthlyBill.dueDate}</span>
              </div>
              
              <div className="border-t-2 border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Chi tiết các loại phí:</h3>
                <div className="space-y-3">
                  {selectedMonthlyBill.bills.map((bill) => (
                    <div key={bill.id} className="border-2 border-gray-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{bill.type}</h4>
                          <p className="text-xs text-gray-500 mt-1">Hạn: {bill.dueDate}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs ${
                          bill.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {bill.status === 'Paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                        </span>
                      </div>
                <div className="space-y-2">
                        {bill.details.map((detail, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-700">{detail.item}</span>
                      <span className="font-semibold text-gray-900">{detail.amount.toLocaleString('vi-VN')} đ</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg mt-3">
                        <span className="font-semibold text-gray-900">Tổng {bill.type}:</span>
                        <span className="font-bold text-gray-900">{bill.amount.toLocaleString('vi-VN')} đ</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl mt-4">
                  <span className="text-lg font-semibold text-gray-900">Tổng cộng tháng:</span>
                  <span className="text-xl font-bold text-gray-900">{selectedMonthlyBill.totalAmount.toLocaleString('vi-VN')} đ</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedMonthlyBill(null)}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
              >
                Đóng
              </button>
              {selectedMonthlyBill.status === 'Pending' && (
                <button 
                  onClick={() => handlePayMonthlyBill(selectedMonthlyBill)}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  Thanh toán cả tháng
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {filteredMonthlyBills.length === 0 && (
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


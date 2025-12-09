import React from 'react';
import { useState, useEffect } from 'react';
import { Search, Download, Clock, CheckCircle, AlertCircle, DollarSign, Receipt, Calendar, CheckCircle2 } from 'lucide-react';
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

  const getDerivedStatus = (bill: Bill): 'Paid' | 'Pending' | 'Overdue' => {
    if (bill.status === 'Pending' && new Date(bill.dueDate) < new Date()) return 'Overdue';
    return bill.status;
  };

  const filteredBills = bills.filter(bill => {
    const derivedStatus = getDerivedStatus(bill);
    const matchesSearch = bill.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.period.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Pending' && (derivedStatus === 'Pending' || derivedStatus === 'Overdue')) ||
      (statusFilter === 'Overdue' && derivedStatus === 'Overdue') ||
      (statusFilter === 'Paid' && derivedStatus === 'Paid');
    return matchesSearch && matchesStatus;
  });

  const totalPaid = bills.filter(b => getDerivedStatus(b) === 'Paid').reduce((sum, b) => sum + b.amount, 0);
  const totalPending = bills
    .filter(b => {
      const st = getDerivedStatus(b);
      return st === 'Pending' || st === 'Overdue';
    })
    .reduce((sum, b) => sum + b.amount, 0);
  const totalOverdue = bills.filter(b => getDerivedStatus(b) === 'Overdue').reduce((sum, b) => sum + b.amount, 0);

  const handlePayBill = (bill: Bill) => {
    const updatedBill = payBill(bill.id);
    if (updatedBill) {
      setPaidBill(updatedBill);
      setShowSuccessModal(true);
      setSelectedBill(null);
      
      // Add success announcement
      const now = new Date();
      addAnnouncement({
        type: 'success',
        icon: null,
        title: `Thanh toán thành công: ${bill.type}`,
        message: `Bạn đã thanh toán thành công hóa đơn ${bill.type} - ${bill.period} với số tiền ${bill.amount.toLocaleString('vi-VN')} đ. Cảm ơn bạn đã thanh toán đúng hạn!`,
        read: false,
        color: 'emerald'
      });
    }
  };

  const handleExport = () => {
    exportToCSV(bills);
  };

  const exportSingleBill = (bill: Bill) => {
    const statusText = bill.status === 'Paid' ? 'Đã thanh toán' : 'Chưa thanh toán';
    const rows = bill.details.map(
      d => `<tr>
        <td style="padding:8px;border:1px solid #e5e7eb;">${d.item}</td>
        <td style="padding:8px;border:1px solid #e5e7eb;text-align:right;">${d.amount.toLocaleString('vi-VN')} đ</td>
      </tr>`
    ).join('');
    const html = `
      <html>
        <head>
          <title>Hóa đơn ${bill.period}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #111827; padding: 24px; }
            h1 { margin: 0 0 12px; }
            p { margin: 4px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th { text-align: left; padding: 8px; border: 1px solid #e5e7eb; background: #f3f4f6; }
          </style>
        </head>
        <body>
          <h1>Hóa đơn tháng: ${bill.period}</h1>
          <p><strong>Tổng tiền:</strong> ${bill.amount.toLocaleString('vi-VN')} đ</p>
          <p><strong>Hạn thanh toán:</strong> ${bill.dueDate}</p>
          <p><strong>Trạng thái:</strong> ${statusText}</p>
          <table>
            <thead>
              <tr>
                <th>Khoản phí</th>
                <th>Số tiền</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
              <tr>
                <td style="padding:8px;border:1px solid #e5e7eb;font-weight:600;">Tổng</td>
                <td style="padding:8px;border:1px solid #e5e7eb;text-align:right;font-weight:600;">${bill.amount.toLocaleString('vi-VN')} đ</td>
              </tr>
            </tbody>
          </table>
          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => window.close(), 300);
            };
          </script>
        </body>
      </html>
    `;
    const win = window.open('', '_blank', 'width=900,height=1000');
    if (win) {
      win.document.open();
      win.document.write(html);
      win.document.close();
    } else {
      alert('Trình duyệt chặn cửa sổ bật lên, vui lòng cho phép để in PDF.');
    }
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
            placeholder="Tìm kiếm theo loại hóa đơn hoặc kỳ..."
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
          <p className="text-sm text-emerald-700 mt-1">{bills.filter(b => b.status === 'Paid').length} hóa đơn</p>
        </div>

        <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <p className="text-gray-600 text-sm">Chưa thanh toán</p>
          </div>
          <p className="text-2xl text-gray-900">{totalPending.toLocaleString('vi-VN')} đ</p>
          <p className="text-sm text-blue-700 mt-1">{bills.filter(b => b.status === 'Pending').length} hóa đơn</p>
        </div>

        <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <p className="text-gray-600 text-sm">Quá hạn</p>
          </div>
          <p className="text-2xl text-gray-900">{totalOverdue.toLocaleString('vi-VN')} đ</p>
          <p className="text-sm text-red-700 mt-1">{bills.filter(b => {
            if (b.status === 'Pending') {
              const dueDate = new Date(b.dueDate);
              const today = new Date();
              return dueDate < today;
            }
            return false;
          }).length} hóa đơn</p>
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

      {/* Bills List - mỗi hóa đơn là một tháng */}
      <div className="space-y-3">
        {filteredBills.map((bill) => {
          const derivedStatus = getDerivedStatus(bill);
          const isOverdue = derivedStatus === 'Overdue';
          const statusClass =
            derivedStatus === 'Paid'
              ? 'bg-emerald-100 text-emerald-700'
              : derivedStatus === 'Overdue'
              ? 'bg-red-100 text-red-700'
              : 'bg-blue-100 text-blue-700';

          return (
            <div 
              key={bill.id} 
              className={`bg-white rounded-2xl p-6 border-2 transition-all hover:shadow-md flex flex-col gap-3 ${
                isOverdue ? 'border-red-200 bg-red-50/30' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    derivedStatus === 'Paid' ? 'bg-emerald-100' :
                    isOverdue ? 'bg-red-100' : 'bg-blue-100'
                  }`}>
                    <Receipt className={`w-6 h-6 ${
                      derivedStatus === 'Paid' ? 'text-emerald-600' :
                      isOverdue ? 'text-red-600' : 'text-blue-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{bill.period}</h3>
                    <p className="text-sm text-gray-600">Tổng: {bill.amount.toLocaleString('vi-VN')} đ</p>
                    <p className="text-sm text-gray-600">Hạn thanh toán: {bill.dueDate}</p>
                    <p className="text-sm text-gray-500">Hóa đơn tháng • Gồm {bill.details.length} khoản phí</p>
                    {bill.paidDate && <p className="text-xs text-gray-500 mt-1">Đã thanh toán: {bill.paidDate}</p>}
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex justify-end">
                    <span
                      className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full text-sm font-semibold ${statusClass}`}
                    >
                      {derivedStatus === 'Paid' ? 'Đã thanh toán' : isOverdue ? 'Quá hạn' : 'Chưa thanh toán'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2" style={{ justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => exportSingleBill(bill)}
                      className="px-4 py-2 bg-white text-blue-600 border-2 border-blue-600 text-sm rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" /> Xuất hóa đơn
                    </button>
                    {derivedStatus !== 'Paid' && (
                      <button
                        onClick={() => handlePayBill(bill)}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm rounded-lg hover:shadow-lg transition-all"
                      >
                        Thanh toán
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedBill(bill)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-200 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Xem chi tiết
                    </button>
                  </div>
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
                onClick={() => exportSingleBill(selectedBill)}
                className="flex-1 px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" /> Xuất hóa đơn
              </button>
              {getDerivedStatus(selectedBill) !== 'Paid' && (
                <button 
                  onClick={() => handlePayBill(selectedBill)}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  Thanh toán
                </button>
              )}
              <button
                onClick={() => setSelectedBill(null)}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
              >
                Đóng
              </button>
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


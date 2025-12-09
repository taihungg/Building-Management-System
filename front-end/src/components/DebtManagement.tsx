import React, { useState, useEffect } from 'react';
import { Search, Download, FileText, AlertCircle, CheckCircle, Clock, DollarSign } from 'lucide-react';
import { getBills, subscribe as subscribeBills, type Bill } from '../utils/bills';

export function DebtManagement() {
  const [bills, setBills] = useState<Bill[]>(getBills());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Pending' | 'Overdue'>('All');

  useEffect(() => {
    const unsubscribeBills = subscribeBills((updatedBills) => {
      setBills(updatedBills);
    });
    return unsubscribeBills;
  }, []);

  const getDerivedStatus = (bill: Bill): 'Paid' | 'Pending' | 'Overdue' => {
    if (bill.status === 'Pending' && new Date(bill.dueDate) < new Date()) return 'Overdue';
    return bill.status;
  };

  const filteredBills = bills.filter(bill => {
    const derivedStatus = getDerivedStatus(bill);
    const matchesSearch = 
      bill.apartmentNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.residentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.period.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Pending' && derivedStatus === 'Pending') ||
      (statusFilter === 'Overdue' && derivedStatus === 'Overdue') ||
      (statusFilter === 'Paid' && derivedStatus === 'Paid');
    
    return matchesSearch && matchesStatus;
  });

  const totalPaid = bills.filter(b => getDerivedStatus(b) === 'Paid').reduce((sum, b) => sum + b.amount, 0);
  const totalPending = bills.filter(b => getDerivedStatus(b) === 'Pending').reduce((sum, b) => sum + b.amount, 0);
  const totalOverdue = bills.filter(b => getDerivedStatus(b) === 'Overdue').reduce((sum, b) => sum + b.amount, 0);
  const totalRevenue = totalPaid + totalPending + totalOverdue;
  const totalDebt = totalPending + totalOverdue;

  const exportReport = () => {
    const reportData = filteredBills.map(bill => {
      const status = getDerivedStatus(bill);
      return {
        'Kỳ': bill.period,
        'Căn hộ': bill.apartmentNumber || '-',
        'Cư dân': bill.residentName || '-',
        'Loại': bill.type,
        'Số tiền': bill.amount.toLocaleString('vi-VN') + ' ₫',
        'Hạn thanh toán': bill.dueDate,
        'Trạng thái': status === 'Paid' ? 'Đã thanh toán' : status === 'Overdue' ? 'Quá hạn' : 'Chưa thanh toán',
        'Ngày thanh toán': bill.paidDate || '-',
      };
    });

    const csvContent = [
      ['BÁO CÁO CÔNG NỢ'],
      ['Tổng công nợ: ' + totalDebt.toLocaleString('vi-VN') + ' ₫'],
      ['Tổng đã thanh toán: ' + totalPaid.toLocaleString('vi-VN') + ' ₫'],
      [''],
      Object.keys(reportData[0] || {}).join(','),
      ...reportData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `BaoCaoCongNo_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    const rows = filteredBills.map(bill => {
      const status = getDerivedStatus(bill);
      return `<tr>
        <td style="padding:8px;border:1px solid #e5e7eb;">${bill.period}</td>
        <td style="padding:8px;border:1px solid #e5e7eb;">${bill.apartmentNumber || '-'}</td>
        <td style="padding:8px;border:1px solid #e5e7eb;">${bill.residentName || '-'}</td>
        <td style="padding:8px;border:1px solid #e5e7eb;">${bill.type}</td>
        <td style="padding:8px;border:1px solid #e5e7eb;text-align:right;">${bill.amount.toLocaleString('vi-VN')} ₫</td>
        <td style="padding:8px;border:1px solid #e5e7eb;">${bill.dueDate}</td>
        <td style="padding:8px;border:1px solid #e5e7eb;">${status === 'Paid' ? 'Đã thanh toán' : status === 'Overdue' ? 'Quá hạn' : 'Chưa thanh toán'}</td>
        <td style="padding:8px;border:1px solid #e5e7eb;">${bill.paidDate || '-'}</td>
      </tr>`;
    }).join('');

    const html = `
      <html>
        <head>
          <title>Báo Cáo Công Nợ</title>
          <style>
            body { font-family: Arial, sans-serif; color: #111827; padding: 24px; }
            h1 { margin: 0 0 12px; }
            p { margin: 4px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th { text-align: left; padding: 8px; border: 1px solid #e5e7eb; background: #f3f4f6; }
          </style>
        </head>
        <body>
          <h1>Báo Cáo Công Nợ</h1>
          <p><strong>Tổng công nợ:</strong> ${totalDebt.toLocaleString('vi-VN')} ₫</p>
          <p><strong>Tổng đã thanh toán:</strong> ${totalPaid.toLocaleString('vi-VN')} ₫</p>
          <p><strong>Ngày xuất báo cáo:</strong> ${new Date().toLocaleDateString('vi-VN')}</p>
          <table>
            <thead>
              <tr>
                <th>Kỳ</th>
                <th>Căn hộ</th>
                <th>Cư dân</th>
                <th>Loại</th>
                <th>Số tiền</th>
                <th>Hạn thanh toán</th>
                <th>Trạng thái</th>
                <th>Ngày thanh toán</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
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
          <h1 className="text-3xl text-gray-900">Quản Lý Công Nợ</h1>
          <p className="text-gray-600 mt-1">Theo dõi và quản lý tất cả các hóa đơn và thanh toán</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportPDF}
            className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-indigo-100 transition-colors"
          >
            <Download className="w-5 h-5" />
            Xuất khẩu
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo đơn vị, cư dân hoặc loại hóa đơn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-100 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <p className="text-gray-600 text-sm">Trả</p>
          </div>
          <p className="text-2xl text-gray-900">{totalPaid.toLocaleString('vi-VN')} ₫</p>
          <p className="text-sm text-emerald-700 mt-1">{bills.filter(b => getDerivedStatus(b) === 'Paid').length} hóa đơn</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <p className="text-gray-600 text-sm">Chưa giải quyết</p>
          </div>
          <p className="text-2xl text-gray-900">{totalPending.toLocaleString('vi-VN')} ₫</p>
          <p className="text-sm text-blue-700 mt-1">{bills.filter(b => getDerivedStatus(b) === 'Pending').length} hóa đơn</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-rose-500 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <p className="text-gray-600 text-sm">Quá hạn</p>
          </div>
          <p className="text-2xl text-gray-900">{totalOverdue.toLocaleString('vi-VN')} ₫</p>
          <p className="text-sm text-rose-700 mt-1">{bills.filter(b => getDerivedStatus(b) === 'Overdue').length} hóa đơn</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <p className="text-gray-600 text-sm">Tổng doanh thu</p>
          </div>
          <p className="text-2xl text-gray-900">{totalRevenue.toLocaleString('vi-VN')} ₫</p>
          <p className="text-sm text-purple-700 mt-1">Tháng này</p>
        </div>
      </div>

      <div className="flex gap-2">
        {['All', 'Paid', 'Pending', 'Overdue'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status as typeof statusFilter)}
            className={`px-6 py-3 rounded-xl transition-all ${
              statusFilter === status
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-indigo-100'
            }`}
          >
            {status === 'All' ? 'Tất cả' : 
             status === 'Paid' ? 'Trả' :
             status === 'Pending' ? 'Chưa giải quyết' : 'Quá hạn'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-indigo-100 to-purple-100 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm text-gray-700">Đơn vị</th>
                <th className="text-left px-6 py-4 text-sm text-gray-700">Người dân</th>
                <th className="text-left px-6 py-4 text-sm text-gray-700">Loại hóa đơn</th>
                <th className="text-left px-6 py-4 text-sm text-gray-700">Số lượng</th>
                <th className="text-left px-6 py-4 text-sm text-gray-700">Ngày đến hạn</th>
                <th className="text-left px-6 py-4 text-sm text-gray-700">Trạng thái</th>
                <th className="text-left px-6 py-4 text-sm text-gray-700">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBills.map((bill) => {
                const status = getDerivedStatus(bill);
                const statusText = status === 'Paid' ? 'Trả' : status === 'Pending' ? 'Chưa giải quyết' : 'Quá hạn';
                return (
                  <tr key={bill.id} className="hover:bg-indigo-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-gray-200 text-gray-800 rounded-lg">#{bill.apartmentNumber || '-'}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-900">{bill.residentName || '-'}</td>
                    <td className="px-6 py-4 text-gray-700">{bill.type}</td>
                    <td className="px-6 py-4"><span className="text-gray-900">{bill.amount.toLocaleString('vi-VN')} ₫</span></td>
                    <td className="px-6 py-4 text-gray-700">{bill.dueDate}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                        status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                        status === 'Pending' ? 'bg-blue-100 text-blue-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {status === 'Paid' && <CheckCircle className="w-4 h-4" />}
                        {status === 'Pending' && <Clock className="w-4 h-4" />}
                        {status === 'Overdue' && <AlertCircle className="w-4 h-4" />}
                        {statusText}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {status !== 'Paid' ? (
                        <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm rounded-lg hover:shadow-xl transition-all">
                          Mark Paid
                        </button>
                      ) : (
                        <span className="text-sm text-gray-500">
                          Đã thanh toán vào ngày {bill.paidDate ? new Date(bill.paidDate).toLocaleDateString('vi-VN') : '-'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredBills.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Không tìm thấy hóa đơn nào</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


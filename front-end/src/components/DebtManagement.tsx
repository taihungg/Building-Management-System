import React, { useMemo, useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, Search, Send, Download, DollarSign, CheckCircle2 } from 'lucide-react';
import { getBills, subscribe as subscribeBills, payBill, type Bill } from '../utils/bills';

export function DebtManagement() {
  const [bills, setBills] = useState<Bill[]>(getBills());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Overdue' | 'Paid'>('All');

  useEffect(() => {
    const unsub = subscribeBills((updated) => setBills(updated));
    return unsub;
  }, []);

  const getDerivedStatus = (bill: Bill): 'Paid' | 'Pending' | 'Overdue' => {
    if (bill.status === 'Pending' && new Date(bill.dueDate) < new Date()) return 'Overdue';
    return bill.status;
  };

  type GroupedBill = {
    key: string;
    period: string;
    apartmentNumber: string;
    residentName: string;
    dueDate: string;
    paidDate: string | null;
    amount: number;
    count: number;
    status: 'Pending' | 'Overdue' | 'Paid';
    bills: Bill[];
  };

  const { groups, totalPending, totalOverdue, totalPaid } = useMemo(() => {
    const map = new Map<string, GroupedBill>();

    bills.forEach((bill) => {
      const status = getDerivedStatus(bill);
      const key = `${bill.period}__${bill.apartmentNumber || '-'}__${bill.residentName || '-'}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          period: bill.period,
          apartmentNumber: bill.apartmentNumber || '-',
          residentName: bill.residentName || '-',
          dueDate: bill.dueDate,
          paidDate: bill.paidDate,
          amount: 0,
          count: 0,
          status: status,
          bills: [],
        });
      }
      const g = map.get(key)!;
      g.amount += bill.amount;
      g.count += 1;
      g.bills.push(bill);
      // earliest due date
      const gDue = new Date(g.dueDate);
      const bDue = new Date(bill.dueDate);
      if (!isNaN(bDue.getTime()) && (isNaN(gDue.getTime()) || bDue < gDue)) {
        g.dueDate = bill.dueDate;
      }
      // latest paid date
      if (bill.paidDate) {
        if (!g.paidDate || new Date(bill.paidDate) > new Date(g.paidDate)) {
          g.paidDate = bill.paidDate;
        }
      }

      // status aggregation priority: Overdue > Pending > Paid
      if (status === 'Overdue') g.status = 'Overdue';
      else if (status === 'Pending' && g.status !== 'Overdue') g.status = 'Pending';
      else if (status === 'Paid' && g.status !== 'Overdue' && g.status !== 'Pending') g.status = 'Paid';
    });

    const grouped = Array.from(map.values());
    const totalPendingAmount = grouped
      .filter(g => g.status === 'Pending')
      .reduce((s, g) => s + g.amount, 0);
    const totalOverdueAmount = grouped
      .filter(g => g.status === 'Overdue')
      .reduce((s, g) => s + g.amount, 0);
    const totalPaidAmount = grouped
      .filter(g => g.status === 'Paid')
      .reduce((s, g) => s + g.amount, 0);

    return { groups: grouped, totalPending: totalPendingAmount, totalOverdue: totalOverdueAmount, totalPaid: totalPaidAmount };
  }, [bills]);

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    const list = groups.filter((g) =>
      statusFilter === 'All' ? true : g.status === statusFilter
    );
    if (!term) return list;
    return list.filter((g) =>
      g.period.toLowerCase().includes(term) ||
      g.apartmentNumber.toLowerCase().includes(term) ||
      g.residentName.toLowerCase().includes(term)
    );
  }, [groups, searchTerm, statusFilter]);

  const visiblePending = filtered.filter(g => g.status === 'Pending').length;
  const visibleOverdue = filtered.filter(g => g.status === 'Overdue').length;
  const visiblePaid = filtered.filter(g => g.status === 'Paid').length;

  const downloadCSV = () => {
    const rows = [
      ['Kỳ', 'Số khoản', 'Tổng tiền', 'Hạn thanh toán', 'Căn hộ', 'Cư dân', 'Trạng thái'],
      ...filtered.map((g) => [
        g.period,
        g.count,
        g.amount.toLocaleString('vi-VN'),
        g.dueDate,
        g.apartmentNumber,
        g.residentName,
        g.status === 'Overdue' ? 'Quá hạn' : g.status === 'Pending' ? 'Chưa thanh toán' : 'Đã thanh toán',
      ]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cong_no_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản Lý Công Nợ</h1>
          <p className="text-gray-600">Theo dõi các hóa đơn chưa thanh toán và quá hạn</p>
        </div>
        <button
          onClick={downloadCSV}
          className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Download className="w-4 h-4" />
          Xuất CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo kỳ, căn hộ, cư dân..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
          <div className="flex gap-2">
            {['All', 'Pending', 'Overdue', 'Paid'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as typeof statusFilter)}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  statusFilter === status
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                    : 'bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {status === 'All'
                  ? 'Tất cả'
                  : status === 'Pending'
                    ? 'Chưa thanh toán'
                    : status === 'Overdue'
                      ? 'Quá hạn'
                      : 'Đã thanh toán'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-3 text-sm">
          <div className="px-4 py-3 rounded-xl bg-orange-50 border-2 border-orange-200 text-orange-700">
            {visiblePending} chưa thanh toán
          </div>
          <div className="px-4 py-3 rounded-xl bg-red-50 border-2 border-red-200 text-red-700">
            {visibleOverdue} quá hạn
          </div>
          <div className="px-4 py-3 rounded-xl bg-green-50 border-2 border-green-200 text-green-700">
            {visiblePaid} đã thanh toán
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border-2 border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-indigo-100 to-purple-100 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm text-gray-700">Kỳ</th>
                <th className="text-left px-6 py-4 text-sm text-gray-700">Căn hộ</th>
                <th className="text-left px-6 py-4 text-sm text-gray-700">Cư dân</th>
                <th className="text-left px-6 py-4 text-sm text-gray-700">Số khoản</th>
                <th className="text-left px-6 py-4 text-sm text-gray-700">Tổng tiền</th>
                <th className="text-left px-6 py-4 text-sm text-gray-700">Hạn thanh toán</th>
                <th className="text-left px-6 py-4 text-sm text-gray-700">Trạng thái</th>
                <th className="text-left px-6 py-4 text-sm text-gray-700">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-6 text-gray-500">Không có công nợ nào</td></tr>
              ) : (
                filtered.map((g) => {
                  const isOverdue = g.status === 'Overdue';
                  const displayPeriod = g.period
                    ? g.period.replace(/^Tháng\s+/i, '')
                    : 'Hóa đơn tháng';
                  const displayDue = g.dueDate && g.dueDate !== '1970-01-01' ? g.dueDate : '-';
                  const handleMarkPaid = () => {
                    g.bills
                      .filter(b => b.status !== 'Paid')
                      .forEach(b => payBill(b.id));
                  };
                  return (
                    <tr key={g.key} className="hover:bg-indigo-50 transition-colors">
                      <td className="px-6 py-4 text-gray-900 font-semibold">{displayPeriod}</td>
                      <td className="px-6 py-4 text-gray-800">{g.apartmentNumber}</td>
                      <td className="px-6 py-4 text-gray-800">{g.residentName}</td>
                      <td className="px-6 py-4 text-gray-800">{g.count}</td>
                      <td className="px-6 py-4 text-gray-900 font-semibold">{g.amount.toLocaleString('vi-VN')} ₫</td>
                      <td className="px-6 py-4 text-gray-800">{displayDue}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                          g.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                          isOverdue ? 'bg-rose-100 text-rose-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {g.status === 'Paid' && <CheckCircle className="w-4 h-4" />}
                          {g.status === 'Pending' && <Clock className="w-4 h-4" />}
                          {isOverdue && <AlertCircle className="w-4 h-4" />}
                          {g.status === 'Paid' ? 'Đã thanh toán' : isOverdue ? 'Quá hạn' : 'Chưa thanh toán'}
                        </span>
                        {g.status === 'Paid' && g.paidDate && (
                          <p className="text-xs text-gray-500 mt-1">Ngày thanh toán: {g.paidDate}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {g.status === 'Paid' ? (
                          <span className="text-sm text-emerald-600 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Đã thanh toán
                          </span>
                        ) : (
                          <button
                            onClick={handleMarkPaid}
                            className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm rounded-lg hover:shadow-lg transition-all inline-flex items-center gap-2"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Mark paid
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


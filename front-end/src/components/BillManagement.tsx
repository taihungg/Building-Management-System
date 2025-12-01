import { useState } from 'react';
import { Search, Plus, Download, Clock, CheckCircle, AlertCircle, DollarSign } from 'lucide-react';
import { Modal } from './Modal';

const bills = [
  { id: 1, unit: '304', resident: 'Emma Johnson', type: 'Rent', amount: 1500, dueDate: '2024-07-01', status: 'Paid', paidDate: '2024-06-28' },
  { id: 2, unit: '112', resident: 'Michael Chen', type: 'Rent', amount: 2200, dueDate: '2024-07-01', status: 'Paid', paidDate: '2024-06-30' },
  { id: 3, unit: '205', resident: 'Sarah Williams', type: 'Rent', amount: 2300, dueDate: '2024-07-01', status: 'Pending', paidDate: null },
  { id: 4, unit: '407', resident: 'James Rodriguez', type: 'Utilities', amount: 150, dueDate: '2024-07-05', status: 'Pending', paidDate: null },
  { id: 5, unit: '156', resident: 'Lisa Anderson', type: 'Rent', amount: 2800, dueDate: '2024-07-01', status: 'Paid', paidDate: '2024-06-25' },
  { id: 6, unit: '523', resident: 'David Park', type: 'Rent + Utilities', amount: 2050, dueDate: '2024-07-01', status: 'Overdue', paidDate: null },
  { id: 7, unit: '641', resident: 'Maria Garcia', type: 'Rent', amount: 1550, dueDate: '2024-07-01', status: 'Paid', paidDate: '2024-06-29' },
  { id: 8, unit: '789', resident: 'Robert Taylor', type: 'Parking', amount: 100, dueDate: '2024-07-10', status: 'Pending', paidDate: null },
  { id: 9, unit: '234', resident: 'Jennifer Lee', type: 'Rent', amount: 1800, dueDate: '2024-07-01', status: 'Overdue', paidDate: null },
  { id: 10, unit: '456', resident: 'Thomas Brown', type: 'Utilities', amount: 120, dueDate: '2024-07-05', status: 'Pending', paidDate: null },
];

export function BillManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isCreateBillOpen, setIsCreateBillOpen] = useState(false);

  const filteredBills = bills.filter(bill => {
    const matchesSearch = bill.unit.includes(searchTerm) || 
      bill.resident.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || bill.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPaid = bills.filter(b => b.status === 'Paid').reduce((sum, b) => sum + b.amount, 0);
  const totalPending = bills.filter(b => b.status === 'Pending').reduce((sum, b) => sum + b.amount, 0);
  const totalOverdue = bills.filter(b => b.status === 'Overdue').reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gray-900">Bill Management</h1>
          <p className="text-gray-600 mt-1">Track and manage all billing and payments</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-indigo-100 transition-colors">
            <Download className="w-5 h-5" />
            Export
          </button>
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
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <p className="text-gray-600 text-sm">Paid</p>
          </div>
          <p className="text-2xl text-gray-900">${totalPaid.toLocaleString()}</p>
          <p className="text-sm text-emerald-700 mt-1">{bills.filter(b => b.status === 'Paid').length} bills</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <p className="text-gray-600 text-sm">Pending</p>
          </div>
          <p className="text-2xl text-gray-900">${totalPending.toLocaleString()}</p>
          <p className="text-sm text-blue-700 mt-1">{bills.filter(b => b.status === 'Pending').length} bills</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-rose-500 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <p className="text-gray-600 text-sm">Overdue</p>
          </div>
          <p className="text-2xl text-gray-900">${totalOverdue.toLocaleString()}</p>
          <p className="text-sm text-rose-700 mt-1">{bills.filter(b => b.status === 'Overdue').length} bills</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <p className="text-gray-600 text-sm">Total Revenue</p>
          </div>
          <p className="text-2xl text-gray-900">${(totalPaid + totalPending + totalOverdue).toLocaleString()}</p>
          <p className="text-sm text-purple-700 mt-1">This month</p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2">
        {['All', 'Paid', 'Pending', 'Overdue'].map((status) => (
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

      {/* Bills Table */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-indigo-100 to-purple-100 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm text-gray-700">Unit</th>
                <th className="text-left px-6 py-4 text-sm text-gray-700">Resident</th>
                <th className="text-left px-6 py-4 text-sm text-gray-700">Bill Type</th>
                <th className="text-left px-6 py-4 text-sm text-gray-700">Amount</th>
                <th className="text-left px-6 py-4 text-sm text-gray-700">Due Date</th>
                <th className="text-left px-6 py-4 text-sm text-gray-700">Status</th>
                <th className="text-left px-6 py-4 text-sm text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBills.map((bill) => (
                <tr key={bill.id} className="hover:bg-indigo-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-gray-200 text-gray-800 rounded-lg">
                      #{bill.unit}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-900">
                    {bill.resident}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {bill.type}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-900">${bill.amount.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {bill.dueDate}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                      bill.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                      bill.status === 'Pending' ? 'bg-blue-100 text-blue-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {bill.status === 'Paid' && <CheckCircle className="w-4 h-4" />}
                      {bill.status === 'Pending' && <Clock className="w-4 h-4" />}
                      {bill.status === 'Overdue' && <AlertCircle className="w-4 h-4" />}
                      {bill.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {bill.status !== 'Paid' ? (
                      <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm rounded-lg hover:shadow-xl transition-all">
                        Mark Paid
                      </button>
                    ) : (
                      <span className="text-sm text-gray-500">Paid on {bill.paidDate}</span>
                    )}
                  </td>
                </tr>
              ))}
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

            <div>
              <label className="block text-sm text-gray-700 mb-2">Due Date</label>
              <input
                type="date"
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

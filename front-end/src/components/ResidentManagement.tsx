import { useState } from 'react';
import { Search, Plus, MoreVertical, Phone, MapPin, Filter, Edit, Trash2, Eye } from 'lucide-react';
import { SlideOut } from './SlideOut';
import { Dropdown } from './Dropdown';
import { MenuButton } from './MenuButton';

const residents = [
  { id: 1, name: 'Emma Johnson', unit: '304', email: 'emma.j@email.com', phone: '(555) 123-4567', status: 'Active', moveIn: '2023-01-15', balance: 0 },
  { id: 2, name: 'Michael Chen', unit: '112', email: 'mchen@email.com', phone: '(555) 234-5678', status: 'Active', moveIn: '2022-08-20', balance: 0 },
  { id: 3, name: 'Sarah Williams', unit: '205', email: 'sarah.w@email.com', phone: '(555) 345-6789', status: 'Active', moveIn: '2023-03-10', balance: 150 },
  { id: 4, name: 'James Rodriguez', unit: '407', email: 'j.rodriguez@email.com', phone: '(555) 456-7890', status: 'Active', moveIn: '2021-11-05', balance: 0 },
  { id: 5, name: 'Lisa Anderson', unit: '156', email: 'lisa.a@email.com', phone: '(555) 567-8901', status: 'Active', moveIn: '2022-06-18', balance: 0 },
  { id: 6, name: 'David Park', unit: '523', email: 'dpark@email.com', phone: '(555) 678-9012', status: 'Active', moveIn: '2023-02-28', balance: 300 },
  { id: 7, name: 'Maria Garcia', unit: '641', email: 'maria.g@email.com', phone: '(555) 789-0123', status: 'Active', moveIn: '2022-12-01', balance: 0 },
  { id: 8, name: 'Robert Taylor', unit: '789', email: 'rtaylor@email.com', phone: '(555) 890-1234', status: 'Notice', moveIn: '2021-05-22', balance: 0 },
];

export function ResidentManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddResidentOpen, setIsAddResidentOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filteredResidents = residents.filter(resident =>
    resident.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resident.unit.includes(searchTerm) ||
    resident.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gray-900">Resident Management</h1>
          <p className="text-gray-600 mt-1">Manage all residents and their information</p>
        </div>
        <button 
          onClick={() => setIsAddResidentOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Resident
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, unit, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>
          <button 
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors border-2 border-gray-200"
          >
            <Filter className="w-5 h-5" />
            Filter
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
          <p className="text-gray-500 text-sm">Total Residents</p>
          <p className="text-2xl text-gray-900 mt-1">342</p>
        </div>
        <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
          <p className="text-gray-500 text-sm">Active Leases</p>
          <p className="text-2xl text-gray-900 mt-1">156</p>
        </div>
        <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
          <p className="text-gray-500 text-sm">Move-ins This Month</p>
          <p className="text-2xl text-green-600 mt-1">12</p>
        </div>
        <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
          <p className="text-gray-500 text-sm">Outstanding Balance</p>
          <p className="text-2xl text-orange-600 mt-1">$450</p>
        </div>
      </div>

      {/* Residents Table */}
      <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-blue-600 border-b-2 border-blue-700">
              <tr>
                <th className="text-left px-6 py-4 text-sm text-white">Resident</th>
                <th className="text-left px-6 py-4 text-sm text-white">Unit</th>
                <th className="text-left px-6 py-4 text-sm text-white">Contact</th>
                <th className="text-left px-6 py-4 text-sm text-white">Move-in Date</th>
                <th className="text-left px-6 py-4 text-sm text-white">Status</th>
                <th className="text-left px-6 py-4 text-sm text-white">Balance</th>
                <th className="text-left px-6 py-4 text-sm text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-gray-200">
              {filteredResidents.map((resident) => (
                <tr key={resident.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm">
                        {resident.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-gray-900 text-sm">{resident.name}</p>
                        <p className="text-xs text-gray-500">{resident.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-700 text-sm">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      #{resident.unit}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-gray-400" />
                      {resident.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">
                    {resident.moveIn}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm ${
                      resident.status === 'Active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {resident.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm ${resident.balance > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                      ${resident.balance}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Dropdown
                      trigger={
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <MoreVertical className="w-5 h-5 text-gray-400" />
                        </button>
                      }
                      items={[
                        { label: 'View Details', icon: Eye, onClick: () => {} },
                        { label: 'Edit', icon: Edit, onClick: () => {} },
                        { label: 'Delete', icon: Trash2, onClick: () => {}, danger: true },
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Resident Slide Out */}
      <SlideOut
        isOpen={isAddResidentOpen}
        onClose={() => setIsAddResidentOpen(false)}
        title="Add New Resident"
      >
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                placeholder="Enter full name"
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                placeholder="email@example.com"
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                placeholder="(555) 123-4567"
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Unit Number</label>
              <input
                type="text"
                placeholder="e.g., 304"
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Move-in Date</label>
              <input
                type="date"
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Lease Type</label>
              <select className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600">
                <option>6 Months</option>
                <option>1 Year</option>
                <option>2 Years</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Monthly Rent</label>
              <input
                type="number"
                placeholder="1500"
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
            <button
              onClick={() => setIsAddResidentOpen(false)}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors border-2 border-gray-200"
            >
              Cancel
            </button>
            <button className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all">
              Add Resident
            </button>
          </div>
        </div>
      </SlideOut>

      {/* Filter Slide Out */}
      <SlideOut
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filter Residents"
        width="sm"
      >
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm text-gray-700 mb-2">Status</label>
            <div className="space-y-2">
              {['All', 'Active', 'Notice', 'Former'].map((status) => (
                <label key={status} className="flex items-center gap-3 p-3 bg-gray-50 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100">
                  <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-2 border-gray-300" defaultChecked={status === 'All'} />
                  <span className="text-gray-700 text-sm">{status}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">Balance Status</label>
            <div className="space-y-2">
              {['All Balances', 'No Balance', 'Outstanding Balance'].map((balance) => (
                <label key={balance} className="flex items-center gap-3 p-3 bg-gray-50 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100">
                  <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-2 border-gray-300" defaultChecked={balance === 'All Balances'} />
                  <span className="text-gray-700 text-sm">{balance}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
            <button className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors border-2 border-gray-200">
              Reset
            </button>
            <button 
              onClick={() => setIsFilterOpen(false)}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </SlideOut>
    </div>
  );
}
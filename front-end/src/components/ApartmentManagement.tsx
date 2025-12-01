import { useState } from 'react';
import { Search, Plus, MoreVertical, Home, Bed, Bath, Maximize, DollarSign, Edit, Trash2, Eye } from 'lucide-react';
import { Modal } from './Modal';
import { Dropdown } from './Dropdown';

const apartments = [
  { id: 1, unit: '101', floor: 1, type: '1BR', size: 650, beds: 1, baths: 1, rent: 1500, status: 'Occupied', resident: 'Emma Johnson' },
  { id: 2, unit: '102', floor: 1, type: '2BR', size: 950, beds: 2, baths: 2, rent: 2200, status: 'Occupied', resident: 'Michael Chen' },
  { id: 3, unit: '103', floor: 1, type: '1BR', size: 680, beds: 1, baths: 1, rent: 1550, status: 'Vacant', resident: null },
  { id: 4, unit: '201', floor: 2, type: '2BR', size: 980, beds: 2, baths: 2, rent: 2300, status: 'Occupied', resident: 'Sarah Williams' },
  { id: 5, unit: '202', floor: 2, type: '3BR', size: 1200, beds: 3, baths: 2, rent: 2800, status: 'Occupied', resident: 'James Rodriguez' },
  { id: 6, unit: '203', floor: 2, type: '1BR', size: 650, beds: 1, baths: 1, rent: 1500, status: 'Maintenance', resident: null },
  { id: 7, unit: '301', floor: 3, type: '2BR', size: 950, beds: 2, baths: 2, rent: 2250, status: 'Vacant', resident: null },
  { id: 8, unit: '302', floor: 3, type: '2BR', size: 980, beds: 2, baths: 2, rent: 2300, status: 'Occupied', resident: 'Lisa Anderson' },
  { id: 9, unit: '303', floor: 3, type: '1BR', size: 680, beds: 1, baths: 1, rent: 1550, status: 'Vacant', resident: null },
  { id: 10, unit: '304', floor: 3, type: '3BR', size: 1250, beds: 3, baths: 2.5, rent: 2900, status: 'Occupied', resident: 'David Park' },
];

export function ApartmentManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false);

  const filteredApartments = apartments.filter(apt => {
    const matchesSearch = apt.unit.includes(searchTerm) || 
      apt.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (apt.resident && apt.resident.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || apt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    All: apartments.length,
    Occupied: apartments.filter(a => a.status === 'Occupied').length,
    Vacant: apartments.filter(a => a.status === 'Vacant').length,
    Maintenance: apartments.filter(a => a.status === 'Maintenance').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gray-900">Apartment Management</h1>
          <p className="text-gray-600 mt-1">Manage all apartment units and their details</p>
        </div>
        <button 
          onClick={() => setIsAddUnitOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-xl transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Unit
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by unit number, type, or resident..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-100 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2">
        {Object.entries(statusCounts).map(([status, count]) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-6 py-3 rounded-xl transition-all ${
              statusFilter === status
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-indigo-100'
            }`}
          >
            {status} ({count})
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200">
          <p className="text-gray-600 text-sm">Total Units</p>
          <p className="text-2xl text-gray-900 mt-1">180</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200">
          <p className="text-gray-600 text-sm">Occupancy Rate</p>
          <p className="text-2xl text-emerald-600 mt-1">87%</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200">
          <p className="text-gray-600 text-sm">Avg. Rent</p>
          <p className="text-2xl text-blue-600 mt-1">$2,145</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200">
          <p className="text-gray-600 text-sm">Available Units</p>
          <p className="text-2xl text-purple-600 mt-1">24</p>
        </div>
      </div>

      {/* Apartments Grid */}
      <div className="grid grid-cols-2 gap-6">
        {filteredApartments.map((apt) => (
          <div key={apt.id} className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  apt.status === 'Occupied' ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' :
                  apt.status === 'Vacant' ? 'bg-gradient-to-br from-gray-400 to-gray-500' :
                  'bg-gradient-to-br from-rose-500 to-rose-600'
                }`}>
                  <Home className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-gray-900">Unit {apt.unit}</h3>
                  <p className="text-sm text-gray-600">Floor {apt.floor}</p>
                </div>
              </div>
              <Dropdown
                trigger={
                  <button className="p-2 hover:bg-indigo-100 rounded-lg transition-colors">
                    <MoreVertical className="w-5 h-5 text-gray-500" />
                  </button>
                }
                items={[
                  { label: 'View Details', icon: Eye, onClick: () => {} },
                  { label: 'Edit', icon: Edit, onClick: () => {} },
                  { label: 'Delete', icon: Trash2, onClick: () => {}, danger: true },
                ]}
              />
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2 text-gray-700">
                <Bed className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{apt.beds} Bed</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Bath className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{apt.baths} Bath</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Maximize className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{apt.size} sqft</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div>
                <p className="text-sm text-gray-600">Monthly Rent</p>
                <p className="text-gray-900 flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  {apt.rent.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <span className={`inline-flex px-3 py-1 rounded-full text-sm ${
                  apt.status === 'Occupied' ? 'bg-emerald-100 text-emerald-800' :
                  apt.status === 'Vacant' ? 'bg-gray-200 text-gray-800' :
                  'bg-rose-100 text-rose-800'
                }`}>
                  {apt.status}
                </span>
                {apt.resident && (
                  <p className="text-xs text-gray-600 mt-1">{apt.resident}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Unit Modal */}
      <Modal
        isOpen={isAddUnitOpen}
        onClose={() => setIsAddUnitOpen(false)}
        title="Add New Unit"
        size="lg"
      >
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">Unit Number</label>
              <input
                type="text"
                placeholder="e.g., 304"
                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Floor</label>
              <input
                type="number"
                placeholder="e.g., 3"
                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Unit Type</label>
              <select className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Studio</option>
                <option>1BR</option>
                <option>2BR</option>
                <option>3BR</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Size (sqft)</label>
              <input
                type="number"
                placeholder="e.g., 950"
                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Bedrooms</label>
              <input
                type="number"
                placeholder="e.g., 2"
                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Bathrooms</label>
              <input
                type="number"
                step="0.5"
                placeholder="e.g., 2"
                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Monthly Rent</label>
              <input
                type="number"
                placeholder="e.g., 2200"
                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Status</label>
              <select className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Vacant</option>
                <option>Occupied</option>
                <option>Maintenance</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => setIsAddUnitOpen(false)}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-xl transition-all">
              Add Unit
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
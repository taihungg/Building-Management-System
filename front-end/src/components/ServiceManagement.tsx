import { useState } from 'react';
import { Search, Plus, MoreVertical, Wrench, Droplet, Zap, Wind, Shield, Trash2, Clock, Edit, Eye, CheckCircle } from 'lucide-react';
import { SlideOut } from './SlideOut';
import { Dropdown } from './Dropdown';

const services = [
  { id: 1, unit: '304', resident: 'Emma Johnson', category: 'Plumbing', title: 'Leaking faucet in kitchen', priority: 'Medium', status: 'In Progress', date: '2024-06-28', assignedTo: 'John Smith' },
  { id: 2, unit: '112', resident: 'Michael Chen', category: 'Electrical', title: 'Light fixture not working', priority: 'High', status: 'Open', date: '2024-06-29', assignedTo: null },
  { id: 3, unit: '205', resident: 'Sarah Williams', category: 'HVAC', title: 'AC not cooling properly', priority: 'High', status: 'Open', date: '2024-06-29', assignedTo: null },
  { id: 4, unit: '407', resident: 'James Rodriguez', category: 'Maintenance', title: 'Door lock replacement needed', priority: 'Low', status: 'Completed', date: '2024-06-25', assignedTo: 'Mike Johnson' },
  { id: 5, unit: '156', resident: 'Lisa Anderson', category: 'Cleaning', title: 'Deep cleaning request', priority: 'Low', status: 'Scheduled', date: '2024-06-30', assignedTo: 'Cleaning Team' },
  { id: 6, unit: '523', resident: 'David Park', category: 'Plumbing', title: 'Clogged drain in bathroom', priority: 'High', status: 'In Progress', date: '2024-06-29', assignedTo: 'John Smith' },
  { id: 7, unit: '641', resident: 'Maria Garcia', category: 'Security', title: 'Intercom system issue', priority: 'Medium', status: 'Open', date: '2024-06-30', assignedTo: null },
  { id: 8, unit: '789', resident: 'Robert Taylor', category: 'Maintenance', title: 'Paint touch-up needed', priority: 'Low', status: 'Scheduled', date: '2024-07-01', assignedTo: 'Maintenance Team' },
];

const categoryIcons = {
  Plumbing: Droplet,
  Electrical: Zap,
  HVAC: Wind,
  Maintenance: Wrench,
  Cleaning: Trash2,
  Security: Shield,
};

export function ServiceManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);

  const filteredServices = services.filter(service => {
    const matchesSearch = service.unit.includes(searchTerm) || 
      service.resident.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || service.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-slate-900">Service Management</h1>
          <p className="text-slate-500 mt-1">Track and manage all service requests</p>
        </div>
        <button 
          onClick={() => setIsNewRequestOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all"
        >
          <Plus className="w-5 h-5" />
          New Request
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by unit, resident, or service type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-slate-500 text-sm">Open</p>
          </div>
          <p className="text-2xl text-slate-900">{services.filter(s => s.status === 'Open').length}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-slate-500 text-sm">In Progress</p>
          </div>
          <p className="text-2xl text-slate-900">{services.filter(s => s.status === 'In Progress').length}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-slate-500 text-sm">Scheduled</p>
          </div>
          <p className="text-2xl text-slate-900">{services.filter(s => s.status === 'Scheduled').length}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-slate-500 text-sm">Completed</p>
          </div>
          <p className="text-2xl text-slate-900">{services.filter(s => s.status === 'Completed').length}</p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2">
        {['All', 'Open', 'In Progress', 'Scheduled', 'Completed'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-6 py-3 rounded-xl transition-all ${
              statusFilter === status
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Service Requests Grid */}
      <div className="grid grid-cols-2 gap-6">
        {filteredServices.map((service) => {
          const Icon = categoryIcons[service.category] || Wrench;
          
          return (
            <div key={service.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">{service.category}</p>
                    <p className="text-slate-900">{service.title}</p>
                  </div>
                </div>
                <Dropdown
                  trigger={
                    <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                      <MoreVertical className="w-5 h-5 text-slate-400" />
                    </button>
                  }
                  items={[
                    { label: 'View Details', icon: Eye, onClick: () => {} },
                    { label: 'Edit', icon: Edit, onClick: () => {} },
                    { label: 'Mark Complete', icon: CheckCircle, onClick: () => {} },
                  ]}
                />
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Unit:</span>
                  <span className="text-slate-900">#{service.unit}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Resident:</span>
                  <span className="text-slate-900">{service.resident}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Date:</span>
                  <span className="text-slate-900">{service.date}</span>
                </div>
                {service.assignedTo && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Assigned to:</span>
                    <span className="text-slate-900">{service.assignedTo}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <span className={`inline-flex px-3 py-1 rounded-full text-sm ${
                  service.priority === 'High' ? 'bg-red-50 text-red-700' :
                  service.priority === 'Medium' ? 'bg-orange-50 text-orange-700' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {service.priority} Priority
                </span>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm ${
                  service.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' :
                  service.status === 'In Progress' ? 'bg-blue-50 text-blue-700' :
                  service.status === 'Scheduled' ? 'bg-purple-50 text-purple-700' :
                  'bg-orange-50 text-orange-700'
                }`}>
                  {service.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Request Slide Out */}
      <SlideOut
        isOpen={isNewRequestOpen}
        onClose={() => setIsNewRequestOpen(false)}
        title="New Service Request"
      >
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-700 mb-2">Select Unit</label>
              <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Unit 304 - Emma Johnson</option>
                <option>Unit 112 - Michael Chen</option>
                <option>Unit 205 - Sarah Williams</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-700 mb-2">Category</label>
              <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Plumbing</option>
                <option>Electrical</option>
                <option>HVAC</option>
                <option>Maintenance</option>
                <option>Cleaning</option>
                <option>Security</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-700 mb-2">Priority</label>
              <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-700 mb-2">Title</label>
              <input
                type="text"
                placeholder="Brief description of the issue"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-700 mb-2">Description</label>
              <textarea
                rows={4}
                placeholder="Provide detailed information about the service request..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-700 mb-2">Assign To (Optional)</label>
              <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Unassigned</option>
                <option>John Smith (Plumbing)</option>
                <option>Mike Johnson (Maintenance)</option>
                <option>Cleaning Team</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              onClick={() => setIsNewRequestOpen(false)}
              className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all">
              Create Request
            </button>
          </div>
        </div>
      </SlideOut>
    </div>
  );
}
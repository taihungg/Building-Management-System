import { Bell, AlertCircle, CheckCircle, Info, DollarSign, Wrench, Users, Calendar } from 'lucide-react';

const notifications = [
  { id: 1, type: 'alert', icon: AlertCircle, title: 'Overdue Payment', message: 'Unit 523 has an overdue payment of $2,050', time: '10 minutes ago', read: false, color: 'orange' },
  { id: 2, type: 'success', icon: CheckCircle, title: 'Service Completed', message: 'Maintenance request for Unit 407 has been completed', time: '1 hour ago', read: false, color: 'emerald' },
  { id: 3, type: 'info', icon: Info, title: 'New Resident', message: 'Emma Johnson has moved into Unit 304', time: '2 hours ago', read: false, color: 'blue' },
  { id: 4, type: 'alert', icon: Wrench, title: 'Urgent Service Request', message: 'High priority HVAC issue reported in Unit 205', time: '3 hours ago', read: true, color: 'orange' },
  { id: 5, type: 'success', icon: DollarSign, title: 'Payment Received', message: 'Rent payment received from Unit 112 ($2,200)', time: '5 hours ago', read: true, color: 'emerald' },
  { id: 6, type: 'info', icon: Users, title: 'Lease Renewal', message: 'Lease renewal signed for Unit 156', time: '8 hours ago', read: true, color: 'blue' },
  { id: 7, type: 'alert', icon: AlertCircle, title: 'Maintenance Needed', message: 'Annual inspection due for Units 100-120', time: '1 day ago', read: true, color: 'orange' },
  { id: 8, type: 'info', icon: Calendar, title: 'Scheduled Maintenance', message: 'Building HVAC maintenance scheduled for next week', time: '1 day ago', read: true, color: 'blue' },
  { id: 9, type: 'success', icon: CheckCircle, title: 'Occupancy Milestone', message: 'Building reached 87% occupancy rate', time: '2 days ago', read: true, color: 'emerald' },
  { id: 10, type: 'info', icon: Bell, title: 'System Update', message: 'New features added to the management system', time: '2 days ago', read: true, color: 'blue' },
];

export function Notifications() {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-slate-900">Notifications</h1>
          <p className="text-slate-500 mt-1">Stay updated with important events and alerts</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl">
            {unreadCount} Unread
          </div>
          <button className="px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            Mark All as Read
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-slate-500 text-sm">Alerts</p>
          </div>
          <p className="text-2xl text-slate-900">{notifications.filter(n => n.type === 'alert').length}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-slate-500 text-sm">Success</p>
          </div>
          <p className="text-2xl text-slate-900">{notifications.filter(n => n.type === 'success').length}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Info className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-slate-500 text-sm">Information</p>
          </div>
          <p className="text-2xl text-slate-900">{notifications.filter(n => n.type === 'info').length}</p>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.map((notification) => {
          const Icon = notification.icon;
          
          return (
            <div 
              key={notification.id} 
              className={`bg-white rounded-2xl p-6 shadow-sm border transition-all hover:shadow-md ${
                notification.read ? 'border-slate-200' : 'border-blue-200 bg-blue-50/30'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0 ${
                  notification.color === 'orange' ? 'from-orange-400 to-orange-600' :
                  notification.color === 'emerald' ? 'from-emerald-400 to-emerald-600' :
                  'from-blue-400 to-blue-600'
                }`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-1">
                    <h3 className="text-slate-900">{notification.title}</h3>
                    <span className="text-sm text-slate-500 whitespace-nowrap">{notification.time}</span>
                  </div>
                  <p className="text-slate-600">{notification.message}</p>
                </div>

                {!notification.read && (
                  <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

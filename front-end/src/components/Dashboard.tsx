import React from 'react';
import { useState, useEffect } from 'react'; // Thêm imports này
import { Users, Building2, DollarSign, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- CÁC DỮ LIỆU CỐ ĐỊNH (GIỮ NGUYÊN) ---
const revenueData = [
  { month: 'Jan', revenue: 78000, expenses: 45000 },
  { month: 'Feb', revenue: 82000, expenses: 48000 },
  { month: 'Mar', revenue: 85000, expenses: 46000 },
  { month: 'Apr', revenue: 88000, expenses: 50000 },
  { month: 'May', revenue: 86000, expenses: 47000 },
  { month: 'Jun', revenue: 89450, expenses: 49000 },
];

const occupancyData = [
  { name: 'Occupied', value: 156, color: '#2563eb' },
  { name: 'Vacant', value: 24, color: '#e5e7eb' },
];

const serviceRequests = [
  { category: 'Maintenance', count: 45 },
  { category: 'Cleaning', count: 32 },
  { category: 'Security', count: 18 },
  { category: 'Others', count: 25 },
];

export function Dashboard() {
  // --- STATE ĐỂ LƯU DỮ LIỆU TỪ API ---
  const [residentCount, setResidentCount] = useState(0);
  const [apartmentStats, setApartmentStats] = useState({ occupied: 0, total: 0 });

  // --- HÀM GỌI API ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 1. Lấy tổng số cư dân
        const resResidents = await fetch('http://localhost:8081/api/v1/residents');
        const dataResidents = await resResidents.json();
        if (resResidents.ok) {
          setResidentCount(dataResidents.data.length);
        }

        // 2. Lấy thông tin căn hộ (để tính tổng và số căn đã ở)
        const resApartments = await fetch('http://localhost:8081/api/v1/apartments');
        const dataApartments = await resApartments.json();
        if (resApartments.ok) {
          const allApartments = dataApartments.data;
          const total = allApartments.length;
          // Đếm số căn có người ở (dựa vào residentNumber > 0 hoặc logic của bạn)
          const occupied = allApartments.filter(apt => apt.residentNumber > 0).length;
          
          setApartmentStats({ total, occupied });
        }

      } catch (error) {
        console.error("Lỗi khi tải dữ liệu Dashboard:", error);
      }
    };

    fetchDashboardData();
  }, []);

  // --- CẤU HÌNH STATS (Đã chuyển vào trong để dùng State) ---
  const stats = [
    { 
      label: 'Total Residents', 
      value: residentCount.toString(), // Dữ liệu từ API
      trend: 'up', 
      icon: Users,
      bgColor: 'bg-blue-600'
    },
    { 
      label: 'Occupied Units', 
      value: `${apartmentStats.occupied}/${apartmentStats.total}`, // Dữ liệu từ API
      change: `${apartmentStats.total > 0 ? ((apartmentStats.occupied/apartmentStats.total)*100).toFixed(1) : 0}%`, // Tự tính %
      trend: 'up', 
      icon: Building2,
      bgColor: 'bg-purple-600'
    },
    { 
      label: 'Monthly Revenue', 
      value: '$89,450', // Giữ nguyên
      change: '+8.2%', 
      trend: 'up', 
      icon: DollarSign,
      bgColor: 'bg-green-600'
    },
    { 
      label: 'Pending Issues', 
      value: '23', // Giữ nguyên
      change: '-5', 
      trend: 'down', 
      icon: AlertCircle,
      bgColor: 'bg-orange-600'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Current Period</p>
          <p className="text-base text-gray-900">June 2024</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
          
          return (
            <div key={stat.label} className="bg-white rounded-xl p-6 border-2 border-gray-200">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-lg bg-[#E0F2FE] flex items-center justify-center">
                  <Icon className="w-6 h-6 text-[#0EA5E9]" />
                </div>
                <div className={`flex items-center gap-1 px-3 py-1 rounded-lg ${
                  stat.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  <TrendIcon className="w-4 h-4" />
                  <span className="text-sm">{stat.change}</span>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-gray-500 text-sm">{stat.label}</p>
                <p className="text-2xl text-gray-900 mt-1">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row (GIỮ NGUYÊN) */}
      <div className="grid grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="col-span-2 bg-white rounded-xl p-6 border-2 border-gray-200">
          <h3 className="text-lg text-gray-900 mb-4">Revenue & Expenses</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px'
                }} 
              />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} dot={{ fill: '#2563eb', r: 4 }} />
              <Line type="monotone" dataKey="expenses" stroke="#9333ea" strokeWidth={3} dot={{ fill: '#9333ea', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Occupancy Pie Chart */}
        <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
          <h3 className="text-lg text-gray-900 mb-4">Occupancy Rate</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={occupancyData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {occupancyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-4">
            {occupancyData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-gray-600">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row (GIỮ NGUYÊN) */}
      <div className="grid grid-cols-2 gap-6">
        {/* Service Requests */}
        <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
          <h3 className="text-lg text-gray-900 mb-4">Service Requests (This Month)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={serviceRequests}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="category" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px'
                }} 
              />
              <Bar dataKey="count" fill="#2563eb" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
          <h3 className="text-lg text-gray-900 mb-4">Recent Activities</h3>
          <div className="space-y-4">
            {[
              { action: 'New resident moved in', unit: 'Unit 304', time: '2 hours ago', color: 'bg-blue-600' },
              { action: 'Maintenance completed', unit: 'Unit 112', time: '4 hours ago', color: 'bg-green-600' },
              { action: 'Bill payment received', unit: 'Unit 205', time: '5 hours ago', color: 'bg-purple-600' },
              { action: 'Service request opened', unit: 'Unit 407', time: '6 hours ago', color: 'bg-orange-600' },
              { action: 'Lease renewal signed', unit: 'Unit 156', time: '8 hours ago', color: 'bg-blue-600' },
            ].map((activity, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full ${activity.color} mt-2`} />
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.unit} • {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
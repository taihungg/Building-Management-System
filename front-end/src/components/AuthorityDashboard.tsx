import React, { useState, useEffect } from 'react';
import { Users, Bell, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function AuthorityDashboard() {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [residents, setResidents] = useState([]);
  const [error, setError] = useState ();

  useEffect(() => {
      fetchResidents();
    }, []);

    

  const fetchResidents = async () => {
    try {
      let url = 'http://localhost:8081/api/v1/residents';

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Can't get residents");
      }
      const res = await response.json();
      setResidents(res.data);
    }
    catch (err) {
      setError(err.message);
      // Không cần toast lỗi ở đây nếu muốn hiển thị lỗi tĩnh trên UI, 
      // nhưng nếu muốn có thể dùng toast.error("Lỗi tải dữ liệu");
    }
  }

  // Dữ liệu mẫu cho biểu đồ thông báo mất đồ
  // Trong thực tế, cần thêm trường status vào Announcement interface
  const lostItemStatusData = [
    { name: 'Đã xử lý', value: 8, color: '#10B981' },
    { name: 'Đang xử lý', value: 3, color: '#F59E0B' },
    { name: 'Không tìm thấy', value: 2, color: '#EF4444' },
  ];

  // Dữ liệu mẫu cho biểu đồ quản lý cư dân
  // Trong thực tế, cần lấy từ API với thông tin loại cư trú
  const residentTypeData = [
    { month: 'Tháng 1', nguoiNuocNgoai: 15, thuongTru: 120, tamTru: 25 },
    { month: 'Tháng 2', nguoiNuocNgoai: 18, thuongTru: 125, tamTru: 28 },
    { month: 'Tháng 3', nguoiNuocNgoai: 20, thuongTru: 130, tamTru: 30 },
    { month: 'Tháng 4', nguoiNuocNgoai: 22, thuongTru: 135, tamTru: 32 },
    { month: 'Tháng 5', nguoiNuocNgoai: 25, thuongTru: 140, tamTru: 35 },
    { month: 'Tháng 6', nguoiNuocNgoai: 28, thuongTru: 145, tamTru: 38 },
  ];

  const totalLostItems = lostItemStatusData.reduce((sum, item) => sum + item.value, 0);
  const totalResidents = residentTypeData.reduce((sum, item) => 
    sum + item.nguoiNuocNgoai + item.thuongTru + item.tamTru, 0
  );

  const residenceLabels: Record<string, string> = {
    nguoiNuocNgoai: 'Người nước ngoài',
    thuongTru: 'Thường trú',
    tamTru: 'Tạm trú',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Cơ Quan Chức Năng</h1>
        <p className="text-gray-600 mt-1">Quản lý cư dân và theo dõi thông báo mất đồ</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div 
          onClick={() => navigate('/authority/residents')}
          className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-blue-500 cursor-pointer transition-all shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Quản Lý Cư Dân</h3>
              <p className="text-gray-600 text-sm mt-1">Xem và quản lý thông tin cư dân</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div 
          onClick={() => navigate('/authority/announcements')}
          className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-blue-500 cursor-pointer transition-all shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Thông Báo Mất Đồ</h3>
              <p className="text-gray-600 text-sm mt-1">Xem các thông báo về đồ vật bị mất</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Bell className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Tổng số cư dân</h2>
          </div>
          <p className="text-3xl font-bold text-gray-900">{residents.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <h2 className="text-xl font-semibold text-gray-900">Thông báo mất đồ</h2>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalLostItems}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Biểu đồ tròn - Thông báo mất đồ */}
        <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Thông Báo Mất Đồ</h3>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={lostItemStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {lostItemStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => `${value} thông báo`}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '2px solid #e5e7eb', 
                  borderRadius: '8px',
                  padding: '10px'
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => <span style={{ color: '#374151' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-3 gap-4">
            {lostItemStatusData.map((item, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm font-medium text-gray-700">{item.name}</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Biểu đồ cột chồng - Quản lý cư dân */}
        <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Quản Lý Cư Dân</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={residentTypeData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="month" 
                stroke="#6b7280"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                stroke="#6b7280"
                tick={{ fontSize: 12 }}
                label={{ value: 'Số lượng', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '2px solid #e5e7eb', 
                  borderRadius: '8px',
                  padding: '10px'
                }}
                formatter={(value: number, name: string) => [
                  `${value} người`,
                  residenceLabels[name] || name,
                ]}
              />
              <Legend 
                wrapperStyle={{ paddingTop: 20 }}
                formatter={(value) => {
                  return <span style={{ color: '#374151' }}>{residenceLabels[value] || value}</span>;
                }}
              />
              <Bar 
                dataKey="nguoiNuocNgoai" 
                stackId="a" 
                fill="#3B82F6" 
                name={residenceLabels['nguoiNuocNgoai']}
                radius={[0, 0, 0, 0]}
              />
              <Bar 
                dataKey="thuongTru" 
                stackId="a" 
                fill="#10B981" 
                name={residenceLabels['thuongTru']}
                radius={[0, 0, 0, 0]}
              />
              <Bar 
                dataKey="tamTru" 
                stackId="a" 
                fill="#F59E0B" 
                name={residenceLabels['tamTru']}
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

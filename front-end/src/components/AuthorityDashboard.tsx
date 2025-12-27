import React, { useState, useEffect } from 'react';
import { Users, Bell, FileText, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Sector } from 'recharts';

const renderActiveLostItemSector = (props: any) => {
  const {
    cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill,
  } = props;

  return (
    <g>
      {/* main slice */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      {/* soft halo */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={outerRadius + 8}
        outerRadius={outerRadius + 14}
        startAngle={startAngle}
        endAngle={endAngle}
        fill="rgba(15,23,42,0.06)"
      />
    </g>
  );
};

// Helper function để format thời gian tương đối
const formatRelativeTime = (date: Date, currentTime: Date = new Date()): string => {
  const now = currentTime;
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) {
    return 'Vừa xong';
  }
  if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`;
  }
  if (diffInMinutes < 24 * 60) {
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours} giờ trước`;
  }
  const days = Math.floor(diffInMinutes / (24 * 60));
  return `${days} ngày trước`;
};

export function AuthorityDashboard() {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [residents, setResidents] = useState([]);
  const [error, setError] = useState ();
  const [activeLostItemIndex, setActiveLostItemIndex] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date()); // State để cập nhật thời gian thực

  useEffect(() => {
      fetchResidents();
    }, []);

  // Cập nhật thời gian thực mỗi phút để hiển thị thời gian tương đối chính xác
  useEffect(() => {
    setCurrentTime(new Date()); // Cập nhật ngay lập tức
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Cập nhật mỗi 60 giây (1 phút)

    return () => clearInterval(interval);
  }, []);

  // Helper function để format thời gian với currentTime
  const formatTime = (date: Date) => formatRelativeTime(date, currentTime);

  // Tính toán thời gian cho "10:30 hôm nay"
  const getTodayAtTime = (hours: number, minutes: number): Date => {
    const today = new Date();
    today.setHours(hours, minutes, 0, 0);
    return today;
  };

    

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

  // Dữ liệu mẫu cho biểu đồ tỉ lệ cư dân
  // Trong thực tế, cần lấy từ API với thông tin trạng thái cư trú
  const residentStatusData = [
    { name: 'Thường trú', value: 145, color: '#10B981' },
    { name: 'Tạm trú', value: 38, color: '#F59E0B' },
    { name: 'Tạm vắng', value: 12, color: '#3B82F6' },
    { name: 'Vãng lai', value: 8, color: '#8B5CF6' },
  ];

  const totalResidents = residentStatusData.reduce((sum, item) => sum + item.value, 0);
  const totalLostItems = 13; // Giữ lại cho card summary

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quản lý cư trú và an ninh</h1>
      </div>

      {/* Summary cards - 4 columns (solid bold colors, white text) */}
      <div className="grid grid-cols-4 gap-4">
        {/* Card 1: Quản lý cư dân (Deep Navy Blue) */}
        <div
          onClick={() => navigate('/authority/residents')}
          className="rounded-xl shadow-md p-6 h-32 relative overflow-hidden cursor-pointer transition-transform hover:scale-[1.02] flex justify-between items-center"
          style={{ backgroundColor: '#1e293b' }}
        >
          <div className="flex flex-col">
            <p className="text-3xl font-bold text-white mb-1">Truy cập</p>
            <p className="text-sm font-medium text-white opacity-90">Quản lý cư dân</p>
          </div>
          <Building2 className="w-12 h-12 text-white opacity-80" />
        </div>

        {/* Card 2: Báo mất đồ (Vibrant Green) */}
        <div
          onClick={() => navigate('/authority/announcements')}
          className="rounded-xl shadow-md p-6 h-32 relative overflow-hidden cursor-pointer transition-transform hover:scale-[1.02] flex justify-between items-center"
          style={{ backgroundColor: '#10b981' }}
        >
          <div className="flex flex-col">
            <p className="text-3xl font-bold text-white mb-1">Xem ngay</p>
            <p className="text-sm font-medium text-white opacity-90">Báo mất đồ</p>
          </div>
          <Bell className="w-12 h-12 text-white opacity-80" />
        </div>

        {/* Card 3: Tổng cư dân (Bright Blue) */}
        <div 
          className="rounded-xl shadow-md p-6 h-32 relative overflow-hidden flex justify-between items-center"
          style={{ backgroundColor: '#3b82f6' }}
        >
          <div className="flex flex-col">
            <p className="text-3xl font-bold text-white mb-1">{residents.length}</p>
            <p className="text-sm font-medium text-white opacity-90">Tổng cư dân</p>
          </div>
          <Users className="w-12 h-12 text-white opacity-80" />
        </div>

        {/* Card 4: Tin báo mới (Orange) */}
        <div 
          className="rounded-xl shadow-md p-6 h-32 relative overflow-hidden flex justify-between items-center"
          style={{ backgroundColor: '#f97316' }}
        >
          <div className="flex flex-col">
            <p className="text-3xl font-bold text-white mb-1">{totalLostItems}</p>
            <p className="text-sm font-medium text-white opacity-90">Tin báo mới</p>
          </div>
          <FileText className="w-12 h-12 text-white opacity-80" />
        </div>
      </div>

      {/* Charts Row - Pie (1/3) + Table (2/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Biểu đồ tròn - tỉ lệ cư dân (1/3 width) */}
        <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 flex flex-col lg:col-span-1 h-[340px]">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Tỉ lệ cư dân</h3>
          
          {/* Donut chart centered */}
          <div className="flex-1 flex items-center justify-center relative cursor-pointer">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={residentStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  activeIndex={activeLostItemIndex === null ? undefined : activeLostItemIndex}
                  activeShape={renderActiveLostItemSector}
                  onMouseLeave={() => setActiveLostItemIndex(null)}
                >
                  {residentStatusData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      cursor="pointer"
                      onMouseEnter={() => setActiveLostItemIndex(index)}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  formatter={(value: number, name: string) => [
                    `${value} người`,
                    name,
                  ]}
                  contentStyle={{ 
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    padding: '10px'
                  }}
                  itemStyle={{ 
                    color: '#374151',
                    fontWeight: 500 
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center total in donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-gray-900">{totalResidents}</span>
              <span className="text-xs text-gray-500 mt-1">tổng cư dân</span>
            </div>
          </div>

          {/* Compact legend under chart */}
          <div className="mt-4 space-y-2">
            {residentStatusData.map((item, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span 
                    className="text-xs font-medium"
                    style={{ color: item.color }}
                  >
                    {item.name}
                  </span>
                </div>
                <span 
                  className="text-xs font-semibold"
                  style={{ color: item.color }}
                >
                  {item.value} người
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tin báo cần xử lý gấp (2/3 width) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Tin báo cần xử lý gấp</h2>
            <button 
              onClick={() => navigate('/authority/announcements')}
              className="text-sm text-blue-600 hover:underline cursor-pointer"
            >
              Xem tất cả
            </button>
          </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-6 text-left">Người báo</th>
                <th className="py-3 px-6 text-left w-[40%]">Sự vụ</th>
                <th className="py-3 px-6 text-left">Thời gian</th>
                <th className="py-3 px-6 text-left">Trạng thái</th>
                <th className="py-3 px-6 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {/* Row 1 */}
              <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors duration-150">
                <td className="py-4 px-6 align-top">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-700">
                      TN
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">Trần Nam</p>
                      <p className="text-xs text-gray-500">Căn hộ B-1203</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 align-top">
                  <p className="text-sm font-medium text-gray-900">Mất ví tại sảnh A</p>
                  <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                    Cần rà soát camera khu vực lễ tân
                  </p>
                </td>
                <td className="py-4 px-6 align-top text-gray-700 whitespace-nowrap">
                  2 phút trước
                </td>
                <td className="py-4 px-6 align-top">
                  <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-300">
                    Đang xử lý
                  </span>
                </td>
                <td className="py-4 px-6 align-top text-right">
                  <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-900 hover:underline cursor-pointer">
                    Xử lý ngay
                  </button>
                </td>
              </tr>

              {/* Row 2 */}
              <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors duration-150">
                <td className="py-4 px-6 align-top">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-semibold text-emerald-700">
                      HH
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">Hoàng Huy</p>
                      <p className="text-xs text-gray-500">Căn hộ C-1208</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 align-top">
                  <p className="text-sm font-medium text-gray-900">Tiếng ồn lớn tầng 12</p>
                  <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                    Khả năng do sửa chữa trái giờ quy định
                  </p>
                </td>
                <td className="py-4 px-6 align-top text-gray-700 whitespace-nowrap">
                  {formatTime(getTodayAtTime(10, 30))}
                </td>
                <td className="py-4 px-6 align-top">
                  <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300">
                    Chưa xử lý
                  </span>
                </td>
                <td className="py-4 px-6 align-top text-right">
                  <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-900 hover:underline cursor-pointer">
                    Xử lý ngay
                  </button>
                </td>
              </tr>

              {/* Row 3 */}
              <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors duration-150">
                <td className="py-4 px-6 align-top">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-700">
                      LT
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">Lê Trang</p>
                      <p className="text-xs text-gray-500">Căn hộ B-0905</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 align-top">
                  <p className="text-sm font-medium text-gray-900">Người lạ vào thang máy khu B</p>
                  <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                    Không có thẻ cư dân, cần kiểm tra lại camera
                  </p>
                </td>
                <td className="py-4 px-6 align-top text-gray-700 whitespace-nowrap">
                  35 phút trước
                </td>
                <td className="py-4 px-6 align-top">
                  <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-300">
                    Đang xử lý
                  </span>
                </td>
                <td className="py-4 px-6 align-top text-right">
                  <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-900 hover:underline cursor-pointer">
                    Xử lý ngay
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Users, Bell, CreditCard, FileText, ChevronRight, Building2, AlertTriangle, Clipboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Sector } from 'recharts';

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

export function AuthorityDashboard() {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [residents, setResidents] = useState([]);
  const [error, setError] = useState ();
  const [activeLostItemIndex, setActiveLostItemIndex] = useState<number | null>(null);

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

      {/* Charts Row - Pie (1/3) + Bar (2/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Biểu đồ tròn - thông báo mất đồ (1/3 width) */}
        <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 flex flex-col lg:col-span-1 h-[340px]">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Thông báo mất đồ</h3>
          
          {/* Donut chart centered */}
          <div className="flex-1 flex items-center justify-center relative cursor-pointer">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={lostItemStatusData}
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
                  {lostItemStatusData.map((entry, index) => (
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
                    `${value} thông báo`,
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
              <span className="text-2xl font-bold text-gray-900">{totalLostItems}</span>
              <span className="text-xs text-gray-500 mt-1">tổng tin báo</span>
            </div>
          </div>

          {/* Compact legend under chart */}
          <div className="mt-4 space-y-2">
            {lostItemStatusData.map((item, index) => (
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
                  {item.value} thông báo
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Biểu đồ cột chồng - quản lý cư dân (2/3 width) */}
        <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 lg:col-span-2">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Quản lý cư dân</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={residentTypeData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
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
                radius={[4, 4, 0, 0]}
                cursor="pointer"
              />
              <Bar 
                dataKey="thuongTru" 
                stackId="a" 
                fill="#10B981" 
                name={residenceLabels['thuongTru']}
                radius={[4, 4, 0, 0]}
                cursor="pointer"
              />
              <Bar 
                dataKey="tamTru" 
                stackId="a" 
                fill="#F59E0B" 
                name={residenceLabels['tamTru']}
                radius={[4, 4, 0, 0]}
                cursor="pointer"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent incident reports table */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">Tin báo cần xử lý gấp</h2>
          <button className="text-sm text-blue-600 hover:underline">
            Xem tất cả
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-6 text-left w-[40%]">Sự vụ</th>
                <th className="py-3 px-6 text-left">Người báo</th>
                <th className="py-3 px-6 text-left">Thời gian</th>
                <th className="py-3 px-6 text-left">Mức độ</th>
                <th className="py-3 px-6 text-left">Trạng thái</th>
                <th className="py-3 px-6 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {/* Row 1 */}
              <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors duration-150">
                <td className="py-4 px-6 align-top">
                  <p className="text-sm font-medium text-gray-900">Mất ví tại sảnh A</p>
                  <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                    Cần rà soát camera khu vực lễ tân
                  </p>
                </td>
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
                <td className="py-4 px-6 align-top text-gray-700 whitespace-nowrap">
                  2 phút trước
                </td>
                <td className="py-4 px-6 align-top">
                  <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                    Cao
                  </span>
                </td>
                <td className="py-4 px-6 align-top">
                  <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
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
                  <p className="text-sm font-medium text-gray-900">Tiếng ồn lớn tầng 12</p>
                  <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                    Khả năng do sửa chữa trái giờ quy định
                  </p>
                </td>
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
                <td className="py-4 px-6 align-top text-gray-700 whitespace-nowrap">
                  10:30 hôm nay
                </td>
                <td className="py-4 px-6 align-top">
                  <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-100">
                    Trung bình
                  </span>
                </td>
                <td className="py-4 px-6 align-top">
                  <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
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
                  <p className="text-sm font-medium text-gray-900">Người lạ vào thang máy khu B</p>
                  <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                    Không có thẻ cư dân, cần kiểm tra lại camera
                  </p>
                </td>
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
                <td className="py-4 px-6 align-top text-gray-700 whitespace-nowrap">
                  35 phút trước
                </td>
                <td className="py-4 px-6 align-top">
                  <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                    Cao
                  </span>
                </td>
                <td className="py-4 px-6 align-top">
                  <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
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
  );
}


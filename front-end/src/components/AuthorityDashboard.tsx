import React, { useState, useEffect, useCallback } from 'react';
import { Users, Bell, Building2, FileText, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Sector } from 'recharts';
import { toast } from 'sonner';

const renderActiveLostItemSector = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector
        cx={cx} cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx} cy={cy}
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
  const [residents, setResidents] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [activeLostItemIndex, setActiveLostItemIndex] = useState<number | null>(null);

  const fetchResidents = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/residents');
      if (!response.ok) throw new Error("Không thể lấy dữ liệu cư dân");
      const res = await response.json();
      setResidents(res.data || []);
    } catch (err: any) {
      console.error(err.message);
    }
  };

  const fetchIssues = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8080/api/issues');
      if (!response.ok) throw new Error("Không thể tải danh sách sự cố.");
      const rawData = await response.json();
      const filteredIssue = rawData.filter((e: any) => e?.type === 'AUTHORITY');
      setIssues(filteredIssue);
    } catch (err: any) {
      toast.error("Lỗi: " + err.message);
    }
  }, []);

  useEffect(() => {
    fetchResidents();
    fetchIssues();
  }, [fetchIssues]);

  // Data cho PieChart
  const lostItemStatusData = [
    { name: 'Đã xử lý', value: issues.filter(e => e.status === 'PROCESSED').length, color: '#10B981' },
    { name: 'Đang xử lý', value: issues.filter(e => e.status === 'PROCESSING').length, color: '#3b82f6' },
    { name: 'Chưa xử lý', value: issues.filter(e => e.status === 'UNPROCESSED').length, color: '#EF4444' },
  ];

  const totalLostItems = lostItemStatusData.reduce((sum, item) => sum + item.value, 0);

  // Lấy 3 thông báo mới nhất có trạng thái UNPROCESSED cho bảng
  const urgentIssues = issues
    .filter(e => e.status === 'UNPROCESSED')
    .slice(0, 3);

  // Tính toán dữ liệu từ API (không có API trả về dữ liệu theo tháng, nên chỉ hiển thị tổng số)
  const residentTypeData = [
    { 
      month: 'Tổng số', 
      PERMANENT_RESIDENCE: residents.filter(r => r.status === 'PERMANENT_RESIDENCE').length,
      TEMPORARY_RESIDENCE: residents.filter(r => r.status === 'TEMPORARY_RESIDENCE').length,
      ACCOMMODATION: residents.filter(r => r.status === 'ACCOMMODATION').length,
      TEMPORARY_ABSENCE: residents.filter(r => r.status === 'TEMPORARY_ABSENCE').length,
      INACTIVE: residents.filter(r => r.status === 'INACTIVE').length,
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quản lý cư trú và an ninh</h1>
      </div>

      {/* --- GIỮ NGUYÊN 4 Ô CARD ĐẦU --- */}
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
            <p className="text-3xl font-bold text-white mb-1">{issues.filter(e => e.status === 'UNPROCESSED').length}</p>
            <p className="text-sm font-medium text-white opacity-90">Tin báo chưa xử lý</p>
          </div>
          <FileText className="w-12 h-12 text-white opacity-80" />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 flex flex-col h-[340px]">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Thông báo mất đồ</h3>
          <div className="flex-1 flex items-center justify-center relative cursor-pointer">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={lostItemStatusData}
                  cx="50%" cy="50%"
                  innerRadius={50} outerRadius={90}
                  paddingAngle={3} dataKey="value"
                  activeIndex={activeLostItemIndex === null ? undefined : activeLostItemIndex}
                  activeShape={renderActiveLostItemSector}
                  onMouseLeave={() => setActiveLostItemIndex(null)}
                >
                  {lostItemStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} onMouseEnter={() => setActiveLostItemIndex(index)} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-gray-900">{totalLostItems}</span>
              <span className="text-xs text-gray-500 mt-1">Tổng tin báo</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 lg:col-span-2">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Quản lý cư dân</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={residentTypeData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="PERMANENT_RESIDENCE" stackId="a" fill="#10B981" name="PERMANENT_RESIDENCE" radius={[4, 4, 0, 0]} />
              <Bar dataKey="TEMPORARY_RESIDENCE" stackId="a" fill="#F59E0B" name="TEMPORARY_RESIDENCE" radius={[4, 4, 0, 0]} />
              <Bar dataKey="ACCOMMODATION" stackId="a" fill="#3B82F6" name="ACCOMMODATION" radius={[4, 4, 0, 0]} />
              <Bar dataKey="TEMPORARY_ABSENCE" stackId="a" fill="#FBBF24" name="TEMPORARY_ABSENCE" radius={[4, 4, 0, 0]} />
              <Bar dataKey="INACTIVE" stackId="a" fill="#9CA3AF" name="INACTIVE" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Urgent Issues Table */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-red-600 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> Tin báo cần xử lý gấp (Chưa xử lý)
          </h2>
          <button onClick={() => navigate('/authority/announcements')} className="text-sm text-blue-600 hover:underline font-bold">
            Xem tất cả
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-6 text-left w-[40%]">Sự vụ</th>
                <th className="py-3 px-6 text-left">Người báo</th>
                <th className="py-3 px-6 text-left">Trạng thái</th>
                <th className="py-3 px-6 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {urgentIssues.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-gray-400 font-medium">
                    🎉 Tuyệt vời! Không có tin báo nào đang chờ xử lý.
                  </td>
                </tr>
              ) : (
                urgentIssues.map((issue: any) => (
                  <tr key={issue.id} className="border-b border-gray-100 last:border-0 hover:bg-red-50/30 transition-colors">
                    <td className="py-4 px-6">
                      <p className="text-sm font-bold text-gray-900">{issue.title}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">{issue.description}</p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-700">
                          {issue.reporterName?.substring(0, 2).toUpperCase() || 'CD'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-800">{issue.reporterName}</p>
                          <p className="text-[10px] text-gray-500">Phòng {issue.roomNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-red-100 text-red-700 border border-red-200">
                        Chưa xử lý
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button 
                        onClick={() => navigate('/authority/announcements')}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 underline"
                      >
                        Xử lý ngay
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
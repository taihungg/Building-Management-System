import { useState, useEffect } from 'react'; 
import { Users, Building2, DollarSign, AlertCircle, ClipboardList, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import React from 'react';

interface Issue {
    title: string;
    roomNumber?: string;
    status: string;
}

export function Dashboard() {
  const [residentCount, setResidentCount] = useState(0);
  const [apartmentStats, setApartmentStats] = useState({ occupied: 0, total: 0 });
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [chartData, setChartData] = useState<any[]>([]); 
  const [pendingIssuesList, setPendingIssuesList] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const occupancyRate = apartmentStats.total > 0 
    ? ((apartmentStats.occupied / apartmentStats.total) * 100).toFixed(1) 
    : "0";

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND', 
        maximumFractionDigits: 0 
    }).format(amount);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;

      try {
        const resRes = await fetch('http://localhost:8081/api/v1/residents');
        const dataRes = await resRes.json();
        if (resRes.ok) setResidentCount(dataRes.data?.length || 0);

        const resApt = await fetch('http://localhost:8081/api/v1/apartments');
        const dataApt = await resApt.json();
        if (resApt.ok) {
            const total = dataApt.data?.length || 0;
            const occupied = dataApt.data?.filter((a: any) => a.residentNumber > 0).length || 0;
            setApartmentStats({ total, occupied });
        }

        const resChart = await fetch(`http://localhost:8081/api/v1/accounting/dashboard/barchart?year=${currentYear}`);
        const dataChart = await resChart.json();
        if (resChart.ok && dataChart.data) {
            const formattedData = dataChart.data
                .map((item: any) => ({
                    month: `Tháng ${item.month}`,
                    monthNum: item.month,
                    phaiThu: Number(item.totalRevenue) || 0,
                    thucThu: Number(item.paidRevenue) || 0
                }))
                .filter((item: any) => item.monthNum <= currentMonth && item.monthNum > currentMonth - 6)
                .sort((a: any, b: any) => a.monthNum - b.monthNum);
                
            setChartData(formattedData);
            const currentMonthData = dataChart.data.find((m: any) => m.month === currentMonth);
            setMonthlyRevenue(currentMonthData ? currentMonthData.paidRevenue : 0);
        }

        const resIssue = await fetch('http://localhost:8081/api/issues');
        const dataIssue = await resIssue.json();
        if (resIssue.ok) {
            const pending = (dataIssue as Issue[]).filter(i => i.status === 'UNPROCESSED');
            setPendingIssuesList(pending);
        }
      } catch (err) {
        console.error("Lỗi Dashboard API:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen text-slate-900 font-sans"> 
      
      {/* --- STATS CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" style={{ marginBottom: '48px' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ padding: '12px', backgroundColor: '#eff6ff', color: '#2563eb', borderRadius: '16px' }}>
              <Users size={22} />
            </div>
            <span style={{ fontSize: '12px', fontWeight: 500, color: '#10b981', backgroundColor: '#ecfdf5', padding: '4px 12px', borderRadius: '100px' }}>+2.5%</span>
          </div>
          <div style={{ marginTop: '20px' }}>
            <p style={{ fontSize: '13px', fontWeight: 400, color: '#64748b', margin: 0 }}>Tổng cư dân</p>
            <p style={{ fontSize: '24px', fontWeight: 600, color: '#1e293b', margin: '2px 0 0 0' }}>{residentCount.toLocaleString()}</p>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <div style={{ padding: '12px', backgroundColor: '#eef2ff', color: '#4f46e5', borderRadius: '16px', width: 'fit-content' }}>
            <Building2 size={22} />
          </div>
          <div style={{ marginTop: '20px' }}>
            <p style={{ fontSize: '13px', fontWeight: 400, color: '#64748b', margin: 0 }}>Tỉ lệ căn hộ đang ở</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <p style={{ fontSize: '24px', fontWeight: 600, color: '#1e293b', margin: '2px 0 0 0' }}>{occupancyRate}%</p>
              <p style={{ fontSize: '12px', fontWeight: 400, color: '#94a3b8' }}>{apartmentStats.occupied}/{apartmentStats.total} căn</p>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <div style={{ padding: '12px', backgroundColor: '#ecfdf5', color: '#059669', borderRadius: '16px', width: 'fit-content' }}>
            <DollarSign size={22} />
          </div>
          <div style={{ marginTop: '20px' }}>
            <p style={{ fontSize: '13px', fontWeight: 400, color: '#64748b', margin: 0 }}>Doanh thu tháng {new Date().getMonth() + 1}</p>
            <p style={{ fontSize: '24px', fontWeight: 600, color: '#059669', margin: '2px 0 0 0' }}>{formatCurrency(monthlyRevenue)}</p>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '32px', border: '1px solid #ffe4e6', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <div style={{ padding: '12px', backgroundColor: '#fff1f2', color: '#e11d48', borderRadius: '16px', width: 'fit-content' }}>
            <AlertCircle size={22} />
          </div>
          <div style={{ marginTop: '20px' }}>
            <p style={{ fontSize: '13px', fontWeight: 400, color: '#64748b', margin: 0 }}>Yêu cầu chờ xử lý</p>
            <p style={{ fontSize: '24px', fontWeight: 600, color: '#e11d48', margin: '2px 0 0 0' }}>{pendingIssuesList.length}</p>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" style={{ marginTop: '40px', columnGap: '32px' }}>        
        
        {/* 1. Biểu đồ Tài chính */}
        <div className="lg:col-span-2 bg-white border border-slate-100 shadow-sm" style={{ borderRadius: '32px', padding: '32px', display: 'flex', flexDirection: 'column', minHeight: '480px' }}>
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-800" style={{ margin: 0 }}>Phân tích dòng tiền 6 tháng gần nhất</h3>
              <p className="text-sm text-slate-400 mt-1">So sánh doanh thu dự kiến và thực tế</p>
            </div>
            
            {/* Phần chú thích (Legend) sử dụng màu mới */}
            <div className="flex gap-4 px-4 py-2 rounded-xl" style={{ backgroundColor: '#f8fafc' }}>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                {/* Fix cứng width/height bằng inline style */}
                <div style={{ 
                  width: '10px', 
                  height: '10px', 
                  backgroundColor: '#818cf8', // Màu Indigo rõ hơn
                  borderRadius: '50%' 
                }}></div> 
                <span>Phải thu</span>
              </div>
              
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <div style={{ 
                  width: '10px', 
                  height: '10px', 
                  backgroundColor: '#059669', // Màu Emerald đậm
                  borderRadius: '50%' 
                }}></div> 
                <span>Thực thu</span>
              </div>
            </div>
          </div>

          <div className="border border-slate-100" style={{ backgroundColor: 'rgba(248, 250, 252, 0.5)', borderRadius: '32px', padding: '24px 16px 12px 10px', flex: 1, width: '100%', position: 'relative', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.01)' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 11}} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 11}} 
                  tickFormatter={(v) => v >= 1000000 ? `${(v/1000000).toFixed(0)}M` : v} 
                  width={35} 
                />
                <Tooltip 
                  cursor={{fill: '#ffffff', opacity: 0.7}} 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)'}} 
                />
                
                {/* Cập nhật màu sắc trực tiếp cho các cột (Bar) */}
                <Bar 
                  dataKey="phaiThu" 
                  fill="#C7D2FE" 
                  radius={[4, 4, 0, 0]} 
                  barSize={16} 
                />
                <Bar 
                  dataKey="thucThu" 
                  fill="#059669" 
                  radius={[4, 4, 0, 0]} 
                  barSize={16} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Danh sách yêu cầu */}
        <div 
          className="bg-white flex flex-col overflow-hidden transition-all duration-300" 
          style={{
            borderRadius: '32px',
            // Đổ bóng đa lớp giúp card trông nổi khối và mềm mại hơn
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.04), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
            border: '1px solid #f1f5f9'
          }}
        >
          {/* Header: Làm màu text đậm hơn và icon có màu sắc để tạo điểm nhấn */}
          <div className="p-6 border-b border-slate-50 flex justify-between items-center" style={{ backgroundColor: '#ffffff' }}>
            <div className="flex items-center gap-3">
                {/* Icon mang màu thương hiệu */}
                <div style={{ color: '#6366f1' }}> 
                    <ClipboardList size={22} />
                </div>
                <h3 className="text-lg font-extrabold text-slate-800" style={{ letterSpacing: '-0.02em' }}>
                    Yêu cầu chưa xử lý
                </h3>
            </div>
            <span 
              className="text-[11px] font-bold px-3 py-1 rounded-full shadow-sm" 
              style={{ 
                backgroundColor: '#fff1f2', 
                color: '#e11d48',
                border: '1px solid #ffe4e6' // Thêm viền nhẹ cho badge
              }}
            >
                {pendingIssuesList.length} MỚI
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <table className="w-full">
                <tbody className="divide-y divide-slate-50">
                    {pendingIssuesList.length > 0 ? (
                        pendingIssuesList.slice(0, 6).map((issue, idx) => (
                            <tr 
                              key={idx} 
                              className="transition-all duration-200 group"
                              style={{ cursor: 'pointer' }}
                            >
                                <td className="py-4 px-6 group-hover:bg-indigo-50/30">
                                    <p className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">
                                        {issue.title || "Yêu cầu kỹ thuật"}
                                    </p>
                                    <p className="text-[11px] text-slate-400 mt-1 font-medium">
                                        <span style={{ color: '#94a3b8' }}>Vị trí:</span> Phòng {issue.roomNumber || '---'}
                                    </p>
                                </td>
                                <td className="py-4 px-6 text-right group-hover:bg-indigo-50/30">
                                    <Link 
                                      to="/admin/services" 
                                      className="inline-flex items-center text-[11px] font-bold text-indigo-500 hover:text-indigo-700 uppercase tracking-wider"
                                    >
                                        Chi tiết <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr><td className="py-20 text-center text-slate-400 text-sm font-medium italic">Không có yêu cầu chờ xử lý</td></tr>
                    )}
                </tbody>
            </table>
          </div>
          
          {/* Footer: Thay đổi màu nền và màu text để tăng sự chú ý */}
          <Link 
            to="/admin/services" 
            className="p-4 text-center text-xs font-bold transition-all duration-200 border-t border-slate-100"
            style={{ 
                backgroundColor: '#f8fafc', 
                color: '#64748b',
                letterSpacing: '0.05em'
            }}
            onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#6366f1';
                e.currentTarget.style.color = '#ffffff';
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#f8fafc';
                e.currentTarget.style.color = '#64748b';
            }}
          >
            XEM TẤT CẢ YÊU CẦU
          </Link>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react'; 
import { Users, Building2, DollarSign, AlertCircle, TrendingUp, TrendingDown, LayoutDashboard, Home } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import React from 'react';
import { Link } from 'react-router-dom'; 

// Màu sắc cho Pie Chart (Occupancy) - DÙNG MÀU GỐC
const OCCUPANCY_COLORS = ['#2563eb', '#e5e7eb']; 

// --- Định nghĩa Kiểu Dữ Liệu Tạm Thời (Giúp Type Safety) ---
interface Issue {
    type: string;
    status: string;
}

interface Bill {
    status: string;
    totalAmount: number;
    paymentDate?: string;
    createdTime: string; // Dùng để tính Phải Thu
}
// -----------------------------------------------------------


export function Dashboard() {
  // --- STATE ĐỂ LƯU DỮ LIỆU TỪ API ---
  const [residentCount, setResidentCount] = useState(0);
  const [apartmentStats, setApartmentStats] = useState({ occupied: 0, total: 0 });
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  // Dữ liệu dòng tiền đã được lọc 6 tháng cuối
  const [chartData, setChartData] = useState<any[]>([]); 
  const [pendingIssueCount, setPendingIssueCount] = useState(0); 
  const [serviceRequestsData, setServiceRequestsData] = useState<any[]>([]); 


  // --- HÀM TÍNH TOÁN VÀ ĐỊNH DẠNG ---

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND',
        maximumFractionDigits: 0
    }).format(amount);
  };
  
  const calculateServiceRequestsData = (issues: Issue[]) => {
      // Mapping IssueType ENUM sang Category Label (Tiếng Việt)
      const typeMap: { [key: string]: string } = {
          'MAINTENANCE': 'Bảo trì', 
          'PLUMBING': 'Ống nước',
          'ELECTRICAL': 'Điện',
          'HVAC': 'Điều hòa',
          'CLEANING': 'Vệ sinh',
          'SECURITY': 'An ninh',
      };
      
      const categoryCounts = issues.reduce((acc, issue) => {
          const type = issue.type; 
          const categoryLabel = typeMap[type] || 'Khác';

          acc[categoryLabel] = (acc[categoryLabel] || 0) + 1;
          return acc;
      }, {} as { [key: string]: number });
      
      const chartData = Object.keys(categoryCounts).map(category => ({
          category: category,
          count: categoryCounts[category]
      }));
      
      return chartData;
  };

  const calculateMonthlyChartData = (bills: Bill[]) => {
    const currentYear = new Date().getFullYear();
    const currentMonthIndex = new Date().getMonth(); // 0 (Jan) to 11 (Dec)
    const monthlyMap = new Map<string, { month: string, phaiThu: number, thucThu: number, congNo: number }>();
    const monthsToShow: { month: number, year: number }[] = [];

    // 1. Xác định 6 tháng cuối cùng
    for (let i = 0; i < 6; i++) {
        let month = currentMonthIndex - i; 
        let year = currentYear;

        // Xử lý khi lùi về năm trước 
        if (month < 0) {
            month += 12; 
            year -= 1;
        }

        monthsToShow.unshift({ month: month + 1, year: year }); // Thêm vào đầu để sắp xếp từ tháng cũ nhất
    }
    
    // 2. Khởi tạo dữ liệu cho 6 tháng này
    monthsToShow.forEach(({ month, year }) => {
        const key = `${month}-${year}`;
        monthlyMap.set(key, {
            month: `Thg ${month}`,
            phaiThu: 0,
            thucThu: 0,
            congNo: 0,
        });
    });

    // 3. Xử lý bills
    bills.forEach(bill => {
      const amount = bill.totalAmount || 0;
      
      // Tính PHẢI THU (dựa trên createdTime)
      if (bill.createdTime) {
          const createdDate = new Date(bill.createdTime);
          const createdMonth = createdDate.getMonth() + 1;
          const createdYear = createdDate.getFullYear();
          const createdKey = `${createdMonth}-${createdYear}`;

          if (monthlyMap.has(createdKey)) {
              const entry = monthlyMap.get(createdKey)!;
              entry.phaiThu += amount; 
          }
      }

      // Tính THỰC THU (dựa trên paymentDate và status === 'PAID')
      if (bill.status === 'PAID' && bill.paymentDate) {
          const paymentDate = new Date(bill.paymentDate);
          const paymentMonth = paymentDate.getMonth() + 1;
          const paymentYear = paymentDate.getFullYear();
          const paymentKey = `${paymentMonth}-${paymentYear}`;
          
          if (monthlyMap.has(paymentKey)) {
              const entry = monthlyMap.get(paymentKey)!;
              entry.thucThu += amount; 
          }
      }
    });
    
    // 4. Lấy dữ liệu theo thứ tự và tính công nợ
    const chartData = monthsToShow.map(({ month, year }) => {
        const entry = monthlyMap.get(`${month}-${year}`)!;
        return {
            ...entry,
            // Thêm năm vào nhãn tháng nếu không phải là năm hiện tại
            month: year !== currentYear ? `Thg ${month}/${year % 100}` : `Thg ${month}`, 
            congNo: entry.phaiThu - entry.thucThu 
        };
    });

    return chartData;
  };
  
  // --- USE EFFECT FETCH DATA (Đã sửa để lấy dữ liệu 2 năm cho chart) ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const currentYear = new Date().getFullYear(); 
        const previousYear = currentYear - 1;

        // Fetch Residents & Apartments (Không đổi)
        const resResidents = await fetch('http://localhost:8081/api/v1/residents');
        const dataResidents = await resResidents.json();
        if (resResidents.ok) {
          setResidentCount(dataResidents.data.length);
        }

        const resApartments = await fetch('http://localhost:8081/api/v1/apartments');
        const dataApartments = await resApartments.json();
        if (resApartments.ok) {
          const allApartments = dataApartments.data;
          const total = allApartments.length;
          const occupied = allApartments.filter((apt: any) => apt.residentNumber > 0).length;
          setApartmentStats({ total, occupied });
        }
        
        // 🔥 Fetch Invoices: Lấy dữ liệu của năm hiện tại và năm trước để đảm bảo có đủ 6 tháng
        let allRevenues: Bill[] = [];
        
        const resInvoicesCurrent = await fetch (`http://localhost:8081/api/v1/accounting/invoices?year=${currentYear}`);
        const dataInvoicesCurrent = await resInvoicesCurrent.json();
        if (resInvoicesCurrent.ok && dataInvoicesCurrent.data) {
            allRevenues = allRevenues.concat(dataInvoicesCurrent.data as Bill[]);
        }
        
        const resInvoicesPrevious = await fetch (`http://localhost:8081/api/v1/accounting/invoices?year=${previousYear}`);
        const dataInvoicesPrevious = await resInvoicesPrevious.json();
        if (resInvoicesPrevious.ok && dataInvoicesPrevious.data) {
            allRevenues = allRevenues.concat(dataInvoicesPrevious.data as Bill[]);
        }

        if (allRevenues.length > 0){
          // Tính Doanh thu tháng hiện tại (chỉ cần data của năm hiện tại)
          const currentMonth = new Date().getMonth() + 1;
          const monthlyPaidInvoices = allRevenues.filter((e: Bill) => 
            e.status === 'PAID' && e.paymentDate && new Date(e.paymentDate).getMonth() + 1 === currentMonth && new Date(e.paymentDate).getFullYear() === currentYear
          );

          const currentMonthlyRevenue = monthlyPaidInvoices.reduce ((total: number, invoice: Bill)=>{
              return total + (invoice.totalAmount || 0);
          },0);
          
          setMonthlyRevenue(currentMonthlyRevenue);
          setChartData(calculateMonthlyChartData(allRevenues as Bill[]));
        }
        
        const resIssues =  await fetch ('http://localhost:8081/api/issues');
        const dataIssue = await resIssues.json();
        if (resIssues.ok){
          const allIssues = dataIssue as Issue[]; 
          
          const pendingIssues = allIssues.filter(issue => issue.status === 'UNPROCESSED');
          setPendingIssueCount(pendingIssues.length);
          
          const serviceData = calculateServiceRequestsData(allIssues);
          setServiceRequestsData(serviceData);
        }
        
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu Dashboard:", error);
      }
    };


    fetchDashboardData();
  }, []);
  
  // --- CẤU HÌNH STATS (Đã dịch sang Tiếng Việt) ---
  const occupancyRate = apartmentStats.total > 0 ? ((apartmentStats.occupied/apartmentStats.total)*100).toFixed(1) : 0;
  
  const stats = [
    { 
      label: 'Tổng số cư dân', 
      value: residentCount.toString(),
      
      icon: Users,
      bgColor: 'bg-blue-600',
      link: '/admin/residents',
      description: 'Hiện đang sinh sống' // Dịch
    },
    { 
      label: 'Số căn hộ có người ở', 
      value: `${apartmentStats.occupied}/${apartmentStats.total}`,
     
      icon: Building2,
      bgColor: 'bg-purple-600',
      link: '/admin/apartments',
      description: 'Tỷ lệ Lấp đầy' // Dịch
    },
    { 
      label: `Doanh thu tháng ${new Date().getMonth() + 1}`, 
      value: formatCurrency(monthlyRevenue),
      
      icon: DollarSign,
      bgColor: 'bg-green-600',
      link: '/admin/bills',
      description: 'Tổng tiền đã thanh toán' // Dịch
    },
    { 
      label: 'Yêu cầu chờ xử lý', 
      value: pendingIssueCount.toString(),
      icon: AlertCircle,
      bgColor: 'bg-orange-600',
      link: '/admin/services',
      description: 'Chưa được phân công' // Dịch
    },
  ];
  
  // Dữ liệu Tỷ lệ Lấp đầy (Đã dịch tên)
  const occupancyData = [
    { name: 'Đang ở', value: apartmentStats.occupied, color: OCCUPANCY_COLORS[0] }, // Dịch
    { name: 'Trống', value: apartmentStats.total - apartmentStats.occupied, color: OCCUPANCY_COLORS[1] }, // Dịch
  ];
  
  // Custom Tooltip cho Revenue Chart (Đã dịch nhãn)
  const CustomRevenueTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg text-sm">
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
          {payload.map((p: any, index: number) => (
            <p key={index} style={{ color: p.color }} className="mb-1">
              {/* Dịch nhãn cột */}
              {p.name === 'phaiThu' && 'Phải Thu'}
              {p.name === 'thucThu' && 'Thực Thu (Đã Paid)'}
              {p.name === 'congNo' && 'Công Nợ'}
              {p.name !== 'phaiThu' && p.name !== 'thucThu' && p.name !== 'congNo' && p.name}: 
              <span className="font-bold">{formatCurrency(p.value)}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  

  return (
    // Thêm padding và background cho toàn bộ trang
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-50 min-h-screen"> 
      
      {/* --- HEADER KHU VỰC CHÍNH --- */}
      <div className="flex items-center justify-between border-b pb-4 border-gray-200">
        <div className="flex items-center">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">Bảng điều khiển quản lý tòa nhà</h1>
              <p className="text-gray-500 mt-1">Tổng quan về hoạt động và tài chính.</p>
            </div>
        </div>
      </div>

      {/* --- STATS GRID --- */}
      <div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" 
        style={{ marginTop: '48px' }} // Sử dụng giá trị tuyệt đối 3rem (48px)
    >        
        {stats.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
          
          const StatContent= (
            <div key={stat.label} className="bg-white rounded-xl p-6 border border-gray-200 shadow-md transition duration-300 ease-in-out hover:shadow-lg h-full flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className={`w-12 h-12 rounded-full ${stat.bgColor} flex items-center justify-center shadow-md`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                {stat.change && (
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${ 
                      stat.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      <TrendIcon className="w-4 h-4" />
                      <span className="text-xs font-medium">{stat.change}</span> 
                    </div>
                )}
              </div>
              <div className="mt-4">
                <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                <p className="text-3xl text-gray-900 mt-1 font-bold">{stat.value}</p> 
              </div>
            </div>
          );
          
          if (stat.link) {
            return ( 
              <Link key={stat.label} to={stat.link} className="no-underline block h-full"> 
                {StatContent}
              </Link>
            );
          }

          return StatContent
        })}
      </div>


      {/* 🔥 TOP CHARTS ROW: Occupancy (1 cột) & Service Requests (2 cột) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 col-span-1 lg:col-span-3"> 
              <h3 className="text-xl font-bold text-gray-900 mb-6">Phân tích yêu cầu dịch vụ</h3> 
              <ResponsiveContainer width="100%" height={360}>
                <BarChart data={serviceRequestsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="category" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #ccc',
                      borderRadius: '8px',
                      padding: '10px'
                    }} 
                    formatter={(value: number, name: string) => [`${value} yêu cầu`, 'Loại yêu cầu']} 
                  />
                  <Bar dataKey="count" fill="#2563eb" radius={[8, 8, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Occupancy Pie Chart (1/3 chiều rộng) */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 col-span-1">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Tỷ lệ căn hộ có người ở</h3> 
              
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={occupancyData.filter(d => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={70} 
                    outerRadius={100} // Kích thước vòng tròn
                    paddingAngle={2}
                    dataKey="value"
                    
                    // 🔥 SỬA: Điều chỉnh label để tránh tràn
                    labelLine={false}
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                        // Tính toán tọa độ X, Y mới để đặt label bên ngoài
                        const RADIAN = Math.PI / 180;
                        const radius = outerRadius * 1.2; // Tăng bán kính 20% để đẩy label ra ngoài
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                        
                        return (
                            <text 
                                x={x} 
                                y={y} 
                                fill="#374151" // Màu chữ xám đậm
                                textAnchor={x > cx ? 'start' : 'end'} // Căn lề trái/phải tùy thuộc vào vị trí
                                dominantBaseline="central"
                                style={{ 
                                    fontSize: '14px', 
                                    fontWeight: 'bold' 
                                }}
                            >
                                {`${(percent * 100).toFixed(1)}%`}
                            </text>
                        );
                    }}
                  >
                    {occupancyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number, name: string) => [`${value} căn hộ`, name]} /> 
                </PieChart>
              </ResponsiveContainer>
              
              <div 
                  className="flex justify-around mt-4 pt-4 border-t border-gray-100" 
                  style={{ display: 'flex', justifyContent: 'space-around', width: '100%', marginTop: '1rem', paddingTop: '1rem', borderTopWidth: '1px', borderColor: '#f3f4f6' }}
              >
                {occupancyData.map((item) => (
                  <div key={item.name} className="flex flex-col items-center gap-1">
                    <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }} />
                        <span className="text-sm font-medium text-gray-700">{item.name}</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Service Requests Chart (2/3 chiều rộng) */}
            
      </div>
      
      {/* 🔥 BOTTOM CHART ROW: Revenue Chart (Full Width) */}
      <div className="grid grid-cols-1">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 col-span-full">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Phân tích dòng tiền (6 tháng gần nhất)</h3> 
              <div style={{ width: '100%', height: 380 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 10, bottom: 5 }} 
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} /> 
                    
                    <XAxis dataKey="month" stroke="#6b7280" />
                    
                    <YAxis 
                        stroke="#6b7280" 
                        orientation="right" 
                        // Tinh gọn hiển thị tiền tệ (ví dụ: 10M, 500K)
                        tickFormatter={(value: number) => value >= 1000000 ? (value / 1000000).toFixed(0) + 'M' : value.toString()}
                    />
                    
                    <Tooltip 
                        content={<CustomRevenueTooltip />}
                    />
                    
                    <Legend wrapperStyle={{ paddingTop: 10 }} iconType="circle" />

                    <Bar dataKey="phaiThu" name="Tổng phải thu" fill="#8884d8" barSize={30} radius={[4, 4, 0, 0]} />
                    
                    <Bar dataKey="thucThu" name="Tổng thực thu" fill="#4CAF50" barSize={30} radius={[4, 4, 0, 0]} />

                    <Bar dataKey="congNo" name="Tổng công nợ phát sinh" fill="#FF9800" barSize={30} radius={[4, 4, 0, 0]} />

                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
      </div>
    </div>
  );
}
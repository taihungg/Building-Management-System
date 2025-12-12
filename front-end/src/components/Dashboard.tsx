import { useState, useEffect } from 'react'; 
import { Users, Building2, DollarSign, AlertCircle, TrendingUp, TrendingDown, LayoutDashboard } from 'lucide-react';
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
}
// -----------------------------------------------------------


export function Dashboard() {
  // --- STATE ĐỂ LƯU DỮ LIỆU TỪ API ---
  const [residentCount, setResidentCount] = useState(0);
  const [apartmentStats, setApartmentStats] = useState({ occupied: 0, total: 0 });
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
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
      // Mapping IssueType ENUM sang Category Label
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
    const monthlyMap = new Map<number, { month: string, phaiThu: number, thucThu: number, congNo: number }>();

    // Khởi tạo 12 tháng (optional but good practice for full yearly chart)
    for (let i = 1; i <= 12; i++) {
        monthlyMap.set(i, {
            month: `Thg ${i}`,
            phaiThu: 0,
            thucThu: 0,
            congNo: 0,
        });
    }

    bills.forEach(bill => {
      const dateSource = bill.paymentDate || new Date().toISOString(); 
      const monthKey = new Date(dateSource).getMonth() + 1; 
      
      if (monthlyMap.has(monthKey)) {
          const amount = bill.totalAmount || 0;
          const entry = monthlyMap.get(monthKey)!;

          entry.phaiThu += amount;

          if (bill.status === 'PAID') {
            entry.thucThu += amount;
          } 
      }
    });
    
    // Lấy dữ liệu từ map, sắp xếp theo tháng và tính công nợ
    const chartData = Array.from(monthlyMap.values())
      .sort((a, b) => {
          return parseInt(a.month.split(' ')[1]) - parseInt(b.month.split(' ')[1]);
      })
      .map(entry => ({
          ...entry,
          congNo: entry.phaiThu - entry.thucThu
      }))
      // Lọc bỏ các tháng không có dữ liệu để chart gọn hơn
      .filter(entry => entry.phaiThu > 0); 

    return chartData;
  };
  
  // --- USE EFFECT FETCH DATA ---
  useEffect(() => {
    // Logic fetch data không thay đổi
    // ... (Giữ nguyên logic fetch API của bạn)
    const fetchDashboardData = async () => {
      try {
        const currentYear = new Date().getFullYear(); 

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

        const resInvoices =  await fetch (`http://localhost:8081/api/v1/accounting/invoices?year=${currentYear}`);
        const dataInvoices = await resInvoices.json();
        if (resInvoices.ok){
          const allRevenues = dataInvoices.data;
          
          const currentMonth = new Date().getMonth() + 1;
          const monthlyPaidInvoices = allRevenues.filter((e: any) => 
            e.status === 'PAID' && new Date(e.paymentDate).getMonth() + 1 === currentMonth
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
  
  // --- CẤU HÌNH STATS ---
  const occupancyRate = apartmentStats.total > 0 ? ((apartmentStats.occupied/apartmentStats.total)*100).toFixed(1) : 0;
  
  const stats = [
    { 
      label: 'Tổng số Cư Dân', 
      value: residentCount.toString(),
      trend: 'up', 
      icon: Users,
      bgColor: 'bg-blue-600', // Giữ màu
      link: '/residents',
      description: 'Hiện đang sinh sống'
    },
    { 
      label: 'Đơn Vị Đang ở', 
      value: `${apartmentStats.occupied}/${apartmentStats.total}`,
      change: `${occupancyRate}%`,
      trend: 'up', 
      icon: Building2,
      bgColor: 'bg-purple-600', // Giữ màu
      link: '/apartments',
      description: 'Tỷ lệ Lấp đầy'
    },
    { 
      label: `Doanh thu Thg ${new Date().getMonth() + 1}`, 
      value: formatCurrency(monthlyRevenue),
      change: '+8.2%', 
      trend: 'up', 
      icon: DollarSign,
      bgColor: 'bg-green-600', // Giữ màu
      link: '/bills',
      description: 'Tổng tiền đã thanh toán'
    },
    { 
      label: 'Yêu cầu chờ Xử lý', 
      value: pendingIssueCount.toString(),
      change: '15', // Dữ liệu cứng
      trend: 'down', 
      icon: AlertCircle,
      bgColor: 'bg-orange-600', // Giữ màu
      link: '/services',
      description: 'Chưa được phân công'
    },
  ];
  
  const occupancyData = [
    { name: 'Đã Lấp đầy', value: apartmentStats.occupied, color: OCCUPANCY_COLORS[0] },
    { name: 'Trống', value: apartmentStats.total - apartmentStats.occupied, color: OCCUPANCY_COLORS[1] },
  ];
  
  // Custom Tooltip cho Revenue Chart
  const CustomRevenueTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg text-sm">
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
          {payload.map((p: any, index: number) => (
            <p key={index} style={{ color: p.color }} className="mb-1">
              {p.name}: <span className="font-bold">{formatCurrency(p.value)}</span>
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
            <LayoutDashboard className="w-8 h-8 mr-3 text-gray-700" />
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">Dashboard</h1>
              <p className="text-gray-500 mt-1">Welcome back!</p>
            </div>
        </div>
        
      </div>

      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
          
          const StatContent= (
            // Thay đổi UI/UX cho thẻ: rounded-xl, shadow-md, hover effect, padding gọn gàng hơn
            <div key={stat.label} className="bg-white rounded-xl p-6 border border-gray-200 shadow-md transition duration-300 ease-in-out hover:shadow-lg h-full flex flex-col justify-between">
              <div className="flex items-start justify-between">
                {/* Icon box tròn đẹp hơn */}
                <div className={`w-12 h-12 rounded-full ${stat.bgColor} flex items-center justify-center shadow-md`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                {stat.change && (
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${ // Dùng rounded-full
                      stat.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      <TrendIcon className="w-4 h-4" />
                      <span className="text-xs font-medium">{stat.change}</span> {/* Dùng text-xs */}
                    </div>
                )}
              </div>
              <div className="mt-4">
                <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                <p className="text-3xl text-gray-900 mt-1 font-bold">{stat.value}</p> {/* Tăng kích thước giá trị */}
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

      {/* --- CHARTS ROW --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* Revenue Chart */}
    <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 col-span-2">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Phân tích Doanh thu Hàng năm</h3>
          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 10, bottom: 5 }} 
              >
                {/* Tinh chỉnh Grid và Axis */}
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

                {/* Giữ nguyên màu Bar */}
                <Bar dataKey="phaiThu" name="Phải Thu (Tổng)" fill="#8884d8" barSize={30} radius={[4, 4, 0, 0]} />
                
                <Bar dataKey="thucThu" name="Thực Thu (Đã Paid)" fill="#4CAF50" barSize={30} radius={[4, 4, 0, 0]} />

                <Bar dataKey="congNo" name="Công Nợ (Pending + Unpaid)" fill="#FF9800" barSize={30} radius={[4, 4, 0, 0]} />

              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Occupancy Pie Chart */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Tỷ lệ Lấp đầy Căn hộ</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={occupancyData.filter(d => d.value > 0)}
                cx="50%"
                cy="50%"
                innerRadius={70} // Tăng kích thước Donut
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                // Thêm label phần trăm trực tiếp lên biểu đồ
                label={({ name, percent }) => `${(percent * 100).toFixed(1)}%`}
                labelLine={false} 
              >
                {occupancyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number, name: string) => [value, name]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-8 mt-4 pt-4 border-t border-gray-100">
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
      </div>

      {/* Bottom Row: Service Requests */}
      <div className="flex justify-center w-full"> 
        
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 w-full max-w-4xl"> {/* Tăng max-width để trông cân đối hơn */}
          <h3 className="text-xl font-bold text-gray-900 mb-6">Phân tích Yêu cầu Dịch vụ (Tổng)</h3>
          <ResponsiveContainer width="100%" height={280}>
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
                formatter={(value: number, name: string) => [`${value} yêu cầu`, name]}
              />
              {/* Giữ nguyên màu Bar */}
              <Bar dataKey="count" fill="#2563eb" radius={[8, 8, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>

       
      </div>
    </div>
  );
}
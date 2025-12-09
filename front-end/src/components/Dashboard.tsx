import { useState, useEffect } from 'react'; 
import { Users, Building2, DollarSign, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MenuButton } from './MenuButton';
import React from 'react';
import { Link } from 'react-router-dom'; // Đảm bảo đã import Link


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
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [chartData, setChartData] = useState([]);
  // STATE MỚI CHO ISSUES
  const [pendingIssueCount, setPendingIssueCount] = useState(0); 

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
          // Giả định: residentNumber > 0 là căn hộ đã có người ở
          const occupied = allApartments.filter(apt => apt.residentNumber > 0).length;
          
          setApartmentStats({ total, occupied });
        }

        // 3. Lấy dữ liệu Hóa đơn & Doanh thu
        const resInvoices =  await fetch ('http://localhost:8081/api/v1/accounting?year=2025&month=10')
        const dataInvoices = await resInvoices.json();
        if (resInvoices.ok){
          const allRevenues = dataInvoices.data;
          const monthlyPaidInvoices = allRevenues.filter(e => e.status === 'PAID');
          const currentMonthlyRevenue = monthlyPaidInvoices.reduce ((total, invoice)=>{
              const amount = invoice.totalAmount || 0;
              return total+amount;
          },0);
          
          setMonthlyRevenue(currentMonthlyRevenue);
          setChartData(calculateMonthlyChartData(allRevenues));
        }
        
        // 🌟 4. Lấy dữ liệu Issues (Sự cố/Yêu cầu dịch vụ) 🌟
        const resIssues =  await fetch ('http://localhost:8081/api/issues');
        const dataIssue = await resIssues.json();
        if (resIssues.ok){
          const allIssues = dataIssue; // API GET /api/issues trả về List<IssueResponseDTO> trực tiếp
          // Lọc các sự cố có trạng thái UNPROCESSED (đang chờ xử lý)
          const pendingIssues = allIssues.filter(issue => issue.status === 'UNPROCESSED');
          
          setPendingIssueCount(pendingIssues.length);
          
          // NOTE: Không cần tính lại MonthlyRevenue và ChartData từ Issues ở đây.
          // serviceRequests (bar chart) có thể được tính từ allIssues nếu cần.
        }
        
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu Dashboard:", error);
        // Có thể thêm toast.error ở đây để báo lỗi cho người dùng
      }
    };


    fetchDashboardData();
  }, []);
  
  const formatCurrency = (amount) => {
    // Sử dụng locale 'vi-VN' và currency 'VND'
    return new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND',
        maximumFractionDigits: 0 // Loại bỏ phần thập phân
    }).format(amount);
  };
  
  // --- CẤU HÌNH STATS (Đã chuyển vào trong để dùng State) ---
  const stats = [
    { 
      label: 'Total Residents', 
      value: residentCount.toString(), // Dữ liệu từ API
      trend: 'up', 
      icon: Users,
      bgColor: 'bg-blue-600',
      link: '/residents'
    },
    { 
      label: 'Occupied Units', 
      value: `${apartmentStats.occupied}/${apartmentStats.total}`, // Dữ liệu từ API
      change: `${apartmentStats.total > 0 ? ((apartmentStats.occupied/apartmentStats.total)*100).toFixed(1) : 0}%`, // Tự tính %
      trend: 'up', 
      icon: Building2,
      bgColor: 'bg-purple-600',
      link: '/apartments'
    },
    { 
      label: 'Monthly Revenue', 
      value: formatCurrency(monthlyRevenue),
      change: '+8.2%', // Dữ liệu cứng (nên lấy từ API)
      trend: 'up', 
      icon: DollarSign,
      bgColor: 'bg-green-600',
      link: '/bills'
    },
    { 
      label: 'Pending Issues', 
      value: pendingIssueCount.toString(), // Dữ liệu từ API
      change: '-5', // Dữ liệu cứng (nên lấy từ API)
      trend: 'down', 
      icon: AlertCircle,
      bgColor: 'bg-orange-600',
      link: '/services' // 🌟 LINK MỚI ĐẾN TRANG SERVICE MANAGEMENT 🌟
    },
  ];
  
  const occupancyData = [
    { name: 'Occupied', value: apartmentStats.occupied, color: '#2563eb' },
    { name: 'Vacant', value: apartmentStats.total-apartmentStats.occupied, color: '#e5e7eb' },
  ];
  
  // Giả định: bills là mảng hóa đơn của 1 năm
  const calculateMonthlyChartData = (bills) => {
    const monthlyMap = new Map();

    bills.forEach(bill => {
      // Giả định bill.paymentDate tồn tại và là ngày hợp lệ.
      // Nếu API không trả về paymentDate mà trả về billMonth, cần điều chỉnh.
      const monthKey = new Date(bill.paymentDate || new Date()).getMonth() + 1; 
      const monthName = `Thg ${monthKey}`;
      const amount = bill.totalAmount || 0;

      const entry = monthlyMap.get(monthKey) || {
        month: monthName,
        phaiThu: 0,
        thucThu: 0,
        congNo: 0,
      };

      // Giả định bill.totalAmount là số tiền phải thu
      entry.phaiThu += amount;

      if (bill.status === 'PAID') {
        entry.thucThu += amount;
      } 
      monthlyMap.set(monthKey, entry);
    });
    
    // Chuyển Map thành mảng, sắp xếp theo tháng và tính Công Nợ
    const chartData = Array.from(monthlyMap.values())
      .sort((a, b) => {
          return parseInt(a.month.split(' ')[1]) - parseInt(b.month.split(' ')[1]);
      })
      .map(entry => ({
          ...entry,
          congNo: entry.phaiThu - entry.thucThu
      }));

    return chartData;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Current Period</p>
          <p className="text-base text-gray-900">December 2025</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
          
          const StatContent= (
            <div key={stat.label} className="bg-white rounded-xl p-6 border-2 border-gray-200 h-full">
              <div className="flex items-start justify-between">
                <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                {/* Trend chỉ hiển thị khi có change */}
                {stat.change && (
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-lg ${
                      stat.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      <TrendIcon className="w-4 h-4" />
                      <span className="text-sm">{stat.change}</span>
                    </div>
                )}
              </div>
              <div className="mt-4">
                <p className="text-gray-500 text-sm">{stat.label}</p>
                <p className="text-2xl text-gray-900 mt-1">{stat.value}</p>
              </div>
            </div>
          );
          
          // Sử dụng Link nếu có đường dẫn
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

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-6">
    {/* Revenue Chart */}
    <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 col-span-2">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Phân tích Doanh thu Hàng tháng</h3>
          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 40, left: 10, bottom: 5 }} 
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                
                <XAxis dataKey="month" stroke="#6b7280" />
                
                <YAxis 
                    stroke="#6b7280" 
                    orientation="right" 
                    tickFormatter={(value) => formatCurrency(value).replace('₫', '')} 
                />
                
                <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    labelFormatter={(label) => `Tháng: ${label}`}
                    contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #ccc', 
                        borderRadius: '8px',
                        padding: '10px'
                    }}
                />
                
                <Legend wrapperStyle={{ paddingTop: 20 }} />

                <Bar dataKey="phaiThu" name="Phải Thu (Tổng)" fill="#8884d8" barSize={30} />
                
                <Bar dataKey="thucThu" name="Thực Thu (Đã Paid)" fill="#4CAF50" barSize={30} />

                <Bar dataKey="congNo" name="Công Nợ (Pending + Unpaid)" fill="#FF9800" barSize={30} />

              </BarChart>
            </ResponsiveContainer>
          </div>
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

      {/* Bottom Row */}
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
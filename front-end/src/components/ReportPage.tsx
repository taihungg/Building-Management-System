import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Download, Calendar, TrendingUp, TrendingDown } from "lucide-react";

const monthlyRevenue = [
  { month: "Tháng 1", revenue: 220, target: 200 },
  { month: "Tháng 2", revenue: 240, target: 220 },
  { month: "Tháng 3", revenue: 210, target: 220 },
  { month: "Tháng 4", revenue: 260, target: 240 },
  { month: "Tháng 5", revenue: 230, target: 240 },
  { month: "Tháng 6", revenue: 250, target: 250 },
];

const paymentRate = [
  { name: "Thanh toán đúng hạn", value: 72, color: "#10b981" },
  { name: "Thanh toán trễ", value: 20, color: "#f59e0b" },
  { name: "Chưa thanh toán", value: 8, color: "#ef4444" },
];

const serviceRevenue = [
  { service: "Phí quản lý", amount: 120 },
  { service: "Phí dịch vụ", amount: 80 },
  { service: "Phí gửi xe", amount: 45 },
  { service: "Điện", amount: 65 },
  { service: "Nước", amount: 40 },
];

const occupancyTrend = [
  { quarter: "Q1/2024", rate: 85 },
  { quarter: "Q2/2024", rate: 88 },
  { quarter: "Q3/2024", rate: 92 },
  { quarter: "Q4/2024", rate: 95 },
];

export function ReportPage() {
  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle>Báo cáo thống kê</CardTitle>
            <div className="flex gap-2">
              <Select defaultValue="2024">
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">Năm 2024</SelectItem>
                  <SelectItem value="2023">Năm 2023</SelectItem>
                  <SelectItem value="2022">Năm 2022</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Chọn khoảng thời gian
              </Button>
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Xuất báo cáo
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Doanh thu tháng</CardTitle>
          </CardHeader>
          <CardContent>
            <div>250 triệu VNĐ</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-green-600">+8% so với tháng trước</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Tỷ lệ thu hồi</CardTitle>
          </CardHeader>
          <CardContent>
            <div>92%</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-green-600">+5% so với tháng trước</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Tỷ lệ lấp đầy</CardTitle>
          </CardHeader>
          <CardContent>
            <div>95%</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-green-600">+3% so với quý trước</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Chi phí vận hành</CardTitle>
          </CardHeader>
          <CardContent>
            <div>180 triệu VNĐ</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <span className="text-red-600">-5% so với tháng trước</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Monthly Revenue */}
        <Card>
          <CardHeader>
            <CardTitle>Doanh thu theo tháng (Triệu VNĐ)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#3b82f6" name="Thực tế" />
                <Bar dataKey="target" fill="#94a3b8" name="Mục tiêu" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Rate */}
        <Card>
          <CardHeader>
            <CardTitle>Tỷ lệ thanh toán</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentRate}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentRate.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Service Revenue */}
        <Card>
          <CardHeader>
            <CardTitle>Doanh thu theo dịch vụ (Triệu VNĐ)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={serviceRevenue} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="service" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="amount" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Occupancy Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Xu hướng tỷ lệ lấp đầy (%)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={occupancyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quarter" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="rate" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  name="Tỷ lệ lấp đầy"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Chi tiết doanh thu theo tháng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Tháng</th>
                  <th className="text-right p-3">Phí quản lý</th>
                  <th className="text-right p-3">Phí dịch vụ</th>
                  <th className="text-right p-3">Gửi xe</th>
                  <th className="text-right p-3">Khác</th>
                  <th className="text-right p-3">Tổng cộng</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { month: "Tháng 6", management: 120, service: 80, parking: 45, other: 15, total: 260 },
                  { month: "Tháng 5", management: 115, service: 75, parking: 42, other: 14, total: 246 },
                  { month: "Tháng 4", management: 118, service: 78, parking: 44, other: 16, total: 256 },
                  { month: "Tháng 3", management: 112, service: 72, parking: 40, other: 12, total: 236 },
                  { month: "Tháng 2", management: 120, service: 80, parking: 45, other: 15, total: 260 },
                  { month: "Tháng 1", management: 115, service: 76, parking: 43, other: 13, total: 247 },
                ].map((row, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-3">{row.month}</td>
                    <td className="text-right p-3">{row.management} tr</td>
                    <td className="text-right p-3">{row.service} tr</td>
                    <td className="text-right p-3">{row.parking} tr</td>
                    <td className="text-right p-3">{row.other} tr</td>
                    <td className="text-right p-3">{row.total} tr</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Users,
  Building2,
  DollarSign,
  AlertCircle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import React from "react";
const statsCards = [
  {
    title: "Tổng cư dân",
    value: "1,234",
    change: "+12%",
    trend: "up",
    icon: Users,
    color: "text-blue-600",
  },
  {
    title: "Tổng căn hộ",
    value: "456",
    change: "+5",
    trend: "up",
    icon: Building2,
    color: "text-green-600",
  },
  {
    title: "Doanh thu tháng",
    value: "2.5 tỷ",
    change: "+8%",
    trend: "up",
    icon: DollarSign,
    color: "text-yellow-600",
  },
  {
    title: "Công nợ chưa thu",
    value: "450 triệu",
    change: "-15%",
    trend: "down",
    icon: AlertCircle,
    color: "text-red-600",
  },
];

const revenueData = [
  { month: "T1", revenue: 2200, expense: 1800 },
  { month: "T2", revenue: 2400, expense: 1900 },
  { month: "T3", revenue: 2100, expense: 1700 },
  { month: "T4", revenue: 2600, expense: 2000 },
  { month: "T5", revenue: 2300, expense: 1850 },
  { month: "T6", revenue: 2500, expense: 1950 },
];

const debtData = [
  { name: "Đã thanh toán", value: 85, color: "#10b981" },
  { name: "Chưa thanh toán", value: 12, color: "#f59e0b" },
  { name: "Quá hạn", value: 3, color: "#ef4444" },
];

const serviceUsageData = [
  { service: "Điện", value: 450 },
  { service: "Nước", value: 320 },
  { service: "Dịch vụ", value: 280 },
  { service: "Gửi xe", value: 380 },
  { service: "Bảo trì", value: 220 },
];

export function DashboardOverview() {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span>{stat.value}</span>
                </div>
                <div className="flex items-center gap-1">
                  {stat.trend === "up" ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span
                    className={
                      stat.trend === "up" ? "text-green-600" : "text-red-600"
                    }
                  >
                    {stat.change}
                  </span>
                  <span className="text-muted-foreground">
                    so với tháng trước
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Doanh thu & Chi phí (Triệu VNĐ)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  name="Doanh thu"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="expense"
                  stroke="#ef4444"
                  name="Chi phí"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Debt Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Tình trạng công nợ</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={debtData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {debtData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Service Usage Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Sử dụng dịch vụ (Triệu VNĐ)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={serviceUsageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="service" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Hoạt động gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                time: "2 phút trước",
                action: "Cư dân A101 đã thanh toán phí dịch vụ tháng 10",
                type: "payment",
              },
              {
                time: "15 phút trước",
                action: "Thêm cư dân mới tại căn hộ B205",
                type: "resident",
              },
              {
                time: "1 giờ trước",
                action: "Gửi thông báo bảo trì thang máy đến tất cả cư dân",
                type: "notification",
              },
              {
                time: "2 giờ trước",
                action: "Cập nhật giá dịch vụ gửi xe",
                type: "update",
              },
              {
                time: "3 giờ trước",
                action: "Cư dân C308 yêu cầu hỗ trợ kỹ thuật",
                type: "support",
              },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0"
              >
                <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                <div className="flex-1">
                  <p>{activity.action}</p>
                  <p className="text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

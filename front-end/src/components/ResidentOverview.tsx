import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Building2, Users, DollarSign, Bell, Calendar, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { useState, useEffect } from "react";

interface PaymentHistoryItem {
  id: number;
  service: string;
  amount: number;
  date: string;
  method: string;
  status: "completed" | "pending" | "failed";
  invoice: string;
}

interface ResidentOverviewProps {
  onNavigate?: (tab: string) => void;
  notifications?: Array<{ id: number; read: boolean }>;
  paymentData?: { paid: number; total: number };
  recentActivities?: Array<{ time: string; action: string; type: string; amount?: string }>;
  paymentHistory?: PaymentHistoryItem[];
}

const getResidentStats = (unreadCount: number, paidServices?: number, totalServices?: number, paymentHistory?: PaymentHistoryItem[]) => {
  // Tính tổng tiền các dịch vụ chưa thanh toán
  const unpaidAmount = paymentHistory 
    ? paymentHistory
        .filter(item => item.status === "pending")
        .reduce((sum, item) => sum + item.amount, 0)
    : 0;

  // Tính số dịch vụ đã thanh toán và tổng số dịch vụ từ paymentHistory
  const actualPaidServices = paymentHistory 
    ? paymentHistory.filter(item => item.status === "completed").length
    : (paidServices || 0);
  
  const actualTotalServices = paymentHistory 
    ? paymentHistory.length
    : (totalServices || 4);

  return [
    { 
      title: "Phí dịch vụ tháng này", 
      value: unpaidAmount > 0 ? `${unpaidAmount.toLocaleString('vi-VN')} VNĐ` : "0 VNĐ", 
      status: "pending",
      icon: DollarSign,
      color: "text-yellow-600"
    },
  { 
    title: "Thông báo chưa đọc", 
    value: unreadCount.toString(), 
    status: "new",
    icon: Bell,
    color: "text-blue-600"
  },
  { 
    title: "Dịch vụ đã thanh toán", 
    value: `${actualPaidServices}/${actualTotalServices}`, 
    status: actualPaidServices === actualTotalServices ? "completed" : "partial",
    icon: CheckCircle2,
    color: actualPaidServices === actualTotalServices ? "text-green-600" : "text-green-600"
  },
  { 
    title: "Ngày hết hạn", 
    value: "31/10/2025", 
    status: "warning",
    icon: Calendar,
    color: "text-red-600"
  },
  ];
};

const recentActivities = [
  { 
    time: "2 giờ trước", 
    action: "Nhận thông báo bảo trì thang máy tòa A", 
    type: "notification"
  },
  { 
    time: "1 ngày trước", 
    action: "Nhận nhắc nhở thanh toán phí quản lý tháng 10", 
    type: "notification"
  },
  { 
    time: "3 ngày trước", 
    action: "Đã thanh toán phí gửi xe - 150,000 VNĐ", 
    type: "payment",
    amount: "150,000 VNĐ"
  },
  { 
    time: "1 tuần trước", 
    action: "Đã thanh toán phí quản lý - 2,500,000 VNĐ", 
    type: "payment",
    amount: "2,500,000 VNĐ"
  },
];

const upcomingEvents = [
  {
    title: "Họp cư dân định kỳ",
    date: "30/10/2025",
    time: "19:00",
    location: "Hội trường tầng 1",
    type: "meeting"
  },
  {
    title: "Bảo trì thang máy tòa A",
    date: "28/10/2025",
    time: "08:00 - 12:00",
    location: "Tòa A",
    type: "maintenance"
  },
  {
    title: "Hạn thanh toán phí quản lý",
    date: "31/10/2025",
    time: "23:59",
    location: "Online",
    type: "payment"
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "new": return "bg-blue-100 text-blue-800 border-blue-200";
    case "partial": return "bg-green-100 text-green-800 border-green-200";
    case "warning": return "bg-red-100 text-red-800 border-red-200";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "pending": return "Chờ thanh toán";
    case "new": return "Mới";
    case "partial": return "Một phần";
    case "warning": return "Cảnh báo";
    default: return "Khác";
  }
};

const getActivityIcon = (type: string) => {
  switch (type) {
    case "payment": return DollarSign;
    case "notification": return Bell;
    case "meeting": return Users;
    default: return Clock;
  }
};

const getEventIcon = (type: string) => {
  switch (type) {
    case "meeting": return Users;
    case "maintenance": return Building2;
    case "payment": return DollarSign;
    default: return Calendar;
  }
};

// Function to calculate relative time
const getRelativeTime = (timestamp?: number) => {
  if (!timestamp) return "";
  
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  
  if (years > 0) return `${years} ${years === 1 ? 'năm' : 'năm'} trước`;
  if (months > 0) return `${months} ${months === 1 ? 'tháng' : 'tháng'} trước`;
  if (weeks > 0) return `${weeks} ${weeks === 1 ? 'tuần' : 'tuần'} trước`;
  if (days > 0) return `${days} ${days === 1 ? 'ngày' : 'ngày'} trước`;
  if (hours > 0) return `${hours} ${hours === 1 ? 'giờ' : 'giờ'} trước`;
  if (minutes > 0) return `${minutes} ${minutes === 1 ? 'phút' : 'phút'} trước`;
  return "Vừa xong";
};

export function ResidentOverview({ onNavigate, notifications, paymentData, recentActivities: propActivities, paymentHistory }: ResidentOverviewProps) {
  const activities = propActivities || recentActivities;
  const unreadCount = notifications ? notifications.filter(n => !n.read).length : 0;
  const [currentTime, setCurrentTime] = useState(Date.now());
  
  // Update current time every 10 seconds to trigger re-render
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
      console.log("Updating time:", new Date().toLocaleTimeString());
    }, 10000); // Update every 10 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  const residentStats = getResidentStats(
    unreadCount, 
    paymentData?.paid, 
    paymentData?.total,
    paymentHistory
  );
  
  // Lấy ngày hiện tại tự động
  const today = new Date().toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Chào mừng trở lại!</h1>
              <p className="text-muted-foreground mt-1">
                Nguyễn Văn A - Căn hộ A101, Tòa A
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Hôm nay</p>
              <p className="text-lg font-semibold">{today}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {residentStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{stat.value}</span>
                </div>
                <Badge className={getStatusColor(stat.status)}>
                  {getStatusLabel(stat.status)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map((activity, index) => {
                const ActivityIcon = getActivityIcon(activity.type);
                // Use dynamic time if timestamp exists, otherwise use static time
                // The currentTime dependency ensures re-render every minute
                const displayTime = (activity as any).timestamp && (activity as any).timestamp > 0
                  ? getRelativeTime((activity as any).timestamp)
                  : activity.time;
                
                return (
                  <div key={index} className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{activity.action}</p>
                        {activity.amount && (
                          <span className="text-sm font-semibold text-green-600">
                            {activity.amount}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <ActivityIcon className="h-4 w-4 text-muted-foreground" />
                        <p className="text-muted-foreground">{displayTime}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle>Sự kiện sắp tới</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEvents.map((event, index) => {
                const EventIcon = getEventIcon(event.type);
                return (
                  <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="p-2 rounded-full bg-blue-100">
                        <EventIcon className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{event.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">{event.date}</p>
                        <span className="text-muted-foreground">•</span>
                        <p className="text-sm text-muted-foreground">{event.time}</p>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{event.location}</p>
                    </div>
                    <Badge className={getStatusColor(event.type === "payment" ? "warning" : "pending")}>
                      {event.type === "meeting" ? "Họp mặt" : 
                       event.type === "maintenance" ? "Bảo trì" : "Thanh toán"}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Thao tác nhanh</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Button 
              className="h-20 flex flex-col gap-2" 
              variant="outline"
              onClick={() => onNavigate?.("payment")}
            >
              <DollarSign className="h-6 w-6" />
              <span>Thanh toán dịch vụ</span>
            </Button>
            <Button 
              className="h-20 flex flex-col gap-2" 
              variant="outline"
              onClick={() => onNavigate?.("notifications")}
            >
              <Bell className="h-6 w-6" />
              <span>Xem thông báo</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

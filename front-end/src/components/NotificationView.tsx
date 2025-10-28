import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Bell, Search, Clock, AlertCircle, CheckCircle2, Info, X } from "lucide-react";

const notifications = [
  {
    id: 1,
    title: "Bảo trì thang máy tòa A",
    content: "Thang máy tòa A sẽ được bảo trì từ 8:00 - 12:00 ngày 28/10/2025. Quý cư dân vui lòng sử dụng thang máy tòa B trong thời gian này.",
    date: "26/10/2025",
    time: "14:30",
    type: "maintenance",
    priority: "high",
    read: false,
  },
  {
    id: 2,
    title: "Nhắc nhở thanh toán phí quản lý tháng 10",
    content: "Phí quản lý tháng 10/2025 của căn hộ A101 là 2,500,000 VNĐ. Hạn thanh toán: 31/10/2025.",
    date: "25/10/2025",
    time: "09:00",
    type: "payment",
    priority: "medium",
    read: false,
  },
  {
    id: 3,
    title: "Họp cư dân định kỳ",
    content: "Cuộc họp cư dân định kỳ sẽ được tổ chức vào 19:00 ngày 30/10/2025 tại hội trường tầng 1. Mời tất cả cư dân tham gia.",
    date: "24/10/2025",
    time: "16:45",
    type: "meeting",
    priority: "medium",
    read: true,
  },
  {
    id: 4,
    title: "Thông báo cúp nước",
    content: "Do bảo trì đường ống nước, sẽ cúp nước từ 22:00 ngày 27/10 đến 06:00 ngày 28/10. Cư dân vui lòng chuẩn bị nước dự trữ.",
    date: "23/10/2025",
    time: "11:20",
    type: "urgent",
    priority: "high",
    read: true,
  },
  {
    id: 5,
    title: "Thông báo điều chỉnh giá dịch vụ gửi xe",
    content: "Từ ngày 01/11/2025, giá dịch vụ gửi xe sẽ được điều chỉnh: Xe máy: 150,000 VNĐ/tháng, Ô tô: 800,000 VNĐ/tháng.",
    date: "22/10/2025",
    time: "15:30",
    type: "general",
    priority: "low",
    read: true,
  },
];

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high": return "bg-red-100 text-red-800 border-red-200";
    case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "low": return "bg-blue-100 text-blue-800 border-blue-200";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case "urgent": return AlertCircle;
    case "maintenance": return Clock;
    case "payment": return CheckCircle2;
    case "meeting": return Info;
    default: return Bell;
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case "urgent": return "Khẩn cấp";
    case "maintenance": return "Bảo trì";
    case "payment": return "Thanh toán";
    case "meeting": return "Họp mặt";
    case "general": return "Thông báo chung";
    default: return "Khác";
  }
};

interface NotificationViewProps {
  notifications?: typeof notifications;
  setNotifications?: React.Dispatch<React.SetStateAction<typeof notifications>>;
}

export function NotificationView({ notifications: propNotifications, setNotifications: setPropNotifications }: NotificationViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [notificationsList, setNotificationsList] = useState(propNotifications || notifications);
  const [selectedNotification, setSelectedNotification] = useState<typeof notifications[0] | null>(null);

  // Sync với props khi propNotifications thay đổi
  useEffect(() => {
    if (propNotifications) {
      setNotificationsList(propNotifications);
    }
  }, [propNotifications]);

  const filteredNotifications = notificationsList.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "all" || notification.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const unreadCount = notificationsList.filter(n => !n.read).length;

  const markAsRead = (id: number) => {
    // Cập nhật local state
    const updated = notificationsList.map(notification => 
      notification.id === id 
        ? { ...notification, read: true }
        : notification
    );
    setNotificationsList(updated);
    
    // Cập nhật parent state để đồng bộ với các component khác
    if (setPropNotifications) {
      setPropNotifications(updated);
    }
  };

  const markAllAsRead = () => {
    // Cập nhật local state
    const updated = notificationsList.map(notification => ({ ...notification, read: true }));
    setNotificationsList(updated);
    
    // Cập nhật parent state để đồng bộ với các component khác
    if (setPropNotifications) {
      setPropNotifications(updated);
    }
  };

  const markAllAsUnread = () => {
    const updated = notificationsList.map(notification => ({ ...notification, read: false }));
    setNotificationsList(updated);
    if (setPropNotifications) {
      setPropNotifications(updated);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Bell className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{notificationsList.length}</p>
                <p className="text-muted-foreground">Tổng thông báo</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{unreadCount}</p>
                <p className="text-muted-foreground">Chưa đọc</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{notificationsList.filter(n => n.type === "urgent").length}</p>
                <p className="text-muted-foreground">Khẩn cấp</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
                  <CardTitle>Tìm kiếm thông báo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Tìm kiếm thông báo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-4 pl-16"
                  style={{ paddingLeft: "3.5rem" }}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={markAllAsRead}>
                Đánh dấu tất cả đã đọc
              </Button>
              <Button variant="outline" onClick={markAllAsUnread}>
                Đặt tất cả chưa đọc
              </Button>
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filterType === "all" ? "default" : "outline"}
              onClick={() => setFilterType("all")}
            >
              Tất cả
            </Button>
            <Button
              variant={filterType === "urgent" ? "default" : "outline"}
              onClick={() => setFilterType("urgent")}
            >
              Khẩn cấp
            </Button>
            <Button
              variant={filterType === "maintenance" ? "default" : "outline"}
              onClick={() => setFilterType("maintenance")}
            >
              Bảo trì
            </Button>
            <Button
              variant={filterType === "payment" ? "default" : "outline"}
              onClick={() => setFilterType("payment")}
            >
              Thanh toán
            </Button>
            <Button
              variant={filterType === "meeting" ? "default" : "outline"}
              onClick={() => setFilterType("meeting")}
            >
              Họp mặt
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.map((notification) => {
          const TypeIcon = getTypeIcon(notification.type);
          return (
            <Card 
              key={notification.id} 
              className={`${!notification.read ? 'border-l-4 border-l-blue-500 bg-blue-50/50' : ''} cursor-pointer hover:shadow-md transition-shadow`}
              onClick={() => {
                setSelectedNotification(notification);
                if (!notification.read) {
                  markAsRead(notification.id);
                }
              }}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className={`p-2 rounded-full ${notification.read ? 'bg-gray-100' : 'bg-blue-100'}`}>
                      <TypeIcon className={`h-5 w-5 ${notification.read ? 'text-gray-600' : 'text-blue-600'}`} />
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className={`font-semibold ${!notification.read ? 'text-blue-900' : 'text-gray-900'}`}>
                          {notification.title}
                        </h3>
                        <p className="text-muted-foreground mt-1 line-clamp-2">
                          {notification.content}
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2 ml-4">
                        <div className="flex gap-2">
                          <Badge className={getPriorityColor(notification.priority)}>
                            {getTypeLabel(notification.type)}
                          </Badge>
                          {!notification.read && (
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                              Mới
                            </Badge>
                          )}
                        </div>
                        
                        <div className="text-sm text-muted-foreground text-right">
                          <p>{notification.date}</p>
                          <p>{notification.time}</p>
                        </div>
                      </div>
                    </div>
                    
                    {!notification.read && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markAsRead(notification.id)}
                        className="mt-2"
                      >
                        Đánh dấu đã đọc
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {filteredNotifications.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Không tìm thấy thông báo</h3>
              <p className="text-muted-foreground">
                Không có thông báo nào phù hợp với tiêu chí tìm kiếm của bạn.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Notification Detail Dialog */}
      <Dialog open={!!selectedNotification} onOpenChange={() => setSelectedNotification(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết thông báo</DialogTitle>
          </DialogHeader>
          {selectedNotification && (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-3 rounded-full bg-blue-100">
                  {(() => {
                    const TypeIcon = getTypeIcon(selectedNotification.type);
                    return <TypeIcon className="h-6 w-6 text-blue-600" />;
                  })()}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-2">{selectedNotification.title}</h2>
                  <div className="flex gap-2 mb-3">
                    <Badge className={getPriorityColor(selectedNotification.priority)}>
                      {getTypeLabel(selectedNotification.type)}
                    </Badge>
                    {!selectedNotification.read && (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        Mới
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <p className="whitespace-pre-wrap">{selectedNotification.content}</p>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{selectedNotification.date} - {selectedNotification.time}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

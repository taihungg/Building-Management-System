import React, { useState, useEffect } from "react";
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "./ui/sidebar";
import { LayoutDashboard, Bell, CreditCard, Building2, User, LogOut, FileText } from "lucide-react";
import { ResidentOverview } from "./ResidentOverview";
import { NotificationView } from "./NotificationView";
import { PaymentService } from "./PaymentService";
import { InformationView } from "./InformationView";
import { Button } from "./ui/button";

interface ResidentDashboardProps {
  selectedResident?: string;
  onLogout?: () => void;
}

const initialNotifications = [
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
    title: "Nhắc nhở thanh toán dịch vụ tháng 10",
    content: "Tiền điện và Tiền nước tháng 10/2025 của căn hộ A101. Tiền điện: 850,000 VNĐ, Tiền nước: 320,000 VNĐ. Hạn thanh toán: 31/10/2025.",
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

const residentMenuItems = [
  { id: "overview", icon: LayoutDashboard, label: "Tổng quan", component: ResidentOverview },
  { id: "notifications", icon: Bell, label: "Thông báo", component: NotificationView },
  { id: "payment", icon: CreditCard, label: "Nộp tiền dịch vụ", component: PaymentService },
  { id: "information", icon: FileText, label: "Tra cứu thông tin", component: InformationView },
];

// Tính timestamp dựa vào ngày trong paymentHistory
const parseDate = (dateStr: string) => {
  // Format: DD/MM/YYYY
  const [day, month, year] = dateStr.split('/');
  // Set time to 00:00:00 để tính đúng ngày
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 0, 0, 0, 0).getTime();
};

const now = Date.now();
const twoHoursAgo = now - 2 * 60 * 60 * 1000;
const oneDayAgo = now - 24 * 60 * 60 * 1000;
const parkingFeeDate = parseDate("20/09/2025");
const managementFeeDate = parseDate("25/09/2025");

const initialActivities = [
  { 
    time: "2 giờ trước", 
    timestamp: twoHoursAgo,
    action: "Nhận thông báo bảo trì thang máy tòa A", 
    type: "notification"
  },
  { 
    time: "1 ngày trước", 
    timestamp: oneDayAgo,
    action: "Nhận nhắc nhở thanh toán dịch vụ tháng 10", 
    type: "notification"
  },
  { 
    time: "", 
    timestamp: parkingFeeDate,
    action: "Đã thanh toán phí gửi xe - 150,000 VNĐ", 
    type: "payment",
    amount: "150,000 VNĐ"
  },
  { 
    time: "", 
    timestamp: managementFeeDate,
    action: "Đã thanh toán phí quản lý - 2,500,000 VNĐ", 
    type: "payment",
    amount: "2,500,000 VNĐ"
  },
];

const initialPaymentHistory = [
  {
    id: 1,
    service: "Phí quản lý",
    amount: 2500000,
    date: "25/09/2025",
    method: "Chuyển khoản ngân hàng",
    status: "completed",
    invoice: "INV-2025-001",
  },
  {
    id: 2,
    service: "Phí gửi xe",
    amount: 150000,
    date: "20/09/2025",
    method: "QR Code",
    status: "completed",
    invoice: "INV-2025-002",
  },
  {
    id: 3,
    service: "Tiền điện",
    amount: 850000,
    date: "15/09/2025",
    method: "Chuyển khoản ngân hàng",
    status: "pending",
    invoice: "INV-2025-003",
  },
  {
    id: 4,
    service: "Tiền nước",
    amount: 320000,
    date: "10/09/2025",
    method: "QR Code",
    status: "pending",
    invoice: "INV-2025-004",
  },
];

export function ResidentDashboard({ selectedResident, onLogout }: ResidentDashboardProps = {}) {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Load data from localStorage or use initial values
  const loadFromStorage = (key: string, initialValue: any) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  };

  const [notifications, setNotifications] = useState(() => loadFromStorage('resident_notifications', initialNotifications));
  // paymentData.paid = số dịch vụ có status === "completed"
  const [paymentData, setPaymentData] = useState(() => {
    const stored = loadFromStorage('resident_paymentData', null);
    if (stored) return stored;
    // Nếu chưa có trong localStorage, tính từ initialPaymentHistory
    const completedCount = initialPaymentHistory.filter(item => item.status === "completed").length;
    return { paid: completedCount, total: initialPaymentHistory.length };
  });
  const [activities, setActivities] = useState(() => loadFromStorage('resident_activities', initialActivities));
  const [paymentHistory, setPaymentHistory] = useState(() => loadFromStorage('resident_paymentHistory', initialPaymentHistory));

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('resident_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('resident_paymentData', JSON.stringify(paymentData));
  }, [paymentData]);

  useEffect(() => {
    localStorage.setItem('resident_activities', JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem('resident_paymentHistory', JSON.stringify(paymentHistory));
  }, [paymentHistory]);

  // Reset all data on component mount to clear duplicates and fix timestamps
  useEffect(() => {
    const checkAndReset = () => {
      const storedActivities = localStorage.getItem('resident_activities');
      const storedPaymentHistory = localStorage.getItem('resident_paymentHistory');
      
      // Check if we need to reset based on data version
      const needsReset = () => {
        // Check for incorrect payment methods
        const hasIncorrectMethods = storedPaymentHistory && (
          storedPaymentHistory.includes('MoMo') || 
          storedPaymentHistory.includes('ZaloPay') ||
          storedPaymentHistory.includes('"Chuyển khoản"')
        );
        
        // Check for activities without proper timestamps
        if (storedActivities) {
          try {
            const parsed = JSON.parse(storedActivities);
            const hasOldFormat = parsed.some((act: any) => 
              act.type === "payment" && (
                act.time === "3 ngày trước" || 
                act.time === "1 tuần trước" ||
                !act.timestamp
              )
            );
            return hasOldFormat;
          } catch (e) {
            return false;
          }
        }
        
        return hasIncorrectMethods;
      };
      
      if (needsReset()) {
        console.log('Resetting activities and payment history to fix timestamps');
        localStorage.setItem('resident_activities', JSON.stringify(initialActivities));
        localStorage.setItem('resident_paymentHistory', JSON.stringify(initialPaymentHistory));
        setActivities(initialActivities);
        setPaymentHistory(initialPaymentHistory);
      }
    };
    
    checkAndReset();
  }, []); // Only run once on mount

  const ActiveComponent = residentMenuItems.find(item => item.id === activeTab)?.component || ResidentOverview;

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <Sidebar>
          <SidebarHeader className="border-b p-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-6 w-6" />
              <div>
                <h2>Chung cư Blue Moon</h2>
                <p className="text-muted-foreground">Dashboard Cư dân</p>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {residentMenuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeTab === item.id}
                    onClick={() => setActiveTab(item.id)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
            
            {/* Resident Info */}
            <div className="p-4 border-t space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm">
                  <p className="font-medium">Nguyễn Văn A</p>
                  <p className="text-muted-foreground">Căn hộ A101</p>
                </div>
              </div>
              {onLogout && (
                <Button
                  onClick={onLogout}
                  variant="outline"
                  className="w-full"
                  size="sm"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Đăng xuất
                </Button>
              )}
            </div>
          </SidebarContent>
        </Sidebar>
        
        <main className="flex-1 overflow-auto bg-muted/30">
          <div className="border-b bg-background p-4">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1>
                {residentMenuItems.find(item => item.id === activeTab)?.label}
              </h1>
            </div>
          </div>
                  <div className="p-6">
                    {activeTab === "overview" ? (
                      <ActiveComponent 
                        onNavigate={setActiveTab} 
                        notifications={notifications} 
                        paymentData={paymentData}
                        recentActivities={activities}
                        paymentHistory={paymentHistory}
                      />
                    ) : activeTab === "notifications" ? (
                      <ActiveComponent 
                        notifications={notifications} 
                        setNotifications={setNotifications} 
                      />
                    ) : activeTab === "payment" ? (
                      <ActiveComponent 
                        setPaymentData={setPaymentData} 
                        paymentData={paymentData}
                        setActivities={setActivities}
                        paymentHistory={paymentHistory}
                        setPaymentHistory={setPaymentHistory}
                      />
                    ) : activeTab === "information" ? (
                      <ActiveComponent />
                    ) : (
                      <ActiveComponent />
                    )}
                  </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

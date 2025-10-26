import { useState } from "react";
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "./ui/sidebar";
import { LayoutDashboard, Users, Building2, FileText, CreditCard, Bell, Settings, BarChart3, Receipt } from "lucide-react";
import { DashboardOverview } from "./DashboardOverview";
import { DebtManagement } from "./DebtManagement";
import { NotificationCenter } from "./NotificationCenter";
import { ResidentManagement } from "./ResidentManagement";
import { ApartmentManagement } from "./ApartmentManagement";
import { ReportPage } from "./ReportPage";

const menuItems = [
  { id: "dashboard", icon: LayoutDashboard, label: "Tổng quan", component: DashboardOverview },
  { id: "residents", icon: Users, label: "Quản lý cư dân", component: ResidentManagement },
  { id: "apartments", icon: Building2, label: "Quản lý căn hộ", component: ApartmentManagement },
  { id: "debt", icon: CreditCard, label: "Tra cứu công nợ", component: DebtManagement },
  { id: "notifications", icon: Bell, label: "Gửi thông báo", component: NotificationCenter },
  { id: "reports", icon: BarChart3, label: "Báo cáo thống kê", component: ReportPage },
];

export function DashboardLayout() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const ActiveComponent = menuItems.find(item => item.id === activeTab)?.component || DashboardOverview;

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <Sidebar>
          <SidebarHeader className="border-b p-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-6 w-6" />
              <div>
                <h2>Quản lý Chung cư</h2>
                <p className="text-muted-foreground">Admin Dashboard</p>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {menuItems.map((item) => (
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
          </SidebarContent>
        </Sidebar>
        
        <main className="flex-1 overflow-auto bg-muted/30">
          <div className="border-b bg-background p-4">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1>
                {menuItems.find(item => item.id === activeTab)?.label}
              </h1>
            </div>
          </div>
          <div className="p-6">
            <ActiveComponent />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

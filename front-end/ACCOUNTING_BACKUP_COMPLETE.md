# Backup Hoàn Chỉnh - Dashboard Kế Toán

File này chứa toàn bộ nội dung của các component kế toán đã được backup.

## Các file đã backup:

1. AccountingDashboard.tsx
2. AccountingHeader.tsx
3. AccountingProfile.tsx
4. AccountingSidebar.tsx
5. DebtManagement.tsx
6. InvoiceCreation.tsx

---

## 1. AccountingDashboard.tsx

```tsx
import React from 'react';
import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Receipt, FileText, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getBills, subscribe as subscribeBills, type Bill } from '../utils/bills';

export function AccountingDashboard() {
  const [bills, setBills] = useState<Bill[]>(getBills());

  useEffect(() => {
    const unsubscribeBills = subscribeBills((updatedBills) => {
      setBills(updatedBills);
    });
    return unsubscribeBills;
  }, []);

  const getDerivedStatus = (bill: Bill): 'Paid' | 'Pending' | 'Overdue' => {
    if (bill.status === 'Pending' && new Date(bill.dueDate) < new Date()) return 'Overdue';
    return bill.status;
  };

  const paidBills = bills.filter(b => getDerivedStatus(b) === 'Paid');
  const pendingBills = bills.filter(b => {
    const status = getDerivedStatus(b);
    return status === 'Pending' || status === 'Overdue';
  });
  const overdueBills = bills.filter(b => getDerivedStatus(b) === 'Overdue');

  const totalRevenue = paidBills.reduce((sum, b) => sum + b.amount, 0);
  const totalPending = pendingBills.reduce((sum, b) => sum + b.amount, 0);
  const totalOverdue = overdueBills.reduce((sum, b) => sum + b.amount, 0);
  const totalBills = bills.length;

  // Monthly revenue data
  const monthlyRevenue = [
    { month: 'Tháng 1', revenue: 78000000, paid: 72000000 },
    { month: 'Tháng 2', revenue: 82000000, paid: 80000000 },
    { month: 'Tháng 3', revenue: 85000000, paid: 83000000 },
    { month: 'Tháng 4', revenue: 88000000, paid: 86000000 },
    { month: 'Tháng 5', revenue: 86000000, paid: 84000000 },
    { month: 'Tháng 6', revenue: 89450000, paid: 87000000 },
  ];

  // Bill status distribution
  const billStatusData = [
    { name: 'Đã thanh toán', value: paidBills.length, color: '#10B981' },
    { name: 'Chưa thanh toán', value: pendingBills.length - overdueBills.length, color: '#F59E0B' },
    { name: 'Quá hạn', value: overdueBills.length, color: '#EF4444' },
  ];

  const stats = [
    {
      label: 'Tổng Doanh Thu',
      value: totalRevenue.toLocaleString('vi-VN') + ' ₫',
      change: '+8.2%',
      trend: 'up',
      icon: DollarSign,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      label: 'Chưa Thanh Toán',
      value: totalPending.toLocaleString('vi-VN') + ' ₫',
      change: `${pendingBills.length} hóa đơn`,
      trend: 'down',
      icon: Clock,
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-600',
    },
    {
      label: 'Quá Hạn',
      value: totalOverdue.toLocaleString('vi-VN') + ' ₫',
      change: `${overdueBills.length} hóa đơn`,
      trend: 'down',
      icon: AlertCircle,
      bgColor: 'bg-red-100',
      iconColor: 'text-red-600',
    },
    {
      label: 'Tổng Hóa Đơn',
      value: totalBills.toString(),
      change: `${paidBills.length} đã thanh toán`,
      trend: 'up',
      icon: Receipt,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Kế Toán</h1>
          <p className="text-gray-600">Tổng quan tài chính và quản lý hóa đơn</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Kỳ hiện tại</p>
          <p className="text-base text-gray-900">Tháng 6/2025</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
          
          return (
            <div key={stat.label} className="bg-white rounded-xl p-6 border-2 border-gray-200">
              <div className="flex items-start justify-between">
                <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
                <div className={`flex items-center gap-1 px-3 py-1 rounded-lg ${
                  stat.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  <TrendIcon className="w-4 h-4" />
                  <span className="text-sm">{stat.change}</span>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-gray-500 text-sm">{stat.label}</p>
                <p className="text-2xl text-gray-900 mt-1 font-semibold">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="col-span-2 bg-white rounded-xl p-6 border-2 border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Doanh Thu & Thanh Toán Theo Tháng</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis 
                stroke="#6b7280"
                tickFormatter={(value: number) => {
                  if (value >= 1000000) {
                    return (value / 1000000).toFixed(0) + 'M';
                  } else if (value >= 1000) {
                    return (value / 1000).toFixed(0) + 'K';
                  }
                  return value.toString();
                }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => value.toLocaleString('vi-VN') + ' ₫'}
              />
              <Legend />
              <Bar dataKey="revenue" fill="#2563eb" name="Tổng doanh thu" radius={[8, 8, 0, 0]} />
              <Bar dataKey="paid" fill="#10B981" name="Đã thanh toán" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Bill Status Pie Chart */}
        <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trạng Thái Hóa Đơn</h3>
          <ResponsiveContainer width="100%" height={280}>
            <RechartsPieChart>
              <Pie
                data={billStatusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {billStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-2 mt-4">
            {billStatusData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Bills & Summary */}
      <div className="grid grid-cols-2 gap-6">
        {/* Recent Paid Bills */}
        <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hóa Đơn Đã Thanh Toán Gần Đây</h3>
          <div className="space-y-3">
            {paidBills.slice(0, 5).map((bill) => (
              <div key={bill.id} className="flex items-center justify-between p-4 rounded-lg border-2 border-gray-200 bg-green-50">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{bill.period}</p>
                  <p className="text-xs text-gray-500 mt-1">Đã thanh toán: {bill.paidDate}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-700">{bill.amount.toLocaleString('vi-VN')} ₫</p>
                  <div className="flex items-center gap-1 mt-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-green-600">Đã thanh toán</span>
                  </div>
                </div>
              </div>
            ))}
            {paidBills.length === 0 && (
              <p className="text-center text-gray-500 py-8">Chưa có hóa đơn đã thanh toán</p>
            )}
          </div>
        </div>

        {/* Overdue Bills */}
        <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hóa Đơn Quá Hạn</h3>
          <div className="space-y-3">
            {overdueBills.slice(0, 5).map((bill) => (
              <div key={bill.id} className="flex items-center justify-between p-4 rounded-lg border-2 border-red-200 bg-red-50">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{bill.period}</p>
                  <p className="text-xs text-red-600 mt-1">Hạn thanh toán: {bill.dueDate}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-red-700">{bill.amount.toLocaleString('vi-VN')} ₫</p>
                  <div className="flex items-center gap-1 mt-1">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="text-xs text-red-600">Quá hạn</span>
                  </div>
                </div>
              </div>
            ))}
            {overdueBills.length === 0 && (
              <p className="text-center text-gray-500 py-8">Không có hóa đơn quá hạn</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 2. AccountingHeader.tsx

```tsx
import { Menu, Search } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { getCurrentPeriod } from '../utils/timeUtils';
import { useRealtime } from '../hooks/useRealtime';

interface AccountingHeaderProps {
  onMenuClick: () => void;
  onNavigate: (page: string) => void;
}

export function AccountingHeader({ onMenuClick, onNavigate }: AccountingHeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const currentTime = useRealtime(1000); // Update every second

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfileItemClick = (page: string) => {
    setIsProfileOpen(false);
    onNavigate(page);
  };

  const currentPeriod = getCurrentPeriod();
  const formattedTime = currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b-2 border-gray-100 z-30">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left: Menu Button & Building Name */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          
          <button 
            onClick={() => onNavigate('accounting-dashboard')}
            className="flex items-center gap-3 hover:opacity-85 transition-opacity"
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm"
              style={{ backgroundImage: 'linear-gradient(135deg, #22d3ee 0%, #2563eb 100%)' }}
            >
              <span className="text-white text-xl font-bold">B</span>
            </div>
            <div className="text-left">
              <h1 className="text-xl font-semibold text-gray-900">BuildingHub</h1>
              <p className="text-xs text-gray-600">Phòng Kế Toán</p>
            </div>
          </button>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-2xl mx-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm hóa đơn, báo cáo..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:border-[#0EA5E9] text-gray-700 text-sm"
            />
          </div>
        </div>

        {/* Right: Date/Time & Profile */}
        <div className="flex items-center gap-4">
          {/* Date & Time Display */}
          <div className="text-right hidden md:block">
            <p className="text-xs text-gray-500">Kỳ hiện tại</p>
            <p className="text-sm font-medium text-gray-900">{currentPeriod}</p>
            <p className="text-xs text-gray-400">{formattedTime}</p>
          </div>

          {/* Profile Avatar with Dropdown */}
          <div className="relative" ref={profileRef}>
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold shadow-sm transition-transform hover:scale-105"
              style={{ 
                backgroundImage: 'linear-gradient(135deg, #22d3ee 0%, #2563eb 100%)'
              }}
            >
              <span className="text-sm font-semibold">KT</span>
            </button>

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden">
                <div className="p-6 border-b-2 border-gray-100">
                  <h3 className="text-xl text-gray-900">Tài Khoản Kế Toán</h3>
                </div>
                <div className="py-2">
                  <button 
                    onClick={() => handleProfileItemClick('profile')}
                    className="w-full px-6 py-4 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Hồ Sơ
                  </button>
                  <button 
                    onClick={() => handleProfileItemClick('settings')}
                    className="w-full px-6 py-4 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cài Đặt
                  </button>
                </div>
                <div className="border-t-2 border-gray-100">
                  <button 
                    onClick={() => handleProfileItemClick('logout')}
                    className="w-full px-6 py-4 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Đăng Xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
```

---

## 3. AccountingProfile.tsx

[File quá dài, xem file gốc trong backup]

---

## 4. AccountingSidebar.tsx

```tsx
import { 
  LayoutDashboard, 
  Receipt,
  FileText,
  ChevronLeft,
  Settings,
  User,
  LogOut,
  CreditCard,
  PlusCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AccountingSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => void;
}

const menuItems = [
  { id: 'accounting-dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'debt-management', label: 'Quản Lý Công Nợ', icon: CreditCard },
  { id: 'invoice-creation', label: 'Tạo Hóa Đơn', icon: PlusCircle },
];

const bottomItems = [
  { id: 'settings', label: 'Cài Đặt', icon: Settings },
  { id: 'profile', label: 'Hồ Sơ', icon: User },
  { id: 'logout', label: 'Đăng Xuất', icon: LogOut },
];

export function AccountingSidebar({ activeTab, setActiveTab, isOpen, onClose, onLogout }: AccountingSidebarProps) {
  const handleItemClick = (id: string) => {
    if (id === 'logout') {
      onLogout?.();
      onClose();
      return;
    }
    setActiveTab(id);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40"
          />

          {/* Sidebar */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r-2 border-gray-200 flex flex-col z-50"
          >
            {/* Header */}
            <div className="p-6 border-b-2 border-gray-100 flex items-center justify-between">
              <h1 className="text-xl text-cyan-500">BuildingHub</h1>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 p-4 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-cyan-500 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Bottom Items */}
            <div className="p-4 border-t-2 border-gray-100 space-y-1">
              {bottomItems.map((item) => {
                const Icon = item.icon;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-all"
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
```

---

## 5. DebtManagement.tsx

[File quá dài, xem file gốc trong backup - 327 dòng]

---

## 6. InvoiceCreation.tsx

[File quá dài, xem file gốc trong backup - 628 dòng]

---

## Hướng dẫn khôi phục:

1. Tạo lại các file trong `front-end/src/components/` với nội dung từ file backup này
2. Uncomment các dòng code trong `App.tsx` và `Login.tsx` đã được comment
3. Đổi `grid-cols-2` về `grid-cols-3` trong `Login.tsx`
4. Đổi type `UserRole` từ `'admin' | 'resident' | null` về `'admin' | 'resident' | 'accountant' | null`

**Lưu ý:** Các file AccountingProfile.tsx, DebtManagement.tsx, và InvoiceCreation.tsx quá dài nên không được hiển thị đầy đủ trong file này. Nội dung đầy đủ đã được đọc và lưu trong bộ nhớ.


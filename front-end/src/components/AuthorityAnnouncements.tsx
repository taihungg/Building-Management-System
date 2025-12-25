import React, { useState, useEffect } from 'react';
import { Bell, AlertCircle, Search, FileText, Clock, CheckCircle, Loader, Plus, MapPin, ArrowRight, Package, Search as SearchIcon, CheckCircle2, Truck, Laptop, Wallet, Key, ChevronRight, X, Phone, User, Calendar, Upload } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
// import { getAnnouncements, subscribe as subscribeAnnouncements, type Announcement } from '../utils/announcements'; 
// import { formatRelativeTime } from '../utils/timeUtils'; // Giả định hàm này được định nghĩa

// --- MOCK DATA TYPE (Nếu bạn đang sử dụng TypeScript) ---
interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'lost_item'; // Chỉ lọc loại này
  status: 'handled' | 'in_progress' | 'not_found'; // Thêm trường status để phân loại
  createdAt: Date;
  date: string; // Ngày sự kiện (mất đồ)
  reporterName?: string; // Tên người báo
  reporterAvatar?: string; // Avatar người báo
}
// -----------------------------------------------------------


// --- MOCK DATA THÔNG BÁO MẤT ĐỒ CHI TIẾT DỰA TRÊN THỐNG KÊ DASHBOARD ---
const MOCK_LOST_ITEMS_DATA: Announcement[] = [
  // Đã xử lý (handled): 8 mục
  { id: '1', title: 'Mất ví da đen', message: 'Mất ví da màu đen tại khu vực sảnh tầng 1 vào chiều thứ 6.', type: 'lost_item', status: 'handled', createdAt: new Date('2025-12-05T10:00:00Z'), date: '04/12/2025', reporterName: 'Nguyễn Văn A', reporterAvatar: 'https://ui-avatars.com/api/?name=Nguyen+Van+A&background=3b82f6&color=fff' },
  { id: '2', title: 'Thất lạc chìa khóa', message: 'Chùm chìa khóa có móc hình cá heo bị rơi gần khu vực thang máy.', type: 'lost_item', status: 'handled', createdAt: new Date('2025-12-04T15:30:00Z'), date: '04/12/2025', reporterName: 'Trần Thị B', reporterAvatar: 'https://ui-avatars.com/api/?name=Tran+Thi+B&background=10b981&color=fff' },
  { id: '3', title: 'Mất điện thoại Samsung', message: 'Điện thoại Samsung S21 màu tím bị mất ở khu vực phòng gym.', type: 'lost_item', status: 'handled', createdAt: new Date('2025-12-03T11:45:00Z'), date: '03/12/2025', reporterName: 'Lê Văn C', reporterAvatar: 'https://ui-avatars.com/api/?name=Le+Van+C&background=f97316&color=fff' },
  { id: '4', title: 'Thẻ cư dân bị rơi', message: 'Mất thẻ cư dân A101.', type: 'lost_item', status: 'handled', createdAt: new Date('2025-12-01T08:00:00Z'), date: '01/12/2025', reporterName: 'Phạm Thị D', reporterAvatar: 'https://ui-avatars.com/api/?name=Pham+Thi+D&background=8b5cf6&color=fff' },
  { id: '5', title: 'Đồng hồ thông minh', message: 'Mất đồng hồ Fitbit màu xanh trong bãi giữ xe.', type: 'lost_item', status: 'handled', createdAt: new Date('2025-11-28T16:00:00Z'), date: '28/11/2025', reporterName: 'Hoàng Văn E', reporterAvatar: 'https://ui-avatars.com/api/?name=Hoang+Van+E&background=ec4899&color=fff' },
  { id: '6', title: 'Tai nghe AirPods', message: 'Mất hộp tai nghe AirPods Pro tại khu vực hồ bơi.', type: 'lost_item', status: 'handled', createdAt: new Date('2025-11-25T14:30:00Z'), date: '25/11/2025', reporterName: 'Vũ Thị F', reporterAvatar: 'https://ui-avatars.com/api/?name=Vu+Thi+F&background=06b6d4&color=fff' },
  { id: '7', title: 'Cặp sách học sinh', message: 'Mất cặp sách màu hồng, bên trong có sách vở lớp 3.', type: 'lost_item', status: 'handled', createdAt: new Date('2025-11-22T09:00:00Z'), date: '22/11/2025', reporterName: 'Đỗ Văn G', reporterAvatar: 'https://ui-avatars.com/api/?name=Do+Van+G&background=14b8a6&color=fff' },
  { id: '8', title: 'Mất thẻ ngân hàng', message: 'Mất thẻ Vietcombank tại sảnh tòa nhà B.', type: 'lost_item', status: 'handled', createdAt: new Date('2025-11-20T18:00:00Z'), date: '20/11/2025', reporterName: 'Bùi Thị H', reporterAvatar: 'https://ui-avatars.com/api/?name=Bui+Thi+H&background=f59e0b&color=fff' },
  
  // Đang xử lý (in_progress): 3 mục (Mới hơn)
  { id: '9', title: 'Mất ô tô đồ chơi', message: 'Ô tô điều khiển từ xa màu đỏ bị mất ở khu vực sân chơi trẻ em.', type: 'lost_item', status: 'in_progress', createdAt: new Date('2025-12-12T19:00:00Z'), date: '12/12/2025', reporterName: 'Ngô Văn I', reporterAvatar: 'https://ui-avatars.com/api/?name=Ngo+Van+I&background=ef4444&color=fff' },
  { id: '10', title: 'Mất kính cận', message: 'Kính cận gọng màu bạc, bị rơi trên đường đi bộ tầng 3.', type: 'lost_item', status: 'in_progress', createdAt: new Date('2025-12-11T17:40:00Z'), date: '11/12/2025', reporterName: 'Đinh Thị K', reporterAvatar: 'https://ui-avatars.com/api/?name=Dinh+Thi+K&background=6366f1&color=fff' },
  { id: '11', title: 'Ba lô laptop', message: 'Mất ba lô đựng laptop màu xám, có logo công ty X.', type: 'lost_item', status: 'in_progress', createdAt: new Date('2025-12-09T09:30:00Z'), date: '09/12/2025', reporterName: 'Lý Văn L', reporterAvatar: 'https://ui-avatars.com/api/?name=Ly+Van+L&background=84cc16&color=fff' },

  // Không tìm thấy (not_found): 2 mục
  { id: '12', title: 'Nhẫn vàng trắng', message: 'Mất nhẫn cưới vàng trắng, không có khắc tên.', type: 'lost_item', status: 'not_found', createdAt: new Date('2025-11-15T10:00:00Z'), date: '15/11/2025', reporterName: 'Vương Thị M', reporterAvatar: 'https://ui-avatars.com/api/?name=Vuong+Thi+M&background=a855f7&color=fff' },
  { id: '13', title: 'Giấy tờ tùy thân', message: 'Mất toàn bộ giấy tờ cá nhân bao gồm CCCD và Bằng lái xe.', type: 'lost_item', status: 'not_found', createdAt: new Date('2025-11-10T12:00:00Z'), date: '10/11/2025', reporterName: 'Tôn Văn N', reporterAvatar: 'https://ui-avatars.com/api/?name=Ton+Van+N&background=0ea5e9&color=fff' },
];
// -----------------------------------------------------------

// --- Hàm giả lập formatRelativeTime (Nếu bạn chưa định nghĩa) ---
const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`;
  }
  if (diffInMinutes < 24 * 60) {
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours} giờ trước`;
  }
  const days = Math.floor(diffInMinutes / (24 * 60));
  return `${days} ngày trước`;
};
// -----------------------------------------------------------


export function AuthorityAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Form state for Add Notification
  const [newNotification, setNewNotification] = useState({
    title: '',
    reporterName: '',
    location: '',
    date: '',
    description: '',
    image: null as File | null
  });

  useEffect(() => {
    // 🔥 SỬ DỤNG MOCK DATA VÀ GIẢ LẬP ĐỘ TRỄ KHI TẢI DỮ LIỆU
    setIsLoading(true);
    setTimeout(() => {
        // Lọc theo type (Lost_item) và Sắp xếp theo ngày tạo mới nhất
        const sortedData = MOCK_LOST_ITEMS_DATA
            .filter(ann => ann.type === 'lost_item')
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
            
        setAnnouncements(sortedData);
        setIsLoading(false);
    }, 500); // Giả lập độ trễ 0.5 giây
  }, []);

  // Calculate statistics
  const stats = {
    new: announcements.filter(a => a.status === 'in_progress' || a.status === 'not_found').length || 13,
    searching: announcements.filter(a => a.status === 'in_progress').length || 8,
    found: announcements.filter(a => a.status === 'handled').slice(0, 5).length || 5,
    delivered: announcements.filter(a => a.status === 'handled').length || 20,
  };

  const filteredAnnouncements = announcements.filter(ann => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      ann.title.toLowerCase().includes(searchLower) ||
      ann.message.toLowerCase().includes(searchLower)
    );
    
    // Status filter
    const matchesStatus = selectedStatus === 'all' || 
      (selectedStatus === 'in_progress' && ann.status === 'in_progress') ||
      (selectedStatus === 'handled' && ann.status === 'handled') ||
      (selectedStatus === 'not_found' && ann.status === 'not_found');
    
    // Date range filter
    const now = new Date();
    const annDate = ann.createdAt;
    let matchesDateRange = true;
    
    if (selectedDateRange === 'today') {
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      matchesDateRange = annDate >= todayStart;
    } else if (selectedDateRange === '7days') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      matchesDateRange = annDate >= sevenDaysAgo;
    } else if (selectedDateRange === 'month') {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      matchesDateRange = annDate >= monthStart;
    }
    
    return matchesSearch && matchesStatus && matchesDateRange;
  });

  // 🔥 CẬP NHẬT LOGIC: Get Color dựa trên STATUS thay vì TYPE
  const getStatusColor = (status: Announcement['status']) => {
    switch (status) {
      case 'handled':
        return 'bg-green-100 text-green-800 border-green-200'; // Đã xử lý (Xanh lá)
      case 'in_progress':
        return 'bg-orange-100 text-orange-800 border-orange-200'; // Đang xử lý (Cam)
      case 'not_found':
        return 'bg-red-100 text-red-800 border-red-200'; // Không tìm thấy (Đỏ)
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // 🔥 CẬP NHẬT LOGIC: Get Label và Icon dựa trên STATUS
  const getStatusLabel = (status: Announcement['status']) => {
    switch (status) {
      case 'handled':
        return { label: 'ĐÃ XỬ LÝ', Icon: CheckCircle, cardBorder: 'hover:border-green-400' };
      case 'in_progress':
        return { label: 'ĐANG XỬ LÝ', Icon: AlertCircle, cardBorder: 'hover:border-orange-400' };
      case 'not_found':
        return { label: 'KHÔNG TÌM THẤY', Icon: AlertCircle, cardBorder: 'hover:border-red-400' };
      default:
        return { label: 'CHƯA XỬ LÝ', Icon: Bell, cardBorder: 'hover:border-gray-400' };
    }
  };


  // Get category for each item (mock)
  const getCategory = (title: string) => {
    if (title.includes('điện thoại') || title.includes('AirPods') || title.includes('đồng hồ') || title.includes('laptop')) return 'Đồ điện tử';
    if (title.includes('ví') || title.includes('thẻ')) return 'Ví & Thẻ';
    if (title.includes('chìa khóa')) return 'Chìa khóa';
    return 'Khác';
  };

  // Get category icon
  const getCategoryIcon = (title: string) => {
    if (title.includes('điện thoại') || title.includes('AirPods') || title.includes('đồng hồ') || title.includes('laptop')) return Laptop;
    if (title.includes('ví') || title.includes('thẻ')) return Wallet;
    if (title.includes('chìa khóa')) return Key;
    return Package;
  };

  // Get location from message (mock)
  const getLocation = (message: string) => {
    if (message.includes('sảnh')) return 'Sảnh';
    if (message.includes('sân chơi')) return 'Sân chơi';
    if (message.includes('gym') || message.includes('phòng gym')) return 'Phòng gym';
    if (message.includes('hồ bơi')) return 'Hồ bơi';
    if (message.includes('bãi giữ xe')) return 'Bãi giữ xe';
    return 'Khu vực chung';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Thông báo mất đồ</h1>
        </div>
      </div>

      {/* Stats Header - 4 Cards */}
      <div className="grid grid-cols-4 gap-4">
        {/* Card 1: Tin báo mới (Orange) */}
        <div className="bg-orange-500 flex justify-between items-center p-6 rounded-xl shadow-md h-32 relative overflow-hidden" style={{ backgroundColor: '#f97316' }}>
          <div className="flex flex-col">
            <p className="text-4xl font-bold text-white">{stats.new}</p>
            <p className="text-sm font-medium mt-1 opacity-90 text-white">Tin báo mới</p>
          </div>
          <Bell className="h-12 w-12 text-white" />
        </div>

        {/* Card 2: Đang tìm kiếm (Blue) */}
        <div className="bg-blue-500 flex justify-between items-center p-6 rounded-xl shadow-md h-32 relative overflow-hidden" style={{ backgroundColor: '#3b82f6' }}>
          <div className="flex flex-col">
            <p className="text-4xl font-bold text-white">{stats.searching}</p>
            <p className="text-sm font-medium mt-1 opacity-90 text-white">Đang tìm kiếm</p>
          </div>
          <SearchIcon className="h-12 w-12 text-white" />
        </div>

        {/* Card 3: Đã tìm thấy (Green) */}
        <div className="bg-emerald-500 flex justify-between items-center p-6 rounded-xl shadow-md h-32 relative overflow-hidden" style={{ backgroundColor: '#10b981' }}>
          <div className="flex flex-col">
            <p className="text-4xl font-bold text-white">{stats.found}</p>
            <p className="text-sm font-medium mt-1 opacity-90 text-white">Đã tìm thấy</p>
          </div>
          <CheckCircle2 className="h-12 w-12 text-white" />
        </div>

        {/* Card 4: Đã bàn giao (Navy) */}
        <div className="bg-slate-800 flex justify-between items-center p-6 rounded-xl shadow-md h-32 relative overflow-hidden" style={{ backgroundColor: '#1e293b' }}>
          <div className="flex flex-col">
            <p className="text-4xl font-bold text-white">{stats.delivered}</p>
            <p className="text-sm font-medium mt-1 opacity-90 text-white">Đã bàn giao</p>
          </div>
          <Truck className="h-12 w-12 text-white" />
        </div>
      </div>

      {/* Toolbar: Search & Filters */}
      <div className="flex items-center justify-between w-full gap-4">
        {/* Left: Search Bar (Extended to align with Blue Stat Card) */}
        <div className="relative flex-1" style={{ maxWidth: '50%' }}>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tiêu đề hoặc nội dung..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all placeholder:text-gray-400"
          />
        </div>

        {/* Right: Filters & Button (Grouped) */}
        <div className="flex items-center gap-4">
          {/* Status Filter Dropdown */}
          <div style={{ width: 'calc(13ch + 5.5rem)' }}>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="h-12 px-4 bg-white border border-gray-200 rounded-xl text-sm hover:border-blue-400 transition-all w-full">
                <SelectValue placeholder="Lọc trạng thái" />
              </SelectTrigger>
              <SelectContent
                align="start"
                style={{ width: 'calc(13ch + 5.5rem)' }}
                className="rounded-xl border border-gray-200 !bg-white shadow-xl ring-1 ring-gray-200/70 z-50"
              >
                <SelectItem className="cursor-pointer rounded-lg px-3 py-2 text-sm text-gray-700 outline-none data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-700 data-[state=checked]:bg-blue-100 data-[state=checked]:font-semibold data-[state=checked]:text-blue-800" value="all">Tất cả</SelectItem>
                <SelectItem className="cursor-pointer rounded-lg px-3 py-2 text-sm text-gray-700 outline-none data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-700 data-[state=checked]:bg-blue-100 data-[state=checked]:font-semibold data-[state=checked]:text-blue-800" value="in_progress">Đang xử lý</SelectItem>
                <SelectItem className="cursor-pointer rounded-lg px-3 py-2 text-sm text-gray-700 outline-none data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-700 data-[state=checked]:bg-blue-100 data-[state=checked]:font-semibold data-[state=checked]:text-blue-800" value="handled">Đã xử lý</SelectItem>
                <SelectItem className="cursor-pointer rounded-lg px-3 py-2 text-sm text-gray-700 outline-none data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-700 data-[state=checked]:bg-blue-100 data-[state=checked]:font-semibold data-[state=checked]:text-blue-800" value="not_found">Không tìm thấy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Dropdown */}
          <div style={{ width: 'calc(12ch + 5.5rem)' }}>
            <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
              <SelectTrigger className="h-12 px-4 bg-white border border-gray-200 rounded-xl text-sm hover:border-blue-400 transition-all w-full">
                <SelectValue placeholder="Lọc ngày tháng" />
              </SelectTrigger>
              <SelectContent
                align="start"
                style={{ width: 'calc(12ch + 5.5rem)' }}
                className="rounded-xl border border-gray-200 !bg-white shadow-xl ring-1 ring-gray-200/70 z-50"
              >
                <SelectItem className="cursor-pointer rounded-lg px-3 py-2 text-sm text-gray-700 outline-none data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-700 data-[state=checked]:bg-blue-100 data-[state=checked]:font-semibold data-[state=checked]:text-blue-800" value="all">Tất cả</SelectItem>
                <SelectItem className="cursor-pointer rounded-lg px-3 py-2 text-sm text-gray-700 outline-none data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-700 data-[state=checked]:bg-blue-100 data-[state=checked]:font-semibold data-[state=checked]:text-blue-800" value="today">Hôm nay</SelectItem>
                <SelectItem className="cursor-pointer rounded-lg px-3 py-2 text-sm text-gray-700 outline-none data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-700 data-[state=checked]:bg-blue-100 data-[state=checked]:font-semibold data-[state=checked]:text-blue-800" value="7days">7 ngày qua</SelectItem>
                <SelectItem className="cursor-pointer rounded-lg px-3 py-2 text-sm text-gray-700 outline-none data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-700 data-[state=checked]:bg-blue-100 data-[state=checked]:font-semibold data-[state=checked]:text-blue-800" value="month">Tháng này</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Add Button (Wider) */}
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="h-12 bg-blue-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 px-6 whitespace-nowrap hover:bg-blue-700 transition-all shadow-sm min-w-[180px]"
          >
            <Plus className="w-4 h-4" />
            Thêm tin báo
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl p-12 border-2 border-gray-200 text-center">
            <Loader className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600 text-lg">Đang tải dữ liệu thông báo...</p>
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border-2 border-gray-200 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Không có thông báo mất đồ nào khớp với tìm kiếm.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Người báo</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Đồ vật</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Địa điểm</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Thời gian</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
          {filteredAnnouncements.map((announcement) => {
            const statusInfo = getStatusLabel(announcement.status);
                  const location = getLocation(announcement.message);
                  const reporterName = announcement.reporterName || 'Chưa có';
                  const reporterAvatar = announcement.reporterAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(reporterName)}&background=3b82f6&color=fff`;
                  
                  const handleViewDetail = () => {
                    setSelectedAnnouncement(announcement);
                    setIsDrawerOpen(true);
                  };
            
            return (
                    <tr key={announcement.id} className="hover:bg-gray-50/80 transition-colors duration-150 border-b border-gray-100 last:border-0">
                      {/* Người báo: Avatar + Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={reporterAvatar} 
                            alt={reporterName}
                            className="w-10 h-10 rounded-full bg-gray-200"
                            onError={(e) => {
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(reporterName)}&background=3b82f6&color=fff`;
                            }}
                          />
                          <span className="text-sm font-medium text-gray-800">{reporterName}</span>
                        </div>
                      </td>

                      {/* Đồ vật: Item Name + Description */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">{announcement.title}</span>
                          <span className="text-xs text-gray-500 line-clamp-1 mt-0.5">{announcement.message}</span>
                        </div>
                      </td>

                      {/* Địa điểm: Icon + Text */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">{location}</span>
                        </div>
                      </td>

                      {/* Thời gian: Icon + Text */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">{formatRelativeTime(announcement.createdAt)}</span>
                        </div>
                      </td>

                      {/* Trạng thái: Badge */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                          announcement.status === 'in_progress' 
                            ? 'bg-orange-50 text-orange-700 border border-orange-100'
                            : announcement.status === 'handled'
                            ? 'bg-green-50 text-green-700 border border-green-100'
                            : 'bg-red-50 text-red-700 border border-red-100'
                        }`}>
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* Thao tác: Detail Link */}
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={handleViewDetail}
                          className="text-sm font-medium text-gray-600 hover:text-gray-900 hover:underline transition-colors"
                        >
                          Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Centered Modal for Detail View */}
      {isDrawerOpen && selectedAnnouncement && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => {
            setIsDrawerOpen(false);
            setSelectedAnnouncement(null);
          }}
        >
          {/* Modal Box */}
          <div 
            className="bg-white w-full max-w-md rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden relative transform transition-all duration-300 ease-out"
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: 'modalAppear 0.3s ease-out forwards'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Chi tiết tin báo</h2>
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  setSelectedAnnouncement(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Body */}
            <div className="max-h-[70vh] overflow-y-auto p-6 space-y-4">
              {/* Thông tin người báo */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">
                  Thông tin người báo
                </label>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <img 
                    src={selectedAnnouncement.reporterAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedAnnouncement.reporterName || 'Chưa có')}&background=3b82f6&color=fff`}
                    alt={selectedAnnouncement.reporterName || 'Chưa có'}
                    className="w-12 h-12 rounded-full bg-gray-200"
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedAnnouncement.reporterName || 'Chưa có')}&background=3b82f6&color=fff`;
                    }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">{selectedAnnouncement.reporterName || 'Chưa có'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>Chưa có số điện thoại</span>
                    </div>
                  </div>
                </div>
                      </div>

              {/* Nội dung sự vụ */}
                      <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">
                  Nội dung sự vụ
                </label>
                <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                  <h3 className="text-base font-semibold text-gray-900">{selectedAnnouncement.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{selectedAnnouncement.message}</p>
                </div>
                      </div>

              {/* Thời gian & Địa điểm */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">
                  Thời gian & Địa điểm
                </label>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Thời gian báo cáo</p>
                      <p className="text-sm font-medium text-gray-900">{formatRelativeTime(selectedAnnouncement.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Địa điểm</p>
                      <p className="text-sm font-medium text-gray-900">{getLocation(selectedAnnouncement.message)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ảnh đính kèm */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">
                  Ảnh đính kèm
                </label>
                <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Chưa có ảnh đính kèm</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  // Placeholder: Handle confirmation
                  alert('Xác nhận đã xử lý tin báo này');
                }}
                className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-bold mb-3 hover:bg-blue-700 transition-colors shadow-sm"
              >
                Xác nhận đã xử lý
              </button>
              <button
                onClick={() => {
                  // Placeholder: Handle contact
                  alert('Liên hệ với người báo');
                }}
                className="w-full border border-gray-200 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Liên hệ người báo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Notification Modal */}
      {isAddModalOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => {
            setIsAddModalOpen(false);
            setNewNotification({
              title: '',
              reporterName: '',
              location: '',
              date: '',
              description: '',
              image: null
            });
          }}
        >
          {/* Modal Box */}
          <div 
            className="bg-white w-full max-w-md rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden relative transform transition-all duration-300 ease-out"
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: 'modalAppear 0.3s ease-out forwards'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Thêm tin báo mới</h2>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setNewNotification({
                    title: '',
                    reporterName: '',
                    location: '',
                    date: '',
                    description: '',
                    image: null
                  });
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Body */}
            <div className="max-h-[70vh] overflow-y-auto p-6 space-y-4">
              {/* Đồ vật bị mất */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                  Đồ vật bị mất
                </label>
                <input
                  type="text"
                  value={newNotification.title}
                  onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                  placeholder="Nhập tên đồ vật bị mất"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Người báo */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                  Người báo
                </label>
                <input
                  type="text"
                  value={newNotification.reporterName}
                  onChange={(e) => setNewNotification({ ...newNotification, reporterName: e.target.value })}
                  placeholder="Nhập tên người báo"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Địa điểm */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                  Địa điểm
                </label>
                <input
                  type="text"
                  value={newNotification.location}
                  onChange={(e) => setNewNotification({ ...newNotification, location: e.target.value })}
                  placeholder="Nhập địa điểm mất đồ"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Ngày xảy ra */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                  Ngày xảy ra
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <input
                    type="date"
                    value={newNotification.date}
                    onChange={(e) => setNewNotification({ ...newNotification, date: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Mô tả chi tiết */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                  Mô tả chi tiết
                </label>
                <textarea
                  value={newNotification.description}
                  onChange={(e) => setNewNotification({ ...newNotification, description: e.target.value })}
                  placeholder="Nhập mô tả chi tiết về đồ vật bị mất..."
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Tải ảnh lên */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                  Tải ảnh lên
                </label>
                <div className="w-full h-32 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setNewNotification({ ...newNotification, image: file });
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      {newNotification.image ? newNotification.image.name : 'Click để tải ảnh lên'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setNewNotification({
                    title: '',
                    reporterName: '',
                    location: '',
                    date: '',
                    description: '',
                    image: null
                  });
                }}
                className="flex-1 border border-gray-200 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  // Placeholder: Handle form submission
                  alert('Đăng tin báo thành công!');
                  setIsAddModalOpen(false);
                  setNewNotification({
                    title: '',
                    reporterName: '',
                    location: '',
                    date: '',
                    description: '',
                    image: null
                  });
                }}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-sm"
              >
                Đăng tin báo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

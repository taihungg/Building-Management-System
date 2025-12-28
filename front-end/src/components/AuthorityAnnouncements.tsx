import React, { useState, useEffect } from 'react';
import { Bell, AlertCircle, Search, FileText, Clock, CheckCircle, Loader, MapPin, ArrowRight, Package, Search as SearchIcon, CheckCircle2, Truck, Laptop, Wallet, Key, ChevronRight, X, Phone, User, Upload } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
// import { getAnnouncements, subscribe as subscribeAnnouncements, type Announcement } from '../utils/announcements'; 
// import { formatRelativeTime } from '../utils/timeUtils'; // Giả định hàm này được định nghĩa

// --- MOCK DATA TYPE (Nếu bạn đang sử dụng TypeScript) ---
interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'lost_item'; // Chỉ lọc loại này
  status: 'pending' | 'in_progress' | 'handled'; // 3 trạng thái theo API: UNPROCESSED, PROCESSING, PROCESSED
  createdAt: Date;
  date: string; // Ngày sự kiện (mất đồ)
  reporterName?: string; // Tên người báo
  reporterAvatar?: string; // Avatar người báo
  roomNumber?: number; // Số phòng từ API
}
// -----------------------------------------------------------



// --- Hàm giả lập formatRelativeTime (Nếu bạn chưa định nghĩa) ---
const formatRelativeTime = (date: Date, currentTime: Date = new Date()): string => {
  const now = currentTime;
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) {
    return 'Vừa xong';
  }
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
  const [editingStatusId, setEditingStatusId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date()); // State để cập nhật thời gian thực

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      // Fetch all issues (vì type STATE chưa có data, dùng tất cả hoặc SECURITY)
      // Có thể thay đổi thành ?type=SECURITY nếu chỉ muốn security issues
      const response = await fetch('http://localhost:8081/api/issues');
      if (!response.ok) {
        throw new Error('Không thể tải danh sách tin báo');
      }
      const res = await response.json();
      console.log('API Response:', res);
      const issues = res.data || []; // Lấy array từ response.data
      console.log('Issues array:', issues.length, issues);

      // Filter để chỉ lấy SECURITY hoặc STATE issues
      const filteredIssues = issues.filter((issue: any) =>
        issue.type === 'SECURITY' || issue.type === 'STATE'
      );
      console.log('Filtered SECURITY/STATE:', filteredIssues.length, filteredIssues);

      // Map IssueSummary to Announcement format
      // Sử dụng createdDate từ API nếu có, nếu không thì dùng thời gian hiện tại
      const mappedAnnouncements: Announcement[] = filteredIssues.map((issue: any) => {
        // Sử dụng createdDate từ API nếu có
        const createdAt = issue.createdDate
          ? new Date(issue.createdDate)
          : new Date(); // Fallback về thời gian hiện tại nếu không có

        return {
          id: issue.id,
          title: issue.title,
          message: issue.description || '',
          type: 'lost_item',
          status: mapIssueStatusToAnnouncementStatus(issue.status),
          createdAt: createdAt,
          date: createdAt.toISOString().split('T')[0],
          reporterName: issue.reporterName || '',
          reporterAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(issue.reporterName || '')}&background=3b82f6&color=fff`,
          roomNumber: issue.roomNumber
        };
      });

      // Sort by createdAt descending
      const sortedData = mappedAnnouncements.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      console.log('Announcements - Fetched:', issues.length, 'total issues');
      console.log('Announcements - Filtered:', filteredIssues.length, 'SECURITY/STATE issues');
      console.log('Announcements - Mapped:', sortedData.length, 'announcements');
        setAnnouncements(sortedData);
    } catch (err: any) {
      console.error('Error fetching announcements:', err);
      setAnnouncements([]);
    } finally {
        setIsLoading(false);
    }
  };

  // Map IssueStatus to Announcement status
  const mapIssueStatusToAnnouncementStatus = (issueStatus: string): 'pending' | 'in_progress' | 'handled' => {
    switch (issueStatus) {
      case 'UNPROCESSED':
        return 'pending';
      case 'PROCESSING':
        return 'in_progress';
      case 'PROCESSED':
        return 'handled';
      default:
        return 'pending';
    }
  };

  // Map Announcement status to IssueStatus
  const mapAnnouncementStatusToIssueStatus = (announcementStatus: 'pending' | 'in_progress' | 'handled'): string => {
    switch (announcementStatus) {
      case 'pending':
        return 'UNPROCESSED';
      case 'in_progress':
        return 'PROCESSING';
      case 'handled':
        return 'PROCESSED';
      default:
        return 'UNPROCESSED';
    }
  };

  // Cập nhật thời gian thực mỗi phút để hiển thị thời gian tương đối chính xác
  useEffect(() => {
    setCurrentTime(new Date()); // Cập nhật ngay lập tức
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Cập nhật mỗi 60 giây (1 phút)

    return () => clearInterval(interval);
  }, []);

  // Helper function để format thời gian với currentTime
  const formatTime = (date: Date) => formatRelativeTime(date, currentTime);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (editingStatusId && !target.closest('.status-dropdown-container')) {
        setEditingStatusId(null);
      }
    };

    if (editingStatusId) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [editingStatusId]);

  // Calculate statistics - 3 trạng thái
  const stats = {
    pending: announcements.filter(a => a.status === 'pending').length,
    inProgress: announcements.filter(a => a.status === 'in_progress').length,
    handled: announcements.filter(a => a.status === 'handled').length,
  };

  const filteredAnnouncements = announcements.filter(ann => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      ann.title.toLowerCase().includes(searchLower) ||
      ann.message.toLowerCase().includes(searchLower)
    );
    
    // Status filter
    const matchesStatus = selectedStatus === 'all' || 
      (selectedStatus === 'pending' && ann.status === 'pending') ||
      (selectedStatus === 'in_progress' && ann.status === 'in_progress') ||
      (selectedStatus === 'handled' && ann.status === 'handled');
    
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
      case 'pending':
        return 'bg-gray-100 text-gray-800 border-gray-300'; // Chưa xử lý (Xám)
      case 'in_progress':
        return 'bg-orange-100 text-orange-800 border-orange-300'; // Đang xử lý (Cam)
      case 'handled':
        return 'bg-green-100 text-green-800 border-green-300'; // Đã xử lý (Xanh lá)
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // 🔥 CẬP NHẬT LOGIC: Get Label và Icon dựa trên STATUS
  const getStatusLabel = (status: Announcement['status']) => {
    switch (status) {
      case 'pending':
        return { label: 'Chưa xử lý', Icon: Bell, cardBorder: 'hover:border-gray-400' };
      case 'in_progress':
        return { label: 'Đang xử lý', Icon: Loader, cardBorder: 'hover:border-orange-400' };
      case 'handled':
        return { label: 'Đã xử lý', Icon: CheckCircle, cardBorder: 'hover:border-green-400' };
      default:
        return { label: 'Chưa xử lý', Icon: Bell, cardBorder: 'hover:border-gray-400' };
    }
  };


  // Get category for each item
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

  // Get location from message and roomNumber
  const getLocation = (message: string, roomNumber?: number) => {
    const messageLower = message?.toLowerCase() || '';

    // Tìm từ khóa trong description
    if (messageLower.includes('sảnh')) return 'Sảnh';
    if (messageLower.includes('sân chơi')) return 'Sân chơi';
    if (messageLower.includes('gym') || messageLower.includes('phòng gym')) return 'Phòng gym';
    if (messageLower.includes('hồ bơi')) return 'Hồ bơi';
    if (messageLower.includes('bãi giữ xe')) return 'Bãi giữ xe';
    if (messageLower.includes('thang máy')) return 'Thang máy';
    if (messageLower.includes('hành lang')) return 'Hành lang';
    if (messageLower.includes('lối vào')) return 'Lối vào';

    // Nếu có roomNumber, có thể suy ra khu vực (ví dụ: tầng 9 = room 900-999)
    if (roomNumber) {
      const floor = Math.floor(roomNumber / 100);
      if (floor > 0) {
        return `Tầng ${floor}`;
      }
    }

    // Mặc định: Khu vực chung (các khu vực công cộng không xác định)
    return 'Khu vực chung';
  };

  // Handle status update
  const handleStatusUpdate = async (announcementId: string, newStatus: 'pending' | 'in_progress' | 'handled') => {
    try {
      const issueStatus = mapAnnouncementStatusToIssueStatus(newStatus);
      const response = await fetch(`http://localhost:8081/api/issues/${announcementId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: issueStatus }),
      });

      if (!response.ok) {
        throw new Error('Không thể cập nhật trạng thái');
      }

      // Update local state
      setAnnouncements(prev =>
        prev.map(ann =>
          ann.id === announcementId
            ? { ...ann, status: newStatus }
            : ann
        )
      );
      setEditingStatusId(null);
    } catch (err: any) {
      console.error('Error updating status:', err);
      alert('Không thể cập nhật trạng thái: ' + (err.message || 'Lỗi không xác định'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý an ninh</h1>
        </div>
      </div>

      {/* Stats Header - 3 Cards */}
      <div className="grid grid-cols-3 gap-4">
        {/* Card 1: Chưa xử lý (Gray) */}
        <div className="flex justify-between items-center p-6 rounded-xl shadow-md h-32 relative overflow-hidden" style={{ backgroundColor: '#6b7280' }}>
          <div className="flex flex-col">
            <p className="text-4xl font-bold text-white">{stats.pending}</p>
            <p className="text-sm font-medium mt-1 text-white">Chưa xử lý</p>
          </div>
          <Bell className="h-12 w-12 text-white opacity-80" />
        </div>

        {/* Card 2: Đang xử lý (Orange) */}
        <div className="flex justify-between items-center p-6 rounded-xl shadow-md h-32 relative overflow-hidden" style={{ backgroundColor: '#f59e0b' }}>
          <div className="flex flex-col">
            <p className="text-4xl font-bold text-white">{stats.inProgress}</p>
            <p className="text-sm font-medium mt-1 text-white">Đang xử lý</p>
          </div>
          <Loader className="h-12 w-12 text-white opacity-80" />
        </div>

        {/* Card 3: Đã xử lý (Green) */}
        <div className="flex justify-between items-center p-6 rounded-xl shadow-md h-32 relative overflow-hidden" style={{ backgroundColor: '#10b981' }}>
          <div className="flex flex-col">
            <p className="text-4xl font-bold text-white">{stats.handled}</p>
            <p className="text-sm font-medium mt-1 text-white">Đã xử lý</p>
          </div>
          <CheckCircle2 className="h-12 w-12 text-white opacity-80" />
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
            <style>{`
              [data-slot="select-content"] [data-slot="select-item"] > span:first-child {
                display: none !important;
              }
            `}</style>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="h-12 px-4 bg-white border border-gray-200 rounded-xl text-sm hover:border-blue-400 transition-all w-full">
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent
                align="start"
                style={{ width: 'calc(13ch + 5.5rem)', backgroundColor: '#ffffff' }}
                className="rounded-xl border border-gray-200 !bg-white shadow-xl ring-1 ring-gray-200/70 z-50"
              >
                <SelectItem className="cursor-pointer rounded-lg px-3 py-2 text-sm text-gray-700 outline-none data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-700 data-[state=checked]:bg-blue-100 data-[state=checked]:font-semibold data-[state=checked]:text-blue-800 pr-3" value="all">Tất cả trạng thái</SelectItem>
                <SelectItem className="cursor-pointer rounded-lg px-3 py-2 text-sm text-gray-700 outline-none data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-700 data-[state=checked]:bg-blue-100 data-[state=checked]:font-semibold data-[state=checked]:text-blue-800 pr-3" value="pending">Chưa xử lý</SelectItem>
                <SelectItem className="cursor-pointer rounded-lg px-3 py-2 text-sm text-gray-700 outline-none data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-700 data-[state=checked]:bg-blue-100 data-[state=checked]:font-semibold data-[state=checked]:text-blue-800 pr-3" value="in_progress">Đang xử lý</SelectItem>
                <SelectItem className="cursor-pointer rounded-lg px-3 py-2 text-sm text-gray-700 outline-none data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-700 data-[state=checked]:bg-blue-100 data-[state=checked]:font-semibold data-[state=checked]:text-blue-800 pr-3" value="handled">Đã xử lý</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Dropdown */}
          <div style={{ width: 'calc(12ch + 5.5rem)' }}>
            <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
              <SelectTrigger className="h-12 px-4 bg-white border border-gray-200 rounded-xl text-sm hover:border-blue-400 transition-all w-full">
                <SelectValue placeholder="Tất cả thời gian" />
              </SelectTrigger>
              <SelectContent
                align="start"
                style={{ width: 'calc(12ch + 5.5rem)', backgroundColor: '#ffffff' }}
                className="rounded-xl border border-gray-200 !bg-white shadow-xl ring-1 ring-gray-200/70 z-50"
              >
                <SelectItem className="cursor-pointer rounded-lg px-3 py-2 text-sm text-gray-700 outline-none data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-700 data-[state=checked]:bg-blue-100 data-[state=checked]:font-semibold data-[state=checked]:text-blue-800 pr-3" value="all">Tất cả thời gian</SelectItem>
                <SelectItem className="cursor-pointer rounded-lg px-3 py-2 text-sm text-gray-700 outline-none data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-700 data-[state=checked]:bg-blue-100 data-[state=checked]:font-semibold data-[state=checked]:text-blue-800 pr-3" value="today">Hôm nay</SelectItem>
                <SelectItem className="cursor-pointer rounded-lg px-3 py-2 text-sm text-gray-700 outline-none data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-700 data-[state=checked]:bg-blue-100 data-[state=checked]:font-semibold data-[state=checked]:text-blue-800 pr-3" value="7days">7 ngày qua</SelectItem>
                <SelectItem className="cursor-pointer rounded-lg px-3 py-2 text-sm text-gray-700 outline-none data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-700 data-[state=checked]:bg-blue-100 data-[state=checked]:font-semibold data-[state=checked]:text-blue-800 pr-3" value="month">Tháng này</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
          <p className="text-gray-600 text-lg">Không có sự cố an ninh nào khớp với tìm kiếm.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-visible">
          <div className="overflow-x-auto overflow-y-visible">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Người báo</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Đồ vật</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Địa điểm</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Thời gian</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
          {filteredAnnouncements.map((announcement) => {
            const statusInfo = getStatusLabel(announcement.status);
                  const location = getLocation(announcement.message, announcement.roomNumber);
                  const reporterName = announcement.reporterName || 'Chưa có';
                  const reporterAvatar = announcement.reporterAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(reporterName)}&background=3b82f6&color=fff`;
            
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
                          <span className="text-sm text-gray-700">{formatTime(announcement.createdAt)}</span>
                        </div>
                      </td>

                      {/* Trạng thái: Clickable Badge with Dropdown */}
                      <td className="px-6 py-4 overflow-visible relative z-10">
                        <div className="relative status-dropdown-container">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingStatusId(editingStatusId === announcement.id ? null : announcement.id);
                            }}
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium cursor-pointer transition-all hover:shadow-md ${
                              announcement.status === 'pending'
                                ? 'bg-gray-100 text-gray-800 border border-gray-300'
                                : announcement.status === 'in_progress'
                                ? 'bg-orange-100 text-orange-800 border border-orange-300'
                            : announcement.status === 'handled'
                                ? 'bg-green-100 text-green-800 border border-green-300'
                                : 'bg-red-100 text-red-800 border border-red-300'
                            }`}
                          >
                          {statusInfo.label}
                          </button>

                          {/* Dropdown Menu */}
                          {editingStatusId === announcement.id && (
                            <div
                              className="absolute left-0 top-full mt-2 rounded-lg min-w-[180px] overflow-hidden"
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #e5e7eb',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                                opacity: 1,
                                position: 'absolute',
                                background: '#ffffff',
                                backdropFilter: 'none',
                                WebkitBackdropFilter: 'none',
                                isolation: 'isolate',
                                zIndex: 9999
                              }}
                            >
                              <div style={{ backgroundColor: '#ffffff', width: '100%', height: '100%' }}>
                        <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusUpdate(announcement.id, 'pending');
                                }}
                                className="w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2"
                                style={{
                                  backgroundColor: announcement.status === 'pending' ? '#f3f4f6' : '#ffffff',
                                  opacity: 1,
                                  background: announcement.status === 'pending' ? '#f3f4f6' : '#ffffff'
                                }}
                                onMouseEnter={(e) => {
                                  if (announcement.status !== 'pending') {
                                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                                    e.currentTarget.style.background = '#f3f4f6';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (announcement.status !== 'pending') {
                                    e.currentTarget.style.backgroundColor = '#ffffff';
                                    e.currentTarget.style.background = '#ffffff';
                                  }
                                }}
                              >
                                <span className="w-2 h-2 rounded-full bg-gray-500" style={{ backgroundColor: '#6b7280', opacity: 1 }}></span>
                                <span className={announcement.status === 'pending' ? 'font-semibold text-gray-800' : 'text-gray-700'} style={{ opacity: 1 }}>
                                  Chưa xử lý
                                </span>
                        </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusUpdate(announcement.id, 'in_progress');
                                }}
                                className="w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2"
                                style={{
                                  backgroundColor: announcement.status === 'in_progress' ? '#fff7ed' : '#ffffff',
                                  opacity: 1,
                                  background: announcement.status === 'in_progress' ? '#fff7ed' : '#ffffff'
                                }}
                                onMouseEnter={(e) => {
                                  if (announcement.status !== 'in_progress') {
                                    e.currentTarget.style.backgroundColor = '#fff7ed';
                                    e.currentTarget.style.background = '#fff7ed';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (announcement.status !== 'in_progress') {
                                    e.currentTarget.style.backgroundColor = '#ffffff';
                                    e.currentTarget.style.background = '#ffffff';
                                  }
                                }}
                              >
                                <span className="w-2 h-2 rounded-full bg-orange-500" style={{ backgroundColor: '#f97316', opacity: 1 }}></span>
                                <span className={announcement.status === 'in_progress' ? 'font-semibold text-orange-800' : 'text-gray-700'} style={{ opacity: 1 }}>
                                  Đang xử lý
                                </span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusUpdate(announcement.id, 'handled');
                                }}
                                className="w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2"
                                style={{
                                  backgroundColor: announcement.status === 'handled' ? '#f0fdf4' : '#ffffff',
                                  opacity: 1,
                                  background: announcement.status === 'handled' ? '#f0fdf4' : '#ffffff'
                                }}
                                onMouseEnter={(e) => {
                                  if (announcement.status !== 'handled') {
                                    e.currentTarget.style.backgroundColor = '#f0fdf4';
                                    e.currentTarget.style.background = '#f0fdf4';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (announcement.status !== 'handled') {
                                    e.currentTarget.style.backgroundColor = '#ffffff';
                                    e.currentTarget.style.background = '#ffffff';
                                  }
                                }}
                              >
                                <span className="w-2 h-2 rounded-full bg-green-500" style={{ backgroundColor: '#22c55e', opacity: 1 }}></span>
                                <span className={announcement.status === 'handled' ? 'font-semibold text-green-800' : 'text-gray-700'} style={{ opacity: 1 }}>
                                  Đã xử lý
                                </span>
                              </button>
                              </div>
                            </div>
                          )}
                        </div>
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
                      <p className="text-sm font-medium text-gray-900">{formatTime(selectedAnnouncement.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Địa điểm</p>
                      <p className="text-sm font-medium text-gray-900">{getLocation(selectedAnnouncement.message, selectedAnnouncement.roomNumber)}</p>
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

    </div>
  );
}
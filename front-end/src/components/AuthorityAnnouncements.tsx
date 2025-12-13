import React, { useState, useEffect } from 'react';
import { Bell, AlertCircle, Search, FileText, Clock, CheckCircle, Loader } from 'lucide-react';
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
}
// -----------------------------------------------------------


// --- MOCK DATA THÔNG BÁO MẤT ĐỒ CHI TIẾT DỰA TRÊN THỐNG KÊ DASHBOARD ---
const MOCK_LOST_ITEMS_DATA: Announcement[] = [
  // Đã xử lý (handled): 8 mục
  { id: '1', title: 'Mất ví da đen', message: 'Mất ví da màu đen tại khu vực sảnh tầng 1 vào chiều thứ 6.', type: 'lost_item', status: 'handled', createdAt: new Date('2025-12-05T10:00:00Z'), date: '04/12/2025' },
  { id: '2', title: 'Thất lạc chìa khóa', message: 'Chùm chìa khóa có móc hình cá heo bị rơi gần khu vực thang máy.', type: 'lost_item', status: 'handled', createdAt: new Date('2025-12-04T15:30:00Z'), date: '04/12/2025' },
  { id: '3', title: 'Mất điện thoại Samsung', message: 'Điện thoại Samsung S21 màu tím bị mất ở khu vực phòng gym.', type: 'lost_item', status: 'handled', createdAt: new Date('2025-12-03T11:45:00Z'), date: '03/12/2025' },
  { id: '4', title: 'Thẻ cư dân bị rơi', message: 'Mất thẻ cư dân A101.', type: 'lost_item', status: 'handled', createdAt: new Date('2025-12-01T08:00:00Z'), date: '01/12/2025' },
  { id: '5', title: 'Đồng hồ thông minh', message: 'Mất đồng hồ Fitbit màu xanh trong bãi giữ xe.', type: 'lost_item', status: 'handled', createdAt: new Date('2025-11-28T16:00:00Z'), date: '28/11/2025' },
  { id: '6', title: 'Tai nghe AirPods', message: 'Mất hộp tai nghe AirPods Pro tại khu vực hồ bơi.', type: 'lost_item', status: 'handled', createdAt: new Date('2025-11-25T14:30:00Z'), date: '25/11/2025' },
  { id: '7', title: 'Cặp sách học sinh', message: 'Mất cặp sách màu hồng, bên trong có sách vở lớp 3.', type: 'lost_item', status: 'handled', createdAt: new Date('2025-11-22T09:00:00Z'), date: '22/11/2025' },
  { id: '8', title: 'Mất thẻ ngân hàng', message: 'Mất thẻ Vietcombank tại sảnh tòa nhà B.', type: 'lost_item', status: 'handled', createdAt: new Date('2025-11-20T18:00:00Z'), date: '20/11/2025' },
  
  // Đang xử lý (in_progress): 3 mục (Mới hơn)
  { id: '9', title: 'Mất ô tô đồ chơi', message: 'Ô tô điều khiển từ xa màu đỏ bị mất ở khu vực sân chơi trẻ em.', type: 'lost_item', status: 'in_progress', createdAt: new Date('2025-12-12T19:00:00Z'), date: '12/12/2025' },
  { id: '10', title: 'Mất kính cận', message: 'Kính cận gọng màu bạc, bị rơi trên đường đi bộ tầng 3.', type: 'lost_item', status: 'in_progress', createdAt: new Date('2025-12-11T17:40:00Z'), date: '11/12/2025' },
  { id: '11', title: 'Ba lô laptop', message: 'Mất ba lô đựng laptop màu xám, có logo công ty X.', type: 'lost_item', status: 'in_progress', createdAt: new Date('2025-12-09T09:30:00Z'), date: '09/12/2025' },

  // Không tìm thấy (not_found): 2 mục
  { id: '12', title: 'Nhẫn vàng trắng', message: 'Mất nhẫn cưới vàng trắng, không có khắc tên.', type: 'lost_item', status: 'not_found', createdAt: new Date('2025-11-15T10:00:00Z'), date: '15/11/2025' },
  { id: '13', title: 'Giấy tờ tùy thân', message: 'Mất toàn bộ giấy tờ cá nhân bao gồm CCCD và Bằng lái xe.', type: 'lost_item', status: 'not_found', createdAt: new Date('2025-11-10T12:00:00Z'), date: '10/11/2025' },
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
  const [isLoading, setIsLoading] = useState(true);

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

  const filteredAnnouncements = announcements.filter(ann => {
    const searchLower = searchTerm.toLowerCase();
    return (
      ann.title.toLowerCase().includes(searchLower) ||
      ann.message.toLowerCase().includes(searchLower)
    );
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


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Thông Báo Mất Đồ</h1>
          <p className="text-gray-600 mt-1">Theo dõi, phân loại và xử lý các thông báo về đồ vật bị mất</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tiêu đề hoặc nội dung..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
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
        <div className="space-y-4">
          {filteredAnnouncements.map((announcement) => {
            const statusInfo = getStatusLabel(announcement.status);
            const StatusIcon = statusInfo.Icon;
            
            return (
              <div
                key={announcement.id}
                // 🔥 Cập nhật border theo trạng thái
                className={`bg-white rounded-2xl p-6 border-2 border-gray-200 ${statusInfo.cardBorder} transition-all shadow-sm hover:shadow-lg`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {/* 🔥 Cập nhật màu nền và Icon theo trạng thái */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getStatusColor(announcement.status)}`}>
                        <StatusIcon className={`w-5 h-5 ${getStatusColor(announcement.status).replace('bg', 'text').replace('-100', '-600')}`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{announcement.title}</h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Clock className="w-4 h-4" /> {formatRelativeTime(announcement.createdAt)}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{announcement.message}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      {/* 🔥 Hiển thị Status Tag */}
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(announcement.status)}`}>
                        {statusInfo.label}
                      </span>
                      {/* Ngày sự kiện */}
                      <span className="text-xs text-gray-500">
                        Ngày xảy ra: <span className="font-medium text-gray-700">{announcement.date}</span>
                      </span>
                      {/* Thêm nút hành động (Mock) */}
                      <button className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                            Xem chi tiết & Xử lý →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
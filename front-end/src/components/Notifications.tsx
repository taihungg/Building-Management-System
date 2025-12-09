import { useState, useEffect } from 'react';
import { Plus, Bell, AlertCircle, Info, Wrench, Users, Clock } from 'lucide-react';
import { toast } from 'sonner';
import React from 'react';

// Định nghĩa các biểu tượng và màu sắc (chủ yếu dùng cho giao diện Admin Sent History)
const typeColors = {
  GENERAL: 'blue',
  ALERT: 'orange',
};
const typeIcons = {
    GENERAL: Bell,
    ALERT: AlertCircle,
};


export function Notifications() { // Giữ nguyên tên component là Notifications theo yêu cầu
  // State
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State giả lập để giữ lại cấu trúc cũ (Không cần thiết cho Sent History nhưng giữ để code không lỗi)
  const [readAnnouncementIds, setReadAnnouncementIds] = useState(new Set()); 


  // --- HÀM GỌI API ---
  const fetchAnnouncements = async () => {
    setIsLoading(true);
    setError(null);
    try {
        // API GET /api/announcements
        const response = await fetch('http://localhost:8081/api/announcements'); 
        
        if (!response.ok) {
            throw new Error("Không thể lấy danh sách thông báo đã gửi.");
        }
        
        const rawData = await response.json();
        
        // --- CHUYỂN ĐỔI DỮ LIỆU SENT ANNOUNCEMENTS ---
        const transformedData = rawData.map(announcement => {
            // Mặc định là General và icon Bell
            const type = 'GENERAL'; 
            const Icon = typeIcons[type];
            const color = typeColors[type];
            
            // Format thời gian hiển thị
            const dateTime = new Date(announcement.createdAt);
            const timeFormatted = dateTime.toLocaleDateString('vi-VN') + ' ' + dateTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

            return {
                id: announcement.id,
                title: announcement.title,
                message: announcement.message, 
                
                // THÔNG TIN BỔ SUNG TỪ API
                sender: announcement.senderName,
                receiverCount: announcement.receiverCount,
                
                // Giả lập trạng thái đã đọc/loại thông báo
                read: true, // Mặc định là đã gửi
                type: type, 
                icon: Icon,
                color: color,
                time: timeFormatted,
            };
        });

        setAnnouncements(transformedData);
        
    } catch (err) {
        setError(err.message);
        toast.error("Lỗi tải lịch sử thông báo", { description: err.message });
    } finally {
        setIsLoading(false);
    }
  };

  // --- HOOK TẢI DỮ LIỆU ---
  useEffect(() => {
    fetchAnnouncements();
  }, []); 

  // Tính toán Stats
  const totalSentAnnouncements = announcements.length;
  const totalReceivers = announcements.reduce((sum, ann) => sum + ann.receiverCount, 0);
  const avgReceivers = totalSentAnnouncements > 0 
                       ? Math.round(totalReceivers / totalSentAnnouncements) 
                       : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          {/* Tên trang phù hợp với dữ liệu Admin đã gửi */}
          <h1 className="text-3xl text-slate-900">Lịch Sử Thông Báo Đã Gửi</h1>
          <p className="text-slate-500 mt-1">Theo dõi các thông báo đã được Ban Quản Lý gửi đi</p>
        </div>
        {/* Nút Tạo thông báo mới (Logic cần được bổ sung) */}
        <button 
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all"
          onClick={() => { toast.info("Tính năng tạo thông báo mới"); }}
        >
          <Plus className="w-5 h-5" />
          Tạo Thông Báo Mới
        </button>
      </div>

      <hr/>

      {/* Stats GRID MỚI */}
      <div className="grid grid-cols-3 gap-6">
        {/* Tổng số thông báo đã gửi */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-slate-500 text-sm">Tổng số TB đã gửi</p>
          </div>
          <p className="text-2xl text-slate-900">{totalSentAnnouncements}</p>
        </div>

        {/* Tổng số người nhận */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-slate-500 text-sm">Tổng số người nhận</p>
          </div>
          <p className="text-2xl text-slate-900">{totalReceivers}</p>
        </div>

        {/* Người nhận trung bình */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Info className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-slate-500 text-sm">Người nhận TB</p>
          </div>
          <p className="text-2xl text-slate-900">{avgReceivers}</p>
        </div>
      </div>

      <hr/>
      
      {/* Notifications List (Hiển thị Lịch sử) */}
      <div className="space-y-3">
        {isLoading && <p className="text-center py-5 text-blue-500">Đang tải lịch sử thông báo...</p>}
        {error && <p className="text-center py-5 text-red-500">Lỗi: {error}</p>}
        
        {!isLoading && announcements.length > 0 ? announcements.map((announcement) => {
          const Icon = announcement.icon; 
          
          return (
            <div 
              key={announcement.id} 
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 transition-all hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                {/* Icon và màu xanh cho Sent Announcement */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-1">
                    <h3 className="text-slate-900 font-semibold">{announcement.title}</h3>
                    {/* Thời gian gửi */}
                    <span className="text-sm text-slate-500 whitespace-nowrap flex items-center gap-1">
                        <Clock className="w-4 h-4" /> {announcement.time}
                    </span>
                  </div>
                  <p className="text-slate-600 mb-2">{announcement.message}</p>
                  
                  {/* THÔNG TIN BỔ SUNG */}
                  <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
                    <span>Gửi bởi: <span className="text-slate-700 font-medium">{announcement.sender}</span></span>
                    <span>Đã gửi đến: <span className="text-slate-700 font-medium">{announcement.receiverCount} cư dân</span></span>
                  </div>
                </div>
              </div>
            </div>
          );
        }) : (
            !isLoading && <p className="text-center py-10 text-slate-500">Chưa có thông báo nào được gửi.</p>
        )}
      </div>
    </div>
  );
}
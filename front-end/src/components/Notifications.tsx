import { useState, useEffect, useCallback } from 'react'; 
import { Plus, Bell, AlertCircle, Info, Users, Clock, Loader2, ListChecks } from 'lucide-react'; // Đã thêm ListChecks
import { toast } from 'sonner';
import React from 'react';
import { Modal } from './Modal'; 

// Định nghĩa các biểu tượng và màu sắc
const typeColors = {
  GENERAL: 'blue',
  ALERT: 'orange',
};
const typeIcons = {
    GENERAL: Bell,
    ALERT: AlertCircle,
};

// --- MOCK Button Component ---
const Button = ({ children, onClick, className, disabled = false }) => (
    <button 
        onClick={onClick} 
        disabled={disabled}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
        {children}
    </button>
);
// --- END MOCK Button ---

// --- TARGET TYPE SELECTS ---
const TARGET_TYPES = [
    { label: 'Tất cả cư dân', value: 'ALL' },
    { label: 'Theo Tòa nhà', value: 'BUILDING' },
    { label: 'Theo Tầng (Tòa nhà)', value: 'FLOOR' },
    // 🔥 ĐÃ THÊM TARGET TYPE MỚI
    { label: 'Theo Cá nhân', value: 'RESIDENTS' }, 
];
// --- END TARGET TYPE ---


export function Notifications() { 
  const DEFAULT_SENDER_ID = 'a2ca2e25-4443-496b-a457-46539af501cc'; 
  
  // State chung
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State cho Tòa nhà
  const [buildings, setBuildings] = useState([]);
  const [isBuildingsLoading, setIsBuildingsLoading] = useState(false);

  // 🔥 State cho Cư dân
  const [residents, setResidents] = useState([]);
  const [isResidentsLoading, setIsResidentsLoading] = useState(false);
  
  // State cho Modal và Form Tạo thông báo
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    message: '',
    senderId: DEFAULT_SENDER_ID, 
    targetType: 'ALL', 
    buildingId: '', 
    floor: 0,
    residentIds: [], // Danh sách ID cư dân được chọn
  });
  
  // --- HÀM GỌI API LẤY DANH SÁCH TÒA NHÀ ---
  const fetchBuildings = useCallback(async () => {
    setIsBuildingsLoading(true);
    try {
        const response = await fetch('http://localhost:8081/api/v1/buildings/dropdown?keyword='); 
        
        if (!response.ok) {
            throw new Error("Không thể tải danh sách Tòa nhà.");
        }
        
        const res = await response.json();
        const data = res.data || [];
        
        const allOption = { id: 'ALL', label: 'Tất cả Tòa nhà', value: 'ALL' }; 
        const combinedBuildings = [allOption, ...data.map(b => ({ id: b.id, label: b.name, value: b.id }))];
        
        setBuildings(combinedBuildings);
        
        if (newAnnouncement.buildingId === '') {
            setNewAnnouncement(prev => ({
                ...prev,
                buildingId: combinedBuildings[0].id // Đặt mặc định là 'ALL'
            }));
        }
        
    } catch (err) {
        toast.error("Lỗi tải Tòa nhà", { description: err.message });
        setBuildings([]);
    } finally {
        setIsBuildingsLoading(false);
    }
  }, [newAnnouncement.buildingId]);

  // 🔥 HÀM GỌI API LẤY DANH SÁCH CƯ DÂN
  const fetchResidents = useCallback(async () => {
    setIsResidentsLoading(true);
    try {
        // Sử dụng API bạn cung cấp
        const response = await fetch('http://localhost:8081/api/v1/residents'); 
        
        if (!response.ok) {
            throw new Error("Không thể tải danh sách Cư dân.");
        }
        
        const res = await response.json();
        const data = res.data || [];
        
        // Chuyển đổi dữ liệu để sử dụng trong list chọn
        const residentList = data.map(r => ({
            id: r.id, 
            name: `${r.fullName} (P.${r.roomNumber ?? 'N/A'})` 
        }));
        
        setResidents(residentList);
        
    } catch (err) {
        toast.error("Lỗi tải Cư dân", { description: err.message });
        setResidents([]);
    } finally {
        setIsResidentsLoading(false);
    }
  }, []);


  // --- HÀM TẢI DỮ LIỆU LỊCH SỬ THÔNG BÁO ---
  const fetchAnnouncements = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
        const response = await fetch('http://localhost:8081/api/v1/announcements/staff/all?page=0&size=1000'); 
        
        if (!response.ok) {
            throw new Error("Không thể lấy danh sách thông báo đã gửi.");
        }
        
        const rawData = await response.json();
        const rawAnnouncements = rawData?.content || [];

        const parseLocalDateTime = (value) => {
            if (!value) return null;
            if (Array.isArray(value)) {
                const [year, month, day, hour = 0, minute = 0, second = 0, nano = 0] = value;
                const millisecond = Math.floor(nano / 1_000_000);
                return new Date(year, month - 1, day, hour, minute, second, millisecond);
            }
            if (typeof value === 'string' || typeof value === 'number') {
                const date = new Date(value);
                return Number.isNaN(date.getTime()) ? null : date;
            }
            if (typeof value === 'object') {
                const year = value.year;
                const month = value.monthValue ?? value.month;
                const day = value.dayOfMonth ?? value.day;
                const hour = value.hour ?? 0;
                const minute = value.minute ?? 0;
                const second = value.second ?? 0;
                const nano = value.nano ?? 0;
                if (typeof year === 'number' && typeof month === 'number' && typeof day === 'number') {
                    const millisecond = Math.floor(nano / 1_000_000);
                    return new Date(year, month - 1, day, hour, minute, second, millisecond);
                }
            }
            return null;
        };
        
        const transformedData = rawAnnouncements.map(announcement => {
            const type = 'GENERAL'; 
            const Icon = typeIcons[type];
            
            const dateTime = parseLocalDateTime(announcement.createdDate);
            const timeFormatted = dateTime
                ? dateTime.toLocaleDateString('vi-VN') + ' ' + dateTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                : 'N/A';

            return {
                id: announcement.id,
                title: announcement.title,
                message: announcement.message, 
                sender: announcement.sender?.fullName || 'BQL Chung cư',
                receiverCount: 0,
                time: timeFormatted,
                icon: Icon,
            };
        });

        setAnnouncements(transformedData);
        
    } catch (err) {
        setError(err.message);
        toast.error("Lỗi tải lịch sử thông báo", { description: err.message });
    } finally {
        setIsLoading(false);
    }
  }, []);

  // --- HOOK TẢI DỮ LIỆU LỊCH SỬ ---
  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]); 

  // --- HÀM TẠO THÔNG BÁO MỚI ---
  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!newAnnouncement.title || !newAnnouncement.message) {
        toast.warning("Vui lòng điền tiêu đề và nội dung.");
        return;
    }
    
    // Kiểm tra residentIds nếu targetType là RESIDENTS
    if (newAnnouncement.targetType === 'RESIDENTS' && newAnnouncement.residentIds.length === 0) {
        toast.warning("Vui lòng chọn ít nhất một cư dân.");
        return;
    }

    setIsSubmitting(true);
    
    const mappedTargetType =
        newAnnouncement.targetType === 'ALL' ? 'ALL'
        : newAnnouncement.targetType === 'BUILDING' ? 'BY_BUILDING'
        : newAnnouncement.targetType === 'FLOOR' ? 'BY_FLOOR'
        : 'SPECIFIC_APARTMENTS';

    if ((mappedTargetType === 'BY_BUILDING' || mappedTargetType === 'BY_FLOOR') && (!newAnnouncement.buildingId || newAnnouncement.buildingId === 'ALL')) {
        toast.warning("Vui lòng chọn một Tòa nhà cụ thể.");
        setIsSubmitting(false);
        return;
    }

    const payload: any = {
        title: newAnnouncement.title,
        message: newAnnouncement.message,
        senderId: newAnnouncement.senderId,
        targetType: mappedTargetType,
        buildingId: null,
        floors: null,
        apartmentIds: null,
        residentIds: null,
        targetDetail: '',
    };

    if (mappedTargetType === 'BY_BUILDING') {
        payload.buildingId = newAnnouncement.buildingId;
    } else if (mappedTargetType === 'BY_FLOOR') {
        payload.buildingId = newAnnouncement.buildingId;
        payload.floors = [newAnnouncement.floor];
    } else if (mappedTargetType === 'SPECIFIC_APARTMENTS') {
        payload.residentIds = newAnnouncement.residentIds;
    }

    const submitPromise = new Promise(async (resolve, reject) => {
        try {
            const response = await fetch('http://localhost:8081/api/v1/announcements/staff/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Lỗi: ${response.status} khi gửi thông báo.`);
            }

            await fetchAnnouncements();
            
            resolve("Thông báo đã được gửi thành công!");
            
        } catch (error) {
            reject(error);
        } finally {
            setIsSubmitting(false);
        }
    });
    
    toast.promise(submitPromise, {
        loading: 'Đang gửi thông báo...',
        success: (message) => {
            setIsCreateModalOpen(false); 
            // Reset form
            setNewAnnouncement({
                title: '',
                message: '',
                senderId: DEFAULT_SENDER_ID,
                targetType: 'ALL', 
                buildingId: buildings[0]?.id || '',
                floor: 0,
                residentIds: [],
            });
            return message;
        },
        error: (err) => `Gửi thông báo thất bại: ${err.message}`,
    });
  };

  // --- LOGIC CHỌN CƯ DÂN ---
  const handleResidentSelect = (residentId) => {
    setNewAnnouncement(prev => {
        const selectedIds = new Set(prev.residentIds);
        if (selectedIds.has(residentId)) {
            selectedIds.delete(residentId);
        } else {
            selectedIds.add(residentId);
        }
        return {
            ...prev,
            residentIds: Array.from(selectedIds)
        };
    });
  };

  // --- CÁC HÀM XỬ LÝ UI KHÁC ---
  const totalSentAnnouncements = announcements.length;
  const totalReceivers = announcements.reduce((sum, ann) => sum + (ann.receiverCount || 0), 0);
  const avgReceivers = totalSentAnnouncements > 0 
                       ? Math.round(totalReceivers / totalSentAnnouncements) 
                       : 0;
                       
  // Handler mở Modal (và tải buildings + residents nếu cần)
  const handleOpenCreateModal = () => {
      fetchBuildings();
      fetchResidents(); // 🔥 Tải danh sách cư dân
      setIsCreateModalOpen(true);
  };
  
  // Hàm đóng Modal
  const handleCloseCreateModal = () => {
      setIsCreateModalOpen(false);
      // Reset state form khi đóng
      setNewAnnouncement({
          title: '',
          message: '',
          senderId: DEFAULT_SENDER_ID,
          targetType: 'ALL', 
          buildingId: buildings[0]?.id || '',
          floor: 0,
          residentIds: [],
      });
  }

  // Lọc danh sách buildings chỉ hiển thị các tòa nhà cụ thể
  const specificBuildings = buildings.filter(b => b.id !== 'ALL');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-slate-900">Quản lý thông báo</h1>
          <p className="text-slate-500 mt-1">Theo dõi các thông báo đã được Ban Quản Lý gửi đi</p>
        </div>
       
        {/* NÚT TẠO THÔNG BÁO MỚI */}
        <Button 
            onClick={handleOpenCreateModal}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/50"
        >
            <span className="flex items-center"> 
                <Plus className="w-4 h-4 mr-2" /> 
                Tạo thông báo mới
            </span>
            
        </Button>
      </div>

      <hr/>

      {/* Stats GRID */}
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
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Info className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-slate-500 text-sm">Người nhận TB/TB</p>
          </div>
          <p className="text-2xl text-slate-900">{avgReceivers}</p>
        </div>
        
      </div>

      <hr/>
      
      {/* Notifications List (Hiển thị Lịch sử) */}
      <div className="space-y-3">
        {isLoading && <p className="text-center py-5 text-blue-500 flex items-center justify-center"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Đang tải lịch sử thông báo...</p>}
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
      
      {/* MODAL TẠO THÔNG BÁO MỚI */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        title="Tạo Thông Báo Mới"
      >
        <form onSubmit={handleCreateAnnouncement} className="p-6 space-y-5">
            
            {/* Tiêu đề */}
            <div className="space-y-1">
                <label htmlFor="title" className="text-sm font-medium text-slate-700">Tiêu đề thông báo</label>
                <input
                    id="title"
                    type="text"
                    required
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                    placeholder="Nhập tiêu đề..."
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            {/* Nội dung */}
            <div className="space-y-1">
                <label htmlFor="message" className="text-sm font-medium text-slate-700">Nội dung (Message)</label>
                <textarea
                    id="message"
                    required
                    rows="4"
                    value={newAnnouncement.message}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, message: e.target.value})}
                    placeholder="Nhập nội dung thông báo chi tiết..."
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
            </div>
            
            <hr/>
            
            {/* Cấu hình Người nhận */}
            <h4 className="text-md font-semibold text-slate-800">Cấu hình người nhận</h4>
            <div className="grid grid-cols-2 gap-4">
                
                {/* Loại mục tiêu (targetType) */}
                <div className="space-y-1 col-span-2">
                    <label htmlFor="targetType" className="text-sm font-medium text-slate-700">Loại mục tiêu</label>
                    <select
                        id="targetType"
                        value={newAnnouncement.targetType}
                        onChange={(e) => {
                            setNewAnnouncement({
                                ...newAnnouncement, 
                                targetType: e.target.value,
                                buildingId: buildings[0]?.id || '', 
                                floor: e.target.value !== 'FLOOR' ? 0 : newAnnouncement.floor,
                                residentIds: e.target.value !== 'RESIDENTS' ? [] : newAnnouncement.residentIds
                            })
                        }}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                        {TARGET_TYPES.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                    </select>
                </div>
                
                {/* Chọn Tòa nhà và Tầng (Chỉ hiện khi targetType là BUILDING/FLOOR) */}
                {(newAnnouncement.targetType === 'BUILDING' || newAnnouncement.targetType === 'FLOOR') && (
                    <React.Fragment>
                        <div className="space-y-1">
                            <label htmlFor="buildingId" className="text-sm font-medium text-slate-700">Tòa nhà <span className="text-red-500">*</span></label>
                            {isBuildingsLoading ? (
                                <div className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-100 text-slate-500 flex items-center">
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang tải...
                                </div>
                            ) : (
                                <select
                                    id="buildingId"
                                    required
                                    value={newAnnouncement.buildingId}
                                    onChange={(e) => setNewAnnouncement({...newAnnouncement, buildingId: e.target.value})}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {specificBuildings.map(b => (
                                        <option key={b.id} value={b.id}>{b.label}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                        
                        {newAnnouncement.targetType === 'FLOOR' && (
                            <div className="space-y-1">
                                <label htmlFor="floor" className="text-sm font-medium text-slate-700">Số tầng (Floor) <span className="text-red-500">*</span></label>
                                <input
                                    id="floor"
                                    type="number"
                                    min="1"
                                    max="50" 
                                    required
                                    value={newAnnouncement.floor}
                                    onChange={(e) => setNewAnnouncement({...newAnnouncement, floor: Number(e.target.value)})}
                                    placeholder="Nhập số tầng (ví dụ: 5)"
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        )}
                    </React.Fragment>
                )}
                
                {/* 🔥 Giao diện chọn cư dân (Chỉ hiện khi targetType là RESIDENTS) */}
                {newAnnouncement.targetType === 'RESIDENTS' && (
                    <div className="space-y-1 col-span-2">
                        <label className="text-sm font-medium text-slate-700 flex items-center">
                            <ListChecks className="w-4 h-4 mr-1 text-blue-500"/> Chọn Cư dân cụ thể 
                            <span className="text-red-500 ml-1">*</span>
                            <span className="text-xs text-slate-500 ml-3">({newAnnouncement.residentIds.length} người đã chọn)</span>
                        </label>
                        
                        {isResidentsLoading ? (
                            <div className="w-full p-4 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang tải danh sách cư dân...
                            </div>
                        ) : (
                            <div className="w-full border border-slate-300 rounded-lg overflow-hidden" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {residents.length === 0 ? (
                                    <p className="p-4 text-center text-slate-500">Không tìm thấy cư dân nào.</p>
                                ) : (
                                    residents.map(resident => (
                                        <div 
                                            key={resident.id}
                                            onClick={() => handleResidentSelect(resident.id)}
                                            className={`flex items-center justify-between p-3 border-b cursor-pointer transition-colors
                                                ${newAnnouncement.residentIds.includes(resident.id) 
                                                    ? 'bg-blue-50 text-blue-800 hover:bg-blue-100' 
                                                    : 'bg-white text-slate-700 hover:bg-slate-50'
                                                }`}
                                        >
                                            <span>{resident.name}</span>
                                            <input
                                                type="checkbox"
                                                checked={newAnnouncement.residentIds.includes(resident.id)}
                                                readOnly
                                                className="form-checkbox h-4 w-4 text-blue-600 rounded"
                                            />
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                        {/* Thông báo lỗi nếu chưa chọn cư dân */}
                        {newAnnouncement.targetType === 'RESIDENTS' && newAnnouncement.residentIds.length === 0 && (
                            <p className="text-red-500 text-xs mt-1">Vui lòng chọn ít nhất một cư dân để gửi thông báo.</p>
                        )}
                    </div>
                )}
                
            </div>

            {/* Footer nút Submit */}
            <div className="flex justify-end pt-4 space-x-3 border-t border-slate-200">
                <Button 
                    onClick={handleCloseCreateModal}
                    className="bg-slate-200 text-slate-700 hover:bg-slate-300"
                    type="button"
                    disabled={isSubmitting}
                >
                    Hủy
                </Button>
                <Button 
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <span className="flex items-center">
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Đang gửi...
                        </span>
                    ) : (
                        <span className="flex items-center">
                            <Bell className="w-4 h-4 mr-2" />
                            Gửi Thông Báo
                        </span>
                    )}
                </Button>
            </div>
            
        </form>
      </Modal>
    </div>
  );
}

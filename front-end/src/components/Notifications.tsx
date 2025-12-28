import { useState, useEffect, useCallback } from 'react'; 
import { Plus, Bell, AlertCircle, Clock, Loader2, ListChecks } from 'lucide-react'; // Đã thêm ListChecks
import { Toaster, toast } from 'sonner';
import React from 'react';
import { Modal } from './Modal'; 

type TargetType = 'ALL' | 'BUILDING' | 'FLOOR' | 'APARTMENTS';

type AnnouncementItem = {
  id: string;
  title: string;
  message: string;
  sender: string;
  targetDetail: string;
  time: string;
  icon: any;
};

type BuildingOption = { id: string; label: string; value: string };
type ApartmentOption = { id: string; label: string };
type StaffOption = { id: string; label: string };

type NewAnnouncementState = {
  title: string;
  message: string;
  senderId: string;
  targetType: TargetType;
  buildingId: string;
  floor: number;
  apartmentIds: string[];
};

type ButtonProps = {
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
};

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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
const Button = ({ children, onClick, className, disabled = false, type = 'button' }: ButtonProps) => (
    <button 
        onClick={onClick} 
        disabled={disabled}
        type={type}
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
    { label: 'Theo Căn hộ cụ thể', value: 'APARTMENTS' }, 
];
// --- END TARGET TYPE ---


export function Notifications() { 
  const DEFAULT_SENDER_ID = 'a2ca2e25-4443-496b-a457-46539af501cc'; 
  
  // State chung
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State cho Tòa nhà
  const [buildings, setBuildings] = useState<BuildingOption[]>([]);
  const [isBuildingsLoading, setIsBuildingsLoading] = useState(false);
  const [buildingKeyword, setBuildingKeyword] = useState('');

  // State cho Staff (sender) - lấy từ lịch sử thông báo đã gửi
  const [staffs, setStaffs] = useState<StaffOption[]>([]);

  // State cho Căn hộ (gửi theo danh sách apartmentIds)
  const [apartments, setApartments] = useState<ApartmentOption[]>([]);
  const [isApartmentsLoading, setIsApartmentsLoading] = useState(false);
  const [apartmentKeyword, setApartmentKeyword] = useState('');
  
  // State cho Modal và Form Tạo thông báo
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState<NewAnnouncementState>({
    title: '',
    message: '',
    senderId: DEFAULT_SENDER_ID, 
    targetType: 'ALL', 
    buildingId: '', 
    floor: 0,
    apartmentIds: [], // Danh sách ID căn hộ được chọn
  });
  
  // --- HÀM GỌI API LẤY DANH SÁCH TÒA NHÀ ---
  const fetchBuildings = useCallback(async (keyword: string) => {
    setIsBuildingsLoading(true);
    try {
        const response = await fetch(`http://localhost:8081/api/v1/buildings/dropdown?keyword=${encodeURIComponent(keyword ?? '')}`); 
        
        if (!response.ok) {
            throw new Error("Không thể tải danh sách Tòa nhà.");
        }
        
        const res = await response.json();
        const data = res.data || [];
        
        const mapped = data.map((b: any) => ({ id: String(b.id), label: String(b.label ?? ''), value: String(b.id) }));
        setBuildings(mapped);
        
    } catch (err: unknown) {
        toast.error("Lỗi tải Tòa nhà", { description: err instanceof Error ? err.message : 'Không thể tải danh sách Tòa nhà.' });
        setBuildings([]);
    } finally {
        setIsBuildingsLoading(false);
    }
  }, []);

  const fetchApartments = useCallback(async (keyword: string) => {
    setIsApartmentsLoading(true);
    try {
        const response = await fetch(`http://localhost:8081/api/v1/apartments/dropdown?keyword=${encodeURIComponent(keyword ?? '')}`); 
        
        if (!response.ok) {
            throw new Error("Không thể tải danh sách Căn hộ.");
        }
        
        const res = await response.json();
        const data = res.data || [];
        
        const apartmentList = data.map((a: any) => ({
          id: String(a.id),
          label: String(a.label ?? ''),
        }));
        setApartments(apartmentList);
        
    } catch (err: unknown) {
        toast.error("Lỗi tải Căn hộ", { description: err instanceof Error ? err.message : 'Không thể tải danh sách Căn hộ.' });
        setApartments([]);
    } finally {
        setIsApartmentsLoading(false);
    }
  }, []);

  // --- HÀM TẢI DỮ LIỆU LỊCH SỬ THÔNG BÁO ---
  const fetchAnnouncements = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
        const response = await fetch('http://localhost:8081/api/v1/announcements/staff/all?page=0&size=1000&sort=createdDate,desc'); 
        
        if (!response.ok) {
            throw new Error("Không thể lấy danh sách thông báo đã gửi.");
        }
        
        const rawData = await response.json();
        const rawAnnouncements = rawData?.content || [];

        const parseLocalDateTime = (value: any): Date | null => {
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
        
        const senderMap = new Map<string, string>();
        for (const a of rawAnnouncements) {
            const id = a?.sender?.id;
            if (id) {
                const label = a?.sender?.fullName ? String(a.sender.fullName) : String(id);
                senderMap.set(String(id), label);
            }
        }
        const senderOptions: StaffOption[] = Array.from(senderMap.entries()).map(([id, label]) => ({ id, label }));
        setStaffs(senderOptions);

        const transformedData: AnnouncementItem[] = rawAnnouncements.map((announcement: any) => {
            const type = 'GENERAL'; 
            const Icon = typeIcons[type];
            
            const dateTime = parseLocalDateTime(announcement.createdDate);
            const timeFormatted = dateTime
                ? dateTime.toLocaleDateString('vi-VN') + ' ' + dateTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                : 'N/A';

            return {
                id: String(announcement.id ?? ''),
                title: String(announcement.title ?? ''),
                message: String(announcement.message ?? ''), 
                sender: announcement.sender?.fullName || 'BQL Chung cư',
                targetDetail: String(announcement.targetDetail ?? ''),
                time: timeFormatted,
                icon: Icon,
            };
        });

        setAnnouncements(transformedData);
        
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Không thể tải lịch sử thông báo';
        setError(message);
        toast.error("Lỗi tải lịch sử thông báo", { description: message });
    } finally {
        setIsLoading(false);
    }
  }, []);

  // --- HOOK TẢI DỮ LIỆU LỊCH SỬ ---
  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]); 

  // --- HÀM TẠO THÔNG BÁO MỚI ---
  const handleCreateAnnouncement = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    const title = newAnnouncement.title.trim();
    const message = newAnnouncement.message.trim();
    if (!title || !message) {
        toast.warning("Vui lòng điền tiêu đề và nội dung.");
        return;
    }

    const senderId = newAnnouncement.senderId.trim();
    if (!UUID_REGEX.test(senderId)) {
        toast.warning("SenderId không hợp lệ (cần UUID).");
        return;
    }
    
    if (newAnnouncement.targetType === 'APARTMENTS' && newAnnouncement.apartmentIds.length === 0) {
        toast.warning("Vui lòng chọn ít nhất một căn hộ.");
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
        title,
        message,
        senderId,
        targetType: mappedTargetType,
        buildingId: null,
        floors: null,
        apartmentIds: null,
        targetDetail: '',
    };

    if (mappedTargetType === 'BY_BUILDING') {
        payload.buildingId = newAnnouncement.buildingId;
    } else if (mappedTargetType === 'BY_FLOOR') {
        payload.buildingId = newAnnouncement.buildingId;
        payload.floors = [newAnnouncement.floor];
    } else if (mappedTargetType === 'SPECIFIC_APARTMENTS') {
        payload.apartmentIds = newAnnouncement.apartmentIds;
    }

    const toastId = toast.loading('Đang gửi thông báo...');
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 15000);

    try {
        const response = await fetch('http://localhost:8081/api/v1/announcements/staff/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
            signal: controller.signal,
        });

        if (!response.ok) {
            let detail = '';
            const contentType = response.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
                const errorData = await response.json().catch(() => ({} as any));
                detail = String(errorData?.message ?? '');
            } else {
                detail = await response.text().catch(() => '');
            }
            const message = detail?.trim() ? detail.trim() : `Lỗi: ${response.status} khi gửi thông báo.`;
            throw new Error(message);
        }

        await fetchAnnouncements();

        setIsCreateModalOpen(false);
        setNewAnnouncement({
            title: '',
            message: '',
            senderId: DEFAULT_SENDER_ID,
            targetType: 'ALL',
            buildingId: '',
            floor: 0,
            apartmentIds: [],
        });

        toast.success('Thông báo đã được gửi thành công!', { id: toastId });
    } catch (err: unknown) {
        const message =
            err instanceof DOMException && err.name === 'AbortError'
                ? 'Kết nối quá thời gian. Vui lòng thử lại.'
                : err instanceof Error
                    ? err.message
                    : 'Không thể gửi thông báo.';

        toast.error('Gửi thông báo thất bại', { id: toastId, description: message });
    } finally {
        window.clearTimeout(timeoutId);
        setIsSubmitting(false);
    }
  };

  const handleApartmentSelect = (apartmentId: string) => {
    setNewAnnouncement(prev => {
        const selectedIds = new Set(prev.apartmentIds);
        if (selectedIds.has(apartmentId)) {
            selectedIds.delete(apartmentId);
        } else {
            selectedIds.add(apartmentId);
        }
        return {
            ...prev,
            apartmentIds: Array.from(selectedIds)
        };
    });
  };

  // --- CÁC HÀM XỬ LÝ UI KHÁC ---
  const totalSentAnnouncements = announcements.length;
                       
  // Handler mở Modal (và tải buildings + residents nếu cần)
  const handleOpenCreateModal = () => {
      setBuildingKeyword('');
      setApartmentKeyword('');
      setBuildings([]);
      setApartments([]);
      if (staffs.length > 0 && !UUID_REGEX.test(newAnnouncement.senderId.trim())) {
          setNewAnnouncement((prev) => ({ ...prev, senderId: staffs[0].id }));
      }
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
          buildingId: '',
          floor: 0,
          apartmentIds: [],
      });
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" richColors closeButton />
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
      <div className="grid grid-cols-1 gap-6">
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
                    <span>Đối tượng: <span className="text-slate-700 font-medium">{announcement.targetDetail || 'N/A'}</span></span>
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
                    rows={4}
                    value={newAnnouncement.message}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, message: e.target.value})}
                    placeholder="Nhập nội dung thông báo chi tiết..."
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
            </div>

            <div className="space-y-1">
                <label htmlFor="senderId" className="text-sm font-medium text-slate-700">Nhân viên gửi</label>
                {staffs.length === 0 ? (
                    <input
                        id="senderId"
                        type="text"
                        value={newAnnouncement.senderId}
                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, senderId: e.target.value })}
                        placeholder="Nhập UUID nhân viên gửi..."
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                ) : (
                    <select
                        id="senderId"
                        value={newAnnouncement.senderId}
                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, senderId: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                        {staffs.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.label || s.id}
                            </option>
                        ))}
                    </select>
                )}
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
                                targetType: e.target.value as TargetType,
                                buildingId: '', 
                                floor: e.target.value !== 'FLOOR' ? 0 : newAnnouncement.floor,
                                apartmentIds: e.target.value !== 'APARTMENTS' ? [] : newAnnouncement.apartmentIds
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
                            <input
                              value={buildingKeyword}
                              onChange={(e) => {
                                const next = e.target.value;
                                setBuildingKeyword(next);
                                fetchBuildings(next);
                              }}
                              placeholder="Nhập từ khóa để tìm tòa nhà..."
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            />
                            {isBuildingsLoading ? (
                              <div className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-100 text-slate-500 flex items-center">
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang tải...
                              </div>
                            ) : buildings.length === 0 ? (
                              <div className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500">
                                Nhập từ khóa để tìm tòa nhà
                              </div>
                            ) : (
                              <select
                                id="buildingId"
                                required
                                value={newAnnouncement.buildingId}
                                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, buildingId: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="" disabled>
                                  Chọn tòa nhà
                                </option>
                                {buildings.map((b) => (
                                  <option key={b.id} value={b.id}>
                                    {b.label}
                                  </option>
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
                
                {/* 🔥 Giao diện chọn căn hộ (Chỉ hiện khi targetType là APARTMENTS) */}
                {newAnnouncement.targetType === 'APARTMENTS' && (
                    <div className="space-y-1 col-span-2">
                        <label className="text-sm font-medium text-slate-700 flex items-center">
                            <ListChecks className="w-4 h-4 mr-1 text-blue-500"/> Chọn Căn hộ cụ thể 
                            <span className="text-red-500 ml-1">*</span>
                            <span className="text-xs text-slate-500 ml-3">({newAnnouncement.apartmentIds.length} căn hộ đã chọn)</span>
                        </label>
                        
                        <input
                          value={apartmentKeyword}
                          onChange={(e) => {
                            const next = e.target.value;
                            setApartmentKeyword(next);
                            fetchApartments(next);
                          }}
                          placeholder="Nhập từ khóa để tìm căn hộ (vd: BlueMoon, 906)..."
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />

                        {isApartmentsLoading ? (
                          <div className="w-full p-4 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang tải danh sách căn hộ...
                          </div>
                        ) : (
                          <div className="w-full border border-slate-300 rounded-lg overflow-hidden" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {apartments.length === 0 ? (
                              <p className="p-4 text-center text-slate-500">Nhập từ khóa để tìm căn hộ.</p>
                            ) : (
                              apartments.map((apartment) => (
                                <div
                                  key={apartment.id}
                                  onClick={() => handleApartmentSelect(apartment.id)}
                                  className={`flex items-center justify-between p-3 border-b cursor-pointer transition-colors
                                    ${newAnnouncement.apartmentIds.includes(apartment.id)
                                      ? 'bg-blue-50 text-blue-800 hover:bg-blue-100'
                                      : 'bg-white text-slate-700 hover:bg-slate-50'
                                    }`}
                                >
                                  <span>{apartment.label}</span>
                                  <input
                                    type="checkbox"
                                    checked={newAnnouncement.apartmentIds.includes(apartment.id)}
                                    readOnly
                                    className="form-checkbox h-4 w-4 text-blue-600 rounded"
                                  />
                                </div>
                              ))
                            )}
                          </div>
                        )}

                        {newAnnouncement.targetType === 'APARTMENTS' && newAnnouncement.apartmentIds.length === 0 && (
                          <p className="text-red-500 text-xs mt-1">Vui lòng chọn ít nhất một căn hộ để gửi thông báo.</p>
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

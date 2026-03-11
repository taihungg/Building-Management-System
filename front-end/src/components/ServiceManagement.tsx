import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, MoreVertical, Wrench, Droplet, Zap, Wind, Shield, Trash2, Clock, CheckCircle } from 'lucide-react';
import { SlideOut } from './SlideOut';
import { toast } from 'sonner';
import React from 'react';

// UUID giả định để khắc phục lỗi 400 Bad Request khi gửi 'default-admin-reporter-id'
const FALLBACK_REPORTER_UUID = '00000000-0000-0000-0000-000000000001';
const PAYMENT_REQUEST_MARKER = '[PAYMENT_REQUEST]';
const isPaymentRequestIssue = (title: string, description: string) => {
  const safeTitle = String(title ?? '');
  const safeDescription = String(description ?? '');
  const haystack = `${safeTitle}\n${safeDescription}`;
  if (haystack.includes(PAYMENT_REQUEST_MARKER)) return true;
  const lowerTitle = safeTitle.toLowerCase();
  const lowerDescription = safeDescription.toLowerCase();
  return lowerTitle.includes('yêu cầu xác nhận thanh toán') && lowerDescription.includes('invoiceid:');
};

const categoryIcons: Record<string, any> = {
  Plumbing: Droplet,
  Electrical: Zap,
  HVAC: Wind,
  MAINTENANCE: Wrench,
  AUTHORITY: Shield,
  Cleaning: Trash2,
  Security: Shield,
  Complaint: Shield, // Thêm Complaint
};

type IssueStatusEnum = 'UNPROCESSED' | 'PROCESSING' | 'PROCESSED' | (string & {});
type IssueTypeEnum = 'MAINTENANCE' | 'COMPLAINT' | 'AUTHORITY' | 'SECURITY' | (string & {});

type IssueSummaryDTO = {
  id: string;
  roomNumber?: number | string | null;
  reporterName?: string | null;
  title?: string | null;
  description?: string | null;
  status?: IssueStatusEnum | null;
  type?: IssueTypeEnum | null;
};

type IssueItem = {
  id: string;
  title: string;
  category: string;
  type: IssueTypeEnum;
  status: string;
  rawStatus: IssueStatusEnum;
  unit: string;
  resident: string;
  description: string;
};

type IssueCreateRequest = {
  apartmentId: string;
  title: string;
  description: string;
  type: IssueTypeEnum;
  reporterId: string;
};

type ServiceManagementProps = {
  issueType?: IssueTypeEnum;
  title?: string;
  subtitle?: string;
  mode?: 'default' | 'payment_requests';
};

export function ServiceManagement({ issueType, title, subtitle, mode = 'default' }: ServiceManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // Cập nhật filter mặc định theo tiếng Việt
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // State chính chứa danh sách Issue
  const [allIssue, setAllIssue] = useState<IssueItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // State cho form createIssue (SlideOut)
  const [updateApartmentID, setUpdateAppartmentID] = useState('');
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateDescription, setUpdateDescription] = useState('');
  const [updateType, setUpdateType] = useState<IssueTypeEnum>('MAINTENANCE'); // Đặt giá trị mặc định khớp với option
  const [updateReporterID, setUpdateReporterID] = useState('');

  // State cho Dropdown Search Căn hộ
  const [apartmentSearchTerm, setApartmentSearchTerm] = useState('');
  const [apartmentDropdown, setApartmentDropdown] = useState<Array<{ id: string; label: string }>>([]);
  const [isApartmentDropdownLoading, setIsApartmentDropdownLoading] = useState(false);
  const [selectedApartmentLabel, setSelectedApartmentLabel] = useState('');

  // State quản lý menu trạng thái
  const [openIssueMenuId, setOpenIssueMenuId] = useState<string | null>(null);

  const isPaymentRequestsMode = mode === 'payment_requests';

  const statusOptions = isPaymentRequestsMode
    ? [
      { enum: 'UNPROCESSED', label: 'Chưa xác nhận' },
      { enum: 'PROCESSING', label: 'Đang kiểm tra' },
      { enum: 'PROCESSED', label: 'Đã xác nhận' },
    ]
    : [
      { enum: 'UNPROCESSED', label: 'Chưa xử lý' },
      { enum: 'PROCESSING', label: 'Đang xử lý' },
      { enum: 'PROCESSED', label: 'Đã xử lý' },
    ];

  const statusFilterTabs = isPaymentRequestsMode
    ? (['Chưa xác nhận', 'Đang kiểm tra', 'Đã xác nhận', 'All'] as const)
    : (['Chưa Xử Lý', 'Đang Xử Lý', 'Đã Xử Lý', 'All'] as const);


  // --- HÀM GỌI API ---

  // 1. API Tạo Issue (POST)
  const createIssueApi = async (issueData: IssueCreateRequest) => {
    try {
      const response = await fetch('https://building-management-system.fly.dev/api/issues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(issueData),
      });

      if (!response.ok) {
        // Cố gắng đọc chi tiết lỗi JSON từ Backend
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Lỗi: ${response.status} khi tạo yêu cầu.`);
      }

      const json = await response.json().catch(() => ({}));
      return json?.data;
    }
    catch (err) {
      throw err;
    }
  };

  // 2. API Cập nhật Trạng thái (PATCH)
  const updateIssueStatusApi = async (issueId: string, newStatus: IssueStatusEnum) => {
    setOpenIssueMenuId(null);
    try {
      const response = await fetch(`https://building-management-system.fly.dev/api/issues/${issueId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Lỗi: ${response.status} khi cập nhật trạng thái.`);
      }

      await fetchIssues();

      toast.success(`Cập nhật trạng thái thành công!`);

    } catch (err: unknown) {
      toast.error(`Thất bại: ${err instanceof Error ? err.message : 'Không thể cập nhật trạng thái.'}`);
    }
  };

  // 3. API Lấy Danh sách Issue (GET)
  const fetchIssues = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let url = 'https://building-management-system.fly.dev/api/issues';
      if (issueType) url += `?type=${encodeURIComponent(issueType)}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (!response.ok) {
        throw new Error("Không thể tải danh sách yêu cầu/sự cố.");
      }

      const json = await response.json().catch(() => ({}));
      const rawData = Array.isArray(json?.data) ? json.data : [];

      const transformedData: IssueItem[] = (rawData as IssueSummaryDTO[]).map((issue) => {

        // Hàm chuyển đổi status từ ENUM sang UI Label (ĐÃ DỊCH)
        const mapStatus = (status: IssueStatusEnum | null | undefined) => {
          if (isPaymentRequestsMode) {
            switch (status) {
              case 'UNPROCESSED': return 'Chưa xác nhận';
              case 'PROCESSING': return 'Đang kiểm tra';
              case 'PROCESSED': return 'Đã xác nhận';
              default: return 'Chưa xác nhận';
            }
          }

          switch (status) {
            case 'UNPROCESSED': return 'Chưa Xử Lý';
            case 'PROCESSING': return 'Đang Xử Lý';
            case 'PROCESSED': return 'Đã Xử Lý';
            default: return 'Chưa Xử Lý';
          }
        };
        // Lấy ENUM status gốc
        const rawStatus: IssueStatusEnum = issue.status ?? 'UNPROCESSED';

        // Hàm map Type sang Category (ĐÃ DỊCH)
        const mapCategory = (type: IssueTypeEnum | null | undefined) => {
          if (isPaymentRequestsMode) return 'Thanh toán';
          switch (type) {
            case 'MAINTENANCE': return 'Bảo Trì';
            case 'COMPLAINT': return 'Khiếu Nại';
            case 'AUTHORITY': return 'Cơ Quan/An Ninh'; // Thêm Authority
            default: return 'Bảo Trì';
          }
        };

        const rawTitle = String(issue.title ?? '');
        const rawDescription = String(issue.description ?? '');
        const nextTitle = isPaymentRequestsMode ? rawTitle.replace(PAYMENT_REQUEST_MARKER, '').trim() : rawTitle;

        return {
          id: String(issue.id ?? ''),
          title: nextTitle,
          category: mapCategory(issue.type), // Label đã dịch
          type: (issue.type ?? 'MAINTENANCE') as IssueTypeEnum, // 🔥 Giữ ENUM gốc (MAINTENANCE, COMPLAINT, AUTHORITY)
          status: mapStatus(rawStatus),
          rawStatus: rawStatus, // Lưu trạng thái ENUM gốc
          unit: String(issue.roomNumber ?? ''),
          resident: String(issue.reporterName ?? ''),
          description: rawDescription,
        };
      });

      const filteredData = isPaymentRequestsMode
        ? transformedData.filter((x) => isPaymentRequestIssue(x.title, x.description))
        : transformedData.filter((x) => !isPaymentRequestIssue(x.title, x.description));

      setAllIssue(filteredData);

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách yêu cầu/sự cố.');
    } finally {
      setIsLoading(false);
    }
  }, [issueType, isPaymentRequestsMode]);

  // 4. API Tìm kiếm Căn hộ Dropdown (GET /dropdown)
  const fetchApartmentDropdown = async (keyword: string) => {
    if (!keyword) {
      setApartmentDropdown([]);
      return;
    }

    setIsApartmentDropdownLoading(true);
    try {
      const response = await fetch(`https://building-management-system.fly.dev/api/v1/apartments/dropdown?keyword=${keyword}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
      });

      if (!response.ok) {
        // Lỗi 404/Network
        throw new Error("Lỗi tìm kiếm căn hộ.");
      }

      const json = await response.json().catch(() => ({}));
      const list = Array.isArray(json?.data) ? json.data : [];
      setApartmentDropdown(list.map((x: any) => ({ id: String(x?.id ?? ''), label: String(x?.label ?? '') })).filter((x: any) => x.id));

    } catch (err: unknown) {
      setApartmentDropdown([]);
    } finally {
      setIsApartmentDropdownLoading(false);
    }
  };


  // --- LOGIC FORM SUBMIT ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // SỬA LỖI UUID: Dùng UUID hợp lệ thay cho chuỗi 'default-admin-reporter-id'
    const reporterId = updateReporterID
      || localStorage.getItem('userId')
      || FALLBACK_REPORTER_UUID;

    if (!updateTitle || !updateDescription || !updateApartmentID || !updateType) {
      toast.warning("Thiếu thông tin", { description: "Vui lòng điền đủ Tiêu đề, Mô tả, Loại, và chọn Căn hộ." });
      return;
    }

    const promise = new Promise<string>(async (resolve, reject) => {
      try {
        const dataform: IssueCreateRequest = {
          apartmentId: updateApartmentID,
          title: updateTitle,
          description: updateDescription,
          type: updateType,
          reporterId: reporterId // Đã được đảm bảo là UUID hợp lệ
        };

        await createIssueApi(dataform);

        await fetchIssues(); // Tải lại danh sách

        // Reset form và đóng SlideOut
        setUpdateAppartmentID('');
        setUpdateTitle('');
        setUpdateDescription('');
        setUpdateType('MAINTENANCE'); // Reset về Maintenance
        setApartmentSearchTerm('');
        setSelectedApartmentLabel('');
        setIsNewRequestOpen(false);

        resolve("Đã tạo yêu cầu/sự cố thành công!");

      } catch (err) {
        reject(err);
      }
    });

    toast.promise(promise, {
      loading: 'Đang gửi yêu cầu...',
      success: (message) => message,
      error: (err: any) => `Thất bại: ${err?.message ?? 'Không thể tạo yêu cầu.'}`,
    });
  }

  // Hàm xử lý chọn căn hộ từ dropdown
  const handleSelectApartment = (apartmentId: string, roomNumber: string) => {
    setUpdateAppartmentID(apartmentId);
    setSelectedApartmentLabel(roomNumber);
    setApartmentDropdown([]);
    setApartmentSearchTerm(roomNumber);
  };


  // --- HOOKS ---
  useEffect(() => {
    fetchIssues();
  }, [fetchIssues])

  // Hook Debounce cho tìm kiếm căn hộ
  useEffect(() => {
    const handler = setTimeout(() => {
      if (isNewRequestOpen) {
        fetchApartmentDropdown(apartmentSearchTerm);
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [apartmentSearchTerm, isNewRequestOpen]);


  // Chuyển đổi trạng thái filter từ tiếng Việt sang UI Label tiếng Anh (để so sánh với Issue data)
  const mapFilterToStatusLabel = (filter: string) => {
    if (isPaymentRequestsMode) {
      switch (filter) {
        case 'Chưa xác nhận': return 'Chưa xác nhận';
        case 'Đang kiểm tra': return 'Đang kiểm tra';
        case 'Đã xác nhận': return 'Đã xác nhận';
        default: return 'All';
      }
    }
    switch (filter) {
      case 'Chưa Xử Lý': return 'Chưa Xử Lý';
      case 'Đang Xử Lý': return 'Đang Xử Lý';
      case 'Đã Xử Lý': return 'Đã Xử Lý';
      default: return 'All';
    }
  }

  const filteredIssues = allIssue.filter(issue => {
    const statusLabel = mapFilterToStatusLabel(statusFilter);

    // Lọc theo Status 
    if (statusFilter !== 'All' && issue.status !== statusFilter) {
      return false;
    }

    // 2. Lọc theo Search Term
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();

      const unit = issue.unit || '';
      const resident = issue.resident || '';
      const category = issue.category || ''; // Label đã dịch (Bảo Trì, Khiếu Nại, Cơ Quan/An Ninh)
      const title = issue.title || '';
      const type = issue.type || ''; // 🔥 ENUM gốc (MAINTENANCE, COMPLAINT, AUTHORITY)

      return (
        unit.toLowerCase().includes(lowerSearch) ||
        resident.toLowerCase().includes(lowerSearch) ||
        category.toLowerCase().includes(lowerSearch) ||
        title.toLowerCase().includes(lowerSearch) ||
        type.toLowerCase().includes(lowerSearch) // 🔥 Thêm tìm kiếm theo type ENUM gốc
      );
    }
    return true;
  });


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-slate-900">{title ?? 'Quản lý yêu cầu dịch vụ và sự cố'}</h1>
          <p className="text-slate-500 mt-1">{subtitle ?? 'Theo dõi và quản lý tất cả các yêu cầu dịch vụ và sự cố'}</p>
        </div>
        {/* Nút Tạo Yêu Cầu Mới - Đặt ở đây để nằm bên phải Header */}
      </div>

      <hr />

      {/* Search Bar (ĐÃ CHỈNH SỬA) */}
      <div
        className="bg-white rounded-xl"
        style={{
          maxWidth: '25%', // Giới hạn chiều rộng 25%
          padding: '0.5rem', // Giảm padding container
        }}
      >
        <div className="relative">
          {/* Icon Search - Giảm kích thước và điều chỉnh vị trí */}
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            style={{ width: '1.15rem', height: '1.15rem', left: '0.75rem' }}
          />
          <input
            type="text"
            placeholder="Tìm kiếm theo số phòng, cư dân, loại dịch vụ (ENUM/Việt)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            // ÉP BUỘC CHIỀU CAO VÀ PADDING BẰNG INLINE STYLE
            style={{
              paddingLeft: '2.5rem', // 1.15rem icon + space
              paddingRight: '1rem',
              paddingTop: '0.4rem',
              paddingBottom: '0.4rem',
              height: '2.25rem' // Chiều cao cố định
            }}
          />
        </div>
      </div>

      {/* Stats Grid - ĐÃ DỊCH */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-slate-500 text-sm">{isPaymentRequestsMode ? 'Chưa xác nhận' : 'Chưa xử lý'}</p>
          </div>
          <p className="text-2xl text-slate-900">{allIssue.filter(s => s.status === (isPaymentRequestsMode ? 'Chưa xác nhận' : 'Chưa Xử Lý')).length}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-slate-500 text-sm">{isPaymentRequestsMode ? 'Đang kiểm tra' : 'Đang xử lý'}</p>
          </div>
          <p className="text-2xl text-slate-900">{allIssue.filter(s => s.status === (isPaymentRequestsMode ? 'Đang kiểm tra' : 'Đang Xử Lý')).length}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-slate-500 text-sm">{isPaymentRequestsMode ? 'Đã xác nhận' : 'Đã xử lý'}</p>
          </div>
          <p className="text-2xl text-slate-900">{allIssue.filter(s => s.status === (isPaymentRequestsMode ? 'Đã xác nhận' : 'Đã Xử Lý')).length}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-gray-600" />
            </div>
            <p className="text-slate-500 text-sm">Tổng yêu cầu</p>
          </div>
          <p className="text-2xl text-slate-900">{allIssue.length}</p>
        </div>
      </div>

      <hr />

      {/* Status Filter Tabs - ĐÃ DỊCH */}
      <div className="flex gap-2">
        {statusFilterTabs.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-6 py-3 rounded-xl transition-all ${statusFilter === status
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
          >
            {status === 'All' ? 'Tất cả' : status}
          </button>
        ))}
      </div>

      {/* Service Requests Grid */}
      <div className="grid grid-cols-2 gap-6">
        {isLoading && <p className="col-span-2 text-center py-10 text-blue-500">Đang tải danh sách yêu cầu...</p>}
        {error && <p className="col-span-2 text-center py-10 text-red-500">Lỗi tải dữ liệu: {error}</p>}

        {!isLoading && filteredIssues.length === 0 && (
          <p className="col-span-2 text-center py-10 text-slate-500">Không tìm thấy yêu cầu nào phù hợp.</p>
        )}

        {filteredIssues.map((service) => {
          // Sử dụng service.type (ENUM gốc) để chọn icon
          const Icon = categoryIcons[service.type] || Wrench;

          // Lấy status đã dịch từ issue.status
          const statusClass =
            service.status === 'Đã Xử Lý' ? 'bg-emerald-50 text-emerald-700' :
              service.status === 'Đang Xử Lý' ? 'bg-blue-50 text-blue-700' :
                service.status === 'Chưa Xử Lý' ? 'bg-orange-50 text-orange-700' :
                  'bg-gray-50 text-gray-700';

          return (
            <div
              key={service.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative"
              onClick={() => setOpenIssueMenuId(null)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    {/* Hiển thị Category (Label đã dịch) */}
                    <p className="text-sm text-slate-500">{service.category}</p>

                    <div className="flex items-center gap-3">
                      {/* Hiển thị Title */}
                      <p className="text-slate-900 font-semibold">{service.title}</p>

                      {/* Hiển thị STATUS */}
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusClass}`}>
                        {service.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Menu Thao tác */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenIssueMenuId(service.id === openIssueMenuId ? null : service.id);
                    }}
                    className="p-1 rounded-full hover:bg-slate-100"
                  >
                    <MoreVertical className="w-5 h-5 text-slate-400 cursor-pointer hover:text-slate-600" />
                  </button>

                  {/* Dropdown Menu - ĐÃ DỊCH */}
                  {openIssueMenuId === service.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-xl z-20 overflow-hidden">
                      <div className="py-1 px-3 text-xs text-slate-500 border-b">Thay Đổi Trạng Thái</div>
                      {statusOptions.map(option => (
                        <button
                          key={option.enum}
                          onClick={(e) => {
                            e.stopPropagation();
                            // So sánh với ENUM gốc
                            if (service.rawStatus !== option.enum) {
                              updateIssueStatusApi(service.id, option.enum);
                            }
                            setOpenIssueMenuId(null);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between ${service.rawStatus === option.enum
                              ? 'bg-blue-50 text-blue-600 font-medium'
                              : 'text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                          {option.label}
                          {service.rawStatus === option.enum && <CheckCircle className="w-4 h-4" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Phòng:</span>
                  <span className="text-slate-900 font-medium">#{service.unit}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Người Báo Cáo:</span>
                  <span className="text-slate-900">{service.resident}</span>
                </div>


              </div>
            </div>
          );
        })}
      </div>

      {/* SlideOut - Form Tạo Yêu Cầu Mới - ĐÃ DỊCH */}


    </div>
  );
}

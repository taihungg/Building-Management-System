import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, MoreVertical, Wrench, Droplet, Zap, Wind, Shield, Trash2, Clock, CheckCircle } from 'lucide-react';
import { SlideOut } from './SlideOut'; 
import { toast } from 'sonner';
import React from 'react';

// UUID giả định để khắc phục lỗi 400 Bad Request khi gửi 'default-admin-reporter-id'
const FALLBACK_REPORTER_UUID = '00000000-0000-0000-0000-000000000001'; 

const categoryIcons = {
  Plumbing: Droplet,
  Electrical: Zap,
  HVAC: Wind,
  Maintenance: Wrench,
  Cleaning: Trash2,
  Security: Shield,
  Complaint: Shield, // Thêm Complaint
};

// Danh sách các trạng thái ENUM Backend và UI Label tương ứng (ĐÃ DỊCH)
const STATUS_OPTIONS = [
    { enum: 'UNPROCESSED', label: 'Chưa Xử Lý' },
    { enum: 'PROCESSING', label: 'Đang Xử Lý' },
    // ENUM PROCESSED (Backend) -> Label Processed (Frontend)
    { enum: 'PROCESSED', label: 'Đã Xử Lý' }, 
];


export function ServiceManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Chưa Xử Lý'); // Cập nhật filter mặc định theo tiếng Việt
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // State chính chứa danh sách Issue
  const [allIssue, setAllIssue] = useState ([]);
  const [error, setError] = useState(null);
  
  // State cho form createIssue (SlideOut)
  const [updateApartmentID, setUpdateAppartmentID] = useState('');
  const [updateTitle, setUpdateTitle] = useState ('');
  const [updateDescription, setUpdateDescription] = useState ('');
  const [updateType , setUpdateType] = useState ('MAINTENANCE'); // Đặt giá trị mặc định khớp với option
  const [updateReporterID, setUpdateReporterID] = useState(''); 
  
  // State cho Dropdown Search Căn hộ
  const [apartmentSearchTerm, setApartmentSearchTerm] = useState('');
  const [apartmentDropdown, setApartmentDropdown] = useState([]);
  const [isApartmentDropdownLoading, setIsApartmentDropdownLoading] = useState(false);
  const [selectedApartmentLabel, setSelectedApartmentLabel] = useState(''); 

  // State quản lý menu trạng thái
  const [openIssueMenuId, setOpenIssueMenuId] = useState(null); 


  // --- HÀM GỌI API ---

  // 1. API Tạo Issue (POST)
  const createIssueApi = async (issueData) => {
    try {
      const response = await fetch('http://localhost:8081/api/issues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(issueData),
      });

      if (!response.ok) {
        // Cố gắng đọc chi tiết lỗi JSON từ Backend
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Lỗi: ${response.status} khi tạo yêu cầu.`);
      }

      return await response.json();
    }
    catch (err) {
      throw err; 
    }
  };
  
  // 2. API Cập nhật Trạng thái (PATCH)
  const updateIssueStatusApi = async (issueId, newStatus) => {
    setOpenIssueMenuId(null); 
    try {
        const response = await fetch(`http://localhost:8081/api/issues/${issueId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus }), 
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Lỗi: ${response.status} khi cập nhật trạng thái.`);
        }
        
        await fetchIssues(); 

        toast.success(`Cập nhật trạng thái thành công!`);

    } catch (err) {
        toast.error(`Thất bại: ${err.message}`);
    }
  };
  
  // 3. API Lấy Danh sách Issue (GET)
  const fetchIssues = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
        let url = 'http://localhost:8081/api/issues';
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error("Không thể tải danh sách yêu cầu/sự cố.");
        }
        
        const rawData = await response.json();
        
        const transformedData = rawData.map((issue) => {
            
            // Hàm chuyển đổi status từ ENUM sang UI Label (ĐÃ DỊCH)
            const mapStatus = (status) => { 
                switch (status) {
                    case 'UNPROCESSED': return 'Chưa Xử Lý';
                    case 'PROCESSING': return 'Đang Xử Lý';
                    // Đảm bảo cả RESOLVED và PROCESSED đều map thành Đã Xử Lý trên UI
                    case 'PROCESSED': 
                    case 'RESOLVED': // Giả định PROCESSED tương đương với RESOLVED
                        return 'Đã Xử Lý'; 
                    default: return 'Chưa Xử Lý';
                }
            };
            // Lấy ENUM status gốc
            const rawStatus = issue.status; 

            // Hàm map Type sang Category (ĐÃ DỊCH)
            const mapCategory = (type) => { 
                switch (type) {
                    case 'MAINTENANCE': return 'Bảo Trì'; 
                    case 'COMPLAINT': return 'Khiếu Nại'; 
                    default: return 'Bảo Trì';
                }
            };
            
            return {
                id: issue.id,
                title: issue.title,
                category: mapCategory(issue.type),
                status: mapStatus(rawStatus), 
                rawStatus: rawStatus, // Lưu trạng thái ENUM gốc
                unit: String(issue.roomNumber), 
                resident: issue.reporterName, 
            };
        });

        setAllIssue(transformedData);
        
    } catch (err) {
        setError(err.message);
    } finally {
        setIsLoading(false);
    }
  }, []);

  // 4. API Tìm kiếm Căn hộ Dropdown (GET /dropdown)
  const fetchApartmentDropdown = async (keyword) => {
    if (!keyword) {
      setApartmentDropdown([]);
      return;
    }
    
    setIsApartmentDropdownLoading(true);
    try {
      const response = await fetch(`http://localhost:8081/api/v1/apartments/dropdown?keyword=${keyword}`);
      
      if (!response.ok) {
        // Lỗi 404/Network
        throw new Error("Lỗi tìm kiếm căn hộ.");
      }
      
      const data = await response.json();
      setApartmentDropdown(data.data || []); 
      
    } catch (err) {
      console.error("Lỗi dropdown:", err);
      setApartmentDropdown([]);
    } finally {
      setIsApartmentDropdownLoading(false);
    }
  };


  // --- LOGIC FORM SUBMIT ---
  const handleSubmit = async(e)=>{
    e.preventDefault(); 

    // SỬA LỖI UUID: Dùng UUID hợp lệ thay cho chuỗi 'default-admin-reporter-id'
    const reporterId = updateReporterID 
        || localStorage.getItem('userId') 
        || FALLBACK_REPORTER_UUID;
    
    if (!updateTitle || !updateDescription || !updateApartmentID || !updateType) {
        toast.warning("Thiếu thông tin", { description: "Vui lòng điền đủ Tiêu đề, Mô tả, Loại, và chọn Căn hộ." });
        return;
    }

    const promise = new Promise(async (resolve, reject) => {
        try {
            const dataform = {
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
        error: (err) => `Thất bại: ${err.message}`, 
    });
  }
  
  // Hàm xử lý chọn căn hộ từ dropdown
  const handleSelectApartment = (apartmentId, roomNumber) => {
    setUpdateAppartmentID(apartmentId);
    setSelectedApartmentLabel(roomNumber);
    setApartmentDropdown([]); 
    setApartmentSearchTerm(roomNumber); 
  };
  

  // --- HOOKS ---
  useEffect (()=>{
     fetchIssues();
  },[fetchIssues])

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
  const mapFilterToStatusLabel = (filter) => {
      switch(filter) {
          case 'Chưa Xử Lý': return 'Chưa Xử Lý';
          case 'Đang Xử Lý': return 'Đang Xử Lý';
          case 'Đã Xử Lý': return 'Đã Xử Lý';
          default: return 'All';
      }
  }

  const filteredIssues = allIssue.filter(issue => {
    const statusLabel = mapFilterToStatusLabel(statusFilter);
    
    // Lọc theo Status 
    if (statusLabel !== 'All' && issue.status !== statusLabel) {
      return false;
    }
    
    // 2. Lọc theo Search Term
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      
      const unit = issue.unit || ''; 
      const resident = issue.resident || '';
      const category = issue.category || '';
      const title = issue.title || '';

      return (
        unit.toLowerCase().includes(lowerSearch) || 
        resident.toLowerCase().includes(lowerSearch) ||
        category.toLowerCase().includes(lowerSearch) ||
        title.toLowerCase().includes(lowerSearch)
      );
    }
    return true;
  });
  

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-slate-900">Quản Lý Yêu Cầu Dịch Vụ & Sự Cố</h1>
          <p className="text-slate-500 mt-1">Theo dõi và quản lý tất cả các yêu cầu dịch vụ và sự cố</p>
        </div>
        <button 
          onClick={() => setIsNewRequestOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-xl transition-all"
        >
          <Plus className="w-5 h-5" />
          Tạo Yêu Cầu Mới
        </button>
      </div>

      <hr/>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo số phòng, cư dân, hoặc loại dịch vụ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <p className="text-slate-500 text-sm">Chưa Xử Lý</p>
          </div>
          <p className="text-2xl text-slate-900">{allIssue.filter(s => s.status === 'Chưa Xử Lý').length}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-slate-500 text-sm">Đang Xử Lý</p>
          </div>
          <p className="text-2xl text-slate-900">{allIssue.filter(s => s.status === 'Đang Xử Lý').length}</p>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-slate-500 text-sm">Đã Xử Lý</p> 
          </div>
          <p className="text-2xl text-slate-900">{allIssue.filter(s => s.status === 'Đã Xử Lý').length}</p> 
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-gray-600" />
            </div>
            <p className="text-slate-500 text-sm">Tổng Yêu Cầu</p>
          </div>
          <p className="text-2xl text-slate-900">{allIssue.length}</p>
        </div>
      </div>

      <hr/>

      {/* Status Filter Tabs - ĐÃ DỊCH */}
      <div className="flex gap-2">
        {['Chưa Xử Lý', 'Đang Xử Lý', 'Đã Xử Lý', 'All'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-6 py-3 rounded-xl transition-all ${
              statusFilter === status
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {status === 'All' ? 'Tất Cả' : status}
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
          const Icon = categoryIcons[service.category] || Wrench; 
          
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
                              {/* Hiển thị Category */}
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
                                  {STATUS_OPTIONS.map(option => (
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
                                          className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between ${
                                              service.rawStatus === option.enum 
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
      <SlideOut
        isOpen={isNewRequestOpen}
        onClose={() => setIsNewRequestOpen(false)}
        title="Tạo Yêu Cầu Dịch Vụ / Sự Cố Mới"
      >
        <form onSubmit={handleSubmit} className="p-6 h-full flex flex-col">
            <div className="space-y-6 flex-grow">
                {/* Chọn Căn Hộ */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Chọn Căn Hộ <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Nhập số phòng hoặc tên cư dân"
                            value={apartmentSearchTerm}
                            onChange={(e) => {
                                setApartmentSearchTerm(e.target.value);
                                setUpdateAppartmentID(''); // Xóa ID khi tìm kiếm mới
                                setSelectedApartmentLabel('');
                            }}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                        {/* Hiển thị tên căn hộ đã chọn */}
                        {selectedApartmentLabel && (
                            <div className="absolute right-0 top-0 mt-3 mr-3 text-xs font-semibold text-blue-600">
                                Đã Chọn: {selectedApartmentLabel}
                            </div>
                        )}
                        
                        {/* Dropdown Kết Quả */}
                        {apartmentDropdown.length > 0 && apartmentSearchTerm.length > 0 && (
                            <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                {apartmentDropdown.map(apt => (
                                    <li 
                                        key={apt.id} 
                                        onClick={() => handleSelectApartment(apt.id, apt.label)}
                                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors text-sm border-b border-gray-100"
                                    >
                                        <div className="font-semibold text-gray-900">{apt.label}</div>
                                        <div className="text-xs text-gray-500">Chủ sở hữu: {apt.ownerName || 'Chưa rõ'}</div>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {isApartmentDropdownLoading && apartmentSearchTerm.length > 0 && (
                            <p className="absolute z-10 w-full mt-1 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-lg text-sm text-center text-gray-500">
                                Đang tìm kiếm...
                            </p>
                        )}

                        {/* Thông báo lỗi nếu chưa chọn căn hộ */}
                        {!updateApartmentID && apartmentSearchTerm.length > 0 && apartmentDropdown.length === 0 && !isApartmentDropdownLoading && (
                            <p className="absolute z-10 w-full mt-1 px-4 py-2 bg-white border border-red-300 rounded-lg shadow-lg text-sm text-red-600">
                                Không tìm thấy căn hộ nào phù hợp.
                            </p>
                        )}
                    </div>
                </div>

                {/* Tiêu đề */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu Đề Yêu Cầu <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        placeholder="Ví dụ: Rò rỉ nước ở phòng tắm"
                        value={updateTitle}
                        onChange={(e) => setUpdateTitle(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>
                
                {/* Loại Yêu Cầu */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Loại Yêu Cầu <span className="text-red-500">*</span></label>
                    <select
                        value={updateType}
                        onChange={(e) => setUpdateType(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
                        required
                    >
                        <option value="MAINTENANCE">Bảo Trì</option>
                        <option value="COMPLAINT">Khiếu Nại</option>
                        {/* Các loại khác có thể thêm vào đây nếu backend hỗ trợ */}
                    </select>
                </div>

                {/* Mô tả */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mô Tả Chi Tiết <span className="text-red-500">*</span></label>
                    <textarea
                        rows={5}
                        placeholder="Cung cấp chi tiết vấn đề: vị trí, mức độ nghiêm trọng..."
                        value={updateDescription}
                        onChange={(e) => setUpdateDescription(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-none"
                        required
                    />
                </div>

            </div>

            {/* Footer Buttons */}
            <div className="flex gap-3 pt-6 border-t mt-auto">
                <button
                    type="button"
                    onClick={() => setIsNewRequestOpen(false)}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
                >
                    Hủy Bỏ
                </button>
                <button 
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-xl transition-all font-semibold"
                >
                    Gửi Yêu Cầu
                </button>
            </div>
        </form>
      </SlideOut>

    </div>
  );
}
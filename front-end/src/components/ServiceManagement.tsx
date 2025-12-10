import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, MoreVertical, Wrench, Droplet, Zap, Wind, Shield, Trash2, Clock, Edit, Eye, CheckCircle, ChevronDown } from 'lucide-react';
import { SlideOut } from './SlideOut'; 
import { toast } from 'sonner';
import React from 'react';


const categoryIcons = {
  Plumbing: Droplet,
  Electrical: Zap,
  HVAC: Wind,
  Maintenance: Wrench,
  Cleaning: Trash2,
  Security: Shield,
};

// Danh sách các trạng thái ENUM Backend và UI Label tương ứng
const STATUS_OPTIONS = [
    { enum: 'UNPROCESSED', label: 'Unprocessed' },
    { enum: 'PROCESSING', label: 'In Progress' },
    { enum: 'RESOLVED', label: 'Completed' },
];


export function ServiceManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Unprocessed');
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // State chính chứa danh sách Issue
  const [allIssue, setAllIssue] = useState ([]);
  const [error, setError] = useState(null);
  
  // State cho form createIssue (SlideOut)
  const [updateApartmentID, setUpdateAppartmentID] = useState('');
  const [updateTitle, setUpdateTitle] = useState ('');
  const [updateDescription, setUpdateDescription] = useState ('');
  const [updateType , setUpdateType] = useState ('PLUMBING'); 
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
    setOpenIssueMenuId(null); // Đóng menu ngay lập tức
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
        
        // Cập nhật thành công, tải lại danh sách
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
            
            // Hàm chuyển đổi status từ ENUM sang UI Label
            const mapStatus = (status) => { 
                switch (status) {
                    case 'UNPROCESSED': return 'Unprocessed';
                    case 'PROCESSING': return 'In Progress';
                    case 'RESOLVED': return 'Completed'; 
                    default: return 'Unprocessed';
                }
            };
            // Lấy ENUM status gốc
            const rawStatus = issue.status; 

            // Hàm map Type sang Category
            const mapCategory = (type) => { 
                switch (type) {
                    case 'MAINTENANCE': return 'Maintenance'; 
                    case 'SECURITY': return 'Security'; 
                    case 'PLUMBING': return 'Plumbing'; 
                    case 'ELECTRICAL': return 'Electrical';
                    case 'HVAC': return 'HVAC';
                    case 'CLEANING': return 'Cleaning';
                    default: return 'Maintenance';
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
      const response = await fetch(`http://localhost:8081/api/apartments/dropdown?keyword=${keyword}`);
      
      if (!response.ok) {
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

    const reporterId = updateReporterID || localStorage.getItem('userId') || 'default-admin-reporter-id';
    
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
                reporterId: reporterId
            };
            
            await createIssueApi(dataform); 
            
            await fetchIssues(); // Tải lại danh sách

            // Reset form và đóng SlideOut
            setUpdateAppartmentID('');
            setUpdateTitle('');
            setUpdateDescription('');
            setUpdateType('PLUMBING'); 
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


  const filteredIssues = allIssue.filter(issue => {
    
    // ... (Logic lọc status)
    
    // 2. Lọc theo Search Term
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      
      // SỬA LỖI: PHẢI GÁN GIÁ TRỊ MẶC ĐỊNH LÀ CHUỖI RỖNG
      // nếu unit, resident, hay category là null/undefined.
      const unit = issue.unit || ''; 
      const resident = issue.resident || '';
      const category = issue.category || '';
      const title = issue.title || '';

      return (
        unit.toLowerCase().includes(lowerSearch) || // <- Bây giờ unit là chuỗi ('A-508' hoặc '')
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
          <h1 className="text-3xl text-slate-900">Issue Management</h1>
          <p className="text-slate-500 mt-1">Track and manage all service requests</p>
        </div>
        <button 
          onClick={() => setIsNewRequestOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all"
        >
          <Plus className="w-5 h-5" />
          New Request
        </button>
      </div>

      <hr/>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by unit, resident, or service type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6">
        {/* ... (Stats Grid giữ nguyên) ... */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-slate-500 text-sm">Unprocessed</p>
          </div>
          <p className="text-2xl text-slate-900">{allIssue.filter(s => s.status === 'Unprocessed').length}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-slate-500 text-sm">In Progress</p>
          </div>
          <p className="text-2xl text-slate-900">{allIssue.filter(s => s.status === 'In Progress').length}</p>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-slate-500 text-sm">Completed</p>
          </div>
          <p className="text-2xl text-slate-900">{allIssue.filter(s => s.status === 'Completed').length}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-gray-600" />
            </div>
            <p className="text-slate-500 text-sm">Total Issues</p>
          </div>
          <p className="text-2xl text-slate-900">{allIssue.length}</p>
        </div>
      </div>

      <hr/>

      {/* Status Filter Tabs */}
      <div className="flex gap-2">
        {['Unprocessed', 'In Progress', 'Completed', 'All'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-6 py-3 rounded-xl transition-all ${
              statusFilter === status
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {status}
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
          
          const statusClass = 
              service.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' :
              service.status === 'In Progress' ? 'bg-blue-50 text-blue-700' :
              service.status === 'Unprocessed' ? 'bg-orange-50 text-orange-700' :
              'bg-gray-50 text-gray-700';
          
          return (
              <div 
                key={service.id} 
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative" // Thêm relative
                onClick={() => setOpenIssueMenuId(null)} // Đóng menu nếu click ra ngoài
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
                                  
                                  {/* 🌟 PHẦN THÊM MỚI: HIỂN THỊ STATUS 🌟 */}
                                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusClass}`}>
                                      {service.status}
                                  </span>
                              </div>
                          </div>
                      </div>
                      
                      {/* Menu Thao tác (Mới) */}
                      <div className="relative">
                          <button 
                              onClick={(e) => {
                                e.stopPropagation(); // Ngăn chặn sự kiện lan truyền
                                setOpenIssueMenuId(service.id === openIssueMenuId ? null : service.id);
                              }}
                              className="p-1 rounded-full hover:bg-slate-100"
                          >
                            <MoreVertical className="w-5 h-5 text-slate-400 cursor-pointer hover:text-slate-600" />
                          </button>

                          {/* Dropdown Menu */}
                          {openIssueMenuId === service.id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-xl z-20 overflow-hidden">
                                  <div className="py-1 px-3 text-xs text-slate-500 border-b">Change Status</div>
                                  {STATUS_OPTIONS.map(option => (
                                      <button 
                                          key={option.enum}
                                          onClick={(e) => {
                                              e.stopPropagation();
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
                          <span className="text-slate-500">Unit:</span>
                          <span className="text-slate-900 font-medium">#{service.unit}</span> 
                      </div>
                      <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">Resident:</span>
                          <span className="text-slate-900">{service.resident}</span> 
                      </div>
                     
                    
                  </div>                  
              </div>
          );
        })}
      </div>

      <SlideOut
        isOpen={isNewRequestOpen}
        onClose={() => {
            setIsNewRequestOpen(false);
            // Reset form khi đóng
            setUpdateAppartmentID('');
            setApartmentSearchTerm('');
            setSelectedApartmentLabel('');
        }}
        title="New Service Request"
      >
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              
              <div className="relative">
                <label className="block text-sm text-slate-700 mb-2">Tìm kiếm và Chọn Căn hộ</label>
                
                <input
                  type="text"
                  value={apartmentSearchTerm}
                  onChange={(e) => {
                      setApartmentSearchTerm(e.target.value);
                      setUpdateAppartmentID('');
                      setSelectedApartmentLabel(''); 
                  }}
                  placeholder="Nhập số phòng (ví dụ: A-508)"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                
                {/* Hiển thị Dropdown List */}
                {apartmentDropdown.length > 0 && (
                    <div className="absolute z-10 w-full mt-2 border border-slate-200 rounded-xl max-h-40 overflow-y-auto bg-white shadow-xl">
                        {apartmentDropdown.map((apt) => (
                            <div 
                                key={apt.id}
                                onClick={() => handleSelectApartment(apt.id, apt.label)} 
                                className="px-4 py-2 cursor-pointer hover:bg-blue-50 transition-colors text-sm border-b border-slate-100 last:border-b-0"
                            >
                                {apt.label} 
                            </div>
                        ))}
                    </div>
                )}
                
                {/* Trạng thái đã chọn */}
                {selectedApartmentLabel && (
                    <p className="mt-2 text-sm text-emerald-600 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Đã chọn: **{selectedApartmentLabel}**
                    </p>
                )}
              </div>
              
              {/* Category (Type) */}
              <div>
                <label className="block text-sm text-slate-700 mb-2">Category</label>
                <select 
                  value={updateType}
                  onChange={(e) => setUpdateType(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="PLUMBING">Plumbing</option>
                  <option value="ELECTRICAL">Electrical</option>
                  <option value="HVAC">HVAC</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="CLEANING">Cleaning</option>
                  <option value="SECURITY">Security</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm text-slate-700 mb-2">Title</label>
                <input
                  type="text"
                  value={updateTitle}
                  onChange={(e) => setUpdateTitle(e.target.value)}
                  placeholder="Brief description of the issue"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm text-slate-700 mb-2">Description</label>
                <textarea
                  rows={4}
                  value={updateDescription}
                  onChange={(e) => setUpdateDescription(e.target.value)}
                  placeholder="Provide detailed information about the service request..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  required
                />
              </div>

            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsNewRequestOpen(false)}
                className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={!updateApartmentID}
                className={`flex-1 px-6 py-3 text-white rounded-xl transition-all ${
                     !updateApartmentID ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg hover:shadow-blue-500/30'
                }`}
              >
                Create Request
              </button>
            </div>
          </div>
        </form>
      </SlideOut>
    </div>
  );
}
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Search, Plus, Edit, Trash2, MoreVertical, MapPin,ShieldCheck,HomeIcon,Contact, Phone, UserCircle, Mail, Eye, Home, Fingerprint, Globe, Building2, Clock, AlertCircle } from "lucide-react";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dropdown } from "./Dropdown";
import { Modal } from "./Modal";
import React from 'react';
import { Toaster, toast } from 'sonner';

type ResidenceType = 'thuongTru' | 'tamTru' | 'nguoiNuocNgoai';

// 🔥 LOGIC GIẢ LẬP ĐÃ SỬA: Đảm bảo tính nhất quán (Consistent logic application)
const getResidenceType = (resident: any): ResidenceType => {
  if (!resident) return 'thuongTru';
  
  const idCard = String(resident.idCard || '');
  const homeTown = (resident.homeTown || '').toLowerCase();
  
  // Đảm bảo roomNumber luôn là chuỗi chữ hoa để so sánh, xử lý trường hợp null/undefined
  const roomNumber = String(resident.roomNumber || '').toUpperCase(); 
  
 
  
  // 2. NGƯỜI NƯỚC NGOÀI: Giả định nếu ID Card quá ngắn (< 8) hoặc có dấu hiệu không phải quốc tịch VN
  if (idCard.length > 0 && idCard.length < 8 || homeTown.includes('foreign') || homeTown.includes('nước ngoài')) {
       return 'nguoiNuocNgoai';
  }
  
  // 3. THƯỜNG TRÚ (Ưu tiên: Nếu ID là 9 hoặc 12 chữ số)
  if (idCard.length === 9 || idCard.length === 12) {
    return 'thuongTru';
  }
  
  // 4. Fallback (Nếu ID Card bị thiếu/không rõ): Chia đều dựa trên ID của bản ghi để đảm bảo sự đa dạng trong hiển thị
  const idValue = resident.id ? parseInt(String(resident.id).slice(-1)) : 0; // Lấy chữ số cuối của ID
  
  if (idValue % 5 === 0) return 'nguoiNuocNgoai'; 
  if (idValue % 5 === 1 || idValue % 5 === 2) return 'tamTru'; 
  
  return 'thuongTru'; // Mặc định
};

const getResidenceTypeLabel = (type: ResidenceType): string => {
  switch (type) {
    case 'thuongTru':
      return 'Thường trú';
    case 'tamTru':
      return 'Tạm trú';
    case 'nguoiNuocNgoai':
      return 'Người nước ngoài';
    default:
      return '-';
  }
};

const getResidenceTypeColor = (type: ResidenceType): string => {
  switch (type) {
    case 'thuongTru':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'tamTru':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'nguoiNuocNgoai':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getResidenceTypeIcon = (type: ResidenceType) => {
  switch (type) {
    case 'thuongTru':
      return Building2;
    case 'tamTru':
      return Clock;
    case 'nguoiNuocNgoai':
      return Globe;
    default:
      return UserCircle;
  }
};

export function AuthorityResidentManagement() {
  const [residents, setResidents] = useState<any[]>([]); 
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedResident, setSelectedResident] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  useEffect(() => {
    fetchResidents();
  }, []) 

  const fetchResidents = async () => {
    setIsLoading(true);
    setError(null);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); 
    
    try {
      let url = 'http://localhost:8081/api/v1/residents';

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Không thể tải danh sách cư dân. Mã lỗi: ${response.status}`);
      }
      
      const res = await response.json();
      
      // Gắn kèm ResidenceType đã tính toán vào dữ liệu khi fetch thành công
      const residentsWithTypes = (res.data || []).map((resident: any) => ({
        ...resident,
        residenceType: getResidenceType(resident) 
      }));

      setResidents(residentsWithTypes);
      setError(null); 
    }
    catch (err: any) {
      clearTimeout(timeoutId);
      console.error('Error fetching residents:', err);
      
      let errorMessage = 'Không thể kết nối đến server.';
      
      if (err.name === 'AbortError') {
        errorMessage = 'Kết nối quá thời gian. Vui lòng thử lại.';
      } else if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
        errorMessage = 'Lỗi kết nối mạng: Không thể truy cập API.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setResidents([]);
    } finally {
      setIsLoading(false);
    }
  }

  const filteredResidents = (residents || []).filter(resident => {
    if (!resident) return false;
    const searchLower = searchTerm.toLowerCase();
    const fullName = String(resident.fullName || '').toLowerCase();
    const room = String(resident.roomNumber || '').toLowerCase();
    const phone = String(resident.phoneNumber || '').toLowerCase();
    const email = String(resident.email || '').toLowerCase();

    return (
      fullName.includes(searchLower) ||
      room.includes(searchLower) ||
      phone.includes(searchLower) ||
      email.includes(searchLower)
    );
  });

  const handleViewDetail = async (residentId) => {
    setIsLoadingDetail(true);
    setIsViewModalOpen(true);
    setSelectedResident(null); 
    try {
      const response = await fetch(`http://localhost:8081/api/v1/residents/${residentId}`);
      if (!response.ok) {
        throw new Error("Can't get resident detail");
      }
      const res = await response.json();
      
      // Tính toán lại Residence Type cho dữ liệu chi tiết, sử dụng hàm getResidenceType đã sửa
      const detailedResident = {
          ...res.data,
          residenceType: getResidenceType(res.data) 
      };
      
      setSelectedResident(detailedResident);
    } catch (err) {
      toast.error("Lỗi tải thông tin cư dân", { description: err.message });
      setIsViewModalOpen(false);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  return (
    <div className="space-y-6">
      <Toaster />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản Lý Cư Dân</h1>
          <p className="text-gray-600 mt-1">Xem và quản lý thông tin cư dân trong tòa nhà</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-lg">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, số phòng, số điện thoại, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-300"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-100 to-blue-200 border-b border-gray-200 sticky top-0">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700 min-w-[200px]">Tên</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700 min-w-[120px]">Số Phòng</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700 min-w-[150px]">Số Điện Thoại</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700 min-w-[250px]">Email</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700 min-w-[150px]">Tình Trạng</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700 min-w-[120px]">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-gray-600">Đang tải dữ liệu...</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 bg-red-50">
                    <div className="flex flex-col items-center gap-3">
                      <AlertCircle className="w-12 h-12 text-red-500" />
                      <p className="text-red-600 font-medium">Lỗi: {error}</p>
                      <button
                        onClick={fetchResidents}
                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                      >
                        Thử lại
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filteredResidents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500 bg-gray-50">
                    Không tìm thấy cư dân nào
                  </td>
                </tr>
              ) : (
                filteredResidents.map((resident) => {
                  const residenceType = resident.residenceType as ResidenceType; 
                  const Icon = getResidenceTypeIcon(residenceType);
                  return (
                    <tr key={resident.id} className="hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <UserCircle className="w-5 h-5 text-blue-600" />
                          </div>
                          <span className="text-gray-900 font-medium">{resident.fullName || '-'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-800 font-semibold">{resident.roomNumber || '-'}</td>
                      <td className="px-6 py-4 text-gray-800">{resident.phoneNumber || '-'}</td>
                      <td className="px-6 py-4 text-gray-800 truncate max-w-[250px]">{resident.email || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium border shadow-sm ${getResidenceTypeColor(residenceType)}`}>
                          <Icon className="w-4 h-4" />
                          {getResidenceTypeLabel(residenceType)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleViewDetail(resident.id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors inline-flex items-center gap-2 text-sm shadow-md"
                        >
                          <Eye className="w-4 h-4" />
                          Xem Chi Tiết
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isViewModalOpen && selectedResident && (
    <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
            setIsViewModalOpen(false);
            setSelectedResident(null);
        }}
        title="Chi Tiết Cư Dân"
        size="lg"
    >
        {isLoadingDetail ? (
            <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="ml-3 text-lg text-gray-500">Đang tải chi tiết cư dân...</p>
            </div>
        ) : (
            <div className="p-4 space-y-8"> 
                
                {/* 1. THÔNG TIN TÓM TẮT QUAN TRỌNG (Tên và Phòng) */}
                <div className="bg-blue-50 border border-blue-300 rounded-2xl p-6 shadow-lg flex items-center justify-between">
                    {/* Họ và Tên */}
                    <div className='flex items-center gap-4'>
                        <UserCircle className='w-10 h-10 text-blue-600' />
                        <div>
                            <dt className="text-base font-bold uppercase text-blue-600 tracking-wide">HỌ VÀ TÊN</dt>
                            <dd className="text-3xl font-extrabold text-blue-900 mt-1">
                                {selectedResident.fullName || 'Chưa cung cấp'}
                            </dd>
                        </div>
                    </div>

                    {/* Số Phòng */}
                    <div className="text-right">
                        <dt className="text-base font-bold uppercase text-orange-600 tracking-wide">SỐ PHÒNG</dt>
                        <dd className="text-3xl font-extrabold text-orange-700 mt-1 flex items-center gap-2 justify-end">
                            <HomeIcon className='w-8 h-8 text-orange-500'/>
                            {selectedResident.roomNumber || 'N/A'}
                        </dd>
                    </div>
                </div>

                {/* 2. NỘI DUNG CHÍNH - Chia thành 2 cột lớn */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* CỘT 1 & 2: THÔNG TIN CÁ NHÂN & LIÊN HỆ (2/3 chiều rộng) */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* A. Thông tin Cá nhân */}
                        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-xl">
                            <h4 className="flex items-center text-xl font-bold text-gray-800 mb-6 border-b pb-4 border-gray-300">
                                <UserCircle className="w-7 h-7 mr-3 text-blue-600" />
                                Chi Tiết Cá nhân
                            </h4>
                            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
                                
                                {/* CMND/CCCD */}
                                <div>
                                    <dt className="text-sm font-semibold uppercase text-gray-500 tracking-wide flex items-center gap-2">
                                        <Fingerprint className="w-4 h-4 text-purple-500" />
                                        CMND/CCCD
                                    </dt>
                                    <dd className="text-lg text-gray-900 font-extrabold mt-1">{selectedResident.idCard || 'N/A'}</dd>
                                </div>
                                
                                {/* Ngày Sinh */}
                                <div>
                                    <dt className="text-sm font-semibold uppercase text-gray-500 tracking-wide flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-pink-500" />
                                        Ngày Sinh
                                    </dt>
                                    <dd className="text-lg text-gray-800 font-semibold mt-1">{selectedResident.dob || 'N/A'}</dd>
                                </div>
                                
                                {/* Quê Quán */}
                                <div className="col-span-1 sm:col-span-2">
                                    <dt className="text-sm font-semibold uppercase text-gray-500 tracking-wide flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-red-500" />
                                        Quê Quán
                                    </dt>
                                    <dd className="text-lg text-gray-800 font-semibold mt-1">{selectedResident.homeTown || 'N/A'}</dd>
                                </div>
                                
                            </dl>
                        </div>

                        {/* B. Thông tin Liên hệ */}
                        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-xl">
                            <h4 className="flex items-center text-xl font-bold text-gray-800 mb-6 border-b pb-4 border-gray-300">
                                <Contact className="w-7 h-7 mr-3 text-blue-600" />
                                Thông tin Liên hệ
                            </h4>
                            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
                                
                                {/* Số Điện Thoại */}
                                <div>
                                    <dt className="text-sm font-semibold uppercase text-gray-500 tracking-wide flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-green-600" />
                                        Số Điện Thoại
                                    </dt>
                                    <dd className="text-xl text-green-700 font-extrabold mt-1">{selectedResident.phoneNumber || 'N/A'}</dd>
                                </div>
                                
                                {/* Email */}
                                <div>
                                    <dt className="text-sm font-semibold uppercase text-gray-500 tracking-wide flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-blue-600" />
                                        Email
                                    </dt>
                                    <dd className="text-lg text-blue-600 font-semibold hover:underline mt-1">{selectedResident.email || 'N/A'}</dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                    {/* CỘT 3: TRẠNG THÁI (1/3 chiều rộng) */}
                    <div className="lg:col-span-1">
                        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-xl h-full">
                            <h4 className="flex items-center text-xl font-bold text-gray-800 mb-6 border-b pb-4 border-gray-300">
                                <ShieldCheck className="w-7 h-7 mr-3 text-blue-600" />
                                Trạng Thái
                            </h4>
                            <dl className="space-y-8">
                                
                                {/* Trạng Thái Hệ thống */}
                                <div>
                                    <dt className="text-sm font-semibold uppercase text-gray-500 tracking-wide flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 text-gray-500" />
                                        Active/Inactive
                                    </dt>
                                    <div className='mt-2'>
                                        <span className={`inline-flex items-center px-4 py-2 rounded-full text-base font-bold transition-colors ${ 
                                            selectedResident.status === 'ACTIVE' ? 'bg-green-100 text-green-800 border border-green-400 shadow-md' : 'bg-red-100 text-red-800 border border-red-400 shadow-md'
                                        }`}>
                                            {selectedResident.status || 'Chưa xác định'}
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Tình Trạng Cư Trú */}
                                <div>
                                    <dt className="text-sm font-semibold uppercase text-gray-500 tracking-wide flex items-center gap-2">
                                        <Home className="w-4 h-4 text-indigo-500" />
                                        Tình Trạng Cư Trú
                                    </dt>
                                    <div className="mt-2">
                                        {selectedResident && (() => {
                                            const residenceType = selectedResident.residenceType as ResidenceType; 
                                            const Icon = getResidenceTypeIcon(residenceType);
                                            return (
                                                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-base font-bold border shadow-md transition-colors ${getResidenceTypeColor(residenceType)}`}>
                                                    <Icon className="w-5 h-5" />
                                                    {getResidenceTypeLabel(residenceType)}
                                                </span>
                                            );
                                        })()}
                                    </div>
                                </div>
                                
                            </dl>
                        </div>
                    </div>

                </div>

               
            </div>
        )}
    </Modal>
)}

      
    </div>
  );
}
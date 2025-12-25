import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Search, Plus, Edit, Trash2, MoreVertical, MapPin,ShieldCheck,HomeIcon,Contact, Phone, UserCircle, Mail, Eye, Home, Fingerprint, Globe, Building2, Clock, AlertCircle, Users, Key, UserCheck, UserMinus, Download, ChevronDown } from "lucide-react";
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

// Mock data for development
const MOCK_RESIDENTS = [
  {
    id: 1,
    fullName: 'Nguyễn Văn A',
    roomNumber: 'L81-12.05',
    phoneNumber: '0987654321',
    email: 'nguyenvana@example.com',
    type: 'Chủ hộ',
    status: 'Thường trú',
    avatar: 'https://ui-avatars.com/api/?name=Nguyễn+Văn+A&background=3b82f6&color=fff'
  },
  {
    id: 2,
    fullName: 'Trần Thị B',
    roomNumber: 'L81-20.01',
    phoneNumber: '0912345678',
    email: 'tranthib@example.com',
    type: 'Khách thuê',
    status: 'Thường trú',
    avatar: 'https://ui-avatars.com/api/?name=Trần+Thị+B&background=10b981&color=fff'
  },
  {
    id: 3,
    fullName: 'Lê Văn C',
    roomNumber: 'L81-15.08',
    phoneNumber: '0923456789',
    email: 'levanc@example.com',
    type: 'Chủ hộ',
    status: 'Tạm vắng',
    avatar: 'https://ui-avatars.com/api/?name=Lê+Văn+C&background=f59e0b&color=fff'
  },
  {
    id: 4,
    fullName: 'Phạm Thị D',
    roomNumber: 'L81-08.12',
    phoneNumber: '0934567890',
    email: 'phamthid@example.com',
    type: 'Khách thuê',
    status: 'Thường trú',
    avatar: 'https://ui-avatars.com/api/?name=Phạm+Thị+D&background=8b5cf6&color=fff'
  },
  {
    id: 5,
    fullName: 'Hoàng Văn E',
    roomNumber: 'L81-22.03',
    phoneNumber: '0945678901',
    email: 'hoangvane@example.com',
    type: 'Chủ hộ',
    status: 'Thường trú',
    avatar: 'https://ui-avatars.com/api/?name=Hoàng+Văn+E&background=ef4444&color=fff'
  },
  {
    id: 6,
    fullName: 'Vũ Thị F',
    roomNumber: 'L81-11.07',
    phoneNumber: '0956789012',
    email: 'vuthif@example.com',
    type: 'Khách thuê',
    status: 'Tạm vắng',
    avatar: 'https://ui-avatars.com/api/?name=Vũ+Thị+F&background=06b6d4&color=fff'
  },
  {
    id: 7,
    fullName: 'Đỗ Văn G',
    roomNumber: 'L81-18.09',
    phoneNumber: '0967890123',
    email: 'dovang@example.com',
    type: 'Chủ hộ',
    status: 'Thường trú',
    avatar: 'https://ui-avatars.com/api/?name=Đỗ+Văn+G&background=ec4899&color=fff'
  }
];

export function AuthorityResidentManagement() {
  // Temporarily use mock data instead of API
  const [residents, setResidents] = useState<any[]>(MOCK_RESIDENTS); 
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const [selectedResident, setSelectedResident] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Calculate statistics from mock data
  const stats = {
    total: residents.length,
    owners: residents.filter(r => r.type === 'Chủ hộ').length,
    tenants: residents.filter(r => r.type === 'Khách thuê').length,
    away: residents.filter(r => r.status === 'Tạm vắng').length,
  };

  const buildingOptions = [
    { value: 'all', label: 'Tất cả tòa nhà' },
    { value: 'building1', label: 'Tòa nhà A' },
    { value: 'building2', label: 'Tòa nhà B' },
  ];

  const statusOptions = [
    { value: 'all', label: 'Tất cả trạng thái' },
    { value: 'Thường trú', label: 'Thường trú' },
    { value: 'Tạm vắng', label: 'Tạm vắng' },
  ];

  const getFixedSelectWidth = (options: { label: string }[]) => {
    const maxLen = options.reduce((max, opt) => Math.max(max, opt.label.length), 0);
    return `calc(${maxLen}ch + 5.5rem)`;
  };

  const buildingSelectWidth = getFixedSelectWidth(buildingOptions);
  const statusSelectWidth = getFixedSelectWidth(statusOptions);

  // Comment out API call temporarily
  // useEffect(() => {
  //   fetchResidents();
  // }, []) 

  // const fetchResidents = async () => {
  //   setIsLoading(true);
  //   setError(null);
  //   
  //   const controller = new AbortController();
  //   const timeoutId = setTimeout(() => controller.abort(), 10000); 
  //   
  //   try {
  //     let url = 'http://localhost:8081/api/v1/residents';

  //     const response = await fetch(url, {
  //       method: 'GET',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       signal: controller.signal,
  //     });
  //     
  //     clearTimeout(timeoutId);
  //     
  //     if (!response.ok) {
  //       throw new Error(`Không thể tải danh sách cư dân. Mã lỗi: ${response.status}`);
  //     }
  //     
  //     const res = await response.json();
  //     
  //     // Gắn kèm ResidenceType đã tính toán vào dữ liệu khi fetch thành công
  //     const residentsWithTypes = (res.data || []).map((resident: any) => ({
  //       ...resident,
  //       residenceType: getResidenceType(resident) 
  //     }));

  //     setResidents(residentsWithTypes);
  //     setError(null); 
  //   }
  //   catch (err: any) {
  //     clearTimeout(timeoutId);
  //     console.error('Error fetching residents:', err);
  //     
  //     let errorMessage = 'Không thể kết nối đến server.';
  //     
  //     if (err.name === 'AbortError') {
  //       errorMessage = 'Kết nối quá thời gian. Vui lòng thử lại.';
  //     } else if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
  //       errorMessage = 'Lỗi kết nối mạng: Không thể truy cập API.';
  //     } else if (err.message) {
  //       errorMessage = err.message;
  //     }
  //     
  //     setError(errorMessage);
  //     setResidents([]);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }

  const filteredResidents = (residents || []).filter(resident => {
    if (!resident) return false;
    const searchLower = searchTerm.toLowerCase();
    const fullName = String(resident.fullName || '').toLowerCase();
    const room = String(resident.roomNumber || '').toLowerCase();
    const phone = String(resident.phoneNumber || '').toLowerCase();
    const email = String(resident.email || '').toLowerCase();

    const matchesSearch = (
      fullName.includes(searchLower) ||
      room.includes(searchLower) ||
      phone.includes(searchLower) ||
      email.includes(searchLower)
    );

    const matchesBuilding = selectedBuilding === 'all' || true; // Mock: all buildings
    const matchesStatus = selectedStatus === 'all' || resident.status === selectedStatus;

    return matchesSearch && matchesBuilding && matchesStatus;
  });

  const handleViewDetail = async (residentId) => {
    setIsLoadingDetail(true);
    setIsViewModalOpen(true);
    setSelectedResident(null); 
    try {
      // Use mock data instead of API call
      const resident = MOCK_RESIDENTS.find(r => r.id === residentId);
      if (resident) {
        // Add mock detail fields
        const detailedResident = {
          ...resident,
          idCard: '001234567890',
          dob: '01/01/1990',
          homeTown: 'Hà Nội',
          status: 'ACTIVE',
          residenceType: resident.status === 'Thường trú' ? 'thuongTru' : 'tamTru'
        };
        setSelectedResident(detailedResident);
      } else {
        throw new Error("Không tìm thấy cư dân");
      }
    } catch (err: any) {
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
          <h1 className="text-3xl font-bold text-gray-900">Quản lý cư dân</h1>
        </div>
      </div>

      {/* Top Statistics Section - 4 Cards */}
      <div className="grid grid-cols-4 gap-4">
        {/* Card 1: Tổng cư dân (Deep Navy Blue) */}
        <div className="bg-slate-800 flex justify-between items-center p-6 rounded-xl shadow-md h-32 relative overflow-hidden" style={{ backgroundColor: '#1e3a8a' }}>
          <div className="flex flex-col">
            <p className="text-4xl font-bold text-white">{stats.total}</p>
            <p className="text-sm font-medium mt-1 opacity-90 text-white">Tổng cư dân</p>
          </div>
          <Users className="h-12 w-12 text-white" />
        </div>

        {/* Card 2: Chủ hộ (Green/Teal) */}
        <div className="bg-emerald-500 flex justify-between items-center p-6 rounded-xl shadow-md h-32 relative overflow-hidden" style={{ backgroundColor: '#10b981' }}>
          <div className="flex flex-col">
            <p className="text-4xl font-bold text-white">{stats.owners}</p>
            <p className="text-sm font-medium mt-1 opacity-90 text-white">Chủ hộ</p>
          </div>
          <Key className="h-12 w-12 text-white" />
        </div>

        {/* Card 3: Khách thuê (Orange) */}
        <div className="bg-orange-500 flex justify-between items-center p-6 rounded-xl shadow-md h-32 relative overflow-hidden" style={{ backgroundColor: '#f97316' }}>
          <div className="flex flex-col">
            <p className="text-4xl font-bold text-white">{stats.tenants}</p>
            <p className="text-sm font-medium mt-1 opacity-90 text-white">Khách thuê</p>
          </div>
          <UserCheck className="h-12 w-12 text-white" />
        </div>

        {/* Card 4: Tạm vắng (Bright Blue) */}
        <div className="bg-blue-500 flex justify-between items-center p-6 rounded-xl shadow-md h-32 relative overflow-hidden" style={{ backgroundColor: '#3b82f6' }}>
          <div className="flex flex-col">
            <p className="text-4xl font-bold text-white">{stats.away}</p>
            <p className="text-sm font-medium mt-1 opacity-90 text-white">Tạm vắng</p>
          </div>
          <UserMinus className="h-12 w-12 text-white" />
        </div>
      </div>

      {/* Toolbar: Search & Filters - Professional Rebuild */}
      <div className="flex items-center justify-between gap-6 w-full bg-white p-2 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-100 mb-6">
        {/* Search Bar (Left) */}
        <div className="relative w-1/3">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
          <input
            type="text"
            placeholder="Tìm tên, căn hộ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-gray-50/50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all placeholder:text-gray-400 outline-none"
          />
        </div>

        {/* Actions Group (Right - Sát bên phải) */}
        <div className="flex items-center gap-4">
          {/* Building Dropdown */}
          <div style={{ width: buildingSelectWidth }}>
            <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
              <SelectTrigger className="flex items-center justify-between w-full h-11 px-4 bg-white border border-gray-200 rounded-xl shadow-sm text-sm font-medium text-gray-700 hover:border-blue-400 transition-all">
                <SelectValue placeholder="Tất cả tòa nhà" />
              </SelectTrigger>
              <SelectContent
                align="start"
                style={{ width: buildingSelectWidth }}
                className="z-[100] rounded-xl border border-gray-200 !bg-white shadow-xl ring-1 ring-gray-200/70"
              >
                {buildingOptions.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    className="cursor-pointer rounded-lg px-3 py-2 text-sm text-gray-700 outline-none data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-700 data-[state=checked]:bg-blue-100 data-[state=checked]:font-semibold data-[state=checked]:text-blue-800"
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Dropdown */}
          <div style={{ width: statusSelectWidth }}>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="flex items-center justify-between w-full h-11 px-4 bg-white border border-gray-200 rounded-xl shadow-sm text-sm font-medium text-gray-700 hover:border-blue-400 transition-all">
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent
                align="start"
                style={{ width: statusSelectWidth }}
                className="z-[100] rounded-xl border border-gray-200 !bg-white shadow-xl ring-1 ring-gray-200/70"
              >
                {statusOptions.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    className="cursor-pointer rounded-lg px-3 py-2 text-sm text-gray-700 outline-none data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-700 data-[state=checked]:bg-blue-100 data-[state=checked]:font-semibold data-[state=checked]:text-blue-800"
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Export Button */}
          <button className="h-12 bg-blue-600 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-500/25 whitespace-nowrap px-4">
            <Download className="w-4 h-4" />
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cư dân</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Căn hộ</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Vai trò</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-gray-600">Đang tải dữ liệu...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredResidents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500 bg-gray-50">
                    Không tìm thấy cư dân nào
                  </td>
                </tr>
              ) : (
                filteredResidents.map((resident) => {
                  return (
                    <tr key={resident.id} className="hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100 last:border-0">
                      {/* Cư dân: Avatar + Name + Email */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={resident.avatar} 
                            alt={resident.fullName}
                            className="w-10 h-10 rounded-full bg-gray-200"
                            onError={(e) => {
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(resident.fullName)}&background=3b82f6&color=fff`;
                            }}
                          />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">{resident.fullName || '-'}</span>
                            <span className="text-xs text-gray-500">{resident.email || '-'}</span>
                          </div>
                        </div>
                      </td>
                      
                      {/* Căn hộ: Badge */}
                      <td className="px-6 py-4">
                        <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                          {resident.roomNumber || '-'}
                        </span>
                      </td>
                      
                      {/* Vai trò: Badge */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                          resident.type === 'Chủ hộ' 
                            ? 'bg-green-50 text-green-700 border border-green-100' 
                            : 'bg-blue-50 text-blue-700 border border-blue-100'
                        }`}>
                          {resident.type || '-'}
                        </span>
                      </td>
                      
                      {/* Trạng thái: Dot + Text */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            resident.status === 'Thường trú' 
                              ? 'bg-green-500' 
                              : 'bg-amber-500'
                          }`}></div>
                          <span className="text-sm text-gray-700">
                            {resident.status === 'Thường trú' ? 'Đang ở' : 'Tạm vắng'}
                          </span>
                        </div>
                      </td>
                      
                      {/* Thao tác: Ghost button */}
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleViewDetail(resident.id)}
                          className="text-sm font-medium text-gray-600 hover:text-gray-900 hover:underline transition-colors"
                        >
                          Xem chi tiết
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
        title="Chi tiết cư dân"
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
                            <dt className="text-base font-bold text-blue-600 tracking-wide">Họ và tên</dt>
                            <dd className="text-3xl font-extrabold text-blue-900 mt-1">
                                {selectedResident.fullName || 'Chưa cung cấp'}
                            </dd>
                        </div>
                    </div>

                    {/* Số Phòng */}
                    <div className="text-right">
                        <dt className="text-base font-bold text-orange-600 tracking-wide">Số phòng</dt>
                        <dd className="text-3xl font-extrabold text-orange-700 mt-1 flex items-center gap-2 justify-end">
                            <HomeIcon className='w-8 h-8 text-orange-500'/>
                            {selectedResident.roomNumber || 'Chưa có'}
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
                                Chi tiết cá nhân
                            </h4>
                            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
                                
                                {/* CMND/CCCD */}
                                <div>
                                    <dt className="text-sm font-semibold text-gray-500 tracking-wide flex items-center gap-2">
                                        <Fingerprint className="w-4 h-4 text-purple-500" />
                                        CMND/CCCD
                                    </dt>
                                    <dd className="text-lg text-gray-900 font-extrabold mt-1">{selectedResident.idCard || 'Chưa có'}</dd>
                                </div>
                                
                                {/* Ngày Sinh */}
                                <div>
                                    <dt className="text-sm font-semibold text-gray-500 tracking-wide flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-pink-500" />
                                        Ngày sinh
                                    </dt>
                                    <dd className="text-lg text-gray-800 font-semibold mt-1">{selectedResident.dob || 'Chưa có'}</dd>
                                </div>
                                
                                {/* Quê Quán */}
                                <div className="col-span-1 sm:col-span-2">
                                    <dt className="text-sm font-semibold text-gray-500 tracking-wide flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-red-500" />
                                        Quê quán
                                    </dt>
                                    <dd className="text-lg text-gray-800 font-semibold mt-1">{selectedResident.homeTown || 'Chưa có'}</dd>
                                </div>
                                
                            </dl>
                        </div>

                        {/* B. Thông tin Liên hệ */}
                        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-xl">
                            <h4 className="flex items-center text-xl font-bold text-gray-800 mb-6 border-b pb-4 border-gray-300">
                                <Contact className="w-7 h-7 mr-3 text-blue-600" />
                                Thông tin liên hệ
                            </h4>
                            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
                                
                                {/* Số Điện Thoại */}
                                <div>
                                    <dt className="text-sm font-semibold text-gray-500 tracking-wide flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-green-600" />
                                        Số điện thoại
                                    </dt>
                                    <dd className="text-xl text-green-700 font-extrabold mt-1">{selectedResident.phoneNumber || 'Chưa có'}</dd>
                                </div>
                                
                                {/* Email */}
                                <div>
                                    <dt className="text-sm font-semibold uppercase text-gray-500 tracking-wide flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-blue-600" />
                                        Email
                                    </dt>
                                    <dd className="text-lg text-blue-600 font-semibold hover:underline mt-1">{selectedResident.email || 'Chưa có'}</dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                    {/* CỘT 3: TRẠNG THÁI (1/3 chiều rộng) */}
                    <div className="lg:col-span-1">
                        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-xl h-full">
                            <h4 className="flex items-center text-xl font-bold text-gray-800 mb-6 border-b pb-4 border-gray-300">
                                <ShieldCheck className="w-7 h-7 mr-3 text-blue-600" />
                                Trạng thái
                            </h4>
                            <dl className="space-y-8">
                                
                                {/* Trạng Thái Hệ thống */}
                                <div>
                                    <dt className="text-sm font-semibold text-gray-500 tracking-wide flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 text-gray-500" />
                                        Trạng thái hoạt động
                                    </dt>
                                    <div className='mt-2'>
                                        <span className={`inline-flex items-center px-4 py-2 rounded-full text-base font-bold transition-colors ${ 
                                            selectedResident.status === 'ACTIVE' ? 'bg-green-100 text-green-800 border border-green-400 shadow-md' : 'bg-red-100 text-red-800 border border-red-400 shadow-md'
                                        }`}>
                                            {selectedResident.status === 'ACTIVE' ? 'Đang hoạt động' : selectedResident.status === 'INACTIVE' ? 'Không hoạt động' : 'Chưa xác định'}
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Tình Trạng Cư Trú */}
                                <div>
                                    <dt className="text-sm font-semibold text-gray-500 tracking-wide flex items-center gap-2">
                                        <Home className="w-4 h-4 text-indigo-500" />
                                        Tình trạng cư trú
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

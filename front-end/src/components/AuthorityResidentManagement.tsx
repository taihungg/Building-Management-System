import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Search, Plus, Edit, Trash2, MoreVertical, MapPin, ShieldCheck, HomeIcon, Contact, Phone, UserCircle, Mail, Eye, Home, Fingerprint, Globe, Building2, Clock, AlertCircle, Users, Key, UserCheck, UserMinus, Download, ChevronDown, UserX } from "lucide-react";
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

const getResidenceTypeLabel = (type: ResidenceType | string): string => {
  if (typeof type === 'string') {
    if (type === 'Thường trú') return 'Thường trú';
    if (type === 'Tạm trú') return 'Tạm trú';
    if (type === 'Tạm vắng') return 'Tạm vắng';
    if (type === 'Lưu trú') return 'Lưu trú';
  }
  switch (type) {
    case 'thuongTru':
      return 'Thường trú';
    case 'tamTru':
      return 'Tạm trú';
    case 'tamVang':
      return 'Tạm vắng';
    case 'vangLai':
      return 'Lưu trú';
    case 'nguoiNuocNgoai':
      return 'Người nước ngoài';
    default:
      return '-';
  }
};

const getResidenceTypeColor = (type: ResidenceType | string): string => {
  if (typeof type === 'string') {
    if (type === 'Thường trú') return 'bg-green-100 text-green-800 border-green-300';
    if (type === 'Tạm trú') return 'bg-orange-100 text-orange-800 border-orange-300';
    if (type === 'Tạm vắng') return 'bg-blue-100 text-blue-800 border-blue-300';
    if (type === 'Lưu trú') return 'bg-purple-100 text-purple-800 border-purple-300';
  }
  switch (type) {
    case 'thuongTru':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'tamTru':
      return 'bg-orange-100 text-orange-800 border-orange-300';
    case 'tamVang':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'vangLai':
      return 'bg-purple-100 text-purple-800 border-purple-300';
    case 'nguoiNuocNgoai':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

const getResidenceTypeIcon = (type: ResidenceType | string) => {
  if (typeof type === 'string') {
    if (type === 'Thường trú') return Building2;
    if (type === 'Tạm trú') return Clock;
    if (type === 'Tạm vắng') return Clock;
    if (type === 'Vãng lai') return Globe;
  }
  switch (type) {
    case 'thuongTru':
      return Building2;
    case 'tamTru':
      return Clock;
    case 'tamVang':
      return Clock;
    case 'vangLai':
      return Globe;
    case 'nguoiNuocNgoai':
      return Globe;
    default:
      return UserCircle;
  }
};

export function AuthorityResidentManagement() {
  // TODO: Fetch residents from API
  const [residents, setResidents] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [includeInactive, setIncludeInactive] = useState(false);

  const [selectedResident, setSelectedResident] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Map API status to Vietnamese
  const mapStatusToVietnamese = (status: string): string => {
    switch (status) {
      case 'PERMANENT_RESIDENCE':
        return 'Thường trú';
      case 'TEMPORARY_RESIDENCE':
        return 'Tạm trú';
      case 'TEMPORARY_ABSENCE':
        return 'Tạm vắng';
      case 'VISITOR':
        return 'Lưu trú';
      default:
        return status; // Fallback nếu không match
    }
  };

  // Map status to residenceType (dùng chung)
  const getResidenceTypeFromStatus = (status: string) => {
    if (status === 'PERMANENT_RESIDENCE' || status === 'Thường trú' || status === 'THUONG_TRU') return 'thuongTru';
    if (status === 'TEMPORARY_RESIDENCE' || status === 'Tạm trú' || status === 'TAM_TRU') return 'tamTru';
    if (status === 'TEMPORARY_ABSENCE' || status === 'Tạm vắng' || status === 'TAM_VANG') return 'tamVang';
    if (status === 'VISITOR' || status === 'Vãng lai' || status === 'VANG_LAI') return 'vangLai';
    return 'thuongTru'; // default
  };

  // Calculate statistics - 4 trạng thái từ API
  const stats = {
    total: residents.length,
    thuongTru: residents.filter(r => r.status === 'PERMANENT_RESIDENCE').length,
    tamTru: residents.filter(r => r.status === 'TEMPORARY_RESIDENCE').length,
    tamVang: residents.filter(r => r.status === 'TEMPORARY_ABSENCE').length,
    vangLai: residents.filter(r => r.status === 'VISITOR').length,
  };


  const statusOptions = [
    { value: 'all', label: 'Tất cả trạng thái' },
    { value: 'PERMANENT_RESIDENCE', label: 'Thường trú' },
    { value: 'TEMPORARY_RESIDENCE', label: 'Tạm trú' },
    { value: 'TEMPORARY_ABSENCE', label: 'Tạm vắng' },
    { value: 'VISITOR', label: 'Lưu trú' },
  ];

  const getFixedSelectWidth = (options: { label: string }[]) => {
    const maxLen = options.reduce((max, opt) => Math.max(max, opt.label.length), 0);
    return `calc(${maxLen}ch + 5.5rem)`;
  };

  const statusSelectWidth = getFixedSelectWidth(statusOptions);

  useEffect(() => {
    fetchResidents();
  }, [includeInactive]);

  const fetchResidents = async () => {
    setIsLoading(true);
    setError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      // Thêm parameter include_inactive vào URL
      const params = new URLSearchParams();
      if (includeInactive) {
        params.append('include_inactive', 'true');
      }
      const queryString = params.toString();
      let url = `https://untoasted-jean-unsympathisingly.ngrok-free.dev/api/v1/residents${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Không thể tải danh sách cư dân. Mã lỗi: ${response.status}`);
      }

      const res = await response.json();
      console.log('Resident Management - Fetched:', res.data?.length || 0, 'residents');

      // Gắn kèm ResidenceType đã tính toán vào dữ liệu khi fetch thành công
      const residentsWithTypes = (res.data || []).map((resident: any) => ({
        ...resident,
        residenceType: getResidenceType(resident),
        // Generate avatar URL từ tên nếu không có avatar
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(resident.fullName || '')}&background=3b82f6&color=fff`,
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
    const phone = String(resident.phone || resident.phoneNumber || '').toLowerCase();
    const email = String(resident.email || '').toLowerCase();

    const matchesSearch = (
      fullName.includes(searchLower) ||
      room.includes(searchLower) ||
      phone.includes(searchLower) ||
      email.includes(searchLower)
    );

    const matchesStatus = selectedStatus === 'all' || resident.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  // Export CSV function
  const handleExportReport = () => {
    try {
      // Prepare CSV data
      const headers = ['Tên cư dân', 'Email', 'Số điện thoại', 'Căn hộ', 'Trạng thái'];
      const csvRows = [
        headers.join(','),
        ...filteredResidents.map((resident: any) => {
          const statusVi = mapStatusToVietnamese(resident.status || '');
          return [
            `"${resident.fullName || ''}"`,
            `"${resident.email || ''}"`,
            `"\t${resident.phone || resident.phoneNumber || ''}"`,
            `"${resident.roomNumber || ''}"`,
            `"${statusVi}"`
          ].join(',');
        })
      ];

      // Create blob and download
      const csvContent = csvRows.join('\n');
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `danh_sach_cu_dan_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Xuất báo cáo thành công!');
    } catch (err: any) {
      toast.error('Lỗi xuất báo cáo', { description: err.message });
    }
  };

  const handleViewDetail = async (residentId) => {
    setIsLoadingDetail(true);
    setIsViewModalOpen(true);
    setSelectedResident(null);
    try {
      const response = await fetch(`https://untoasted-jean-unsympathisingly.ngrok-free.dev/api/v1/residents/${residentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
      });
      if (!response.ok) {
        throw new Error("Không thể tải thông tin cư dân");
      }
      const res = await response.json();
      const data = res.data;

      // Map API response to component format
      const apiStatus = data.status || data.residenceStatus || 'PERMANENT_RESIDENCE';
      const detailedResident = {
        ...data,
        status: apiStatus, // Giữ nguyên API status (PERMANENT_RESIDENCE, etc.)
        statusVi: mapStatusToVietnamese(apiStatus), // Thêm status tiếng Việt
        residenceType: getResidenceTypeFromStatus(apiStatus)
      };
      setSelectedResident(detailedResident);
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
        {/* Card 1: Thường trú (Green) */}
        <div className="flex justify-between items-center p-6 rounded-xl shadow-md h-32 relative overflow-hidden" style={{ backgroundColor: '#10b981' }}>
          <div className="flex flex-col">
            <p className="text-4xl font-bold text-white">{stats.thuongTru}</p>
            <p className="text-sm font-medium mt-1 text-white">Thường trú</p>
          </div>
          <Building2 className="h-12 w-12 text-white opacity-80" />
        </div>

        {/* Card 2: Tạm trú (Orange) */}
        <div className="flex justify-between items-center p-6 rounded-xl shadow-md h-32 relative overflow-hidden" style={{ backgroundColor: '#f59e0b' }}>
          <div className="flex flex-col">
            <p className="text-4xl font-bold text-white">{stats.tamTru}</p>
            <p className="text-sm font-medium mt-1 text-white">Tạm trú</p>
          </div>
          <Clock className="h-12 w-12 text-white opacity-80" />
        </div>

        {/* Card 3: Tạm vắng (Blue) */}
        <div className="flex justify-between items-center p-6 rounded-xl shadow-md h-32 relative overflow-hidden" style={{ backgroundColor: '#3b82f6' }}>
          <div className="flex flex-col">
            <p className="text-4xl font-bold text-white">{stats.tamVang}</p>
            <p className="text-sm font-medium mt-1 text-white">Tạm vắng</p>
          </div>
          <UserMinus className="h-12 w-12 text-white opacity-80" />
        </div>

        {/* Card 4: Lưu trú (Purple) */}
        <div className="flex justify-between items-center p-6 rounded-xl shadow-md h-32 relative overflow-hidden" style={{ backgroundColor: '#8b5cf6' }}>
          <div className="flex flex-col">
            <p className="text-4xl font-bold text-white">{stats.vangLai}</p>
            <p className="text-sm font-medium mt-1 text-white">Lưu trú</p>
          </div>
          <Globe className="h-12 w-12 text-white opacity-80" />
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
          {/* Status Dropdown */}
          <div style={{ width: statusSelectWidth }}>
            <style>{`
              [data-slot="select-content"] [data-slot="select-item"] > span:first-child {
                display: none !important;
              }
            `}</style>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="flex items-center justify-between w-full h-11 px-4 bg-white border border-gray-200 rounded-xl shadow-sm text-sm font-medium text-gray-700 hover:border-blue-400 transition-all">
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent
                align="start"
                style={{ width: statusSelectWidth, backgroundColor: '#ffffff' }}
                className="z-[100] rounded-xl border border-gray-200 !bg-white shadow-xl ring-1 ring-gray-200/70"
              >
                {statusOptions.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    className="cursor-pointer rounded-lg px-3 py-2 text-sm text-gray-700 outline-none data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-700 data-[state=checked]:bg-blue-100 data-[state=checked]:font-semibold data-[state=checked]:text-blue-800 pr-3"
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Include Inactive Checkbox */}
          <div style={{ width: statusSelectWidth }}>
            <label className="flex items-center gap-2 w-full h-12 px-4 bg-white border border-gray-200 rounded-xl shadow-sm text-sm font-medium text-gray-700 hover:border-blue-400 transition-all cursor-pointer">
              <input
                type="checkbox"
                checked={includeInactive}
                onChange={(e) => setIncludeInactive(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer transition-all"
              />
              <span className="whitespace-nowrap text-gray-700">
                Bao gồm đã chuyển đi
              </span>
            </label>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExportReport}
            disabled={filteredResidents.length === 0}
            className="h-12 bg-blue-600 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-500/25 whitespace-nowrap px-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
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
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-gray-600">Đang tải dữ liệu...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredResidents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-500 bg-gray-50">
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
                            src={resident.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(resident.fullName || '')}&background=3b82f6&color=fff`}
                            alt={resident.fullName}
                            className="w-10 h-10 rounded-full bg-gray-200 object-cover"
                            onError={(e) => {
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(resident.fullName || '')}&background=3b82f6&color=fff`;
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

                      {/* Trạng thái: Badge với 4 trạng thái + INACTIVE */}
                      <td className="px-6 py-4">
                        {(() => {
                          const statusApi = resident.status || '';
                          // Kiểm tra nếu là INACTIVE
                          if (statusApi === 'INACTIVE') {
                            return (
                              <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium min-w-[100px] bg-red-100 text-red-800 border border-red-300">
                                Đã chuyển đi
                              </span>
                            );
                          }
                          const statusVi = mapStatusToVietnamese(statusApi);
                          return (
                            <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium min-w-[100px] ${statusApi === 'PERMANENT_RESIDENCE'
                                ? 'bg-green-100 text-green-800 border border-green-300'
                                : statusApi === 'TEMPORARY_RESIDENCE'
                                  ? 'bg-orange-100 text-orange-800 border border-orange-300'
                                  : statusApi === 'TEMPORARY_ABSENCE'
                                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                    : statusApi === 'VISITOR'
                                      ? 'bg-purple-100 text-purple-800 border border-purple-300'
                                      : 'bg-gray-100 text-gray-700 border border-gray-300'
                              }`}>
                              {statusVi || '-'}
                            </span>
                          );
                        })()}
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
                    <HomeIcon className='w-8 h-8 text-orange-500' />
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
                        <dd className="text-xl text-green-700 font-extrabold mt-1">{selectedResident.phone || selectedResident.phoneNumber || 'Chưa có'}</dd>
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

                      {/* Tình Trạng Cư Trú */}
                      <div>
                        <dt className="text-sm font-semibold text-gray-500 tracking-wide flex items-center gap-2">
                          <Home className="w-4 h-4 text-indigo-500" />
                          Tình trạng cư trú
                        </dt>
                        <div className="mt-2">
                          {selectedResident && (() => {
                            // Lấy status từ API (PERMANENT_RESIDENCE, etc.) hoặc residenceType
                            const apiStatus = (selectedResident.status as string) ||
                              (selectedResident.residenceType as string) ||
                              'PERMANENT_RESIDENCE';

                            // Map API status sang tiếng Việt
                            const statusVi = mapStatusToVietnamese(apiStatus);

                            // Dùng residenceType để lấy icon và color
                            const residenceType = selectedResident.residenceType || getResidenceTypeFromStatus(apiStatus);
                            const Icon = getResidenceTypeIcon(residenceType);
                            const label = statusVi || getResidenceTypeLabel(residenceType);
                            const color = getResidenceTypeColor(residenceType);

                            return (
                              <span className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-base font-bold border shadow-md transition-colors min-w-[120px] ${color}`}>
                                <Icon className="w-5 h-5" />
                                {label}
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
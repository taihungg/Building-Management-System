import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Search, Plus, Edit, Trash2, MoreVertical, MapPin, Phone, UserCircle, Mail, Eye, Home, Fingerprint, Globe, Building2, Clock, AlertCircle } from "lucide-react";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dropdown } from "./Dropdown";
import { Modal } from "./Modal";
import React from 'react';
import { Toaster, toast } from 'sonner';

type ResidenceType = 'thuongTru' | 'tamTru' | 'nguoiNuocNgoai';

// Hàm xác định tình trạng cư trú (giả lập - trong thực tế sẽ lấy từ API)
const getResidenceType = (resident: any): ResidenceType => {
  if (!resident) return 'thuongTru';
  
  
  if (!resident.idCard || resident.idCard.length < 9) {
    return 'nguoiNuocNgoai';
  }
  
  const homeTown = (resident.homeTown || '').toLowerCase();
  if (homeTown.includes('tạm') || homeTown.includes('temporary')) {
    return 'tamTru';
  }
  
  const random = Math.random();
  if (random < 0.1) return 'nguoiNuocNgoai';
  if (random < 0.3) return 'tamTru';
  return 'thuongTru';
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
  const [residents, setResidents] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedResident, setSelectedResident] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  useEffect(() => {
    fetchResidents();
  }, []) 

  const fetchResidents = async () => {
    setIsLoading(true);
    setError(null);
    
    // Tạo AbortController cho timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 giây timeout
    
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
      setResidents(res.data || []);
      setError(null); // Clear error nếu thành công
    }
    catch (err: any) {
      clearTimeout(timeoutId);
      console.error('Error fetching residents:', err);
      
      // Xử lý các loại lỗi khác nhau
      let errorMessage = 'Không thể kết nối đến server.';
      
      if (err.name === 'AbortError') {
        errorMessage = 'Kết nối quá thời gian. Vui lòng thử lại.';
      } else if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
        errorMessage = 'Failed to fetch';
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
    try {
      const response = await fetch(`http://localhost:8081/api/v1/residents/${residentId}`);
      if (!response.ok) {
        throw new Error("Can't get resident detail");
      }
      const res = await response.json();
      setSelectedResident(res.data);
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

      <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, số phòng, số điện thoại, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-100 to-blue-200 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Tên</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Số Phòng</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Số Điện Thoại</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Email</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Tình Trạng</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Thao Tác</th>
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
                  <td colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <AlertCircle className="w-12 h-12 text-red-500" />
                      <p className="text-red-600 font-medium">Lỗi: {error}</p>
                      <button
                        onClick={fetchResidents}
                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Thử lại
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filteredResidents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    Không tìm thấy cư dân nào
                  </td>
                </tr>
              ) : (
                filteredResidents.map((resident) => {
                  const residenceType = getResidenceType(resident);
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
                      <td className="px-6 py-4 text-gray-800">{resident.roomNumber || '-'}</td>
                      <td className="px-6 py-4 text-gray-800">{resident.phoneNumber || '-'}</td>
                      <td className="px-6 py-4 text-gray-800">{resident.email || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border ${getResidenceTypeColor(residenceType)}`}>
                          <Icon className="w-4 h-4" />
                          {getResidenceTypeLabel(residenceType)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleViewDetail(resident.id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
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
        >
          {isLoadingDetail ? (
            <div className="p-8 text-center">Đang tải...</div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Họ và Tên</Label>
                  <p className="text-gray-900 font-medium">{selectedResident.fullName || '-'}</p>
                </div>
                <div>
                  <Label className="text-gray-600">CMND/CCCD</Label>
                  <p className="text-gray-900 font-medium">{selectedResident.idCard || '-'}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Ngày Sinh</Label>
                  <p className="text-gray-900 font-medium">{selectedResident.dob || '-'}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Quê Quán</Label>
                  <p className="text-gray-900 font-medium">{selectedResident.homeTown || '-'}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Số Phòng</Label>
                  <p className="text-gray-900 font-medium">{selectedResident.roomNumber || '-'}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Số Điện Thoại</Label>
                  <p className="text-gray-900 font-medium">{selectedResident.phoneNumber || '-'}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Email</Label>
                  <p className="text-gray-900 font-medium">{selectedResident.email || '-'}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Trạng Thái</Label>
                  <p className="text-gray-900 font-medium">{selectedResident.status || '-'}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Tình Trạng Cư Trú</Label>
                  <div className="mt-2">
                    {selectedResident && (() => {
                      const residenceType = getResidenceType(selectedResident);
                      const Icon = getResidenceTypeIcon(residenceType);
                      return (
                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border ${getResidenceTypeColor(residenceType)}`}>
                          <Icon className="w-4 h-4" />
                          {getResidenceTypeLabel(residenceType)}
                        </span>
                      );
                    })()}
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


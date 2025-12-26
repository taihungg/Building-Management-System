import { useState, useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { 
  Search, ShieldCheck, HomeIcon, 
  Phone, UserCircle, Fingerprint, Users, UserMinus, 
  Download
} from "lucide-react";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dropdown } from "./Dropdown";
import { Modal } from "./Modal";
import React from 'react';
import { Toaster, toast } from 'sonner';
import * as XLSX from 'xlsx';


export function AuthorityResidentManagement() {
  const [residents, setResidents] = useState<any[]>([]); 
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const [selectedResident, setSelectedResident] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  useEffect(() => {
    fetchResidents();
  }, []);

  const fetchResidents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8081/api/v1/residents');
      if (!response.ok) throw new Error("Không thể lấy danh sách cư dân");
      const res = await response.json();
      setResidents(res.data || []);
    } catch (err: any) {
      toast.error("Lỗi: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- HÀM VIEW DETAIL NỐI API TỪ TRANG RESIDENT MANAGEMENT ---
  const handleViewDetail = async (residentId: string) => {
    setIsLoadingDetail(true);
    setIsViewModalOpen(true);
    setSelectedResident(null); 
    try {
      const response = await fetch(`http://localhost:8081/api/v1/residents/${residentId}`);
      if (!response.ok) throw new Error("Không thể tải thông tin chi tiết cư dân");
      
      const res = await response.json();
      const data = res.data;
      
      setSelectedResident(data);
    } catch (err: any) {
      toast.error("Lỗi tải dữ liệu", { description: err.message });
      setIsViewModalOpen(false);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const filteredResidents = residents.filter(resident => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = String(resident.fullName || '').toLowerCase();
    const room = String(resident.roomNumber || '').toLowerCase();
    return fullName.includes(searchLower) || room.includes(searchLower);
  });

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleExportExcel = () => {
    try {
      const exportData = residents.map((resident) => ({
        'Họ và tên': resident.fullName || '',
        'Email': resident.email || '',
        'Số điện thoại': resident.phone || '',
        'Căn hộ': resident.roomNumber || '',
        'Trạng thái': resident.status || '',
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách cư dân');
      XLSX.writeFile(workbook, 'Danh_sach_cu_dan.xlsx');
      
      toast.success("Đã xuất Excel thành công", { description: "File Danh_sach_cu_dan.xlsx đã được tải xuống" });
    } catch (error) {
      toast.error("Lỗi xuất Excel", { description: "Không thể xuất file Excel" });
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" richColors />
      
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý cư dân</h1>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-blue-900 p-6 rounded-xl shadow-md h-32 flex justify-between items-center text-white" style={{ backgroundColor: '#1e3a8a' }}>
          <div>
            <p className="text-4xl font-bold">{residents.length}</p>
            <p className="text-sm opacity-90">Tổng cư dân</p>
          </div>
          <Users className="h-12 w-12" />
        </div>
        <div className="bg-blue-500 p-6 rounded-xl shadow-md h-32 flex justify-between items-center text-white" style={{ backgroundColor: '#3b82f6' }}>
          <div>
            <p className="text-4xl font-bold">{residents.filter(e => e.status === 'INACTIVE').length}</p>
            <p className="text-sm opacity-90">Tạm vắng</p>
          </div>
          <UserMinus className="h-12 w-12" />
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-6 bg-white p-3 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <div className="relative w-1/3">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm tên, căn hộ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-gray-50/50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 border-2 border-blue-50 rounded-xl bg-white">
                <span className="text-xs font-bold text-blue-800">Tòa nhà</span>
                <select className="text-sm font-semibold outline-none bg-transparent" value={selectedBuilding} onChange={(e)=>setSelectedBuilding(e.target.value)}>
                    <option value="all">Tất cả</option>
                    <option value="A">Tòa A</option>
                    <option value="B">Tòa B</option>
                </select>
            </div>
            <Button 
              onClick={handleExportExcel}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 px-6 shadow-md"
            >
                <Download className="w-4 h-4 mr-2" /> Xuất Excel
            </Button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* tableLayout: fixed là bắt buộc để các cột th và td thẳng hàng theo % width */}
        <table className="w-full text-sm" style={{ tableLayout: 'fixed' }}>
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr className="text-left text-xs font-semibold text-gray-500 tracking-wider">
              <th className="px-6 py-4" style={{ width: '35%' }}>Cư dân</th>
              <th className="px-6 py-4" style={{ width: '20%' }}>Căn hộ</th>
              <th className="px-6 py-4" style={{ width: '30%' }}>Trạng thái</th>
              <th className="px-6 py-4 text-right" style={{ width: '15%' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="text-center py-20 text-gray-400">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : filteredResidents.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-10 text-gray-400">
                  Không tìm thấy cư dân nào
                </td>
              </tr>
            ) : (
              filteredResidents.map((resident) => (
                <tr key={resident.id} className="hover:bg-gray-50 transition-colors">
                  {/* Cột 1: Thông tin cư dân (Đã sửa để không bị lệch) */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center text-blue-700 font-bold">
                        {getInitials(resident.fullName)}
                      </div>
                      <div className="truncate">
                        <p className="font-bold text-gray-900 truncate">{resident.fullName}</p>
                        <p className="text-xs text-gray-500 truncate">{resident.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Cột 2: Căn hộ */}
                  <td className="px-6 py-4">
                    <span className="inline-flex px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700 border border-gray-200">
                      Phòng {resident.roomNumber || 'N/A'}
                    </span>
                  </td>

                  {/* Cột 3: Trạng thái */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${resident.status === 'INACTIVE' ? 'bg-gray-300' : 'bg-green-500'}`} />
                      <span className="font-medium text-gray-600 truncate">
                        {resident.status || 'N/A'}
                      </span>
                    </div>
                  </td>

                  {/* Cột 4: Thao tác */}
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleViewDetail(resident.id)} 
                      className="text-blue-600 font-bold hover:underline whitespace-nowrap"
                    >
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- MODAL CHI TIẾT CƯ DÂN (ĐÃ NỐI LOGIC) --- */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Chi tiết cư dân" size="lg">
        {isLoadingDetail ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium">Đang tải thông tin chi tiết...</p>
          </div>
        ) : selectedResident && (
          <div className="p-4 space-y-8">
            {/* Header Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 flex justify-between items-center shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-blue-600 border-2 border-blue-200">
                    <UserCircle className="w-10 h-10" />
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-600 tracking-widest">Họ và tên cư dân</p>
                  <h2 className="text-3xl font-extrabold text-blue-900">{selectedResident.fullName}</h2>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-orange-600">Căn hộ</p>
                <div className="flex items-center gap-2 text-3xl font-black text-orange-700 justify-end">
                  <HomeIcon className="w-7 h-7" /> {selectedResident.roomNumber}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Personal & Contact */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white border rounded-2xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-800 border-b pb-3 mb-5 flex items-center gap-2">
                    <Fingerprint className="w-5 h-5 text-blue-600" /> Thông tin cá nhân
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs font-bold text-gray-400">CMND/CCCD</p>
                      <p className="text-lg font-bold text-gray-900">{selectedResident.idCard || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400">Ngày sinh</p>
                      <p className="text-lg font-bold text-gray-900">{selectedResident.dob || 'N/A'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs font-bold text-gray-400">Quê quán</p>
                      <p className="text-lg font-bold text-gray-900">{selectedResident.homeTown || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border rounded-2xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-800 border-b pb-3 mb-5 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-green-600" /> Liên hệ
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs font-bold text-gray-400">Số điện thoại</p>
                      <p className="text-lg font-bold text-green-700">{selectedResident.phoneNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400">Email</p>
                      <p className="text-lg font-bold text-blue-600 underline">{selectedResident.email || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Status Badges */}
              <div className="space-y-6">
                <div className="bg-white border rounded-2xl p-6 shadow-sm h-full">
                  <h3 className="text-lg font-bold text-gray-800 border-b pb-3 mb-5 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-indigo-600" /> Trạng thái cư trú
                  </h3>
                  <div className="space-y-8">
                    <div>
                        <p className="text-xs font-bold text-gray-400 mb-3">Trạng thái cư trú</p>
                        <span className="inline-flex px-4 py-2 rounded-xl text-sm font-bold border shadow-sm bg-gray-100 text-gray-800 border-gray-200">
                            {selectedResident.status || 'N/A'}
                        </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end pt-4 border-t">
              <Button onClick={() => setIsViewModalOpen(false)} className="bg-gray-900 text-white rounded-xl px-8 h-12 font-bold shadow-lg">
                Đóng thông tin
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
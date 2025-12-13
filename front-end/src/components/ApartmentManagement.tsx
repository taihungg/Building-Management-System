import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, MoreVertical, Home, Maximize, Edit, Trash2, Eye, X, 
  Users, Car, FileText, AlertCircle, Save, Phone, Mail, 
  User,
  UserCircle,
  MapPin
} from 'lucide-react';

// Import các component UI của bạn
import { Modal } from './Modal'; 
import { Dropdown } from './Dropdown'; 
import { Button } from "./ui/button"; 
import { Input } from "./ui/input";   
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"; 
import { Label } from "./ui/label";   

// 1. IMPORT SONNER
import { Toaster, toast } from 'sonner';

export function ApartmentManagement() {
  
  // --- UTILS: MÀU SẮC ---
  const tailwindBgColors = [
    'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500', 
    'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 
    'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500', 
    'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500',
  ];

  const getStableRandomColor = (idString) => {
    if (!idString) return tailwindBgColors[0];
    let hash = 0;
    for (let i = 0; i < idString.length; i++) {
      hash = idString.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash % tailwindBgColors.length);
    return tailwindBgColors[index];
  };

  // --- 1. STATE DỮ LIỆU & FILTER ---
  const [apartments, setApartments] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [selectedBuildingId, setSelectedBuildingId] = useState("");
  const [selectedFloor, setSelectedFloor] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- 2. STATE CHO MODAL "ADD NEW UNIT" ---
  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false);
  const [newRoomNumber, setNewRoomNumber] = useState("");
  const [newFloor, setNewFloor] = useState("");
  const [newArea, setNewArea] = useState("");
  const [newBuildingId, setNewBuildingId] = useState("");
  const [newOwnerId, setNewOwnerId] = useState("none"); 

  // --- 3. STATE CHO MODAL "VIEW & EDIT DETAILS" ---
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingOwnerId, setEditingOwnerId] = useState(""); 
  const [isSaving, setIsSaving] = useState(false);

  // --- 4. DATA DEPENDENCIES (Dropdowns) ---
  const [buildingList, setBuildingList] = useState([]); 
  const [potentialOwners, setPotentialOwners] = useState([]); 

  // --- THỐNG KÊ ---
  const totalApartments = apartments.length;
  const occupiedApartments = apartments.filter(apt => apt.residentNumber && apt.residentNumber > 0).length;
  const occupancyRate = totalApartments > 0 
      ? ((occupiedApartments / totalApartments) * 100).toFixed(1) 
      : 0;
      
  // --- STATE CHO MODAL DELETE ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [apartmentToDelete, setApartmentToDelete] = useState(null); 
  const [isDeleting, setIsDeleting] = useState(false);

  // --- API CALLS ---

  // 1. Fetch Danh sách căn hộ
  const fetchApartments = async () => {
    setIsLoading(true);
    setError(null);
    try {
        let baseUrl = 'http://localhost:8081/api/v1/apartments';
        const params = new URLSearchParams();

        if (keyword) params.append('keyword', keyword);
        if (selectedBuildingId && selectedBuildingId !== "all") {
            params.append('building', selectedBuildingId); 
        }
        if (selectedFloor) params.append('floor', selectedFloor);

        const finalUrl = `${baseUrl}?${params.toString()}`;
        const response = await fetch(finalUrl);
        if (!response.ok) throw new Error("Không thể tải danh sách căn hộ");

        const res = await response.json();
        setApartments(res.data || []); 
    } catch (err) {
        console.error(err);
        setError(err.message);
        setApartments([]); 
        // Không cần toast lỗi ở đây để tránh spam khi load trang
    } finally {
        setIsLoading(false);
    }
  };

  // 2. Fetch Dropdown Data (Buildings & Owners)
  const fetchFormDependencies = async () => {
    try {
        const resOwner = await fetch('http://localhost:8081/api/v1/residents');
        const jsonOwner = await resOwner.json();
        setPotentialOwners(jsonOwner.data || []);

        const resBuild = await fetch('http://localhost:8081/api/v1/buildings/dropdown?keyword=B');
        if (resBuild.ok) {
           const jsonBuild = await resBuild.json();
           setBuildingList(jsonBuild.data || []);
        }
    } catch (err) {
        console.error("Lỗi tải dữ liệu dropdown:", err);
    }
  };

  // --- EFFECT ---
  useEffect(() => {
    fetchApartments();
    fetchFormDependencies(); 
  }, []);

  useEffect(() => {
    if (selectedApartment && isViewModalOpen) {
        if (selectedApartment.owner) {
            setEditingOwnerId(selectedApartment.owner.id);
        } else {
            setEditingOwnerId("none");
        }
    }
  }, [selectedApartment, isViewModalOpen]);


  // --- HANDLERS ---

  const handleResetFilter = () => {
    setKeyword("");
    setSelectedFloor("");
    setSelectedBuildingId("");
    setTimeout(() => { fetchApartments(); }, 0);
    toast.info("Đã đặt lại bộ lọc");
  };

  // Mở Modal Xem chi tiết
  const handleViewDetail = async (id) => {
    try {
        const response = await fetch(`http://localhost:8081/api/v1/apartments/${id}`);
        const res = await response.json();

        if (!response.ok) throw new Error(res.message || "Lỗi tải chi tiết");

        setSelectedApartment(res.data);
        setIsViewModalOpen(true);
    } catch (err) {
        console.error(err);
        toast.error("Không thể xem chi tiết", { description: err.message });
    }
  };

  // Thêm mới căn hộ (Dùng toast.promise)
  const handleCreateApartment = async () => {
    // Validate
    if (!newRoomNumber || !newFloor || !newArea || !newBuildingId) {
        toast.warning("Thiếu thông tin bắt buộc", {
          description: "Vui lòng nhập Số phòng, Tầng, Diện tích và Tòa nhà!"
        });
        return;
    }

    const createAction = async () => {
        const payload = {
            roomNumber: parseInt(newRoomNumber),
            floor: parseInt(newFloor),
            area: parseFloat(newArea),
            buildingId: newBuildingId,
            ownerId: newOwnerId === "none" ? null : newOwnerId
        };

        const response = await fetch('http://localhost:8081/api/v1/apartments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const res = await response.json();
        if (!response.ok) throw new Error(res.message || "Không thể tạo căn hộ");
        
        // Thành công
        setIsAddUnitOpen(false);
        setNewRoomNumber(""); setNewFloor(""); setNewArea(""); setNewOwnerId("none");
        await fetchApartments();
        return "Thêm căn hộ mới thành công!";
    };

    toast.promise(createAction(), {
        loading: 'Đang tạo căn hộ...',
        success: (msg) => msg,
        error: (err) => `Lỗi: ${err.message}`
    });
  };

  // Cập nhật Owner (Dùng toast.promise)
  const handleUpdateOwner = async () => {
    if (!selectedApartment) return;
    setIsSaving(true); // Vẫn set state để disable nút bấm

    const updateAction = async () => {
        const queryParam = editingOwnerId && editingOwnerId !== "none" 
            ? `?new_owner_id=${editingOwnerId}` 
            : ``; 

        const response = await fetch(`http://localhost:8081/api/v1/apartments/${selectedApartment.id}${queryParam}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) throw new Error("Lỗi cập nhật chủ sở hữu");
        
        setIsViewModalOpen(false); 
        await fetchApartments();   
        return "Cập nhật chủ sở hữu thành công!";
    };

    toast.promise(updateAction(), {
        loading: 'Đang lưu thay đổi...',
        success: (msg) => {
            setIsSaving(false);
            return msg;
        },
        error: (err) => {
            setIsSaving(false);
            return `Lỗi: ${err.message}`;
        }
    });
  };

  const onOpenDeleteModal = (apartment) => {
    setApartmentToDelete(apartment);
    setIsDeleteModalOpen(true);
  };

  // Xóa căn hộ (Dùng toast.promise)
  const confirmDelete = async () => {    
    if (!apartmentToDelete) return;
    setIsDeleting(true);

    const deleteAction = async () => {
        const response = await fetch(`http://localhost:8081/api/v1/apartments?id=${apartmentToDelete.id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Không xác định");
        }

        setIsDeleteModalOpen(false); 
        setApartmentToDelete(null);  
        await fetchApartments();     
        return "Đã xóa căn hộ thành công!";
    };

    toast.promise(deleteAction(), {
        loading: 'Đang xóa căn hộ...',
        success: (msg) => {
            setIsDeleting(false);
            return msg;
        },
        error: (err) => {
            setIsDeleting(false);
            return `Xóa thất bại: ${err.message}`;
        }
    });
  };


  return (
    <div className="space-y-6">
      
      {/* 2. COMPONENT TOASTER */}
      <Toaster position="top-right" richColors closeButton />

      {/* --- HEADER --- */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gray-900">Apartment Management</h1>
          <p className="text-gray-600 mt-1">Manage all apartment units and their details</p>
        </div>
        <Button 
          onClick={() => setIsAddUnitOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-xl transition-all rounded-full px-6"
        >
          <Plus className="w-5 h-5" />
          Add Unit
        </Button>
      </div>

      {/* --- FILTERS --- */}
      <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full group">
                  <Label className="mb-2 block text-xs font-semibold text-gray-500 uppercase tracking-wider">Search Room</Label>
                  <Input
                      placeholder="Type room number..."
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      className="!pl-4 py-6 bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 rounded-xl"
                  />
            </div>
              <div className="w-full md:w-40 group">
                  <Label className="mb-2 block text-xs font-semibold text-gray-500 uppercase tracking-wider">Floor Level</Label>
                  <Input
                      type="number"
                      placeholder="All"
                      value={selectedFloor}
                      onChange={(e) => setSelectedFloor(e.target.value)}
                      className="!pl-4 py-6 bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 rounded-xl"
                  />
              </div>
            <div className="flex gap-2">
                <Button onClick={fetchApartments} className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6">
                    <Search className="w-4 h-4 mr-2" /> Find
                </Button>
                <Button variant="outline" className="rounded-full w-10 h-10 p-0 flex items-center justify-center border-gray-300" onClick={handleResetFilter}>
                    <X className="w-4 h-4" />
                </Button>
            </div>
        </div>
      </div>

      {/* --- STATS --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200">
          <p className="text-gray-600 text-sm">Found Results</p>
          <p className="text-2xl text-gray-900 mt-1">{apartments.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200">
          <p className="text-gray-600 text-sm">Occupancy Rate</p>
          <div className="flex items-end gap-2 mt-1">
            <p className="text-2xl font-bold text-emerald-600">{occupancyRate}%</p>
            <p className="text-xs text-gray-500 mb-1">({occupiedApartments}/{totalApartments})</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
            <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${occupancyRate}%` }}></div>
          </div>
        </div>
      </div>

      {/* --- ERROR MESSAGE --- */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
            Error: {error}
        </div>
      )}

      {/* --- GRID CĂN HỘ --- */}
      {isLoading ? (
          <div className="text-center py-10 text-gray-500">Loading apartments...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apartments.length > 0 ? (
                apartments.map((apt) => {
                  const randomBgClass = getStableRandomColor(apt.id);
                  return (
                    <div key={apt.id} className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 hover:shadow-xl transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${randomBgClass}`}>
                                <Home className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-gray-900 font-bold text-lg">{apt.label}</h3>
                                <p className="text-sm text-gray-600">Floor {apt.floor}</p>
                            </div>
                        </div>
                        
                        <Dropdown
                            trigger={
                                <button className="p-2 hover:bg-indigo-100 rounded-lg transition-colors">
                                    <MoreVertical className="w-5 h-5 text-gray-500" />
                                </button>
                            }
                            items={[
                                { label: 'View / Edit Owner', icon: Eye, onClick: () => handleViewDetail(apt.id) },
                                { label: 'Delete', icon: Trash2, onClick: () => onOpenDeleteModal(apt), danger: true },
                            ]}
                        />
                        </div>

                        <div className="flex items-center gap-4 mb-4">
                            <div className="flex items-center gap-2 text-gray-700">
                                <Maximize className="w-4 h-4 text-gray-500" />
                                <span className="text-sm">{apt.area?.toFixed(2) || apt.size || '--'} m²</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700">
                                <Users className="w-4 h-4 text-gray-500" />
                                <span className="text-sm">{apt.residentNumber || 0} Person</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                            <div>
                                <p className="text-sm text-gray-600">Building</p>
                                <p className="text-gray-600 font-medium">{apt.buildingName || 'BlueMoon Tower'}</p>
                            </div>
                            <div className="text-right">
                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                                    (apt.residentNumber && apt.residentNumber > 0) ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-800'
                                }`}>
                                    {(apt.residentNumber && apt.residentNumber > 0) ? 'OCCUPIED' : 'VACANT'}
                                </span>
                            </div>
                        </div>
                    </div> 
                  );
                })
            ) : (
                <div className="col-span-full text-center py-10 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    No apartments found matching your criteria.
                </div>
            )}
        </div>
      )}

      {/* --- MODAL 1: ADD NEW UNIT --- */}
      <Modal
    isOpen={isAddUnitOpen}
    onClose={() => setIsAddUnitOpen(false)}
    title="Thêm Đơn Vị Căn Hộ Mới"
    size="lg" // Giữ nguyên kích thước lớn (lg) để có không gian
>
    <div className="p-2">
        {/* Tiêu đề phụ và Mô tả */}
        <div className="mb-6 text-center">
            <p className="text-gray-500 text-sm">Điền thông tin chi tiết về căn hộ mới.</p>
        </div>

        <div className="space-y-6">
            {/* PHẦN 1: THÔNG TIN CĂN HỘ (Chia 3 cột) */}
            <div className="p-5 bg-gray-50 border border-gray-200 rounded-xl shadow-inner">
                <h3 className="text-lg font-semibold text-blue-700 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5" /> Chi Tiết Vị Trí
                </h3>
                <div className="grid grid-cols-3 gap-4">
                    
                    {/* Building */}
                    <div className="col-span-3">
                        <Label className="mb-2 block font-medium text-gray-700">Tòa Nhà <span className="text-red-500">*</span></Label>
                        <Select value={newBuildingId} onValueChange={setNewBuildingId}>
                            <SelectTrigger className="h-10 border-blue-300 focus:ring-2 focus:ring-blue-500">
                                <SelectValue placeholder="Chọn Tòa Nhà" />
                            </SelectTrigger>
                            <SelectContent>
                                {buildingList.map(b => (
                                    <SelectItem key={b.id} value={b.id}>{b.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    
                    {/* Room Number */}
                    <div>
                        <Label className="mb-2 block font-medium text-gray-700">Số Phòng <span className="text-red-500">*</span></Label>
                        <Input 
                            type="text" // Đổi sang text vì số phòng có thể là B101
                            placeholder="e.g. 101 / A205" 
                            value={newRoomNumber} 
                            onChange={(e) => setNewRoomNumber(e.target.value)} 
                            className="h-10 focus:border-blue-500"
                        />
                    </div>
                    
                    {/* Floor */}
                    <div>
                        <Label className="mb-2 block font-medium text-gray-700">Tầng <span className="text-red-500">*</span></Label>
                        <Input 
                            type="number" 
                            placeholder="e.g. 1" 
                            value={newFloor} 
                            onChange={(e) => setNewFloor(e.target.value)} 
                            className="h-10 focus:border-blue-500"
                        />
                    </div>
                    
                    {/* Area */}
                    <div>
                        <Label className="mb-2 block font-medium text-gray-700">Diện Tích (m²) <span className="text-red-500">*</span></Label>
                        <Input 
                            type="number" 
                            placeholder="e.g. 85.5" 
                            step="0.1" 
                            value={newArea} 
                            onChange={(e) => setNewArea(e.target.value)} 
                            className="h-10 focus:border-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* PHẦN 2: THÔNG TIN CHỦ SỞ HỮU */}
            <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-md">
                <h3 className="text-lg font-semibold text-purple-700 mb-4 flex items-center gap-2">
                    <UserCircle className="w-5 h-5" /> Chủ Sở Hữu (Tùy Chọn)
                </h3>
                
                <div className="col-span-2">
    <Label className="mb-2 block font-medium text-gray-700">Chọn Chủ Sở Hữu</Label>

    {/* --- BẮT ĐẦU SELECT HTML THUẦN ĐÃ ĐƯỢC TÙY CHỈNH --- */}
    <div className="relative w-full">
        <select
            value={newOwnerId}
            onChange={(e) => setNewOwnerId(e.target.value)}
            className="
                appearance-none /* Loại bỏ giao diện mặc định */
                bg-white 
                border border-purple-300 /* Viền màu tím nổi bật */
                text-gray-700 
                py-2 
                pl-4 
                pr-8 /* Khoảng đệm cho icon */
                rounded-lg 
                shadow-sm 
                font-medium 
                w-full /* Chiếm toàn bộ chiều rộng */
                h-10 
                hover:border-purple-400 
                focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                transition-all
                cursor-pointer
            "
        >
            {/* Tùy chọn mặc định */}
            <option value="none" className="font-semibold text-gray-500">
                -- Chưa Có Chủ Sở Hữu --
            </option>

            {/* Tạo các tùy chọn từ danh sách potentialOwners */}
            {potentialOwners.map(res => (
                <option key={res.id} value={res.id}>
                    {/* Kết hợp Tên và Số điện thoại */}
                    {res.fullName} {res.phoneNumber ? `(${res.phoneNumber})` : ''}
                </option>
            ))}
        </select>

        {/* Icon mũi tên tùy chỉnh (Thay thế mũi tên mặc định) */}
        <div className="
            pointer-events-none 
            absolute 
            inset-y-0 
            right-0 
            flex 
            items-center 
            px-2 
            text-gray-500
        ">
            <svg 
                className="w-4 h-4" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20" 
                fill="currentColor"
            >
                <path 
                    fillRule="evenodd" 
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
                    clipRule="evenodd" 
                />
            </svg>
        </div>
    </div>
    
    <p className="text-xs text-gray-500 mt-2">
        Nếu chủ sở hữu chưa có trong danh sách cư dân, hãy thêm họ trước.
    </p>
</div>
            </div>

            {/* FOOTER BUTTONS */}
            <div className="flex gap-3 pt-6 border-t mt-6">
                <Button 
                    variant="outline" 
                    onClick={() => setIsAddUnitOpen(false)} 
                    className="flex-1 h-11 border-gray-300 hover:bg-gray-100 transition-all"
                >
                    Hủy Bỏ
                </Button>
                <Button 
                    onClick={handleCreateApartment} 
                    className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-500/30 transition-all"
                >
                    Tạo Căn Hộ
                </Button>
            </div>
        </div>
    </div>
</Modal>

      {/* --- MODAL 2: VIEW DETAILS & EDIT OWNER (GIAO DIỆN MỚI) --- */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
      >
        {selectedApartment && selectedApartment.info ? (
            <div className="flex flex-col h-full">
                
                {/* 1. CUSTOM HEADER: Gradient Banner */}
                <div className="-mx-6 -mt-6 mb-6 bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white rounded-t-lg shadow-md relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Home className="w-32 h-32" />
                    </div>

                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 opacity-90 text-sm font-medium mb-1">
                                <span className="uppercase tracking-wider">{selectedApartment.info.buildingName}</span>
                                <span>•</span>
                                <span>Floor {selectedApartment.info.floor}</span>
                            </div>
                            <h2 className="text-4xl font-extrabold tracking-tight">
                                Room {selectedApartment.info.roomNumber}
                            </h2>
                        </div>
                        
                        <div className={`px-4 py-2 rounded-full text-sm font-bold backdrop-blur-md border border-white/20 shadow-sm ${
                            (selectedApartment.residents && selectedApartment.residents.length > 0)
                                ? 'bg-emerald-500/20 text-emerald-50 border-emerald-300/30' 
                                : 'bg-white/10 text-white/80'
                        }`}>
                            <span className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${(selectedApartment.residents && selectedApartment.residents.length > 0) ? 'bg-emerald-400' : 'bg-gray-400'}`}></span>
                                {(selectedApartment.residents && selectedApartment.residents.length > 0) ? 'OCCUPIED' : 'VACANT'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="space-y-6 px-1">
                    {/* 2. MAIN GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        
                        {/* LEFT COL (5 phần): Info & Stats */}
                        <div className="md:col-span-5 space-y-4">
                            {/* Property Specs */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-4">
                                <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Specifications</h3>
                                
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 text-blue-600 rounded-md">
                                            <Maximize className="w-5 h-5" />
                                        </div>
                                        <span className="text-sm text-gray-600 font-medium">Surface Area</span>
                                    </div>
                                    <span className="text-gray-900 font-bold">{selectedApartment.info.area?.toFixed(2)} m²</span>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-100 text-purple-600 rounded-md">
                                            <Users className="w-5 h-5" />
                                        </div>
                                        <span className="text-sm text-gray-600 font-medium">Residents</span>
                                    </div>
                                    <span className="text-gray-900 font-bold">{selectedApartment.info.numberOfResidents} People</span>
                                </div>
                            </div>

                            {/* Stats Cards (Colorful) */}
                            <div className="grid grid-cols-2 gap-3">
                                {/* Card Xe */}
                                <div className="bg-gradient-to-br from-sky-50 to-blue-50 border border-blue-100 rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
                                    <Car className="w-6 h-6 text-blue-500 mb-2" />
                                    <span className="text-3xl font-bold text-blue-700">{selectedApartment.summary?.vehicleCount || 0}</span>
                                    <span className="text-xs text-blue-600 font-medium uppercase mt-1">Vehicles</span>
                                </div>

                                {/* Card Hóa đơn */}
                                <div className={`rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm border ${
                                    selectedApartment.summary?.unpaidBillsCount > 0 
                                    ? 'bg-gradient-to-br from-rose-50 to-red-50 border-red-100' 
                                    : 'bg-gradient-to-br from-emerald-50 to-green-50 border-green-100'
                                }`}>
                                    {selectedApartment.summary?.unpaidBillsCount > 0 
                                        ? <AlertCircle className="w-6 h-6 text-red-500 mb-2" />
                                        : <FileText className="w-6 h-6 text-emerald-500 mb-2" />
                                    }
                                    <span className={`text-3xl font-bold ${selectedApartment.summary?.unpaidBillsCount > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                                        {selectedApartment.summary?.unpaidBillsCount || 0}
                                    </span>
                                    <span className={`text-xs font-medium uppercase mt-1 ${selectedApartment.summary?.unpaidBillsCount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                        Unpaid Bills
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COL (7 phần): Owner Settings */}
                        <div className="md:col-span-7">
                            <div className="bg-white border border-indigo-100 rounded-xl shadow-sm h-full flex flex-col overflow-hidden relative">
                                {/* Decor stripe */}
                                <div className="h-1.5 w-full bg-gradient-to-r from-indigo-400 to-purple-400"></div>
                                
                                <div className="p-5 flex flex-col h-full gap-5">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-indigo-900 font-bold text-lg flex items-center gap-2">
                                            <User className="w-5 h-5" /> Owner Information
                                        </h3>
                                        <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-1 rounded border border-indigo-100 uppercase tracking-wide">
                                            Editable Mode
                                        </span>
                                    </div>

                                    {/* Current Owner Card */}
                                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                        <p className="text-xs font-semibold text-slate-400 uppercase mb-3">Currently Assigned To</p>
                                        
                                        {selectedApartment.owner ? (
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                                                    {selectedApartment.owner.fullName.charAt(0)}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-gray-900 text-lg leading-tight">{selectedApartment.owner.fullName}</p>
                                                    <div className="flex flex-col gap-0.5 mt-1">
                                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                                            <Phone className="w-3 h-3" /> {selectedApartment.owner.phoneNumber}
                                                        </div>
                                                        {selectedApartment.owner.email && (
                                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                                <Mail className="w-3 h-3" /> {selectedApartment.owner.email}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3 text-gray-400 italic py-2">
                                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">?</div>
                                                <span>No owner assigned yet (Vacant)</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Change Owner Action */}
                                    <div className="mt-auto pt-4 border-t border-dashed border-gray-200">
                                        <Label className="text-sm font-medium text-gray-700 mb-2 block">Change / Assign New Owner</Label>
                                        <Select value={editingOwnerId} onValueChange={setEditingOwnerId}>
                                            <SelectTrigger className="w-full h-11 border-indigo-200 focus:ring-indigo-500">
                                                <SelectValue placeholder="Select Owner from List" />
                                            </SelectTrigger>
                                            <SelectContent position="popper" className="max-h-60 overflow-y-auto">
                                                <SelectItem value="none" className="text-gray-500 italic">-- Remove Current Owner --</SelectItem>
                                                {potentialOwners.map(res => (
                                                    <SelectItem key={res.id} value={res.id}>
                                                        <div className="flex flex-col text-left py-1">
                                                            <span className="font-medium text-gray-900">{res.fullName}</span>
                                                            <span className="text-xs text-gray-500">{res.phoneNumber}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. RESIDENTS LIST */}
                    <div className="pt-2">
                        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                            <Users className="w-4 h-4 text-gray-500" /> 
                            Residents List <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{selectedApartment.residents?.length || 0}</span>
                        </h3>
                        
                        <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="max-h-40 overflow-y-auto custom-scrollbar">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-500 font-semibold text-xs uppercase sticky top-0 z-10">
                                        <tr>
                                            <th className="px-4 py-3">Full Name</th>
                                            <th className="px-4 py-3">Phone Number</th>
                                            <th className="px-4 py-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                        {selectedApartment.residents && selectedApartment.residents.length > 0 ? (
                                            selectedApartment.residents.map((res) => (
                                                <tr key={res.id} className="hover:bg-blue-50/50 transition-colors">
                                                    <td className="px-4 py-3 font-medium text-gray-900">{res.fullName}</td>
                                                    <td className="px-4 py-3 text-gray-500 font-mono">{res.phoneNumber}</td>
                                                    <td className="px-4 py-3">
                                                        <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">
                                                            ACTIVE RESIDENT
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={3} className="px-4 py-8 text-center text-gray-400 italic">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Users className="w-8 h-8 opacity-20" />
                                                        <span>No residents currently registered.</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* 4. FOOTER ACTIONS */}
                    <div className="flex justify-end pt-4 border-t gap-3 mt-2">
                        <Button variant="outline" onClick={() => setIsViewModalOpen(false)} className="rounded-full px-6 border-gray-300">
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleUpdateOwner} 
                            disabled={isSaving} 
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full px-6 shadow-lg shadow-blue-500/30 transition-all"
                        >
                            {isSaving ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
                        </Button>
                    </div>
                </div>
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
                <p className="font-medium animate-pulse">Loading details...</p>
            </div>
        )}
      </Modal>

      {/* --- MODAL 3: CONFIRM DELETE --- */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
      >
        <div className="flex flex-col items-center text-center space-y-4 p-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-2 animate-in zoom-in duration-300">
                <AlertCircle className="w-8 h-8 text-red-600" />
            </div>

            <div>
                <h3 className="text-xl font-bold text-gray-900">Are you sure?</h3>
                <p className="text-gray-500 mt-2 max-w-[80%] mx-auto">
                    Do you really want to delete apartment <span className="font-bold text-gray-900">{apartmentToDelete?.label || "this unit"}</span>? 
                    <br/>
                    This process cannot be undone.
                </p>
            </div>

            {apartmentToDelete?.residentNumber > 0 && (
                <div className="bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded-lg text-sm flex items-start gap-2 text-left w-full mt-2">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>
                        <strong>Warning:</strong> This apartment currently has {apartmentToDelete.residentNumber} resident(s). Deleting it might affect their data.
                    </span>
                </div>
            )}

            <div className="flex gap-3 w-full mt-6">
                <Button 
                    variant="outline" 
                    onClick={() => setIsDeleteModalOpen(false)} 
                    className="flex-1 border-gray-300 hover:bg-gray-50 text-gray-700"
                    disabled={isDeleting}
                >
                    Cancel
                </Button>
                <Button 
                   onClick={confirmDelete}
                   style={{ backgroundColor: '#dc2626', color: 'white' }} 
                   disabled={isDeleting}
                   className="flex-1 hover:opacity-90 shadow-lg shadow-red-500/30"
                >
                    {isDeleting ? "Deleting..." : "Delete Apartment"}
                </Button>
            </div>
        </div>
      </Modal>

    </div>
  );
}
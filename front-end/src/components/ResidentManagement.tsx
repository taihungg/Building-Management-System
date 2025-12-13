import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Search, Plus, Edit, Trash2, MoreVertical, MapPin, Phone, UserCircle, Mail, Eye, Home, Fingerprint, Globe, Users } from "lucide-react"; // Đã thêm Globe
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dropdown } from "./Dropdown";
import { Modal } from "./Modal";
import React from 'react';

import { Toaster, toast } from 'sonner';

export function ResidentManagement() {
  const [residents, setResidents] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // --- TẠO STATE CHO FORM "THÊM MỚI" ---
  const [newName, setNewName] = useState("");
  const [newIDCard, setnewIDCard] = useState("");
  const [newDOB, setNewDOB] = useState("");
  const [newHomeTown, setNewHomeTown] = useState(""); 
  const [newAppartmentID, setNewAppartmentID] = useState("");

  // Tao state cho apartment
  const [apartmentList, setApartmentList] = useState([]);
  const [apartmentKeyword, setApartmentKeyword] = useState("");
  
  //kiem soat dong mo dialog
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  //State xu ly viec xoa 
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [residentToDelete, setResidentToDelete] = useState(null);

  // Các state riêng cho form update (Dùng cho View/Edit Modal)
  const [updateName, setUpdateName] = useState("");
  const [updateIDCard, setUpdateIDCard] = useState("");
  const [updateDOB, setUpdateDOB] = useState("");
  const [updateHomeTown, setUpdateHomeTown] = useState(""); // Đã có
  const [updateEmail, setUpdateEmail] = useState("");
  const [updatePhone, setUpdatePhone] = useState("");

  // --- STATE CHO MODAL VIEW/EDIT DETAIL ---
  const [selectedResident, setSelectedResident] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); 

  const [createAccount, setCreateAccount] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');

  useEffect(() => {
    fetchResidents();
  }, []) 

  const fetchResidents = async () => {
    try {
      let url = 'http://localhost:8081/api/v1/residents';

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Can't get residents");
      }
      const res = await response.json();
      setResidents(res.data);
    }
    catch (err) {
      setError(err.message);
    }
  }

  const filteredResidents = residents.filter(resident => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = String(resident.fullName).toLowerCase();
    const room = String(resident.roomNumber).toLowerCase();
    const phone = String(resident.phoneNumber).toLowerCase();
    const email = String(resident.email).toLowerCase();

    return (
      fullName.includes(searchLower) ||
      room.includes(searchLower) ||
      phone.includes(searchLower) ||
      email.includes(searchLower)
    );
  });

  const createResident = async (dataToCreate) => {
    try {
      const response = await fetch('http://localhost:8081/api/v1/residents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToCreate),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Can't create residents");
      }
      return await response.json();
    }
    catch (err) {
      throw err;
    }
  }

  const handleSubmit = async () => {
    if (!newName || !newIDCard) {
      toast.warning("Thiếu thông tin", { description: "Vui lòng nhập tên và CMND/CCCD" });
      return;
    }

    const promise = new Promise(async (resolve, reject) => {
      try {
        const dataform = {
          fullName: newName,
          idCard: newIDCard,
          dob: newDOB,
          homeTown: newHomeTown,
          apartmentID: newAppartmentID
        }
        await createResident(dataform);
        await fetchResidents();
        
        // Reset form
        setNewName("");
        setnewIDCard("");
        setNewDOB("");
        setNewHomeTown("");
        setNewAppartmentID("");
        setIsAddDialogOpen(false);
        resolve("Đã thêm cư dân thành công!");
      } catch (err) {
        reject(err);
      }
    });

    toast.promise(promise, {
      loading: 'Đang tạo cư dân...',
      success: (data) => `${data}`,
      error: (err) => `Lỗi: ${err.message}`,
    });
  }

  useEffect(() => {
    const getApartmentDropDown = async () => {
      try {
        let url = `http://localhost:8081/api/v1/apartments/dropdown?keyword=${encodeURIComponent(apartmentKeyword || "")}`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Can't get apartments");
        }
        const res = await response.json();
        setApartmentList(res.data || []);
      }
      catch (err) {
        console.error(err.message);
        setApartmentList([]);
      }
    }
    getApartmentDropDown();
  }, [apartmentKeyword])

  const openDeleteDialog = (resident) => {
    setResidentToDelete(resident);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async (residentID, isHardDelete) => {
    const deleteAction = async () => {
      let baseUrl = `http://localhost:8081/api/v1/residents`;
      let url = `${baseUrl}?id=${residentID}`;
      if (isHardDelete) {
        url += '&hard=true';
      }
      const response = await fetch(url, {
        method: "DELETE",
        headers: {}
      });

      const res = await response.json();
      if (!response.ok) {
        throw new Error(res.message || "Can't delete residents");
      }
      await fetchResidents();
      setIsDeleteDialogOpen(false);
      setResidentToDelete(null);
    };

    toast.promise(deleteAction(), {
      loading: 'Đang xóa cư dân...',
      success: 'Đã xóa cư dân thành công!',
      error: (err) => `Xóa thất bại: ${err.message}`
    });
  }

  const handleUpdate = async () => {
    if (!selectedResident) return;
    
    const updateAction = async () => {
      const dataToUpdate = {
        fullName: updateName,
        idCard: updateIDCard,
        dob: updateDOB,
        homeTown: updateHomeTown, 
        email: updateEmail,
        phoneNumber: updatePhone,
      }
      
      let url = `http://localhost:8081/api/v1/residents/${selectedResident.id}`;
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToUpdate),
      });

      const res = await response.json();
      if (!response.ok) {
        throw new Error(res.message || "Không thể cập nhật cư dân");
      }
      
      // Tải lại bảng và chi tiết
      await fetchResidents();
      const detailResponse = await fetch(`http://localhost:8081/api/v1/residents/${selectedResident.id}`);
      const detailRes = await detailResponse.json();
      
      setSelectedResident(detailRes.data); 
      setIsEditMode(false); 
    };

    toast.promise(updateAction(), {
      loading: 'Đang cập nhật...',
      success: 'Cập nhật thông tin thành công!',
      error: (err) => `Cập nhật thất bại: ${err.message}`
    });
  }
  
  // 🔥 Hàm xử lý khi nhấn nút Tạo Tài khoản (Chưa có logic backend)
  const handleCreateAccount = () => {
    if (!selectedResident || !selectedResident.id) return;
    
    // Logic giả định
    toast.info("Đang xử lý tạo tài khoản...", {
        description: `Tài khoản sẽ được tạo cho cư dân: ${selectedResident.fullName}. Cần tích hợp API backend.`,
    });
    // Thêm logic API call tại đây
  };

  // Hàm tải chi tiết và mở ở chế độ VIEW
  const handleViewDetail = async (id) => {
    setIsLoadingDetail(true);
    setIsEditMode(false); 
    try {
        const response = await fetch(`http://localhost:8081/api/v1/residents/${id}`);
        
        if (!response.ok) {
            throw new Error("Không thể tải thông tin chi tiết cư dân");
        }

        const res = await response.json();
        const residentData = res.data;

        // Chuẩn bị dữ liệu đầy đủ cho Form Edit
        setSelectedResident(residentData); 
        setUpdateName(residentData.fullName);
        setUpdateIDCard(residentData.idCard || ""); 
        setUpdateDOB(residentData.dob || "");
        setUpdateHomeTown(residentData.homeTown || ""); 
        setUpdateEmail(residentData.email || "");
        setUpdatePhone(residentData.phoneNumber || "");
        
        setIsViewModalOpen(true);      // Mở Modal
    } catch (err) {
        console.error(err);
        toast.error("Lỗi tải dữ liệu", { description: err.message });
        setIsViewModalOpen(false);
    } finally {
        setIsLoadingDetail(false);
    }
  };

  // Hàm tải chi tiết và mở ở chế độ EDIT
  const handleOpenEdit = async (resident) => {
    setSelectedResident(resident);
    setIsViewModalOpen(true);
    setIsEditMode(true);
    setIsLoadingDetail(true); 

    try {
        const response = await fetch(`http://localhost:8081/api/v1/residents/${resident.id}`);
        
        if (!response.ok) {
            throw new Error("Không thể tải thông tin chi tiết cư dân để chỉnh sửa");
        }

        const res = await response.json();
        const residentData = res.data;

        // Cập nhật state với DỮ LIỆU ĐẦY ĐỦ từ API chi tiết
        setSelectedResident(residentData); 
        setUpdateName(residentData.fullName);
        setUpdateIDCard(residentData.idCard || ""); 
        setUpdateDOB(residentData.dob || "");
        setUpdateHomeTown(residentData.homeTown || ""); 
        setUpdateEmail(residentData.email || "");
        setUpdatePhone(residentData.phoneNumber || "");
        
    } catch (err) {
        console.error(err);
        toast.error("Lỗi tải dữ liệu", { description: err.message });
        setIsViewModalOpen(false); 
    } finally {
        setIsLoadingDetail(false); 
    }
  }


  return (
    <div className="space-y-6">
      <Toaster position="top-right" richColors closeButton />

      {error && (
        <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">Lỗi: {error.message || error}</p>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gray-900">Quản lý Cư Dân</h1>
          <p className="text-gray-600 mt-1">Quản lý tất cả cư dân và thông tin của họ</p>
        </div>
        <Button
          onClick={() => {
            setIsAddDialogOpen(true);
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-xl transition-all">
          <Plus className="w-5 h-5" />
          Thêm Cư Dân
        </Button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, số phòng, điện thoại hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
          <p className="text-gray-500 text-sm">Tổng số Cư Dân</p>
          <p className="text-2xl text-gray-900 mt-1">{residents.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
          <p className="text-gray-500 text-sm">Kết quả Lọc</p>
          <p className="text-2xl text-gray-900 mt-1">{filteredResidents.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
          <p className="text-gray-500 text-sm">Có Email</p>
          <p className="text-2xl text-green-600 mt-1">{residents.filter(r => r.email).length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
          <p className="text-gray-500 text-sm">Có SĐT</p>
          <p className="text-2xl text-orange-600 mt-1">{residents.filter(r => r.phoneNumber).length}</p>
        </div>
      </div>

      {/* Residents Table */}
      <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-blue-600 border-b-2 border-blue-700">
              <tr>
                <th className="text-left px-6 py-4 text-sm text-white">Cư Dân</th>
                <th className="text-left px-6 py-4 text-sm text-white">Số Phòng</th>
                <th className="text-left px-6 py-4 text-sm text-white">Liên Hệ</th>
                <th className="text-left px-6 py-4 text-sm text-white">Trạng Thái</th>
                <th className="text-left px-6 py-4 text-sm text-white">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-gray-200">
              {filteredResidents.map((resident) => (
                <tr key={resident.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm">
                        {resident.fullName ? resident.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : 'N/A'}
                      </div>
                      <div>
                        <p className="text-gray-900 text-sm font-medium">{resident.fullName || 'N/A'}</p>
                        <p className="text-xs text-gray-500">{resident.email || 'Chưa có email'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-700 text-sm">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {resident.roomNumber || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 text-sm text-gray-600">
                      {resident.phoneNumber && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          {resident.phoneNumber}
                        </div>
                      )}
                      {resident.email && (
                        <div className="text-xs text-gray-500">{resident.email}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${resident.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-700'
                        : resident.status === 'INACTIVE'
                          ? 'bg-gray-100 text-gray-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                      {resident.status === 'ACTIVE' ? 'Đang ở' : resident.status === 'INACTIVE' ? 'Không ở' : 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Dropdown
                      trigger={
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <MoreVertical className="w-5 h-5 text-gray-400" />
                        </button>
                      }
                      items={[
                        { label: 'Xem Chi Tiết', icon: Eye, onClick: () => handleViewDetail(resident.id) },
                        { label: 'Chỉnh Sửa', icon: Edit, onClick: () => handleOpenEdit(resident) },
                        { label: 'Xóa', icon: Trash2, onClick: () => openDeleteDialog(resident), danger: true },

                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Resident Modal */}
      <Modal
    isOpen={isAddDialogOpen}
    onClose={() => setIsAddDialogOpen(false)}
    title="Thêm Cư Dân Mới"
    size="lg"
>
    <div className="p-6 space-y-4">
        {/* --- CÁC TRƯỜNG THÔNG TIN CƠ BẢN --- */}
        <div>
            <Label htmlFor="newName">Họ và Tên</Label>
            <Input
              id="newName"
              type="text"
              placeholder="Nhập họ tên đầy đủ"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="mt-1"
            />
        </div>
        
        <div>
            <Label htmlFor="newIDCard">CMND / CCCD</Label>
            <Input
              id="newIDCard"
              type="text"
              placeholder="Nhập số CMND/CCCD"
              value={newIDCard}
              onChange={(e) => setnewIDCard(e.target.value)}
              className="mt-1"
            />
        </div>

        <div>
            <Label htmlFor="newDOB">Ngày Sinh</Label>
            <Input
              id="newDOB"
              type="date"
              value={newDOB}
              onChange={(e) => setNewDOB(e.target.value)}
              className="mt-1"
            />
        </div>

        <div>
            <Label htmlFor="newHomeTown">Quê Quán</Label>
            <Input
              id="newHomeTown"
              type="text"
              placeholder="Nhập quê quán"
              value={newHomeTown}
              onChange={(e) => setNewHomeTown(e.target.value)}
              className="mt-1"
            />
        </div>

        {/* --- TRƯỜNG CHỌN APARTMENT --- */}
        <div>
            <Label htmlFor="newApartmentID">Căn Hộ</Label>
            <div className="mt-1 space-y-2">
              <Input
                id="apartmentSearch"
                type="text"
                placeholder="Tìm kiếm căn hộ bằng số phòng..."
                value={apartmentKeyword}
                onChange={(e) => setApartmentKeyword(e.target.value)}
                className="w-full"
              />
              
              <select 
                id="newApartmentSelect"
                value={newAppartmentID} 
                onChange={(e) => setNewAppartmentID(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg bg-white mt-1"
              >
                <option value="" disabled>Chọn căn hộ</option>
                {apartmentList && Array.isArray(apartmentList) && apartmentList.length > 0 ? (
                  apartmentList.map((apt) => (
                    <option key={apt.id} value={String(apt.id)}>
                      {apt.label}
                    </option>
                  ))
                ) : (
                    <option value="" disabled>
                        {apartmentKeyword ? "Không tìm thấy căn hộ" : "Nhập để tìm kiếm..."}
                    </option>
                )}
              </select>
              
              {newAppartmentID && apartmentList && apartmentList.find(apt => String(apt.id) === newAppartmentID) && (
                <p className="text-sm text-green-600 mt-1">
                  Đã chọn: {apartmentList.find(apt => String(apt.id) === newAppartmentID)?.label || 'N/A'}
                </p>
              )}
            </div>
        </div>
        {/* --- KẾT THÚC TRƯỜNG CHỌN APARTMENT ĐÃ SỬA --- */}


        <div className="pt-4 border-t mt-6">
            {/* --- CHECKBOX (TICKBOX) TẠO TÀI KHOẢN --- */}
            <div className="flex items-center space-x-2">
                <input 
                    type="checkbox"
                    id="createAccount" 
                    checked={createAccount}
                    onChange={(e) => setCreateAccount(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <Label 
                    htmlFor="createAccount"
                    className="text-base font-medium text-slate-700 cursor-pointer"
                >
                    Tạo tài khoản (Cổng cư dân)
                </Label>
            </div>
        </div>

        {/* --- CÁC TRƯỜNG NHẬP CÓ ĐIỀU KIỆN (EMAIL & PHONE) --- */}
        {createAccount && (
            <div className="space-y-4 pt-2">
                <div className="text-sm font-semibold text-blue-600 border-b pb-2 mb-2">
                    Thông tin Tài khoản
                </div>
                
                {/* Email Field */}
                <div>
                    <Label htmlFor="newEmail">Email</Label>
                    <Input
                      id="newEmail"
                      type="email"
                      placeholder="Nhập email (dùng để đăng nhập)"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      required={createAccount}
                      className="mt-1"
                    />
                </div>

                {/* Phone Field */}
                <div>
                    <Label htmlFor="newPhone">Số Điện Thoại (SĐT)</Label>
                    <Input
                      id="newPhone"
                      type="tel"
                      placeholder="Nhập số điện thoại"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      required={createAccount}
                      className="mt-1"
                    />
                </div>
            </div>
        )}

        {/* --- NÚT SUBMIT --- */}
        <div className="flex gap-3 pt-4 border-t mt-6">
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Thêm Cư Dân
            </Button>
        </div>
    </div>
      </Modal>

      {/* Delete Resident Modal */}
      <Modal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Xóa Cư Dân"
        size="md"
      >
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            Bạn có chắc chắn muốn xóa <strong>{residentToDelete?.fullName || 'cư dân này'}</strong> không?
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Hành động này không thể hoàn tác. Chọn xóa mềm (mặc định) hoặc xóa cứng.
          </p>
          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (residentToDelete) {
                  handleDelete(residentToDelete.id, false);
                }
              }}
              className="flex-1"
            >
              Xóa Mềm (Soft Delete)
            </Button>
            <Button
              onClick={() => {
                if (residentToDelete) {
                  handleDelete(residentToDelete.id, true);
                }
              }}
              className="flex-1 text-white"
              style={{ backgroundColor: '#dc2626' }}
            >
              Xóa Cứng (Hard Delete)
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* --- MODAL VIEW/EDIT RESIDENT DETAIL (ĐÃ DỊCH) --- */}
      <Modal
    isOpen={isViewModalOpen}
    onClose={() => {
        setIsViewModalOpen(false);
        setIsEditMode(false); // Reset mode khi đóng
    }}
    title={isEditMode ? "Chỉnh Sửa Thông Tin Cư Dân" : "Chi Tiết Cư Dân"}
>
    {isLoadingDetail ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
            <p>Đang tải thông tin cư dân...</p>
        </div>
    ) : selectedResident ? (
        <div className="flex flex-col h-full">
            
            {/* 1. HEADER GRADIENT */}
            <div className="-mx-6 -mt-6 mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white rounded-t-lg shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <UserCircle className="w-32 h-32" />
                </div>
                <div className="relative z-10 flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/50 flex items-center justify-center text-2xl font-bold shadow-lg">
                        {selectedResident.fullName?.charAt(0)}
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold">{isEditMode ? updateName : selectedResident.fullName}</h2>
                                <p className="text-blue-100 text-sm flex items-center gap-1 mt-1">
                                    {/* Hiển thị Home Town ngay trên Header */}
                                    <MapPin className="w-4 h-4" /> 
                                    {isEditMode ? updateHomeTown : (selectedResident.homeTown || "Chưa cập nhật quê quán")}
                                </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                selectedResident.status === 'ACTIVE' 
                                    ? 'bg-green-500/20 border-green-400/50 text-green-50' 
                                    : 'bg-gray-500/20 border-gray-400/50 text-gray-200'
                            }`}>
                                {selectedResident.status === 'ACTIVE' ? 'Đang ở' : 'Không ở'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. NỘI DUNG CHÍNH (Conditional Rendering) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-2">
                
                {isEditMode ? (
                    /* --- CHẾ ĐỘ CHỈNH SỬA (EDIT MODE) - ĐÃ DỊCH --- */
                    <>
                        {/* CỘT TRÁI: Form Cá nhân */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider border-b pb-2">
                                Thông Tin Cá Nhân
                            </h3>
                            <div className="space-y-3">
                                <div><Label htmlFor="updateName">Họ và Tên</Label>
                                <Input id="updateName" type="text" value={updateName} onChange={(e) => setUpdateName(e.target.value)} className="mt-1"/></div>
                                
                                <div><Label htmlFor="updateIDCard">CMND / CCCD</Label>
                                <Input id="updateIDCard" type="text" value={updateIDCard} onChange={(e) => setUpdateIDCard(e.target.value)} className="mt-1"/></div>
                                
                                <div><Label htmlFor="updateDOB">Ngày Sinh</Label>
                                <Input id="updateDOB" type="date" value={updateDOB} onChange={(e) => setUpdateDOB(e.target.value)} className="mt-1"/></div>
                                
                                <div><Label htmlFor="updateHomeTown">Quê Quán</Label>
                                <Input id="updateHomeTown" type="text" value={updateHomeTown} onChange={(e) => setUpdateHomeTown(e.target.value)} className="mt-1"/></div>
                            </div>
                        </div>

                        {/* CỘT PHẢI: Form Liên lạc */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider border-b pb-2">
                                Thông Tin Liên Hệ
                            </h3>
                            <div className="space-y-3">
                                <div><Label htmlFor="updatePhone">Số Điện Thoại</Label>
                                <Input id="updatePhone" type="tel" value={updatePhone} onChange={(e) => setUpdatePhone(e.target.value)} className="mt-1"/></div>
                                
                                <div><Label htmlFor="updateEmail">Email</Label>
                                <Input id="updateEmail" type="email" value={updateEmail} onChange={(e) => setUpdateEmail(e.target.value)} className="mt-1"/></div>
                                
                                {/* Apartment (Read Only) */}
                                <div className="mt-4 p-4 bg-gray-100 border border-gray-200 rounded-xl">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Căn Hộ (Chỉ Xem)</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-sm font-semibold text-gray-400 uppercase">Phòng</span>
                                        <span className="text-xl font-extrabold text-gray-900 tracking-tight font-mono">
                                            {selectedResident.roomNumber}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    /* --- CHẾ ĐỘ XEM (VIEW MODE) - ĐÃ DỊCH --- */
                    <>
                        {/* CỘT TRÁI: Thông tin cá nhân */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider border-b pb-2">
                                Thông Tin Cá Nhân
                            </h3>
                            <div className="space-y-3">
                                {/* SYSTEM ID */}
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 group hover:border-blue-200 transition-colors">
                                    <div className="p-2 bg-slate-200 text-slate-600 rounded-md">
                                        <Fingerprint className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="text-xs text-gray-500">ID Hệ Thống</p>
                                        <p className="font-mono text-xs font-medium text-gray-700 truncate" title={selectedResident.id}>
                                            {selectedResident.id}
                                        </p>
                                    </div>
                                </div> 
                                {/* ID Card (CMND/CCCD) */}
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="p-2 bg-blue-100 text-blue-600 rounded-md">
                                        <span className="text-xs font-bold">ID</span>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">CMND / CCCD</p>
                                        <p className="font-medium text-gray-900">{selectedResident.idCard || "N/A"}</p>
                                    </div>
                                </div>
                                {/* DOB */}
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="p-2 bg-purple-100 text-purple-600 rounded-md">
                                        <span className="text-xs font-bold">DOB</span>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Ngày Sinh</p>
                                        <p className="font-medium text-gray-900">{selectedResident.dob || "N/A"}</p>
                                    </div>
                                </div>
                                 {/* HOME TOWN */}
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="p-2 bg-pink-100 text-pink-600 rounded-md">
                                        <Globe className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Quê Quán</p>
                                        <p className="font-medium text-gray-900">{selectedResident.homeTown || "N/A"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CỘT PHẢI: Liên lạc & Căn hộ */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider border-b pb-2">
                                Liên Hệ & Cư Trú
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <Phone className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-500">Số Điện Thoại</p>
                                        <p className="font-medium text-gray-900">{selectedResident.phoneNumber || "N/A"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-500">Địa Chỉ Email</p>
                                        <p className="font-medium text-gray-900 break-all">{selectedResident.email || "N/A"}</p>
                                    </div>
                                </div>
                                {/* Current Apartment */}
                                <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <Home className="w-7 h-7 text-blue-600" />
                                    </div>
                                    <p className="text-xs font-bold text-blue-600/80 uppercase tracking-wider mb-1">Căn Hộ Hiện Tại</p>
                                    <div className="flex items-baseline gap-2 relative z-10">
                                        <span className="text-sm font-semibold text-blue-400 uppercase">Phòng</span>
                                        <span className="text-xl font-extrabold text-blue-900 tracking-tight font-mono">
                                            {selectedResident.roomNumber}
                                        </span>
                                    </div>                      
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* 3. FOOTER (Conditional Buttons) - ĐÃ DỊCH VÀ THÊM NÚT TẠO TK */}
            <div className="mt-8 flex justify-end pt-4 border-t gap-3">
                
                {isEditMode ? (
                    <>
                        <Button 
                            variant="outline" 
                            onClick={() => {
                                setIsEditMode(false); // Quay lại chế độ xem
                            }} 
                            className="rounded-full px-6"
                        >
                            Hủy Chỉnh Sửa
                        </Button>
                        <Button 
                            onClick={handleUpdate} 
                            className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6 shadow-lg shadow-green-500/30"
                        >
                            <Edit className="w-4 h-4 mr-2" /> Lưu Thay Đổi
                        </Button>
                    </>
                ) : (
                    <>
                        <Button variant="outline" onClick={() => setIsViewModalOpen(false)} className="rounded-full px-6">
                            Đóng
                        </Button>
                        
                        {/* 🔥 NÚT CREATE ACCOUNT (TẠO TÀI KHOẢN) */}
                        <Button 
                            onClick={handleCreateAccount} 
                            className="bg-orange-500 hover:bg-orange-600 text-black rounded-full px-6 shadow-lg shadow-orange-500/30"
                        >
                            <Users className="w-4 h-4 mr-2" /> Tạo tài khoản
                        </Button>
                        
                        <Button 
                            onClick={() => handleOpenEdit(selectedResident)} 
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 shadow-lg shadow-blue-500/30"
                        >
                            <Edit className="w-4 h-4 mr-2" /> Chỉnh Sửa
                        </Button>
                    </>
                )}
            </div>
        </div>
    ) : (
        <div className="text-center py-10 text-gray-500">Không tìm thấy dữ liệu.</div>
    )}
      </Modal>
    </div>
  );
}
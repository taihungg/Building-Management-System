import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Search, Plus, Edit, Trash2, MoreVertical, MapPin, Phone, UserCircle, Mail, Eye, Home, Fingerprint, Globe } from "lucide-react"; // Đã thêm Globe
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
          <p className="font-medium">Error: {error.message || error}</p>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gray-900">Resident Management</h1>
          <p className="text-gray-600 mt-1">Manage all residents and their information</p>
        </div>
        <Button
          onClick={() => {
            setIsAddDialogOpen(true);
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-xl transition-all">
          <Plus className="w-5 h-5" />
          Add Resident
        </Button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, room number, phone, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
          <p className="text-gray-500 text-sm">Total Residents</p>
          <p className="text-2xl text-gray-900 mt-1">{residents.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
          <p className="text-gray-500 text-sm">Filtered Results</p>
          <p className="text-2xl text-gray-900 mt-1">{filteredResidents.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
          <p className="text-gray-500 text-sm">With Email</p>
          <p className="text-2xl text-green-600 mt-1">{residents.filter(r => r.email).length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
          <p className="text-gray-500 text-sm">With Phone</p>
          <p className="text-2xl text-orange-600 mt-1">{residents.filter(r => r.phoneNumber).length}</p>
        </div>
      </div>

      {/* Residents Table */}
      <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-blue-600 border-b-2 border-blue-700">
              <tr>
                <th className="text-left px-6 py-4 text-sm text-white">Resident</th>
                <th className="text-left px-6 py-4 text-sm text-white">Room Number</th>
                <th className="text-left px-6 py-4 text-sm text-white">Contact</th>
                <th className="text-left px-6 py-4 text-sm text-white">Status</th>
                <th className="text-left px-6 py-4 text-sm text-white">Actions</th>
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
                        <p className="text-xs text-gray-500">{resident.email || 'No email'}</p>
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
                      {resident.status || 'N/A'}
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
                        { label: 'View Details', icon: Eye, onClick: () => handleViewDetail(resident.id) },
                        { label: 'Edit', icon: Edit, onClick: () => handleOpenEdit(resident) },
                        { label: 'Delete', icon: Trash2, onClick: () => openDeleteDialog(resident), danger: true },

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
        title="Add New Resident"
        size="lg"
      >
        <div className="p-6 space-y-4">
          <div>
            <Label htmlFor="newName">Full Name</Label>
            <Input
              id="newName"
              type="text"
              placeholder="Enter full name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="newIDCard">ID Card</Label>
            <Input
              id="newIDCard"
              type="text"
              placeholder="Enter ID card number"
              value={newIDCard}
              onChange={(e) => setnewIDCard(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="newDOB">Date of Birth</Label>
            <Input
              id="newDOB"
              type="date"
              value={newDOB}
              onChange={(e) => setNewDOB(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="newHomeTown">Home Town</Label>
            <Input
              id="newHomeTown"
              type="text"
              placeholder="Enter home town"
              value={newHomeTown}
              onChange={(e) => setNewHomeTown(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="newApartmentID">Apartment</Label>
            <div className="mt-1 space-y-2">
              <Input
                id="apartmentSearch"
                type="text"
                placeholder="Search apartment by room number..."
                value={apartmentKeyword}
                onChange={(e) => setApartmentKeyword(e.target.value)}
                className="w-full"
              />
              <Select value={newAppartmentID} onValueChange={setNewAppartmentID}>
                <SelectTrigger>
                  <SelectValue placeholder="Select apartment" />
                </SelectTrigger>
                <SelectContent>
                  {apartmentList && Array.isArray(apartmentList) && apartmentList.length > 0 ? (
                    apartmentList.map((apt) => (
                      <SelectItem key={apt.id} value={String(apt.id)}>
                        {apt.label}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-1.5 text-sm text-gray-500">
                      {apartmentKeyword ? "No apartments found" : "Type to search..."}
                    </div>
                  )}
                </SelectContent>
              </Select>
              {newAppartmentID && apartmentList && apartmentList.find(apt => String(apt.id) === newAppartmentID) && (
                <p className="text-sm text-green-600 mt-1">
                  Selected: {apartmentList.find(apt => String(apt.id) === newAppartmentID)?.label || 'N/A'}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t mt-6">
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Add Resident
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Resident Modal */}
      <Modal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Delete Resident"
        size="md"
      >
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete <strong>{residentToDelete?.fullName || 'this resident'}</strong>?
          </p>
          <p className="text-sm text-gray-500 mb-6">
            This action cannot be undone. Choose soft delete (default) or hard delete.
          </p>
          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="flex-1"
            >
              Cancel
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
              Soft Delete
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
              Hard Delete
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* --- MODAL VIEW/EDIT RESIDENT DETAIL --- */}
      <Modal
    isOpen={isViewModalOpen}
    onClose={() => {
        setIsViewModalOpen(false);
        setIsEditMode(false); // Reset mode khi đóng
    }}
    title={isEditMode ? "Edit Resident Information" : "Resident Details"}
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
                                {selectedResident.status}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. NỘI DUNG CHÍNH (Conditional Rendering) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-2">
                
                {isEditMode ? (
                    /* --- CHẾ ĐỘ CHỈNH SỬA (EDIT MODE) --- */
                    <>
                        {/* CỘT TRÁI: Form Cá nhân */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider border-b pb-2">
                                Personal Information
                            </h3>
                            <div className="space-y-3">
                                <div><Label htmlFor="updateName">Full Name</Label>
                                <Input id="updateName" type="text" value={updateName} onChange={(e) => setUpdateName(e.target.value)} className="mt-1"/></div>
                                
                                <div><Label htmlFor="updateIDCard">ID Card</Label>
                                <Input id="updateIDCard" type="text" value={updateIDCard} onChange={(e) => setUpdateIDCard(e.target.value)} className="mt-1"/></div>
                                
                                <div><Label htmlFor="updateDOB">Date of Birth</Label>
                                <Input id="updateDOB" type="date" value={updateDOB} onChange={(e) => setUpdateDOB(e.target.value)} className="mt-1"/></div>
                                
                                <div><Label htmlFor="updateHomeTown">Home Town</Label>
                                <Input id="updateHomeTown" type="text" value={updateHomeTown} onChange={(e) => setUpdateHomeTown(e.target.value)} className="mt-1"/></div>
                            </div>
                        </div>

                        {/* CỘT PHẢI: Form Liên lạc */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider border-b pb-2">
                                Contact Information
                            </h3>
                            <div className="space-y-3">
                                <div><Label htmlFor="updatePhone">Phone Number</Label>
                                <Input id="updatePhone" type="tel" value={updatePhone} onChange={(e) => setUpdatePhone(e.target.value)} className="mt-1"/></div>
                                
                                <div><Label htmlFor="updateEmail">Email</Label>
                                <Input id="updateEmail" type="email" value={updateEmail} onChange={(e) => setUpdateEmail(e.target.value)} className="mt-1"/></div>
                                
                                {/* Apartment (Read Only) */}
                                <div className="mt-4 p-4 bg-gray-100 border border-gray-200 rounded-xl">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Apartment (Read Only)</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-sm font-semibold text-gray-400 uppercase">Room</span>
                                        <span className="text-xl font-extrabold text-gray-900 tracking-tight font-mono">
                                            {selectedResident.roomNumber}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    /* --- CHẾ ĐỘ XEM (VIEW MODE) --- */
                    <>
                        {/* CỘT TRÁI: Thông tin cá nhân */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider border-b pb-2">
                                Personal Information
                            </h3>
                            <div className="space-y-3">
                                {/* SYSTEM ID */}
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 group hover:border-blue-200 transition-colors">
                                    <div className="p-2 bg-slate-200 text-slate-600 rounded-md">
                                        <Fingerprint className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="text-xs text-gray-500">System ID</p>
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
                                        <p className="text-xs text-gray-500">Date of Birth</p>
                                        <p className="font-medium text-gray-900">{selectedResident.dob || "N/A"}</p>
                                    </div>
                                </div>
                                 {/* HOME TOWN - ĐÃ THÊM MỚI */}
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="p-2 bg-pink-100 text-pink-600 rounded-md">
                                        <Globe className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Home Town</p>
                                        <p className="font-medium text-gray-900">{selectedResident.homeTown || "N/A"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CỘT PHẢI: Liên lạc & Căn hộ */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider border-b pb-2">
                                Contact & Residence
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <Phone className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-500">Phone Number</p>
                                        <p className="font-medium text-gray-900">{selectedResident.phoneNumber || "N/A"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-500">Email Address</p>
                                        <p className="font-medium text-gray-900 break-all">{selectedResident.email || "N/A"}</p>
                                    </div>
                                </div>
                                {/* Current Apartment */}
                                <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <Home className="w-7 h-7 text-blue-600" />
                                    </div>
                                    <p className="text-xs font-bold text-blue-600/80 uppercase tracking-wider mb-1">Current Apartment</p>
                                    <div className="flex items-baseline gap-2 relative z-10">
                                        <span className="text-sm font-semibold text-blue-400 uppercase">Room</span>
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

            {/* 3. FOOTER (Conditional Buttons) */}
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
                            Cancel Edit
                        </Button>
                        <Button 
                            onClick={handleUpdate} 
                            className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6 shadow-lg shadow-green-500/30"
                        >
                            <Edit className="w-4 h-4 mr-2" /> Save Changes
                        </Button>
                    </>
                ) : (
                    <>
                        <Button variant="outline" onClick={() => setIsViewModalOpen(false)} className="rounded-full px-6">
                            Close
                        </Button>
                        <Button 
                            onClick={() => handleOpenEdit(selectedResident)} // Gọi lại handleOpenEdit để đảm bảo chuyển mode chuẩn
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 shadow-lg shadow-blue-500/30"
                        >
                            <Edit className="w-4 h-4 mr-2" /> Edit Info
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
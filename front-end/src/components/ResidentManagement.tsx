import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Search, Plus, Edit, Trash2, MoreVertical, MapPin, Phone } from "lucide-react";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dropdown } from "./Dropdown";
import { Modal } from "./Modal";
import React from 'react';

// 1. IMPORT THƯ VIỆN TOAST (SONNER)
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

  //State xu ly cho viec update
  const [residentToUpdate, setResidentToUpdate] = useState(null)
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  
  // Các state riêng cho form update
  const [updateName, setUpdateName] = useState("");
  const [updateIDCard, setUpdateIDCard] = useState("");
  const [updateDOB, setUpdateDOB] = useState("");
  const [updateHomeTown, setUpdateHomeTown] = useState("");
  const [updateEmail, setUpdateEmail] = useState("");
  const [updatePhone, setUpdatePhone] = useState("");
  const [updateApartmentID, setUpdateApartmentID] = useState("");

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
      // Không cần toast lỗi ở đây nếu muốn hiển thị lỗi tĩnh trên UI, 
      // nhưng nếu muốn có thể dùng toast.error("Lỗi tải dữ liệu");
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
        // Cố gắng đọc message lỗi từ server trả về nếu có
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
    // Validate cơ bản trước khi gửi
    if (!newName || !newIDCard) {
      toast.warning("Thiếu thông tin", { description: "Vui lòng nhập tên và CMND/CCCD" });
      return;
    }

    // Hiển thị toast loading
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

    // 2. DÙNG TOAST PROMISE (Tự động hiện Loading -> Thành công/Thất bại)
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
        // Lỗi này không cần hiện toast vì nó chạy ngầm khi gõ
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
    // Tạo promise cho toast
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

    // Gọi Toast
    toast.promise(deleteAction(), {
      loading: 'Đang xóa cư dân...',
      success: 'Đã xóa cư dân thành công!',
      error: (err) => `Xóa thất bại: ${err.message}`
    });
  }

  const handleUpdate = async () => {
    if (!residentToUpdate) return;
    
    const updateAction = async () => {
      const dataToUpdate = {
        fullName: updateName,
        idCard: updateIDCard,
        dob: updateDOB,
        homeTown: updateHomeTown,
        email: updateEmail,
        phoneNumber: updatePhone,
      }
      
      let url = `http://localhost:8081/api/v1/residents/${residentToUpdate.id}`;
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
      await fetchResidents();
      setIsUpdateDialogOpen(false);
      setResidentToUpdate(null);
    };

    // Gọi Toast Update
    toast.promise(updateAction(), {
      loading: 'Đang cập nhật...',
      success: 'Cập nhật thông tin thành công!',
      error: (err) => `Cập nhật thất bại: ${err.message}`
    });
  }

  const openUpdateDialog = (resident) => {
    setResidentToUpdate(resident);
    setUpdateName(resident.fullName);
    setUpdateIDCard(resident.idCard || "");
    setUpdateDOB(resident.dob || "");
    setUpdateHomeTown(resident.homeTown || "");
    setUpdateEmail(resident.email || "");
    setUpdatePhone(resident.phoneNumber || "");
    setIsUpdateDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* 3. COMPONENT HIỂN THỊ TOAST (Đặt ở đâu cũng được, thường là đầu trang) */}
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
                        { label: 'Edit', icon: Edit, onClick: () => openUpdateDialog(resident) },
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

      {/* Update Resident Modal */}
      <Modal
        isOpen={isUpdateDialogOpen}
        onClose={() => setIsUpdateDialogOpen(false)}
        title="Update Resident"
        size="lg"
      >
        <div className="p-6 space-y-4">
          <div>
            <Label htmlFor="updateName">Full Name</Label>
            <Input
              id="updateName"
              type="text"
              placeholder="Enter full name"
              value={updateName}
              onChange={(e) => setUpdateName(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="updateIDCard">ID Card</Label>
            <Input
              id="updateIDCard"
              type="text"
              placeholder="Enter ID card number"
              value={updateIDCard}
              onChange={(e) => setUpdateIDCard(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="updateDOB">Date of Birth</Label>
            <Input
              id="updateDOB"
              type="date"
              value={updateDOB}
              onChange={(e) => setUpdateDOB(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="updateHomeTown">Home Town</Label>
            <Input
              id="updateHomeTown"
              type="text"
              placeholder="Enter home town"
              value={updateHomeTown}
              onChange={(e) => setUpdateHomeTown(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="updateEmail">Email</Label>
            <Input
              id="updateEmail"
              type="email"
              placeholder="Enter email"
              value={updateEmail}
              onChange={(e) => setUpdateEmail(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="updatePhone">Phone Number</Label>
            <Input
              id="updatePhone"
              type="tel"
              placeholder="Enter phone number"
              value={updatePhone}
              onChange={(e) => setUpdatePhone(e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t mt-6">
            <Button
              variant="outline"
              onClick={() => setIsUpdateDialogOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Update Resident
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
    </div>
  );
}
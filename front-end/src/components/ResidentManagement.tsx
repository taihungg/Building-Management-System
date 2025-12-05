import { useState,useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Search, Plus, Edit, Trash2, UserCircle, MoreVertical, Eye, MapPin, Phone } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dropdown } from "./Dropdown";
import { Modal } from "./Modal";
import React from 'react';



export function ResidentManagement() {
  const[residents, setResidents] =useState([]);
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
const [residentToUpdate,setResidentToUpdate]= useState(null)
const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
// Các state riêng cho form update (để tránh xung đột với form create)
const [updateName, setUpdateName] = useState("");
    const [updateIDCard, setUpdateIDCard] = useState("");
    const [updateDOB, setUpdateDOB] = useState("");
    const [updateHomeTown, setUpdateHomeTown] = useState("");
    const [updateEmail, setUpdateEmail] = useState(""); // <-- MỚI THÊM
    const [updatePhone, setUpdatePhone] = useState(""); // <-- MỚI THÊM
    const [updateApartmentID, setUpdateApartmentID] = useState("");

  useEffect(()=>{
    fetchResidents();
  }  ,[]) //mảng rỗng này được thiết kế để chỉ chạy 1 lần duy nhất khi component dc tải
  const fetchResidents = async() =>{
    try{
      let url = 'http://localhost:8081/api/v1/residents';
             
      const response = await fetch(url);   
      if (!response.ok){
        throw new Error("Can't get residents");
      }
      const res  = await response.json();
      setResidents(res.data);
    }
    catch (err){
      setError(err.message);
    }
  }
  const filteredResidents = residents.filter(resident => { //luồng hoạt động sẽ là chạy qua từng residents lấy các thuộc tính của nó lowercase và só sánh vs searchTerms ròi nếu mà true thì return.
    const searchLower = searchTerm.toLowerCase();

    const fullName = String(resident.fullName).toLowerCase();
    const room = String(resident.roomNumber).toLowerCase();
    const phone = String(resident.phoneNumber).toLowerCase();
    const email = String(resident.email).toLowerCase(); 

    return (
      fullName.includes(searchLower) ||  // so sánh các thuộc tính của resident xem có 
      // giống searchTerm ko nếu có thì true ko thì false
      room.includes(searchLower) ||
      phone.includes(searchLower) ||
      email.includes(searchLower)
    );
  });

  const createResident = async(dataToCreate)=>{
    try{
      const response = await fetch('http://localhost:8081/api/v1/residents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToCreate),
      });
      if (!response.ok){
        throw new Error("Can't create residents");
      }
      const res  = await response.json();
    }
    catch(err){
      setError(err.message);
      throw err;
    }
  }
  const handleSubmit = async ()=>{
    try{
      const dataform ={
        fullName: newName,
        idCard: newIDCard,
        dob: newDOB,
        homeTown: newHomeTown,
        apartmentID: newAppartmentID
      }
      await createResident(dataform);
      await fetchResidents();
      setNewName ("")
      setnewIDCard("")
      setNewDOB("")
      setNewHomeTown("")
      setNewAppartmentID("")
      setIsAddDialogOpen(false)
    }
    catch (err){
      alert("Lỗi! Không thể tạo cư dân: " + err.message);
    }
  }
useEffect(()=>{
  const getApartmentDropDown = async ()=>{
    try{
      let url = `http://localhost:8081/api/v1/apartments/dropdown?keyword=${encodeURIComponent(apartmentKeyword || "")}`;      
      const response = await fetch(url);   
      if (!response.ok){
        throw new Error("Can't get apartments");
      }
      const res  = await response.json();
      setApartmentList(res.data || []);
    }
    catch (err){
      setError(err.message);
      setApartmentList([]);
    }
  }
  getApartmentDropDown();
},[apartmentKeyword])

const openDeleteDialog = (resident) => {
  setResidentToDelete(resident); 
  setIsDeleteDialogOpen(true); 
};
const handleDelete = async (residentID, isHardDelete) =>{
    try{
      let baseUrl = `http://localhost:8081/api/v1/residents`;    
      let url = `${baseUrl}?id=${residentID}`;
      if (isHardDelete){
        url += '&hard=true';
      }  
      const response = await fetch (url ,{
        method : "DELETE",
        headers: {
          // QUAN TRỌNG: Bạn cần gửi Token nếu API này bị khóa
          // 'Authorization': 'Bearer ' + yourAuthToken
        }
      });
      
      const res  = await response.json();
      if (!response.ok){
        throw new Error(res.message || "Can't delete residents");
      }
      await fetchResidents();
      setIsDeleteDialogOpen(false);
      setResidentToDelete(null);  
      alert("Delete resident successfully");
    }
    catch(err){
      console.error(err);
      setError(err.message);
      alert("Lỗi! Không thể xóa cư dân: " + err.message);
    }
}

const handleUpdate = async() =>{
  if (!residentToUpdate) return;
  const dataToUpdate = {
            fullName: updateName,
            idCard: updateIDCard,
            dob: updateDOB,
            homeTown: updateHomeTown,
            email: updateEmail, // <-- MỚI: Thêm email
            phoneNumber: updatePhone, // <-- MỚI: Thêm phone (lưu ý tên trường backend là 'phoneNumber' hay 'phone' nhé)
}
  try{
    let url = `http://localhost:8081/api/v1/residents/${residentToUpdate.id}`;     
    const response = await fetch (url ,{
      method : "PUT",
      headers: {
          "Content-Type": "application/json",        
      },
      body: JSON.stringify(dataToUpdate),
    });
   
    const res  = await response.json();
    if (!response.ok){
      throw new Error(res.message || res.message || "Không thể cập nhật cư dân");
    }
    await fetchResidents();
    /*const updatedResident = res.data; 

    setResidents(prevResidents => 
      prevResidents.map(resident => 
        resident.id === residentToUpdate.id ? updatedResident : resident
      )
    ); */
    setIsUpdateDialogOpen(false);
    setResidentToUpdate(null);  
    alert("Update resident successfully");
  }
    catch(err){
      console.error(err);
      setError(err.message);
    }
}
const openUpdateDialog = (resident) => {
  setResidentToUpdate(resident);
  // Điền dữ liệu hiện tại vào form
  setUpdateName(resident.fullName);
  setUpdateIDCard(resident.idCard || "");
  setUpdateDOB(resident.dob || "");
  setUpdateHomeTown(resident.homeTown || "");
  setUpdateEmail(resident.email || "");
  setUpdatePhone(resident.phoneNumber || ""); 
  
  // Lưu ý: Nếu bạn muốn hiển thị căn hộ hiện tại, bạn cần logic để lấy ID căn hộ từ resident object
  // Ví dụ: setUpdateApartmentID(resident.apartmentID); 
  
  setIsUpdateDialogOpen(true);
};




  


  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg">
           {/* Dòng này giúp in lỗi dù nó là object hay string, tránh trắng màn hình */}
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
            console.log('Add Resident button clicked, isAddDialogOpen will be:', true);
            setIsAddDialogOpen(true);
            console.log('isAddDialogOpen state set to true');
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
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                      resident.status === 'ACTIVE' 
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
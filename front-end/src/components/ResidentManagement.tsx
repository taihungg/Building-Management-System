import { useState,useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Search, Plus, Edit, Trash2, UserCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import React from 'react';



export function ResidentManagement() {
  const[residents, setResidents] =useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(" ");

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

  useEffect(()=>{
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
    fetchResidents();
  }  ,[]) //mảng rỗng này được thiết kế để chỉ chạy 1 lần duy nhất khi component dc tải

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
      const response = await fetch('http://localhost:8081/api/v1/residents/create', {
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
      setResidents(prevResidents => [...prevResidents, res.data]);

    }
    catch(err){
      setError(err);
    }
    return (
      <div>
        {error && <p style={{color: 'red'}}>{error.message}</p>}
        {/* ... (phần còn lại của giao diện) ... */}
      </div>
    );
  }
  const handleSubmit = async ()=>{
    try{const dataform ={
      fullName: newName,
      idCard: newIDCard,
      dob: newDOB,
      homeTown: newHomeTown,
      apartmentID: newAppartmentID
    }
    await createResident(dataform);
    setNewName ("")
    setnewIDCard("")
    setNewDOB("")
    setNewHomeTown("")
    setNewAppartmentID("")

    setIsAddDialogOpen(false)}
    catch (err){
      alert("Lỗi! Không thể tạo cư dân: " + err.message);
    }
  }
useEffect(()=>{
  const getApartmentDropDown = async ()=>{
    try{

      let url = `http://localhost:8081/api/v1/apartments/dropdown?keyword=${encodeURIComponent(apartmentKeyword)}`;      
      const response = await fetch(url);   
      if (!response.ok){
        throw new Error("Can't get apartments");
      }
      const res  = await response.json();
      setApartmentList(res.data);
    }
    catch (err){
      setError(err.message);
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
      let url = `http://localhost:8081/api/v1/residents/${residentID}`;    
      if (isHardDelete){
        url += '?hard=true';
      }  
      const response = await fetch (url ,{
        method : "DELETE",
        headers: {
          // QUAN TRỌNG: Bạn cần gửi Token nếu API này bị khóa
          // 'Authorization': 'Bearer ' + yourAuthToken
        }
      });
      if (!response.ok){
        throw new Error("Can't delete residents");
      }
      const res  = await response.json();
      setResidents(prevResidents => 
        prevResidents.filter(resident => resident.id !== residentID)
      );
      setIsDeleteDialogOpen(false);
      setResidentToDelete(null);  
    }
    
    catch(err){
      setError(err);
    }
    return (
      <div>
        {error && <p style={{color: 'red'}}>{error.message}</p>}
        {/* ... (phần còn lại của giao diện) ... */}
      </div>
    )
}
  

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Tổng số người</CardTitle>
          </CardHeader>
          <CardContent>
            <div>{residents.length} người</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Đang sinh sống</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-green-600">
              {residents.filter((r) => r.status === "active").length} hộ
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Tạm vắng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-yellow-600">
              {residents.filter((r) => r.status === "inactive").length} hộ
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>...</CardTitle>
          </CardHeader>
          <CardContent>
            <div>...</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách cư dân</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên, căn hộ, SĐT..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange ={setIsAddDialogOpen}  >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm cư dân
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Thêm cư dân mới</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Họ và tên</Label>
                    <Input placeholder="Nhập họ tên..." value = {newName} onChange={(e) => setNewName(e.target.value)}  />
                  </div>
                  <div className="space-y-2">
                    <Label>CCCD</Label>
                    <Input placeholder="Nhập số CCCD..."  value = {newIDCard} onChange = {(e => setnewIDCard(e.target.value))}/>
                  </div>
                  <div className="space-y-2">
                    <Label>Ngày sinh</Label>
                    <Input type = 'date' placeholder="Nhập ngày sinh (YYYY-MM-DD)..." value = {newDOB} onChange = {(e)=> setNewDOB(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Quê quán</Label>
                    <Input type="email" placeholder="Nhập quê quán..." value = {newHomeTown} onChange = {(e)=> setNewHomeTown(e.target.value)} />
                  </div>
                 <div className="space-y-2">
                    <Label>Tìm kiếm căn hộ (Gõ số phòng)</Label>
                    <Input 
                      placeholder="Gõ số phòng (ví dụ: A-101)..."
                      value={apartmentKeyword}
                      onChange={(e) => setApartmentKeyword(e.target.value)} // <-- Cập nhật TỪ KHÓA
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Chọn căn hộ (Kết quả)</Label>
                    <Select value={newAppartmentID} onValueChange={(uuid) => setNewAppartmentID(uuid)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn từ kết quả tìm kiếm" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Lặp qua 'apartmentList' (đã được useEffect lọc) */}
                        {apartmentList.map((apartment) => (
                          <SelectItem 
                            key={apartment.id} 
                            value={apartment.id} 
                          >
                            {apartment.label} {/* <-- Hiển thị là "A-101 (Tầng 1)" */}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button className="flex-1" onClick={handleSubmit}>Thêm mới</Button>
                    <Button variant="outline" className="flex-1"> 
                      Hủy
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Residents Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Số phòng</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Số điện thoại</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Họ và tên</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResidents.map((resident) => (
                <TableRow key={resident.id}>
                  
                  <TableCell>{resident.roomNumber}</TableCell>
                  <TableCell>{resident.email}</TableCell>
                  <TableCell>{resident.phoneNumber}</TableCell>
                  <TableCell>{resident.id}</TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <UserCircle className="h-5 w-5 text-muted-foreground" />
                      {resident.fullName}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm"  >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(resident)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa cư dân?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Bạn có chắc muốn xóa cư dân: 
              {/* Hiển thị tên người sắp bị xóa */}
              <strong> {residentToDelete?.fullName}</strong> 
              (Phòng: {residentToDelete?.roomNumber})?
            </p>
            <p className="text-sm text-muted-foreground">
              Đây là hành động quan trọng. Lựa chọn hình thức xóa:
            </p>
            <div className="flex gap-4 pt-4">
              {/* Nút Xóa Mềm */}
              <Button variant="outline" className="flex-1" onClick={() => handleDelete(residentToDelete.id, false)}>
                Xóa mềm (Đổi trạng thái)
              </Button>
              {/* Nút Xóa Cứng */}
              <Button variant="destructive" className="flex-1" onClick={() => handleDelete(residentToDelete.id, true)}>
                Xóa vĩnh viễn (Hủy diệt)
              </Button>
            </div>
            {/* Nút Hủy */}
            <Button variant="secondary" className="w-full" onClick={() => setIsDeleteDialogOpen(false)}>
              Hủy
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

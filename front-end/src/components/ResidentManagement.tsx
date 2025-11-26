import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { 
  Search, Plus, Edit, Trash2, User, Home, Phone, 
  Users, Activity, UserPlus, MoreHorizontal, MapPin, Calendar 
} from "lucide-react";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogDescription, DialogFooter, DialogTrigger 
} from "./ui/dialog";
import { Label } from "./ui/label";
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from "./ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger 
} from "./ui/dropdown-menu";


export function ResidentManagement() {
  // --- STATE DỮ LIỆU CHÍNH ---
  const [residents, setResidents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // --- STATE CHO DROPDOWN CĂN HỘ ---
  const [apartmentList, setApartmentList] = useState([]);
  const [apartmentKeyword, setApartmentKeyword] = useState(""); // Tìm kiếm khi tạo mới
  const [updateApartmentKeyword, setUpdateApartmentKeyword] = useState(""); // Tìm kiếm khi update

  // --- STATE FORM THÊM MỚI ---
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIDCard, setnewIDCard] = useState("");
  const [newDOB, setNewDOB] = useState("");
  const [newHomeTown, setNewHomeTown] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newAppartmentID, setNewAppartmentID] = useState("");

  // --- STATE FORM CẬP NHẬT ---
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [residentToUpdate, setResidentToUpdate] = useState(null);
  const [updateName, setUpdateName] = useState("");
  const [updateIDCard, setUpdateIDCard] = useState("");
  const [updateDOB, setUpdateDOB] = useState("");
  const [updateHomeTown, setUpdateHomeTown] = useState("");
  const [updateEmail, setUpdateEmail] = useState("");
  const [updatePhone, setUpdatePhone] = useState("");
  const [updateApartmentID, setUpdateApartmentID] = useState("");

  // --- STATE FORM XÓA ---
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [residentToDelete, setResidentToDelete] = useState(null);

  // ==================================================================
  // 1. FETCH DATA (Lấy danh sách cư dân)
  // ==================================================================
  useEffect(() => {
    const fetchResidents = async () => {
      try {
        setIsLoading(true);
        // Gọi API lấy tất cả (bao gồm cả người đã xóa mềm nếu cần, ở đây để mặc định)
        let url = 'http://localhost:8081/api/v1/residents?include_inactive=true';
        const response = await fetch(url);
        if (!response.ok) throw new Error("Không thể tải danh sách cư dân");
        
        const res = await response.json();
        setResidents(res.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchResidents();
  }, []);

  // ==================================================================
  // 2. FETCH APARTMENTS (Tìm kiếm căn hộ cho Dropdown)
  // ==================================================================
  // Hàm dùng chung để gọi API tìm căn hộ
  const fetchApartments = async (keyword) => {
    try {
      let url = `http://localhost:8081/api/v1/apartments/dropdown?keyword=${encodeURIComponent(keyword)}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Không thể tải danh sách căn hộ");
      const res = await response.json();
      setApartmentList(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Effect lắng nghe khi gõ tìm kiếm căn hộ (Create Form)
  useEffect(() => {
    fetchApartments(apartmentKeyword);
  }, [apartmentKeyword]);

  // Effect lắng nghe khi gõ tìm kiếm căn hộ (Update Form)
  useEffect(() => {
    if (isUpdateDialogOpen) {
      fetchApartments(updateApartmentKeyword);
    }
  }, [updateApartmentKeyword, isUpdateDialogOpen]);


  // ==================================================================
  // 3. XỬ LÝ THÊM MỚI (CREATE)
  // ==================================================================
  const handleCreate = async () => {
    const dataToCreate = {
      fullName: newName,
      idCard: newIDCard,
      dob: newDOB,
      homeTown: newHomeTown,
      email: newEmail,
      phoneNumber: newPhone, // Lưu ý: tên trường phải khớp BE ResidentCreationDTO
      apartmentID: newAppartmentID
    };

    try {
      const response = await fetch('http://localhost:8081/api/v1/residents/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToCreate),
      });

      if (!response.ok) throw new Error("Lỗi khi tạo cư dân");
      
      const res = await response.json();
      // Cập nhật UI: Thêm người mới vào danh sách
      setResidents(prev => [...prev, res.data]);
      
      // Reset form & đóng dialog
      setNewName(""); setnewIDCard(""); setNewDOB(""); setNewHomeTown("");
      setNewEmail(""); setNewPhone(""); setNewAppartmentID("");
      setIsAddDialogOpen(false);
      
    } catch (err) {
      alert(err.message);
    }
  };

  // ==================================================================
  // 4. XỬ LÝ CẬP NHẬT (UPDATE)
  // ==================================================================
  const openUpdateDialog = (resident) => {
    setResidentToUpdate(resident);
    // Điền dữ liệu cũ vào form
    setUpdateName(resident.fullName);
    setUpdateIDCard(resident.idCard || ""); // Cần đảm bảo BE trả về trường này
    setUpdateDOB(resident.dob || "");
    setUpdateHomeTown(resident.homeTown || "");
    setUpdateEmail(resident.email || "");
    setUpdatePhone(resident.phoneNumber || "");
    // Lưu ý: Logic lấy apartmentID hiện tại hơi phức tạp nếu BE không trả về ID căn hộ trong list
    // Tạm thời để trống hoặc cần BE trả về apartmentId trong ResidentSummary
    setUpdateApartmentID(""); 
    
    setIsUpdateDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!residentToUpdate) return;

    const dataToUpdate = {
      fullName: updateName,
      idCard: updateIDCard,
      dob: updateDOB,
      homeTown: updateHomeTown,
      email: updateEmail,
      phoneNumber: updatePhone,
      apartmentID: updateApartmentID // Nếu rỗng BE cần xử lý logic giữ nguyên
    };

    try {
      let url = `http://localhost:8081/api/v1/residents/${residentToUpdate.id}`;
      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToUpdate),
      });

      if (!response.ok) throw new Error("Lỗi khi cập nhật");

      const res = await response.json();
      const updatedResident = res.data;

      // Cập nhật UI: Thay thế người cũ bằng người mới
      setResidents(prev => prev.map(r => r.id === residentToUpdate.id ? updatedResident : r));
      setIsUpdateDialogOpen(false);
      setResidentToUpdate(null);

    } catch (err) {
      alert(err.message);
    }
  };

  // ==================================================================
  // 5. XỬ LÝ XÓA (DELETE)
  // ==================================================================
  const openDeleteDialog = (resident) => {
    setResidentToDelete(resident);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async (isHardDelete) => {
    if (!residentToDelete) return;
    try {
      let url = `http://localhost:8081/api/v1/residents/${residentToDelete.id}`;
      if (isHardDelete) url += '?hard=true';

      const response = await fetch(url, { method: "DELETE" });
      
      if (!response.ok) throw new Error("Lỗi khi xóa cư dân");

      // Cập nhật UI: Xóa khỏi danh sách
      setResidents(prev => prev.filter(r => r.id !== residentToDelete.id));
      setIsDeleteDialogOpen(false);
      setResidentToDelete(null);

    } catch (err) {
      alert(err.message);
    }
  };

  // ==================================================================
  // 6. LOGIC FILTER (TÌM KIẾM FRONTEND)
  // ==================================================================
  const filteredResidents = residents.filter(resident => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = String(resident.fullName || "").toLowerCase();
    const room = String(resident.roomNumber || "").toLowerCase();
    const phone = String(resident.phoneNumber || "").toLowerCase();
    const email = String(resident.email || "").toLowerCase();

    return (
      fullName.includes(searchLower) ||
      room.includes(searchLower) ||
      phone.includes(searchLower) ||
      email.includes(searchLower)
    );
  });

 
  return (
    <div className="flex flex-col space-y-8 p-8 bg-slate-50/50 min-h-screen">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Quản lý Cư dân</h2>
          <p className="text-slate-500 mt-1">Quản lý thông tin cư dân, căn hộ và trạng thái cư trú.</p>
        </div>
        <div className="flex items-center gap-2">
           <Button onClick={() => setIsAddDialogOpen(true)} className="bg-slate-900 hover:bg-slate-800 text-black shadow-sm relative z-50">
             <UserPlus className="mr-2 h-4 w-4" />
             Thêm cư dân mới
           </Button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Tổng số căn hộ</CardTitle>
            <Home className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            {/* Giả sử mỗi dòng cư dân active đại diện cho 1 hộ đang ở */}
            <div className="text-2xl font-bold text-slate-900">{residents.length}</div>
            <p className="text-xs text-slate-500 mt-1">Hồ sơ lưu trữ</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Đang sinh sống</CardTitle>
            <User className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {residents.filter((r) => r.status === "ACTIVE").length}
            </div>
            <p className="text-xs text-emerald-600 font-medium mt-1">Trạng thái Active</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Tạm vắng / Rời đi</CardTitle>
            <User className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {residents.filter((r) => r.status !== "ACTIVE").length}
            </div>
            <p className="text-xs text-amber-600 font-medium mt-1">Trạng thái Inactive</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Tổng nhân khẩu</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
               {/* Placeholder số liệu */}
               {residents.length} 
            </div>
            <p className="text-xs text-slate-500 mt-1">Cư dân đã đăng ký</p>
          </CardContent>
        </Card>
      </div>

      {/* MAIN TABLE AREA */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 pb-4 px-6 pt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <CardTitle className="text-lg font-semibold">Danh sách cư dân</CardTitle>
                <CardDescription>Xem và quản lý thông tin chi tiết.</CardDescription>
            </div>
            
            <div className="relative w-full md:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Tìm kiếm tên, phòng, SĐT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-[250px] font-semibold text-slate-600 pl-6">Họ và Tên</TableHead>
                <TableHead className="font-semibold text-slate-600">Căn hộ</TableHead>
                <TableHead className="font-semibold text-slate-600">Liên lạc</TableHead>
                <TableHead className="font-semibold text-slate-600">Trạng thái</TableHead>
                <TableHead className="text-right font-semibold text-slate-600 pr-6">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">Đang tải dữ liệu...</TableCell>
                </TableRow>
              ) : filteredResidents.map((resident) => (
                <TableRow key={resident.id} className="hover:bg-slate-50/50 transition-colors group">
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-slate-200">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${resident.fullName}`} />
                        <AvatarFallback>{resident.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{resident.fullName}</p>
                        <p className="text-xs text-slate-500">ID: {resident.id.substring(0, 8)}...</p>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-white text-slate-700 border-slate-200 font-normal">
                            {resident.roomNumber || "Chưa gán"}
                        </Badge>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center text-sm text-slate-600">
                            <Phone className="mr-2 h-3 w-3 text-slate-400" />
                            {resident.phoneNumber || "N/A"}
                        </div>
                        <div className="text-xs text-slate-400 pl-5 truncate max-w-[150px]">
                            {resident.email || "N/A"}
                        </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge 
                        className={
                            resident.status === "ACTIVE" 
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200" 
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200"
                        }
                        variant="outline"
                    >
                      {resident.status === "ACTIVE" ? "Đang ở" : "Tạm vắng"}
                    </Badge>
                  </TableCell>
                  
                  <TableCell className="text-right pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4 text-slate-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => openUpdateDialog(resident)}>
                            <Edit className="mr-2 h-4 w-4 text-slate-500" /> Sửa thông tin
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                            onClick={() => openDeleteDialog(resident)}
                        >
                            <Trash2 className="mr-2 h-4 w-4" /> Xóa cư dân
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ===================== DIALOG THÊM MỚI ===================== */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Thêm cư dân mới</DialogTitle>
            <DialogDescription>Nhập thông tin chi tiết để tạo hồ sơ cư dân mới.</DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2 space-y-2">
              <Label>Họ và tên <span className="text-red-500">*</span></Label>
              <Input placeholder="Ví dụ: Nguyễn Văn A" value={newName} onChange={(e) => setNewName(e.target.value)} />
            </div>
            
            <div className="space-y-2">
              <Label>Số CCCD/CMND</Label>
              <Input placeholder="0010..." value={newIDCard} onChange={(e) => setnewIDCard(e.target.value)} />
            </div>
            
            <div className="space-y-2">
              <Label>Ngày sinh</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input type="date" className="pl-9" value={newDOB} onChange={(e) => setNewDOB(e.target.value)} />
              </div>
            </div>

            <div className="col-span-2 space-y-2">
                <Label>Quê quán</Label>
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input className="pl-9" placeholder="Hà Nội, Việt Nam" value={newHomeTown} onChange={(e) => setNewHomeTown(e.target.value)} />
                </div>
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="example@mail.com" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Số điện thoại</Label>
              <Input placeholder="098..." value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
            </div>

            <div className="col-span-2 border-t border-slate-100 my-2"></div>

            <div className="col-span-2 space-y-2">
                <Label>Chọn Căn hộ</Label>
                <div className="flex gap-2">
                    <div className="flex-1">
                        <Input 
                            placeholder="Gõ mã phòng để tìm (VD: A101)..."
                            value={apartmentKeyword}
                            onChange={(e) => setApartmentKeyword(e.target.value)} 
                        />
                    </div>
                    <div className="flex-1">
                        <Select value={newAppartmentID} onValueChange={(uuid) => setNewAppartmentID(uuid)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn kết quả..." />
                            </SelectTrigger>
                            <SelectContent>
                                {apartmentList.length === 0 ? (
                                    <div className="p-2 text-sm text-slate-500 text-center">Không tìm thấy</div>
                                ) : (
                                    apartmentList.map((apartment) => (
                                    <SelectItem key={apartment.id} value={apartment.id}>
                                        {apartment.label}
                                    </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Hủy bỏ</Button>
            <Button onClick={handleCreate} className="bg-indigo-600 hover:bg-indigo-700">Tạo hồ sơ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===================== DIALOG UPDATE ===================== */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Cập nhật thông tin</DialogTitle>
            <DialogDescription>Chỉnh sửa thông tin cư dân trong hệ thống.</DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2 space-y-2">
              <Label>Họ và tên</Label>
              <Input value={updateName} onChange={(e) => setUpdateName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>CCCD</Label>
              <Input value={updateIDCard} onChange={(e) => setUpdateIDCard(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Ngày sinh</Label>
              <Input type="date" value={updateDOB} onChange={(e) => setUpdateDOB(e.target.value)} />
            </div>
            <div className="col-span-2 space-y-2">
                <Label>Quê quán</Label>
                <Input value={updateHomeTown} onChange={(e) => setUpdateHomeTown(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={updateEmail} onChange={(e) => setUpdateEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>SĐT</Label>
              <Input value={updatePhone} onChange={(e) => setUpdatePhone(e.target.value)} />
            </div>

            <div className="col-span-2 border-t border-slate-100 my-2"></div>

            {/* Update Apartment */}
            <div className="col-span-2 space-y-2">
                <Label>Chuyển Căn hộ (Nếu có)</Label>
                <div className="flex gap-2">
                    <div className="flex-1">
                        <Input 
                            placeholder="Tìm phòng mới..."
                            value={updateApartmentKeyword}
                            onChange={(e) => setUpdateApartmentKeyword(e.target.value)} 
                        />
                    </div>
                    <div className="flex-1">
                        <Select value={updateApartmentID} onValueChange={(uuid) => setUpdateApartmentID(uuid)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Giữ nguyên hoặc chọn mới" />
                            </SelectTrigger>
                            <SelectContent>
                                {apartmentList.map((apt) => (
                                    <SelectItem key={apt.id} value={apt.id}>{apt.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>Hủy bỏ</Button>
            <Button onClick={handleUpdate} className="bg-indigo-600 hover:bg-indigo-700">Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===================== DIALOG DELETE ===================== */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
                <Activity className="h-5 w-5" /> Xác nhận xóa cư dân
            </DialogTitle>
            <DialogDescription>
                Hành động này sẽ ảnh hưởng đến dữ liệu của cư dân 
                <span className="font-bold text-slate-900"> {residentToDelete?.fullName}</span>.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-slate-50 p-4 rounded-md border border-slate-100 text-sm text-slate-600 mb-4">
            <p className="mb-2">Vui lòng chọn hình thức xóa:</p>
            <ul className="list-disc pl-5 space-y-1">
                <li><b>Xóa mềm (Khuyên dùng):</b> Chỉ đánh dấu trạng thái là "Rời đi". Dữ liệu vẫn còn trong hệ thống.</li>
                <li><b>Xóa vĩnh viễn:</b> Xóa hoàn toàn khỏi cơ sở dữ liệu. Không thể khôi phục.</li>
            </ul>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <div className="flex gap-2 w-full">
                <Button variant="outline" className="flex-1" onClick={() => setIsDeleteDialogOpen(false)}>Hủy</Button>
                <Button 
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-white border-0" 
                    onClick={() => handleDelete(false)} // Soft delete
                >
                    Xóa mềm
                </Button>
                <Button 
                    variant="destructive" 
                    className="flex-1"
                    onClick={() => handleDelete(true)} // Hard delete
                >
                    Xóa vĩnh viễn
                </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
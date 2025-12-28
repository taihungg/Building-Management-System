import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Search, Plus, Edit, Trash2, MoreVertical, MapPin, Phone, UserCircle, Mail, Eye, Home, Globe, Users, Clock, UserMinus } from "lucide-react"; 
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dropdown } from "./Dropdown";
import { Modal } from "./Modal";

import { Toaster, toast } from 'sonner';

type EditableResidentStatus =
  | "PERMANENT_RESIDENCE"
  | "TEMPORARY_RESIDENCE"
  | "TEMPORARY_ABSENCE"
  | "ACCOMMODATION";

type ResidentStatusFilter = "ALL" | EditableResidentStatus | "INACTIVE";

const RESIDENT_STATUS_OPTIONS: Array<{ value: EditableResidentStatus; label: string }> = [
  { value: "PERMANENT_RESIDENCE", label: "Thường trú" },
  { value: "TEMPORARY_RESIDENCE", label: "Tạm trú" },
  { value: "TEMPORARY_ABSENCE", label: "Tạm vắng" },
  { value: "ACCOMMODATION", label: "Lưu trú" },
];

const RESIDENT_STATUS_FILTER_OPTIONS: Array<{ value: ResidentStatusFilter; label: string }> = [
  { value: "ALL", label: "Tất cả" },
  ...RESIDENT_STATUS_OPTIONS,
  { value: "INACTIVE", label: "Không ở" },
];

const getResidentStatusLabel = (status?: string) => {
  const found = RESIDENT_STATUS_OPTIONS.find((o) => o.value === status);
  if (found) return found.label;
  if (status === "INACTIVE") return "Không ở";
  return status || "N/A";
};

const getResidentStatusBadgeStyle = (status?: string): React.CSSProperties => {
  switch (status) {
    case "PERMANENT_RESIDENCE":
      return { backgroundColor: "#10b981", borderColor: "#10b981", color: "#ffffff" };
    case "TEMPORARY_RESIDENCE":
      return { backgroundColor: "#f59e0b", borderColor: "#f59e0b", color: "#ffffff" };
    case "ACCOMMODATION":
      return { backgroundColor: "#8b5cf6", borderColor: "#8b5cf6", color: "#ffffff" };
    case "TEMPORARY_ABSENCE":
      return { backgroundColor: "#3b82f6", borderColor: "#3b82f6", color: "#ffffff" };
    case "INACTIVE":
      return { backgroundColor: "#0f172a", borderColor: "#020617", color: "#ffffff" };
    default:
      return { backgroundColor: "#f3f4f6", borderColor: "#e5e7eb", color: "#374151" };
  }
};

const isEditableResidentStatus = (value: unknown): value is EditableResidentStatus => {
  return RESIDENT_STATUS_OPTIONS.some((o) => o.value === value);
};

interface ResidentData {
  id: string;
  fullName: string;
  idCard?: string;
  dob?: string;
  homeTown?: string;
  email?: string;
  phoneNumber?: string;
  roomNumber?: string;
  building?: string;
  status: EditableResidentStatus | "INACTIVE" | "N/A";
  hasAccount?: boolean;
}

const normalizeResidentData = (raw: any): ResidentData => {
  const roomNumber = raw?.roomNumber ?? raw?.room ?? raw?.apartment?.roomNumber;
  return {
    id: String(raw?.id ?? ""),
    fullName: raw?.fullName ?? "",
    idCard: raw?.idCard ?? undefined,
    dob: raw?.dob ?? undefined,
    homeTown: raw?.homeTown ?? undefined,
    email: raw?.email ?? undefined,
    phoneNumber: raw?.phoneNumber ?? raw?.phone ?? undefined,
    roomNumber: roomNumber == null ? undefined : String(roomNumber),
    building: raw?.building ?? raw?.buildingName ?? undefined,
    status: raw?.status ?? "N/A",
    hasAccount: raw?.hasAccount,
  };
};

export function ResidentManagement() {
  const [residents, setResidents] = useState<ResidentData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
const [includeInactive, setIncludeInactive] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ResidentStatusFilter>("ALL");

  // --- TẠO STATE CHO FORM "THÊM MỚI" ---
  const [newName, setNewName] = useState("");
  const [newIDCard, setnewIDCard] = useState("");
  const [newDOB, setNewDOB] = useState("");
  const [newHomeTown, setNewHomeTown] = useState(""); 
  const [newAppartmentID, setNewAppartmentID] = useState("");
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');

  // Tao state cho apartment Dropdown
  const [apartmentList, setApartmentList] = useState<{ id: string, label: string }[]>([]);
  const [apartmentKeyword, setApartmentKeyword] = useState("");
  
  //kiem soat dong mo dialog
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  //State xu ly viec xoa 
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [residentToDelete, setResidentToDelete] = useState<ResidentData | null>(null);

  // Các state riêng cho form update (Dùng cho View/Edit Modal)
  const [updateName, setUpdateName] = useState("");
  const [updateIDCard, setUpdateIDCard] = useState("");
  const [updateDOB, setUpdateDOB] = useState("");
  const [updateHomeTown, setUpdateHomeTown] = useState("");
  const [updateEmail, setUpdateEmail] = useState("");
  const [updatePhone, setUpdatePhone] = useState("");
  const [updateStatus, setUpdateStatus] = useState<EditableResidentStatus>("PERMANENT_RESIDENCE");

  // --- STATE CHO MODAL VIEW/EDIT DETAIL ---
  const [selectedResident, setSelectedResident] = useState<ResidentData | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); 

  const [createAccount, setCreateAccount] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  const hasAccount = selectedResident?.hasAccount === true;
  const accountButtonLabel = hasAccount
    ? "Đã có tài khoản cư dân"
    : isCreatingAccount
      ? "Đang tạo tài khoản..."
      : "Tạo tài khoản cho cư dân";

  useEffect(() => {
    fetchResidents();
  }, []) 

  // --- FETCH DỮ LIỆU CƯ DÂN ---
  const fetchResidents = async () => {
    try {
      // Đổi sang domain ngrok mới của chú
      let url = 'https://untoasted-jean-unsympathisingly.ngrok-free.dev/api/v1/residents';

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Header quan trọng để ngrok không chặn API
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (!response.ok) {
        throw new Error("Can't get residents");
      }

      const res = await response.json();
      const data = Array.isArray(res.data) ? res.data.map(normalizeResidentData) : [];
      setResidents(data);
    }
    catch (err) {
      // Chuẩn cú pháp log lỗi để chú dễ kiểm tra
      console.log(err);
      setError((err as Error).message);
    }
  }

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setIsEditMode(false);
    setSelectedResident(null);
    void fetchResidents();
  };

  const filteredResidents = residents.filter((resident) => {
    if (statusFilter === "INACTIVE") {
      return resident.status === "INACTIVE";
    }

    if (!includeInactive && resident.status === "INACTIVE" && statusFilter === "ALL") {
      return false;
    }

    if (statusFilter !== "ALL" && resident.status !== statusFilter) {
      return false;
    }
  
    const keyword = searchTerm.toLowerCase();
  
    return (
      String(resident.fullName || "").toLowerCase().includes(keyword) ||
      String(resident.roomNumber || "").toLowerCase().includes(keyword) ||
      String(resident.phoneNumber || "").toLowerCase().includes(keyword) ||
      String(resident.email || "").toLowerCase().includes(keyword)
    );
  });

  const statusCounts = residents.reduce(
    (acc, resident) => {
      if (resident.status === "PERMANENT_RESIDENCE") acc.permanent += 1;
      if (resident.status === "TEMPORARY_RESIDENCE") acc.temporary += 1;
      if (resident.status === "TEMPORARY_ABSENCE") acc.absence += 1;
      if (resident.status === "ACCOMMODATION") acc.accommodation += 1;
      return acc;
    },
    { permanent: 0, temporary: 0, absence: 0, accommodation: 0 },
  );

  // --- API CALL: CREATE RESIDENT ---
  const createResident = async (dataToCreate: any) => {
    try {
      // Thay sang domain ngrok mới
      const response = await fetch('https://untoasted-jean-unsympathisingly.ngrok-free.dev/api/v1/residents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Header bắt buộc khi dùng ngrok để không bị chặn
          'ngrok-skip-browser-warning': 'true'
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
      // Log lỗi chuẩn cú pháp chú dặn
      console.log(err);
      throw err;
    }
  }

  // --- HANDLE SUBMIT THÊM CƯ DÂN ---
  const handleSubmit = async () => {
    const fullName = newName.trim();
    const idCard = newIDCard.trim();

    if (!fullName || !idCard) {
      toast.warning("Thiếu thông tin", { description: "Vui lòng nhập tên và CMND/CCCD" });
      return;
    }

    if (idCard.length > 14) {
      toast.warning("CMND/CCCD không hợp lệ", { description: "Vui lòng nhập tối đa 14 ký tự" });
      return;
    }

    const email = newEmail.trim();
    const phone = newPhone.trim();

    if (createAccount && (!email || !phone)) {
      toast.warning("Thiếu thông tin", { description: "Vui lòng nhập email và số điện thoại" });
      return;
    }

    if (phone && phone.length > 10) {
      toast.warning("Số điện thoại không hợp lệ", { description: "Vui lòng nhập tối đa 10 chữ số" });
      return;
    }

    const promise = new Promise(async (resolve, reject) => {
      try {
        const dataform: Record<string, unknown> = {
          fullName,
          idCard,
          status: "PERMANENT_RESIDENCE",
        };

        const dob = newDOB.trim();
        const homeTown = newHomeTown.trim();
        const apartmentID = newAppartmentID.trim();

        if (dob) dataform.dob = dob;
        if (homeTown) dataform.homeTown = homeTown;
        if (apartmentID) dataform.apartmentID = apartmentID;
        if (createAccount) {
          dataform.email = email;
          dataform.phone = phone;
        }

        const createdRes = await createResident(dataform);
        const createdResident = normalizeResidentData((createdRes as any)?.data ?? createdRes);

        // Reset form
        setNewName("");
        setnewIDCard("");
        setNewDOB("");
        setNewHomeTown("");
        setNewAppartmentID("");
        setApartmentKeyword("");
        setCreateAccount(false); // Reset checkbox
        setNewEmail(''); // Reset email
        setNewPhone(''); // Reset phone
        setIsAddDialogOpen(false);

        setSelectedResident(createdResident);
        setUpdateName(createdResident.fullName);
        setUpdateIDCard(createdResident.idCard || "");
        setUpdateDOB(createdResident.dob || "");
        setUpdateHomeTown(createdResident.homeTown || "");
        setUpdateEmail(createdResident.email || "");
        setUpdatePhone(createdResident.phoneNumber || "");
        setUpdateStatus(isEditableResidentStatus(createdResident.status) ? createdResident.status : "PERMANENT_RESIDENCE");
        setIsEditMode(false);
        setIsViewModalOpen(true);

        resolve("Đã thêm cư dân thành công!");
      } catch (err) {
        reject(err);
      }
    });

    toast.promise(promise, {
      loading: 'Đang tạo cư dân...',
      success: (data) => `${data}`,
      error: (err) => `Lỗi: ${(err as Error).message}`,
    });
  }

  // --- FETCH APARTMENT DROPDOWN ---
  useEffect(() => {
    const getApartmentDropDown = async () => {
      try {
        // Thay domain sang ngrok mới của chú
        let url = `https://untoasted-jean-unsympathisingly.ngrok-free.dev/api/v1/apartments/dropdown?keyword=${encodeURIComponent(apartmentKeyword || "")}`;
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Header quan trọng để vượt qua trang cảnh báo của ngrok
            'ngrok-skip-browser-warning': 'true'
          }
        });
  
        if (!response.ok) {
          throw new Error("Can't get apartments");
        }
        const res = await response.json();
        setApartmentList(res.data || []);
      }
      catch (err) {
        // Chuẩn cú pháp log lỗi chú dặn
        console.log(err);
        setApartmentList([]);
      }
    }
    getApartmentDropDown();
  }, [apartmentKeyword])

  // --- HANDLE DELETE ---
  const openDeleteDialog = (resident: ResidentData) => {
    setResidentToDelete(resident);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async (residentID: string, isHardDelete: boolean) => {
    const deleteAction = async () => {
      let baseUrl = `https://untoasted-jean-unsympathisingly.ngrok-free.dev/api/v1/residents`;
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
      error: (err) => `Xóa thất bại: ${(err as Error).message}`
    });
  }

  // --- HANDLE UPDATE ---
  const handleUpdate = async () => {
    if (!selectedResident) return;
    
    const updateAction = async () => {
      const dataToUpdate = {
        fullName: updateName,
        idCard: updateIDCard,
        dob: updateDOB,
        homeTown: updateHomeTown, 
        email: updateEmail,
        phone: updatePhone,
        status: updateStatus,
      }
      
      // 1. Domain cho lệnh PUT (Cập nhật)
      let url = `https://untoasted-jean-unsympathisingly.ngrok-free.dev/api/v1/residents/${selectedResident.id}`;
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true" // Vượt rào ngrok
        },
        body: JSON.stringify(dataToUpdate),
      });

      const res = await response.json();
      if (!response.ok) {
        throw new Error(res.message || "Không thể cập nhật cư dân");
      }
      
      // Tải lại bảng danh sách
      await fetchResidents();

      // 2. Domain cho lệnh GET (Lấy chi tiết sau khi sửa)
      const detailResponse = await fetch(`https://untoasted-jean-unsympathisingly.ngrok-free.dev/api/v1/residents/${selectedResident.id}`, {
        headers: {
          "ngrok-skip-browser-warning": "true" // Vượt rào ngrok
        }
      });
      const detailRes = await detailResponse.json();
      
      setSelectedResident(normalizeResidentData(detailRes.data)); 
      setIsEditMode(false); 
    };

    toast.promise(updateAction(), {
      loading: 'Đang cập nhật...',
      success: 'Cập nhật thông tin thành công!',
      error: (err) => `Cập nhật thất bại: ${(err as Error).message}`
    });
  }
  
  const handleCreateAccount = async () => {
    if (!selectedResident?.id) return;
    if (selectedResident.hasAccount === true) {
      toast.info("Cư dân đã có tài khoản");
      return;
    }

    const createAction = async () => {
      setIsCreatingAccount(true);
      try {
        // Thay domain sang ngrok mới của chú
        const response = await fetch(`https://untoasted-jean-unsympathisingly.ngrok-free.dev/api/v1/residents/${selectedResident.id}/account`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Header bắt buộc để chạy qua ngrok
            "ngrok-skip-browser-warning": "true"
          }
        });

        const res = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(res.message || "Không thể tạo tài khoản cư dân");
        }

        const updated = normalizeResidentData(res.data);
        setSelectedResident(updated);
        
        // Hàm fetchResidents này chú cũng nhớ phải dùng domain ngrok bên trong nhé
        await fetchResidents();
      } catch (err) {
        // Log lỗi chuẩn cú pháp chú dặn
        console.log(err);
        throw err;
      } finally {
        setIsCreatingAccount(false);
      }
    };

    toast.promise(createAction(), {
      loading: "Đang tạo tài khoản cư dân...",
      success: "Tạo tài khoản cư dân thành công!",
      error: (err) => `Tạo tài khoản thất bại: ${(err as Error).message}`,
    });
  };

  // Hàm tải chi tiết và mở ở chế độ VIEW
  const handleViewDetail = async (id: string) => {
    setIsLoadingDetail(true);
    setIsEditMode(false); 
    try {
        // Thay domain sang ngrok mới của chú
        const response = await fetch(`https://untoasted-jean-unsympathisingly.ngrok-free.dev/api/v1/residents/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Header "vượt rào" ngrok để lấy dữ liệu JSON thay vì trang cảnh báo
                'ngrok-skip-browser-warning': 'true'
            }
        });
        
        if (!response.ok) {
            throw new Error("Không thể tải thông tin chi tiết cư dân");
        }

        const res = await response.json();
        const residentData = normalizeResidentData(res.data);

        // Chuẩn bị dữ liệu đầy đủ cho Form Edit
        setSelectedResident(residentData); 
        setUpdateName(residentData.fullName);
        setUpdateIDCard(residentData.idCard || ""); 
        setUpdateDOB(residentData.dob || "");
        setUpdateHomeTown(residentData.homeTown || ""); 
        setUpdateEmail(residentData.email || "");
        setUpdatePhone(residentData.phoneNumber || "");
        setUpdateStatus(isEditableResidentStatus(residentData.status) ? residentData.status : "PERMANENT_RESIDENCE");
        
        setIsViewModalOpen(true); // Mở Modal
    } catch (err) {
        // Chuẩn cú pháp log lỗi để chú dễ kiểm tra
        console.log(err);
        toast.error("Lỗi tải dữ liệu", { description: (err as Error).message });
        setIsViewModalOpen(false);
    } finally {
        setIsLoadingDetail(false);
    }
  };

  // Hàm tải chi tiết và mở ở chế độ EDIT
  const handleOpenEdit = async (resident: ResidentData) => {
    setSelectedResident(resident);
    setIsViewModalOpen(true);
    setIsEditMode(true);
    setIsLoadingDetail(true); 

    try {
        // Thay domain sang ngrok mới của chú
        const response = await fetch(`https://untoasted-jean-unsympathisingly.ngrok-free.dev/api/v1/residents/${resident.id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Header quan trọng để không bị trang cảnh báo ngrok chặn
                'ngrok-skip-browser-warning': 'true'
            }
        });
        
        if (!response.ok) {
            throw new Error("Không thể tải thông tin chi tiết cư dân để chỉnh sửa");
        }

        const res = await response.json();
        const residentData = normalizeResidentData(res.data);

        // Cập nhật state với DỮ LIỆU ĐẦY ĐỦ từ API chi tiết
        setSelectedResident(residentData); 
        setUpdateName(residentData.fullName);
        setUpdateIDCard(residentData.idCard || ""); 
        setUpdateDOB(residentData.dob || "");
        setUpdateHomeTown(residentData.homeTown || ""); 
        setUpdateEmail(residentData.email || "");
        setUpdatePhone(residentData.phoneNumber || "");
        setUpdateStatus(isEditableResidentStatus(residentData.status) ? residentData.status : "PERMANENT_RESIDENCE");
        
    } catch (err) {
        // Log lỗi chuẩn cú pháp chú dặn
        console.log(err);
        toast.error("Lỗi tải dữ liệu", { description: (err as Error).message });
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
          <p className="font-medium">Lỗi: {error}</p>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gray-900">Quản lý cư dân</h1>
          <p className="text-gray-600 mt-1">Quản lý tất cả cư dân và thông tin của họ</p>
        </div>
        <Button
          onClick={() => {
            setIsAddDialogOpen(true);
          }}
          className="flex rounded-full items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-xl transition-all">
          <Plus className="w-5 h-5" />
          Thêm Cư Dân
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="flex justify-between items-center p-6 rounded-xl shadow-md h-32 relative overflow-hidden" style={{ backgroundColor: '#10b981' }}>
          <div className="flex flex-col">
            <p className="text-4xl font-bold text-white">{statusCounts.permanent}</p>
            <p className="text-sm font-medium mt-1 text-white">Thường trú</p>
          </div>
          <Home className="h-12 w-12 text-white opacity-80" />
        </div>

        <div className="flex justify-between items-center p-6 rounded-xl shadow-md h-32 relative overflow-hidden" style={{ backgroundColor: '#f59e0b' }}>
          <div className="flex flex-col">
            <p className="text-4xl font-bold text-white">{statusCounts.temporary}</p>
            <p className="text-sm font-medium mt-1 text-white">Tạm trú</p>
          </div>
          <Clock className="h-12 w-12 text-white opacity-80" />
        </div>

        <div className="flex justify-between items-center p-6 rounded-xl shadow-md h-32 relative overflow-hidden" style={{ backgroundColor: '#8b5cf6' }}>
          <div className="flex flex-col">
            <p className="text-4xl font-bold text-white">{statusCounts.accommodation}</p>
            <p className="text-sm font-medium mt-1 text-white">Lưu trú</p>
          </div>
          <Globe className="h-12 w-12 text-white opacity-80" />
        </div>

        <div className="flex justify-between items-center p-6 rounded-xl shadow-md h-32 relative overflow-hidden" style={{ backgroundColor: '#3b82f6' }}>
          <div className="flex flex-col">
            <p className="text-4xl font-bold text-white">{statusCounts.absence}</p>
            <p className="text-sm font-medium mt-1 text-white">Tạm vắng</p>
          </div>
          <UserMinus className="h-12 w-12 text-white opacity-80" />
        </div>
      </div>

      <div className="flex items-center justify-between gap-6 w-full bg-white p-2 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-100">
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

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer whitespace-nowrap">
            <input
              type="checkbox"
              checked={includeInactive}
              onChange={(e) => setIncludeInactive(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Bao gồm đã chuyển đi
          </label>

          <div className="w-52">
            <Select value={statusFilter} onValueChange={(value: string) => setStatusFilter(value as ResidentStatusFilter)}>
              <SelectTrigger className="flex items-center justify-between w-full h-11 px-4 bg-white border border-gray-200 rounded-xl shadow-sm text-sm font-medium text-gray-700 hover:border-blue-400 transition-all">
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent
                align="start"
                className="z-[9999] w-[var(--radix-popper-anchor-width)] min-w-[var(--radix-popper-anchor-width)] rounded-xl border border-gray-200 !bg-white !opacity-100 shadow-xl ring-1 ring-gray-200/70 [&_[data-slot=select-viewport]]:!bg-white [&_[data-slot=select-viewport]]:!opacity-100"
              >
                {RESIDENT_STATUS_FILTER_OPTIONS.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    hideIndicator
                    className="cursor-pointer rounded-lg px-3 py-2 text-sm text-gray-700 outline-none data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-700 data-[state=checked]:bg-blue-100 data-[state=checked]:font-semibold data-[state=checked]:text-blue-800 !pr-3"
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>



      {/* Residents Table */}
      <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden !bg-white">
        <div className="overflow-x-auto">
          <table className="w-full bg-white !bg-white">
            <thead className="bg-blue-600 border-b-2 border-blue-700">
              <tr>
                <th className="text-left px-6 py-4 text-sm text-white">Cư dân</th>
                <th className="text-left px-6 py-4 text-sm text-white">Số phòng</th>
                <th className="text-left px-6 py-4 text-sm text-white">Liên hệ</th>
                <th className="text-left px-6 py-4 text-sm text-white">Trạng thái</th>
                <th className="text-left px-6 py-4 text-sm text-white">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-gray-200 bg-white !bg-white">
              {filteredResidents.map((resident) => (
                <tr key={resident.id} className="bg-white !bg-white hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm">
                        {resident.fullName ? resident.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : 'N/A'}
                      </div>
                      <div>
                        <p className="text-gray-900 text-sm font-medium">{resident.fullName || 'N/A'}</p>
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
                    <span
                      className="inline-flex px-3 py-1 rounded-full text-sm font-medium border"
                      style={getResidentStatusBadgeStyle(resident.status)}
                    >
                      {getResidentStatusLabel(resident.status)}
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
              maxLength={14}
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
                      maxLength={10}
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
              Thêm cư dân
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
    onClose={handleCloseViewModal}
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
                            <span
                              className="px-3 py-1 rounded-full text-xs font-bold border shadow-sm"
                              style={getResidentStatusBadgeStyle(isEditMode ? updateStatus : selectedResident.status)}
                            >
                                {getResidentStatusLabel(isEditMode ? updateStatus : selectedResident.status)}
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
                                <Input id="updateName" type="text" value={updateName} onChange={(e) => setUpdateName(e.target.value)} className="mt-1 h-11 rounded-xl bg-white border-gray-200 px-4"/></div>
                                
                                <div><Label htmlFor="updateIDCard">CMND / CCCD</Label>
                                <Input id="updateIDCard" type="text" value={updateIDCard} onChange={(e) => setUpdateIDCard(e.target.value)} maxLength={14} className="mt-1 h-11 rounded-xl bg-white border-gray-200 px-4"/></div>
                                
                                <div><Label htmlFor="updateDOB">Ngày Sinh</Label>
                                <Input id="updateDOB" type="date" value={updateDOB} onChange={(e) => setUpdateDOB(e.target.value)} className="mt-1 h-11 rounded-xl bg-white border-gray-200 px-4"/></div>
                                
                                <div><Label htmlFor="updateHomeTown">Quê Quán</Label>
                                <Input id="updateHomeTown" type="text" value={updateHomeTown} onChange={(e) => setUpdateHomeTown(e.target.value)} className="mt-1 h-11 rounded-xl bg-white border-gray-200 px-4"/></div>
                            </div>
                        </div>

                        {/* CỘT PHẢI: Form Liên lạc */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider border-b pb-2">
                                Thông Tin Liên Hệ
                            </h3>
                            <div className="space-y-3">
                                <div><Label htmlFor="updatePhone">Số Điện Thoại</Label>
                                <Input id="updatePhone" type="tel" value={updatePhone} onChange={(e) => setUpdatePhone(e.target.value)} maxLength={10} className="mt-1 h-11 rounded-xl bg-white border-gray-200 px-4"/></div>
                                
                                <div><Label htmlFor="updateEmail">Email</Label>
                                <Input id="updateEmail" type="email" value={updateEmail} onChange={(e) => setUpdateEmail(e.target.value)} className="mt-1 h-11 rounded-xl bg-white border-gray-200 px-4"/></div>

                                <div>
                                    <Label htmlFor="updateStatus">Trạng thái cư trú</Label>
                                    <select
                                      id="updateStatus"
                                      value={updateStatus}
                                      onChange={(e) => setUpdateStatus(e.target.value as EditableResidentStatus)}
                                      className="mt-1 h-11 w-full rounded-xl bg-white border border-gray-200 px-4 text-base md:text-sm text-gray-700 shadow-sm hover:border-blue-400 transition-all outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                                    >
                                      {RESIDENT_STATUS_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                          {opt.label}
                                        </option>
                                      ))}
                                    </select>
                                </div>
                                
                                {/* Apartment (Read Only) */}
                                <div className="mt-4 p-4 bg-gray-100 border border-gray-200 rounded-xl">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Căn Hộ (Chỉ Xem)</p>
                                    <div className="grid grid-cols-[auto,1fr,auto,auto] items-baseline gap-x-2">
                                        <span className="text-sm font-semibold text-gray-500 uppercase">Tòa</span>
                                        <span className="text-base font-bold text-gray-900 tracking-tight truncate">
                                            {selectedResident.building || "N/A"}
                                        </span>
                                        <span className="text-sm font-semibold text-gray-500 uppercase">Phòng</span>
                                        <span className="text-xl font-extrabold text-gray-900 tracking-tight font-mono">
                                            {selectedResident.roomNumber || "N/A"}
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
                                    <div className="grid grid-cols-[auto,1fr,auto,auto] items-baseline gap-x-2 relative z-10">
                                        <span className="text-sm font-semibold text-blue-600 uppercase">Tòa</span>
                                        <span className="text-base font-bold text-blue-900 tracking-tight truncate">
                                            {selectedResident.building || "N/A"}
                                        </span>
                                        <span className="text-sm font-semibold text-blue-600 uppercase">Phòng</span>
                                        <span className="text-xl font-extrabold text-blue-900 tracking-tight font-mono">
                                            {selectedResident.roomNumber || "N/A"}
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
                        <Button variant="outline" onClick={handleCloseViewModal} className="rounded-full px-6">
                            Đóng
                        </Button>
                        
                        {/* 🔥 NÚT CREATE ACCOUNT (TẠO TÀI KHOẢN) */}
                        <Button 
                            onClick={() => {
                              if (hasAccount) {
                                toast.info("Cư dân đã có tài khoản");
                                return;
                              }
                              handleCreateAccount();
                            }}
                            disabled={isCreatingAccount}
                            className={`rounded-full px-6 shadow-lg disabled:opacity-100 ${
                              hasAccount
                                ? "bg-gray-200 text-gray-600 shadow-none cursor-default"
                                : "bg-green-600 text-white"
                            }`}
                        >
                            <Users className="w-4 h-4 mr-2" /> {accountButtonLabel}
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

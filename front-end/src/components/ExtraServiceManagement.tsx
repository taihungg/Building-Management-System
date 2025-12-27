import { Search, Plus, Calendar, Trash2, Home, ArrowRight, Eye } from 'lucide-react';
import { Modal } from './Modal'; 
import { Toaster, toast } from 'sonner';
import { useState, useEffect, useCallback } from 'react';
import React from 'react';

type ExtraFeeSummary = {
    id: string;
    title: string;
    amount: number;
    feeDate: string;
    isBilled: boolean;
    apartmentLabel: string;
};

type ApartmentDropdownItem = {
    id: string;
    label: string;
};

type ExtraFeeDetailApi = {
    title?: string;
    description?: string;
    quantity?: string | number;
    unitPrice?: string | number;
    amount?: string | number;
    feeDate?: string;
    apartmentLabel?: string;
    isBilled?: boolean;
    billed?: boolean;
};

export function ExtraServiceManagement() {
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
    // STATE CHO CHI TIẾT
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<(ExtraFeeSummary & ExtraFeeDetailApi) | null>(null);
    const [isDetailLoading, setIsDetailLoading] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [services, setServices] = useState<ExtraFeeSummary[]>([]);

    const [createApartmentKeyword, setCreateApartmentKeyword] = useState('');
    const [createApartmentOptions, setCreateApartmentOptions] = useState<ApartmentDropdownItem[]>([]);
    const [createApartmentSelected, setCreateApartmentSelected] = useState<ApartmentDropdownItem | null>(null);
    const [createTitle, setCreateTitle] = useState('');
    const [createDescription, setCreateDescription] = useState('');
    const [createQuantity, setCreateQuantity] = useState('1');
    const [createUnitPrice, setCreateUnitPrice] = useState('');
    const [createFeeDate, setCreateFeeDate] = useState('');
    const [createIsBilled, setCreateIsBilled] = useState(false);
    const [isCreateSubmitting, setIsCreateSubmitting] = useState(false);

    const parseMoney = (value: any) => {
        if (typeof value === 'number') return value;
        if (typeof value !== 'string') return Number(value) || 0;
        const s = value.trim();
        if (/^\d{1,3}(\.\d{3})+$/.test(s)) return Number(s.replace(/\./g, ''));
        if (/^\d{1,3}(,\d{3})+$/.test(s)) return Number(s.replace(/,/g, ''));
        if (/^\d+(\.\d+)?$/.test(s)) return Number(s);
        return Number(s.replace(/[^\d-]/g, '')) || 0;
    };

    const formatCurrency = (amount: any) => {
        const val = parseMoney(amount);
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
    };

    // Hàm mở modal chi tiết
    const handleViewDetail = async (service: ExtraFeeSummary) => {
        setIsDetailModalOpen(true);
        setSelectedService(service);
        setIsDetailLoading(true);
        try {
            const response = await fetch(`http://localhost:8081/api/v1/extrafee/${service.id}`);
            if (!response.ok) {
                const errorText = await response.text().catch(() => '');
                throw new Error(errorText || `HTTP ${response.status}: ${response.statusText}`);
            }
            const res = await response.json();
            const data: ExtraFeeDetailApi = res.data || {};
            const billed = (data.isBilled ?? data.billed ?? false) as boolean;
            setSelectedService({
                ...service,
                ...data,
                isBilled: billed,
            });
        } catch (error) {
            toast.error("Lỗi tải chi tiết", { description: (error as Error).message });
        } finally {
            setIsDetailLoading(false);
        }
    };

    const fetchExtraServices = useCallback(async (keyword: string) => {
        setIsLoading(true);
        try {
            const trimmed = keyword.trim();
            const url = trimmed
                ? `http://localhost:8081/api/v1/extrafee?keyword=${encodeURIComponent(trimmed)}`
                : `http://localhost:8081/api/v1/extrafee`;
            const response = await fetch(url);
            if (!response.ok) {
                const errorText = await response.text().catch(() => '');
                throw new Error(errorText || `HTTP ${response.status}: ${response.statusText}`);
            }
            const res = await response.json();
            const data = (res.data || []) as ExtraFeeSummary[];
            setServices(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.error("Lỗi tải dữ liệu", { description: (error as Error).message });
            setServices([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const t = setTimeout(() => {
            fetchExtraServices(searchTerm);
        }, 250);
        return () => clearTimeout(t);
    }, [fetchExtraServices, searchTerm]);

    useEffect(() => {
        const t = setTimeout(async () => {
            const keyword = createApartmentKeyword.trim();
            if (!keyword) {
                setCreateApartmentOptions([]);
                return;
            }
            try {
                const response = await fetch(`http://localhost:8081/api/v1/apartments/dropdown?keyword=${encodeURIComponent(keyword)}`);
                if (!response.ok) return;
                const res = await response.json();
                const data = (res.data || []) as ApartmentDropdownItem[];
                setCreateApartmentOptions(Array.isArray(data) ? data : []);
            } catch {
                setCreateApartmentOptions([]);
            }
        }, 250);
        return () => clearTimeout(t);
    }, [createApartmentKeyword]);

    const openCreateModal = () => {
        setIsCreateModalOpen(true);
        setCreateApartmentKeyword('');
        setCreateApartmentOptions([]);
        setCreateApartmentSelected(null);
        setCreateTitle('');
        setCreateDescription('');
        setCreateQuantity('1');
        setCreateUnitPrice('');
        setCreateFeeDate('');
        setCreateIsBilled(false);
        setIsCreateSubmitting(false);
    };

    const submitCreate = async () => {
        if (!createApartmentSelected) {
            toast.error("Thiếu căn hộ", { description: "Vui lòng chọn căn hộ" });
            return;
        }
        if (!createTitle.trim()) {
            toast.error("Thiếu nội dung", { description: "Vui lòng nhập nội dung khoản thu" });
            return;
        }
        if (!createFeeDate) {
            toast.error("Thiếu ngày", { description: "Vui lòng chọn ngày ghi nhận" });
            return;
        }
        const quantity = parseMoney(createQuantity);
        const unitPrice = parseMoney(createUnitPrice);
        if (!Number.isFinite(quantity) || quantity <= 0) {
            toast.error("Số lượng không hợp lệ");
            return;
        }
        if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
            toast.error("Đơn giá không hợp lệ");
            return;
        }
        const [year, month, day] = createFeeDate.split('-').map((x: string) => Number(x));
        if (!year || !month || !day) {
            toast.error("Ngày không hợp lệ");
            return;
        }

        setIsCreateSubmitting(true);
        try {
            const response = await fetch(`http://localhost:8081/api/v1/extrafee`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    apartmentId: createApartmentSelected.id,
                    title: createTitle.trim(),
                    description: createDescription.trim() || null,
                    quantity,
                    unitPrice,
                    isBilled: createIsBilled,
                    year,
                    month,
                    day,
                }),
            });
            if (!response.ok) {
                const errorText = await response.text().catch(() => '');
                throw new Error(errorText || `HTTP ${response.status}: ${response.statusText}`);
            }
            toast.success("Tạo khoản thu thành công");
            setIsCreateModalOpen(false);
            await fetchExtraServices(searchTerm);
        } catch (error) {
            toast.error("Tạo khoản thu thất bại", { description: (error as Error).message });
        } finally {
            setIsCreateSubmitting(false);
        }
    };

    const filteredServices = services.filter((item: ExtraFeeSummary) => {
        if (!item.feeDate) return true;
        if (startDate && item.feeDate < startDate) return false;
        if (endDate && item.feeDate > endDate) return false;
        return true;
    });

    return (
        <div className="space-y-6 p-2">
            <Toaster position="top-right" richColors />

            {/* HEADER & TOOLBAR (Giữ nguyên logic cũ của bạn) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dịch vụ phát sinh</h1>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                {/* Cụm lọc ngày bên trái */}
                <div className="flex items-center bg-white rounded-2xl shadow-sm border border-gray-100 p-1.5 gap-2" style={{ height: '48px' }}>
                    <Calendar size={16} className="ml-2 text-indigo-500" />
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="text-xs outline-none font-bold text-gray-600" />
                    <ArrowRight size={14} className="text-gray-300" />
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="text-xs outline-none font-bold text-gray-600 mr-2" />
                </div>

                {/* Cụm Search & Tạo bên phải */}
                <div className="flex items-center gap-3">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-4 flex items-center" style={{ width: '280px', height: '48px' }}>
                        <Search className="text-gray-400 mr-2" size={18} />
                        <input type="text" placeholder="Tìm số phòng..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-transparent focus:outline-none text-sm" />
                    </div>
                    <button onClick={openCreateModal} className="flex items-center gap-2 px-6 text-white rounded-xl shadow-lg transition-all hover:scale-105 font-bold" style={{ backgroundColor: '#6366f1', height: '48px' }}>
                        <Plus size={20} /> Tạo khoản thu
                    </button>
                </div>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/50 text-gray-400">
                        <tr>
                            <th className="px-6 py-4 text-[11px] font-bold uppercase">Căn hộ</th>
                            <th className="px-6 py-4 text-[11px] font-bold uppercase">Nội dung</th>
                            <th className="px-6 py-4 text-[11px] font-bold uppercase">Số tiền</th>
                            <th className="px-6 py-4 text-[11px] font-bold uppercase text-center">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {isLoading ? (
                            <tr>
                                <td className="px-6 py-6 text-sm text-gray-500" colSpan={4}>Đang tải dữ liệu...</td>
                            </tr>
                        ) : filteredServices.length === 0 ? (
                            <tr>
                                <td className="px-6 py-6 text-sm text-gray-500" colSpan={4}>Không có dữ liệu</td>
                            </tr>
                        ) : filteredServices.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-bold text-slate-700">{item.apartmentLabel}</td>
                                <td className="px-6 py-4 text-sm text-slate-600">{item.title}</td>
                                <td className="px-6 py-4 font-extrabold text-indigo-600">{formatCurrency(item.amount)}</td>
                                <td className="px-6 py-4 flex justify-center gap-2">
                                    <button 
                                        onClick={() => handleViewDetail(item)}
                                        className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                                        title="Xem chi tiết"
                                    >
                                        <Eye size={18} />
                                    </button>
                                    <button className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Tạo khoản thu phát sinh"
            >
                <div className="p-6 space-y-5">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-600">Căn hộ</label>
                        <input
                            value={createApartmentSelected ? createApartmentSelected.label : createApartmentKeyword}
                            onChange={(e) => {
                                setCreateApartmentSelected(null);
                                setCreateApartmentKeyword(e.target.value);
                            }}
                            placeholder="Nhập số phòng/từ khóa..."
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none"
                        />
                        {createApartmentSelected ? null : (
                            <div className="max-h-44 overflow-y-auto border border-gray-100 rounded-xl bg-white">
                                {createApartmentOptions.map((opt) => (
                                    <button
                                        type="button"
                                        key={opt.id}
                                        onClick={() => {
                                            setCreateApartmentSelected(opt);
                                            setCreateApartmentKeyword('');
                                            setCreateApartmentOptions([]);
                                        }}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                                {createApartmentKeyword.trim() && createApartmentOptions.length === 0 ? (
                                    <div className="px-4 py-2 text-sm text-gray-500">Không tìm thấy căn hộ</div>
                                ) : null}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-600">Ngày ghi nhận</label>
                            <input
                                type="date"
                                value={createFeeDate}
                                onChange={(e) => setCreateFeeDate(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-600">Trạng thái</label>
                            <select
                                value={createIsBilled ? 'billed' : 'pending'}
                                onChange={(e) => setCreateIsBilled(e.target.value === 'billed')}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none"
                            >
                                <option value="pending">Chờ xử lý</option>
                                <option value="billed">Đã lập hóa đơn</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-600">Nội dung</label>
                        <input
                            value={createTitle}
                            onChange={(e) => setCreateTitle(e.target.value)}
                            placeholder="Ví dụ: Phí sửa chữa..."
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-600">Mô tả</label>
                        <textarea
                            value={createDescription}
                            onChange={(e) => setCreateDescription(e.target.value)}
                            placeholder="Nhập mô tả (không bắt buộc)..."
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none min-h-[96px]"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-600">Số lượng</label>
                            <input
                                value={createQuantity}
                                onChange={(e) => setCreateQuantity(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-600">Đơn giá (VND)</label>
                            <input
                                value={createUnitPrice}
                                onChange={(e) => setCreateUnitPrice(e.target.value)}
                                placeholder="Ví dụ: 500000"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => setIsCreateModalOpen(false)}
                            className="flex-1 py-3 rounded-xl border border-gray-200 font-bold"
                            disabled={isCreateSubmitting}
                        >
                            Hủy
                        </button>
                        <button
                            type="button"
                            onClick={submitCreate}
                            className="flex-1 py-3 rounded-xl bg-gray-900 text-white font-bold"
                            disabled={isCreateSubmitting}
                        >
                            {isCreateSubmitting ? 'Đang tạo...' : 'Tạo khoản thu'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* MODAL CHI TIẾT KHOẢN THU */}
            <Modal 
                isOpen={isDetailModalOpen} 
                onClose={() => {
                    setIsDetailModalOpen(false);
                    setSelectedService(null);
                    setIsDetailLoading(false);
                }}
                title="Chi tiết dịch vụ phát sinh"
            >
                {isDetailLoading && !selectedService ? (
                    <div className="p-6 text-sm text-gray-500">Đang tải chi tiết...</div>
                ) : selectedService && (
                    <div className="p-6 space-y-6">
                        {/* Header chi tiết */}
                        <div className="flex items-center gap-4 p-4 bg-indigo-50 rounded-2xl">
                            <div className="bg-indigo-500 p-3 rounded-xl text-white">
                                <Home size={24} />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Căn hộ</h4>
                                <p className="text-xl font-black text-indigo-900">{selectedService.apartmentLabel}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Tên dịch vụ</label>
                                <p className="text-sm font-bold text-gray-700">{selectedService.title}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Ngày ghi nhận</label>
                                <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                    <Calendar size={14} className="text-gray-400" />
                                    {selectedService.feeDate}
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-200">
                            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">Mô tả nội dung</label>
                            <p className="text-sm text-gray-600 italic">
                                {selectedService.description || "Không có mô tả chi tiết."}
                            </p>
                        </div>

                        {/* Bảng giá nhỏ */}
                        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                            <div className="grid grid-cols-3 bg-gray-50 px-4 py-2 border-b border-gray-100">
                                <span className="text-[10px] font-bold text-gray-400">Số lượng</span>
                                <span className="text-[10px] font-bold text-gray-400">Đơn giá</span>
                                <span className="text-[10px] font-bold text-gray-400 text-right">Thành tiền</span>
                            </div>
                            <div className="grid grid-cols-3 px-4 py-4 items-center">
                                <span className="text-sm font-bold text-gray-700">{selectedService.quantity || 1}</span>
                                <span className="text-sm font-medium text-gray-600">{formatCurrency(selectedService.unitPrice || selectedService.amount)}</span>
                                <span className="text-lg font-black text-indigo-600 text-right">{formatCurrency(selectedService.amount)}</span>
                            </div>
                        </div>

                        {/* Trạng thái hóa đơn */}
                        <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-100">
                            <span className="text-sm font-bold text-gray-500">Trạng thái thanh toán</span>
                            {(selectedService.isBilled ?? selectedService.billed) ? (
                                <span className="px-4 py-1.5 bg-emerald-100 text-emerald-600 rounded-full text-[10px] font-black uppercase">
                                    Đã lập hóa đơn
                                </span>
                            ) : (
                                <span className="px-4 py-1.5 bg-amber-100 text-amber-600 rounded-full text-[10px] font-black uppercase">
                                    Chờ xử lý
                                </span>
                            )}
                        </div>

                        <button 
                            onClick={() => setIsDetailModalOpen(false)}
                            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold transition-all hover:bg-gray-800"
                        >
                            Đóng cửa sổ
                        </button>
                    </div>
                )}
            </Modal>
        </div>
    );
}

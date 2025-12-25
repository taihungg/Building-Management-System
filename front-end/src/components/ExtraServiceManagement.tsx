import { Search, Plus, Calendar, FileText, Trash2, Home, ArrowRight, X, Eye, Info } from 'lucide-react';
import { Modal } from './Modal'; 
import { Toaster, toast } from 'sonner';
import { useState, useEffect, useCallback } from 'react';
import React from 'react';

export function ExtraServiceManagement() {
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
    // STATE CHO CHI TIẾT
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<any>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [services, setServices] = useState([
        {
            id: "SRV-001",
            title: "Phí sử dụng Bể bơi tháng 12",
            description: "Gói vé tháng cho gia đình 4 người, đăng ký từ ngày 01/12.",
            quantity: "1",
            unitPrice: "500000",
            amount: "500000",
            isBilled: true,
            feeDate: "2023-12-01",
            apartmentLabel: "A.101",
            serviceType: "SWIMMING"
        },
        {
            id: "SRV-002",
            title: "Sửa chữa vòi hoa sen",
            description: "Thay mới vòi hoa sen phòng tắm chính do bị rò rỉ nước. Bao gồm tiền công và vật tư.",
            quantity: "1",
            unitPrice: "250000",
            amount: "250000",
            isBilled: false,
            feeDate: "2023-12-15",
            apartmentLabel: "B.205",
            serviceType: "REPAIR"
        },
        {
            id: "SRV-003",
            title: "Phí thẻ tập Gym - Anh Nam",
            description: "Gia hạn thẻ tập Gym 3 tháng (giảm giá 10% cho cư dân).",
            quantity: "3",
            unitPrice: "300000",
            amount: "900000",
            isBilled: false,
            feeDate: "2023-12-20",
            apartmentLabel: "C.1502",
            serviceType: "GYM"
        },
        {
            id: "SRV-004",
            title: "Vệ sinh máy lạnh",
            description: "Bảo trì định kỳ 2 máy lạnh (Phòng khách và phòng ngủ).",
            quantity: "2",
            unitPrice: "150000",
            amount: "300000",
            isBilled: true,
            feeDate: "2023-12-22",
            apartmentLabel: "A.101",
            serviceType: "REPAIR"
        }
    ]);

    const formatCurrency = (amount: any) => {
        const val = Number(amount) || 0;
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
    };

    // Hàm mở modal chi tiết
    const handleViewDetail = (service: any) => {
        setSelectedService(service);
        setIsDetailModalOpen(true);
    };

    // Giả lập Fetch dữ liệu
    const fetchExtraServices = useCallback(async () => {
        setIsLoading(true);
        try {
            //const response = await fetch('http://localhost:8081/api/v1/accounting/extra-services');
            //const res = await response.json();
            //setServices(res.data || []);
        } catch (error) {
            console.error("Lỗi tải dữ liệu:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchExtraServices(); }, [fetchExtraServices]);

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
                    <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2 px-6 text-white rounded-xl shadow-lg transition-all hover:scale-105 font-bold" style={{ backgroundColor: '#6366f1', height: '48px' }}>
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
                        {services.map((item: any) => (
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

            {/* MODAL CHI TIẾT KHOẢN THU */}
            <Modal 
                isOpen={isDetailModalOpen} 
                onClose={() => setIsDetailModalOpen(false)} 
                title="Chi tiết dịch vụ phát sinh"
            >
                {selectedService && (
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
                            {selectedService.isBilled ? (
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
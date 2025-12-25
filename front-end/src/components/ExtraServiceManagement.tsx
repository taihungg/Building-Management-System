import { Search, Plus, Calendar, FileText, Trash2, Tag, Home, CreditCard, Filter } from 'lucide-react';
import { Modal } from './Modal'; 
import { Toaster, toast } from 'sonner';
import { useState, useEffect, useCallback } from 'react';
import React from 'react';

const SERVICE_TYPES = [
    { label: 'Tất cả', value: 'All' },
    { label: 'Bể bơi', value: 'SWIMMING' },
    { label: 'Gym', value: 'GYM' },
    { label: 'Sửa chữa', value: 'REPAIR' },
    { label: 'Khác', value: 'OTHER' },
];

export function ExtraServiceManagement() {
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [services, setServices] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // Form state cho khoản thu mới
    const [newService, setNewService] = useState({
        apartmentId: '',
        serviceType: 'SWIMMING',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);

    // Giả lập Fetch dữ liệu
    const fetchExtraServices = useCallback(async () => {
        setIsLoading(true);
        try {
            // Thay đổi URL theo API thực tế của bạn
            const response = await fetch('http://localhost:8081/api/v1/accounting/extra-services');
            const res = await response.json();
            setServices(res.data || []);
        } catch (error) {
            console.error(error);
            // setServices([...]) // Bạn có thể set data mẫu ở đây để test UI
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchExtraServices(); }, [fetchExtraServices]);

    const handleCreateService = async () => {
        try {
            // Logic gọi API POST ở đây
            toast.success("Đã thêm khoản thu phát sinh thành công!");
            setIsCreateModalOpen(false);
            fetchExtraServices();
        } catch (error) {
            toast.error("Không thể thêm khoản thu");
        }
    };

    return (
        <div className="space-y-6 p-2">
            <Toaster position="top-right" richColors />

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dịch vụ phát sinh</h1>
                    <p className="text-gray-500 mt-1">Ghi nhận các khoản phí ngoài tiền nhà (Bể bơi, Gym, sửa chữa...)</p>
                </div>

                <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 text-white rounded-xl shadow-lg transition-all hover:scale-105 font-bold"
                    style={{ backgroundColor: '#6366f1' }}
                >
                    <Plus size={20} /> Tạo khoản thu
                </button>
            </div>

            {/* BỘ LỌC & SEARCH */}
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 flex items-center w-full lg:w-96">
                    <Search className="ml-3 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm số phòng hoặc nội dung..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 bg-transparent focus:outline-none text-sm"
                    />
                </div>
                
                <div className="flex bg-gray-100 p-1 rounded-2xl gap-1">
                    {SERVICE_TYPES.map(type => (
                        <button key={type.value} className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-white hover:shadow-sm transition-all">
                            {type.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* TABLE DỊCH VỤ */}
            <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 text-gray-400">
                            <tr>
                                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider">Căn hộ</th>
                                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider">Dịch vụ</th>
                                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider">Nội dung</th>
                                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider">Số tiền</th>
                                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider">Ngày ghi nhận</th>
                                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {services.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-20 text-gray-400 italic">Chưa có khoản thu phát sinh nào trong tháng</td></tr>
                            ) : (
                                services.map((item: any) => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Home size={14} className="text-indigo-400" />
                                                <span className="font-bold text-slate-700">{item.apartmentLabel}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
                                                {item.serviceType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{item.description}</td>
                                        <td className="px-6 py-4 font-extrabold text-slate-900">{formatCurrency(item.amount)}</td>
                                        <td className="px-6 py-4 text-xs text-slate-400">{item.date}</td>
                                        <td className="px-6 py-4">
                                            <button className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL TẠO KHOẢN THU */}
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Ghi nhận dịch vụ phát sinh">
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Căn hộ</label>
                            <input type="text" placeholder="Ví dụ: A.101" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Loại dịch vụ</label>
                            <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none">
                                <option value="SWIMMING">Bể bơi</option>
                                <option value="GYM">Gym</option>
                                <option value="REPAIR">Sửa chữa</option>
                                <option value="OTHER">Khác</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Số tiền (VND)</label>
                        <input type="number" placeholder="0" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-indigo-600 outline-none" />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Mô tả chi tiết</label>
                        <textarea rows={3} placeholder="Ghi chú thêm về dịch vụ..." className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"></textarea>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button onClick={() => setIsCreateModalOpen(false)} className="flex-1 py-3 rounded-xl font-bold text-gray-400 hover:bg-gray-100 transition-all">Hủy</button>
                        <button onClick={handleCreateService} className="flex-1 py-3 rounded-xl font-bold text-white shadow-lg transition-all" style={{ backgroundColor: '#6366f1' }}>
                            Xác nhận thêm
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
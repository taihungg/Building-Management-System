import { Search, Heart, Plus, Download, Users, TrendingUp, Calendar, Trash2, ExternalLink } from 'lucide-react';
import { Modal } from './Modal';
import { Toaster, toast } from 'sonner';
import { useState, useEffect, useCallback } from 'react';
import React from 'react';

// Giả định dữ liệu campaign mẫu
const MOCK_CAMPAIGNS = [
    { id: 1, title: 'Ủng hộ miền Trung lũ lụt', total: 50000000, goal: 100000000, participants: 120, status: 'Active' },
    { id: 2, title: 'Quỹ Trung Thu cho các cháu', total: 15000000, goal: 20000000, participants: 45, status: 'Active' },
    { id: 3, title: 'Quỹ khuyến học cư dân 2024', total: 30000000, goal: 30000000, participants: 80, status: 'Completed' },
];

export function VoluntaryContribution() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);

    const handleExportExcel = (campaignTitle: string) => {
        toast.success(`Đang xuất danh sách đóng góp: ${campaignTitle}`);
        // Logic gọi API xuất file excel thực tế ở đây
    };

    return (
        <div className="space-y-8 p-2">
            <Toaster position="top-right" richColors />

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Quỹ đóng góp tự nguyện</h1>
                    <p className="text-gray-500 mt-1">Quản lý các chiến dịch thiện nguyện và cộng đồng (Không tính vào hóa đơn)</p>
                </div>

                <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-3 py-3 text-white rounded-xl shadow-lg transition-all hover:scale-105 font-bold"
                    style={{ backgroundColor: '#e11d48' ,width: '200px'}} // Rose-600
                >
                    <Plus size={20} /> Tạo Campaign mới
                </button>
            </div>

            {/* DASHBOARD CHIẾN DỊCH (Campaign Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 " style={{marginTop: '20px'}}>
                {MOCK_CAMPAIGNS.map((cp) => (
                    <div key={cp.id} style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                        <div className="flex justify-between items-start mb-4">
                            <div style={{ padding: '10px', backgroundColor: '#fff1f2', color: '#e11d48', borderRadius: '14px' }}>
                                <Heart size={20} fill={cp.status === 'Completed' ? '#e11d48' : 'none'} />
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${cp.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                                {cp.status === 'Active' ? 'Đang quyên góp' : 'Đã kết thúc'}
                            </span>
                        </div>
                        
                        <h3 className="font-bold text-lg text-slate-800 mb-1">{cp.title}</h3>
                        <p className="text-xs text-slate-400 mb-4 flex items-center gap-1">
                            <Users size={12} /> {cp.participants} cư dân đã tham gia
                        </p>

                        {/* Progress Bar */}
                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-xs font-bold">
                                <span className="text-rose-600">{formatCurrency(cp.total)}</span>
                                <span className="text-slate-400">Mục tiêu: {formatCurrency(cp.goal)}</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-rose-500 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min((cp.total/cp.goal)*100, 100)}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button 
                                onClick={() => handleExportExcel(cp.title)}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 transition-all border border-slate-100"
                            >
                                <Download size={14} /> Danh sách
                            </button>
                            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-100 transition-all">
                                <ExternalLink size={14} /> Chi tiết
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* BẢNG THEO DÕI ĐÓNG GÓP GẦN ĐÂY */}
                <div className="space-y-4" style={{ marginTop: '40px' }}>
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xl font-bold text-slate-800">Lịch sử đóng góp mới nhất</h2>
                        <div className="flex bg-white rounded-xl shadow-sm border border-slate-200 p-1">
                            <div className="relative">
                                <input type="text" placeholder="Tìm tên, căn hộ..." className="pl-9 pr-4 py-1.5 text-xs outline-none w-64" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 text-gray-400">
                                <tr>
                                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider">Cư dân</th>
                                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider">Chiến dịch</th>
                                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider">Số tiền</th>
                                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider">Ngày đóng góp</th>
                                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                <tr className="hover:bg-rose-50/30 transition-colors">
                                    <td className="px-6 py-4 font-bold text-slate-700">Nguyễn Văn A (Phòng 102)</td>
                                    <td className="px-6 py-4 text-sm text-slate-500">Ủng hộ miền Trung</td>
                                    <td className="px-6 py-4 font-extrabold text-rose-600">{formatCurrency(500000)}</td>
                                    <td className="px-6 py-4 text-xs text-slate-400">24/12/2023 10:30</td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase">Thành công</span>
                                    </td>
                                </tr>
                                {/* Thêm các dòng khác... */}
                            </tbody>
                        </table>
                    </div>
                </div>

            {/* MODAL TẠO CAMPAIGN */}
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Tạo chiến dịch đóng góp mới">
                <div className="p-6 space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Tên chiến dịch</label>
                        <input type="text" placeholder="Ví dụ: Ủng hộ bão Yagi..." className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none font-medium" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Mục tiêu (VND)</label>
                            <input type="number" placeholder="0" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-rose-600" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Ngày kết thúc</label>
                            <input type="date" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none" />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Mô tả mục đích</label>
                        <textarea rows={3} placeholder="Mô tả chiến dịch để cư dân nắm rõ..." className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none"></textarea>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button onClick={() => setIsCreateModalOpen(false)} className="flex-1 py-4 rounded-2xl font-bold text-gray-400 hover:bg-gray-100 transition-all">Hủy bỏ</button>
                        <button className="flex-1 py-4 rounded-2xl font-bold text-white shadow-lg transition-all" style={{ backgroundColor: '#e11d48' }}>
                            Bắt đầu chiến dịch
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
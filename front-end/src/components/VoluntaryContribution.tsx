import { Search, Heart, Plus, Download, Users, TrendingUp, Calendar, Trash2, ExternalLink, X } from 'lucide-react';
import { Modal } from './Modal';
import { Toaster, toast } from 'sonner';
import { useState, useEffect, useCallback } from 'react';
import React from 'react';

// Dữ liệu mẫu
const MOCK_CAMPAIGNS = [
    { id: 1, title: 'Ủng hộ miền Trung lũ lụt', total: 75000000, goal: 100000000, participants: 120, status: 'Active' },
    { id: 2, title: 'Quỹ Trung Thu cho các cháu', total: 15000000, goal: 20000000, participants: 45, status: 'Active' },
    { id: 3, title: 'Quỹ khuyến học cư dân 2024', total: 35000000, goal: 30000000, participants: 80, status: 'Completed' },
];

export function VoluntaryContribution() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [animate, setAnimate] = useState(false); // State kích hoạt hiệu ứng thanh chạy

    // Hiệu ứng chạy thanh Progress khi vào trang
    useEffect(() => {
        const timer = setTimeout(() => setAnimate(true), 150);
        return () => clearTimeout(timer);
    }, []);

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);

    const handleExportExcel = (campaignTitle: string) => {
        toast.success(`Đang xuất danh sách đóng góp: ${campaignTitle}`);
    };

    return (
        <div className="space-y-8 p-2">
            <Toaster position="top-right" richColors />

            {/* HEADER - ÉP NÚT SANG PHẢI BẰNG INLINE CSS */}
            <div style={{ 
                display: 'flex', 
                flexDirection: 'row', 
                alignItems: 'flex-end', 
                justifyContent: 'space-between', 
                width: '100%', 
                marginBottom: '32px' 
            }}>
                <div style={{ flex: 1 }}>
                    <h1 style={{ fontSize: '30px', fontWeight: '400', color: '#111827', margin: 0, letterSpacing: '-0.5px' }}>
                        Quỹ đóng góp tự nguyện
                    </h1>
                    <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px', marginBottom: 0 }}>
                        Quản lý các chiến dịch thiện nguyện và cộng đồng (Không tính vào hóa đơn)
                    </p>
                </div>

                <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="hover:scale-105 active:scale-95 transition-all"
                    style={{ 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        padding: '0 24px', color: 'white', borderRadius: '16px', fontWeight: '700',
                        backgroundColor: '#e11d48', width: '220px', height: '52px', border: 'none',
                        cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(225, 29, 72, 0.3)', whiteSpace: 'nowrap'
                    }}
                >
                    <Plus size={20} /> Tạo Campaign mới
                </button>
            </div>

            {/* GRID DANH SÁCH CHIẾN DỊCH */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MOCK_CAMPAIGNS.map((cp) => {
                    const percent = Math.round((cp.total / cp.goal) * 100);
                    const isSuccess = percent >= 100;

                    return (
                        <div 
                            key={cp.id} 
                            style={{ 
                                backgroundColor: '#ffffff', padding: '28px', borderRadius: '32px', 
                                border: '1px solid #eef2f6', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.04)' 
                            }}
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div style={{ 
                                    padding: '12px', 
                                    backgroundColor: isSuccess ? '#ecfdf5' : '#fff1f2', 
                                    color: isSuccess ? '#10b981' : '#e11d48', 
                                    borderRadius: '16px' 
                                }}>
                                    <Heart size={22} fill={isSuccess ? '#10b981' : 'none'} />
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${cp.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                                    {cp.status === 'Active' ? ' Đang kêu gọi' : 'Đã kết thúc'}
                                </span>
                            </div>
                            
                            <h3 className="font-bold text-xl text-slate-800 mb-6 leading-tight h-12 line-clamp-2">
                                {cp.title}
                            </h3>

                            {/* CỤM PROGRESS BAR NÂNG CẤP */}
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between items-end">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase">Đã huy động</span>
                                        <span className={`text-lg font-black ${isSuccess ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {formatCurrency(cp.total)}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-2xl font-black ${isSuccess ? 'text-emerald-500' : 'text-slate-700'}`}>
                                            {percent}%
                                        </span>
                                    </div>
                                </div>

                                {/* Thanh chạy (Thứ chú cần đây) */}
                                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-[2px]">
                                    <div 
                                        className="h-full rounded-full transition-all duration-1000 ease-out"
                                        style={{ 
                                            width: animate ? `${Math.min(percent, 100)}%` : '0%',
                                            backgroundColor: isSuccess ? '#10b981' : '#f43f5e',
                                            boxShadow: isSuccess ? '0 0 10px rgba(16, 185, 129, 0.4)' : 'none'
                                        }}
                                    ></div>
                                </div>
                                
                                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                                    <span>Mục tiêu: {formatCurrency(cp.goal)}</span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button 
                                    onClick={() => handleExportExcel(cp.title)}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 transition-all border border-slate-100"
                                >
                                    <Download size={14} /> Danh sách
                                </button>
                                <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-100 transition-all">
                                    <ExternalLink size={14} /> Chi tiết
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* MODAL TẠO CAMPAIGN */}
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Tạo chiến dịch đóng góp mới">
                <div className="p-6 space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Tên chiến dịch</label>
                        <input type="text" placeholder="Ví dụ: Ủng hộ bão Yagi..." className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none font-bold" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Mục tiêu (VND)</label>
                            <input type="number" placeholder="0" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-rose-600" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Ngày kết thúc</label>
                            <input type="date" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-gray-600" />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Mô tả mục đích</label>
                        <textarea rows={3} placeholder="Mô tả chiến dịch..." className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-medium"></textarea>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button onClick={() => setIsCreateModalOpen(false)} className="flex-1 py-4 rounded-2xl font-bold text-gray-400 hover:bg-gray-100 transition-all border-none cursor-pointer">Hủy bỏ</button>
                        <button className="flex-1 py-4 rounded-2xl font-bold text-white shadow-lg transition-all border-none cursor-pointer" style={{ backgroundColor: '#e11d48' }}>
                            Bắt đầu chiến dịch
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
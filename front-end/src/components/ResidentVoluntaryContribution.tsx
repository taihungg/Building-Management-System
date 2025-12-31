import { Search, Heart, Users, Calendar, ExternalLink, Clock, Info } from 'lucide-react';
import { Modal } from './Modal';
import { Toaster, toast } from 'sonner';
import { useState, useEffect } from 'react';

// Định nghĩa đầy đủ kiểu dữ liệu từ API
interface Campaign {
    id: string;
    title: string;
    status: string;
    goalAmount: number;
    totalCollected: number;
    totalContributors: number;
    description: string;
    startDate: string;
    campaignEndDate: string;
    contributionDeadline: string;
    isPublic: boolean;
}

interface Contribution {
    id: string;
    contributorName: string;
    phone: string;
    amount: number;
    contributionDate: string;
    address: string;
}

export function ResidentVoluntaryContribution() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
    const [contributions, setContributions] = useState<Contribution[]>([]);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);
    const [animate, setAnimate] = useState(false);

    const API_BASE_URL = 'https://untoasted-jean-unsympathisingly.ngrok-free.dev';
    const NGROK_HEADERS = {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
    };

    const fetchCampaigns = async () => {
        setIsLoadingCampaigns(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/campaigns`, {
                method: 'GET',
                headers: NGROK_HEADERS
            });
            const result = await response.json();
            // Kiểm tra statusCode theo format của chú
            if (result.statusCode === 200 || response.ok) {
                setCampaigns(result.data || []);
                setTimeout(() => setAnimate(true), 150);
            }
        } catch (error) {
            console.log(error); // Chuẩn cú pháp chú dặn
            toast.error("Không thể tải danh sách chiến dịch");
        } finally {
            setIsLoadingCampaigns(false);
        }
    };

    // 3. Xem chi tiết - Đã sửa lỗi logic URL
    const fetchCampaignDetail = async (campaign: Campaign) => {
        setSelectedCampaign(campaign);
        setIsLoadingDetails(true);
        try {
            // Sửa lại URL: Truy cập thẳng vào ID chiến dịch
            const response = await fetch(`${API_BASE_URL}/api/v1/campaigns/${campaign.id}`, {
                method: 'GET',
                headers: NGROK_HEADERS
            });
            const result = await response.json();

            if (response.ok || result.statusCode === 200) {
                // Giữ nguyên logic map dữ liệu của chú
                setSelectedCampaign(result.data.campaign || result.data);
                setContributions(result.data.contributions || []);
            }
        } catch (error) {
            console.log(error);
            toast.error("Không thể tải chi tiết đóng góp");
        } finally {
            setIsLoadingDetails(false);
        }
    };
    useEffect(() => { fetchCampaigns(); }, []);

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);

    const filteredCampaigns = campaigns.filter((cp) => {
        const q = searchTerm.trim().toLowerCase();
        if (!q) return true;
        return (cp.title || '').toLowerCase().includes(q) || (cp.description || '').toLowerCase().includes(q);
    });

    return (
        <div className="space-y-8 p-2">
            <Toaster position="top-right" richColors />

            {/* HEADER - GIỮ NGUYÊN */}
            <div className="flex items-end justify-between gap-4 w-full mb-8">
                <div style={{ flex: 1 }}>
                    <h1 style={{ fontSize: '30px', fontWeight: '400', color: '#111827', margin: 0, letterSpacing: '-0.5px' }}>
                        Quỹ đóng góp tự nguyện
                    </h1>
                    <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px', marginBottom: 0 }}>
                        Theo dõi các chiến dịch thiện nguyện và cộng đồng
                    </p>
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Tìm kiếm chiến dịch..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                />
            </div>

            {isLoadingCampaigns ? (
                <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 text-gray-600">
                    Đang tải danh sách chiến dịch...
                </div>
            ) : null}

            {!isLoadingCampaigns && filteredCampaigns.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 border-2 border-gray-200 text-center">
                    <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-700 font-semibold">Không có chiến dịch phù hợp</p>
                    <p className="text-gray-500 text-sm mt-1">Thử đổi từ khóa tìm kiếm hoặc quay lại sau.</p>
                </div>
            ) : null}

            {/* GRID DANH SÁCH - CHỈ XEM */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCampaigns.map((cp) => {
                    const percent = cp.goalAmount > 0 ? Math.round((cp.totalCollected / cp.goalAmount) * 100) : 0;
                    const isSuccess = percent >= 100;
                    return (
                        <div key={cp.id} style={{ backgroundColor: '#f4f4f5', padding: '28px', borderRadius: '32px', border: '1px solid #eef2f6', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.04)', position: 'relative' }}>
                            <div className="flex justify-between items-start mb-6">
                                <div style={{ padding: '12px', backgroundColor: isSuccess ? '#ecfdf5' : '#fff1f2', color: isSuccess ? '#10b981' : '#e11d48', borderRadius: '16px' }}>
                                    <Heart size={22} fill={isSuccess ? '#10b981' : 'none'} />
                                </div>
                                {/* Status removed */}
                            </div>

                            <h3 className="font-bold text-xl text-slate-800 mb-6 leading-tight h-12 line-clamp-2">{cp.title}</h3>

                            {/* THÊM MỚI: Ngày bắt đầu & Ngày kết thúc */}
                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
                                    <Calendar size={12} style={{ color: '#94a3b8' }} />
                                    <span style={{ fontSize: '11px', fontWeight: 500, whiteSpace: 'nowrap' }}>
                                        Bắt đầu: {cp.startDate || 'N/A'}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
                                    <Clock size={12} style={{ color: '#94a3b8' }} />
                                    <span style={{ fontSize: '11px', fontWeight: 500, whiteSpace: 'nowrap' }}>
                                        Kết thúc: {cp.campaignEndDate || 'N/A'}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between items-end">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase">Đã huy động</span>
                                        <span className={`text-lg font-black ${isSuccess ? 'text-emerald-600' : 'text-rose-600'}`}>{formatCurrency(cp.totalCollected)}</span>
                                    </div>
                                    <span className={`text-2xl font-black ${isSuccess ? 'text-emerald-500' : 'text-slate-700'}`}>{percent}%</span>
                                </div>
                                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-[2px]">
                                    <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: animate ? `${Math.min(percent, 100)}%` : '0%', backgroundColor: isSuccess ? '#10b981' : '#f43f5e' }}></div>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => fetchCampaignDetail(cp)} className="flex-1 flex items-center justify-center gap-2 py-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-100 transition-all cursor-pointer">
                                    <ExternalLink size={14} /> Chi tiết
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* MODAL CHI TIẾT - GIỮ NGUYÊN UI VÀ ĐẦY ĐỦ TRƯỜNG */}
            <Modal isOpen={!!selectedCampaign} onClose={() => { setSelectedCampaign(null); setContributions([]); }} title="Thông tin chi tiết chiến dịch" size="lg">
                {selectedCampaign && (
                    <div className="p-8 space-y-8 max-h-[85vh] overflow-y-auto">
                        <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 relative overflow-hidden">
                            <div className="absolute top-4 right-4 flex gap-2">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${selectedCampaign.isPublic ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-500'}`}>
                                    {selectedCampaign.isPublic ? 'Công khai' : 'Nội bộ'}
                                </span>
                            </div>

                            <div className="space-y-3">
                                <h2 className="text-3xl font-black text-slate-800 pr-20">{selectedCampaign.title}</h2>
                                <div className="flex items-start gap-2 text-slate-500 max-w-2xl">
                                    <Info size={18} className="mt-0.5 flex-shrink-0 text-slate-400" />
                                    <p className="text-sm italic">{selectedCampaign.description || 'Không có mô tả chi tiết cho chiến dịch này.'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-200/50">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Đã thu được</p>
                                    <p className="text-lg font-black text-rose-600">{formatCurrency(selectedCampaign.totalCollected)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Mục tiêu</p>
                                    <p className="text-lg font-black text-slate-700">{formatCurrency(selectedCampaign.goalAmount)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Người đóng góp</p>
                                    <div className="flex items-center gap-2"><Users size={16} className="text-slate-400" /><p className="text-lg font-black text-slate-700">{selectedCampaign.totalContributors}</p></div>
                                </div>
                                {/* Status removed */}
                            </div>
                        </div>

                        {/* Các mốc thời gian */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center gap-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Calendar size={20} /></div>
                                <div><p className="text-[10px] font-bold text-slate-400 uppercase">Bắt đầu</p><p className="text-sm font-bold text-slate-700">{selectedCampaign.startDate}</p></div>
                            </div>
                            <div className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center gap-4">
                                <div className="p-3 bg-slate-50 text-slate-600 rounded-xl"><Calendar size={20} /></div>
                                <div><p className="text-[10px] font-bold text-slate-400 uppercase">Kết thúc</p><p className="text-sm font-bold text-slate-700">{selectedCampaign.campaignEndDate}</p></div>
                            </div>
                            <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-4">
                                <div className="p-3 bg-amber-100 text-amber-600 rounded-xl"><Clock size={20} /></div>
                                <div><p className="text-[10px] font-bold text-amber-500 uppercase">Hạn chót</p><p className="text-sm font-black text-amber-700">{selectedCampaign.contributionDeadline}</p></div>
                            </div>
                        </div>

                        {/* Danh sách cư dân */}
                        <div className="bg-white border border-slate-100 rounded-[24px] overflow-hidden shadow-sm min-h-[250px] relative">
                            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider">
                                    Danh sách đóng góp ({contributions.length})
                                </h3>
                            </div>
                            {isLoadingDetails ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div></div>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50 border-b border-slate-100">
                                        <tr>
                                            <th className="p-4 text-[10px] font-black text-slate-400 uppercase">Người đóng</th>
                                            <th className="p-4 text-[10px] font-black text-slate-400 uppercase">Thông tin</th>
                                            <th className="p-4 text-[10px] font-black text-slate-400 uppercase text-right">Số tiền</th>
                                            <th className="p-4 text-[10px] font-black text-slate-400 uppercase text-right">Thời gian</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {contributions.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="p-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold text-xs">{item.contributorName.charAt(0)}</div><span className="font-bold text-slate-700 text-sm">{item.contributorName}</span></div></td>
                                                <td className="p-4 text-xs italic text-slate-500">{item.address} ({item.phone})</td>
                                                <td className="p-4 text-right font-black text-emerald-600">+{formatCurrency(item.amount)}</td>
                                                <td className="p-4 text-right text-xs font-bold text-slate-400">{item.contributionDate}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        <div className="flex gap-4">
                            <button onClick={() => setSelectedCampaign(null)} className="flex-1 py-4 bg-slate-100 text-slate-500 font-bold rounded-2xl hover:bg-slate-200 cursor-pointer transition-all">Đóng cửa sổ</button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}

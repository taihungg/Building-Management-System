import { Heart, Plus, Download, ExternalLink, Trash2, Loader2, Pencil, Calendar, Clock, Info, Users } from 'lucide-react';
import { Modal } from './Modal';
import { Toaster, toast } from 'sonner';
import { useMemo, useState, useEffect, useCallback } from 'react';
import React from 'react';

type CampaignStatus = 'DRAFT' | 'ACTIVE' | 'PENDING' | 'CLOSED';

type CampaignSummaryDTO = {
    id: string;
    title?: string | null;
    description?: string | null;
    goalAmount?: string | number | null;
    startDate?: string | number[] | null;
    campaignEndDate?: string | number[] | null;
    contributionDeadline?: string | number[] | null;
    status?: CampaignStatus | string | null;
    isPublic?: boolean | null;
    totalCollected?: string | number | null;
    totalContributors?: number | null;
};

type ContributionSummaryDTO = {
    id: string;
    campaignId?: string | null;
    contributorName?: string | null;
    phone?: string | null;
    address?: string | null;
    amount?: string | number | null;
    contributionDate?: string | number[] | null;
};

type CampaignDetailDTO = {
    campaign?: CampaignSummaryDTO | null;
    contributions?: ContributionSummaryDTO[] | null;
};

export function VoluntaryContribution() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [animate, setAnimate] = useState(false); // State kích hoạt hiệu ứng thanh chạy
    const [campaigns, setCampaigns] = useState<CampaignSummaryDTO[]>([]);
    const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);
    const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
    const [campaignDetail, setCampaignDetail] = useState<CampaignDetailDTO | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isDetailLoading, setIsDetailLoading] = useState(false);
    const [isCreateSubmitting, setIsCreateSubmitting] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isEditSubmitting, setIsEditSubmitting] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
    const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);
    const [isAddContributionOpen, setIsAddContributionOpen] = useState(false);
    const [isAddContributionSubmitting, setIsAddContributionSubmitting] = useState(false);

    const todayIso = useMemo(() => {
        const d = new Date();
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }, []);

    const [createTitle, setCreateTitle] = useState('');
    const [createGoalAmount, setCreateGoalAmount] = useState('');
    const [createStartDate, setCreateStartDate] = useState('');
    const [createContributionDeadline, setCreateContributionDeadline] = useState('');
    const [createCampaignEndDate, setCreateCampaignEndDate] = useState('');
    const [createDescription, setCreateDescription] = useState('');
    const [createIsPublic, setCreateIsPublic] = useState(true);

    const [editTitle, setEditTitle] = useState('');
    const [editGoalAmount, setEditGoalAmount] = useState('');
    const [editStartDate, setEditStartDate] = useState('');
    const [editContributionDeadline, setEditContributionDeadline] = useState('');
    const [editCampaignEndDate, setEditCampaignEndDate] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editIsPublic, setEditIsPublic] = useState(true);

    const [contributorName, setContributorName] = useState('');
    const [contributorPhone, setContributorPhone] = useState('');
    const [contributorAddress, setContributorAddress] = useState('');
    const [contributionAmount, setContributionAmount] = useState('');
    const [contributionDate, setContributionDate] = useState('');

    // Hiệu ứng chạy thanh Progress khi vào trang
    useEffect(() => {
        const timer = setTimeout(() => setAnimate(true), 150);
        return () => clearTimeout(timer);
    }, []);

    const parseMoney = (value: any) => {
        if (typeof value === 'number') return value;
        if (typeof value !== 'string') return Number(value) || 0;
        const s = value.trim();
        if (/^\d{1,3}(\.\d{3})+$/.test(s)) return Number(s.replace(/\./g, ''));
        if (/^\d{1,3}(,\d{3})+$/.test(s)) return Number(s.replace(/,/g, ''));
        if (/^\d+(\.\d+)?$/.test(s)) return Number(s);
        return Number(s.replace(/[^\d-]/g, '')) || 0;
    };

    const formatCurrency = (amount: any) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(parseMoney(amount));

    const normalizeLocalDate = (value: any): string => {
        if (!value) return '';
        if (Array.isArray(value)) {
            const [year, month, day] = value;
            if (!year || !month || !day) return '';
            return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }
        if (typeof value === 'string') {
            return value.slice(0, 10);
        }
        return '';
    };

    const statusLabel = (status: any) => {
        switch (status) {
            case 'DRAFT':
                return { text: 'Bản nháp', className: 'bg-slate-100 text-slate-600' };
            case 'ACTIVE':
                return { text: 'Đang kêu gọi', className: 'bg-emerald-100 text-emerald-700' };
            case 'PENDING':
                return { text: 'Chờ kết thúc', className: 'bg-amber-100 text-amber-700' };
            case 'CLOSED':
                return { text: 'Đã kết thúc', className: 'bg-gray-100 text-gray-500' };
            default:
                return { text: String(status ?? 'N/A'), className: 'bg-gray-100 text-gray-500' };
        }
    };

    const fetchCampaigns = useCallback(async () => {
        setIsLoadingCampaigns(true);
        try {
            const response = await fetch('https://building-management-system.fly.dev/api/v1/campaigns', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                }
            });
            if (!response.ok) {
                const t = await response.text().catch(() => '');
                throw new Error(t || `HTTP ${response.status}`);
            }
            const json = await response.json().catch(() => ({} as any));
            const data = Array.isArray(json?.data) ? (json.data as CampaignSummaryDTO[]) : [];
            setCampaigns(data);
        } catch (err: unknown) {
            toast.error('Lỗi tải danh sách campaign', { description: err instanceof Error ? err.message : 'Không thể tải dữ liệu' });
            setCampaigns([]);
        } finally {
            setIsLoadingCampaigns(false);
        }
    }, []);

    useEffect(() => {
        fetchCampaigns();
    }, [fetchCampaigns]);

    const openCreateModal = () => {
        setIsCreateModalOpen(true);
        setCreateTitle('');
        setCreateGoalAmount('');
        setCreateDescription('');
        setCreateIsPublic(true);
        setCreateStartDate(todayIso);
        setCreateContributionDeadline(todayIso);
        setCreateCampaignEndDate(todayIso);
        setIsCreateSubmitting(false);
    };

    const openDetail = async (campaignId: string) => {
        setSelectedCampaignId(campaignId);
        setCampaignDetail(null);
        setIsDetailModalOpen(true);
        setIsDetailLoading(true);
        try {
            const response = await fetch(`https://building-management-system.fly.dev/api/v1/campaigns/${campaignId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                }
            });
            if (!response.ok) {
                const t = await response.text().catch(() => '');
                throw new Error(t || `HTTP ${response.status}`);
            }
            const json = await response.json().catch(() => ({} as any));
            const data = (json?.data || {}) as CampaignDetailDTO;
            setCampaignDetail(data);
        } catch (err: unknown) {
            toast.error('Lỗi tải chi tiết campaign', { description: err instanceof Error ? err.message : 'Không thể tải dữ liệu' });
            setCampaignDetail(null);
        } finally {
            setIsDetailLoading(false);
        }
    };

    const openEdit = (campaign: CampaignSummaryDTO) => {
        setSelectedCampaignId(String(campaign.id));
        setEditTitle(String(campaign.title ?? ''));
        setEditDescription(String(campaign.description ?? ''));
        setEditGoalAmount(campaign.goalAmount == null ? '' : String(campaign.goalAmount));
        setEditStartDate(normalizeLocalDate(campaign.startDate) || todayIso);
        setEditContributionDeadline(normalizeLocalDate(campaign.contributionDeadline) || todayIso);
        setEditCampaignEndDate(normalizeLocalDate(campaign.campaignEndDate) || todayIso);
        setEditIsPublic(Boolean(campaign.isPublic ?? true));
        setIsEditModalOpen(true);
        setIsEditSubmitting(false);
    };

    const openDeleteConfirm = (campaignId: string) => {
        setDeleteTargetId(campaignId);
    };

    const openAddContribution = (campaignId: string) => {
        setSelectedCampaignId(campaignId);
        setContributorName('');
        setContributorPhone('');
        setContributorAddress('');
        setContributionAmount('');
        setContributionDate(todayIso);
        setIsAddContributionOpen(true);
        setIsAddContributionSubmitting(false);
    };

    const handleExportExcel = async (campaignId: string, campaignTitle: string) => {
        toast.info(`Đang xuất danh sách đóng góp: ${campaignTitle}`);
        try {
            const response = await fetch(`https://building-management-system.fly.dev/api/v1/campaigns/${campaignId}/export/excel`, {
                method: 'GET',
                headers: {
                    'ngrok-skip-browser-warning': 'true'
                }
            });

            if (!response.ok) {
                throw new Error('Không thể tải xuống file Excel');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Danh_sach_dong_gop_${campaignTitle}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success('Xuất file Excel thành công');
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Lỗi khi xuất file Excel');
        }
    };

    const submitCreate = async () => {
        if (isCreateSubmitting) return;
        const title = createTitle.trim();
        const goalAmount = parseMoney(createGoalAmount);
        if (!title) {
            toast.warning('Thiếu tên chiến dịch');
            return;
        }
        if (!Number.isFinite(goalAmount) || goalAmount <= 0) {
            toast.warning('Mục tiêu không hợp lệ');
            return;
        }
        if (!createStartDate || !createContributionDeadline || !createCampaignEndDate) {
            toast.warning('Thiếu ngày');
            return;
        }

        setIsCreateSubmitting(true);
        const action = async () => {
            const response = await fetch('https://building-management-system.fly.dev/api/v1/campaigns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
                body: JSON.stringify({
                    title,
                    description: createDescription.trim() || null,
                    goalAmount,
                    startDate: createStartDate,
                    contributionDeadline: createContributionDeadline,
                    campaignEndDate: createCampaignEndDate,
                    isPublic: createIsPublic,
                }),
            });
            if (!response.ok) {
                const t = await response.text().catch(() => '');
                throw new Error(t || `HTTP ${response.status}`);
            }
        };

        toast.promise(action(), {
            loading: 'Đang tạo campaign...',
            success: () => {
                setIsCreateModalOpen(false);
                fetchCampaigns().catch(() => { });
                return 'Tạo campaign thành công';
            },
            error: (err) => `Tạo campaign thất bại: ${(err as Error).message}`,
            finally: () => {
                setIsCreateSubmitting(false);
            },
        });
    };

    const submitEdit = async () => {
        if (isEditSubmitting) return;
        if (!selectedCampaignId) return;
        const title = editTitle.trim();
        const goalAmount = parseMoney(editGoalAmount);
        if (!title) {
            toast.warning('Thiếu tên chiến dịch');
            return;
        }
        if (!Number.isFinite(goalAmount) || goalAmount <= 0) {
            toast.warning('Mục tiêu không hợp lệ');
            return;
        }
        if (!editStartDate || !editContributionDeadline || !editCampaignEndDate) {
            toast.warning('Thiếu ngày');
            return;
        }

        setIsEditSubmitting(true);
        const action = async () => {
            const response = await fetch(`https://building-management-system.fly.dev/api/v1/campaigns/${selectedCampaignId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
                body: JSON.stringify({
                    title,
                    description: editDescription.trim() || null,
                    goalAmount,
                    startDate: editStartDate,
                    contributionDeadline: editContributionDeadline,
                    campaignEndDate: editCampaignEndDate,
                    isPublic: editIsPublic,
                }),
            });
            if (!response.ok) {
                const t = await response.text().catch(() => '');
                throw new Error(t || `HTTP ${response.status}`);
            }
        };

        toast.promise(action(), {
            loading: 'Đang cập nhật campaign...',
            success: () => {
                setIsEditModalOpen(false);
                fetchCampaigns().catch(() => { });
                if (isDetailModalOpen && selectedCampaignId) {
                    openDetail(selectedCampaignId).catch(() => { });
                }
                return 'Cập nhật campaign thành công';
            },
            error: (err) => `Cập nhật campaign thất bại: ${(err as Error).message}`,
            finally: () => {
                setIsEditSubmitting(false);
            },
        });
    };

    const submitDelete = async () => {
        if (isDeleteSubmitting) return;
        if (!deleteTargetId) return;
        setIsDeleteSubmitting(true);

        const action = async () => {
            const response = await fetch(`https://building-management-system.fly.dev/api/v1/campaigns/${deleteTargetId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                }
            });
            if (!response.ok) {
                const t = await response.text().catch(() => '');
                throw new Error(t || `HTTP ${response.status}`);
            }
        };

        toast.promise(action(), {
            loading: 'Đang xóa campaign...',
            success: () => {
                setDeleteTargetId(null);
                setIsDetailModalOpen(false);
                setCampaignDetail(null);
                fetchCampaigns().catch(() => { });
                return 'Xóa campaign thành công';
            },
            error: (err) => `Xóa campaign thất bại: ${(err as Error).message}`,
            finally: () => {
                setIsDeleteSubmitting(false);
            },
        });
    };

    const submitAddContribution = async () => {
        if (isAddContributionSubmitting) return;
        if (!selectedCampaignId) return;
        const name = contributorName.trim();
        const amount = parseMoney(contributionAmount);
        if (!name) {
            toast.warning('Thiếu tên người đóng góp');
            return;
        }
        if (!Number.isFinite(amount) || amount <= 0) {
            toast.warning('Số tiền không hợp lệ');
            return;
        }
        if (!contributionDate) {
            toast.warning('Thiếu ngày đóng góp');
            return;
        }

        setIsAddContributionSubmitting(true);
        const action = async () => {
            const response = await fetch('https://building-management-system.fly.dev/api/v1/campaigns/contributions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
                body: JSON.stringify({
                    campaignId: selectedCampaignId,
                    contributorName: name,
                    phone: contributorPhone.trim() || null,
                    address: contributorAddress.trim() || null,
                    amount,
                    contributionDate,
                }),
            });
            if (!response.ok) {
                const t = await response.text().catch(() => '');
                throw new Error(t || `HTTP ${response.status}`);
            }
        };

        toast.promise(action(), {
            loading: 'Đang ghi nhận đóng góp...',
            success: () => {
                setIsAddContributionOpen(false);
                fetchCampaigns().catch(() => { });
                if (selectedCampaignId) {
                    openDetail(selectedCampaignId).catch(() => { });
                }
                return 'Ghi nhận đóng góp thành công';
            },
            error: (err) => `Ghi nhận đóng góp thất bại: ${(err as Error).message}`,
            finally: () => {
                setIsAddContributionSubmitting(false);
            },
        });
    };

    return (
        <div className="space-y-8 p-2">
            <Toaster position="top-right" richColors />

            {/* HEADER - ÉP NÚT SANG PHẢI BẰNG INLINE CSS */}
            <div className="relative z-10 flex flex-row items-center justify-between gap-4 w-full mb-8">
                <div className="flex-1">
                    <h1 className="text-xl font-bold text-gray-900 m-0 tracking-[-0.5px] leading-tight">
                        Quỹ đóng góp tự nguyện
                    </h1>
                    <p className="text-[26px] text-gray-500 mt-1 mb-0">
                        Quản lý các chiến dịch thiện nguyện và cộng đồng (Không tính vào hóa đơn)
                    </p>
                </div>

                {/* Nút đã thu nhỏ và nằm bên phải ngang hàng */}
                <button
                    onClick={openCreateModal}
                    disabled={isLoadingCampaigns}
                    className="flex items-center justify-center gap-2 px-6 h-[44px] rounded-xl font-bold text-white hover:scale-105 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 whitespace-nowrap"
                    style={{
                        backgroundColor: '#e11d48',
                        border: 'none',
                        fontSize: '14px', // Làm chữ nhỏ lại một chút cho tinh tế
                        boxShadow: '0 8px 12px -3px rgba(225, 29, 72, 0.25)',
                    }}
                >
                    {isLoadingCampaigns ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus size={18} />}
                    {isLoadingCampaigns ? 'Đang tải...' : 'Tạo Campaign'}
                </button>
            </div>

            {/* GRID DANH SÁCH CHIẾN DỊCH */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoadingCampaigns ? (
                    <div className="col-span-full flex items-center justify-center py-12 text-gray-500">
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Đang tải danh sách campaign...
                    </div>
                ) : campaigns.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        Không có campaign nào
                    </div>
                ) : campaigns
                    // Sắp xếp theo ngày bắt đầu (startDate) từ mới nhất đến cũ nhất
                    .sort((a, b) => {
                        const dateA = a.startDate ? new Date(normalizeLocalDate(a.startDate)).getTime() : 0;
                        const dateB = b.startDate ? new Date(normalizeLocalDate(b.startDate)).getTime() : 0;
                        return dateB - dateA; // Đổi thành dateA - dateB nếu chú muốn ngày cũ hiện trước
                    }).map((cp) => {
                        const total = parseMoney(cp.totalCollected);
                        const goal = parseMoney(cp.goalAmount);
                        const percent = goal > 0 ? Math.round((total / goal) * 100) : 0;
                        const isSuccess = percent >= 100;
                        const st = statusLabel(cp.status);
                        const isBusy = isCreateSubmitting || isEditSubmitting || isDeleteSubmitting || isAddContributionSubmitting;

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
                                    {/* Status removed */}
                                </div>

                                <h3 className="font-bold text-xl text-slate-800 mb-6 leading-tight h-12 line-clamp-2">
                                    {String(cp.title ?? '')}
                                </h3>
                                {/* THÊM MỚI: Ngày bắt đầu & Ngày kết thúc */}
                                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
                                        <Calendar size={12} style={{ color: '#94a3b8' }} />
                                        <span style={{ fontSize: '11px', fontWeight: 500, whiteSpace: 'nowrap' }}>
                                            Bắt đầu: {normalizeLocalDate(cp.startDate)}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
                                        <Clock size={12} style={{ color: '#94a3b8' }} />
                                        <span style={{ fontSize: '11px', fontWeight: 500, whiteSpace: 'nowrap' }}>
                                            Kết thúc: {normalizeLocalDate(cp.campaignEndDate)}
                                        </span>
                                    </div>
                                </div>
                                {/* CỤM PROGRESS BAR NÂNG CẤP */}
                                <div className="space-y-3 mb-6">
                                    <div style={{ marginTop: '12px', marginBottom: '24px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' }}>Đã huy động</span>
                                                <span style={{ fontSize: '18px', fontWeight: 900, color: isSuccess ? '#059669' : '#e11d48' }}>
                                                    {formatCurrency(total)}
                                                </span>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <span style={{ fontSize: '24px', fontWeight: 900, color: isSuccess ? '#10b981' : '#334155' }}>
                                                    {percent}%
                                                </span>
                                            </div>
                                        </div>

                                        {/* THANH CHẠY (PROGRESS BAR) - ÉP HIỂN THỊ BẰNG INLINE CSS */}
                                        <div style={{
                                            width: '100%',
                                            height: '12px',
                                            backgroundColor: '#f1f5f9',
                                            borderRadius: '999px',
                                            padding: '2px',
                                            position: 'relative',
                                            display: 'block',
                                            overflow: 'hidden'
                                        }}>
                                            <div
                                                style={{
                                                    height: '100%',
                                                    borderRadius: '999px',
                                                    backgroundColor: isSuccess ? '#10b981' : '#f43f5e',
                                                    width: `${Math.min(percent, 100)}%`, // Ép width theo % thực tế
                                                    transition: 'width 1s ease-out',
                                                    boxShadow: isSuccess ? '0 0 8px rgba(16, 185, 129, 0.4)' : 'none'
                                                }}
                                            ></div>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                                            <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' }}>
                                                Mục tiêu: {formatCurrency(goal)}
                                            </span>
                                            <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' }}>
                                                {cp.totalContributors ?? 0} người
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
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <button
                                        onClick={() => handleExportExcel(String(cp.id), String(cp.title ?? ''))}
                                        disabled={isBusy}
                                        className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 transition-all border border-slate-100 disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        <Download size={14} /> Danh sách
                                    </button>
                                    <button
                                        onClick={() => openDetail(String(cp.id))}
                                        disabled={isBusy}
                                        className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-100 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        <ExternalLink size={14} /> Chi tiết
                                    </button>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    {cp.status === 'ACTIVE' && (
                                        <button
                                            onClick={() => openAddContribution(String(cp.id))}
                                            disabled={isBusy}
                                            className="flex-1 min-w-[200px] flex items-center justify-center gap-2 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            + Ghi nhận đóng góp
                                        </button>
                                    )}
                                    <button
                                        onClick={() => openEdit(cp)}
                                        disabled={isBusy}
                                        className="h-10 w-10 flex items-center justify-center bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                        title="Sửa campaign"
                                    >
                                        <Pencil size={14} />
                                    </button>
                                    <button
                                        onClick={() => openDeleteConfirm(String(cp.id))}
                                        disabled={isBusy}
                                        className="h-10 w-10 flex items-center justify-center bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                        title="Xóa campaign"
                                    >
                                        <Trash2 size={14} />
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
                        <input
                            type="text"
                            value={createTitle}
                            onChange={(e) => setCreateTitle(e.target.value)}
                            placeholder="Ví dụ: Ủng hộ bão Yagi..."
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none font-bold"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Mục tiêu (VND)</label>
                            <input
                                type="number"
                                value={createGoalAmount}
                                onChange={(e) => setCreateGoalAmount(e.target.value)}
                                placeholder="0"
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-rose-600"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Ngày bắt đầu</label>
                            <input
                                type="date"
                                value={createStartDate}
                                onChange={(e) => setCreateStartDate(e.target.value)}
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-gray-600"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Hạn nhận đóng góp</label>
                            <input
                                type="date"
                                value={createContributionDeadline}
                                onChange={(e) => setCreateContributionDeadline(e.target.value)}
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-gray-600"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Ngày kết thúc</label>
                            <input
                                type="date"
                                value={createCampaignEndDate}
                                onChange={(e) => setCreateCampaignEndDate(e.target.value)}
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-gray-600"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Mô tả mục đích</label>
                        <textarea
                            rows={3}
                            value={createDescription}
                            onChange={(e) => setCreateDescription(e.target.value)}
                            placeholder="Mô tả chiến dịch..."
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-medium"
                        ></textarea>
                    </div>

                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={createIsPublic}
                            onChange={(e) => setCreateIsPublic(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                        />
                        Công khai campaign
                    </label>

                    <div className="pt-4 flex flex-col md:flex-row gap-3">
                        <button
                            onClick={() => setIsCreateModalOpen(false)}
                            disabled={isCreateSubmitting}
                            className="flex-1 py-4 rounded-2xl font-bold text-gray-400 hover:bg-gray-100 transition-all border-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            onClick={submitCreate}
                            disabled={isCreateSubmitting}
                            className="flex-1 py-4 rounded-2xl font-bold text-white shadow-lg transition-all border-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                            style={{ backgroundColor: '#e11d48' }}
                        >
                            {isCreateSubmitting ? 'Đang tạo...' : 'Bắt đầu chiến dịch'}
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                title="Thông tin chi tiết chiến dịch"
                size="lg"
            >
                {isDetailLoading ? (
                    <div className="flex items-center justify-center py-20 text-gray-500">
                        <Loader2 className="w-8 h-8 mr-2 animate-spin text-rose-600" />
                        <span className="font-bold">Đang tải chi tiết chiến dịch...</span>
                    </div>
                ) : (
                    <div className="p-8 space-y-8 max-h-[85vh] overflow-y-auto">
                        {/* Phần Header & Thông tin cơ bản */}
                        <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 relative overflow-hidden">
                            <div className="absolute top-4 right-4 flex gap-2">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${campaignDetail?.campaign?.isPublic ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-500'}`}>
                                    {campaignDetail?.campaign?.isPublic ? '🌐 Công khai' : '🔒 Nội bộ'}
                                </span>
                                {/* Status removed */}
                            </div>

                            <div className="space-y-3">
                                <h2 className="text-3xl font-black text-slate-800 pr-20">
                                    {String(campaignDetail?.campaign?.title ?? '')}
                                </h2>
                                <div className="flex items-start gap-2 text-slate-500 max-w-2xl">
                                    <Info size={18} className="mt-0.5 flex-shrink-0 text-slate-400" />
                                    <p className="text-sm italic">
                                        {campaignDetail?.campaign?.description || 'Không có mô tả chi tiết cho chiến dịch này.'}
                                    </p>
                                </div>
                            </div>

                            {/* Grid thông số tiền bạc */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-200/50">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Đã thu được</p>
                                    <p className="text-lg font-black text-rose-600">{formatCurrency(campaignDetail?.campaign?.totalCollected)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Mục tiêu</p>
                                    <p className="text-lg font-black text-slate-700">{formatCurrency(campaignDetail?.campaign?.goalAmount)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Người đóng góp</p>
                                    <div className="flex items-center gap-2">
                                        <Users size={16} className="text-slate-400" />
                                        <p className="text-lg font-black text-slate-700">{campaignDetail?.campaign?.totalContributors ?? 0}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tỷ lệ</p>
                                    <p className="text-lg font-black text-emerald-600">
                                        {campaignDetail?.campaign?.goalAmount && Number(campaignDetail.campaign.goalAmount) > 0
                                            ? Math.round((Number(campaignDetail.campaign.totalCollected || 0) / Number(campaignDetail.campaign.goalAmount)) * 100)
                                            : 0}%
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Các mốc thời gian */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center gap-4 shadow-sm">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Calendar size={20} /></div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Bắt đầu</p>
                                    <p className="text-sm font-bold text-slate-700">{normalizeLocalDate(campaignDetail?.campaign?.startDate)}</p>
                                </div>
                            </div>
                            <div className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center gap-4 shadow-sm">
                                <div className="p-3 bg-slate-50 text-slate-600 rounded-xl"><Calendar size={20} /></div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Kết thúc</p>
                                    <p className="text-sm font-bold text-slate-700">{normalizeLocalDate(campaignDetail?.campaign?.campaignEndDate)}</p>
                                </div>
                            </div>
                            <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-4 shadow-sm">
                                <div className="p-3 bg-amber-100 text-amber-600 rounded-xl"><Clock size={20} /></div>
                                <div>
                                    <p className="text-[10px] font-bold text-amber-500 uppercase">Hạn chót</p>
                                    <p className="text-sm font-black text-amber-700">{normalizeLocalDate(campaignDetail?.campaign?.contributionDeadline)}</p>
                                </div>
                            </div>
                        </div>

                        {campaignDetail?.campaign?.status === 'ACTIVE' && (
                            <div className="flex flex-col md:flex-row gap-4">
                                <button
                                    onClick={() => selectedCampaignId && openAddContribution(selectedCampaignId)}
                                    disabled={isCreateSubmitting || isEditSubmitting || isDeleteSubmitting || isAddContributionSubmitting}
                                    className="flex-1 py-4 rounded-2xl bg-emerald-600 text-black font-black shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all disabled:opacity-60"
                                >
                                    + GHI NHẬN ĐÓNG GÓP
                                </button>
                            </div>
                        )}

                        {/* Danh sách đóng góp (Bảng đẹp Modal 2) */}
                        <div className="bg-white border border-slate-100 rounded-[24px] overflow-hidden shadow-sm min-h-[250px]">
                            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider">
                                    Danh sách đóng góp ({Array.isArray(campaignDetail?.contributions) ? campaignDetail.contributions.length : 0})
                                </h3>
                            </div>
                            <div className="max-h-[350px] overflow-y-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="sticky top-0 bg-slate-50 z-10">
                                        <tr>
                                            <th className="p-4 text-[10px] font-black text-slate-400 uppercase">Người đóng</th>
                                            <th className="p-4 text-[10px] font-black text-slate-400 uppercase">Thông tin</th>
                                            <th className="p-4 text-[10px] font-black text-slate-400 uppercase text-right">Số tiền</th>
                                            <th className="p-4 text-[10px] font-black text-slate-400 uppercase text-right">Thời gian</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {(Array.isArray(campaignDetail?.contributions) ? campaignDetail.contributions : []).map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold text-xs uppercase">
                                                            {String(item.contributorName ?? '?').charAt(0)}
                                                        </div>
                                                        <span className="font-bold text-slate-700 text-sm">{item.contributorName}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-xs italic text-slate-500">
                                                    {item.address} {item.phone && `(${item.phone})`}
                                                </td>
                                                <td className="p-4 text-right font-black text-emerald-600">
                                                    +{formatCurrency(item.amount)}
                                                </td>
                                                <td className="p-4 text-right text-xs font-bold text-slate-400">
                                                    {normalizeLocalDate(item.contributionDate)}
                                                </td>
                                            </tr>
                                        ))}
                                        {(!campaignDetail?.contributions || campaignDetail.contributions.length === 0) && (
                                            <tr>
                                                <td colSpan={4} className="p-12 text-center text-slate-400 italic text-sm">
                                                    Chưa có đóng góp nào cho chiến dịch này.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="pt-2 space-y-3">
                            {/* Hàng 1: Hai nút nằm ngang */}
                            <div className="flex flex-row gap-3">
                                <button
                                    onClick={() => campaignDetail?.campaign && openEdit(campaignDetail.campaign)}
                                    disabled={isCreateSubmitting || isEditSubmitting || isDeleteSubmitting || isAddContributionSubmitting}
                                    className="flex-1 py-4 rounded-2xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-all disabled:opacity-60"
                                >
                                    SỬA CHIẾN DỊCH
                                </button>
                                <button
                                    onClick={() => selectedCampaignId && openDeleteConfirm(selectedCampaignId)}
                                    disabled={isCreateSubmitting || isEditSubmitting || isDeleteSubmitting || isAddContributionSubmitting}
                                    className="flex-1 py-4 rounded-2xl bg-rose-50 text-rose-600 font-bold hover:bg-rose-100 transition-all disabled:opacity-60"
                                >
                                    XÓA CHIẾN DỊCH
                                </button>
                            </div>

                            {/* Hàng 2: Nút đóng nằm dưới */}
                            <button
                                onClick={() => setIsDetailModalOpen(false)}
                                className="w-full py-4 bg-slate-800 text-black font-bold rounded-2xl hover:bg-slate-900 transition-all shadow-lg shadow-slate-200"
                            >
                                ĐÓNG CỬA SỔ
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Sửa campaign">
                <div className="p-6 space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Tên chiến dịch</label>
                        <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none font-bold"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Mục tiêu (VND)</label>
                            <input
                                type="number"
                                value={editGoalAmount}
                                onChange={(e) => setEditGoalAmount(e.target.value)}
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-rose-600"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Ngày bắt đầu</label>
                            <input
                                type="date"
                                value={editStartDate}
                                onChange={(e) => setEditStartDate(e.target.value)}
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-gray-600"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Hạn nhận đóng góp</label>
                            <input
                                type="date"
                                value={editContributionDeadline}
                                onChange={(e) => setEditContributionDeadline(e.target.value)}
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-gray-600"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Ngày kết thúc</label>
                            <input
                                type="date"
                                value={editCampaignEndDate}
                                onChange={(e) => setEditCampaignEndDate(e.target.value)}
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-gray-600"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Mô tả</label>
                        <textarea
                            rows={3}
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-medium"
                        ></textarea>
                    </div>

                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={editIsPublic}
                            onChange={(e) => setEditIsPublic(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                        />
                        Công khai campaign
                    </label>

                    <div className="pt-4 flex flex-col md:flex-row gap-3">
                        <button
                            onClick={() => setIsEditModalOpen(false)}
                            disabled={isEditSubmitting}
                            className="flex-1 py-4 rounded-2xl font-bold text-gray-400 hover:bg-gray-100 transition-all border-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            onClick={submitEdit}
                            disabled={isEditSubmitting}
                            className="flex-1 py-4 rounded-2xl font-bold text-white shadow-lg transition-all border-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                            style={{ backgroundColor: '#e11d48' }}
                        >
                            {isEditSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={deleteTargetId != null} onClose={() => setDeleteTargetId(null)} title="Xóa campaign">
                <div className="p-6 space-y-4">
                    <div className="text-sm text-gray-600">
                        Xóa campaign này? Thao tác không thể hoàn tác.
                    </div>
                    <div className="flex flex-col md:flex-row gap-3 pt-2">
                        <button
                            onClick={() => setDeleteTargetId(null)}
                            disabled={isDeleteSubmitting}
                            className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={submitDelete}
                            disabled={isDeleteSubmitting}
                            className="flex-1 py-3 rounded-xl bg-rose-600 text-black font-bold hover:bg-rose-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isDeleteSubmitting ? 'Đang xóa...' : 'Xóa'}
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={isAddContributionOpen} onClose={() => setIsAddContributionOpen(false)} title="Ghi nhận đóng góp">
                <div className="p-6 space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Tên người đóng góp</label>
                        <input
                            type="text"
                            value={contributorName}
                            onChange={(e) => setContributorName(e.target.value)}
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Số tiền (VND)</label>
                            <input
                                type="number"
                                value={contributionAmount}
                                onChange={(e) => setContributionAmount(e.target.value)}
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-rose-600"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Ngày đóng góp</label>
                            <input
                                type="date"
                                value={contributionDate}
                                onChange={(e) => setContributionDate(e.target.value)}
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-bold text-gray-600"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Số điện thoại</label>
                            <input
                                type="text"
                                value={contributorPhone}
                                onChange={(e) => setContributorPhone(e.target.value)}
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-medium"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Địa chỉ</label>
                            <input
                                type="text"
                                value={contributorAddress}
                                onChange={(e) => setContributorAddress(e.target.value)}
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-medium"
                            />
                        </div>
                    </div>
                    <div className="pt-3 flex flex-col md:flex-row gap-3">
                        <button
                            onClick={() => setIsAddContributionOpen(false)}
                            disabled={isAddContributionSubmitting}
                            className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={submitAddContribution}
                            disabled={isAddContributionSubmitting}
                            className="flex-1 py-3 rounded-xl font-bold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                            style={{ backgroundColor: '#e11d48' }}
                        >
                            {isAddContributionSubmitting ? 'Đang lưu...' : 'Ghi nhận'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

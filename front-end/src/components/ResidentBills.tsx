import { useState, useEffect } from 'react';
import { Search, Download, Clock, CheckCircle, AlertCircle, Receipt, Calendar, CheckCircle2, Wallet, Banknote, AlertTriangle } from 'lucide-react';
import { authProvider } from './auth';
import { Toaster, toast } from 'sonner';

type BillDetail = {
  item: string;
  amount: number;
};

type Bill = {
  id: string;
  type: string;
  amount: number;
  dueDate: string;
  status: 'Paid' | 'Pending';
  paidDate: string | null;
  period: string;
  details: BillDetail[];
};

type ApiEnvelope<T> = {
  message?: string;
  data?: T;
};

type InvoiceSummaryApi = {
  id: string;
  apartmentLabel?: string;
  totalAmount?: number;
  status?: 'PAID' | 'UNPAID' | 'PENDING' | string;
  createdDate?: string;
};

type ApartmentDropdownItem = {
  id: string;
  label?: string;
};

type IssueTypeEnum = 'COMPLAINT' | (string & {});

type IssueCreateRequest = {
  apartmentId: string;
  title: string;
  description: string;
  type: IssueTypeEnum;
  reporterId: string;
};

const API_BASE_URL = 'https://untoasted-jean-unsympathisingly.ngrok-free.dev';
const NGROK_HEADERS = { 'ngrok-skip-browser-warning': 'true' };
const PAYMENT_REQUEST_STORAGE_KEY = 'payment_requests_v1';
const PAYMENT_REQUEST_MARKER = '[PAYMENT_REQUEST]';

const pad2 = (n: number) => String(n).padStart(2, '0');

const toIsoDate = (date: Date) => `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

const readPaymentRequestMap = (): Record<string, string> => {
  try {
    const raw = localStorage.getItem(PAYMENT_REQUEST_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed as Record<string, string>;
  } catch {
    return {};
  }
};

const writePaymentRequestMap = (value: Record<string, string>) => {
  try {
    localStorage.setItem(PAYMENT_REQUEST_STORAGE_KEY, JSON.stringify(value));
  } catch {
    // ignore
  }
};

const getRecentPeriods = (count: number) => {
  const periods: Array<{ month: number; year: number }> = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    periods.push({ month: d.getMonth() + 1, year: d.getFullYear() });
  }
  return periods;
};

const normalizeApartmentLabel = (roomNumber: number | string) => {
  const raw = String(roomNumber ?? '').trim();
  const normalized = raw.toUpperCase().startsWith('P.') ? raw.slice(2) : raw;
  return `P.${normalized}`;
};

export function ResidentBills() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Pending' | 'Overdue'>('All');
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [paidBill, setPaidBill] = useState<Bill | null>(null);
  const [residentId, setResidentId] = useState<string | null>(null);
  const [roomNumber, setRoomNumber] = useState<string | null>(null);
  const [apartmentId, setApartmentId] = useState<string | null>(null);
  const [apartmentLabel, setApartmentLabel] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const personId = authProvider.getPersonId();
        if (!personId) throw new Error('Vui lòng đăng nhập lại');
        setResidentId(personId);

        const residentRes = await fetch(`${API_BASE_URL}/api/v1/residents/${personId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...NGROK_HEADERS,
          },
        });
        const residentJson = (await residentRes.json().catch(() => ({}))) as ApiEnvelope<{ roomNumber?: number | string }>;
        if (!residentRes.ok) throw new Error(residentJson?.message || 'Không thể tải thông tin cư dân');

        const roomNumberRaw = residentJson?.data?.roomNumber;
        const roomNumber = roomNumberRaw == null ? '' : String(roomNumberRaw);
        if (!roomNumber) throw new Error('Cư dân chưa được gán căn hộ');
        setRoomNumber(roomNumber);
        const apartmentLabel = normalizeApartmentLabel(roomNumber);
        setApartmentLabel(apartmentLabel);

        try {
          const roomDigits = String(roomNumber).trim().replace(/^P\./i, '');
          const dropdownRes = await fetch(
            `${API_BASE_URL}/api/v1/apartments/dropdown?keyword=${encodeURIComponent(roomDigits)}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                ...NGROK_HEADERS,
              },
            }
          );
          const dropdownJson = (await dropdownRes.json().catch(() => ({}))) as ApiEnvelope<ApartmentDropdownItem[]>;
          const list = Array.isArray(dropdownJson?.data) ? dropdownJson.data : [];
          const normalizedNeedle = `P.${roomDigits}`.trim().toUpperCase();
          const match =
            list.find((x) => String(x?.label ?? '').trim().toUpperCase().includes(normalizedNeedle)) ??
            list.find((x) => String(x?.label ?? '').trim().toUpperCase().includes(roomDigits.trim().toUpperCase()));
          setApartmentId(match?.id ? String(match.id) : null);
        } catch {
          setApartmentId(null);
        }

        const periods = getRecentPeriods(12);
        const invoicesByPeriod = await Promise.all(
          periods.map(async ({ month, year }) => {
            const invoiceRes = await fetch(`${API_BASE_URL}/api/v1/accounting/invoices?month=${month}&year=${year}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                ...NGROK_HEADERS,
              },
            });
            const invoiceJson = (await invoiceRes.json().catch(() => ({}))) as ApiEnvelope<InvoiceSummaryApi[]>;
            if (!invoiceRes.ok) throw new Error(invoiceJson?.message || 'Không thể tải danh sách hóa đơn');
            const invoiceList = Array.isArray(invoiceJson?.data) ? invoiceJson.data : [];
            return { month, year, invoiceList };
          })
        );

        const mappedBills: Bill[] = invoicesByPeriod.flatMap(({ month, year, invoiceList }) => {
          const period = `Tháng ${month}/${year}`;
          const dueDate = `${year}-${pad2(month)}-05`;

          return invoiceList
            .filter((invoice) => String(invoice?.apartmentLabel ?? '').trim() === apartmentLabel)
            .map((invoice) => {
              const amount = Number(invoice.totalAmount ?? 0);
              const apiStatus = String(invoice.status ?? '').toUpperCase();
              const isPaid = apiStatus === 'PAID';

              return {
                id: String(invoice.id),
                type: 'Hóa đơn tháng',
                amount: Number.isFinite(amount) ? amount : 0,
                dueDate,
                status: isPaid ? 'Paid' : 'Pending',
                paidDate: null,
                period,
                details: [{ item: 'Tổng hóa đơn', amount: Number.isFinite(amount) ? amount : 0 }],
              };
            });
        });

        mappedBills.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
        const requestMap = readPaymentRequestMap();
        setBills(
          mappedBills.map((b) => {
            const requestedAt = requestMap[b.id];
            return requestedAt ? { ...b, paidDate: requestedAt } : b;
          })
        );
      } catch (e) {
        setBills([]);
        setError((e as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, []);

  const filteredBills = bills.filter(bill => {
    const matchesSearch = bill.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.period.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesStatus = false;
    if (statusFilter === 'All') {
      matchesStatus = true;
    } else if (statusFilter === 'Overdue') {
      // Hóa đơn trễ hạn: status là Pending và dueDate đã qua
      matchesStatus = bill.status === 'Pending' && new Date(bill.dueDate) < new Date();
    } else {
      matchesStatus = bill.status === statusFilter;
    }

    return matchesSearch && matchesStatus;
  });

  const totalPaid = bills.filter(b => b.status === 'Paid').reduce((sum, b) => sum + b.amount, 0);
  const totalPending = bills.filter(b => b.status === 'Pending').reduce((sum, b) => sum + b.amount, 0);
  const totalOverdue = bills.filter(b => {
    if (b.status === 'Pending') {
      const dueDate = new Date(b.dueDate);
      const today = new Date();
      return dueDate < today;
    }
    return false;
  }).reduce((sum, b) => sum + b.amount, 0);

  const createIssueApi = async (issueData: IssueCreateRequest) => {
    const response = await fetch(`${API_BASE_URL}/api/issues`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...NGROK_HEADERS,
      },
      body: JSON.stringify(issueData),
    });

    const json = (await response.json().catch(() => ({}))) as ApiEnvelope<unknown>;
    if (!response.ok) {
      throw new Error(json?.message || `Lỗi: ${response.status} khi tạo yêu cầu.`);
    }

    return json?.data;
  };

  const ensureApartmentId = async () => {
    if (apartmentId) return apartmentId;
    if (!roomNumber) return null;
    const roomDigits = String(roomNumber).trim().replace(/^P\./i, '');

    const dropdownRes = await fetch(`${API_BASE_URL}/api/v1/apartments/dropdown?keyword=${encodeURIComponent(roomDigits)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...NGROK_HEADERS,
      },
    });
    const dropdownJson = (await dropdownRes.json().catch(() => ({}))) as ApiEnvelope<ApartmentDropdownItem[]>;
    const list = Array.isArray(dropdownJson?.data) ? dropdownJson.data : [];
    const normalizedNeedle = `P.${roomDigits}`.trim().toUpperCase();
    const match =
      list.find((x) => String(x?.label ?? '').trim().toUpperCase().includes(normalizedNeedle)) ??
      list.find((x) => String(x?.label ?? '').trim().toUpperCase().includes(roomDigits.trim().toUpperCase()));
    const nextId = match?.id ? String(match.id) : null;
    setApartmentId(nextId);
    return nextId;
  };

  const handlePayBill = async (bill: Bill) => {
    setIsLoading(true);
    setError(null);
    try {
      if (bill.paidDate) return;
      if (!residentId) throw new Error('Vui lòng đăng nhập lại');
      if (!apartmentLabel) throw new Error('Không tìm thấy thông tin căn hộ để gửi yêu cầu');
      const resolvedApartmentId = await ensureApartmentId();
      if (!resolvedApartmentId) throw new Error('Không tìm thấy thông tin căn hộ để gửi yêu cầu');

      const requestedAt = toIsoDate(new Date());
      const issueTitle = `${PAYMENT_REQUEST_MARKER} Yêu cầu xác nhận thanh toán hóa đơn ${bill.period}`;
      const issueDescription = [
        PAYMENT_REQUEST_MARKER,
        `Căn hộ: ${apartmentLabel}`,
        `InvoiceId: ${bill.id}`,
        `Kỳ: ${bill.period}`,
        `Số tiền: ${bill.amount.toLocaleString('vi-VN')} đ`,
        `Hạn thanh toán: ${bill.dueDate}`,
        `Ngày yêu cầu: ${requestedAt}`,
        `Người gửi (residentId): ${residentId}`,
      ].join('\n');

      await createIssueApi({
        apartmentId: resolvedApartmentId,
        title: issueTitle,
        description: issueDescription,
        type: 'COMPLAINT',
        reporterId: residentId,
      });

      const requestMap = readPaymentRequestMap();
      writePaymentRequestMap({ ...requestMap, [bill.id]: requestedAt });

      setBills((prev) => prev.map((b) => (b.id === bill.id ? { ...b, paidDate: requestedAt } : b)));
      setPaidBill({ ...bill, status: 'Pending', paidDate: requestedAt });
      setShowSuccessModal(true);
      setSelectedBill(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    const headers = ['Loại hóa đơn', 'Kỳ', 'Số tiền', 'Hạn thanh toán', 'Trạng thái', 'Ngày thanh toán'];
    const rows = bills.map((bill) => [
      bill.type,
      bill.period,
      bill.amount.toLocaleString('vi-VN'),
      bill.dueDate,
      bill.status === 'Paid' ? 'Đã thanh toán' : 'Chưa thanh toán',
      bill.paidDate || '-',
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `hoa_don_${toIsoDate(new Date())}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPDF = async (invoiceId: string, apartmentLabel: string) => {
    try {
      toast.info("Đang tải xuống PDF...");
      const url = `https://untoasted-jean-unsympathisingly.ngrok-free.dev/api/v1/accounting/${invoiceId}/export-pdf`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      });

      if (!response.ok) throw new Error("Lỗi tải PDF");

      const blob = await response.blob();
      const href = window.URL.createObjectURL(blob);
      const anchorElement = document.createElement('a');
      anchorElement.href = href;
      anchorElement.download = `HoaDon_${apartmentLabel}.pdf`;
      document.body.appendChild(anchorElement);
      anchorElement.click();
      document.body.removeChild(anchorElement);
      window.URL.revokeObjectURL(href);
      toast.success("Tải PDF thành công");
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải PDF");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Toaster position="top-center" richColors />
        <h1 className="text-3xl text-gray-900">Quản lý tài chính</h1>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 text-red-800 rounded-2xl p-4">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Card 1: Đã thanh toán - Green */}
        <div className="h-32 rounded-2xl p-6 flex justify-between items-center text-white shadow-sm relative overflow-hidden" style={{ backgroundColor: '#059669' }}>
          <div className="flex flex-col">
            <p className="text-3xl font-bold">{totalPaid.toLocaleString('vi-VN')} đ</p>
            <p className="text-sm font-medium opacity-80 mt-1">Đã thanh toán</p>
          </div>
          <CheckCircle className="w-12 h-12 opacity-20 flex-shrink-0" />
        </div>

        {/* Card 2: Phí cần đóng - Navy */}
        <div className="h-32 rounded-2xl p-6 flex justify-between items-center text-white shadow-sm relative overflow-hidden" style={{ backgroundColor: '#1e293b' }}>
          <div className="flex flex-col">
            <p className="text-3xl font-bold">{totalPending.toLocaleString('vi-VN')} đ</p>
            <p className="text-sm font-medium opacity-80 mt-1">Phí cần đóng</p>
          </div>
          <Wallet className="w-12 h-12 opacity-20 flex-shrink-0" />
        </div>

        {/* Card 3: Hóa đơn trễ hạn - Red */}
        <div className="h-32 rounded-2xl p-6 flex justify-between items-center text-white shadow-sm relative overflow-hidden" style={{ backgroundColor: '#dc2626' }}>
          <div className="flex flex-col">
            <p className="text-3xl font-bold">{totalOverdue.toLocaleString('vi-VN')} đ</p>
            <p className="text-sm font-medium opacity-80 mt-1">Hóa đơn trễ hạn</p>
          </div>
          <AlertTriangle className="w-12 h-12 opacity-20 flex-shrink-0" />
        </div>

        {/* Card 4: Sổ chi tiêu - Indigo */}
        <div className="h-32 rounded-2xl p-6 flex justify-between items-center text-white shadow-sm relative overflow-hidden" style={{ backgroundColor: '#4f46e5' }}>
          <div className="flex flex-col">
            <p className="text-3xl font-bold">{(totalPaid + totalPending).toLocaleString('vi-VN')} đ</p>
            <p className="text-sm font-medium opacity-80 mt-1">Sổ chi tiêu</p>
          </div>
          <Banknote className="w-12 h-12 opacity-20 flex-shrink-0" />
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Tìm kiếm theo loại hóa đơn hoặc kỳ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
        />
      </div>

      {/* Actions Row: Filter Tabs & Export Button */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          {['All', 'Paid', 'Pending', 'Overdue'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as typeof statusFilter)}
              className={`px-6 py-3 rounded-xl transition-all ${statusFilter === status
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50'
                }`}
            >
              {status === 'All' ? 'Tất cả' :
                status === 'Paid' ? 'Đã thanh toán' :
                  status === 'Pending' ? 'Chưa thanh toán' : 'Quá hạn'}
            </button>
          ))}
        </div>
        <button
          onClick={handleExport}
          disabled={isLoading || bills.length === 0}
          className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Download className="w-5 h-5" />
          Xuất file
        </button>
      </div>

      {/* Bills List */}
      <div className="space-y-3">
        {isLoading && (
          <div className="bg-white rounded-2xl p-12 border-2 border-gray-200 text-center">
            <p className="text-gray-600 text-lg">Đang tải hóa đơn...</p>
          </div>
        )}
        {filteredBills.map((bill) => {
          const isOverdue = bill.status === 'Pending' && new Date(bill.dueDate) < new Date();

          return (
            <div
              key={bill.id}
              className={`bg-white rounded-2xl p-6 border-2 transition-all hover:shadow-md ${isOverdue ? 'border-red-200 bg-red-50/30' : 'border-gray-200'
                }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bill.status === 'Paid' ? 'bg-emerald-100' :
                      isOverdue ? 'bg-red-100' : 'bg-blue-100'
                      }`}>
                      <Receipt className={`w-6 h-6 ${bill.status === 'Paid' ? 'text-emerald-600' :
                        isOverdue ? 'text-red-600' : 'text-blue-600'
                        }`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{bill.type}</h3>
                      <p className="text-sm text-gray-500">{bill.period}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Số tiền</p>
                      <p className="text-lg font-bold text-gray-900">{bill.amount.toLocaleString('vi-VN')} đ</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Hạn thanh toán</p>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <p className="text-sm text-gray-700">{bill.dueDate}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Trạng thái</p>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${bill.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                        isOverdue ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                        {bill.status === 'Paid' && <CheckCircle className="w-4 h-4" />}
                        {(bill.status === 'Pending' && !isOverdue) && <Clock className="w-4 h-4" />}
                        {isOverdue && <AlertCircle className="w-4 h-4" />}
                        {bill.status === 'Paid' ? 'Đã thanh toán' :
                          isOverdue ? 'Quá hạn' : 'Chưa thanh toán'}
                      </span>
                    </div>
                  </div>

                  {bill.paidDate && (
                    <p className="text-xs text-gray-500">Đã gửi yêu cầu: {bill.paidDate}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => setSelectedBill(bill)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm rounded-lg hover:shadow-lg transition-all"
                  >
                    Xem chi tiết
                  </button>
                  <button
                    onClick={() => handleDownloadPDF(bill.id, apartmentLabel || '')}
                    className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Tải hóa đơn
                  </button>

                  {bill.status === 'Pending' && !bill.paidDate && (
                    <button
                      onClick={() => handlePayBill(bill)}
                      disabled={isLoading}
                      className="px-4 py-2 bg-white text-blue-600 border-2 border-blue-600 text-sm rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      Thanh toán
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bill Details Modal */}
      {selectedBill && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedBill(null)}>
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full border-2 border-gray-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Chi Tiết Hóa Đơn</h2>
              <button
                onClick={() => setSelectedBill(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="text-gray-700">Loại hóa đơn:</span>
                <span className="font-semibold text-gray-900">{selectedBill.type}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="text-gray-700">Kỳ:</span>
                <span className="font-semibold text-gray-900">{selectedBill.period}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="text-gray-700">Hạn thanh toán:</span>
                <span className="font-semibold text-gray-900">{selectedBill.dueDate}</span>
              </div>

              <div className="border-t-2 border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Chi tiết các khoản phí:</h3>
                <div className="space-y-2">
                  {selectedBill.details.map((detail, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">{detail.item}</span>
                      <span className="font-semibold text-gray-900">{detail.amount.toLocaleString('vi-VN')} đ</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl mt-4">
                  <span className="text-lg font-semibold text-gray-900">Tổng cộng:</span>
                  <span className="text-xl font-bold text-gray-900">{selectedBill.amount.toLocaleString('vi-VN')} đ</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedBill(null)}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
              >
                Đóng
              </button>
              {selectedBill.status === 'Pending' && !selectedBill.paidDate && (
                <button
                  onClick={() => handlePayBill(selectedBill)}
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  Thanh toán ngay
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {filteredBills.length === 0 && !isLoading && (
        <div className="bg-white rounded-2xl p-12 border-2 border-gray-200 text-center">
          <Receipt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Không tìm thấy hóa đơn nào</p>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && paidBill && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowSuccessModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-md w-full border-2 border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Đã gửi yêu cầu thanh toán</h2>
              <p className="text-gray-600">Yêu cầu thanh toán của bạn đã được ghi nhận.</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Loại hóa đơn:</span>
                  <span className="font-semibold text-gray-900">{paidBill.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Kỳ:</span>
                  <span className="font-semibold text-gray-900">{paidBill.period}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Số tiền:</span>
                  <span className="font-semibold text-gray-900">{paidBill.amount.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ngày yêu cầu:</span>
                  <span className="font-semibold text-gray-900">{paidBill.paidDate}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800">
                  Bạn có thể theo dõi trạng thái xử lý trong mục Thông Báo hoặc trang hóa đơn.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setShowSuccessModal(false);
                setPaidBill(null);
              }}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

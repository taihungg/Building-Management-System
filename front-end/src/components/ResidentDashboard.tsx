import { Bell, Receipt, FileText, Wallet } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { authProvider } from './auth';

type ApiEnvelope<T> = {
  message?: string;
  data?: T;
};

type ResidentDetailApi = {
  roomNumber?: number | null;
  building?: string | null;
};

type InvoiceSummaryApi = {
  id: string;
  totalAmount?: number;
  status?: string;
  createdDate?: string;
  apartmentLabel?: string;
};

type Bill = {
  id: string;
  type: string;
  amount: number;
  dueDate: string;
  status: 'Paid' | 'Pending';
  period: string;
  createdAt: string;
};

const API_BASE_URL = 'https://building-management-system.fly.dev';
const NGROK_HEADERS = { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' };

const pad2 = (n: number) => String(n).padStart(2, '0');
const toYmd = (date: Date) => `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
const toPeriod = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Không rõ';
  return `Tháng ${d.getMonth() + 1}/${d.getFullYear()}`;
};
const toBillStatus = (status?: string): Bill['status'] => (status === 'PAID' ? 'Paid' : 'Pending');
const addDaysIso = (iso: string, days: number) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  d.setDate(d.getDate() + days);
  return toYmd(d);
};
const toMonthKey = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
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

interface ResidentDashboardProps {
  onNavigate?: (page: string) => void;
}

export function ResidentDashboard({ onNavigate }: ResidentDashboardProps = {}) {
  const [unreadAnnouncements, setUnreadAnnouncements] = useState(0);
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const residentId = authProvider.getPersonId();
        if (!residentId) {
          throw new Error('Không tìm thấy thông tin cư dân');
        }

        const unreadCountPromise = (async () => {
          const res = await fetch(`${API_BASE_URL}/api/announcements/resident/${residentId}`, {
            method: 'GET',
            headers: NGROK_HEADERS,
          });

          const json = (await res.json()) as ApiEnvelope<
            Array<{ id: string; isRead?: boolean; createdDate?: string; title?: string; message?: string }>
          >;

          if (!res.ok) {
            throw new Error(json.message || 'Không thể tải thông báo');
          }

          const list = Array.isArray(json.data) ? json.data : [];
          return list.filter((a) => !a.isRead).length;
        })();

        const billsPromise = (async () => {
          const residentRes = await fetch(`${API_BASE_URL}/api/v1/residents/${residentId}`, {
            method: 'GET',
            headers: NGROK_HEADERS,
          });
          const residentJson = (await residentRes.json()) as ApiEnvelope<ResidentDetailApi>;

          if (!residentRes.ok) {
            throw new Error(residentJson.message || 'Không thể tải thông tin cư dân');
          }

          const roomNumber = residentJson.data?.roomNumber ?? null;
          if (!roomNumber) return [] as Bill[];
          const apartmentLabel = normalizeApartmentLabel(roomNumber);

          const periods = getRecentPeriods(6);
          const invoicesByPeriod = await Promise.all(
            periods.map(async ({ month, year }) => {
              const invRes = await fetch(`${API_BASE_URL}/api/v1/accounting/invoices?month=${month}&year=${year}`, {
                method: 'GET',
                headers: NGROK_HEADERS,
              });
              const invJson = (await invRes.json()) as ApiEnvelope<InvoiceSummaryApi[]>;

              if (!invRes.ok) {
                throw new Error(invJson.message || 'Không thể tải hóa đơn');
              }

              const invoices = Array.isArray(invJson.data) ? invJson.data : [];
              return { month, year, invoices };
            })
          );

          return invoicesByPeriod
            .flatMap(({ month, year, invoices }) => {
              const createdAt = new Date(year, month - 1, 1).toISOString();
              const dueDate = addDaysIso(createdAt, 14);
              const period = `Tháng ${month}/${year}`;

              return invoices
                .filter((inv) => !!inv.id && String(inv?.apartmentLabel ?? '').trim() === apartmentLabel)
                .map((inv) => ({
                  id: inv.id,
                  type: 'Hóa đơn tháng',
                  amount: Number(inv.totalAmount || 0),
                  dueDate,
                  status: toBillStatus(inv.status),
                  period,
                  createdAt,
                }));
            })
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        })();

        const [unreadCount, billsData] = await Promise.all([unreadCountPromise, billsPromise]);
        setUnreadAnnouncements(unreadCount);
        setBills(billsData);
      } catch (e) {
        setError((e as Error).message);
        setUnreadAnnouncements(0);
        setBills([]);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, []);

  const unpaidBills = bills.filter(b => b.status !== 'Paid');
  const totalUnpaid = unpaidBills.reduce((sum, b) => sum + b.amount, 0);
  const recentBills = bills.slice(0, 6);

  const costChartData = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, idx) => {
      const d = new Date();
      d.setDate(1);
      d.setHours(0, 0, 0, 0);
      d.setMonth(d.getMonth() - (5 - idx));
      const key = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
      return { key, month: `Tháng ${d.getMonth() + 1}`, paid: 0, unpaid: 0 };
    });

    const byKey = new Map(months.map((m) => [m.key, m]));
    for (const bill of bills) {
      const key = toMonthKey(bill.createdAt);
      if (!key) continue;
      const bucket = byKey.get(key);
      if (!bucket) continue;
      if (bill.status === 'Paid') bucket.paid += bill.amount;
      else bucket.unpaid += bill.amount;
    }

    return months;
  }, [bills]);

  // Custom tooltip for cost chart
  const CostTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{payload[0].payload.month}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString('vi-VN')} đ
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl text-gray-900">Quản lý căn hộ</h1>
      </div>

      {error && (
        <div className="bg-white rounded-2xl p-4 border-2 border-red-200 text-red-700">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="bg-white rounded-2xl p-4 border-2 border-gray-200 text-gray-600">
          Đang tải dữ liệu...
        </div>
      )}

      {/* Stats Grid - KhaService Style Sync */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Card 1: Thông báo mới - Navy */}
        <div className="p-6 rounded-xl h-32 flex justify-between items-center text-white shadow-sm" style={{ backgroundColor: '#1e293b' }}>
          <div className="pl-6">
            <p className="text-3xl font-bold block mb-1">{unreadAnnouncements}</p>
            <p className="text-sm font-medium opacity-90 block">Thông báo mới</p>
          </div>
          <Bell className="w-12 h-12 text-white flex-shrink-0" />
        </div>

        {/* Card 2: Hóa đơn dịch vụ - Green */}
        <div className="p-6 rounded-xl h-32 flex justify-between items-center text-white shadow-sm" style={{ backgroundColor: '#059669' }}>
          <div className="pl-6">
            <p className="text-3xl font-bold block mb-1">{unpaidBills.length}</p>
            <p className="text-sm font-medium opacity-90 block">Hóa đơn dịch vụ</p>
          </div>
          <Receipt className="w-12 h-12 text-white flex-shrink-0" />
        </div>

        {/* Card 3: Dư nợ hiện tại - Blue */}
        <div className="p-6 rounded-xl h-32 flex justify-between items-center text-white shadow-sm" style={{ backgroundColor: '#2563eb' }}>
          <div className="pl-6">
            <p className="text-3xl font-bold block mb-1">{totalUnpaid.toLocaleString('vi-VN')} đ</p>
            <p className="text-sm font-medium opacity-90 block">Dư nợ hiện tại</p>
          </div>
          <Wallet className="w-12 h-12 text-white flex-shrink-0" />
        </div>

        {/* Card 4: Nội quy chung cư - Orange */}
        <Link
          to="/resident/rules"
          onClick={() => onNavigate?.('resident-rules')}
          className="p-6 rounded-xl h-32 flex justify-between items-center text-white shadow-sm cursor-pointer no-underline"
          style={{ backgroundColor: '#ea580c' }}
        >
          <div className="pl-6">
            <p className="text-3xl font-bold block mb-1">Xem ngay</p>
            <p className="text-sm font-medium opacity-90 block">Nội quy chung cư</p>
          </div>
          <FileText className="w-12 h-12 text-white flex-shrink-0" />
        </Link>
      </div>

      {/* Charts and Recent Bills Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Left Section: Cost Chart (2/3 width) */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Biểu đồ hóa đơn</h3>
            <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
              6 tháng gần nhất
            </div>
          </div>
          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={costChartData}
                margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="#6b7280"
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  stroke="#6b7280"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value: number) => {
                    if (value >= 1000000) {
                      return (value / 1000000).toFixed(1) + 'M';
                    }
                    return (value / 1000).toFixed(0) + 'K';
                  }}
                />
                <Tooltip content={<CostTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: 10 }}
                  iconType="circle"
                  formatter={(value) => {
                    if (value === 'paid') return 'Đã thanh toán';
                    if (value === 'unpaid') return 'Chưa thanh toán';
                    return value;
                  }}
                />
                <Bar
                  dataKey="unpaid"
                  name="Chưa thanh toán"
                  fill="#f97316"
                  barSize={40}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="paid"
                  name="Đã thanh toán"
                  fill="#10b981"
                  barSize={40}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Section: Recent Bills (1/3 width) */}
        <div className="lg:col-span-1 bg-white rounded-xl p-6 border-2 border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Hóa đơn gần đây</h3>
            <Link
              to="/resident/invoice"
              onClick={() => onNavigate?.('resident-invoice')}
              className="text-sm text-cyan-500 hover:text-cyan-600 transition-colors"
            >
              Xem tất cả
            </Link>
          </div>
          <div className="space-y-3">
            {recentBills.map((bill) => {
              // Extract month number from period (e.g., "Tháng 7/2025" -> "7")
              const monthMatch = bill.period.match(/Tháng\s+(\d+)/);
              const monthNumber = monthMatch ? monthMatch[1] : '';
              const billTitle = monthNumber ? `Hóa đơn tháng ${monthNumber}` : bill.type;

              return (
                <div
                  key={bill.id}
                  className="p-4 rounded-lg border-2 border-gray-200 bg-gray-50 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-900">{billTitle}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${bill.status === 'Paid' ? 'bg-green-100 text-green-700' :
                        bill.status === 'Pending' ? 'bg-orange-100 text-orange-700' :
                          'bg-red-100 text-red-700'
                      }`}>
                      {bill.status === 'Paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-lg font-bold text-gray-900">{bill.amount.toLocaleString('vi-VN')} đ</span>
                    <span className="text-xs text-gray-500">Ngày tạo: {bill.createdAt ? toYmd(new Date(bill.createdAt)) : bill.dueDate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

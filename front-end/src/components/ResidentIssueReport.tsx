import { useState, useEffect } from 'react';
import { AlertCircle, Wrench, Shield, FileText, Plus, Search, Filter, Clock, CheckCircle, XCircle, MapPin, Calendar, User, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { authProvider } from './auth';

const BASE_URL = 'https://untoasted-jean-unsympathisingly.ngrok-free.dev';
const NGROK_HEADERS = {
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true'
};
const PAYMENT_REQUEST_MARKER = '[PAYMENT_REQUEST]';
const isPaymentRequestIssue = (title: string, description: string) => {
  const safeTitle = String(title ?? '');
  const safeDescription = String(description ?? '');
  const haystack = `${safeTitle}\n${safeDescription}`;
  if (haystack.includes(PAYMENT_REQUEST_MARKER)) return true;
  const lowerTitle = safeTitle.toLowerCase();
  const lowerDescription = safeDescription.toLowerCase();
  return lowerTitle.includes('yêu cầu xác nhận thanh toán') && lowerDescription.includes('invoiceid:');
};

type ApiEnvelope<T> = {
  statusCode?: number;
  message?: string;
  data?: T;
};

interface Issue {
  id: string;
  roomNumber: number;
  reporterName: string;
  title: string;
  description: string;
  location: string;
  status: 'UNPROCESSED' | 'PROCESSING' | 'PROCESSED';
  type: 'MAINTENANCE' | 'COMPLAINT' | 'AUTHORITY' | 'SECURITY';
  createdDate: string;
}

interface ResidentDetail {
  id: string;
  apartmentId?: string;
  roomNumber?: number;
  building?: string;
}

const issueTypeLabels: Record<string, string> = {
  'MAINTENANCE': 'Bảo trì',
  'COMPLAINT': 'Khiếu nại',
  'AUTHORITY': 'Cơ quan',
  'SECURITY': 'An ninh'
};

const issueStatusLabels: Record<string, string> = {
  'UNPROCESSED': 'Chưa xử lý',
  'PROCESSING': 'Đang xử lý',
  'PROCESSED': 'Đã xử lý'
};

const issueStatusColors: Record<string, string> = {
  'UNPROCESSED': 'bg-orange-100 text-orange-800',
  'PROCESSING': 'bg-blue-100 text-blue-800',
  'PROCESSED': 'bg-green-100 text-green-800'
};

const issueTypeIcons: Record<string, any> = {
  'MAINTENANCE': Wrench,
  'COMPLAINT': FileText,
  'AUTHORITY': AlertCircle,
  'SECURITY': Shield
};

export function ResidentIssueReport() {
  const [showForm, setShowForm] = useState(false);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(false);
  const [residentDetail, setResidentDetail] = useState<ResidentDetail | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'MAINTENANCE' as Issue['type'],
    location: ''
  });

  // Fetch resident detail to get apartment ID
  useEffect(() => {
    const fetchResidentDetail = async () => {
      const personId = authProvider.getPersonId();
      if (!personId) {
        toast.error('Không tìm thấy thông tin người dùng');
        return;
      }

      try {
        // Fetch resident detail
        const residentResponse = await fetch(`${BASE_URL}/api/v1/residents/${personId}`, {
          headers: NGROK_HEADERS
        });

        if (!residentResponse.ok) {
          const errJson = (await residentResponse.json().catch(() => ({}))) as ApiEnvelope<unknown>;
          throw new Error(errJson?.message || 'Không thể lấy thông tin cư dân');
        }

        const residentRes = (await residentResponse.json().catch(() => ({}))) as ApiEnvelope<{
          id?: string;
          roomNumber?: number | string;
          building?: string;
        }>;
        const residentData = residentRes?.data;
        if (residentData) {
          const roomNumber = residentData.roomNumber;
          const building = residentData.building;
          
          // If we have room number, try to find apartment ID
          let apartmentId: string | undefined = undefined;
          if (roomNumber) {
            try {
              const roomDigits = String(roomNumber).trim().replace(/^P\./i, '');
              const apartmentResponse = await fetch(
                `${BASE_URL}/api/v1/apartments/dropdown?keyword=${encodeURIComponent(roomDigits)}`,
                { headers: NGROK_HEADERS }
              );

              if (!apartmentResponse.ok) {
                const errJson = (await apartmentResponse.json().catch(() => ({}))) as ApiEnvelope<unknown>;
                throw new Error(errJson?.message || 'Không thể lấy thông tin căn hộ');
              }

              const apartmentRes = (await apartmentResponse.json().catch(() => ({}))) as ApiEnvelope<
                Array<{ id?: string; label?: string }>
              >;
              const list = Array.isArray(apartmentRes?.data) ? apartmentRes.data : [];
              const needle = `P.${roomDigits}`.toUpperCase();

              const matchingApartment =
                list.find((apt) => String(apt?.label ?? '').trim().toUpperCase().includes(needle)) ??
                list.find((apt) => {
                  if (!building) return false;
                  const hay = String(apt?.label ?? '').trim().toUpperCase();
                  return hay.includes(needle) && hay.includes(String(building).trim().toUpperCase());
                }) ??
                (list.length === 1 ? list[0] : undefined);

              if (matchingApartment?.id) apartmentId = String(matchingApartment.id);
            } catch (aptError) {
              console.warn('Could not fetch apartment ID:', aptError);
            }
          }

          setResidentDetail({
            id: String(residentData.id ?? personId),
            apartmentId: apartmentId,
            roomNumber: typeof roomNumber === 'number' ? roomNumber : Number(roomNumber),
            building: building
          });
        }
      } catch (error: any) {
        console.error('Error fetching resident detail:', error);
        toast.error('Không thể tải thông tin cư dân');
      }
    };

    fetchResidentDetail();
  }, []);

  // Fetch issues
  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    const personId = authProvider.getPersonId();
    if (!personId) {
      console.warn('No person ID found');
      return;
    }

    setLoading(true);
    try {
      // GET /api/issues/reporter/{reporterId}
      const response = await fetch(`${BASE_URL}/api/issues/reporter/${personId}`, {
        method: 'GET',
        headers: NGROK_HEADERS
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as ApiEnvelope<unknown>;
        throw new Error(errorData.message || 'Không thể tải danh sách sự cố');
      }

      const res = (await response.json().catch(() => ({}))) as ApiEnvelope<Issue[]>;
      const issuesData = Array.isArray(res?.data) ? res.data : [];
      setIssues(issuesData.filter((x) => !isPaymentRequestIssue(x.title, x.description)));
    } catch (error: any) {
      console.error('Error fetching issues:', error);
      toast.error(error.message || 'Không thể tải danh sách sự cố');
      setIssues([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const personId = authProvider.getPersonId();
    if (!personId) {
      toast.error('Không tìm thấy thông tin người dùng');
      return;
    }

    if (!residentDetail?.apartmentId) {
      toast.error('Không tìm thấy thông tin căn hộ. Vui lòng liên hệ quản lý để cập nhật thông tin căn hộ.');
      return;
    }

    // Validate required fields
    if (!formData.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Vui lòng nhập mô tả chi tiết');
      return;
    }
    if (!formData.location.trim()) {
      toast.error('Vui lòng nhập vị trí');
      return;
    }

    setLoading(true);
    try {
      // Prepare request body according to IssueCreateRequestDTO
      const requestBody = {
        apartmentId: residentDetail.apartmentId,
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type,
        location: formData.location.trim(),
        reporterId: personId
      };

      const response = await fetch(`${BASE_URL}/api/issues`, {
        method: 'POST',
        headers: NGROK_HEADERS,
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as ApiEnvelope<unknown>;
        throw new Error(errorData.message || 'Không thể tạo báo cáo sự cố');
      }

      await response.json().catch(() => ({}));
      toast.success('Báo cáo sự cố đã được gửi thành công!');
      setFormData({
        title: '',
        description: '',
        type: 'MAINTENANCE',
        location: ''
      });
      setShowForm(false);
      await fetchIssues();
    } catch (error: any) {
      console.error('Error creating issue:', error);
      toast.error(error.message || 'Không thể tạo báo cáo sự cố');
    } finally {
      setLoading(false);
    }
  };

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'All' || issue.type === typeFilter;
    const matchesStatus = statusFilter === 'All' || issue.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: Issue['status']) => {
    switch (status) {
      case 'UNPROCESSED':
        return <Clock className="w-4 h-4" />;
      case 'PROCESSING':
        return <AlertCircle className="w-4 h-4" />;
      case 'PROCESSED':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl text-gray-900">Báo cáo sự cố</h1>
      </div>

      {/* Create Issue Form */}
      {showForm && (
        <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Báo cáo sự cố mới</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Nhập tiêu đề sự cố"
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại sự cố <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as Issue['type'] })}
                className="w-full px-4 pr-10 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22currentColor%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22%3E%3Cpolyline points=%226 9 12 15 18 9%22%3E%3C/polyline%3E%3C/svg%3E')] bg-[length:20px_20px] bg-[right_12px_center] bg-no-repeat"
                required
              >
                <option value="MAINTENANCE">Bảo trì</option>
                <option value="COMPLAINT">Khiếu nại</option>
                <option value="AUTHORITY">Cơ quan</option>
                <option value="SECURITY">An ninh</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vị trí <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Ví dụ: Tầng 3, hành lang, thang máy số 2..."
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả chi tiết <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mô tả chi tiết về sự cố..."
                rows={5}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFormData({
                    title: '',
                    description: '',
                    type: 'MAINTENANCE',
                    location: ''
                  });
                }}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? 'Đang gửi...' : 'Gửi báo cáo'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex gap-3 items-center flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tiêu đề, mô tả hoặc vị trí..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-700 whitespace-nowrap">Loại:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border-none outline-none text-sm text-gray-700 bg-transparent cursor-pointer"
          >
            <option value="All">Tất cả</option>
            <option value="MAINTENANCE">Bảo trì</option>
            <option value="COMPLAINT">Khiếu nại</option>
            <option value="AUTHORITY">Cơ quan</option>
            <option value="SECURITY">An ninh</option>
          </select>
        </div>

        <div className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-700 whitespace-nowrap">Trạng thái:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border-none outline-none text-sm text-gray-700 bg-transparent cursor-pointer"
          >
            <option value="All">Tất cả</option>
            <option value="UNPROCESSED">Chưa xử lý</option>
            <option value="PROCESSING">Đang xử lý</option>
            <option value="PROCESSED">Đã xử lý</option>
          </select>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          {showForm ? 'Đóng form' : 'Báo cáo sự cố mới'}
        </button>
      </div>

      {/* Issues List */}
      {loading && issues.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border-2 border-gray-200 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải danh sách sự cố...</p>
        </div>
      ) : filteredIssues.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border-2 border-gray-200 text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Không tìm thấy sự cố nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredIssues.map((issue) => {
            const Icon = issueTypeIcons[issue.type] || AlertCircle;
            return (
              <div
                key={issue.id}
                className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:shadow-md transition-all cursor-pointer"
                onClick={() => setSelectedIssue(issue)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        issue.type === 'MAINTENANCE' ? 'bg-blue-100' :
                        issue.type === 'COMPLAINT' ? 'bg-orange-100' :
                        issue.type === 'AUTHORITY' ? 'bg-purple-100' :
                        'bg-red-100'
                      }`}>
                        <Icon className={`w-6 h-6 ${
                          issue.type === 'MAINTENANCE' ? 'text-blue-600' :
                          issue.type === 'COMPLAINT' ? 'text-orange-600' :
                          issue.type === 'AUTHORITY' ? 'text-purple-600' :
                          'text-red-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{issue.title}</h3>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-sm text-gray-500">{issueTypeLabels[issue.type]}</span>
                          {issue.roomNumber && (
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                              <Building2 className="w-4 h-4" />
                              Phòng {issue.roomNumber}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4 line-clamp-2">{issue.description}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">{issue.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(issue.createdDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        <span>{issue.reporterName}</span>
                      </div>
                      <div>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${issueStatusColors[issue.status]}`}>
                          {getStatusIcon(issue.status)}
                          {issueStatusLabels[issue.status]}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Issue Detail Modal */}
      {selectedIssue && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedIssue(null)}
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-2xl w-full border-2 border-gray-200 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Chi tiết sự cố</h2>
              <button
                onClick={() => setSelectedIssue(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                {(() => {
                  const Icon = issueTypeIcons[selectedIssue.type] || AlertCircle;
                  return (
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      selectedIssue.type === 'MAINTENANCE' ? 'bg-blue-100' :
                      selectedIssue.type === 'COMPLAINT' ? 'bg-orange-100' :
                      selectedIssue.type === 'AUTHORITY' ? 'bg-purple-100' :
                      'bg-red-100'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        selectedIssue.type === 'MAINTENANCE' ? 'text-blue-600' :
                        selectedIssue.type === 'COMPLAINT' ? 'text-orange-600' :
                        selectedIssue.type === 'AUTHORITY' ? 'text-purple-600' :
                        'text-red-600'
                      }`} />
                    </div>
                  );
                })()}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedIssue.title}</h3>
                  <p className="text-sm text-gray-600">{issueTypeLabels[selectedIssue.type]}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <span className="text-gray-700">Trạng thái:</span>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${issueStatusColors[selectedIssue.status]}`}>
                    {getStatusIcon(selectedIssue.status)}
                    {issueStatusLabels[selectedIssue.status]}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <span className="text-gray-700">Vị trí:</span>
                  <span className="font-semibold text-gray-900">{selectedIssue.location}</span>
                </div>

                {selectedIssue.roomNumber && (
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <span className="text-gray-700">Phòng:</span>
                    <span className="font-semibold text-gray-900">Phòng {selectedIssue.roomNumber}</span>
                  </div>
                )}

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <span className="text-gray-700">Người báo cáo:</span>
                  <span className="font-semibold text-gray-900">{selectedIssue.reporterName}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <span className="text-gray-700">Ngày tạo:</span>
                  <span className="font-semibold text-gray-900">{formatDate(selectedIssue.createdDate)}</span>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Mô tả chi tiết:</h4>
                <p className="text-gray-900 whitespace-pre-wrap">{selectedIssue.description}</p>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setSelectedIssue(null)}
                className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Search, Plus, CheckCircle2, ChevronDown, Download, Search as SearchIcon, Clock, ShieldCheck } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import * as XLSX from 'xlsx';

export function AuthorityAnnouncements() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [issues, setIssues] = useState<any[]>([]);

  // 1. Hàm lấy danh sách sự cố (Chỉ lấy loại AUTHORITY)
  const fetchIssues = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/issues');
      if (!response.ok) throw new Error("Không thể tải danh sách sự cố.");
      const rawData = await response.json();

      const transformedData = rawData.map((issue: any) => ({
        id: issue.id,
        title: issue.title,
        message: issue.description,
        type: issue.type,
        rawStatus: issue.status, // ENUM gốc: UNPROCESSED, PROCESSING, PROCESSED
        roomNumber: issue.roomNumber,
        reporterName: issue.reporterName,
      }));

      // Chỉ lọc lấy các tin báo từ Cơ quan chức năng/An ninh
      setIssues(transformedData.filter((i: any) => i.type === 'AUTHORITY'));
    } catch (err: any) {
      toast.error("Lỗi: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 2. Hàm cập nhật trạng thái (Lấy từ ServiceManagement sang)
  const updateIssueStatusApi = async (issueId: string, newStatus: string) => {
    const promise = new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`http://localhost:8080/api/issues/${issueId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Lỗi cập nhật trạng thái.");
        }

        await fetchIssues(); // Load lại bảng
        resolve("Cập nhật trạng thái thành công!");
      } catch (err: any) {
        reject(err.message);
      }
    });

    toast.promise(promise, {
      loading: 'Đang cập nhật...',
      success: (data: any) => data,
      error: (err) => `Thất bại: ${err}`,
    });
  };

  useEffect(() => { fetchIssues(); }, []);

  // 4. Hàm xuất Excel
  const handleExportExcel = () => {
    try {
      const exportData = issues.map((issue) => ({
        'Người báo': issue.reporterName || '',
        'Căn hộ': issue.roomNumber || '',
        'Tiêu đề': issue.title || '',
        'Mô tả': issue.message || '',
        'Loại': issue.type || '',
        'Trạng thái': issue.rawStatus || '',
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách tin báo');
      XLSX.writeFile(workbook, 'Danh_sach_tin_bao.xlsx');
      
      toast.success("Đã xuất Excel thành công", { description: "File Danh_sach_tin_bao.xlsx đã được tải xuống" });
    } catch (error) {
      toast.error("Lỗi xuất Excel", { description: "Không thể xuất file Excel" });
    }
  };

  // 3. Logic lọc dữ liệu tại local
  const filteredAnnouncements = issues.filter(ann => {
    const matchesSearch = ann.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          ann.reporterName.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Ánh xạ logic filter UI sang ENUM API
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'not_found' && ann.rawStatus === 'UNPROCESSED') ||
                         (selectedStatus === 'in_progress' && ann.rawStatus === 'PROCESSING') ||
                         (selectedStatus === 'handled' && ann.rawStatus === 'PROCESSED');
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      {/* Header đồng bộ trang Resident */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý an ninh & Tin báo</h1>
        </div>
      </div>

      {/* Stats Cards - Màu xanh Navy & Royal Blue */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Tổng tin báo', count: issues.length, color: '#1e3a8a', icon: Bell },
          { label: 'Đang xử lý', count: issues.filter(e => e.rawStatus === 'PROCESSING').length, color: '#2563eb', icon: SearchIcon },
          { label: 'Hoàn tất', count: issues.filter(e => e.rawStatus === 'PROCESSED').length, color: '#3b82f6', icon: CheckCircle2 },
        ].map((item, idx) => (
          <div key={idx} className="flex justify-between items-center p-6 rounded-xl shadow-md h-32 relative overflow-hidden" style={{ backgroundColor: item.color }}>
            <div className="flex flex-col">
              <p className="text-4xl font-bold text-white">{item.count}</p>
              <p className="text-sm font-medium mt-1 opacity-90 text-white">{item.label}</p>
            </div>
            <item.icon className="h-12 w-12 text-white opacity-80" />
          </div>
        ))}
      </div>

      {/* Toolbar - Nhỏ gọn, màu Xanh nước biển */}
      <div className="flex items-center justify-between gap-6 w-full bg-white p-2 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <div className="relative w-1/3">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm người báo, sự vụ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-gray-50/50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-3 pr-2">
          {/* Dropdown Trạng thái (UI Inline Style cho chuyên nghiệp) */}
          <div style={{ position: 'relative', minWidth: '160px' }}>
            <label style={{ position: 'absolute', top: '-8px', left: '12px', backgroundColor: '#ffffff', padding: '0 6px', fontSize: '10px', fontWeight: '800', color: '#1e40af', zIndex: 10 }}>Trạng thái</label>
            <select 
              value={selectedStatus} 
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{ width: '100%', height: '42px', paddingLeft: '14px', border: '2px solid #dbeafe', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: '#1e3a8a', appearance: 'none', outline: 'none' }}
            >
              <option value="all">Tất cả</option>
              <option value="not_found">Chưa xử lý</option>
              <option value="in_progress">Đang xử lý</option>
              <option value="handled">Đã xử lý</option>
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none" />
          </div>

          <button 
            onClick={handleExportExcel}
            className="min-w-[180px] py-3 px-6 bg-blue-600 text-white rounded-lg text-xs font-extrabold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-[0_3px_0_0_#1e40af]"
          >
            <Download size={16} strokeWidth={3} /> Xuất Excel
          </button>
        </div>
      </div>

      {/* Table - Header nổi bật */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 border-b-2 border-slate-300 shadow-sm">
            <tr>
              <th className="px-6 py-4 text-left text-[11px] font-extrabold text-slate-700 tracking-widest">Người báo</th>
              <th className="px-6 py-4 text-left text-[11px] font-extrabold text-slate-700 tracking-widest">Căn hộ</th>
              <th className="px-6 py-4 text-left text-[11px] font-extrabold text-slate-700 tracking-widest">Sự vụ</th>
              <th className="px-6 py-4 text-left text-[11px] font-extrabold text-slate-700 tracking-widest">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan={5} className="text-center py-10 text-slate-400">Đang tải dữ liệu...</td></tr>
            ) : filteredAnnouncements.map((ann) => (
              <tr key={ann.id} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-6 py-4 font-bold text-gray-900">{ann.reporterName}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">
                    Phòng {ann.roomNumber}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600 font-medium">{ann.title}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {/* Chấm tròn đổi màu */}
                    <div className={`w-2 h-2 rounded-full ${
                      ann.rawStatus === 'PROCESSED' ? 'bg-green-500' : 
                      ann.rawStatus === 'PROCESSING' ? 'bg-blue-500' : 'bg-red-500'
                    }`}></div>
                    
                    {/* Select đổi trạng thái tại chỗ */}
                    <select
                      value={ann.rawStatus}
                      onChange={(e) => updateIssueStatusApi(ann.id, e.target.value)}
                      className={`text-sm font-bold bg-transparent border-none focus:ring-0 cursor-pointer p-0 h-auto ${
                        ann.rawStatus === 'PROCESSED' ? 'text-green-600' : 
                        ann.rawStatus === 'PROCESSING' ? 'text-blue-600' : 'text-red-600'
                      }`}
                    >
                      <option value="UNPROCESSED">UNPROCESSED</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="PROCESSED">PROCESSED</option>
                    </select>
                  </div>
                </td>
                
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
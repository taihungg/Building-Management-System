import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, X, Save, AlertCircle, Loader2, Download, Trash2, Pencil, Calendar } from 'lucide-react';
import { toast, Toaster } from 'sonner';

// Interface chuẩn theo Schema Backend chú gửi
interface UsageImportData {
  apartmentCode: string;
  buildingCode: string;
  serviceCode: string;
  oldIndex: number;
  newIndex: number;
  quantity?: number;
  hasWarning?: boolean;
  message?: string;
  valid?: boolean;
}

export function InvoiceCreation() {
  const currentDate = new Date();
  
  // States quản lý bộ lọc
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  
  // States quản lý dữ liệu và trạng thái API
  const [tableData, setTableData] = useState<UsageImportData[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. API PREVIEW: Tải file lên và hiện dữ liệu ra bảng trang chính
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    try {
      // URL truyền month, year để BE lấy chỉ số cũ đối soát
      const url = `http://localhost:8081/api/v1/accounting/usage-import/preview?month=${selectedMonth}&year=${selectedYear}`;
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error("Không thể xử lý file Excel");

      const res = await response.json();
      const data = res.data || res;
      
      setTableData(Array.isArray(data) ? data : []);
      toast.success("Tải dữ liệu thành công, vui lòng kiểm tra bảng bên dưới");
    } catch (error: any) {
      toast.error("Lỗi đọc file", { description: error.message });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // 2. CHỈNH SỬA TRỰC TIẾP TRÊN BẢNG
  const handleEditCell = (index: number, field: keyof UsageImportData, value: any) => {
    const newData = [...tableData];
    newData[index] = { ...newData[index], [field]: value };
    
    // Tự động tính lại lượng tiêu thụ khi sửa số mới hoặc số cũ
    if (field === 'newIndex' || field === 'oldIndex') {
      newData[index].quantity = (Number(newData[index].newIndex) || 0) - (Number(newData[index].oldIndex) || 0);
    }
    setTableData(newData);
  };

  const handleDeleteRow = (index: number) => {
    setTableData(tableData.filter((_, i) => i !== index));
  };

  // 3. API SAVE: Lưu toàn bộ dữ liệu đang hiện trên bảng vào Database
  const handleSaveToDB = async () => {
    if (tableData.length === 0) {
      toast.error("Chưa có dữ liệu để lưu");
      return;
    }

    // Lọc trùng nhẹ để tránh lỗi Backend
    const uniqueData = tableData.filter((item, index, self) =>
      index === self.findIndex((t) => (
        t.apartmentCode === item.apartmentCode && t.serviceCode === item.serviceCode
      ))
    );

    setIsSaving(true);
    try {
      const url = `http://localhost:8081/api/v1/accounting/usage-import/save?month=${selectedMonth}&year=${selectedYear}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(uniqueData)
      });

      if (!response.ok) throw new Error("Lỗi khi lưu vào Database");

      toast.success("Đã lưu dữ liệu vào hệ thống thành công!");
      // Sau khi lưu thành công có thể xóa bảng hoặc giữ lại tùy chú, ở đây con giữ lại để xem
    } catch (error: any) {
      toast.error("Lưu thất bại", { description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <Toaster richColors position="top-right" />
      
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dữ liệu sử dụng</h1>
      </div>

      {/* FILTER & BUTTONS */}
      <div className="flex items-center justify-between gap-4 mb-8">
      <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm px-3 py-2 transition-all hover:border-blue-400 hover:shadow-md">
          <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0 mr-2" />
          
          {/* Select MONTH - Bắt buộc chọn */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="text-sm font-medium text-gray-700 bg-transparent border-none focus:ring-0 cursor-pointer outline-none appearance-none pr-6"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236b7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0 center', backgroundSize: '16px' }}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
              <option key={month} value={month}>Tháng {month}</option>
            ))}
          </select>
          
          {/* Divider */}
          <div className="w-px h-4 bg-gray-300 mx-2"></div>
          
          {/* Select YEAR */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="text-sm font-medium text-gray-700 bg-transparent border-none focus:ring-0 cursor-pointer outline-none appearance-none pr-6"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236b7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0 center', backgroundSize: '16px' }}
          >
            {[currentDate.getFullYear() - 1, currentDate.getFullYear(), currentDate.getFullYear() + 1].map(year => (
              <option key={year} value={year}>Năm {year}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-3">
          <input ref={fileInputRef} type="file" hidden accept=".xlsx,.xls" onChange={handleFileUpload} />
          
          <button className="h-12 flex items-center gap-2 px-4 py-2 rounded-xl font-medium border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-all">
            <Download className="w-4 h-4" />
            <span>Tải xuống mẫu</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="h-12 flex items-center gap-2 px-6 rounded-xl font-semibold bg-white border-2 border-purple-600 text-purple-600 hover:bg-purple-50 shadow-sm transition-all"
          >
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span>Tải lên Excel</span>
          </button>

          <button
            onClick={handleSaveToDB}
            disabled={isSaving || tableData.length === 0}
            className="h-12 flex items-center gap-2 px-6 rounded-xl font-semibold bg-purple-600 text-white hover:bg-purple-700 shadow-sm transition-all disabled:opacity-50 disabled:bg-gray-300"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Lưu vào hệ thống</span>
          </button>
        </div>
      </div>

      {/* BẢNG DỮ LIỆU CHÍNH TRÊN TRANG */}
      {tableData.length > 0 ? (
        <div className="bg-white border border-gray-200 rounded-[32px] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Căn hộ</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Dịch vụ</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Chỉ số cũ</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Chỉ số mới</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Sử dụng</th>
                  <th className="p-5 w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tableData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-purple-50/20 transition-colors group">
                    <td className="p-4 font-bold text-gray-700">
                      <input 
                        value={row.apartmentCode}
                        onChange={(e) => handleEditCell(idx, 'apartmentCode', e.target.value)}
                        className="w-full bg-transparent border-none focus:ring-0 p-0 font-bold"
                      />
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black ${row.serviceCode === 'ELECTRICITY' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                        {row.serviceCode === 'ELECTRICITY' ? '⚡ ĐIỆN' : '💧 NƯỚC'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <input 
                        type="number"
                        value={row.oldIndex}
                        onChange={(e) => handleEditCell(idx, 'oldIndex', Number(e.target.value))}
                        className="w-full bg-transparent border-none text-right text-gray-400 focus:ring-0 p-0"
                      />
                    </td>
                    <td className="p-4 text-right font-black">
                      <input 
                        type="number"
                        value={row.newIndex}
                        onChange={(e) => handleEditCell(idx, 'newIndex', Number(e.target.value))}
                        className={`w-full bg-transparent border-none text-right font-black focus:ring-0 p-0 ${row.newIndex < row.oldIndex ? 'text-red-500' : 'text-gray-900'}`}
                      />
                    </td>
                    <td className="p-4 text-right font-bold text-purple-600">
                      {row.quantity}
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleDeleteRow(idx)}
                        className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 bg-gray-50 border-2 border-dashed border-gray-200 rounded-[32px]">
          <FileSpreadsheet size={64} className="text-gray-200 mb-4" />
          <p className="text-gray-400 font-medium italic">Chưa có dữ liệu. Vui lòng chọn kỳ và tải file Excel lên để bắt đầu.</p>
        </div>
      )}
    </div>
  );
}
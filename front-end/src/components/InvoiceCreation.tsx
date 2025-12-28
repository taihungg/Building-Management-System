import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, X, Save, AlertCircle, Loader2, Download, Trash2, Pencil, Calendar, Receipt, Database } from 'lucide-react';
import { toast, Toaster } from 'sonner';

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
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [tableData, setTableData] = useState<UsageImportData[]>([]);
  
  // --- STATE QUẢN LÝ POPUP LOADING ---
  const [isUploading, setIsUploading] = useState(false); // Cho khâu tải Excel
  const [isSaving, setIsSaving] = useState(false);       // Cho khâu Lưu vào DB
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. API PREVIEW: Tải file lên -> Hiện Popup Loading
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true); // Mở Popup Loading Excel
    try {
      const url = `http://localhost:8081/api/v1/accounting/usage-import/preview?month=${selectedMonth}&year=${selectedYear}`;
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error("Không thể xử lý file Excel");

      const res = await response.json();
      const data = res.data || res;
      
      setTableData(Array.isArray(data) ? data : []);
      toast.success("Tải dữ liệu thành công, chú có thể sửa trực tiếp trên bảng");
    } catch (error: any) {
      toast.error("Lỗi đọc file", { description: error.message });
    } finally {
      setIsUploading(false); // Đóng Popup
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // 2. API SAVE: Lưu vào DB -> Hiện Popup Loading
  const handleSaveToDB = async () => {
    if (tableData.length === 0) return;

    const uniqueData = tableData.filter((item, index, self) =>
      index === self.findIndex((t) => (
        t.apartmentCode === item.apartmentCode && t.serviceCode === item.serviceCode
      ))
    );

    setIsSaving(true); // Mở Popup Loading Database
    try {
      const url = `http://localhost:8081/api/v1/accounting/usage-import/save?month=${selectedMonth}&year=${selectedYear}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(uniqueData)
      });

      if (!response.ok) throw new Error("Lỗi khi lưu vào Database");

      toast.success("Đã lưu dữ liệu vào hệ thống thành công!");
      setTableData([]); 

    } catch (error: any) {
      toast.error("Lưu thất bại", { description: error.message });
    } finally {
      setIsSaving(false); // Đóng Popup
    }
  };

  const handleEditCell = (index: number, field: keyof UsageImportData, value: any) => {
    const newData = [...tableData];
    newData[index] = { ...newData[index], [field]: value };
    if (field === 'newIndex' || field === 'oldIndex') {
      newData[index].quantity = (Number(newData[index].newIndex) || 0) - (Number(newData[index].oldIndex) || 0);
    }
    setTableData(newData);
  };

  const handleDeleteRow = (index: number) => {
    setTableData(tableData.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 p-6 relative">
      <Toaster richColors position="top-right" />

      {/* --- POPUP LOADING KHI UPLOAD EXCEL --- */}
      {isUploading && (
       <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
       <div className="bg-white p-8 rounded-[32px] shadow-2xl flex flex-col items-center gap-4 max-w-sm w-full mx-4 border border-purple-100">
         <div className="relative">
           {/* VÒNG TRÒN XOAY DÙNG INLINE CSS */}
           <div 
             style={{
               width: '64px',       // tương đương w-16
               height: '64px',      // tương đương h-16
               border: '4px solid #f5f3ff',   // tương đương border-purple-50
               borderTop: '4px solid #7c3aed', // tương đương border-t-purple-600
               borderRadius: '50%',
               animation: 'spin 1s linear infinite'
             }}
           ></div>
           
           {/* Icon nằm giữa */}
           <FileSpreadsheet 
             className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-purple-600 w-6 h-6" 
           />
         </div>
     
         <div className="text-center">
           <h3 className="text-xl font-bold text-gray-900">Đang đọc file Excel</h3>
           <p className="text-gray-500 text-sm mt-1">Hệ thống đang trích xuất dữ liệu căn hộ, vui lòng đợi...</p>
         </div>
     
         {/* NHÚNG CSS QUAY VÀO ĐÂY */}
         <style>{`
           @keyframes spin {
             0% { transform: rotate(0deg); }
             100% { transform: rotate(360deg); }
           }
         `}</style>
       </div>
     </div>
      )}

      {/* --- POPUP LOADING KHI LƯU VÀO DATABASE --- */}
      {isSaving && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
        <div className="bg-white p-8 rounded-[32px] shadow-2xl flex flex-col items-center gap-4 max-w-sm w-full mx-4 border border-indigo-100">
          <div className="relative">
            {/* VÒNG TRÒN XOAY DÙNG INLINE CSS */}
            <div 
              style={{
                width: '64px',
                height: '64px',
                border: '4px solid #eef2ff',   // tương đương border-indigo-50
                borderTop: '4px solid #4f46e5', // tương đương border-t-indigo-600
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}
            ></div>
            
            {/* Icon Database nằm giữa */}
            <Database className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600 w-6 h-6" />
          </div>
      
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900">Đang lưu hệ thống</h3>
            <p className="text-gray-500 text-sm mt-1">
              Đang ghi dữ liệu sử dụng vào cơ sở dữ liệu. Không tắt trình duyệt lúc này!
            </p>
          </div>
      
          {/* PHẦN ĐỊNH NGHĨA KEYFRAMES (Chỉ cần khai báo 1 lần trong file) */}
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
      )}
      
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dữ liệu sử dụng</h1>
      </div>

      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm px-3 py-2 transition-all hover:border-blue-400">
          <Calendar className="w-4 h-4 text-gray-500 mr-2" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="text-sm font-medium text-gray-700 bg-transparent border-none focus:ring-0 outline-none"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i+1} value={i+1}>Tháng {i+1}</option>
            ))}
          </select>
          <div className="w-px h-4 bg-gray-300 mx-2"></div>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="text-sm font-medium text-gray-700 bg-transparent border-none focus:ring-0 outline-none"
          >
            {[2024, 2025, 2026].map(year => (
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
            disabled={isUploading || isSaving}
            className="h-12 flex items-center gap-2 px-6 rounded-xl font-semibold bg-white border-2 border-purple-600 text-purple-600 hover:bg-purple-50 shadow-sm transition-all disabled:opacity-50"
          >
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span>Tải lên Excel</span>
          </button>

          {tableData.length > 0 && (
            <button
              onClick={handleSaveToDB}
              disabled={isSaving}
              className="h-12 flex items-center gap-2 px-6 rounded-xl font-semibold bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-200 transition-all animate-in fade-in zoom-in duration-300"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Lưu vào hệ thống</span>
            </button>
          )}
        </div>
      </div>

      {tableData.length > 0 ? (
        <div className="bg-white border border-gray-200 rounded-[32px] overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                        {row.serviceCode === 'ELECTRICITY' ? 'ĐIỆN' : 'NƯỚC'}
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
                    <td className="p-4 text-right font-bold text-purple-600">{row.quantity}</td>
                    <td className="p-4 text-center">
                      <button onClick={() => handleDeleteRow(idx)} className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
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
          <p className="text-gray-400 font-medium italic">Vui lòng tải file Excel lên để nhập dữ liệu cho Tháng {selectedMonth}/{selectedYear}</p>
        </div>
      )}
    </div>
  );
}
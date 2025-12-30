import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, X, Save, AlertCircle, Loader2, Download, Trash2, Pencil, Calendar, Receipt, Database, Search } from 'lucide-react';
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
  id?: string; // ID từ database nếu có
}

export function InvoiceCreation() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [tableData, setTableData] = useState<UsageImportData[]>([]);
  
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const BASE_URL = 'https://untoasted-jean-unsympathisingly.ngrok-free.dev';

  // --- HÀM LẤY DỮ LIỆU ĐÃ CÓ TRÊN HỆ THỐNG ---
  const fetchExistingData = useCallback(async () => {
    setIsLoading(true);
    try {
      const url = `${BASE_URL}/api/v1/accounting/usage-import/usage-records?month=${selectedMonth}&year=${selectedYear}`;
      const response = await fetch(url, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });

      if (!response.ok) throw new Error("Không thể tải dữ liệu cũ");

      const res = await response.json();
      const rawData = res.data || [];

      // Ánh xạ dữ liệu từ API về cấu trúc của bảng
      const mappedData = rawData.map((item: any) => ({
        id: item.id,
        apartmentCode: item.apartmentLabel || item.apartmentCode,
        serviceCode: item.serviceName?.includes("Điện") ? "ELECTRICITY" : "WATER",
        oldIndex: item.oldIndex,
        newIndex: item.newIndex,
        quantity: item.quantity,
        buildingCode: item.buildingCode || "N/A"
      }));

      setTableData(mappedData);
    } catch (error: any) {
      console.error("Lỗi fetch:", error);
      setTableData([]); // Nếu lỗi hoặc chưa có thì để trống
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  // Tự động tải dữ liệu khi đổi Tháng/Năm
  useEffect(() => {
    fetchExistingData();
  }, [fetchExistingData]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    try {
      const url = `${BASE_URL}/api/v1/accounting/usage-import/preview?month=${selectedMonth}&year=${selectedYear}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'ngrok-skip-browser-warning': 'true' },
        body: formData,
      });

      if (!response.ok) throw new Error("Không thể xử lý file Excel");

      const res = await response.json();
      const data = res.data || res;
      
      setTableData(Array.isArray(data) ? data : []);
      toast.success("Tải dữ liệu từ Excel thành công!");
    } catch (error: any) {
      toast.error("Lỗi đọc file", { description: error.message });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveToDB = async () => {
    if (tableData.length === 0) return;
  
    setIsSaving(true);
    try {
      const url = `${BASE_URL}/api/v1/accounting/usage-import/save?month=${selectedMonth}&year=${selectedYear}`;
      
      // Đảm bảo lấy đúng những gì chú vừa SỬA trên bảng
      const dataToSave = tableData.map(item => ({
        ...item,
        oldIndex: Number(item.oldIndex),
        newIndex: Number(item.newIndex),
        quantity: Number(item.newIndex) - Number(item.oldIndex),
        month: selectedMonth,
        year: selectedYear,
        apartmentLabel: item.apartmentCode,
        // Đảm bảo tên dịch vụ đúng để Backend map vào Database
        serviceName: item.serviceCode === 'ELECTRICITY' ? 'Điện sinh hoạt' : 'Nước sinh hoạt'
      }));
  
      const response = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'ngrok-skip-browser-warning': 'true' 
        },
        body: JSON.stringify(dataToSave)
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Lỗi khi lưu");
      }
  
      toast.success(`Đã lưu thành công dữ liệu Tháng ${selectedMonth}`);
  
      // MẸO Ở ĐÂY: Đợi 500ms để Database kịp "thở" rồi mới fetch lại
      setTimeout(async () => {
        await fetchExistingData();
      }, 500);
  
    } catch (error: any) {
      toast.error("Lưu thất bại", { description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

const handleEditCell = (index: number, field: keyof UsageImportData, value: any) => {
  const newData = [...tableData];
  // Chuyển giá trị về số nếu là các ô chỉ số
  const val = (field === 'newIndex' || field === 'oldIndex') ? Number(value) : value;
  
  newData[index] = { ...newData[index], [field]: val };
  
  // Tính toán lại Quantity ngay lập tức khi chú gõ
  if (field === 'newIndex' || field === 'oldIndex') {
      newData[index].quantity = Number(newData[index].newIndex) - Number(newData[index].oldIndex);
  }
  setTableData(newData);
};

  const handleDeleteRow = (index: number) => {
    setTableData(tableData.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 p-6 relative">
      <Toaster richColors position="top-right" />

      {/* Overlay Loading khi chuyển tháng/năm */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-[32px]">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      )}

      {/* Popups Loading (Giữ nguyên giao diện đẹp của chú) */}
      {(isUploading || isSaving) && (
          <div style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              display: 'flex',
              itemsCenter: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center'
          }}>
              <div style={{
                  backgroundColor: '#ffffff',
                  padding: '32px',
                  borderRadius: '32px',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '16px',
                  border: '1px solid #f5f3ff',
                  width: '280px'
              }}>
                  <div style={{ position: 'relative', width: '64px', height: '64px' }}>
                      {/* VÒNG QUAY INLINE CSS */}
                      <div style={{
                          width: '64px',
                          height: '64px',
                          border: '5px solid #f5f3ff',
                          borderTop: `5px solid ${isUploading ? '#7c3aed' : '#4f46e5'}`,
                          borderRadius: '50%',
                          animation: 'spin-loading 1s linear infinite'
                      }}></div>
                      
                      {/* ICON Ở GIỮA */}
                      <div style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                      }}>
                          {isUploading ? 
                              <FileSpreadsheet style={{ color: '#7c3aed', width: '24px', height: '24px' }} /> : 
                              <Database style={{ color: '#4f46e5', width: '24px', height: '24px' }} />
                          }
                      </div>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                          {isUploading ? "Đang đọc Excel" : "Đang lưu hệ thống"}
                      </h3>
                      <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px', margin: 0 }}>
                          Vui lòng đợi trong giây lát...
                      </p>
                  </div>

                  {/* ĐỊNH NGHĨA KEYFRAMES TRỰC TIẾP */}
                  <style>{`
                      @keyframes spin-loading {
                          from { transform: rotate(0deg); }
                          to { transform: rotate(360deg); }
                      }
                  `}</style>
              </div>
          </div>
      )}
      
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dữ liệu sử dụng</h1>
        {tableData.length > 0 && (
            <span className="text-sm font-medium text-gray-400 bg-gray-100 px-4 py-1.5 rounded-full">
                {tableData.length} bản ghi
            </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center bg-white border border-gray-200 rounded-xl shadow-sm px-3 py-2 transition-all hover:border-purple-400">
          <Calendar className="w-4 h-4 text-gray-500 mr-2" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="text-sm font-bold text-gray-700 bg-transparent border-none focus:ring-0 outline-none"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i+1} value={i+1}>Tháng {i+1}</option>
            ))}
          </select>
          <div className="w-px h-4 bg-gray-300 mx-2"></div>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="text-sm font-bold text-gray-700 bg-transparent border-none focus:ring-0 outline-none"
          >
            {[2024, 2025, 2026].map(year => (
              <option key={year} value={year}>Năm {year}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <input ref={fileInputRef} type="file" hidden accept=".xlsx,.xls" onChange={handleFileUpload} />
          
          <button className="h-12 flex items-center gap-2 px-4 py-2 rounded-xl font-medium border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-all">
            <Download className="w-4 h-4" />
            <span>Mẫu Excel</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isSaving}
            className="h-12 flex items-center gap-2 px-6 rounded-xl font-bold bg-white border-2 border-purple-600 text-purple-600 hover:bg-purple-50 transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Tải lên</span>
          </button>

          {tableData.length > 0 && (
            <button
              onClick={handleSaveToDB}
              disabled={isSaving}
              className="h-12 flex items-center gap-2 px-6 rounded-xl font-bold bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-200 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Lưu hệ thống</span>
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
                    <td className="p-4">
                      <input 
                        value={row.apartmentCode}
                        onChange={(e) => handleEditCell(idx, 'apartmentCode', e.target.value)}
                        className="w-full bg-transparent border-none focus:ring-0 p-0 font-bold text-gray-700"
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
                    <td className="p-4 text-right">
                      <input 
                        type="number"
                        value={row.newIndex}
                        onChange={(e) => handleEditCell(idx, 'newIndex', Number(e.target.value))}
                        className={`w-full bg-transparent border-none text-right font-black focus:ring-0 p-0 ${row.newIndex < (row.oldIndex || 0) ? 'text-red-500' : 'text-gray-900'}`}
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
          <Search size={64} className="text-gray-200 mb-4" />
          <p className="text-gray-400 font-medium italic text-center">
            Chưa có dữ liệu sử dụng cho Tháng {selectedMonth}/{selectedYear}.<br/>
            Bạn có thể tải file Excel lên hoặc chuyển sang tháng khác.
          </p>
        </div>
      )}
    </div>
  );
}
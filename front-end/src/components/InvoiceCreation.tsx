import React, { useState, useRef, useMemo } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, X, Save, Receipt, AlertCircle, Loader2, Download, FileText, Home, Zap, Droplet, Clock } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

// Interface cho dữ liệu từ Excel
interface UsageData {
  apartmentNumber: string;
  residentName?: string;
  electricity?: number;
  water?: number;
  otherServices?: number;
  [key: string]: any; // Cho phép các cột khác
}

export function InvoiceCreation() {
  // State cho upload Excel
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedData, setUploadedData] = useState<UsageData[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State cho Data Preview Table
  const [tableData, setTableData] = useState<any[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false);

  // State cho Save action
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  // State cho Custom Toast Notification
  const [showToast, setShowToast] = useState(false);


  // Hàm trigger file input khi click vào button
  const handleUploadClick = () => {
    if (fileInputRef.current && !isUploading) {
      fileInputRef.current.click();
    }
  };

  // Hàm xử lý upload Excel
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Kiểm tra định dạng file
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      toast.error("Định dạng file không hợp lệ", { description: "Vui lòng chọn file Excel (.xlsx hoặc .xls)" });
      return;
    }

    setIsUploading(true);
    setUploadedFile(file);

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Lấy sheet đầu tiên
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Chuyển đổi sang JSON
          const jsonData = XLSX.utils.sheet_to_json<UsageData>(worksheet);
          
          if (jsonData.length === 0) {
            toast.error("File Excel trống", { description: "Vui lòng kiểm tra lại file của bạn" });
            setUploadedFile(null);
            setTableData([]);
            setIsDataLoaded(false);
            return;
          }

          // Set data for preview table
          setTableData(jsonData);
          setIsDataLoaded(true);
          
          // Keep uploadedData for backward compatibility
          setUploadedData(jsonData);
          setIsSaved(false);
          toast.success("Upload thành công", { description: `Đã tải lên ${jsonData.length} dòng dữ liệu` });
        } catch (error) {
          console.error("Lỗi đọc file Excel:", error);
          toast.error("Lỗi đọc file", { description: "Không thể đọc file Excel. Vui lòng kiểm tra lại định dạng." });
          setUploadedFile(null);
          setTableData([]);
          setIsDataLoaded(false);
        } finally {
          setIsUploading(false);
        }
      };

      reader.onerror = () => {
        toast.error("Lỗi đọc file", { description: "Không thể đọc file. Vui lòng thử lại." });
        setIsUploading(false);
        setUploadedFile(null);
        setTableData([]);
        setIsDataLoaded(false);
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Lỗi upload file:", error);
      toast.error("Lỗi upload", { description: "Đã xảy ra lỗi khi upload file." });
      setIsUploading(false);
      setUploadedFile(null);
      setTableData([]);
      setIsDataLoaded(false);
    }
  };

  // Hàm xuất dữ liệu (Export Data / Download Template)
  const handleDownloadTemplate = () => {
    // Kiểm tra nếu có dữ liệu trong table, export dữ liệu thực tế
    if (tableData && tableData.length > 0) {
      try {
        // Tạo worksheet từ dữ liệu hiện tại
        const worksheet = XLSX.utils.json_to_sheet(tableData);
        
        // Tạo workbook và thêm worksheet
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Dữ liệu sử dụng');
        
        // Xuất file Excel
        XLSX.writeFile(workbook, 'Du_lieu_su_dung_export.xlsx');
        
        toast.success("Đã xuất dữ liệu", { description: "File Du_lieu_su_dung_export.xlsx đã được tải xuống" });
      } catch (error) {
        console.error("Lỗi xuất dữ liệu:", error);
        toast.error("Lỗi xuất dữ liệu", { description: "Không thể xuất file. Vui lòng thử lại." });
      }
      return;
    }

    // Nếu không có dữ liệu, tải template mẫu (fallback)
    const headers = [
      'STT',
      'Số phòng',
      'Tên tòa nhà',
      'Tháng',
      'Năm',
      'Chỉ số điện cũ',
      'Chỉ số điện mới',
      'Chỉ số nước cũ',
      'Chỉ số nước mới',
      'Ghi chú'
    ];

    // Tạo dữ liệu mẫu (3 dòng ví dụ)
    const sampleData = [
      ['1', '101', 'Tòa A', '12', '2024', '100', '150', '50', '75', ''],
      ['2', '102', 'Tòa A', '12', '2024', '200', '250', '100', '125', ''],
      ['3', '201', 'Tòa B', '12', '2024', '150', '200', '80', '100', '']
    ];

    // Kết hợp headers và data
    const csvContent = [
      headers.join(','),
      ...sampleData.map(row => row.join(','))
    ].join('\n');

    // Tạo Blob với BOM để Excel hiển thị tiếng Việt đúng
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

    // Tạo link download
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_mau.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Đã tải mẫu data", { description: "File template_mau.csv đã được tải xuống" });
  };

  // Hàm lưu dữ liệu (Mock Save Logic)
  const handleSave = async () => {
    if (!isDataLoaded || tableData.length === 0) {
      toast.error("Vui lòng upload file trước", { description: "Chưa có dữ liệu để lưu" });
      return;
    }

    if (isSaved) {
      toast.info("Dữ liệu đã được lưu", { description: "Dữ liệu này đã được lưu trước đó" });
      return;
    }

    setIsSaving(true);
    
    try {
      // Mock save - Log to console to simulate API call
      console.log('Saving data to Database:', tableData);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));

      setIsSaved(true);
      // Show custom toast notification
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    } catch (error) {
      console.error("Lỗi lưu dữ liệu:", error);
      toast.error("Lỗi lưu dữ liệu", { description: "Không thể lưu dữ liệu. Vui lòng thử lại." });
    } finally {
      setIsSaving(false);
    }
  };


  // Lấy tên các cột từ dữ liệu
  const getColumns = (): string[] => {
    if (uploadedData.length === 0) return [];
    return Object.keys(uploadedData[0]);
  };

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined || amount === null) return '-';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Calculate summary statistics from tableData
  const summaryStats = useMemo(() => {
    if (tableData.length === 0) {
      return {
        totalRooms: 0,
        totalElectricity: 0,
        totalWater: 0,
        status: 'Chờ duyệt'
      };
    }

    // Calculate total rooms (unique apartment numbers or row count)
    const totalRooms = new Set(
      tableData.map(row => {
        // Try different possible column names for apartment/room
        return row['Số phòng'] || row['Phòng'] || row['Căn hộ'] || row['apartmentNumber'] || row['roomNumber'] || '';
      }).filter(Boolean)
    ).size || tableData.length;

    // Calculate total electricity consumption
    // Tổng điện tiêu thụ = tổng của tất cả các hiệu (mới - cũ) cho từng dòng
    let totalElectricity = 0;
    tableData.forEach(row => {
      const electricityNew = row['Chỉ số điện mới'] || row['Điện mới'] || row['Điện cuối'] ||
                             row['electricityNew'] || row['electricity'] || 0;
      const electricityOld = row['Chỉ số điện cũ'] || row['Điện cũ'] || row['Điện đầu'] ||
                             row['electricityOld'] || 0;
      // Tính hiệu (mới - cũ) cho từng dòng
      const consumption = Number(electricityNew) - Number(electricityOld);
      // Cộng vào tổng nếu giá trị hợp lệ
      if (!isNaN(consumption) && consumption >= 0) {
        totalElectricity += consumption;
      }
    });

    // Calculate total water consumption
    // Look for columns like 'Chỉ số nước mới', 'Nước mới', 'waterNew', etc.
    // and subtract 'Chỉ số nước cũ', 'Nước cũ', 'waterOld', etc.
    let totalWater = 0;
    tableData.forEach(row => {
      const waterNew = row['Chỉ số nước mới'] || row['Nước mới'] || row['waterNew'] || row['water'] || 0;
      const waterOld = row['Chỉ số nước cũ'] || row['Nước cũ'] || row['waterOld'] || row['waterOld'] || 0;
      const consumption = Number(waterNew) - Number(waterOld);
      if (!isNaN(consumption) && consumption > 0) {
        totalWater += consumption;
      }
    });

    return {
      totalRooms,
      totalElectricity,
      totalWater,
      status: isSaved ? 'Đã lưu' : 'Chờ lưu'
    };
  }, [tableData, isSaved]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dữ liệu sử dụng</h1>
        </div>
      </div>

      {/* Summary Statistics Section */}
      <div className="grid grid-cols-4 gap-4">
        {/* Card 1: Tổng số phòng - Navy theme */}
        <div 
          className="h-32 rounded-2xl p-6 shadow-md relative overflow-hidden"
          style={{ backgroundColor: '#1e293b' }}
        >
          {/* Watermark Icon */}
          <Home 
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 opacity-20"
            style={{ color: 'white' }}
          />
          
          {/* Content - Perfectly vertically centered */}
          <div className="relative z-10 h-full flex flex-col justify-center gap-1 pr-16">
            <p className="text-sm font-medium tracking-wide text-white opacity-90">
              Tổng số phòng
            </p>
            <p className="text-4xl font-extrabold text-white">
              {summaryStats.totalRooms > 0 ? summaryStats.totalRooms : '-'}
            </p>
          </div>
        </div>

        {/* Card 2: Tổng điện tiêu thụ - Amber theme */}
        <div 
          className="h-32 rounded-2xl p-6 shadow-md relative overflow-hidden"
          style={{ backgroundColor: '#d97706' }}
        >
          {/* Watermark Icon */}
          <Zap 
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 opacity-20"
            style={{ color: 'white' }}
          />
          
          {/* Content - Perfectly vertically centered */}
          <div className="relative z-10 h-full flex flex-col justify-center gap-1 pr-16">
            <p className="text-sm font-medium tracking-wide text-white opacity-90">
              Tổng điện tiêu thụ
            </p>
            <p className="text-4xl font-extrabold text-white">
              {summaryStats.totalElectricity > 0 ? summaryStats.totalElectricity.toLocaleString('vi-VN') : '-'}
            </p>
          </div>
        </div>

        {/* Card 3: Tổng nước tiêu thụ - Blue theme */}
        <div 
          className="h-32 rounded-2xl p-6 shadow-md relative overflow-hidden"
          style={{ backgroundColor: '#2563eb' }}
        >
          {/* Watermark Icon */}
          <Droplet 
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 opacity-20"
            style={{ color: 'white' }}
          />
          
          {/* Content - Perfectly vertically centered */}
          <div className="relative z-10 h-full flex flex-col justify-center gap-1 pr-16">
            <p className="text-sm font-medium tracking-wide text-white opacity-90">
              Tổng nước tiêu thụ
            </p>
            <p className="text-4xl font-extrabold text-white">
              {summaryStats.totalWater > 0 ? summaryStats.totalWater.toLocaleString('vi-VN') : '-'}
            </p>
          </div>
        </div>

        {/* Card 4: Trạng thái - Green theme */}
        <div 
          className="h-32 rounded-2xl p-6 shadow-md relative overflow-hidden"
          style={{ backgroundColor: '#059669' }}
        >
          {/* Watermark Icon */}
          <Clock 
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 opacity-20"
            style={{ color: 'white' }}
          />
          
          {/* Content - Perfectly vertically centered */}
          <div className="relative z-10 h-full flex flex-col justify-center gap-1 pr-16">
            <p className="text-sm font-medium tracking-wide text-white opacity-90">
              Trạng thái
            </p>
            <p className="text-4xl font-extrabold text-white">
              {summaryStats.status}
            </p>
          </div>
        </div>
      </div>

      {/* Card chính - Upload và Actions */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-md">
        {/* Header with Action Buttons */}
        <div className="flex items-center justify-between mb-6">
          {/* Left: Title */}
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-gray-900">Quản lý dữ liệu sử dụng</h2>
            {isSaved && (
              <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold flex items-center gap-2 shadow-sm">
                <CheckCircle2 className="w-4 h-4" />
                Đã lưu
              </span>
            )}
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Hidden file input - Completely hidden */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
              style={{ display: 'none' }}
              disabled={isUploading}
            />

            {/* Tải xuống mẫu Button */}
            <button
              onClick={handleDownloadTemplate}
              className="h-10 flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all active:scale-95 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
            >
              <Download className="w-4 h-4" />
              <span>Tải xuống mẫu</span>
            </button>

            {/* Upload Excel Button - Primary */}
            <button
              onClick={handleUploadClick}
              disabled={isUploading}
              className={`h-10 flex items-center gap-2 px-6 rounded-lg font-bold transition-all shadow-sm active:scale-95 ${
                isUploading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700 hover:shadow-md'
              }`}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang tải...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Tải lên</span>
                </>
              )}
            </button>

            {/* Lưu Button - Save Action */}
            <button
              onClick={handleSave}
              disabled={!isDataLoaded || isUploading || isSaved}
              className={`h-10 flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all shadow-sm active:scale-95 ${
                !isDataLoaded || isUploading || isSaved
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : isSaved ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Đã lưu</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Lưu</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Data Preview Table Section - Only render when data exists */}
        {tableData.length > 0 && (
          <div className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-fade-slide-up">
            <div 
              className="overflow-x-auto overflow-y-auto max-h-[500px]"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#cbd5e1 transparent'
              }}
            >
              <style>{`
                div::-webkit-scrollbar {
                  width: 8px;
                  height: 8px;
                }
                div::-webkit-scrollbar-track {
                  background: transparent;
                }
                div::-webkit-scrollbar-thumb {
                  background-color: #cbd5e1;
                  border-radius: 9999px;
                }
                div::-webkit-scrollbar-thumb:hover {
                  background-color: #9ca3af;
                }
              `}</style>
              <table className="w-full border-collapse">
                <thead className="bg-slate-100 sticky top-0 z-10">
                  <tr>
                    {Object.keys(tableData[0]).map((col, idx) => (
                      <th
                        key={idx}
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-700 tracking-wider border-b border-gray-200 bg-slate-100"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tableData.map((row, rowIdx) => (
                    <tr key={rowIdx} className="hover:bg-blue-50 cursor-pointer transition-colors duration-200">
                      {Object.keys(tableData[0]).map((col, colIdx) => {
                        const value = row[col];
                        const isNumber = typeof value === 'number';
                        const colLower = col.toLowerCase();
                        const isCurrencyField = colLower.includes('amount') || 
                                                colLower.includes('tiền') || 
                                                colLower.includes('cost') || 
                                                colLower.includes('price');
                        return (
                          <td
                            key={colIdx}
                            className="px-4 py-3 text-sm text-gray-900 border-b border-gray-100"
                          >
                            {isNumber && isCurrencyField ? formatCurrency(value) : value}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Custom Toast Notification */}
      {showToast && (
        <div
          className="fixed top-4 right-4 z-50 bg-white shadow-lg rounded-lg border-l-4 border-green-500 p-4 flex items-center gap-3 min-w-[300px]"
          style={{
            animation: 'slideInRight 0.3s ease-out, fadeOut 0.3s ease-in 2.7s forwards'
          }}
        >
          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
          <p className="text-sm font-medium text-gray-900">Lưu dữ liệu sử dụng thành công!</p>
        </div>
      )}

      {/* Toast Animation Styles */}
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes fadeOut {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(100%);
          }
        }
        
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-slide-up {
          animation: fadeSlideUp 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}

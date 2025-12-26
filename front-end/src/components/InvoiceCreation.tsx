import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, X, Save, Receipt, AlertCircle, Loader2, Download, FileText, Calendar, ChevronDown, Plus } from 'lucide-react';
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
  const currentDate = new Date();
  
  // State cho bộ lọc (Bắt buộc phải chọn trước khi hiển thị dữ liệu)
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [isCheckingData, setIsCheckingData] = useState(false);
  const [hasDataInDB, setHasDataInDB] = useState<boolean | null>(null);
  const [dbData, setDbData] = useState<any[]>([]);

  // State cho upload Excel
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedData, setUploadedData] = useState<UsageData[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State cho Data Preview Table (lưu tất cả dữ liệu đã upload, không lưu vào localStorage)
  const [allUploadedData, setAllUploadedData] = useState<any[]>([]); // Lưu tất cả dữ liệu đã upload
  const [tableData, setTableData] = useState<any[]>([]); // Dữ liệu hiện tại sau khi filter
  const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false);
  const [editingCell, setEditingCell] = useState<{ row: number; col: string } | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');

  // State cho Save action
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  // State cho Custom Toast Notification
  const [showToast, setShowToast] = useState(false);

  // Kiểm tra dữ liệu trong database dựa trên bộ lọc (cần tháng, năm và loại dịch vụ)
  const checkDataInDB = async () => {
    if (!selectedMonth || !selectedYear) {
      setHasDataInDB(null);
      setDbData([]);
      return;
    }

    setIsCheckingData(true);
    try {
      // Gọi API để check data
      const response = await fetch(
        `http://localhost:8081/api/v1/accounting/usage-data?year=${selectedYear}&month=${selectedMonth}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const res = await response.json();
      const data = res.data || [];
      
      console.log('checkDataInDB - data from API:', data.length);
      
      if (data.length > 0) {
        const hasDataInDatabase = true;
        
        console.log('checkDataInDB - hasDataInDatabase:', hasDataInDatabase);
        
        setHasDataInDB(true); // Có dữ liệu trong DB
        setDbData(data);
        setTableData(data);
        setIsDataLoaded(true);
        setIsSaved(true); // Đánh dấu là đã lưu vì có trong DB
        
        console.log('checkDataInDB - Setting isSaved to:', true);
        console.log('checkDataInDB - Setting hasDataInDB to:', true);
        
        // Cập nhật allUploadedData để filteredTableData có thể filter
        if (data.length > 0) {
          setAllUploadedData(prev => {
            // Merge với dữ liệu hiện có, tránh trùng lặp
            const existingIds = new Set(prev.map((row: any) => 
              `${row['Căn hộ'] || ''}_${row['Tháng'] || ''}_${row['Năm'] || ''}_${row['Mã dịch vụ'] || ''}`
            ));
            const newData = data.filter((row: any) => {
              const id = `${row['Căn hộ'] || ''}_${row['Tháng'] || ''}_${row['Năm'] || ''}_${row['Mã dịch vụ'] || ''}`;
              return !existingIds.has(id);
            });
            return [...prev, ...newData];
          });
        } else if (tempData.length > 0) {
          // Nếu chỉ có temp data, cũng cập nhật allUploadedData
          setAllUploadedData(prev => {
            const existingIds = new Set(prev.map((row: any) => 
              `${row['Căn hộ'] || ''}_${row['Tháng'] || ''}_${row['Năm'] || ''}_${row['Mã dịch vụ'] || ''}`
            ));
            const newData = tempData.filter((row: any) => {
              const id = `${row['Căn hộ'] || ''}_${row['Tháng'] || ''}_${row['Năm'] || ''}_${row['Mã dịch vụ'] || ''}`;
              return !existingIds.has(id);
            });
            return [...prev, ...newData];
          });
        }
      } else {
        console.log('checkDataInDB - No data found');
        setHasDataInDB(false);
        setDbData([]);
        // Không reset tableData nếu đã có preview data
        if (!isDataLoaded) {
          setTableData([]);
        }
        setIsSaved(false);
      }
    } catch (error) {
      console.error('Lỗi kiểm tra dữ liệu:', error);
      const errorMessage = error instanceof Error ? error.message : 'Không thể kiểm tra dữ liệu trong database';
      toast.error("Lỗi kiểm tra dữ liệu", { description: errorMessage });
      setHasDataInDB(false);
      setDbData([]);
      setTableData([]);
      setIsDataLoaded(false);
      setIsSaved(false);
    } finally {
      setIsCheckingData(false);
    }
  };

  // Khi bộ lọc thay đổi, kiểm tra lại dữ liệu (khi thay đổi tháng/năm)
  useEffect(() => {
    checkDataInDB();
    // Reset isDataLoaded khi thay đổi tháng/năm (filteredTableData sẽ tự động filter)
    if (!hasDataInDB) {
      setIsDataLoaded(false);
      setIsSaved(false);
    }
  }, [selectedMonth, selectedYear]);

  // Hàm trigger file input khi click vào button
  const handleUploadClick = () => {
    if (isUploading) {
      return;
    }
    if (fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      console.error('File input ref is not available');
      toast.error("Lỗi", { description: "Không thể mở file picker. Vui lòng thử lại." });
    }
  };

  // Hàm xử lý upload Excel (chỉ hiển thị preview, không lưu vào DB)
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      // Reset file input để có thể chọn lại file cùng tên
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }


    // Kiểm tra định dạng file
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      toast.error("Định dạng file không hợp lệ", { description: "Vui lòng chọn file Excel (.xlsx hoặc .xls)" });
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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

          // Gán Tháng, Năm từ filter và giữ nguyên Mã dịch vụ từ file (có thể là ELECTRICITY hoặc WATER)
          const enrichedData = jsonData.map(row => {
            // Lấy mã dịch vụ từ file, hỗ trợ nhiều format
            let maDichVuRaw = String(row['Mã dịch vụ'] || row['Ma dich vu'] || row['serviceCode'] || '').trim();
            let maDichVu = '';
            
            // Chuyển đổi sang uppercase để so sánh
            const maDichVuUpper = maDichVuRaw.toUpperCase();
            
            // Kiểm tra các format khác nhau
            if (maDichVuUpper === 'ELECTRICITY' || maDichVuUpper === 'ĐIỆN' || maDichVuUpper === 'DIEN' || maDichVuUpper === 'ĐIEN') {
              maDichVu = 'ELECTRICITY';
            } else if (maDichVuUpper === 'WATER' || maDichVuUpper === 'NƯỚC' || maDichVuUpper === 'NUOC' || maDichVuUpper === 'NƯỚC') {
              maDichVu = 'WATER';
            } else if (maDichVuRaw) {
              // Nếu có giá trị nhưng không nhận diện được, giữ nguyên và chuẩn hóa
              maDichVu = maDichVuUpper;
            } else {
              // Chỉ gán mặc định khi thực sự không có giá trị
              maDichVu = 'ELECTRICITY';
            }
            
            const enrichedRow = {
              ...row,
              'Tháng': Number(selectedMonth),
              'Năm': Number(selectedYear),
              'Mã dịch vụ': maDichVu
            };
            
            console.log('Original row:', row);
            console.log('Enriched row:', enrichedRow);
            return enrichedRow;
          });
          
          // Lưu vào allUploadedData (tất cả dữ liệu đã upload)
          setAllUploadedData(prev => {
            // Xóa dữ liệu cũ của tháng/năm này nếu có (không phân biệt mã dịch vụ)
            const filtered = prev.filter(row => {
              const rowMonth = Number(row['Tháng'] || row['Thang'] || row['month'] || 0);
              const rowYear = Number(row['Năm'] || row['Nam'] || row['year'] || 0);
              return !(rowMonth === selectedMonth && rowYear === selectedYear);
            });
            const newData = [...filtered, ...enrichedData];
            console.log('Uploaded data:', enrichedData);
            console.log('All uploaded data:', newData);
            return newData;
          });
          
          setIsDataLoaded(true);
          setUploadedData(enrichedData);
          setIsSaved(false); // Reset saved status when uploading new file
          
          toast.success("Upload thành công", { description: `Đã tải lên ${enrichedData.length} dòng dữ liệu cho tháng ${selectedMonth}/${selectedYear}. Vui lòng kiểm tra và nhấn "Lưu vào Database" để lưu.` });
          
          // Reset file input để có thể upload lại file
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } catch (error) {
          console.error("Lỗi đọc file Excel:", error);
          toast.error("Lỗi đọc file", { description: "Không thể đọc file Excel. Vui lòng kiểm tra lại định dạng." });
          setUploadedFile(null);
          setTableData([]);
          setIsDataLoaded(false);
          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
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
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Lỗi upload file:", error);
      toast.error("Lỗi upload", { description: "Đã xảy ra lỗi khi upload file." });
      setIsUploading(false);
      setUploadedFile(null);
      setTableData([]);
      setIsDataLoaded(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Hàm xuất dữ liệu (Export Data / Download Template)
  const handleDownloadTemplate = () => {
    // Kiểm tra nếu có dữ liệu trong table, export dữ liệu thực tế
    if (tableData && tableData.length > 0) {
      try {
        // Chuyển đổi dữ liệu: Mã dịch vụ từ ELECTRICITY/WATER sang Điện/Nước
        const exportData = tableData.map((row: any) => {
          const rowCopy = { ...row };
          const maDichVu = String(rowCopy['Mã dịch vụ'] || rowCopy['Ma dich vu'] || rowCopy['serviceCode'] || '').toUpperCase();
          if (maDichVu === 'ELECTRICITY' || maDichVu === 'ĐIỆN' || maDichVu === 'DIEN') {
            rowCopy['Mã dịch vụ'] = 'Điện';
          } else if (maDichVu === 'WATER' || maDichVu === 'NƯỚC' || maDichVu === 'NUOC') {
            rowCopy['Mã dịch vụ'] = 'Nước';
          }
          return rowCopy;
        });
        
        // Tạo worksheet từ dữ liệu đã chuyển đổi
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        
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
      'Căn hộ',
      'Tòa nhà',
      'Tháng',
      'Năm',
      'Mã dịch vụ',
      'Chỉ số cũ',
      'Chỉ số mới'
    ];

    // Tạo dữ liệu mẫu (2 dòng ví dụ: Điện và Nước) - dùng tiếng Việt
    const sampleData = [
      {
        'Căn hộ': '101',
        'Tòa nhà': 'CT7H',
        'Tháng': '1',
        'Năm': '2025',
        'Mã dịch vụ': 'Điện',
        'Chỉ số cũ': '753',
        'Chỉ số mới': '788'
      },
      {
        'Căn hộ': '101',
        'Tòa nhà': 'CT7H',
        'Tháng': '1',
        'Năm': '2025',
        'Mã dịch vụ': 'Nước',
        'Chỉ số cũ': '35',
        'Chỉ số mới': '54'
      }
    ];

    try {
      // Tạo worksheet từ dữ liệu mẫu
      const worksheet = XLSX.utils.json_to_sheet(sampleData);
      
      // Tạo workbook và thêm worksheet
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
      
      // Xuất file Excel
      XLSX.writeFile(workbook, 'template_mau.xlsx');
      
      toast.success("Đã tải mẫu", { description: "File template_mau.xlsx đã được tải xuống" });
    } catch (error) {
      console.error("Lỗi tải template:", error);
      toast.error("Lỗi tải template", { description: "Không thể tải template. Vui lòng thử lại." });
    }
  };

  // Hàm lưu dữ liệu vào Database
  const handleSave = async () => {
    if (filteredTableData.length === 0) {
      toast.error("Vui lòng upload file trước", { description: "Chưa có dữ liệu để lưu" });
      return;
    }

    if (!selectedMonth || !selectedYear) {
      toast.error("Vui lòng chọn bộ lọc", { description: "Cần chọn Tháng và Năm trước khi lưu" });
      return;
    }

    if (isSaved) {
      toast.info("Dữ liệu đã được lưu", { description: "Dữ liệu này đã được lưu trước đó" });
      return;
    }

    setIsSaving(true);
    
    try {
      // Lưu dữ liệu của tháng/năm hiện tại (filteredTableData)
      const dataToSave = filteredTableData;
      
      console.log('handleSave - dataToSave:', dataToSave);
      console.log('handleSave - selectedYear:', selectedYear, 'selectedMonth:', selectedMonth);
      console.log('handleSave - dataToSave length:', dataToSave.length);
      
      if (!dataToSave || dataToSave.length === 0) {
        throw new Error('Không có dữ liệu để lưu');
      }
      
      // Gọi API để lưu dữ liệu vào database
      const response = await fetch('http://localhost:8081/api/v1/accounting/usage-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          year: selectedYear,
          month: selectedMonth,
          data: dataToSave
        })
      });
      
      if (!response.ok) {
        let errorMessage = 'Lỗi lưu dữ liệu';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      const res = await response.json();
      console.log('Data saved to Database:', res);

      setIsSaved(true);
      setHasDataInDB(true); // Sau khi lưu, đánh dấu là đã có dữ liệu trong DB
      
      // Cập nhật allUploadedData để giữ lại dữ liệu đã lưu
      setAllUploadedData(prev => {
        // Merge với dữ liệu hiện có, tránh trùng lặp
        const existingIds = new Set(prev.map((row: any) => 
          `${row['Căn hộ'] || ''}_${row['Tháng'] || ''}_${row['Năm'] || ''}_${row['Mã dịch vụ'] || ''}`
        ));
        const newData = dataToSave.filter((row: any) => {
          const id = `${row['Căn hộ'] || ''}_${row['Tháng'] || ''}_${row['Năm'] || ''}_${row['Mã dịch vụ'] || ''}`;
          return !existingIds.has(id);
        });
        return [...prev, ...newData];
      });
      
      // Cập nhật dbData và tableData
      setDbData(dataToSave);
      setTableData(dataToSave);
      
      console.log('handleSave - Saved successfully, isSaved:', true, 'hasDataInDB:', true);
      
      // Show custom toast notification
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
      
      toast.success("Lưu thành công", { description: "Dữ liệu đã được lưu vào database" });
    } catch (error) {
      console.error("Lỗi lưu dữ liệu:", error);
      const errorMessage = error instanceof Error ? error.message : 'Không thể lưu dữ liệu. Vui lòng thử lại.';
      
      // Kiểm tra xem có phải lỗi network không
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast.error("Lỗi kết nối", { 
          description: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc đảm bảo backend đang chạy." 
        });
      } else {
        toast.error("Lỗi lưu dữ liệu", { description: errorMessage });
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Hàm xử lý inline editing
  const handleCellEdit = (rowIdx: number, colKey: string, currentValue: any) => {
    setEditingCell({ row: rowIdx, col: colKey });
    setEditingValue(String(currentValue || ''));
  };

  const handleCellSave = (rowIdx: number, colKey: string) => {
    if (editingCell) {
      // Tìm row trong allUploadedData dựa trên rowIdx từ filteredTableData
      const filteredRow = filteredTableData[rowIdx];
      if (!filteredRow) return;
      
      // Tìm index trong allUploadedData
      const allDataIndex = allUploadedData.findIndex(row => 
        row['Căn hộ'] === filteredRow['Căn hộ'] && 
        row['Tòa nhà'] === filteredRow['Tòa nhà'] &&
        row['Tháng'] === filteredRow['Tháng'] &&
        row['Năm'] === filteredRow['Năm'] &&
        (row['Mã dịch vụ'] || '').toUpperCase() === (filteredRow['Mã dịch vụ'] || '').toUpperCase()
      );
      
      if (allDataIndex >= 0) {
        const newAllData = [...allUploadedData];
        const value = isNaN(Number(editingValue)) ? editingValue : Number(editingValue);
        newAllData[allDataIndex] = { ...newAllData[allDataIndex], [colKey]: value };
        setAllUploadedData(newAllData);
        setIsSaved(false); // Reset saved status khi chỉnh sửa
      }
      setEditingCell(null);
      setEditingValue('');
    }
  };

  const handleCellCancel = () => {
    setEditingCell(null);
    setEditingValue('');
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

  // Kiểm tra xem đã chọn đủ bộ lọc chưa (chỉ bắt buộc có tháng và năm)
  const isFilterComplete = selectedMonth !== null && selectedYear !== null;

  // Lọc dữ liệu theo Tháng/Năm từ allUploadedData
  const filteredTableData = useMemo(() => {
    if (allUploadedData.length === 0 || !selectedMonth || !selectedYear) {
      console.log('FilteredTableData: Empty - allUploadedData:', allUploadedData.length, 'selectedMonth:', selectedMonth, 'selectedYear:', selectedYear);
      return [];
    }
    
    // Lọc theo Tháng và Năm đã chọn
    let filtered = allUploadedData.filter(row => {
      const rowMonth = Number(row['Tháng'] || row['Thang'] || row['month'] || 0);
      const rowYear = Number(row['Năm'] || row['Nam'] || row['year'] || 0);
      const match = rowMonth === selectedMonth && rowYear === selectedYear;
      if (!match) {
        console.log('Row not matching:', { rowMonth, rowYear, selectedMonth, selectedYear, row });
      }
      return match;
    });
    
    console.log('After month/year filter:', filtered.length);
    
    console.log('Final filteredTableData:', filtered.length);
    return filtered;
  }, [allUploadedData, selectedMonth, selectedYear]);

  // Cập nhật tableData từ filteredTableData để tính summary stats
  useEffect(() => {
    setTableData(filteredTableData);
  }, [filteredTableData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dữ liệu sử dụng</h1>
        </div>
      </div>

      {/* Bộ lọc - Premium Design */}
      <div className="flex items-center justify-between gap-4 mb-8">
        {/* Left Side: Filters */}
        <div className="flex items-center gap-4">
          {/* Chọn Tháng */}
          <div className="flex items-center w-36 h-12 bg-white border border-gray-200 rounded-xl shadow-sm px-4">
            <select
              value={selectedMonth || ''}
              onChange={(e) => setSelectedMonth(e.target.value ? Number(e.target.value) : null)}
              className="text-sm font-semibold text-gray-700 bg-transparent border-none focus:ring-0 cursor-pointer outline-none appearance-none w-full"
            >
              <option value="">Chọn tháng</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <option key={month} value={month}>Tháng {month}</option>
              ))}
            </select>
          </div>

          {/* Chọn Năm */}
          <div className="flex items-center w-36 h-12 bg-white border border-gray-200 rounded-xl shadow-sm px-4">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="text-sm font-semibold text-gray-700 bg-transparent border-none focus:ring-0 cursor-pointer outline-none appearance-none w-full"
            >
              {[currentDate.getFullYear() - 1, currentDate.getFullYear(), currentDate.getFullYear() + 1].map(year => (
                <option key={year} value={year}>Năm {year}</option>
              ))}
            </select>
          </div>

          {isCheckingData && (
            <div className="flex items-center gap-2 text-sm text-gray-600 h-12">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang kiểm tra dữ liệu...</span>
            </div>
          )}
        </div>

        {/* Right Side: Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            disabled={isUploading}
          />

          {/* Tải xuống mẫu Button */}
          <button
            onClick={handleDownloadTemplate}
            className="h-12 flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Tải xuống mẫu</span>
          </button>

          {/* Upload Excel Button - Primary */}
          <button
            onClick={handleUploadClick}
            disabled={isUploading}
            type="button"
            className={`h-12 flex items-center gap-2 px-6 rounded-xl font-semibold transition-all shadow-sm ${
              isUploading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700 hover:shadow-md cursor-pointer'
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

          {/* Lưu vào Database Button - Hiển thị khi có preview data chưa lưu */}
          {filteredTableData.length > 0 && (hasDataInDB === false || hasDataInDB === null) && (
            <button
              onClick={handleSave}
              disabled={isUploading || isSaved || isSaving || filteredTableData.length === 0}
              className={`h-12 flex items-center gap-2 px-6 py-2 rounded-xl font-medium transition-all shadow-sm ${
                isUploading || isSaved || isSaving || filteredTableData.length === 0
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
          )}
        </div>
      </div>

      {/* Hiển thị thông báo nếu chưa chọn đủ bộ lọc */}
      {!isFilterComplete && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-yellow-900">Vui lòng chọn tháng và năm</h3>
        </div>
      )}

      {/* Hiển thị thông báo nếu chưa có dữ liệu trong DB và chưa upload */}
      {isFilterComplete && hasDataInDB === false && filteredTableData.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">Tháng {selectedMonth}/{selectedYear} chưa có dữ liệu</h3>
        </div>
      )}

      {/* Card chính - Upload và Actions - Hiển thị khi có dữ liệu từ DB hoặc đã upload */}
      {isFilterComplete && (hasDataInDB || filteredTableData.length > 0) && (
      <div className="p-6">
        {/* Header */}
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
        </div>

        {/* Data Preview Table Section - Hiển thị khi có dữ liệu */}
        {filteredTableData.length > 0 && (
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
                    {filteredTableData.length > 0 && Object.keys(filteredTableData[0]).map((col, idx) => (
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
                  {filteredTableData.map((row, rowIdx) => {
                    const columns = filteredTableData.length > 0 ? Object.keys(filteredTableData[0]) : [];
                    return (
                    <tr key={rowIdx} className="hover:bg-blue-50 transition-colors duration-200">
                      {columns.map((col, colIdx) => {
                        let value = row[col];
                        const colLower = col.toLowerCase();
                        
                        // Chuyển đổi Mã dịch vụ từ ELECTRICITY/WATER sang Điện/Nước
                        if (colLower.includes('mã dịch vụ') || colLower.includes('ma dich vu') || colLower.includes('servicecode') || colLower.includes('service code')) {
                          const serviceCode = String(value || '').toUpperCase();
                          if (serviceCode === 'ELECTRICITY') {
                            value = 'Điện';
                          } else if (serviceCode === 'WATER') {
                            value = 'Nước';
                          }
                        }
                        
                        const isNumber = typeof value === 'number';
                        const isCurrencyField = colLower.includes('amount') || 
                                                colLower.includes('tiền') || 
                                                colLower.includes('cost') || 
                                                colLower.includes('price');
                        const isNumericField = isNumber || (!isNaN(Number(value)) && value !== '');
                        const isEditing = editingCell?.row === rowIdx && editingCell?.col === col;
                        
                        // Debug log
                        if (rowIdx === 0 && colIdx === 0) {
                          console.log('Rendering table - filteredTableData.length:', filteredTableData.length);
                          console.log('Rendering table - row:', row);
                          console.log('Rendering table - columns:', columns);
                        }
                        
                        return (
                          <td
                            key={colIdx}
                            className="px-4 py-3 text-sm text-gray-900 border-b border-gray-100"
                            onClick={() => isNumericField && !isEditing && handleCellEdit(rowIdx, col, value)}
                            style={{ cursor: isNumericField ? 'pointer' : 'default' }}
                          >
                            {isEditing ? (
                              <input
                                type="number"
                                value={editingValue}
                                onChange={(e) => setEditingValue(e.target.value)}
                                onBlur={() => handleCellSave(rowIdx, col)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleCellSave(rowIdx, col);
                                  } else if (e.key === 'Escape') {
                                    handleCellCancel();
                                  }
                                }}
                                className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                autoFocus
                              />
                            ) : (
                              <span className={isNumericField ? 'hover:bg-blue-100 px-2 py-1 rounded' : ''}>
                                {isNumber && isCurrencyField ? formatCurrency(value) : value}
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
      )}

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

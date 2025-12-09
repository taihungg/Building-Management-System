import React, { useState, useEffect, useRef } from 'react';
import { Send, AlertCircle, CheckCircle, Upload, CheckCircle2, X } from 'lucide-react';
import { getBills, subscribe as subscribeBills, addBill, type Bill, type BillDetail } from '../utils/bills';
import { addAnnouncement } from '../utils/announcements';
import * as XLSX from 'xlsx';

interface ExcelRow {
  [key: string]: any;
}

interface PendingApproval {
  id: string;
  data: ExcelRow[];
  headers: string[];
  uploadDate: string;
}

export function InvoiceCreation() {
  const [bills, setBills] = useState<Bill[]>(getBills());
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [uploadedData, setUploadedData] = useState<ExcelRow[]>([]);
  const [excelHeaders, setExcelHeaders] = useState<string[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [currentPreviewId, setCurrentPreviewId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribeBills = subscribeBills((updatedBills) => {
      setBills(updatedBills);
    });
    return unsubscribeBills;
  }, []);

  useEffect(() => {
    console.log('Pending approvals changed:', pendingApprovals);
  }, [pendingApprovals]);

  const getDerivedStatus = (bill: Bill): 'Paid' | 'Pending' | 'Overdue' => {
    if (bill.status === 'Pending' && new Date(bill.dueDate) < new Date()) return 'Overdue';
    return bill.status;
  };

  const pendingBills = bills.filter(b => {
    const status = getDerivedStatus(b);
    return status === 'Pending' || status === 'Overdue';
  });

  const handleSendReminder = (bill: Bill) => {
    setSelectedBill(bill);
    setIsReminderModalOpen(true);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        if (jsonData.length === 0) {
          alert('File Excel trống!');
          return;
        }

        const headers = jsonData[0] as string[];
        setExcelHeaders(headers);

        const rows: ExcelRow[] = [];
        for (let i = 1; i < jsonData.length; i++) {
          const row: ExcelRow = {};
          headers.forEach((header, index) => {
            row[header] = jsonData[i][index] || '';
          });
          rows.push(row);
        }

        setUploadedData(rows);
        setExcelHeaders(headers);
        setCurrentPreviewId(null);
        setIsPreviewModalOpen(true);
      } catch (error) {
        console.error('Error reading Excel file:', error);
        alert('Lỗi khi đọc file Excel! Vui lòng kiểm tra lại file.');
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const createInvoicesFromData = (data: ExcelRow[]) => {
    const createdBills: Bill[] = [];
    data.forEach((row) => {
      const apartmentNumber = row['Căn hộ'] || row['Căn Hộ'] || row['Đơn vị'] || row['Unit'] || '';
      const residentName = row['Cư dân'] || row['Cư Dân'] || row['Người dân'] || row['Resident'] || '';
      const period = row['Kỳ'] || row['Period'] || row['Tháng'] || '';
      const dueDate = row['Hạn thanh toán'] || row['Hạn Thanh Toán'] || row['Due Date'] || row['Ngày đến hạn'] || '';
      const type = row['Loại'] || row['Loại hóa đơn'] || row['Type'] || 'Hóa đơn tháng';
      const amount = parseFloat(row['Số tiền'] || row['Số Tiền'] || row['Amount'] || row['Số lượng'] || '0') || 0;
      const details = row['Chi tiết'] || row['Chi Tiết'] || row['Details'] || '';

      if (apartmentNumber && residentName && period && dueDate && amount > 0) {
        let billDetails: BillDetail[] = [];
        if (details) {
          const items = details.split('+').map(item => item.trim());
          const itemAmount = Math.floor(amount / items.length);
          billDetails = items.map((item, index) => ({
            item,
            amount: index === items.length - 1 ? amount - (itemAmount * (items.length - 1)) : itemAmount
          }));
        } else {
          billDetails = [{ item: type, amount }];
        }

        const newBill = addBill({
          type,
          amount,
          dueDate,
          status: 'Pending',
          paidDate: null,
          period,
          details: billDetails,
          apartmentNumber,
          residentName,
        });
        createdBills.push(newBill);
      }
    });
    return createdBills.length;
  };

  const handleApproveNow = () => {
    if (uploadedData.length === 0) {
      alert('Không có dữ liệu để tạo hóa đơn!');
      return;
    }

    const createdCount = createInvoicesFromData(uploadedData);

    if (createdCount > 0) {
      alert(`Đã tạo thành công ${createdCount} hóa đơn từ dữ liệu Excel!`);
    } else {
      alert('Không thể tạo hóa đơn. Vui lòng kiểm tra lại định dạng dữ liệu Excel!');
    }

    setIsPreviewModalOpen(false);
    setUploadedData([]);
    setExcelHeaders([]);
    setCurrentPreviewId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveForLater = () => {
    if (uploadedData.length === 0) {
      alert('Không có dữ liệu để lưu!');
      return;
    }

    const newApproval: PendingApproval = {
      id: Date.now().toString(),
      data: [...uploadedData],
      headers: [...excelHeaders],
      uploadDate: new Date().toLocaleString('vi-VN'),
    };

    setPendingApprovals(prev => {
      const updated = [...prev, newApproval];
      console.log('Pending approvals updated:', updated);
      return updated;
    });
    setIsPreviewModalOpen(false);
    setUploadedData([]);
    setExcelHeaders([]);
    setCurrentPreviewId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    alert(`Đã lưu dữ liệu để duyệt sau! (${uploadedData.length} dòng)`);
  };

  const handleApprovePending = (approvalId: string) => {
    const approval = pendingApprovals.find(a => a.id === approvalId);
    if (!approval) return;

    const createdCount = createInvoicesFromData(approval.data);

    if (createdCount > 0) {
      alert(`Đã tạo thành công ${createdCount} hóa đơn từ dữ liệu đã lưu!`);
      setPendingApprovals(pendingApprovals.filter(a => a.id !== approvalId));
      setIsPreviewModalOpen(false);
      setUploadedData([]);
      setExcelHeaders([]);
      setCurrentPreviewId(null);
    } else {
      alert('Không thể tạo hóa đơn. Vui lòng kiểm tra lại định dạng dữ liệu!');
    }
  };

  const handleViewPending = (approval: PendingApproval) => {
    setUploadedData(approval.data);
    setExcelHeaders(approval.headers);
    setCurrentPreviewId(approval.id);
    setIsPreviewModalOpen(true);
  };

  const handleApproveAllPending = () => {
    if (pendingApprovals.length === 0) {
      alert('Không có dữ liệu chờ duyệt!');
      return;
    }

    let totalCreated = 0;
    pendingApprovals.forEach(approval => {
      totalCreated += createInvoicesFromData(approval.data);
    });

    if (totalCreated > 0) {
      alert(`Đã tạo thành công ${totalCreated} hóa đơn từ tất cả dữ liệu chờ duyệt!`);
      setPendingApprovals([]);
    } else {
      alert('Không thể tạo hóa đơn. Vui lòng kiểm tra lại định dạng dữ liệu!');
    }
  };

  const confirmSendReminder = () => {
    if (!selectedBill) return;

    const status = getDerivedStatus(selectedBill);
    const apartmentInfo = selectedBill.apartmentNumber ? `Căn hộ ${selectedBill.apartmentNumber}` : '';
    const residentInfo = selectedBill.residentName ? ` - ${selectedBill.residentName}` : '';
    const fullInfo = apartmentInfo + residentInfo;
    
    const reminderType = status === 'Overdue' ? 'alert' : 'info';
    const reminderTitle = status === 'Overdue' 
      ? `Nhắc nợ quá hạn: ${selectedBill.period}${fullInfo ? ` (${fullInfo})` : ''}`
      : `Nhắc nợ thanh toán: ${selectedBill.period}${fullInfo ? ` (${fullInfo})` : ''}`;
    const reminderMessage = status === 'Overdue'
      ? `${fullInfo ? `Kính gửi cư dân ${fullInfo}.\n\n` : ''}Hóa đơn ${selectedBill.period} đã quá hạn thanh toán. Số tiền: ${selectedBill.amount.toLocaleString('vi-VN')} ₫. Vui lòng thanh toán sớm nhất có thể.`
      : `${fullInfo ? `Kính gửi cư dân ${fullInfo}.\n\n` : ''}Nhắc nhở thanh toán hóa đơn ${selectedBill.period}. Số tiền: ${selectedBill.amount.toLocaleString('vi-VN')} ₫. Hạn thanh toán: ${selectedBill.dueDate}.`;

    addAnnouncement({
      type: reminderType,
      icon: null,
      title: reminderTitle,
      message: reminderMessage,
      read: false,
      color: status === 'Overdue' ? 'orange' : 'blue',
    });

    alert(`Đã gửi thông báo nhắc nợ thành công${fullInfo ? ` cho ${fullInfo}` : ''}!`);
    setIsReminderModalOpen(false);
    setSelectedBill(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tạo Hóa Đơn</h1>
          <p className="text-gray-600">Upload file Excel để tự động tạo hóa đơn và gửi thông báo nhắc nợ</p>
        </div>
        <div className="flex gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="absolute opacity-0 w-0 h-0 pointer-events-none"
            id="excel-upload"
            style={{ position: 'absolute', width: 0, height: 0, opacity: 0, pointerEvents: 'none' }}
          />
          <label
            htmlFor="excel-upload"
            className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-indigo-100 transition-colors cursor-pointer"
          >
            <Upload className="w-5 h-5" />
            Upload Excel
          </label>
          {pendingApprovals.length > 0 && (
            <button
              onClick={handleApproveAllPending}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all"
            >
              <CheckCircle2 className="w-5 h-5" />
              Duyệt Tất Cả ({pendingApprovals.length})
            </button>
          )}
        </div>
      </div>

      {pendingApprovals.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Dữ Liệu Chờ Duyệt</h2>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
              {pendingApprovals.length} file
            </span>
          </div>
          <div className="space-y-3">
            {pendingApprovals.map((approval) => (
              <div key={approval.id} className="p-4 rounded-xl border-2 border-blue-200 bg-blue-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1"><span className="font-medium">Upload lúc:</span> {approval.uploadDate}</p>
                    <p className="text-sm text-gray-600 mb-1"><span className="font-medium">Số dòng:</span> {approval.data.length} dòng</p>
                    <p className="text-sm text-gray-600"><span className="font-medium">Số cột:</span> {approval.headers.length} cột</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleViewPending(approval)} className="px-4 py-2 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">Xem</button>
                    <button onClick={() => handleApprovePending(approval.id)} className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all">Duyệt</button>
                    <button onClick={() => setPendingApprovals(prev => prev.filter(a => a.id !== approval.id))} className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Hóa Đơn Chưa Thanh Toán</h2>
          <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
            {pendingBills.length} hóa đơn
          </span>
        </div>
        <div className="space-y-3">
          {pendingBills.map((bill) => {
            const status = getDerivedStatus(bill);
            return (
              <div key={bill.id} className={`p-4 rounded-xl border-2 ${status === 'Overdue' ? 'border-red-200 bg-red-50' : 'border-orange-200 bg-orange-50'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{bill.period}</h3>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${status === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                        {status === 'Overdue' ? 'Quá hạn' : 'Chưa thanh toán'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mb-2">
                      <p className="text-sm text-gray-600"><span className="font-medium">Căn hộ:</span> {bill.apartmentNumber || '-'}</p>
                      <p className="text-sm text-gray-600"><span className="font-medium">Cư dân:</span> {bill.residentName || '-'}</p>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Loại: {bill.type}</p>
                    <p className="text-sm text-gray-600 mb-1">Hạn thanh toán: {bill.dueDate}</p>
                    <p className="text-lg font-bold text-gray-900">{bill.amount.toLocaleString('vi-VN')} ₫</p>
                  </div>
                  <button onClick={() => handleSendReminder(bill)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all">
                    <Send className="w-4 h-4" />
                    Gửi Nhắc Nợ
                  </button>
                </div>
              </div>
            );
          })}
          {pendingBills.length === 0 && (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <p className="text-gray-600">Tất cả hóa đơn đã được thanh toán</p>
            </div>
          )}
        </div>
      </div>

      {isReminderModalOpen && selectedBill && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setIsReminderModalOpen(false)}>
          <div className="bg-white rounded-2xl p-8 max-w-md w-full border-2 border-gray-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Gửi Thông Báo Nhắc Nợ</h2>
              <button onClick={() => setIsReminderModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">✕</button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Căn hộ</p>
                <p className="text-lg font-semibold text-gray-900">{selectedBill.apartmentNumber || '-'}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Cư dân</p>
                <p className="text-lg font-semibold text-gray-900">{selectedBill.residentName || '-'}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Kỳ hóa đơn</p>
                <p className="text-lg font-semibold text-gray-900">{selectedBill.period}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Số tiền</p>
                <p className="text-lg font-semibold text-gray-900">{selectedBill.amount.toLocaleString('vi-VN')} ₫</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Hạn thanh toán</p>
                <p className="text-lg font-semibold text-gray-900">{selectedBill.dueDate}</p>
              </div>
              {getDerivedStatus(selectedBill) === 'Overdue' && (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-sm font-semibold text-red-700">Hóa đơn đã quá hạn thanh toán</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={confirmSendReminder} className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all">
                <div className="flex items-center justify-center gap-2">
                  <Send className="w-5 h-5" />
                  Gửi Thông Báo
                </div>
              </button>
              <button onClick={() => setIsReminderModalOpen(false)} className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors">
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {isPreviewModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setIsPreviewModalOpen(false)}>
          <div className="bg-white rounded-2xl p-8 max-w-6xl w-full border-2 border-gray-200 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {currentPreviewId ? 'Xem Dữ Liệu Chờ Duyệt' : 'Duyệt Dữ Liệu Từ Excel'}
              </h2>
              <button
                onClick={() => {
                  setIsPreviewModalOpen(false);
                  if (!currentPreviewId) {
                    setUploadedData([]);
                    setExcelHeaders([]);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  } else {
                    setCurrentPreviewId(null);
                  }
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
              <p className="text-sm text-blue-800">
                <strong>Tổng số dòng:</strong> {uploadedData.length} dòng dữ liệu
              </p>
            </div>

            <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-indigo-100 to-purple-100 border-b border-gray-200">
                    <tr>
                      {excelHeaders.map((header, index) => (
                        <th key={index} className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {uploadedData.map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-indigo-50 transition-colors">
                        {excelHeaders.map((header, colIndex) => (
                          <td key={colIndex} className="px-6 py-4 text-sm text-gray-900">
                            {row[header] !== undefined && row[header] !== null ? String(row[header]) : '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsPreviewModalOpen(false);
                  if (!currentPreviewId) {
                    setUploadedData([]);
                    setExcelHeaders([]);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  } else {
                    setCurrentPreviewId(null);
                  }
                }}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
              >
                Hủy
              </button>
              {!currentPreviewId && (
                <button
                  onClick={handleSaveForLater}
                  className="flex-1 px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-xl hover:bg-blue-50 transition-colors"
                >
                  Để Lúc Khác Duyệt
                </button>
              )}
              <button
                onClick={() => {
                  if (currentPreviewId) {
                    handleApprovePending(currentPreviewId);
                    setIsPreviewModalOpen(false);
                    setCurrentPreviewId(null);
                  } else {
                    handleApproveNow();
                  }
                }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                Duyệt Ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


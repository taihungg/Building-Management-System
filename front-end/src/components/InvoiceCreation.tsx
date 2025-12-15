import React, { useState, useEffect } from 'react';
import { Send, AlertCircle, CheckCircle, Clock, CheckCircle2 } from 'lucide-react';
import { addAnnouncement } from '../utils/announcements';
import { toast } from 'sonner';

// Khai báo type Bill cần thiết
interface Bill { 
    id: string;
    status: 'PENDING' | 'PAID' | string; // Giả định status từ API
    dueDate: string; // Ngày đến hạn
    period: string;
    amount: number;
    apartmentNumber?: string;
    residentName?: string;
    type?: string;
}

export function InvoiceCreation() {
  const [bills, setBills] = useState<Bill[]>([]); 
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // STATE CHO LOGIC GỌI API BACKEND
  const [inputMonth, setInputMonth] = useState<number>(new Date().getMonth() + 1);
  const [inputYear, setInputYear] = useState<number>(new Date().getFullYear());
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<{ status: 'success' | 'error' | null, message: string }>({ status: null, message: '' });


  // 1. HÀM TẢI LẠI DANH SÁCH HÓA ĐƠN TỪ API
  const fetchBills = async () => {
    setIsLoading(true);
    try {
      // Logic tải bills thực tế: mặc định lấy theo năm hiện tại
      let url = `http://localhost:8081/api/v1/accounting/invoices?year=${new Date().getFullYear()}`; 
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("Không thể tải dữ liệu hóa đơn");
      
      const res = await response.json();
      const data: Bill[] = res.data || [];
      
      setBills(data);
      
    } catch (error) {
      console.error("Lỗi tải hóa đơn:", error);
      const errorMessage = error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định.";
      toast.error("Lỗi tải dữ liệu", { description: errorMessage });
      setBills([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Gọi API tải bills khi component mount
  useEffect(() => {
   fetchBills();
  }, []);

  // 2. LOGIC TẠO HÓA ĐƠN HÀNG LOẠT (Gọi API Backend)
  const handleGenerateInvoices = async () => {
    if (inputMonth < 1 || inputMonth > 12 || inputYear < 2020) {
        setGenerationResult({ status: 'error', message: 'Vui lòng nhập Tháng/Năm hợp lệ.' });
        return;
    }
      
    if (isGenerating) return;
    setIsGenerating(true);
    setGenerationResult({ status: null, message: '' });

    const url = `http://localhost:8081/api/v1/accounting/invoices/generation?month=${inputMonth}&year=${inputYear}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Thêm Authorization header nếu cần
            },
        });

        const res = await response.json();

        if (response.ok && res.statusCode === 200) { 
            setGenerationResult({ 
                status: 'success', 
                message: res.message || `Đã tạo thành công ${res.data || '?'} hóa đơn nháp cho tháng ${inputMonth}/${inputYear}.`
            });
            toast.success("Tạo hóa đơn thành công", { description: res.message });
            // Tải lại danh sách bills sau khi tạo
            fetchBills(); 
        } else {
            setGenerationResult({ 
                status: 'error', 
                message: res.message || 'Lỗi không xác định khi tạo hóa đơn. Vui lòng kiểm tra console.'
            });
            toast.error("Lỗi tạo hóa đơn", { description: res.message || 'Vui lòng kiểm tra lại trạng thái hóa đơn của tháng này.' });
        }
    } catch (error) {
        console.error("Lỗi gọi API:", error);
        setGenerationResult({ status: 'error', message: 'Không thể kết nối đến máy chủ hoặc lỗi mạng.' });
        toast.error("Lỗi kết nối", { description: 'Không thể gọi API tạo hóa đơn.' });
    } finally {
        setIsGenerating(false);
    }
  };
  // ------------------------------------

  // ❌ ĐÃ XÓA checkOverdue (vì bạn không muốn logic Overdue trên FE)
  
  // Lọc chỉ dựa vào trạng thái cứng PENDING từ API
  const pendingBills = bills.filter(b => b.status ==='PENDING');
  

  const handleSendReminder = (bill: Bill) => {
    setSelectedBill(bill);
    setIsReminderModalOpen(true);
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND',
        maximumFractionDigits: 0 
    }).format(amount);
  };

  const confirmSendReminder = () => {
    if (!selectedBill) return;

    // ❌ Xóa logic isOverdue, chỉ dùng thông báo 'Nhắc nhở thanh toán'
    
    const apartmentInfo = selectedBill.apartmentNumber ? `Căn hộ ${selectedBill.apartmentNumber}` : '';
    const residentInfo = selectedBill.residentName ? ` - ${selectedBill.residentName}` : '';
    const fullInfo = apartmentInfo + residentInfo;
    
    const reminderType = 'info'; // Luôn là info
    const reminderTitle = `Nhắc nhở thanh toán: ${selectedBill.period}${fullInfo ? ` (${fullInfo})` : ''}`;
    const reminderMessage = `${fullInfo ? `Kính gửi cư dân ${fullInfo}.\n\n` : ''}Nhắc nhở thanh toán hóa đơn ${selectedBill.period}. Số tiền: ${formatCurrency(selectedBill.amount)}. Hạn thanh toán: ${selectedBill.dueDate}.`;

    addAnnouncement({
      type: reminderType,
      icon: null,
      title: reminderTitle,
      message: reminderMessage,
      read: false,
      color: 'blue', // Mặc định màu xanh/blue cho nhắc nhở
    });

    alert(`Đã gửi thông báo nhắc nợ thành công${fullInfo ? ` cho ${fullInfo}` : ''}!`);
    setIsReminderModalOpen(false);
    setSelectedBill(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tạo Hóa Đơn Hàng Loạt</h1>
          <p className="text-gray-600">Tự động tạo hóa đơn nháp (PENDING) cho toàn bộ căn hộ trong tháng/năm đã chọn.</p>
        </div>
        
        <div className="flex gap-3 items-end">
          {/* Input cho Tháng */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Tháng</label>
            <input
              type="number"
              min="1"
              max="12"
              value={inputMonth}
              onChange={(e) => setInputMonth(parseInt(e.target.value) || 1)}
              className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          {/* Input cho Năm */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Năm</label>
            <input
              type="number"
              min="2020"
              value={inputYear}
              onChange={(e) => setInputYear(parseInt(e.target.value) || new Date().getFullYear())}
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Nút Gọi API */}
          <button
            onClick={handleGenerateInvoices}
            disabled={isGenerating}
            className={`flex items-center gap-2 px-6 py-3 text-white rounded-xl transition-all ${isGenerating 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg'}`}
          >
            {isGenerating ? (
                <>
                    <Clock className="w-5 h-5 animate-spin" />
                    Đang Tạo...
                </>
            ) : (
                <>
                    <Send className="w-5 h-5" />
                    Tạo Hóa Đơn
                </>
            )}
          </button>
        </div>
      </div>

      {/* HIỂN THỊ KẾT QUẢ GỌI API */}
      {generationResult.status && (
        <div className={`p-4 rounded-xl border-2 ${generationResult.status === 'success' ? 'border-green-300 bg-green-50 text-green-800' : 'border-red-300 bg-red-50 text-red-800'}`}>
          <div className="flex items-center gap-2">
            {generationResult.status === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <p className="font-semibold">{generationResult.message}</p>
          </div>
        </div>
      )}


      <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Hóa Đơn Chưa Thanh Toán (PENDING)</h2>
          {isLoading ? (
             <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
                Đang tải...
            </span>
          ) : (
             <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
                {pendingBills.length} hóa đơn
            </span>
          )}
        </div>
        <div className="space-y-3">
          {pendingBills.map((bill) => {
            // ✅ Đã xóa logic Overdue, chỉ sử dụng màu cam/orange cho PENDING
            const statusColor = 'border-orange-200 bg-orange-50';
            const tagColor = 'bg-orange-100 text-orange-700';
            
            return (
              <div key={bill.id} className={`p-4 rounded-xl border-2 ${statusColor}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{bill.period}</h3>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${tagColor}`}>
                        Chưa thanh toán
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mb-2">
                      <p className="text-sm text-gray-600"><span className="font-medium">Căn hộ:</span> {bill.apartmentNumber || '-'}</p>
                      <p className="text-sm text-gray-600"><span className="font-medium">Cư dân:</span> {bill.residentName || '-'}</p>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Loại: {bill.type}</p>
                    <p className="text-sm text-gray-600 mb-1">Hạn thanh toán: {bill.dueDate}</p>
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(bill.amount)}</p>
                  </div>
                  <button onClick={() => handleSendReminder(bill)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all">
                    <Send className="w-4 h-4" />
                    Gửi Nhắc Nợ
                  </button>
                </div>
              </div>
            );
          })}
          {pendingBills.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <p className="text-gray-600">Hiện tại không có hóa đơn chưa thanh toán (PENDING)</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL REMINDER */}
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
                <p className="text-lg font-semibold text-gray-900">{formatCurrency(selectedBill.amount)}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Hạn thanh toán</p>
                <p className="text-lg font-semibold text-gray-900">{selectedBill.dueDate}</p>
              </div>
              {/* ❌ Đã xóa cảnh báo Quá hạn trong Modal */}
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
    </div>
  );
}
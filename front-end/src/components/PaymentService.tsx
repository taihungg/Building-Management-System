import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";
import { CreditCard, DollarSign, Calendar, Receipt, CheckCircle2, AlertCircle, Clock, QrCode, Search } from "lucide-react";
import { toast } from "sonner";

const serviceTypes = [
  { id: "electricity", name: "Tiền điện", amount: 850000, description: "Tiền điện tháng 10/2025", status: "unpaid" },
  { id: "water", name: "Tiền nước", amount: 320000, description: "Tiền nước tháng 10/2025", status: "unpaid" },
];

const allServiceTypes = [
  { id: "management", name: "Phí quản lý", amount: 2500000, description: "Phí quản lý chung cư hàng tháng", status: "paid" },
  { id: "parking", name: "Phí gửi xe", amount: 150000, description: "Phí gửi xe máy tháng 10/2025", status: "paid" },
  { id: "electricity", name: "Tiền điện", amount: 850000, description: "Tiền điện tháng 10/2025", status: "unpaid" },
  { id: "water", name: "Tiền nước", amount: 320000, description: "Tiền nước tháng 10/2025", status: "unpaid" },
  { id: "maintenance", name: "Phí bảo trì", amount: 500000, description: "Phí bảo trì chung cư", status: "paid" },
];

const paymentMethods = [
  { id: "bank_transfer", name: "Chuyển khoản ngân hàng", icon: CreditCard },
  { id: "qr_code", name: "QR Code", icon: DollarSign },
];

interface PaymentHistoryItem {
  id: number;
  service: string;
  amount: number;
  date: string;
  method: string;
  status: "completed" | "pending" | "failed";
  invoice: string;
}

interface PaymentServiceProps {
  setPaymentData?: (data: { paid: number; total: number }) => void;
  paymentData?: { paid: number; total: number };
  setActivities?: (activities: Array<{ time: string; action: string; type: string; amount?: string }>) => void;
  paymentHistory?: PaymentHistoryItem[];
  setPaymentHistory?: (history: PaymentHistoryItem[]) => void;
}

export function PaymentService({ setPaymentData, paymentData, setActivities, paymentHistory, setPaymentHistory }: PaymentServiceProps = {}) {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentPage, setShowPaymentPage] = useState(false);
  const [paidServices, setPaidServices] = useState<string[]>([]);
  const [historyQuery, setHistoryQuery] = useState("");
  
  // Sử dụng paymentHistory từ props thay vì state local
  const paymentHistoryList = paymentHistory || [];
  
  // Danh sách dịch vụ chưa thanh toán (có thể chọn) - dựa vào paymentHistory
  // Lấy danh sách các dịch vụ đã thanh toán từ paymentHistory
  const completedServiceNames = paymentHistoryList
    .filter(item => item.status === "completed")
    .map(item => item.service);

  // Lấy danh sách các dịch vụ chưa thanh toán dựa trên paymentHistory
  const unpaidServiceFromHistory = paymentHistoryList
    .filter(item => item.status === "pending")
    .map(item => {
      // Chuyển đổi tên dịch vụ thành ID
      if (item.service === "Tiền điện") return "electricity";
      if (item.service === "Tiền nước") return "water";
      return item.service.toLowerCase().replace(/\s+/g, "_");
    });

  // Nếu không có dịch vụ từ paymentHistory, dùng tất cả dịch vụ chưa thanh toán
  const availableServices = unpaidServiceFromHistory.length > 0 
    ? unpaidServiceFromHistory 
    : serviceTypes.map(s => s.id);

  const totalAmount = selectedServices.reduce((total, serviceId) => {
    // Tìm trong paymentHistoryList với status pending
    const item = paymentHistoryList.find(p => {
      if (serviceId === "electricity" && p.service === "Tiền điện") return true;
      if (serviceId === "water" && p.service === "Tiền nước") return true;
      if (serviceId === "management" && p.service === "Phí quản lý") return true;
      if (serviceId === "parking" && p.service === "Phí gửi xe") return true;
      if (serviceId === "maintenance" && p.service === "Phí bảo trì") return true;
      return false;
    });
    return total + (item?.amount || 0);
  }, 0);

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handlePayment = async () => {
    if (selectedServices.length === 0) {
      toast.error("Vui lòng chọn ít nhất một dịch vụ để thanh toán");
      return;
    }
    
    if (!paymentMethod) {
      toast.error("Vui lòng chọn phương thức thanh toán");
      return;
    }

    // Chuyển sang trang thanh toán
    setShowPaymentPage(true);
  };

  const handleCompletePayment = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      
      // Cập nhật lịch sử thanh toán - chuyển từ pending sang completed
      // Map serviceId sang tên service từ paymentHistory
      const selectedServiceNames = selectedServices.map(id => {
        const item = paymentHistoryList.find(p => {
          if (id === "electricity" && p.service === "Tiền điện") return true;
          if (id === "water" && p.service === "Tiền nước") return true;
          if (id === "management" && p.service === "Phí quản lý") return true;
          if (id === "parking" && p.service === "Phí gửi xe") return true;
          if (id === "maintenance" && p.service === "Phí bảo trì") return true;
          return false;
        });
        return item?.service || "";
      }).filter(name => name !== "");
      
      if (setPaymentHistory && paymentHistory) {
        // Lấy tên phương thức thanh toán đã chọn
        const selectedPaymentMethod = paymentMethods.find(m => m.id === paymentMethod)?.name || "Chuyển khoản ngân hàng";
        
        const updatedHistory = paymentHistory.map(item => {
          if (selectedServiceNames.includes(item.service)) {
            return { 
              ...item, 
              status: "completed" as const,
              method: selectedPaymentMethod,
              date: new Date().toLocaleDateString('vi-VN')
            };
          }
          return item;
        }).sort((a, b) => {
          // Sort: completed first, then pending
          if (a.status === "completed" && b.status !== "completed") return -1;
          if (a.status !== "completed" && b.status === "completed") return 1;
          return 0;
        });
        
        setPaymentHistory(updatedHistory);
        
        // Cập nhật paymentData sau khi đã cập nhật paymentHistory
        const completedCount = updatedHistory.filter(item => item.status === "completed").length;
        const totalCount = updatedHistory.length;
        
        if (setPaymentData) {
          setPaymentData({ paid: completedCount, total: totalCount });
        }
      }
      
      // Tạo activity mới cho hoạt động thanh toán vừa thực hiện
      // Map selectedServices từ ID sang tên service thực tế
      const serviceNamesForActivity = selectedServiceNames.join(", ");
      
      // Tạo timestamp cho activity
      const paymentTimestamp = Date.now();
      
      const newActivity = {
        time: "Vừa xong",
        timestamp: paymentTimestamp,
        action: `Đã thanh toán ${serviceNamesForActivity} - ${totalAmount.toLocaleString('vi-VN')} VNĐ`,
        type: "payment",
        amount: `${totalAmount.toLocaleString('vi-VN')} VNĐ`
      };
      
      // Thêm activity mới vào đầu danh sách, đảm bảo không bị trùng
      if (setActivities) {
        setActivities((prev: any) => {
          // Tạo một set để theo dõi các service đã thanh toán
          const paidServices = new Set(selectedServiceNames);
          
          // Tạo một Set chứa các id duy nhất để filter
          const serviceIds = new Set(selectedServices);
          
          // Filter out activities that:
          // 1. Are payment activities
          // 2. AND contain any of the service names we just paid for
          // 3. AND are recent (within last hour)
          const filtered = prev.filter((act: any) => {
            // Always keep non-payment activities
            if (act.type !== "payment") return true;
            
            // Check if this activity is for any of the services we just paid
            const isForSameService = Array.from(paidServices).some(serviceName => 
              act.action && act.action.includes(serviceName)
            );
            
            // If it's for the same service, check if it's recent
            if (isForSameService) {
              // Check if activity has timestamp and is recent (within 1 hour)
              if (act.timestamp) {
                const timeDiff = Date.now() - act.timestamp;
                const oneHour = 60 * 60 * 1000;
                // Keep old activities (older than 1 hour)
                return timeDiff > oneHour;
              }
              // If no timestamp, assume it's old and keep it
              return true;
            }
            
            return true;
          });
          
          return [newActivity, ...filtered.slice(0, 9)];
        });
      }
      
      toast.success("Thanh toán thành công!");
      setPaidServices([...paidServices, ...selectedServices]);
      setShowPaymentPage(false);
      setSelectedServices([]);
      setPaymentMethod("");
    }, 2000);
  };

  const handleBack = () => {
    setShowPaymentPage(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "failed": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return CheckCircle2;
      case "pending": return Clock;
      case "failed": return AlertCircle;
      default: return Clock;
    }
  };

  // Nếu đang ở trang thanh toán, hiển thị trang chi tiết
  if (showPaymentPage) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Xác nhận thanh toán</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Selected Services */}
            <div className="space-y-3">
              <h3 className="font-semibold">Các dịch vụ được chọn:</h3>
              {selectedServices.map((serviceId) => {
                // Tìm service trong paymentHistoryList
                const paymentItem = paymentHistoryList.find(p => {
                  if (serviceId === "electricity" && p.service === "Tiền điện") return true;
                  if (serviceId === "water" && p.service === "Tiền nước") return true;
                  if (serviceId === "management" && p.service === "Phí quản lý") return true;
                  if (serviceId === "parking" && p.service === "Phí gửi xe") return true;
                  if (serviceId === "maintenance" && p.service === "Phí bảo trì") return true;
                  return false;
                });
                const service = allServiceTypes.find(s => s.id === serviceId);
                return (
                  <div key={serviceId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{paymentItem?.service || service?.name}</p>
                      <p className="text-sm text-muted-foreground">{service?.description || ""}</p>
                    </div>
                    <span className="font-semibold">{(paymentItem?.amount || service?.amount || 0).toLocaleString('vi-VN')} VNĐ</span>
                  </div>
                );
              })}
            </div>

            {/* Payment Info */}
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span>Tổng tiền:</span>
                <span className="text-lg font-semibold">{totalAmount.toLocaleString('vi-VN')} VNĐ</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Phương thức:</span>
                <span>{paymentMethods.find(m => m.id === paymentMethod)?.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Ngày thanh toán:</span>
                <span>{new Date().toLocaleDateString('vi-VN')}</span>
              </div>
            </div>

            {/* QR Code hoặc Thông tin chuyển khoản */}
            {paymentMethod === "qr_code" && (
              <div className="p-4 border rounded-lg space-y-4">
                <div className="text-center">
                  <h3 className="font-semibold mb-3">Quét mã QR để thanh toán</h3>
                  <div className="w-64 h-64 bg-gray-100 border-2 border-dashed border-gray-300 mx-auto flex items-center justify-center mb-4">
                    <div className="text-center space-y-2">
                      <QrCode className="h-32 w-32 mx-auto text-gray-400" />
                      <p className="text-sm text-muted-foreground">QR Code</p>
                      <p className="text-xs text-muted-foreground">Scan với ứng dụng ngân hàng</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold">{totalAmount.toLocaleString('vi-VN')} VNĐ</p>
                </div>
              </div>
            )}

            {paymentMethod === "bank_transfer" && (
              <div className="p-4 border rounded-lg space-y-3">
                <h3 className="font-semibold mb-3">Thông tin chuyển khoản</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ngân hàng:</span>
                    <span className="font-semibold">Vietcombank</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Số tài khoản:</span>
                    <span className="font-semibold font-mono">1234567890</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Chủ tài khoản:</span>
                    <span className="font-semibold">Chung cư Blue Moon</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nội dung:</span>
                    <span className="font-semibold font-mono">PAY {new Date().getTime()}</span>
                  </div>
                  <div className="pt-3 border-t">
                    <div className="flex justify-between">
                      <span className="font-semibold">Số tiền:</span>
                      <span className="text-lg font-bold text-green-600">{totalAmount.toLocaleString('vi-VN')} VNĐ</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex-1"
                disabled={isProcessing}
              >
                Quay lại
              </Button>
              <Button
                onClick={handleCompletePayment}
                disabled={isProcessing}
                className="flex-1"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Xác nhận thanh toán
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Lọc lịch sử theo từ khóa tìm kiếm
  const normalized = (v: string) => (v || "").toLowerCase();
  const filteredHistory = paymentHistoryList.filter((item) => {
    if (!historyQuery) return true;
    const q = normalized(historyQuery);
    return (
      normalized(item.service).includes(q) ||
      normalized(item.invoice).includes(q) ||
      normalized(item.method).includes(q) ||
      normalized(item.date).includes(q)
    );
  });

  const completedHistory = filteredHistory.filter((p) => p.status === "completed");
  const pendingHistory = filteredHistory.filter((p) => p.status === "pending");

  return (
    <div className="space-y-6">
      {/* Payment Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{totalAmount.toLocaleString('vi-VN')} VNĐ</p>
                <p className="text-muted-foreground">Tổng thanh toán</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">31/10/2025</p>
                <p className="text-muted-foreground">Hạn thanh toán</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{paymentHistoryList.filter(item => item.status === "pending").length}</p>
                <p className="text-muted-foreground">Dịch vụ chưa thanh toán</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Service Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Chọn dịch vụ cần thanh toán</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {paymentHistoryList.filter(item => item.status === "pending").length > 0 ? (
              paymentHistoryList
                .filter(item => item.status === "pending")
                .map((item) => {
                  // Tìm service tương ứng từ allServiceTypes
                  const service = allServiceTypes.find(s => {
                    if (item.service === "Tiền điện") return s.id === "electricity";
                    if (item.service === "Tiền nước") return s.id === "water";
                    if (item.service === "Phí quản lý") return s.id === "management";
                    if (item.service === "Phí gửi xe") return s.id === "parking";
                    if (item.service === "Phí bảo trì") return s.id === "maintenance";
                    return s.name === item.service;
                  });
                  const serviceId = service?.id || item.service;
                  return (
                    <div key={item.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                      <Checkbox
                        id={serviceId}
                        checked={selectedServices.includes(serviceId)}
                        onCheckedChange={() => handleServiceToggle(serviceId)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={serviceId} className="font-medium cursor-pointer">
                            {item.service}
                          </Label>
                          <span className="font-semibold text-lg">
                            {item.amount.toLocaleString('vi-VN')} VNĐ
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {service?.description || ""}
                        </p>
                      </div>
                    </div>
                  );
                })
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Không còn dịch vụ nào cần thanh toán!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle>Phương thức thanh toán</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {paymentMethods.map((method) => {
              const MethodIcon = method.icon;
              return (
                <div key={method.id} className="flex items-center space-x-3 p-4 border rounded-lg">
                  <input
                    type="radio"
                    id={method.id}
                    name="paymentMethod"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="h-4 w-4"
                  />
                  <MethodIcon className="h-5 w-5 text-muted-foreground" />
                  <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                    {method.name}
                  </Label>
                </div>
              );
            })}
            
            <div className="pt-4 border-t">
              <Button 
                onClick={handlePayment}
                disabled={isProcessing || selectedServices.length === 0 || !paymentMethod}
                className="w-full"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Thanh toán {totalAmount.toLocaleString('vi-VN')} VNĐ
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử thanh toán</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search bar for history */}
          <div className="mb-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Tìm kiếm theo dịch vụ, mã hóa đơn, phương thức hoặc ngày..."
                value={historyQuery}
                onChange={(e) => setHistoryQuery(e.target.value)}
                className="pr-4 pl-16 w-full"
                style={{ paddingLeft: "3.5rem" }}
              />
            </div>
          </div>
          <div className="space-y-4">
            {/* Paid Services */}
            <div className="space-y-3">
              <h3 className="font-semibold">Đã thanh toán:</h3>
              {completedHistory.map((payment) => {
              const StatusIcon = getStatusIcon(payment.status);
              return (
                <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg bg-green-50/50">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="p-2 rounded-full bg-green-100">
                        <Receipt className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold">{payment.service}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-muted-foreground">{payment.date}</p>
                        <span className="text-muted-foreground">•</span>
                        <p className="text-muted-foreground">{payment.method}</p>
                        <span className="text-muted-foreground">•</span>
                        <p className="text-muted-foreground">{payment.invoice}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-lg">
                      {payment.amount.toLocaleString('vi-VN')} VNĐ
                    </span>
                    <Badge className={getStatusColor(payment.status)}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      Hoàn thành
                    </Badge>
                  </div>
                </div>
              );
            })}
            </div>

            {/* Unpaid Services */}
            <div className="space-y-3 mt-6">
              <h3 className="font-semibold">Chưa thanh toán:</h3>
              {pendingHistory.map((payment) => {
              const StatusIcon = getStatusIcon(payment.status);
              return (
                <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50/50 border-yellow-200">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="p-2 rounded-full bg-yellow-100">
                        <Receipt className="h-5 w-5 text-yellow-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold">{payment.service}</h3>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-lg">
                      {payment.amount.toLocaleString('vi-VN')} VNĐ
                    </span>
                    <Badge className={getStatusColor(payment.status)}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      Chờ xử lý
                    </Badge>
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

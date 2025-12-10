// Shared bills data and state management

export interface BillDetail {
  item: string;
  amount: number;
}

export interface Bill {
  id: number;
  type: string;
  amount: number;
  dueDate: string;
  status: 'Paid' | 'Pending';
  paidDate: string | null;
  period: string;
  details: BillDetail[];
  apartmentNumber?: string;
  residentName?: string;
}

// Helpers to build periods/dates (fixed to tháng 11 & 10 theo yêu cầu)
const currentYear = new Date().getFullYear();
const currentMonth = 11; // Tháng 11
const prevMonth = 10; // Tháng 10
const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
const formatPeriod = (month: number, year: number) => `Tháng ${month}/${year}`;
const formatDate = (year: number, month: number, day: number) =>
  `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

const initialBills: Bill[] = [
  // Tháng 11 - gộp tất cả phí thành 1 hóa đơn tháng
  { 
    id: 1, 
    type: 'Hóa đơn tháng', 
    amount: 15800000, 
    dueDate: formatDate(currentYear, currentMonth, 1), 
    status: 'Pending', 
    paidDate: null,
    period: formatPeriod(currentMonth, currentYear),
    details: [
      { item: 'Tiền thuê căn hộ', amount: 12000000 },
      { item: 'Phí quản lý', amount: 2000000 },
      { item: 'Phí dịch vụ chung', amount: 1000000 },
      { item: 'Điện', amount: 300000 },
      { item: 'Nước', amount: 150000 },
      { item: 'Internet', amount: 50000 },
      { item: 'Phí gửi xe máy', amount: 200000 },
      { item: 'Phí gửi xe đạp', amount: 100000 },
    ]
  },

  // Tháng 10 - gộp tất cả phí thành 1 hóa đơn tháng đã thanh toán
  { 
    id: 2, 
    type: 'Hóa đơn tháng', 
    amount: 15450000, 
    dueDate: formatDate(prevYear, prevMonth, 1), 
    status: 'Paid', 
    paidDate: formatDate(prevYear, prevMonth, 28),
    period: formatPeriod(prevMonth, prevYear),
    details: [
      { item: 'Tiền thuê căn hộ', amount: 12000000 },
      { item: 'Phí quản lý', amount: 2000000 },
      { item: 'Phí dịch vụ chung', amount: 1000000 },
      { item: 'Điện', amount: 280000 },
      { item: 'Nước', amount: 120000 },
      { item: 'Internet', amount: 50000 },
      { item: 'Phí gửi xe máy', amount: 200000 },
      { item: 'Phí gửi xe đạp', amount: 100000 },
    ]
  },
];

// Store bills in memory (in production, this would be from API/localStorage)
let billsState: Bill[] = [...initialBills];

// Listeners for state changes
const listeners: Array<(bills: Bill[]) => void> = [];

export const getBills = (): Bill[] => {
  return billsState;
};

export const addBill = (bill: Omit<Bill, 'id'>): Bill => {
  const newBill: Bill = { ...bill, id: Date.now() };
  billsState = [newBill, ...billsState];
  notifyListeners();
  return newBill;
};

export const payBill = (id: number): Bill | null => {
  const bill = billsState.find(b => b.id === id);
  if (!bill || bill.status === 'Paid') {
    return null;
  }

  const today = new Date();
  const paidDate = today.toISOString().split('T')[0];
  
  billsState = billsState.map(b => 
    b.id === id ? { ...b, status: 'Paid' as const, paidDate } : b
  );
  
  notifyListeners();
  return billsState.find(b => b.id === id) || null;
};

export const subscribe = (callback: (bills: Bill[]) => void): (() => void) => {
  listeners.push(callback);
  return () => {
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
};

const notifyListeners = (): void => {
  listeners.forEach(callback => callback([...billsState]));
};

// Export bills to CSV
export const exportToCSV = (bills: Bill[]): void => {
  const headers = ['Loại hóa đơn', 'Kỳ', 'Số tiền', 'Hạn thanh toán', 'Trạng thái', 'Ngày thanh toán'];
  const rows = bills.map(bill => [
    bill.type,
    bill.period,
    bill.amount.toLocaleString('vi-VN'),
    bill.dueDate,
    bill.status === 'Paid' ? 'Đã thanh toán' : 'Chưa thanh toán',
    bill.paidDate || '-'
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Add BOM for UTF-8 to support Vietnamese characters
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `hoa_don_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Reset to initial state (useful for testing)
export const resetBills = (): void => {
  billsState = [...initialBills];
  notifyListeners();
};




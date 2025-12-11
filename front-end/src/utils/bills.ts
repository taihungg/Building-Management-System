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

const initialBills: Bill[] = [
  { 
    id: 1, 
    type: 'Hóa đơn tháng', 
    amount: 15800000, 
    dueDate: '2025-07-05', 
    status: 'Pending', 
    paidDate: null,
    period: 'Tháng 7/2025',
    apartmentNumber: '304',
    residentName: 'Nguyễn Văn A',
    details: [
      { item: 'Tiền thuê căn hộ', amount: 12000000 },
      { item: 'Phí quản lý', amount: 2000000 },
      { item: 'Phí dịch vụ chung', amount: 1000000 },
      { item: 'Điện', amount: 300000 },
      { item: 'Nước', amount: 150000 },
      { item: 'Internet', amount: 50000 },
      { item: 'Phí gửi xe', amount: 300000 },
    ]
  },
  { 
    id: 2, 
    type: 'Hóa đơn tháng', 
    amount: 15450000, 
    dueDate: '2025-06-05', 
    status: 'Paid', 
    paidDate: '2025-06-03',
    period: 'Tháng 6/2025',
    apartmentNumber: '304',
    residentName: 'Nguyễn Văn A',
    details: [
      { item: 'Tiền thuê căn hộ', amount: 12000000 },
      { item: 'Phí quản lý', amount: 2000000 },
      { item: 'Phí dịch vụ chung', amount: 1000000 },
      { item: 'Điện', amount: 280000 },
      { item: 'Nước', amount: 120000 },
      { item: 'Internet', amount: 50000 },
      { item: 'Phí gửi xe', amount: 450000 },
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

// Pay all pending/overdue bills in a period (month)
export const payBillsInPeriod = (period: string): Bill[] => {
  const today = new Date().toISOString().split('T')[0];
  const paid: Bill[] = [];
  billsState = billsState.map(b => {
    if (b.period === period && b.status === 'Pending') {
      const updated = { ...b, status: 'Paid' as const, paidDate: today };
      paid.push(updated);
      return updated;
    }
    return b;
  });
  if (paid.length > 0) {
    notifyListeners();
  }
  return paid;
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

// Add a new bill
export const addBill = (bill: Omit<Bill, 'id'>): Bill => {
  const newId = Math.max(...billsState.map(b => b.id), 0) + 1;
  const newBill: Bill = {
    ...bill,
    id: newId,
  };
  billsState = [...billsState, newBill];
  notifyListeners();
  return newBill;
};

// Reset to initial state (useful for testing)
export const resetBills = (): void => {
  billsState = [...initialBills];
  notifyListeners();
};




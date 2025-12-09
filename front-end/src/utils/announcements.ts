// Shared announcements data and state management

export interface Announcement {
  id: number;
  type: 'alert' | 'info' | 'success';
  icon: any;
  title: string;
  message: string;
  time: string;
  date: string;
  createdAt: string; // ISO timestamp for real-time calculation
  read: boolean;
  color: 'orange' | 'blue' | 'emerald';
}

// Helper to create date 2 hours ago
const twoHoursAgo = new Date();
twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);

// Helper to create date 1 day ago
const oneDayAgo = new Date();
oneDayAgo.setDate(oneDayAgo.getDate() - 1);

// Helper to create date 3 days ago
const threeDaysAgo = new Date();
threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

// Helper to create date 5 days ago
const fiveDaysAgo = new Date();
fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

// Helper to create date 1 week ago
const oneWeekAgo = new Date();
oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

const currentYear = new Date().getFullYear();
const initialAnnouncements: Announcement[] = [
  { 
    id: 1, 
    type: 'alert', 
    icon: null, // Will be set in component
    title: 'Thông báo về việc bảo trì thang máy', 
    message: 'BQT thông báo sẽ tiến hành bảo trì thang máy từ 8h-12h ngày 15/07/2024. Quý cư dân vui lòng sử dụng thang máy khác trong thời gian này. Việc bảo trì này nhằm đảm bảo an toàn và hiệu quả hoạt động của hệ thống thang máy trong tòa nhà.', 
    time: '2 giờ trước', 
    date: `${currentYear}-07-10`,
    createdAt: twoHoursAgo.toISOString(),
    read: false, 
    color: 'orange' 
  },
  { 
    id: 2, 
    type: 'info', 
    icon: null,
    title: 'Thông báo về việc thu phí dịch vụ tháng 7', 
    message: 'Các khoản phí dịch vụ tháng 7 đã được tính toán và gửi đến các căn hộ. Quý cư dân vui lòng thanh toán trước ngày 05/07/2024. Các khoản phí bao gồm: tiền thuê nhà, phí quản lý, phí dịch vụ chung, điện, nước và các dịch vụ khác.', 
    time: '1 ngày trước', 
    date: `${currentYear}-07-09`,
    createdAt: oneDayAgo.toISOString(),
    read: false, 
    color: 'blue' 
  },
  { 
    id: 3, 
    type: 'info', 
    icon: null,
    title: 'Thông báo về nội quy sử dụng khu vực chung', 
    message: 'Nhắc nhở cư dân tuân thủ nội quy sử dụng khu vực chung và giữ gìn vệ sinh. Vui lòng không để rác tại hành lang và khu vực chung. Mọi vi phạm sẽ được xử lý theo quy định của tòa nhà.', 
    time: '3 ngày trước', 
    date: `${currentYear}-07-07`,
    createdAt: threeDaysAgo.toISOString(),
    read: true, 
    color: 'blue' 
  },
  { 
    id: 4, 
    type: 'success', 
    icon: null,
    title: 'Hoàn thành bảo trì hệ thống điện', 
    message: 'BQT thông báo đã hoàn thành việc bảo trì hệ thống điện của tòa nhà. Hệ thống đã hoạt động bình thường. Cảm ơn quý cư dân đã kiên nhẫn trong thời gian bảo trì.', 
    time: '5 ngày trước', 
    date: `${currentYear}-07-05`,
    createdAt: fiveDaysAgo.toISOString(),
    read: true, 
    color: 'emerald' 
  },
  { 
    id: 5, 
    type: 'info', 
    icon: null,
    title: 'Lịch họp cư dân tháng 7', 
    message: 'Cuộc họp cư dân tháng 7 sẽ được tổ chức vào lúc 19h00 ngày 20/07/2024 tại phòng họp tầng 1. Mời tất cả cư dân tham gia để cùng thảo luận các vấn đề liên quan đến tòa nhà.', 
    time: '1 tuần trước', 
    date: `${currentYear}-07-03`,
    createdAt: oneWeekAgo.toISOString(),
    read: true, 
    color: 'blue' 
  },
];

// Store announcements in memory (in production, this would be from API/localStorage)
let announcementsState: Announcement[] = [...initialAnnouncements];

// Listeners for state changes
const listeners: Array<(announcements: Announcement[]) => void> = [];

export const getAnnouncements = (): Announcement[] => {
  return announcementsState;
};

export const markAsRead = (id: number): void => {
  announcementsState = announcementsState.map(ann => 
    ann.id === id ? { ...ann, read: true } : ann
  );
  notifyListeners();
};

export const markAllAsRead = (): void => {
  announcementsState = announcementsState.map(ann => ({ ...ann, read: true }));
  notifyListeners();
};

export const getUnreadCount = (): number => {
  return announcementsState.filter(ann => !ann.read).length;
};

export const subscribe = (callback: (announcements: Announcement[]) => void): (() => void) => {
  listeners.push(callback);
  return () => {
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
};

const notifyListeners = (): void => {
  listeners.forEach(callback => callback([...announcementsState]));
};

// Add new announcement
export const addAnnouncement = (announcement: Omit<Announcement, 'id' | 'createdAt' | 'time' | 'date'>): void => {
  const newId = Math.max(...announcementsState.map(a => a.id), 0) + 1;
  const now = new Date();
  const newAnnouncement: Announcement = {
    ...announcement,
    id: newId,
    createdAt: now.toISOString(),
    time: 'Vừa xong',
    date: now.toISOString().split('T')[0],
  };
  announcementsState = [newAnnouncement, ...announcementsState];
  notifyListeners();
};

// Reset to initial state (useful for testing)
export const resetAnnouncements = (): void => {
  announcementsState = [...initialAnnouncements];
  notifyListeners();
};


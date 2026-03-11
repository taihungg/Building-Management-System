import { Menu, Search, Bell, Clock, ChevronLeft, ChevronRight } from 'lucide-react'; // Import icon Clock
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatRelativeTime } from '../utils/timeUtils';

interface HeaderProps {
  onMenuClick: () => void;
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
}

// Hàm tiện ích để định dạng thời gian
const formatTime = (date: Date) => {
  // Định dạng giờ:phút:giây và Ngày, Tháng, Năm (dùng locale 'vi-VN' để đảm bảo tiếng Việt)
  const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };

  const timeStr = date.toLocaleTimeString('vi-VN', timeOptions);
  const dateStr = date.toLocaleDateString('vi-VN', dateOptions);

  return { timeStr, dateStr };
};

type HeaderNotificationItem = {
  id: string;
  title: string;
  message?: string;
  createdAtIso?: string;
};

const management_NOTIFICATIONS_LAST_READ_AT_KEY = 'management_notifications_last_read_at';
const management_NOTIFICATIONS_READ_IDS_KEY = 'management_notifications_read_ids';

const parseLocalDateTime = (value: any): Date | null => {
  if (!value) return null;
  if (Array.isArray(value)) {
    const [year, month, day, hour = 0, minute = 0, second = 0, nano = 0] = value;
    const millisecond = Math.floor((Number(nano) || 0) / 1_000_000);
    return new Date(year, month - 1, day, hour, minute, second, millisecond);
  }
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  if (typeof value === 'object') {
    const year = value.year;
    const month = value.monthValue ?? value.month;
    const day = value.dayOfMonth ?? value.day;
    const hour = value.hour ?? 0;
    const minute = value.minute ?? 0;
    const second = value.second ?? 0;
    const nano = value.nano ?? 0;
    if (typeof year === 'number' && typeof month === 'number' && typeof day === 'number') {
      const millisecond = Math.floor((Number(nano) || 0) / 1_000_000);
      return new Date(year, month - 1, day, hour, minute, second, millisecond);
    }
  }
  return null;
};

export function Header({ onMenuClick, onNavigate, onLogout }: HeaderProps) {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(formatTime(new Date())); // State mới cho thời gian
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isNotificationLoading, setIsNotificationLoading] = useState(false);
  const [notificationError, setNotificationError] = useState<string | null>(null);
  const [notificationItems, setNotificationItems] = useState<HeaderNotificationItem[]>([]);
  const [notificationPage, setNotificationPage] = useState(0);
  const [notificationsLastReadAt, setNotificationsLastReadAt] = useState<string | null>(() => {
    try {
      return localStorage.getItem(management_NOTIFICATIONS_LAST_READ_AT_KEY);
    } catch {
      return null;
    }
  });
  const [readNotificationIds, setReadNotificationIds] = useState<Record<string, true>>(() => {
    try {
      const raw = localStorage.getItem(management_NOTIFICATIONS_READ_IDS_KEY);
      if (!raw) return {};
      const ids = JSON.parse(raw);
      if (!Array.isArray(ids)) return {};
      return Object.fromEntries(ids.map((id: any) => [String(id), true]));
    } catch {
      return {};
    }
  });

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(formatTime(new Date()));
    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, []);

  const handleNavigate = (page: string) => {
    if (page === 'logout') {
      onLogout?.();
      onNavigate?.(page);
      return;
    }

    if (onNavigate) {
      onNavigate(page);
      return;
    }

    if (page === 'dashboard') {
      navigate('/management/dashboard');
      return;
    }
    if (page === 'notifications') {
      navigate('/management/notifications');
      return;
    }
    if (page === 'profile') {
      navigate('/management/profile');
      return;
    }
    if (page === 'settings') {
      navigate('/management/settings');
      return;
    }
  };

  const handleProfileItemClick = (page: string) => {
    setIsProfileOpen(false);
    handleNavigate(page);
  };

  const latestNotificationIso = useMemo(() => {
    const first = notificationItems[0]?.createdAtIso;
    return first ?? null;
  }, [notificationItems]);

  const unreadNotifications = useMemo(() => {
    const lastReadMs = notificationsLastReadAt ? new Date(notificationsLastReadAt).getTime() : null;
    return notificationItems.filter((item: HeaderNotificationItem) => {
      if (readNotificationIds[item.id]) return false;
      if (!item.createdAtIso) return true;
      if (lastReadMs == null) return true;
      return new Date(item.createdAtIso).getTime() > lastReadMs;
    });
  }, [notificationItems, notificationsLastReadAt, readNotificationIds]);

  const hasNewNotifications = unreadNotifications.length > 0;

  const markDisplayedNotificationsAsRead = useCallback(() => {
    if (unreadNotifications.length === 0) return;

    const unreadIds = unreadNotifications.map((n: HeaderNotificationItem) => n.id);
    const latestUnreadIso = unreadNotifications
      .map((n: HeaderNotificationItem) => n.createdAtIso)
      .filter((v: string | undefined): v is string => Boolean(v))
      .sort()
      .at(-1);

    setReadNotificationIds((prev: Record<string, true>) => {
      const next: Record<string, true> = { ...prev };
      unreadIds.forEach((id: string) => {
        next[id] = true;
      });
      try {
        localStorage.setItem(management_NOTIFICATIONS_READ_IDS_KEY, JSON.stringify(Object.keys(next)));
      } catch { }
      return next;
    });

    if (latestUnreadIso) {
      setNotificationsLastReadAt(latestUnreadIso);
      try {
        localStorage.setItem(management_NOTIFICATIONS_LAST_READ_AT_KEY, latestUnreadIso);
      } catch { }
    }
  }, [unreadNotifications]);

  const closeNotifications = useCallback(
    (markRead: boolean) => {
      if (markRead) {
        markDisplayedNotificationsAsRead();
      }
      setIsNotificationOpen(false);
    },
    [markDisplayedNotificationsAsRead]
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        closeNotifications(true);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closeNotifications]);

  const fetchLatestNotifications = async () => {
    setIsNotificationLoading(true);
    setNotificationError(null);
    try {
      const response = await fetch('https://building-management-system.fly.dev/api/announcements/staff');
      if (!response.ok) {
        throw new Error('Không thể tải danh sách thông báo.');
      }
      const rawData = await response.json().catch(() => ({} as any));
      const rawAnnouncements = Array.isArray(rawData?.data) ? rawData.data : [];

      const transformed: HeaderNotificationItem[] = rawAnnouncements
        .map((announcement: any) => {
          const dateTime = parseLocalDateTime(announcement.createdDate);
          return {
            id: String(announcement.id ?? ''),
            title: String(announcement.title ?? ''),
            message: typeof announcement.message === 'string' ? announcement.message : undefined,
            createdAtIso: dateTime ? dateTime.toISOString() : undefined,
          };
        })
        .filter((x: HeaderNotificationItem) => x.id && x.title)
        .sort((a: HeaderNotificationItem, b: HeaderNotificationItem) => {
          const aMs = a.createdAtIso ? new Date(a.createdAtIso).getTime() : 0;
          const bMs = b.createdAtIso ? new Date(b.createdAtIso).getTime() : 0;
          return bMs - aMs;
        })
        .slice(0, 10);

      setNotificationItems(transformed);
    } catch (err: any) {
      setNotificationError(err?.message ?? 'Không thể tải danh sách thông báo.');
      setNotificationItems([]);
    } finally {
      setIsNotificationLoading(false);
    }
  };

  useEffect(() => {
    if (!isNotificationOpen) return;
    fetchLatestNotifications();
  }, [isNotificationOpen]);

  useEffect(() => {
    if (!isNotificationOpen) return;
    setNotificationPage(0);
  }, [isNotificationOpen]);

  const notificationPageSize = 4;
  const notificationTotalPages = useMemo(() => {
    if (unreadNotifications.length === 0) return 1;
    return Math.ceil(unreadNotifications.length / notificationPageSize);
  }, [unreadNotifications.length]);

  useEffect(() => {
    if (notificationPage < notificationTotalPages) return;
    setNotificationPage(0);
  }, [notificationPage, notificationTotalPages]);

  const notificationPagedItems = useMemo(() => {
    const start = notificationPage * notificationPageSize;
    return unreadNotifications.slice(start, start + notificationPageSize);
  }, [unreadNotifications, notificationPage]);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b-2 border-gray-100 z-30">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Trái: Nút Menu & Tên Tòa Nhà */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>

          <button
            onClick={() => handleNavigate('dashboard')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img src="/avatar.png" alt="Logo" className="w-10 h-10 rounded-lg object-contain" />
            <div className="text-left">
              <h1 className="text-xl text-gray-900 font-bold">BuildingHub</h1>
              <p className="text-xs text-gray-600">Cổng Quản Lý</p> {/* Dịch */}
            </div>
          </button>
        </div>

        {/* Giữa: Thanh Tìm Kiếm */}
        <div className="flex-1 max-w-2xl mx-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm cư dân, căn hộ, hóa đơn..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-gray-700 text-sm"
            />
          </div>
        </div>

        {/* Phải: Đồng hồ, Thông báo & Hồ sơ */}
        <div className="flex items-center gap-6">

          {/* Đồng hồ Thời gian Thực */}
          <div className="hidden sm:flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
            <Clock className="w-5 h-5 text-cyan-600" />
            <div className="text-sm">
              <p className="font-semibold text-gray-800">{currentTime.timeStr}</p>
              <p className="text-xs text-gray-500">{currentTime.dateStr}</p>
            </div>
          </div>

          {/* Chuông Thông Báo */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => {
                if (isNotificationOpen) {
                  closeNotifications(true);
                } else {
                  setIsNotificationOpen(true);
                }
              }}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="w-6 h-6 text-gray-700" />
              {hasNewNotifications && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>

            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-[min(640px,calc(100vw-24px))] bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Thông báo</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Cập nhật mới nhất từ hệ thống</p>
                  </div>
                  <button
                    onClick={() => {
                      markDisplayedNotificationsAsRead();
                      setIsNotificationOpen(false);
                      handleNavigate('notifications');
                    }}
                    className="text-sm text-cyan-700 hover:text-cyan-900 hover:underline font-medium"
                  >
                    Xem tất cả
                  </button>
                </div>

                <div className="border-t border-gray-100">
                  {isNotificationLoading ? (
                    <div className="p-6 text-sm text-gray-600">Đang tải...</div>
                  ) : notificationError ? (
                    <div className="p-6 text-sm text-red-600">{notificationError}</div>
                  ) : unreadNotifications.length === 0 ? (
                    <div className="p-6 text-sm text-gray-600">Không có thông báo mới</div>
                  ) : (
                    <div
                      className="overflow-auto"
                      style={{ maxHeight: 'min(340px, calc(100vh - 220px))' }}
                    >
                      {notificationPagedItems.map((item) => {
                        const timeLabel = item.createdAtIso ? formatRelativeTime(item.createdAtIso) : 'N/A';

                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              markDisplayedNotificationsAsRead();
                              setIsNotificationOpen(false);
                              handleNavigate('notifications');
                            }}
                            className="w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div
                                className="text-sm font-semibold text-gray-900 leading-5"
                                style={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                }}
                              >
                                {item.title}
                              </div>
                              <div className="text-xs text-gray-500 whitespace-nowrap pt-0.5">{timeLabel}</div>
                            </div>
                            {item.message ? (
                              <div
                                className="text-xs text-gray-600 mt-1 leading-5"
                                style={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                }}
                              >
                                {item.message}
                              </div>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-100 p-3 bg-gray-50 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setNotificationPage((p) => Math.max(0, p - 1))}
                      disabled={notificationPage === 0}
                      className="h-9 w-9 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div className="text-xs text-gray-600 tabular-nums">
                      Trang {notificationPage + 1}/{notificationTotalPages}
                    </div>
                    <button
                      onClick={() => setNotificationPage((p) => Math.min(notificationTotalPages - 1, p + 1))}
                      disabled={notificationPage >= notificationTotalPages - 1}
                      className="h-9 w-9 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => fetchLatestNotifications()}
                    className="text-sm font-medium text-gray-700 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-white transition-colors"
                  >
                    Tải lại
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Ảnh Đại Diện và Menu Tùy Chọn */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-white hover:bg-cyan-600 transition-colors"
            >
              <span className="text-sm font-medium">QL</span> {/* Dịch thành Quản Lý (QL) */}
            </button>

            {/* Menu Tùy Chọn Hồ Sơ */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden z-50">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">Tài Khoản Của Tôi</h3> {/* Dịch */}
                  <p className="text-sm text-gray-500">managementistrator@hub.vn</p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => handleProfileItemClick('profile')}
                    className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                  >
                    Hồ Sơ
                  </button>
                  <button
                    onClick={() => handleProfileItemClick('settings')}
                    className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                  >
                    Cài Đặt
                  </button>
                </div>
                <div className="border-t border-gray-100">
                  <button
                    onClick={() => handleProfileItemClick('logout')}
                    className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors font-medium"
                  >
                    Đăng Xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

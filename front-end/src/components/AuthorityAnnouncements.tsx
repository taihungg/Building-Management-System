import { useState, useEffect } from 'react';
import { Bell, AlertCircle, Search, FileText } from 'lucide-react';
import { getAnnouncements, subscribe as subscribeAnnouncements, type Announcement } from '../utils/announcements';
import { formatRelativeTime } from '../utils/timeUtils';

export function AuthorityAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Lọc chỉ các thông báo type "lost_item" (báo mất đồ)
    const filtered = getAnnouncements().filter(ann => ann.type === 'lost_item');
    setAnnouncements(filtered);

    const unsubscribe = subscribeAnnouncements((updated) => {
      const filtered = updated.filter(ann => ann.type === 'lost_item');
      setAnnouncements(filtered);
    });

    return unsubscribe;
  }, []);

  const filteredAnnouncements = announcements.filter(ann => {
    const searchLower = searchTerm.toLowerCase();
    return (
      ann.title.toLowerCase().includes(searchLower) ||
      ann.message.toLowerCase().includes(searchLower)
    );
  });

  const getStatusColor = (type: string) => {
    switch (type) {
      case 'lost_item':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Thông Báo Mất Đồ</h1>
          <p className="text-gray-600 mt-1">Theo dõi các thông báo về đồ vật bị mất trong tòa nhà</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm thông báo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {filteredAnnouncements.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border-2 border-gray-200 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Không có thông báo mất đồ nào</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map((announcement) => (
            <div
              key={announcement.id}
              className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-orange-300 transition-all shadow-sm hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getStatusColor(announcement.type)}`}>
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{announcement.title}</h3>
                      <p className="text-sm text-gray-500">{formatRelativeTime(announcement.createdAt)}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{announcement.message}</p>
                  <div className="mt-4 flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(announcement.type)}`}>
                      Báo Mất Đồ
                    </span>
                    <span className="text-xs text-gray-500">
                      {announcement.date}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


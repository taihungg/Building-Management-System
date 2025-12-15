import { useState } from 'react';
import { Camera, Mail, Phone, MapPin, Calendar, Briefcase, Save, Edit2, Shield } from 'lucide-react';

export function AuthorityProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: 'Nguyễn',
    lastName: 'Văn C',
    email: 'coquan@buildinghub.com',
    phone: '0901111111',
    address: 'Cơ Quan Chức Năng, Tòa nhà BuildingHub',
    position: 'Cán Bộ Cơ Quan Chức Năng',
    department: 'Phòng Quản Lý Cư Dân',
    joinDate: '2023-05-01',
    bio: 'Cán bộ chuyên trách quản lý cư dân và theo dõi các thông báo mất đồ trong tòa nhà.',
  });

  const handleSave = () => {
    setIsEditing(false);
    // Save logic here
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hồ Sơ Cơ Quan Chức Năng</h1>
          <p className="text-gray-600 mt-1">Quản lý thông tin cá nhân của bạn</p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
          >
            <Edit2 className="w-5 h-5" />
            Chỉnh sửa
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => setIsEditing(false)}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
            >
              <Save className="w-5 h-5" />
              Lưu thay đổi
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Avatar and Quick Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Avatar Card */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white text-4xl">
                  {formData.firstName[0]}{formData.lastName[0]}
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-all border-4 border-white">
                    <Camera className="w-5 h-5" />
                  </button>
                )}
              </div>
              <h2 className="text-xl text-gray-900 mt-4">
                {formData.firstName} {formData.lastName}
              </h2>
              <p className="text-gray-600 text-sm mt-1">{formData.position}</p>
              <div className="mt-4 w-full pt-4 border-t-2 border-gray-100">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Briefcase className="w-4 h-4" />
                    <span>{formData.department}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Bắt đầu từ {new Date(formData.joinDate).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Shield className="w-4 h-4" />
                    <span>Cơ Quan Chức Năng</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <h3 className="text-base text-gray-900 mb-4">Thống kê</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Cư dân đã quản lý</span>
                <span className="text-base text-gray-900 font-semibold">-</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Thông báo mất đồ</span>
                <span className="text-base text-gray-900 font-semibold">-</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Yêu cầu xử lý</span>
                <span className="text-base text-gray-900 font-semibold">-</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Thời gian làm việc</span>
                <span className="text-base text-gray-900 font-semibold">
                  {Math.floor((new Date().getTime() - new Date(formData.joinDate).getTime()) / (1000 * 60 * 60 * 24 * 30))} tháng
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Detailed Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <h3 className="text-xl text-gray-900 mb-6">Thông tin cá nhân</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Họ</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 disabled:bg-gray-100 disabled:text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Tên</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 disabled:bg-gray-100 disabled:text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!isEditing}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 disabled:bg-gray-100 disabled:text-gray-600"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Số điện thoại</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!isEditing}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 disabled:bg-gray-100 disabled:text-gray-600"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-700 mb-2">Địa chỉ</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    disabled={!isEditing}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 disabled:bg-gray-100 disabled:text-gray-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Work Information */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <h3 className="text-xl text-gray-900 mb-6">Thông tin công việc</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Chức vụ</label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 disabled:bg-gray-100 disabled:text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Phòng ban</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 disabled:bg-gray-100 disabled:text-gray-600"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-700 mb-2">Ngày bắt đầu</label>
                <input
                  type="date"
                  value={formData.joinDate}
                  onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 disabled:bg-gray-100 disabled:text-gray-600"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-700 mb-2">Giới thiệu</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  disabled={!isEditing}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 disabled:bg-gray-100 disabled:text-gray-600 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <h3 className="text-xl text-gray-900 mb-6">Bảo mật</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-900">Mật khẩu</p>
                  <p className="text-xs text-gray-600 mt-1">Đã thay đổi cách đây 2 tháng</p>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-all">
                  Đổi mật khẩu
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-900">Xác thực hai yếu tố</p>
                  <p className="text-xs text-gray-600 mt-1">Thêm lớp bảo mật bổ sung</p>
                </div>
                <button className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-all">
                  Bật
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


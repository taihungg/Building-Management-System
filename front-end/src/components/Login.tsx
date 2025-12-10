import { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, User, Shield, DollarSign } from 'lucide-react';

interface LoginProps {
  onLogin: (role: 'admin' | 'resident' | 'accounting') => void;
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'resident' | 'accounting' | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) {
      alert('Vui lòng chọn loại tài khoản');
      return;
    }
    // In a real app, you would validate credentials here
    onLogin(selectedRole);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl text-cyan-500 mb-2">BuildingHub</h1>
          <p className="text-gray-600">Apartment Management System</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-8 shadow-lg">
          <div className="mb-6">
            <h2 className="text-2xl text-gray-900 mb-1">Chào Mừng Trở Lại</h2>
            <p className="text-gray-600 text-sm">Vui lòng đăng nhập vào tài khoản của bạn</p>
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-sm text-gray-700 mb-3">Chọn loại tài khoản</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setSelectedRole('admin')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  selectedRole === 'admin'
                    ? 'border-cyan-500 bg-cyan-500 text-white shadow-lg'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Shield className="w-6 h-6" />
                <span className="text-sm font-medium">Quản Trị Viên</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('resident')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  selectedRole === 'resident'
                    ? 'border-cyan-500 bg-cyan-500 text-white shadow-lg'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <User className="w-6 h-6" />
                <span className="text-sm font-medium">Cư Dân</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('accounting')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  selectedRole === 'accounting'
                    ? 'border-cyan-500 bg-cyan-500 text-white shadow-lg'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <DollarSign className="w-6 h-6" />
                <span className="text-sm font-medium">Kế Toán</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm text-gray-700 mb-2">
                Địa chỉ Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email của bạn"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-gray-700"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm text-gray-700 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu của bạn"
                  className="w-full pl-12 pr-12 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-gray-700"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-2 border-gray-300 text-cyan-500 focus:ring-2 focus:ring-cyan-500"
                />
                <span className="text-sm text-gray-700">Ghi nhớ đăng nhập</span>
              </label>
              <button
                type="button"
                className="text-sm text-cyan-500 hover:text-cyan-600 transition-colors"
              >
                Quên mật khẩu?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-all"
            >
              Đăng Nhập
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Chưa có tài khoản?{' '}
              <button className="text-cyan-500 hover:text-cyan-600 transition-colors">
                Đăng ký ngay
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          © 2024 BuildingHub. All rights reserved.
        </div>
      </div>
    </div>
  );
}

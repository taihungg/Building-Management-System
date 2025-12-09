import { useState, useEffect } from 'react';
import { Lock, Mail, Eye, EyeOff, User, Shield } from 'lucide-react'; // Calculator temporarily disabled

interface LoginProps {
  onLogin: (role: 'admin' | 'resident' | 'accountant') => void; // accountant temporarily disabled
  onNavigateAuth?: (page: 'login' | 'signup' | 'forgot') => void;
}

export function Login({ onLogin, onNavigateAuth }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'resident' | 'accountant' | null>(null); // accountant temporarily disabled

  // Đặt URL về /login khi đang ở trang đăng nhập nếu chưa có route khác
  useEffect(() => {
    if (window.location.pathname !== '/login' && window.location.pathname !== '/signup' && window.location.pathname !== '/forgot') {
      window.history.replaceState({}, '', '/login');
    }
  }, []);

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
    <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ backgroundColor: '#F0F9FF' }}>
      <div className="w-full max-w-md">
        {/* Logo/Brand - Outside card */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#21C2E3' }}>BuildingHub</h1>
          <p className="text-gray-500 text-sm">Apartment Management System</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          {/* Welcome Section */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-1">Chào Mừng Trở Lại</h2>
            <p className="text-gray-600 text-sm">Vui lòng đăng nhập vào tài khoản của bạn</p>
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Chọn loại tài khoản</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedRole('admin')}
                style={{
                  backgroundColor: selectedRole === 'admin' ? '#21C2E3' : 'white',
                  borderColor: selectedRole === 'admin' ? '#21C2E3' : '#E5E7EB',
                  color: selectedRole === 'admin' ? 'white' : '#374151',
                }}
                className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 ${
                  selectedRole === 'admin' ? 'shadow-md' : ''
                }`}
              >
                <Shield 
                  className="w-6 h-6" 
                  style={{ color: selectedRole === 'admin' ? 'white' : '#4B5563' }}
                />
                <span className="text-sm font-medium" style={{ color: selectedRole === 'admin' ? 'white' : '#374151' }}>
                  Quản Trị Viên
                </span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('resident')}
                style={{
                  backgroundColor: selectedRole === 'resident' ? '#21C2E3' : 'white',
                  borderColor: selectedRole === 'resident' ? '#21C2E3' : '#E5E7EB',
                  color: selectedRole === 'resident' ? 'white' : '#374151',
                }}
                className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 ${
                  selectedRole === 'resident' ? 'shadow-md' : ''
                }`}
              >
                <User 
                  className="w-6 h-6" 
                  style={{ color: selectedRole === 'resident' ? 'white' : '#4B5563' }}
                />
                <span className="text-sm font-medium" style={{ color: selectedRole === 'resident' ? 'white' : '#374151' }}>
                  Cư Dân
                </span>
              </button>
              {/* Accountant role temporarily disabled */}
              {/* <button
                type="button"
                onClick={() => setSelectedRole('accountant')}
                style={{
                  backgroundColor: selectedRole === 'accountant' ? '#21C2E3' : 'white',
                  borderColor: selectedRole === 'accountant' ? '#21C2E3' : '#E5E7EB',
                  color: selectedRole === 'accountant' ? 'white' : '#374151',
                }}
                className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 ${
                  selectedRole === 'accountant' ? 'shadow-md' : ''
                }`}
              >
                <Calculator 
                  className="w-6 h-6" 
                  style={{ color: selectedRole === 'accountant' ? 'white' : '#4B5563' }}
                />
                <span className="text-sm font-medium" style={{ color: selectedRole === 'accountant' ? 'white' : '#374151' }}>
                  Kế Toán
                </span>
              </button> */}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#21C2E3] focus:border-[#21C2E3] text-gray-700 placeholder-gray-400"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full pl-12 pr-12 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#21C2E3] focus:border-[#21C2E3] text-gray-700 placeholder-gray-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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
                  className="w-4 h-4 rounded border-2 border-gray-300 text-[#21C2E3] focus:ring-2 focus:ring-[#21C2E3] cursor-pointer"
                />
                <span className="text-sm text-gray-700">Ghi nhớ đăng nhập</span>
              </label>
              <button
                type="button"
                className="text-sm transition-colors font-medium"
                style={{ color: '#21C2E3' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#15A9CA'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#21C2E3'}
                onClick={() => {
                  onNavigateAuth?.('forgot');
                  window.history.pushState({}, '', '/forgot');
                }}
              >
                Quên mật khẩu?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full py-3 text-white rounded-lg transition-all font-medium shadow-md"
              style={{ backgroundColor: '#21C2E3' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#15A9CA'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#21C2E3'}
            >
              Đăng Nhập
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Chưa có tài khoản?{' '}
              <button 
                className="transition-colors font-medium"
                style={{ color: '#21C2E3' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#15A9CA'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#21C2E3'}
              onClick={() => {
                onNavigateAuth?.('signup');
                window.history.pushState({}, '', '/signup');
              }}
              >
                Đăng ký ngay
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

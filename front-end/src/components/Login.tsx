import { useState, useEffect } from 'react';
import { Lock, User, Eye, EyeOff, Mail } from 'lucide-react'; 
import React from 'react';
import { toast } from 'sonner'; // Chú nhớ cài sonner hoặc dùng alert bình thường nhé
import { authProvider } from './auth';

interface LoginProps {
  // OnLogin bây giờ sẽ nhận object chứa role và thông tin user
  onLogin: (data: { role: string; accountId: string; personId: string }) => void;
  onNavigateAuth?: (page: 'login' | 'signup' | 'forgot') => void;
}

export function Login({ onLogin, onNavigateAuth }: LoginProps) {
  // 1. Chuyển từ email sang username cho đúng ảnh DB chú gửi
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('https://untoasted-jean-unsympathisingly.ngrok-free.dev/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true' // Vượt rào ngrok
        },
        body: JSON.stringify({
          username: username,
          password: password
        })
      });

      const res = await response.json();

      if (response.ok && res.statusCode === 200) {
        // 2. Lưu thông tin đăng nhập vào máy (localStorage)
        localStorage.setItem('user_role', res.data.role);
        localStorage.setItem('account_id', res.data.accountId);
        localStorage.setItem('person_id',res.data.personId);
        
        toast.success("Đăng nhập thành công!");
        authProvider.saveAuthData(res.data.role, res.data.accountId, res.data.personId);
        // 3. Trả dữ liệu về cho App để chuyển trang
        onLogin({
          role: res.data.role,
          accountId: res.data.accountId,
          personId: res.data.personId
        });
      } else {
        toast.error(res.message || "Tài khoản hoặc mật khẩu không đúng");
      }
    } catch (error) {
      console.log(error); // Log lỗi chuẩn chú dặn
      toast.error("Không thể kết nối đến máy chủ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ backgroundColor: '#F0F9FF' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#21C2E3' }}>BuildingHub</h1>
          <p className="text-gray-500 text-sm">Quản lý chung cư thông minh</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-1">Chào Mừng Trở Lại</h2>
            <p className="text-gray-600 text-sm">Vui lòng đăng nhập với tài khoản được cấp</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Input - Thay cho Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tên đăng nhập</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="management, accountant..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#21C2E3] focus:border-[#21C2E3] text-gray-700"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  className="w-full pl-12 pr-12 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#21C2E3] focus:border-[#21C2E3] text-gray-700"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 text-white rounded-lg font-medium shadow-md transition-all ${isLoading ? 'bg-gray-400' : ''}`}
              style={{ backgroundColor: isLoading ? '#9ca3af' : '#21C2E3' }}
            >
              {isLoading ? 'Đang xác thực...' : 'Đăng Nhập'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
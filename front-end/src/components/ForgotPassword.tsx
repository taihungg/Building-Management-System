import { useState } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';

interface ForgotPasswordProps {
  onBack: () => void;
}

export function ForgotPassword({ onBack }: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const primary = '#21C2E3';
  const primaryHover = '#15A9CA';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu (giả lập).');
    onBack();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ backgroundColor: '#F0F9FF' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: primary }}>BuildingHub</h1>
          <p className="text-gray-500 text-sm">Apartment Management System</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <button onClick={onBack} className="flex items-center gap-1 text-gray-600 hover:text-gray-800">
              <ArrowLeft className="w-4 h-4" /> Quay lại đăng nhập
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-1">Quên mật khẩu</h2>
            <p className="text-gray-600 text-sm">Nhập email để nhận hướng dẫn đặt lại mật khẩu</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email của bạn"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#21C2E3] focus:border-[#21C2E3] text-gray-700 placeholder-gray-400"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 text-white rounded-lg transition-all font-medium shadow-md"
              style={{ backgroundColor: primary }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = primaryHover}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = primary}
            >
              Gửi hướng dẫn
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}


import { FileText, AlertCircle, CheckCircle, Info, BookOpen } from 'lucide-react';
import { useState } from 'react';

interface Rule {
  id: number;
  category: string;
  title: string;
  description: string;
  icon: 'info' | 'alert' | 'check';
}

const buildingRules: Rule[] = [
  {
    id: 1,
    category: 'An toàn & Bảo mật',
    title: 'Quy định về an toàn cháy nổ',
    description: 'Cư dân không được để các vật dụng dễ cháy ở hành lang, cầu thang. Không hút thuốc trong khu vực chung. Phải tuân thủ các quy định về phòng cháy chữa cháy.',
    icon: 'alert'
  },
  {
    id: 2,
    category: 'Giờ giấc',
    title: 'Quy định về giờ giấc sinh hoạt',
    description: 'Từ 22:00 - 06:00, cư dân cần giữ yên tĩnh, không gây tiếng ồn ảnh hưởng đến hàng xóm. Các hoạt động sửa chữa chỉ được thực hiện từ 08:00 - 18:00 trong ngày thường.',
    icon: 'info'
  },
  {
    id: 3,
    category: 'Vệ sinh & Môi trường',
    title: 'Quy định về vệ sinh chung',
    description: 'Rác thải phải được phân loại và bỏ đúng nơi quy định. Không vứt rác bừa bãi trong khu vực chung. Giữ gìn vệ sinh hành lang, thang máy, sân chung.',
    icon: 'check'
  },
  {
    id: 4,
    category: 'Giao thông',
    title: 'Quy định về đỗ xe',
    description: 'Xe phải đỗ đúng vị trí được phân bổ. Không đỗ xe ở lối đi, cửa thoát hiểm. Tốc độ trong khu vực chung không quá 10km/h. Tuân thủ biển báo giao thông.',
    icon: 'alert'
  },
  {
    id: 5,
    category: 'Sử dụng dịch vụ',
    title: 'Quy định về sử dụng thang máy',
    description: 'Ưu tiên người già, trẻ em, phụ nữ có thai. Không sử dụng thang máy để vận chuyển hàng hóa cồng kềnh trong giờ cao điểm. Báo ngay khi phát hiện sự cố.',
    icon: 'info'
  },
  {
    id: 6,
    category: 'An toàn & Bảo mật',
    title: 'Quy định về khách đến thăm',
    description: 'Khách đến thăm phải đăng ký tại bảo vệ. Không cho người lạ vào tòa nhà. Cư dân chịu trách nhiệm về hành vi của khách mời.',
    icon: 'alert'
  },
  {
    id: 7,
    category: 'Sử dụng dịch vụ',
    title: 'Quy định về sử dụng điện nước',
    description: 'Sử dụng tiết kiệm điện, nước. Không tự ý sửa chữa hệ thống điện nước chung. Báo ngay khi phát hiện rò rỉ hoặc sự cố.',
    icon: 'check'
  },
  {
    id: 8,
    category: 'Vệ sinh & Môi trường',
    title: 'Quy định về nuôi thú cưng',
    description: 'Chỉ được nuôi thú cưng với sự đồng ý của ban quản lý. Phải đảm bảo vệ sinh, không để thú cưng gây ồn hoặc làm phiền hàng xóm. Dắt thú cưng bằng dây xích khi ra ngoài.',
    icon: 'info'
  }
];

const iconMap = {
  info: Info,
  alert: AlertCircle,
  check: CheckCircle,
};

export function BuildingRules() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null);

  const categories = ['all', ...Array.from(new Set(buildingRules.map(rule => rule.category)))];
  
  const filteredRules = selectedCategory === 'all' 
    ? buildingRules 
    : buildingRules.filter(rule => rule.category === selectedCategory);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gray-900">Nội Quy Chung Cư</h1>
          <p className="text-gray-600 mt-1">Các quy định và nội quy cần tuân thủ khi sinh sống tại tòa nhà</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-gray-600 text-sm">Tổng số quy định</p>
          </div>
          <p className="text-2xl text-gray-900">{buildingRules.length}</p>
        </div>

        <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-gray-600 text-sm">Quy định an toàn</p>
          </div>
          <p className="text-2xl text-gray-900">{buildingRules.filter(r => r.category.includes('An toàn')).length}</p>
        </div>

        <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-gray-600 text-sm">Danh mục</p>
          </div>
          <p className="text-2xl text-gray-900">{categories.length - 1}</p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-6 py-3 rounded-xl transition-all ${
              selectedCategory === category
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {category === 'all' ? 'Tất cả' : category}
          </button>
        ))}
      </div>

      {/* Rules List */}
      <div className="space-y-3">
        {filteredRules.map((rule) => {
          const Icon = iconMap[rule.icon];
          
          return (
            <div 
              key={rule.id} 
              onClick={() => setSelectedRule(rule)}
              className="bg-white rounded-2xl p-6 border-2 border-gray-200 transition-all hover:shadow-md cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0 ${
                  rule.icon === 'alert' ? 'from-orange-400 to-orange-600' :
                  rule.icon === 'check' ? 'from-emerald-400 to-emerald-600' :
                  'from-blue-400 to-blue-600'
                }`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg mb-2 inline-block">
                        {rule.category}
                      </span>
                      <h3 className="text-lg text-gray-900 font-semibold">{rule.title}</h3>
                    </div>
                  </div>
                  <p className="text-gray-600 line-clamp-2">{rule.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Rule Detail Modal */}
      {selectedRule && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedRule(null)}
        >
          <div 
            className="bg-white rounded-2xl p-8 max-w-2xl w-full border-2 border-gray-200 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start gap-4 flex-1">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0 ${
                  selectedRule.icon === 'alert' ? 'from-orange-400 to-orange-600' :
                  selectedRule.icon === 'check' ? 'from-emerald-400 to-emerald-600' :
                  'from-blue-400 to-blue-600'
                }`}>
                  {(() => {
                    const Icon = iconMap[selectedRule.icon];
                    return <Icon className="w-6 h-6 text-white" />;
                  })()}
                </div>
                <div className="flex-1">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg mb-2 inline-block">
                    {selectedRule.category}
                  </span>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedRule.title}</h2>
                </div>
              </div>
              <button
                onClick={() => setSelectedRule(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              >
                ✕
              </button>
            </div>
            
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {selectedRule.description}
              </p>
            </div>

            <div className="mt-6 pt-6 border-t-2 border-gray-200">
              <button
                onClick={() => setSelectedRule(null)}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {filteredRules.length === 0 && (
        <div className="bg-white rounded-2xl p-12 border-2 border-gray-200 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Không có quy định nào trong danh mục này</p>
        </div>
      )}
    </div>
  );
}


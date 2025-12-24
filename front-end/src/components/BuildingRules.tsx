import { FileText, AlertCircle, CheckCircle, Info, BookOpen, ShieldAlert, Leaf, LayoutGrid } from 'lucide-react';
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
  
  // Calculate stats for summary cards
  const totalRules = buildingRules.length;
  const safetyRules = buildingRules.filter(r => r.category.includes('An toàn')).length;
  const environmentRules = buildingRules.filter(r => r.category.includes('Vệ sinh')).length;
  const serviceRules = buildingRules.filter(r => r.category.includes('Sử dụng dịch vụ')).length;
  
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Card 1: Tổng quy định - Navy */}
        <div className="h-32 rounded-2xl p-6 flex justify-between items-center text-white shadow-sm relative overflow-hidden" style={{ backgroundColor: '#1e293b' }}>
          <div className="flex flex-col">
            <p className="text-3xl font-bold">{totalRules}</p>
            <p className="text-sm font-medium opacity-80 mt-1">Tổng quy định</p>
          </div>
          <FileText className="w-12 h-12 opacity-20 flex-shrink-0" />
        </div>

        {/* Card 2: An toàn & PCCC - Red */}
        <div className="h-32 rounded-2xl p-6 flex justify-between items-center text-white shadow-sm relative overflow-hidden" style={{ backgroundColor: '#dc2626' }}>
          <div className="flex flex-col">
            <p className="text-3xl font-bold">{safetyRules}</p>
            <p className="text-sm font-medium opacity-80 mt-1">An toàn & PCCC</p>
          </div>
          <ShieldAlert className="w-12 h-12 opacity-20 flex-shrink-0" />
        </div>

        {/* Card 3: Vệ sinh & Môi trường - Green */}
        <div className="h-32 rounded-2xl p-6 flex justify-between items-center text-white shadow-sm relative overflow-hidden" style={{ backgroundColor: '#059669' }}>
          <div className="flex flex-col">
            <p className="text-3xl font-bold">{environmentRules}</p>
            <p className="text-sm font-medium opacity-80 mt-1">Vệ sinh & Môi trường</p>
          </div>
          <Leaf className="w-12 h-12 opacity-20 flex-shrink-0" />
        </div>

        {/* Card 4: Tiện ích chung - Indigo */}
        <div className="h-32 rounded-2xl p-6 flex justify-between items-center text-white shadow-sm relative overflow-hidden" style={{ backgroundColor: '#4f46e5' }}>
          <div className="flex flex-col">
            <p className="text-3xl font-bold">{serviceRules}</p>
            <p className="text-sm font-medium opacity-80 mt-1">Tiện ích chung</p>
          </div>
          <LayoutGrid className="w-12 h-12 opacity-20 flex-shrink-0" />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-8">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-6 py-3 rounded-full transition-all ${
              selectedCategory === category
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {category === 'all' ? 'Tất cả' : 
             category === 'An toàn & Bảo mật' ? 'An toàn' :
             category === 'Vệ sinh & Môi trường' ? 'Vệ sinh' :
             category === 'Sử dụng dịch vụ' ? 'Tiện ích' :
             category}
          </button>
        ))}
      </div>

      {/* Rules List */}
      <div className="space-y-3">
        {filteredRules.map((rule) => {
          const Icon = iconMap[rule.icon];
          
          // Determine category badge color
          const getCategoryBadgeColor = (category: string) => {
            if (category.includes('An toàn')) return 'bg-orange-50 text-orange-600';
            if (category.includes('Vệ sinh')) return 'bg-emerald-50 text-emerald-600';
            if (category.includes('Sử dụng dịch vụ')) return 'bg-blue-50 text-blue-600';
            if (category.includes('Giao thông')) return 'bg-purple-50 text-purple-600';
            if (category.includes('Giờ giấc')) return 'bg-indigo-50 text-indigo-600';
            return 'bg-gray-50 text-gray-600';
          };
          
          return (
            <div 
              key={rule.id} 
              onClick={() => setSelectedRule(rule)}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  rule.icon === 'alert' ? 'bg-orange-500' :
                  rule.icon === 'check' ? 'bg-emerald-500' :
                  'bg-blue-500'
                }`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="mb-2">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-md mb-2 inline-block ${getCategoryBadgeColor(rule.category)}`}>
                      {rule.category}
                    </span>
                    <h3 className="text-lg text-gray-900 font-semibold mt-2">{rule.title}</h3>
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


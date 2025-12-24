import { FileText, AlertCircle, CheckCircle, Info, BookOpen, ShieldAlert, Leaf, LayoutGrid, Clock } from 'lucide-react';
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
    category: 'An toàn & PCCC',
    title: 'Quy định về an toàn cháy nổ',
    description: 'Cư dân không được để các vật dụng dễ cháy ở hành lang, cầu thang. Không hút thuốc trong khu vực chung. Phải tuân thủ các quy định về phòng cháy chữa cháy.',
    icon: 'alert'
  },
  {
    id: 3,
    category: 'Vệ sinh & Môi trường',
    title: 'Quy định về vệ sinh chung',
    description: 'Rác thải phải được phân loại và bỏ đúng nơi quy định. Không vứt rác bừa bãi trong khu vực chung. Giữ gìn vệ sinh hành lang, thang máy, sân chung.',
    icon: 'check'
  },
  {
    id: 5,
    category: 'Tiện ích',
    title: 'Quy định về sử dụng thang máy',
    description: 'Ưu tiên người già, trẻ em, phụ nữ có thai. Không sử dụng thang máy để vận chuyển hàng hóa cồng kềnh trong giờ cao điểm. Báo ngay khi phát hiện sự cố.',
    icon: 'info'
  },
  {
    id: 6,
    category: 'An toàn & PCCC',
    title: 'Quy định về khách đến thăm',
    description: 'Khách đến thăm phải đăng ký tại bảo vệ. Không cho người lạ vào tòa nhà. Cư dân chịu trách nhiệm về hành vi của khách mời.',
    icon: 'alert'
  },
  {
    id: 7,
    category: 'Tiện ích',
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

// Shared icon mapping to ensure consistency between summary cards and list items
const CATEGORY_ICON_MAP = {
  'An toàn & PCCC': {
    Icon: ShieldAlert,
    bgColor: 'bg-red-500',
    textColor: 'text-red-600',
    bgLight: 'bg-red-50',
    cardBgColor: '#dc2626'
  },
  'Vệ sinh & Môi trường': {
    Icon: Leaf,
    bgColor: 'bg-emerald-500',
    textColor: 'text-emerald-600',
    bgLight: 'bg-emerald-50',
    cardBgColor: '#059669'
  },
  'Tiện ích': {
    Icon: LayoutGrid,
    bgColor: 'bg-indigo-600',
    textColor: 'text-indigo-600',
    bgLight: 'bg-indigo-50',
    cardBgColor: '#4f46e5'
  }
};

// Helper function to get icon and color based on category (matching summary cards)
const getCategoryIconAndColor = (category: string) => {
  // Check exact matches first
  if (category === 'An toàn & PCCC' || category.includes('An toàn')) {
    return CATEGORY_ICON_MAP['An toàn & PCCC'];
  }
  if (category === 'Vệ sinh & Môi trường' || category.includes('Vệ sinh')) {
    return CATEGORY_ICON_MAP['Vệ sinh & Môi trường'];
  }
  if (category === 'Tiện ích' || category.includes('Sử dụng dịch vụ')) {
    return CATEGORY_ICON_MAP['Tiện ích'];
  }
  // Default fallback
  return {
    Icon: FileText,
    bgColor: 'bg-gray-500',
    textColor: 'text-gray-600',
    bgLight: 'bg-gray-50',
    cardBgColor: '#1e293b'
  };
};

export function BuildingRules() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null);

  const categories = ['all', ...Array.from(new Set(buildingRules.map(rule => rule.category)))];
  
  // Calculate stats for summary cards
  const totalRules = buildingRules.length;
  const safetyRules = buildingRules.filter(r => r.category.includes('An toàn')).length;
  const environmentRules = buildingRules.filter(r => r.category.includes('Vệ sinh')).length;
  const serviceRules = buildingRules.filter(r => 
    r.category.includes('Tiện ích') ||
    r.category.includes('Sử dụng dịch vụ')
  ).length;
  
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
             category === 'An toàn & PCCC' ? 'An toàn' :
             category === 'Vệ sinh & Môi trường' ? 'Vệ sinh' :
             category === 'Tiện ích' ? 'Tiện ích' :
             category === 'Sử dụng dịch vụ' ? 'Tiện ích' :
             category}
          </button>
        ))}
      </div>

      {/* Rules List */}
      <div className="space-y-3">
        {filteredRules.map((rule) => {
          const { Icon, bgColor, textColor, bgLight } = getCategoryIconAndColor(rule.category);
          const isUtility = rule.category === 'Tiện ích' || rule.category.includes('Tiện ích') || rule.category.includes('Sử dụng dịch vụ');
          
          return (
            <div 
              key={rule.id} 
              onClick={() => setSelectedRule(rule)}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${bgColor}`} style={isUtility ? { backgroundColor: '#4f46e5' } : undefined}>
                  {isUtility ? (
                    // Tiện ích: dùng trực tiếp LayoutGrid giống style trước đó
                    <LayoutGrid size={22} strokeWidth={2} style={{ color: '#ffffff', stroke: '#ffffff' }} />
                  ) : (
                    <Icon size={22} className="text-white" style={{ color: 'white', stroke: 'white' }} />
                  )}
                </div>
                
                <div className="flex-1 min-w-0 flex flex-col space-y-1">
                  <h3 className="text-lg text-gray-900 font-bold">{rule.title}</h3>
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
                {(() => {
                  const { Icon, bgColor, textColor, bgLight } = getCategoryIconAndColor(selectedRule.category);
                  const isUtility = selectedRule.category === 'Tiện ích' || selectedRule.category.includes('Tiện ích') || selectedRule.category.includes('Sử dụng dịch vụ');
                  return (
                    <>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${bgColor}`} style={isUtility ? { backgroundColor: '#4f46e5' } : undefined}>
                        {isUtility ? (
                          <LayoutGrid size={22} strokeWidth={2} style={{ color: '#ffffff', stroke: '#ffffff' }} />
                        ) : (
                          <Icon size={22} className="text-white" style={{ color: 'white', stroke: 'white' }} />
                        )}
                      </div>
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedRule.title}</h2>
                      </div>
                    </>
                  );
                })()}
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


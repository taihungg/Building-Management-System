import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { FileText, Search, Building2, Users, Clock, AlertCircle, CheckCircle2, Info } from "lucide-react";

// Render content with bold numbered headings and bullet lists per line
function renderRegulationContent(content: string) {
  const lines = content.trim().split(/\n+/);
  const elements: JSX.Element[] = [];
  let listItems: string[] = [];
  let insideSection = false; // after a numbered heading

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul className="list-disc pl-6 mt-2 space-y-1" key={`ul-${elements.length}`}>
          {listItems.map((item, idx) => (
            <li key={idx} className="text-sm leading-relaxed">{item}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((raw, index) => {
    const line = raw.trim();
    if (!line) {
      flushList();
      elements.push(<div key={`sp-${index}`} className="h-2" />);
      return;
    }

    // Numbered heading e.g., "1. Giờ giấc sinh hoạt:"
    if (/^\d+\./.test(line)) {
      flushList();
      elements.push(
        <div key={`h-${index}`} className="font-semibold mt-3">
          {line}
        </div>
      );
      insideSection = true;
      return;
    }

    // Bullet: hyphen, en dash, em dash
    if (/^[-–—]\s+/.test(line)) {
      const text = line.replace(/^[-–—]\s+/, "");
      const ensured = /[\.!?]$/.test(text) ? text : `${text}.`;
      listItems.push(ensured);
      return;
    }

    // If inside a section, treat as bullet by default
    if (insideSection) {
      const ensured = /[\.!?]$/.test(line) ? line : `${line}.`;
      listItems.push(ensured);
      return;
    }

    // Fallback normal paragraph
    flushList();
    elements.push(
      <div key={`p-${index}`} className="text-sm leading-relaxed mt-2">{line}</div>
    );
  });

  flushList();
  return elements;
}

const buildingRegulations = [
  {
    id: 1,
    title: "Nội quy chung cư",
    category: "Nội quy",
    content: `
1. Giờ giấc sinh hoạt:
   - Từ 22:00 - 06:00: Giữ yên lặng, không gây tiếng ồn
   - Từ 06:00 - 22:00: Có thể sinh hoạt bình thường nhưng không quá mức

2. Sử dụng thang máy:
   - Ưu tiên người già, trẻ em, phụ nữ có thai
   - Không hút thuốc, ăn uống trong thang máy
   - Giới hạn tải trọng: 8 người hoặc 630kg

3. Khu vực chung:
   - Không để đồ đạc cá nhân ở hành lang, cầu thang
   - Không treo quần áo, đồ khô ở ban công
   - Giữ gìn vệ sinh chung
    `,
    lastUpdated: "01/01/2025",
    priority: "high"
  },
  {
    id: 2,
    title: "Quy định về an ninh",
    category: "An ninh",
    content: `
1. Ra vào tòa nhà:
   - Cư dân sử dụng thẻ từ cá nhân
   - Khách mời phải đăng ký tại bảo vệ
   - Giờ đóng cửa: 23:00 - 05:00

2. Camera giám sát:
   - Lắp đặt tại tất cả khu vực chung
   - Dữ liệu lưu trữ 30 ngày
   - Chỉ quản lý tòa nhà được truy cập

3. Báo cáo sự cố:
   - Hotline: 1900-1234 (24/7)
   - Email: security@bluemoon.com
   - Báo cáo ngay khi phát hiện bất thường
    `,
    lastUpdated: "15/01/2025",
    priority: "high"
  },
  {
    id: 3,
    title: "Quy định về dịch vụ",
    category: "Dịch vụ",
    content: `
1. Dịch vụ có sẵn:
   - Giặt ủi: Tầng 2, giờ hoạt động 07:00-20:00
   - Gym: Tầng 3, giờ hoạt động 05:00-22:00
   - Hồ bơi: Tầng 4, giờ hoạt động 06:00-21:00
   - Sân chơi trẻ em: Tầng 1, giờ hoạt động 06:00-20:00

2. Đặt dịch vụ:
   - Qua app quản lý tòa nhà
   - Hotline: 1900-5678
   - Thanh toán qua app hoặc tại quầy dịch vụ

3. Quy định sử dụng:
   - Đặt lịch trước ít nhất 2 giờ
   - Hủy dịch vụ trước 1 giờ
   - Tuân thủ quy định an toàn
    `,
    lastUpdated: "20/01/2025",
    priority: "medium"
  },
  {
    id: 4,
    title: "Quy định về phí dịch vụ",
    category: "Tài chính",
    content: `
1. Các loại phí:
   - Phí quản lý: 2,500,000 VNĐ/tháng
   - Phí gửi xe máy: 150,000 VNĐ/tháng
   - Phí gửi ô tô: 800,000 VNĐ/tháng
   - Tiền điện: Theo đồng hồ đo
   - Tiền nước: Theo đồng hồ đo

2. Thời gian thanh toán:
   - Hạn thanh toán: Ngày cuối tháng
   - Phạt chậm: 0.5%/ngày
   - Cắt dịch vụ sau 15 ngày quá hạn

3. Phương thức thanh toán:
   - Chuyển khoản ngân hàng
   - QR Code qua app
   - Tiền mặt tại quầy dịch vụ
    `,
    lastUpdated: "01/02/2025",
    priority: "high"
  },
  {
    id: 5,
    title: "Quy định về sửa chữa",
    category: "Bảo trì",
    content: `
1. Sửa chữa căn hộ:
   - Thông báo trước 24 giờ cho quản lý
   - Giờ sửa chữa: 08:00-17:00 (T2-T6)
   - Không được sửa chữa vào cuối tuần

2. Sửa chữa hệ thống chung:
   - Do quản lý tòa nhà thực hiện
   - Thông báo trước cho cư dân
   - Ưu tiên sửa chữa khẩn cấp

3. Báo cáo sự cố:
   - Hotline: 1900-9999
   - Email: maintenance@bluemoon.com
   - App quản lý tòa nhà
    `,
    lastUpdated: "10/02/2025",
    priority: "medium"
  },
  {
    id: 6,
    title: "Quy định về thú cưng",
    category: "Sinh hoạt",
    content: `
1. Đăng ký thú cưng:
   - Đăng ký với quản lý tòa nhà
   - Cung cấp giấy chứng nhận tiêm phòng
   - Phí đăng ký: 500,000 VNĐ/năm

2. Quy định chung:
   - Chỉ được nuôi chó, mèo
   - Không được nuôi động vật hoang dã
   - Phải có dây xích khi ra ngoài

3. Trách nhiệm:
   - Dọn dẹp chất thải của thú cưng
   - Không để thú cưng gây tiếng ồn
   - Bồi thường nếu gây thiệt hại
    `,
    lastUpdated: "15/02/2025",
    priority: "low"
  }
];

const categories = [
  { id: "all", label: "Tất cả", icon: FileText },
  { id: "Nội quy", label: "Nội quy", icon: Users },
  { id: "An ninh", label: "An ninh", icon: AlertCircle },
  { id: "Dịch vụ", label: "Dịch vụ", icon: Building2 },
  { id: "Tài chính", label: "Tài chính", icon: CheckCircle2 },
  { id: "Bảo trì", label: "Bảo trì", icon: Clock },
  { id: "Sinh hoạt", label: "Sinh hoạt", icon: Info },
];

export function InformationView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredRegulations = buildingRegulations.filter(regulation => {
    const matchesSearch = regulation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         regulation.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || regulation.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high": return "Quan trọng";
      case "medium": return "Trung bình";
      case "low": return "Thông thường";
      default: return "Khác";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Tra cứu thông tin</h1>
              <p className="text-muted-foreground mt-1">
                Nội quy, quy định và thông tin chung của tòa nhà
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Cập nhật lần cuối</p>
              <p className="text-lg font-semibold">15/02/2025</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Tìm kiếm thông tin</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Tìm kiếm nội quy, quy định..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-16"
                  style={{ paddingLeft: '3.5rem' }}
                />
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => {
              const CategoryIcon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center gap-2"
                >
                  <CategoryIcon className="h-4 w-4" />
                  {category.label}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Regulations List */}
      <div className="space-y-4">
        {filteredRegulations.map((regulation) => (
          <Card key={regulation.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{regulation.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{regulation.category}</Badge>
                    <Badge className={getPriorityColor(regulation.priority)}>
                      {getPriorityLabel(regulation.priority)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Cập nhật: {regulation.lastUpdated}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                {renderRegulationContent(regulation.content)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRegulations.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Không tìm thấy thông tin</h3>
            <p className="text-muted-foreground">
              Hãy thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

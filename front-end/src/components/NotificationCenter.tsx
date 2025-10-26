import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";
import { Send, Bell, Clock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner@2.0.3";

const notificationHistory = [
  { id: 1, title: "Bảo trì thang máy", date: "25/10/2024", recipients: "Tất cả căn hộ", status: "sent" },
  { id: 2, title: "Thông báo cúp nước", date: "24/10/2024", recipients: "Tòa A, B", status: "sent" },
  { id: 3, title: "Họp cư dân định kỳ", date: "23/10/2024", recipients: "Tất cả căn hộ", status: "sent" },
  { id: 4, title: "Nhắc nhở thanh toán phí", date: "22/10/2024", recipients: "15 căn hộ", status: "sent" },
  { id: 5, title: "Thông báo tăng giá dịch vụ", date: "20/10/2024", recipients: "Tất cả căn hộ", status: "sent" },
];

export function NotificationCenter() {
  const [notificationType, setNotificationType] = useState("general");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedBuildings, setSelectedBuildings] = useState<string[]>([]);

  const buildings = ["Tòa A", "Tòa B", "Tòa C", "Tòa D"];

  const handleSendNotification = () => {
    if (!title || !content) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }
    toast.success("Gửi thông báo thành công!");
    setTitle("");
    setContent("");
    setSelectedBuildings([]);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Send Notification Form */}
        <Card>
          <CardHeader>
            <CardTitle>Gửi thông báo mới</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Loại thông báo</Label>
              <Select value={notificationType} onValueChange={setNotificationType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">Thông báo chung</SelectItem>
                  <SelectItem value="maintenance">Bảo trì - Sửa chữa</SelectItem>
                  <SelectItem value="payment">Thanh toán</SelectItem>
                  <SelectItem value="event">Sự kiện</SelectItem>
                  <SelectItem value="urgent">Khẩn cấp</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tiêu đề</Label>
              <Input
                placeholder="Nhập tiêu đề thông báo..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Nội dung</Label>
              <Textarea
                placeholder="Nhập nội dung thông báo..."
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Gửi đến</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="all-buildings"
                    checked={selectedBuildings.length === buildings.length}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedBuildings(buildings);
                      } else {
                        setSelectedBuildings([]);
                      }
                    }}
                  />
                  <label htmlFor="all-buildings" className="cursor-pointer">
                    Tất cả các tòa
                  </label>
                </div>
                {buildings.map((building) => (
                  <div key={building} className="flex items-center space-x-2 ml-6">
                    <Checkbox
                      id={building}
                      checked={selectedBuildings.includes(building)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedBuildings([...selectedBuildings, building]);
                        } else {
                          setSelectedBuildings(selectedBuildings.filter((b) => b !== building));
                        }
                      }}
                    />
                    <label htmlFor={building} className="cursor-pointer">
                      {building}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSendNotification} className="flex-1">
                <Send className="mr-2 h-4 w-4" />
                Gửi ngay
              </Button>
              <Button variant="outline" className="flex-1">
                <Clock className="mr-2 h-4 w-4" />
                Lên lịch
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notification Stats */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Thống kê thông báo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Send className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-muted-foreground">Đã gửi tháng này</p>
                    <p>45 thông báo</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-muted-foreground">Tỷ lệ đọc</p>
                    <p>87%</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-muted-foreground">Đang chờ xử lý</p>
                    <p>3 thông báo</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mẫu thông báo nhanh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                "Nhắc nhở thanh toán phí quản lý",
                "Thông báo bảo trì định kỳ",
                "Thông báo cúp điện/nước",
                "Mời họp cư dân",
                "Thông báo điều chỉnh giá dịch vụ",
              ].map((template, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    setTitle(template);
                    toast.success("Đã áp dụng mẫu thông báo");
                  }}
                >
                  {template}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Notification History */}
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử gửi thông báo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notificationHistory.map((notification) => (
              <div
                key={notification.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <Bell className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p>{notification.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-muted-foreground">{notification.date}</p>
                      <span className="text-muted-foreground">•</span>
                      <p className="text-muted-foreground">{notification.recipients}</p>
                    </div>
                  </div>
                </div>
                <Badge>Đã gửi</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

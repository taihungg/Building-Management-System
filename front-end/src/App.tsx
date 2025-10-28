import "./styles/globals.css";
import { useState } from "react";
import { DashboardLayout } from "./components/DashboardLayout";
import { ResidentDashboard } from "./components/ResidentDashboard";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Building2, Users } from "lucide-react";

export default function App() {
  const [selectedResident, setSelectedResident] = useState<string | null>(null);
  const [showResidentSelection, setShowResidentSelection] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Mock data for residents
  const residents = [
    { id: "1", name: "Nguyễn Văn A", apartment: "A101", username: "nguyenvana", password: "123456" },
    { id: "2", name: "Trần Thị B", apartment: "B205", username: "tranthib", password: "123456" },
    { id: "3", name: "Lê Văn C", apartment: "C301", username: "levanc", password: "123456" },
    { id: "4", name: "Phạm Thị D", apartment: "D404", username: "phamthid", password: "123456" },
  ];

  const handleResidentLogin = () => {
    const resident = residents.find(
      (r) => r.username === username && r.password === password
    );
    if (resident) {
      setSelectedResident(resident.id);
      setError("");
    } else {
      setError("Tên đăng nhập hoặc mật khẩu không đúng!");
    }
  };

  if (!showResidentSelection && !selectedResident) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-start justify-center p-4 pt-24">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Chung cư Blue Moon</CardTitle>
            <p className="text-muted-foreground">Chọn loại tài khoản để tiếp tục</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => setSelectedResident("admin")} 
              className="w-full h-16 flex flex-col gap-2"
              variant="outline"
            >
              <Building2 className="h-6 w-6" />
              <span>Quản trị viên</span>
            </Button>
            <Button 
              onClick={() => setShowResidentSelection(true)} 
              className="w-full h-16 flex flex-col gap-2"
              variant="outline"
            >
              <Users className="h-6 w-6" />
              <span>Cư dân</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResidentSelection && !selectedResident) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-start justify-center p-4 pt-24">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Đăng nhập</CardTitle>
            <p className="text-muted-foreground">Nhập thông tin để đăng nhập</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Tên đăng nhập</Label>
              <Input
                id="username"
                placeholder="Nhập tên đăng nhập"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleResidentLogin()}
              />
            </div>
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                {error}
              </div>
            )}
            <Button
              onClick={handleResidentLogin}
              className="w-full"
              size="lg"
            >
              Đăng nhập
            </Button>
            <Button
              onClick={() => {
                setShowResidentSelection(false);
                setUsername("");
                setPassword("");
                setError("");
              }}
              className="w-full"
              variant="outline"
            >
              Quay lại
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="size-full">
      {selectedResident === "admin" ? (
        <DashboardLayout />
      ) : selectedResident ? (
        <ResidentDashboard 
          selectedResident={selectedResident}
          onLogout={() => {
            setSelectedResident(null);
            setShowResidentSelection(false);
          }}
        />
      ) : null}
    </div>
  );
}

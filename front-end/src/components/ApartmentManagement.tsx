import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Search, Building, Users, DollarSign } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

const apartments = [
  { id: 1, code: "A101", building: "A", floor: 1, area: 85, status: "occupied", owner: "Nguyễn Văn A", price: 3500000 },
  { id: 2, code: "A102", building: "A", floor: 1, area: 85, status: "occupied", owner: "Trần Thị B", price: 3500000 },
  { id: 3, code: "A103", building: "A", floor: 1, area: 95, status: "empty", owner: "-", price: 4000000 },
  { id: 4, code: "A201", building: "A", floor: 2, area: 85, status: "occupied", owner: "Lê Văn C", price: 3500000 },
  { id: 5, code: "B205", building: "B", floor: 2, area: 120, status: "occupied", owner: "Phạm Thị D", price: 5000000 },
  { id: 6, code: "B206", building: "B", floor: 2, area: 120, status: "maintenance", owner: "-", price: 5000000 },
  { id: 7, code: "C308", building: "C", floor: 3, area: 95, status: "occupied", owner: "Hoàng Văn E", price: 4000000 },
  { id: 8, code: "C309", building: "C", floor: 3, area: 95, status: "occupied", owner: "Vũ Thị F", price: 4000000 },
  { id: 9, code: "D410", building: "D", floor: 4, area: 150, status: "occupied", owner: "Đỗ Văn G", price: 6500000 },
];

const getStatusBadge = (status: string) => {
  const variants: Record<string, { label: string; variant: "default" | "destructive" | "secondary" }> = {
    occupied: { label: "Đang ở", variant: "default" },
    empty: { label: "Trống", variant: "secondary" },
    maintenance: { label: "Bảo trì", variant: "destructive" },
  };
  const config = variants[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export function ApartmentManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState("all");

  const filteredApartments = apartments.filter(
    (apt) =>
      (apt.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.owner.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedBuilding === "all" || apt.building === selectedBuilding)
  );

  const stats = {
    total: apartments.length,
    occupied: apartments.filter((a) => a.status === "occupied").length,
    empty: apartments.filter((a) => a.status === "empty").length,
    maintenance: apartments.filter((a) => a.status === "maintenance").length,
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Tổng căn hộ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-muted-foreground" />
              <span>{stats.total} căn</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Đang sử dụng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              <span className="text-green-600">{stats.occupied} căn</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Còn trống</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-yellow-600" />
              <span className="text-yellow-600">{stats.empty} căn</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Đang bảo trì</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-red-600" />
              <span className="text-red-600">{stats.maintenance} căn</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Quản lý căn hộ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo mã căn hộ, chủ hộ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Apartments by Building */}
      <Tabs value={selectedBuilding} onValueChange={setSelectedBuilding}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="A">Tòa A</TabsTrigger>
          <TabsTrigger value="B">Tòa B</TabsTrigger>
          <TabsTrigger value="C">Tòa C</TabsTrigger>
          <TabsTrigger value="D">Tòa D</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedBuilding} className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredApartments.map((apartment) => (
              <Card key={apartment.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{apartment.code}</CardTitle>
                      <p className="text-muted-foreground">
                        Tầng {apartment.floor} - {apartment.area}m²
                      </p>
                    </div>
                    {getStatusBadge(apartment.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-muted-foreground">Chủ hộ</p>
                    <p>{apartment.owner}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Phí quản lý</p>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <span>{(apartment.price / 1000).toLocaleString()} đ/tháng</span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Chi tiết
                    </Button>
                    <Button size="sm" className="flex-1">
                      Cập nhật
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

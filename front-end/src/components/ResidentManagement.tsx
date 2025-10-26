import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Search, Plus, Edit, Trash2, UserCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import React from "react";
const residents = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    apartment: "A101",
    phone: "0901234567",
    email: "nguyenvana@email.com",
    members: 4,
    status: "active",
  },
  {
    id: 2,
    name: "Trần Thị B",
    apartment: "A102",
    phone: "0902345678",
    email: "tranthib@email.com",
    members: 3,
    status: "active",
  },
  {
    id: 3,
    name: "Lê Văn C",
    apartment: "B205",
    phone: "0903456789",
    email: "levanc@email.com",
    members: 2,
    status: "active",
  },
  {
    id: 4,
    name: "Phạm Thị D",
    apartment: "B206",
    phone: "0904567890",
    email: "phamthid@email.com",
    members: 5,
    status: "active",
  },
  {
    id: 5,
    name: "Hoàng Văn E",
    apartment: "C308",
    phone: "0905678901",
    email: "hoangvane@email.com",
    members: 3,
    status: "inactive",
  },
  {
    id: 6,
    name: "Vũ Thị F",
    apartment: "C309",
    phone: "0906789012",
    email: "vuthif@email.com",
    members: 4,
    status: "active",
  },
  {
    id: 7,
    name: "Đỗ Văn G",
    apartment: "D410",
    phone: "0907890123",
    email: "dovang@email.com",
    members: 2,
    status: "active",
  },
];

export function ResidentManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredResidents = residents.filter(
    (resident) =>
      resident.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.apartment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Tổng cư dân</CardTitle>
          </CardHeader>
          <CardContent>
            <div>{residents.length} hộ</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Đang sinh sống</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-green-600">
              {residents.filter((r) => r.status === "active").length} hộ
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Tạm vắng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-yellow-600">
              {residents.filter((r) => r.status === "inactive").length} hộ
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Tổng số người</CardTitle>
          </CardHeader>
          <CardContent>
            <div>{residents.reduce((sum, r) => sum + r.members, 0)} người</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách cư dân</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên, căn hộ, SĐT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm cư dân
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Thêm cư dân mới</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Họ và tên</Label>
                    <Input placeholder="Nhập họ tên..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Căn hộ</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn căn hộ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="a101">A101</SelectItem>
                        <SelectItem value="a102">A102</SelectItem>
                        <SelectItem value="b205">B205</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Số điện thoại</Label>
                    <Input placeholder="Nhập số điện thoại..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" placeholder="Nhập email..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Số thành viên</Label>
                    <Input type="number" placeholder="Nhập số thành viên..." />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button className="flex-1">Thêm mới</Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      Hủy
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Residents Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Chủ hộ</TableHead>
                <TableHead>Căn hộ</TableHead>
                <TableHead>Số điện thoại</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Số thành viên</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResidents.map((resident) => (
                <TableRow key={resident.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <UserCircle className="h-5 w-5 text-muted-foreground" />
                      {resident.name}
                    </div>
                  </TableCell>
                  <TableCell>{resident.apartment}</TableCell>
                  <TableCell>{resident.phone}</TableCell>
                  <TableCell>{resident.email}</TableCell>
                  <TableCell>{resident.members} người</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        resident.status === "active" ? "default" : "secondary"
                      }
                    >
                      {resident.status === "active" ? "Đang ở" : "Tạm vắng"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

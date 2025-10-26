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
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Search, Download, Filter, Eye } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import React from "react";

const debtRecords = [
  {
    id: "001",
    apartment: "A101",
    owner: "Nguyễn Văn A",
    phone: "0901234567",
    debt: 3500000,
    month: "10/2024",
    status: "overdue",
    days: 15,
  },
  {
    id: "002",
    apartment: "A102",
    owner: "Trần Thị B",
    phone: "0902345678",
    debt: 0,
    month: "10/2024",
    status: "paid",
    days: 0,
  },
  {
    id: "003",
    apartment: "B205",
    owner: "Lê Văn C",
    phone: "0903456789",
    debt: 2800000,
    month: "10/2024",
    status: "pending",
    days: 5,
  },
  {
    id: "004",
    apartment: "B206",
    owner: "Phạm Thị D",
    phone: "0904567890",
    debt: 0,
    month: "10/2024",
    status: "paid",
    days: 0,
  },
  {
    id: "005",
    apartment: "C308",
    owner: "Hoàng Văn E",
    phone: "0905678901",
    debt: 4200000,
    month: "10/2024",
    status: "overdue",
    days: 20,
  },
  {
    id: "006",
    apartment: "C309",
    owner: "Vũ Thị F",
    phone: "0906789012",
    debt: 3500000,
    month: "10/2024",
    status: "pending",
    days: 3,
  },
  {
    id: "007",
    apartment: "D410",
    owner: "Đỗ Văn G",
    phone: "0907890123",
    debt: 0,
    month: "10/2024",
    status: "paid",
    days: 0,
  },
  {
    id: "008",
    apartment: "D411",
    owner: "Bùi Thị H",
    phone: "0908901234",
    debt: 5500000,
    month: "10/2024",
    status: "overdue",
    days: 25,
  },
];

export function DebtManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDebt, setSelectedDebt] = useState<
    (typeof debtRecords)[0] | null
  >(null);

  const filteredRecords = debtRecords.filter((record) => {
    const matchesSearch =
      record.apartment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.owner.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || record.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      { label: string; variant: "default" | "destructive" | "secondary" }
    > = {
      paid: { label: "Đã thanh toán", variant: "default" },
      pending: { label: "Chưa thanh toán", variant: "secondary" },
      overdue: { label: "Quá hạn", variant: "destructive" },
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const totalDebt = filteredRecords.reduce(
    (sum, record) => sum + record.debt,
    0
  );
  const overdueCount = filteredRecords.filter(
    (r) => r.status === "overdue"
  ).length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Tổng công nợ</CardTitle>
          </CardHeader>
          <CardContent>
            <div>{(totalDebt / 1000000).toFixed(1)} triệu VNĐ</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Số căn hộ nợ</CardTitle>
          </CardHeader>
          <CardContent>
            <div>{filteredRecords.filter((r) => r.debt > 0).length} căn hộ</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Quá hạn thanh toán</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-destructive">{overdueCount} căn hộ</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Tra cứu công nợ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo căn hộ, tên chủ hộ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="paid">Đã thanh toán</SelectItem>
                <SelectItem value="pending">Chưa thanh toán</SelectItem>
                <SelectItem value="overdue">Quá hạn</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Xuất Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Debt Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Căn hộ</TableHead>
                <TableHead>Chủ hộ</TableHead>
                <TableHead>Số điện thoại</TableHead>
                <TableHead>Công nợ</TableHead>
                <TableHead>Tháng</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.apartment}</TableCell>
                  <TableCell>{record.owner}</TableCell>
                  <TableCell>{record.phone}</TableCell>
                  <TableCell>
                    {record.debt > 0
                      ? `${(record.debt / 1000).toLocaleString()} đ`
                      : "-"}
                  </TableCell>
                  <TableCell>{record.month}</TableCell>
                  <TableCell>{getStatusBadge(record.status)}</TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedDebt(record)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            Chi tiết công nợ - {record.apartment}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <p className="text-muted-foreground">Chủ hộ</p>
                            <p>{record.owner}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">
                              Số điện thoại
                            </p>
                            <p>{record.phone}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">
                              Kỳ thanh toán
                            </p>
                            <p>{record.month}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Trạng thái</p>
                            <div className="mt-1">
                              {getStatusBadge(record.status)}
                            </div>
                          </div>
                          {record.status === "overdue" && (
                            <div>
                              <p className="text-muted-foreground">
                                Số ngày quá hạn
                              </p>
                              <p className="text-destructive">
                                {record.days} ngày
                              </p>
                            </div>
                          )}
                          <div className="border-t pt-4">
                            <p className="text-muted-foreground">
                              Chi tiết công nợ
                            </p>
                            <div className="mt-2 space-y-2">
                              <div className="flex justify-between">
                                <span>Phí quản lý</span>
                                <span>1,500,000 đ</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Phí dịch vụ</span>
                                <span>800,000 đ</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Phí gửi xe</span>
                                <span>500,000 đ</span>
                              </div>
                              <div className="flex justify-between border-t pt-2">
                                <span>Tổng cộng</span>
                                <span>
                                  {(record.debt / 1000).toLocaleString()} đ
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button className="flex-1">Gửi nhắc nhở</Button>
                            <Button variant="outline" className="flex-1">
                              In hóa đơn
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
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

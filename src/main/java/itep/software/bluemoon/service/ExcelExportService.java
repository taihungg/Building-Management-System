package itep.software.bluemoon.service;

import itep.software.bluemoon.entity.accounting.Invoice;
import itep.software.bluemoon.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExcelExportService {

    private final InvoiceRepository invoiceRepository;

    public ByteArrayInputStream exportInvoicesToExcel(Integer month, Integer year) {
        List<Invoice> invoices = invoiceRepository.findByMonthAndYear(month, year);

        try (Workbook workbook = new XSSFWorkbook();
            ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Hóa đơn T" + month + "-" + year);

            Row headerRow = sheet.createRow(0);

            CellStyle headerStyle = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            headerStyle.setFont(font);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            String[] columns = {"Tòa nhà", "Căn hộ", "Chủ hộ", "Tháng", "Năm", "Tổng tiền (VNĐ)", "Trạng thái", "Ngày thanh toán"};
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowIdx = 1;
            for (Invoice inv : invoices) {
                Row row = sheet.createRow(rowIdx++);

                row.createCell(0).setCellValue(inv.getApartment().getBuilding().getName());
                row.createCell(1).setCellValue(inv.getApartment().getRoomNumber());
                String ownerName = (inv.getApartment().getOwner() != null)
                        ? inv.getApartment().getOwner().getFullName() : "Apartment has no owner";
                row.createCell(2).setCellValue(ownerName);

                row.createCell(3).setCellValue(inv.getMonth());
                row.createCell(4).setCellValue(inv.getYear());

                row.createCell(5).setCellValue(inv.getTotalAmount().doubleValue());

                row.createCell(6).setCellValue(inv.getStatus().name());
            }

            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());

        } catch (IOException e) {
            throw new RuntimeException("Error when create Excel file: " + e.getMessage());
        }
    }
}
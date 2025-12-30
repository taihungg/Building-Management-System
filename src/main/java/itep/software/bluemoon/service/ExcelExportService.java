package itep.software.bluemoon.service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.math.BigDecimal;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.springframework.stereotype.Service;

import itep.software.bluemoon.entity.accounting.Invoice;
import itep.software.bluemoon.model.projection.CampaignSummary;
import itep.software.bluemoon.model.projection.ContributionSummary;
import itep.software.bluemoon.repository.ContributionRecordRepository;
import itep.software.bluemoon.repository.InvoiceRepository;
import itep.software.bluemoon.repository.VoluntaryContributionRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ExcelExportService {

    private final InvoiceRepository invoiceRepository;
    private final VoluntaryContributionRepository voluntaryContributionRepository;
    private final ContributionRecordRepository contributionRecordRepository;


    public ByteArrayInputStream exportInvoicesToExcel(int month, int year) {
    	List<Invoice> invoices = invoiceRepository.findByMonthAndYearWithDetails(month, year);
        
        invoices.sort((inv1, inv2) -> {
            int room1 = inv1.getApartment().getRoomNumber();
            int room2 = inv2.getApartment().getRoomNumber();
            return Integer.compare(room1, room2);
        });
        
        try (Workbook workbook = new XSSFWorkbook();
            ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Hóa đơn T" + month + "-" + year);
            
            CellStyle titleStyle = workbook.createCellStyle();
            Font titleFont = workbook.createFont();
            titleFont.setBold(true);
            titleFont.setFontHeightInPoints((short) 14);
            titleStyle.setFont(titleFont);
            titleStyle.setAlignment(HorizontalAlignment.CENTER);
            
            Row titleRow = sheet.createRow(0);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("HÓA ĐƠN THÁNG " + month + "/" + year);
            titleCell.setCellStyle(titleStyle);
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 4));

            CellStyle headerStyle = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            headerStyle.setFont(font);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            CellStyle amountStyle = workbook.createCellStyle();
            amountStyle.setAlignment(HorizontalAlignment.RIGHT);
            
            Row headerRow = sheet.createRow(2);
            String[] columns = {"Số phòng", "Tòa nhà", "Chủ căn hộ", "Tổng hóa đơn (VNĐ)", "Trạng thái"};
            
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowIdx = 3;
            for (Invoice inv : invoices) {
                Row row = sheet.createRow(rowIdx++);
                Cell roomCell = row.createCell(0);
                roomCell.setCellValue(String.valueOf(inv.getApartment().getRoomNumber()));
                
                row.createCell(1).setCellValue(inv.getApartment().getBuilding().getName());
                String ownerName = (inv.getApartment().getOwner() != null)
                        ? inv.getApartment().getOwner().getFullName() 
                        : "Chưa xác định";
                row.createCell(2).setCellValue(ownerName);

                Cell amountCell = row.createCell(3);
                amountCell.setCellValue(inv.getTotalAmount().doubleValue());
                amountCell.setCellStyle(amountStyle);

                String status = "";
                switch (inv.getStatus()) {
                    case PENDING:
                        status = "Chờ xác nhận";
                        break;
                    case UNPAID:
                        status = "Chưa thanh toán";
                        break;
                    case PARTIAL:
                        status = "Thanh toán một phần";
                        break;
                    case PAID:
                        status = "Đã thanh toán";
                        break;
                    case OVERDUE:
                        status = "Quá hạn";
                        break;
                    case CANCELED:
                        status = "Đã hủy";
                        break;
                    default:
                        status = inv.getStatus().name();
                }
                row.createCell(4).setCellValue(status);
            }

            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());

        } catch (IOException e) {
            throw new RuntimeException("Lỗi khi tạo file Excel: " + e.getMessage());
        }
    }
    
    
    public ByteArrayInputStream exportContributionsToExcel(UUID campaignId) {
        CampaignSummary campaign = voluntaryContributionRepository.findProjectedById(campaignId)
                .orElseThrow(() -> new IllegalArgumentException("Campaign not found"));
        
        List<ContributionSummary> contributions = contributionRecordRepository
                .findByCampaignIdOrderByContributionDateAsc(campaignId);

        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Đóng góp - " + campaign.getTitle());

            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);
            
            CellStyle boldStyle = workbook.createCellStyle();
            Font boldFont = workbook.createFont();
            boldFont.setBold(true);
            boldStyle.setFont(boldFont);
            
            Font totalFont = workbook.createFont();
            totalFont.setBold(true);

            CellStyle totalLabelStyle = workbook.createCellStyle();
            totalLabelStyle.setFont(totalFont);
            totalLabelStyle.setAlignment(HorizontalAlignment.CENTER); 
            

            CellStyle totalAmountStyle = workbook.createCellStyle();
            totalAmountStyle.setFont(totalFont);
            totalAmountStyle.setAlignment(HorizontalAlignment.RIGHT);
            
            CellStyle amountStyle = workbook.createCellStyle();
            amountStyle.setAlignment(HorizontalAlignment.RIGHT); 


            //Title
            Row titleRow = sheet.createRow(0);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("DANH SÁCH ĐÓNG GÓP - " + campaign.getTitle().toUpperCase());
            titleCell.setCellStyle(boldStyle);
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 5));
            

            Row dateRow1 = sheet.createRow(1);
            Cell startDateCell = dateRow1.createCell(0);
            startDateCell.setCellValue("Ngày bắt đầu: " + campaign.getStartDate());
            sheet.addMergedRegion(new CellRangeAddress(1, 1, 0, 2));
            
            Cell endDateCell = dateRow1.createCell(3);
            endDateCell.setCellValue("Ngày kết thúc: " + campaign.getCampaignEndDate());
            sheet.addMergedRegion(new CellRangeAddress(1, 1, 3, 5));
            

            Row dateRow2 = sheet.createRow(2);
            Cell deadlineCell = dateRow2.createCell(0);
            deadlineCell.setCellValue("Hạn chót đóng góp: " + campaign.getContributionDeadline());
            sheet.addMergedRegion(new CellRangeAddress(2, 2, 0, 5));
            
            Row infoRow1 = sheet.createRow(3);
            Cell goalCell = infoRow1.createCell(0);
            goalCell.setCellValue("Mục tiêu: " + campaign.getGoalAmount() + " VNĐ");
            sheet.addMergedRegion(new CellRangeAddress(3, 3, 0, 2));
            
            Cell collectedCell = infoRow1.createCell(3);
            collectedCell.setCellValue("Đã thu: " + campaign.getTotalCollected() + " VNĐ");
            sheet.addMergedRegion(new CellRangeAddress(3, 3, 3, 5));
            
            Row infoRow2 = sheet.createRow(4);
            Cell contributorsCell = infoRow2.createCell(0);
            contributorsCell.setCellValue("Tổng số người đóng góp: " + campaign.getTotalContributors());
            sheet.addMergedRegion(new CellRangeAddress(4, 4, 0, 5));

            Row headerRow = sheet.createRow(6);
            String[] columns = {"STT", "Họ tên", "Số điện thoại", "Địa chỉ", "Số tiền (VNĐ)", "Ngày đóng góp"};
            
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowIdx = 7;
            int stt = 1;
            BigDecimal totalAmount = BigDecimal.ZERO;
            
            for (ContributionSummary contrib : contributions) {
                Row row = sheet.createRow(rowIdx++);
                
                row.createCell(0).setCellValue(stt++);
                row.createCell(1).setCellValue(contrib.getContributorName());
                row.createCell(2).setCellValue(contrib.getPhone() != null ? contrib.getPhone() : "");
                row.createCell(3).setCellValue(contrib.getAddress() != null ? contrib.getAddress() : "");

                Cell amountCell = row.createCell(4);
                amountCell.setCellValue(contrib.getAmount().doubleValue());
                amountCell.setCellStyle(amountStyle);
                
                row.createCell(5).setCellValue(contrib.getContributionDate().toString());
                
                totalAmount = totalAmount.add(contrib.getAmount());
            }
            
            Row totalRow = sheet.createRow(rowIdx);
            
            Cell totalLabelCell = totalRow.createCell(0);
            totalLabelCell.setCellValue("TỔNG CỘNG:");
            totalLabelCell.setCellStyle(totalLabelStyle);
            sheet.addMergedRegion(new CellRangeAddress(rowIdx, rowIdx, 0, 3));
            
            Cell totalAmountCell = totalRow.createCell(4);
            totalAmountCell.setCellValue(totalAmount.doubleValue());
            totalAmountCell.setCellStyle(totalAmountStyle);

            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());

        } catch (IOException e) {
            throw new RuntimeException("Error when creating Excel file: " + e.getMessage());
        }
    }
}
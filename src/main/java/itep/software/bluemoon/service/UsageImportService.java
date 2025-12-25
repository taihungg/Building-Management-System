package itep.software.bluemoon.service;

import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.DateUtil;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import itep.software.bluemoon.entity.Apartment;
import itep.software.bluemoon.entity.accounting.ServiceType;
import itep.software.bluemoon.entity.accounting.UsageRecord;
import itep.software.bluemoon.enumeration.ServiceCode;
import itep.software.bluemoon.model.DTO.accounting.usage.UsageImportDTO;
import itep.software.bluemoon.repository.ApartmentRepository;
import itep.software.bluemoon.repository.ServiceTypeRepository;
import itep.software.bluemoon.repository.UsageRecordRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class UsageImportService {

    private final ApartmentRepository apartmentRepository;
    private final ServiceTypeRepository serviceTypeRepository;
    private final UsageRecordRepository usageRecordRepository;

    /**
     * API 1: Đọc file Excel (Preview)
     */
    public List<UsageImportDTO> parseAndValidate(MultipartFile file, int currentMonth, int currentYear) {
        List<UsageImportDTO> resultList = new ArrayList<>();

        int prevMonth = currentMonth == 1 ? 12 : currentMonth - 1;
        int prevYear = currentMonth == 1 ? currentYear - 1 : currentYear;

        Map<String, UsageRecord> elecHistoryMap = usageRecordRepository.findByMonthAndYearAndServiceCode(prevMonth, prevYear, ServiceCode.ELECTRICITY)
            .stream()
            .collect(Collectors.toMap(
                r -> {
                    String room = String.valueOf(r.getApartment().getRoomNumber()).trim();
                    String building = r.getApartment().getBuilding().getName().trim(); 
                    
                    return (room + "_" + building).toUpperCase();
                }, 
                Function.identity(),
                (existing, replacement) -> existing
            ));

        Map<String, UsageRecord> waterHistoryMap = usageRecordRepository.findByMonthAndYearAndServiceCode(prevMonth, prevYear, ServiceCode.WATER)
            .stream()
            .collect(Collectors.toMap(
                r -> {
                    String room = String.valueOf(r.getApartment().getRoomNumber()).trim();
                    String building = r.getApartment().getBuilding().getName().trim(); 
                    
                    return (room + "_" + building).toUpperCase();
                }, 
                Function.identity(),
                (existing, replacement) -> existing
            ));

        Map<String, Apartment> aptMap = apartmentRepository.findAll().stream()
            .collect(Collectors.toMap(
                apt -> {
                    String room = String.valueOf(apt.getRoomNumber()).trim();
                    String building = apt.getBuilding().getName().trim(); 
                    
                    return (room + "_" + building).toUpperCase();
                },
                Function.identity(),
                (existing, replacement) -> existing
            ));

        try (InputStream is = file.getInputStream();
             Workbook workbook = new XSSFWorkbook(is)) { // XSSFWorkbook cho .xlsx

            Sheet sheet = (Sheet) workbook.getSheetAt(0); // Lấy sheet đầu tiên
            Iterator<Row> rows = sheet.iterator();

            int rowIndex = 0;
            while (rows.hasNext()) {
                Row currentRow = rows.next();
                rowIndex++;

                if (rowIndex == 1) continue; // Bỏ qua Header

                // Bỏ qua dòng trống (nếu người dùng lỡ Enter thừa ở cuối file)
                if (isRowEmpty(currentRow)) continue;

                UsageImportDTO dto = mapExcelRowToDTO(currentRow, rowIndex);
                
                // Validate logic
                validateDTO(dto, elecHistoryMap, waterHistoryMap, aptMap);

                resultList.add(dto);
            }

        } catch (IOException e) {
            log.error("Error I/O when reading Excel: ", e);
            throw new RuntimeException("Error when reading Excel: " + e.getMessage());
        } catch (Exception e) {
            log.error("Error when processing file: ", e);
            throw new RuntimeException("Error when processing file: " + e.getMessage());
        }

        return resultList;
    }

    /**
     * API 2: Lưu dữ liệu (Save) - Logic giữ nguyên, chỉ xử lý List DTO
     */
    public void saveToDatabase(List<UsageImportDTO> dataList, int month, int year) {
        List<UsageRecord> entitiesToSave = new ArrayList<>();

        Map<String, Apartment> aptMap = apartmentRepository.findAll().stream()
            .collect(Collectors.toMap(
                apt -> {
                    String room = String.valueOf(apt.getRoomNumber()).trim();
                    String building = apt.getBuilding().getName().trim(); 
                    
                    return (room + "_" + building).toUpperCase();
                },
                Function.identity(),
                (existing, replacement) -> existing
            ));
        
        Map<String, ServiceType> serviceMap = serviceTypeRepository.findAll().stream()
                .collect(Collectors.toMap(s -> s.getCode().name(), Function.identity()));

        for (UsageImportDTO dto : dataList) {
            // Chỉ lưu dòng hợp lệ
            if (!dto.isValid()) continue;

            Apartment apartment = aptMap.get((dto.getApartmentCode() + "_" + dto.getBuildingCode()).toUpperCase());
            ServiceType serviceType = serviceMap.get(dto.getServiceCode());

            if (apartment == null || serviceType == null) continue;

            // Logic Upsert: Tìm cũ update, chưa có insert
            UsageRecord record = usageRecordRepository.findByApartmentAndServiceTypeAndMonthAndYear(apartment, serviceType, month, year)
                    .orElse(new UsageRecord());

            record.setApartment(apartment);
            record.setServiceType(serviceType);
            record.setMonth(month);
            record.setYear(year);
            record.setOldIndex(dto.getOldIndex());
            record.setNewIndex(dto.getNewIndex());
            
            // Backend tự tính lại Usage để đảm bảo an toàn
            if (dto.getNewIndex() != null && dto.getOldIndex() != null) {
                record.setQuantity(dto.getNewIndex().subtract(dto.getOldIndex()));
            }

            entitiesToSave.add(record);
        }

        if (!entitiesToSave.isEmpty()) {
            usageRecordRepository.saveAll(entitiesToSave);
            log.info("Save {} records from Excel", entitiesToSave.size());
        }
    }

    // --- HELPER METHODS (Xử lý Excel) ---

    private UsageImportDTO mapExcelRowToDTO(Row row, int rowIndex) {
        UsageImportDTO dto = new UsageImportDTO();
        try {
            // Cột 0: Số phòng (Room Number)
            dto.setApartmentCode(getCellValueAsString(row.getCell(0)).trim()); 

            // Cột 1: Tòa nhà (Building Name)
            dto.setBuildingCode(getCellValueAsString(row.getCell(1)).trim());
            
            // Cột 2: Mã Dịch vụ (String) -> Trim và UpperCase
            dto.setServiceCode(getCellValueAsString(row.getCell(2)).trim().toUpperCase());
            
            // Cột 3: Chỉ số cũ (Numeric)
            dto.setOldIndex(BigDecimal.valueOf(row.getCell(3).getNumericCellValue()));
            
            // Cột 4: Chỉ số mới (Numeric)
            dto.setNewIndex(BigDecimal.valueOf(row.getCell(4).getNumericCellValue()));

            // Tạm tính usage
            dto.setQuantity(dto.getNewIndex().subtract(dto.getOldIndex()));

            dto.setValid(true);

        } catch (Exception e) {
            dto.setValid(false);
            dto.setMessage("Error in line " + rowIndex + ": " + e.toString());
        }
        return dto;
    }

    // Hàm tiện ích để lấy giá trị String an toàn từ ô Excel
    private String getCellValueAsString(Cell cell) {
        if (cell == null) return "";
        switch (cell.getCellType()) {
            case STRING -> {
                return cell.getStringCellValue();
            }
            case NUMERIC -> {
                // Nếu mã căn hộ là số (vd: 101), Excel sẽ trả về 101.0 -> Cần cắt .0
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getLocalDateTimeCellValue().toString();
                }
                long longVal = (long) cell.getNumericCellValue();
                if (cell.getNumericCellValue() == longVal) {
                    return String.valueOf(longVal);
                }
                return String.valueOf(cell.getNumericCellValue());
            }
            case BOOLEAN -> {
                return String.valueOf(cell.getBooleanCellValue());
            }
            case FORMULA -> {
                return cell.getCellFormula();
            }
            default -> {
                return "";
            }
        }
    }

    // Kiểm tra dòng có rỗng không
    private boolean isRowEmpty(Row row) {
        if (row == null) return true;
        for (int c = row.getFirstCellNum(); c < row.getLastCellNum(); c++) {
            Cell cell = row.getCell(c);
            if (cell != null && cell.getCellType() != CellType.BLANK && 
                !getCellValueAsString(cell).trim().isEmpty()) {
                return false;
            }
        }
        return true;
    }

    private void validateDTO(UsageImportDTO dto, Map<String, UsageRecord> elecHistoryMap, Map<String, UsageRecord> waterHistoryMap, Map<String, Apartment> aptMap) {
        if (!dto.isValid()) return;

        List<String> errors = new ArrayList<>();

        UsageRecord oldRecord = null;

        String searchKey = (dto.getApartmentCode() + "_" + dto.getBuildingCode()).toUpperCase();

        if (!aptMap.containsKey(searchKey)) {
            errors.add(String.format("Not found apartment %s of building %s!", 
                                    dto.getApartmentCode(), dto.getBuildingCode()));
            dto.setValid(false);
        }

        if (dto.getNewIndex().compareTo(dto.getOldIndex()) < 0) {
            errors.add("New index < Old index!");
            dto.setValid(false);
        }

        switch (dto.getServiceCode()) {
            case "ELECTRICITY" -> {oldRecord = elecHistoryMap.get(searchKey);}
            case "WATER" -> {oldRecord = waterHistoryMap.get(searchKey);}
            default -> {
                errors.add("Error service code, must be ELECTRICITY/WATER!");
                dto.setValid(false);
            }
        }

        if (oldRecord != null) {
            if (oldRecord.getQuantity() != null && dto.getQuantity().compareTo(oldRecord.getQuantity().multiply(BigDecimal.TWO)) > 0) {
                dto.setHasWarning(true);
                dto.setMessage("Warning: Unusually high consumption!");
            }
            
            if (oldRecord.getNewIndex() != null && dto.getOldIndex().compareTo(oldRecord.getNewIndex()) != 0) {
                errors.add("Old index is different from previous month!");
                dto.setValid(false);
            }
        }   

        if (!dto.isValid()) {
            dto.setMessage(String.join(", ", errors));
        }
    }
}
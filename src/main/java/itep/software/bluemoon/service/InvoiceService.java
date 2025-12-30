package itep.software.bluemoon.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import itep.software.bluemoon.entity.Apartment;
import itep.software.bluemoon.entity.Vehicle;
import itep.software.bluemoon.entity.accounting.ExtraFee;
import itep.software.bluemoon.entity.accounting.Invoice;
import itep.software.bluemoon.entity.accounting.InvoiceDetail;
import itep.software.bluemoon.entity.accounting.PriceTier;
import itep.software.bluemoon.entity.accounting.ServicePrice;
import itep.software.bluemoon.entity.accounting.ServiceType;
import itep.software.bluemoon.entity.accounting.UsageRecord;
import itep.software.bluemoon.enumeration.AnnouncementTargetType;
import itep.software.bluemoon.enumeration.InvoiceStatus;
import itep.software.bluemoon.enumeration.ServiceCode;
import itep.software.bluemoon.enumeration.TierCode;
import itep.software.bluemoon.model.DTO.accounting.invoice.InvoiceDetailResponseDTO;
import itep.software.bluemoon.model.DTO.accounting.invoice.InvoiceLineItemDTO;
import itep.software.bluemoon.model.DTO.announcement.AnnouncementCreateRequestDTO;
import itep.software.bluemoon.model.projection.InvoiceInfoSummary;
import itep.software.bluemoon.model.projection.InvoiceSummary;
import itep.software.bluemoon.repository.ApartmentRepository;
import itep.software.bluemoon.repository.ExtraFeeRepository;
import itep.software.bluemoon.repository.InvoiceRepository;
import itep.software.bluemoon.repository.ServicePriceRepository;
import itep.software.bluemoon.repository.ServiceTypeRepository;
import itep.software.bluemoon.repository.UsageRecordRepository;
import itep.software.bluemoon.repository.VehicleRepository;
import itep.software.bluemoon.util.VndUtils;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class InvoiceService {
    private final InvoiceRepository invoiceRepository;
    private final ApartmentRepository apartmentRepository;
    private final ServiceTypeRepository serviceTypeRepository;
    private final ServicePriceRepository servicePriceRepository;
    private final VehicleRepository vehicleRepository;
    private final UsageRecordRepository usageRecordRepository;
    private final ExtraFeeRepository extraFeeRepository;
    private final ObjectMapper objectMapper;
    private final AnnouncementService announcementService;

    public List<InvoiceSummary> getInvoiceSummary(int month, int year){
        return invoiceRepository.getInvoiceSummary(month, year);
    }

    public List<InvoiceSummary> generateBatchInvoice(int month, int year){
        // 1. Kiểm tra xem đã có hóa đơn chính thức chưa
        boolean hasOfficialInvoices = invoiceRepository.existsByMonthAndYearAndStatusNot(
                month, year, InvoiceStatus.PENDING);
        if (hasOfficialInvoices) {
            throw new RuntimeException("This month's bill has been finalized and cannot be re-generated!");
        }

        // 2. Xóa các hóa đơn PENDING cũ để tạo lại (Clean slate)
        List<Invoice> pendingInvoices = invoiceRepository.findByMonthAndYearAndStatus(month, year, InvoiceStatus.PENDING);
        if(pendingInvoices != null && !pendingInvoices.isEmpty()) {
            // Lưu ý: Nếu có ExtraFee đã bị đánh dấu isBilled=true, cần revert lại false ở đây nếu muốn
            revertExtraFeesStatus(pendingInvoices);
            invoiceRepository.deleteAll(pendingInvoices);
            invoiceRepository.flush();
        }

        // 3. Lấy danh sách cần thiết
        List<Apartment> apartments = apartmentRepository.findApartmentsWithResidents();
        List<ServiceType> allServices = serviceTypeRepository.findAll();
        List<UUID> apartmentIds = apartments.stream().map(Apartment::getId).toList();

        Map<UUID, List<Vehicle>> vehicleMap = vehicleRepository
            .findAllByApartmentIds(apartmentIds)
            .stream()
                .filter(v -> v.getOwner() != null && v.getOwner().getApartment() != null) // Safety check
                .collect(Collectors.groupingBy(v -> v.getOwner().getApartment().getId()));

        Map<ServiceCode, ServicePrice> priceConfigMap = new HashMap<>();
        for (ServiceType type : allServices) {
            if (type.getCode() != ServiceCode.OTHER) {
                priceConfigMap.put(type.getCode(), getActivePriceConfig(type.getCode()));
            }
        }

        Map<UUID, UsageRecord> elecMap = usageRecordRepository
            .findAllByServiceCodeAndMonthAndYear(ServiceCode.ELECTRICITY, month, year)
            .stream()
            .collect(Collectors.toMap(
                r -> r.getApartment().getId(),
                Function.identity(),
                (existing, replacement) -> existing
            ));

        Map<UUID, UsageRecord> waterMap = usageRecordRepository
            .findAllByServiceCodeAndMonthAndYear(ServiceCode.WATER, month, year)
            .stream()
            .collect(Collectors.toMap(
                r -> r.getApartment().getId(),
                Function.identity(),
                (existing, replacement) -> existing
            ));

        LocalDateTime overdueDate = calculateOverdueDate(month, year);

        int BATCH_SIZE = 50; 
        List<Invoice> batchInvoices = new ArrayList<>();

        // 4. Duyệt qua từng căn hộ
        for (Apartment apartment : apartments) {
            try {
                Invoice invoice = Invoice.builder()
                        .apartment(apartment)
                        .month(month)
                        .year(year)
                        .totalAmount(BigDecimal.ZERO)
                        .status(InvoiceStatus.PENDING)
                        .paidAmount(BigDecimal.ZERO)
                        .overdueDate(overdueDate)
                        .details(new ArrayList<>()) 
                        .build();

                // 5. Duyệt qua từng loại dịch vụ
                for (ServiceType type : allServices) {
                    ServicePrice priceConfig = priceConfigMap.get(type.getCode());
                    
                    // CASE ĐẶC BIỆT: OTHER (Phí khác) -> Tạo nhiều dòng chi tiết
                    if (type.getCode() == ServiceCode.OTHER) {
                        List<InvoiceDetail> extraFeeDetails = processExtraFees(invoice, apartment, type);
                        for (InvoiceDetail detail : extraFeeDetails) {
                            addDetailToInvoice(invoice, detail);
                        }
                    } 
                    // CASE THƯỜNG: ĐIỆN, NƯỚC, GỬI XE, PQL -> Tạo 1 dòng chi tiết
                    else {
                        InvoiceDetail detail = calculateStandardDetail(invoice, apartment, type, elecMap, waterMap, vehicleMap, priceConfig);
                        if (detail != null) {
                            addDetailToInvoice(invoice, detail);
                        }
                    }
                }

                // Chỉ lưu hóa đơn nếu có phát sinh tiền
                if (invoice.getTotalAmount().compareTo(BigDecimal.ZERO) > 0) {
                    batchInvoices.add(invoice);
                }

                if (batchInvoices.size() >= BATCH_SIZE) {
                    invoiceRepository.saveAll(batchInvoices);
                    invoiceRepository.flush(); // Đẩy SQL xuống DB
                    batchInvoices.clear();     // Giải phóng RAM list tạm
                }

            } catch (Exception e) {
                log.error("Lỗi tạo hóa đơn căn hộ {}: {}", apartment.getRoomNumber(), e.getMessage());
                // Continue loop để không chặn các căn hộ khác
            }
        }

        // Lưu nốt số còn sót lại (nếu có)
        if (!batchInvoices.isEmpty()) {
            invoiceRepository.saveAll(batchInvoices);
            invoiceRepository.flush();
        }

        return getInvoiceSummary(month, year);
    }

    // --- LOGIC CHI TIẾT ---

    // Hàm helper để add detail và cộng tổng tiền
    private void addDetailToInvoice(Invoice invoice, InvoiceDetail detail) {
        invoice.getDetails().add(detail);
        invoice.setTotalAmount(VndUtils.add(invoice.getTotalAmount(), detail.getAmount()));
    }

    // Xử lý các dịch vụ chuẩn (1 InvoiceDetail)
    private InvoiceDetail calculateStandardDetail(Invoice invoice, Apartment apartment, ServiceType type, Map<UUID, UsageRecord> elecMap, Map<UUID, UsageRecord> waterMap, Map<UUID, List<Vehicle>> vehicleMap, ServicePrice priceConfig){
        BigDecimal quantity = BigDecimal.ZERO;
        BigDecimal unitPrice = BigDecimal.ZERO; // Giá hiển thị (nếu là bậc thang thì có thể để 0 hoặc trung bình)
        BigDecimal amount = BigDecimal.ZERO;
        String description = "";
        UsageRecord usageRecord = null; // Link tới entity UsageRecord
        List<InvoiceLineItemDTO> subItems = new ArrayList<>();

        switch(type.getCode()){
            case ServiceCode.MANAGEMENT -> {
                if (priceConfig == null || priceConfig.getFlatPrice() == null) {
                    throw new RuntimeException("Management fees have not yet been configured!");
                }
                quantity = apartment.getArea() != null ? apartment.getArea() : BigDecimal.ZERO;
                unitPrice = priceConfig.getFlatPrice();
                amount = VndUtils.multiply(quantity, unitPrice);
                description = String.format("Management fees (%.2f m2 x %s)", quantity, VndUtils.format(unitPrice));
                subItems.add(createLineItem("Management fee", quantity.intValue(), unitPrice, amount));
            }

            case ServiceCode.PARKING -> {
                if (priceConfig == null) return null;
                List<Vehicle> vehicles = vehicleMap.getOrDefault(apartment.getId(), Collections.emptyList());
                int countBike = 0, countMoto = 0, countCar = 0;
                for(Vehicle v : vehicles) {
                    if (null != v.getType()) switch (v.getType()) {
                        case BICYCLE -> countBike++;
                        case MOTORBIKE -> countMoto++;
                        case CAR -> countCar++;
                        default -> {
                        }
                    }
                }
                BigDecimal priceBike = getPriceForTierName(priceConfig.getTiers(), TierCode.BIKE);
                BigDecimal priceMoto = getPriceForTierName(priceConfig.getTiers(), TierCode.MOTO);
                BigDecimal priceCar  = getPriceForTierName(priceConfig.getTiers(), TierCode.CAR);
                if (countBike > 0) {
                    BigDecimal sub = VndUtils.multiply(priceBike, countBike);
                    subItems.add(createLineItem("Bicycle parking fee", countBike, priceBike, sub));
                    amount = VndUtils.add(amount, sub);
                }
                if (countMoto > 0) {
                    BigDecimal sub = VndUtils.multiply(priceMoto, countMoto);
                    subItems.add(createLineItem("Motorbike parking fee", countMoto, priceMoto, sub));
                    amount = VndUtils.add(amount, sub);
                }
                if (countCar > 0) {
                    BigDecimal sub = VndUtils.multiply(priceCar, countCar);
                    subItems.add(createLineItem("Car parking fee", countCar, priceCar, sub));
                    amount = VndUtils.add(amount, sub);
                }
                int totalVehicles = countBike + countMoto + countCar;
                quantity = BigDecimal.valueOf(totalVehicles);
                if (totalVehicles > 0) {
                    unitPrice = VndUtils.divide(amount, quantity);
                } else {
                    unitPrice = BigDecimal.ZERO;
                }
                description = "Parking fee";
            }

            case ServiceCode.ELECTRICITY -> {
                return calculateUsageTierService(invoice, apartment, type, elecMap, priceConfig);
            }

            case ServiceCode.WATER -> {
                return calculateUsageTierService(invoice, apartment, type, waterMap, priceConfig);
            }

            default -> {
                return null;
            }
        }

        if (amount.compareTo(BigDecimal.ZERO) == 0 && subItems.isEmpty()) {
            return null;
        }

        return InvoiceDetail.builder()
                .invoice(invoice)
                .serviceType(type)
                .quantity(quantity)
                .unitPrice(unitPrice)
                .amount(amount)
                .usageRecord(usageRecord)
                .description(description)
                .lineItems(convertToJson(subItems))
                .build();
    }

    // Xử lý Điện/Nước (Bậc thang + Link UsageRecord)
    private InvoiceDetail calculateUsageTierService(Invoice invoice, Apartment apartment, ServiceType type, Map<UUID, UsageRecord> usageMap, ServicePrice priceConfig) {
        // 1. Tìm UsageRecord (Entity)
        UsageRecord usage = usageMap.get(apartment.getId());

        if (usage == null) {
            log.warn("Warning: Not found usage record of apartment " + apartment.getRoomNumber());
            return null; 
        }

        if (priceConfig == null) {
             throw new RuntimeException("Price config missing for " + type.getCode());
        }

        BigDecimal consumedQuantity = usage.getQuantity();

        // 2. Lấy giá
        List<PriceTier> tiers = priceConfig.getTiers();
        tiers.sort(Comparator.comparing(PriceTier::getMinUsage));

        // 3. Tính toán bậc thang
        BigDecimal remaining = consumedQuantity;
        BigDecimal amountInitial = BigDecimal.ZERO;
        List<InvoiceLineItemDTO> items = new ArrayList<>();

        for (PriceTier tier : tiers) {
            if (remaining.compareTo(BigDecimal.ZERO) <= 0) break;

            BigDecimal amountInTier;
            // Logic tính limit của bậc: Nếu maxLimit null -> Vô cùng (bậc cuối)
            if (tier.getMaxUsage() != null) {
                 BigDecimal limitSize = BigDecimal.valueOf(tier.getMaxUsage()).subtract(BigDecimal.valueOf(tier.getMinUsage())).add(BigDecimal.ONE); 
                 // Ví dụ bậc 1-50 -> Size = 50.
                 amountInTier = remaining.min(limitSize);
            } else {
                 amountInTier = remaining;
            }

            BigDecimal tierCost = VndUtils.multiply(amountInTier, tier.getUnitPrice());
            amountInitial = VndUtils.add(amountInitial, tierCost);

            items.add(createLineItem(tier.getCode().toString() + " (" + VndUtils.format(tier.getUnitPrice()) + ")", 
                                     amountInTier.intValue(), tier.getUnitPrice(), tierCost));

            remaining = remaining.subtract(amountInTier);
        }

        BigDecimal vat = VndUtils.multiply(amountInitial, priceConfig.getVatRate());
        BigDecimal amount = VndUtils.add(amountInitial, vat);
        BigDecimal env = null;
        if(type.getCode().equals(ServiceCode.WATER)) {
            env = VndUtils.multiply(amountInitial, priceConfig.getEnvRate());
            amount = VndUtils.add(amount, env);
        }

        // 4. Tạo InvoiceDetail có link UsageRecord
        return InvoiceDetail.builder()
                .invoice(invoice)
                .serviceType(type)
                .quantity(consumedQuantity)
                .unitPrice(BigDecimal.ZERO) // Giá bậc thang nên để 0
                .amountInitial(amountInitial)
                .vat(vat)
                .env(env)
                .amount(amount)
                .usageRecord(usage)
                .description(String.format("New: %s - Old: %s", usage.getNewIndex(), usage.getOldIndex()))
                .lineItems(convertToJson(items))
                .build();
    }

    // Xử lý Extra Fees (OTHER) -> Trả về danh sách Detail
    @SuppressWarnings("null")
    private List<InvoiceDetail> processExtraFees(Invoice invoice, Apartment apartment, ServiceType type) {
        List<InvoiceDetail> details = new ArrayList<>();
        List<ExtraFee> fees = extraFeeRepository.findByApartmentAndIsBilledFalse(apartment);

        for (ExtraFee fee : fees) {
            BigDecimal quantity = fee.getQuantity();
            BigDecimal amount = fee.getAmount();
            BigDecimal unitPrice = BigDecimal.ZERO;
            if (quantity.compareTo(BigDecimal.ZERO) != 0) {
                unitPrice = VndUtils.divide(amount, quantity);
            }

            InvoiceDetail detail = InvoiceDetail.builder()
                    .invoice(invoice)
                    .serviceType(type)
                    .quantity(quantity)
                    .unitPrice(unitPrice)
                    .amount(amount)
                    .referenceId(fee.getId())
                    .description(fee.getTitle())
                    .lineItems(null)
                    .build();

            details.add(detail);
            
            fee.setBilled(true); 
        }
        
        extraFeeRepository.saveAll(fees); 
        return details;
    }
    
    private void revertExtraFeesStatus(List<Invoice> pendingInvoices) {
        List<UUID> feeIds = pendingInvoices.stream()
            .flatMap(inv -> inv.getDetails().stream())
            .filter(d -> d.getServiceType().getCode() == ServiceCode.OTHER && d.getReferenceId() != null)
            .map(InvoiceDetail::getReferenceId)
            .collect(Collectors.toList());

        if (!feeIds.isEmpty()) {
            extraFeeRepository.updateStatusByIds(false, feeIds);
        }
    }

    // --- HELPER METHODS ---

    private LocalDateTime calculateOverdueDate(int month, int year) {
        // Tạo ngày mùng 1 của tháng tính tiền
        LocalDate billMonth = LocalDate.of(year, month, 1);
        
        // Cộng thêm 1 tháng -> Lấy ngày 10 -> Set giờ là cuối ngày
        // Ví dụ: Bill tháng 12/2025 -> Hạn chót: 10/01/2026 23:59:59
        return billMonth.plusMonths(1)
                        .withDayOfMonth(10) // Có thể thay số 10 bằng cấu hình từ DB
                        .atTime(LocalTime.MAX);
    }

    private ServicePrice getActivePriceConfig(ServiceCode code) {
        return servicePriceRepository.findActivePriceByCode(code, LocalDate.now())
                .orElseThrow(() -> new RuntimeException("Service price has not yet been configured: " + code));
    }

    private BigDecimal getPriceForTierName(List<PriceTier> tiers, TierCode tierCode) {
        if (tierCode == null) return BigDecimal.ZERO;
        return tiers.stream()
                .filter(t -> t.getCode() == tierCode)
                .findFirst()
                .map(PriceTier::getUnitPrice)
                .orElse(BigDecimal.ZERO);
    }

    private InvoiceLineItemDTO createLineItem(String desc, int quantity, BigDecimal price, BigDecimal total) {
        return InvoiceLineItemDTO.builder()
                .description(desc)
                .quantity(BigDecimal.valueOf(quantity))
                .unitPrice(price)
                .amount(total)
                .build();
    }

    private String convertToJson(List<InvoiceLineItemDTO> items) {
        try {
            return objectMapper.writeValueAsString(items);
        } catch (JsonProcessingException e) {
            log.error("JSON Error", e);
            return "[]";
        }
    }

    public List<InvoiceSummary> confirmInvoices(int month, int year, UUID staffId) {
        List<Invoice> pendingInvoices = invoiceRepository.findByMonthAndYearAndStatus(
                month, year, InvoiceStatus.PENDING);
        
        if (pendingInvoices.isEmpty()) {
            throw new RuntimeException(
                String.format("Not found PENDING invoice in %d/%d", month, year));
        }

        int BATCH_SIZE = 50;
        List<Invoice> invoiceBatch = new ArrayList<>();
        
        for (Invoice invoice : pendingInvoices) {
            try {
                invoice.setStatus(InvoiceStatus.UNPAID);
                createInvoiceNotification(invoice, staffId);
                invoiceBatch.add(invoice);
                if (invoiceBatch.size() >= BATCH_SIZE) {
                    invoiceRepository.saveAll(invoiceBatch);
                    invoiceRepository.flush(); // Đẩy lệnh SQL đi ngay để giải phóng bộ nhớ
                    invoiceBatch.clear();       // Xóa danh sách tạm
                }
            } catch (Exception e) {
                log.error("Error comfirming invoice {}: {}", invoice.getId(), e.getMessage());
            }
        }

        if (!invoiceBatch.isEmpty()) {
            invoiceRepository.saveAll(invoiceBatch);
            invoiceRepository.flush();
        }
        
        return invoiceRepository.findInvoiceSummariesByMonthYearStatus(month, year, InvoiceStatus.UNPAID);
    }
    
    private void createInvoiceNotification(Invoice invoice, UUID staffId) {
        Apartment apartment = invoice.getApartment();
        
        AnnouncementCreateRequestDTO request = new AnnouncementCreateRequestDTO();
        request.setSenderId(staffId);
        request.setTitle(String.format("Hóa đơn tháng %d/%d", invoice.getMonth(), invoice.getYear()));
        request.setMessage(String.format(
            "Căn hộ %d có hóa đơn mới với tổng số tiền: %s VNĐ. Vui lòng thanh toán trước hạn.",
            apartment.getRoomNumber(),
            VndUtils.format(invoice.getTotalAmount())
        ));
        request.setTargetType(AnnouncementTargetType.SPECIFIC_APARTMENTS);
        request.setApartmentIds(List.of(apartment.getId()));
        request.setTargetDetail("Hóa đơn căn hộ " + apartment.getRoomNumber());
        
        // Gọi service có sẵn
        announcementService.createAnnouncement(request);
    }
    
    @SuppressWarnings("null")
    public List<InvoiceSummary> getInvoicesByApartmentId(UUID apartmentId) {
        if (!apartmentRepository.existsById(apartmentId)) {
            throw new RuntimeException("Apartment not found with ID: " + apartmentId);
        }
        return invoiceRepository.findInvoiceSummariesByApartmentId(apartmentId);
    }
    
    
    
    
    public Map<String, Object> getInvoiceWithDetails(UUID invoiceId) {
        InvoiceInfoSummary invoice = invoiceRepository.findInvoiceInfoById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found with ID: " + invoiceId));

        List<InvoiceDetailResponseDTO> details = invoiceRepository.findInvoiceDetailsByInvoiceId(invoiceId);
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("invoice", invoice);
        response.put("details", details);
        
        return response;
    }
}
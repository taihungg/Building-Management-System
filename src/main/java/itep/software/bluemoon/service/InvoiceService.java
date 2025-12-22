package itep.software.bluemoon.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;

import itep.software.bluemoon.entity.Apartment;
import itep.software.bluemoon.entity.Vehicle;
import itep.software.bluemoon.entity.accounting.Invoice;
import itep.software.bluemoon.entity.accounting.InvoiceDetail;
import itep.software.bluemoon.entity.accounting.PriceTier;
import itep.software.bluemoon.entity.accounting.ServicePrice;
import itep.software.bluemoon.entity.accounting.ServiceType;
import itep.software.bluemoon.enumeration.InvoiceStatus;
import itep.software.bluemoon.enumeration.ServiceCode;
import itep.software.bluemoon.enumeration.TierName;
import itep.software.bluemoon.enumeration.VehicleType;
import itep.software.bluemoon.model.DTO.accounting.InvoiceLineItemDTO;
import itep.software.bluemoon.model.projection.InvoiceSummary;
import itep.software.bluemoon.repository.ApartmentRepository;
import itep.software.bluemoon.repository.InvoiceRepository;
import itep.software.bluemoon.repository.ServicePriceRepository;
import itep.software.bluemoon.repository.ServiceTypeRepository;
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
    private final ObjectMapper objectMapper;

    public List<InvoiceSummary> getInvoiceSummary(Integer month, Integer year){
        return invoiceRepository.getInvoiceSummary(month, year);
    }

    public int generateBatchInvoice(Integer month, Integer year){
        boolean hasOfficialInvoices = invoiceRepository.existsByMonthAndYearAndStatusNot(
                month, year, InvoiceStatus.PENDING);
        if (hasOfficialInvoices) {
            throw new RuntimeException("This month already has official invoices!");
        }

        List<Invoice> pendingInvoices = invoiceRepository.findByMonthAndYearAndStatus(month, year, InvoiceStatus.PENDING);
        if(pendingInvoices != null) {
            invoiceRepository.deleteAll(pendingInvoices);
            invoiceRepository.flush();
        }

        List<Apartment> apartments = apartmentRepository.findApartmentsWithResidents();
        List<ServiceType> allServices = serviceTypeRepository.findAll();

        List<Invoice> newInvoices = new ArrayList<>();

        for (Apartment apartment : apartments) {
            try {
                Invoice invoice = Invoice.builder()
                        .apartment(apartment)
                        .month(month)
                        .year(year)
                        .status(InvoiceStatus.PENDING)
                        .totalAmount(BigDecimal.ZERO)
                        .build();

                for (ServiceType type : allServices) {
                    InvoiceDetail detail = calculateDetail(invoice, apartment, type, month, year);

                    if (detail != null) {
                        invoice.getDetails().add(detail);
                        invoice.setTotalAmount(VndUtils.add(invoice.getTotalAmount(), detail.getAmount()));
                    }
                }

                if (invoice.getTotalAmount().compareTo(BigDecimal.ZERO) > 0) {
                    newInvoices.add(invoice);
                }

            } catch (Exception e) {
                log.error("Error calculate invoice of apartment {}: {}", apartment.getRoomNumber(), e.getMessage());
            }
        }
        invoiceRepository.saveAll(newInvoices);
        return newInvoices.size();
    }

    private InvoiceDetail calculateDetail(Invoice invoice, Apartment apartment, ServiceType type, int month, int year){
        BigDecimal quantity = BigDecimal.ZERO;
        BigDecimal unitPrice = BigDecimal.ZERO;
        BigDecimal amount = BigDecimal.ZERO;
        Double oldIndex = null;
        Double newIndex = null;
        String description = null;
        List<InvoiceLineItemDTO> subItems = new ArrayList<>();
        ServicePrice priceConfig;

        switch(type.getCode()){
            case ServiceCode.MANAGEMENT:
                priceConfig = servicePriceRepository.findActivePriceByCode(ServiceCode.MANAGEMENT, LocalDate.now())
                        .orElseThrow(() -> new RuntimeException("Management price not configured!"));

                if (priceConfig.getTiers() == null || priceConfig.getTiers().isEmpty()) {
                    throw new RuntimeException("Management Fee price list has no price levels yet!");
                }

                quantity = apartment.getArea();
                unitPrice = priceConfig.getTiers().getFirst().getUnitPrice();
                amount = VndUtils.multiply(quantity, unitPrice);
                description = "";

                break;

            case ServiceCode.PARKING:
                priceConfig = servicePriceRepository.findActivePriceByCode(ServiceCode.PARKING, LocalDate.now())
                        .orElseThrow(() -> new RuntimeException("Parking price not configured!"));
                List<Vehicle> vehicles = vehicleRepository.findByOwner_Apartment_Id(apartment.getId());

                int countBike = 0, countMoto = 0, countCar = 0;
                for(Vehicle v : vehicles) {
                    if (v.getType() == VehicleType.BICYCLE) countBike++;
                    else if (v.getType() == VehicleType.MOTORBIKE) countMoto++;
                    else if (v.getType() == VehicleType.CAR) countCar++;
                }

                BigDecimal priceBike = getPriceForTierName(priceConfig.getTiers(), TierName.BIKE); // Hoặc tên bạn lưu trong DB
                BigDecimal priceMoto = getPriceForTierName(priceConfig.getTiers(), TierName.MOTO);
                BigDecimal priceCar  = getPriceForTierName(priceConfig.getTiers(), TierName.CAR);

                BigDecimal subTotal = VndUtils.multiply(priceBike, countBike);
                subItems.add(createLineItem("Xe đạp", countBike, priceBike, subTotal));
                amount = VndUtils.add(amount, subTotal);

                subTotal = VndUtils.multiply(priceMoto, countMoto);
                subItems.add(createLineItem("Xe máy", countMoto, priceMoto, subTotal));
                amount = VndUtils.add(amount, subTotal);

                subTotal = VndUtils.multiply(priceCar, countCar);
                subItems.add(createLineItem("Ô tô", countCar, priceCar, subTotal));
                amount = VndUtils.add(amount, subTotal);

                quantity = BigDecimal.valueOf(countBike + countMoto + countCar);

                if (quantity.compareTo(BigDecimal.ZERO) > 0) {
                    unitPrice = VndUtils.divide(amount, quantity);
                }

                break;

            case ServiceCode.WATER:

            case ServiceCode.ELECTRONIC:

            case ServiceCode.PENALTY:

            default:
                return null;
        }

        String jsonLineItems = convertToJson(subItems);

        return InvoiceDetail.builder()
                .invoice(invoice)
                .serviceType(type)
                .quantity(quantity)
                .unitPrice(unitPrice)
                .amount(amount)
                .oldIndex(oldIndex)
                .newIndex(newIndex)
                .description(description)
                .lineItems(jsonLineItems)
                .build();
    }

    private BigDecimal getPriceForTierName(List<PriceTier> tiers, TierName tierName) {
        if (tierName == null) return BigDecimal.ZERO;

        return tiers.stream()
                // Sửa dòng này: Dùng '==' để so sánh 2 Enum
                .filter(t -> t.getName() == tierName)
                .findFirst()
                .map(PriceTier::getUnitPrice)
                .orElse(BigDecimal.ZERO);
    }

    private InvoiceLineItemDTO createLineItem(String desc, int qty, BigDecimal price, BigDecimal total) {
        return InvoiceLineItemDTO.builder()
                .description(desc)
                .quantity(BigDecimal.valueOf(qty))
                .unitPrice(price)
                .amount(total)
                .build();
    }

    private String convertToJson(List<InvoiceLineItemDTO> items) {
        try {
            return objectMapper.writeValueAsString(items);
        } catch (Exception e) {
            log.error("Lỗi tạo JSON hóa đơn: {}", e.getMessage());
            throw new RuntimeException("System error while processing invoice details (JSON Error)", e);
        }
    }
}

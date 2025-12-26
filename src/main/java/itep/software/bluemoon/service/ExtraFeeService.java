package itep.software.bluemoon.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import itep.software.bluemoon.entity.Apartment;
import itep.software.bluemoon.entity.accounting.ExtraFee;
import itep.software.bluemoon.model.DTO.accounting.extra.ExtraFeeCreationDTO;
import itep.software.bluemoon.model.DTO.accounting.extra.ExtraFeeDetailDTO;
import itep.software.bluemoon.model.projection.ExtraFeeSummary;
import itep.software.bluemoon.repository.ApartmentRepository;
import itep.software.bluemoon.repository.ExtraFeeRepository;
import itep.software.bluemoon.util.VndUtils;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ExtraFeeService {
    ApartmentRepository apartmentRepository;
    ExtraFeeRepository extraFeeRepository;

    @SuppressWarnings("null")
    public ExtraFeeDetailDTO getExtraFeeDetail(UUID id){
        ExtraFee extraFee = extraFeeRepository.findById(id)
                .orElseThrow(()-> new RuntimeException("Extra Fee not found"));

        return ExtraFeeDetailDTO.builder()
                .title(extraFee.getTitle())
                .description(extraFee.getDescription())
                .quantity(VndUtils.format(extraFee.getQuantity()))
                .unitPrice(VndUtils.format(extraFee.getUnitPrice()))
                .amount(VndUtils.format(extraFee.getAmount()))
                .isBilled(extraFee.isBilled())
                .feeDate(extraFee.getFeeDate())
                .apartmentLabel(extraFee.getApartment().getRoomNumber() + extraFee.getApartment().getBuilding().getName())
                .build();
    }
    
    @SuppressWarnings("null")
    public ExtraFeeDetailDTO createExtraFee(ExtraFeeCreationDTO dto) {
        Apartment apartment = apartmentRepository.findById(dto.getApartmentId())
                .orElseThrow(() -> new RuntimeException("Apartment not found!"));

        if(dto.getTitle() == null){
            throw new IllegalArgumentException("Title can not be null!");
        }

        if(dto.getQuantity() == null){
            throw new IllegalArgumentException("Quantity can not be null!");
        }

        if(dto.getUnitPrice() == null){
            throw new IllegalArgumentException("Unit Price can not be null!");
        }

        if(dto.getYear() == null){
            throw new IllegalArgumentException("Year can not be null!");
        }

        if(dto.getMonth() == null){
            throw new IllegalArgumentException("Month can not be null!");
        }

        if(dto.getDay() == null){
            throw new IllegalArgumentException("Day can not be null!");
        }

        BigDecimal amount = VndUtils.multiply(dto.getQuantity(), dto.getUnitPrice());

        LocalDate feeDate = LocalDate.of(dto.getYear(), dto.getMonth(), dto.getDay());

        ExtraFee newExtraFee = extraFeeRepository.save(
                    ExtraFee.builder()
                    .apartment(apartment)
                    .title(dto.getTitle())
                    .description(dto.getDescription())
                    .quantity(dto.getQuantity())
                    .unitPrice(dto.getUnitPrice())
                    .amount(amount)
                    .feeDate(feeDate)
                    .isBilled(dto.isBilled())
                    .build()
        );

        return getExtraFeeDetail(newExtraFee.getId());
    }

    public List<ExtraFeeSummary> searchByAllInformation(String keyword){
        return extraFeeRepository.searchGeneral(keyword.trim());
    }
}
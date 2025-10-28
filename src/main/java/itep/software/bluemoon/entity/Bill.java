package itep.software.bluemoon.entity;

import itep.software.bluemoon.enumeration.BillStatus;
import itep.software.bluemoon.enumeration.BillType;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bill {
    private String id;

    private BillType type;

    private LocalDate startDate;
    private LocalDate expiredDate;

    private Apartment apartment;

    private BillStatus status;
}

package itep.software.bluemoon.entity.key;

import java.io.Serializable;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode
@Embeddable
public class ResidentAnnouncementId implements Serializable {

    @Column(name = "resident_id")
    private UUID residentId;

    @Column(name = "announcement_id")
    private UUID announcementId;
}
package itep.software.bluemoon.entity;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {
    private String id;

    private String title;

    private String message;
}

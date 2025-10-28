package itep.software.bluemoon.entity.person;

import itep.software.bluemoon.entity.User;
import lombok.*;

import java.util.ArrayList;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Staff extends Person {
    private User account;

}

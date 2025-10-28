package itep.software.bluemoon.enumeration;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum UserRole {
    ADMIN,
    MANAGER,
    ACCOUNTANT,
    RESIDENT
}

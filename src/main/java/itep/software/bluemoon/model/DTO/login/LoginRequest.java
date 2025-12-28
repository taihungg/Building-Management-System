package itep.software.bluemoon.model.DTO.login;

import lombok.Data;

@Data
public class LoginRequest {
    private String username;
    private String password;
}

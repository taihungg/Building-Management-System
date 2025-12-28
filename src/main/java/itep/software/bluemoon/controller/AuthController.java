package itep.software.bluemoon.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import itep.software.bluemoon.model.DTO.login.LoginRequest;
import itep.software.bluemoon.model.DTO.login.LoginResponse;
import itep.software.bluemoon.response.ApiResponse;
import itep.software.bluemoon.service.AuthService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<Object> login(@RequestBody LoginRequest request) {
        LoginResponse data = authService.login(request);

        return ApiResponse.responseBuilder(
            HttpStatus.OK, 
            "Authenticate user successfully!", 
            data
        );
    }
    
    @PostMapping("/logout")
    public ResponseEntity<Object> logout() {
        return ApiResponse.responseBuilder(
            HttpStatus.OK, 
            "Logout successfully!", 
            null
        );
    }
}

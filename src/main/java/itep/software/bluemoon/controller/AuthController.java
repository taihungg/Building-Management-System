package itep.software.bluemoon.controller;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/auth") // Route gốc
public class AuthController {
    @Autowired
    private AuthService authService;


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            // 1. Gọi service
            AuthResponseDTO response = authService.login(loginRequest);
            
            // 2. Trả về 200 OK + "Giỏ hàng" (AuthResponseDTO)
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            // 3. Nếu service ném lỗi (sai pass, sai user)
            // Trả về lỗi 401 Unauthorized
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }
}

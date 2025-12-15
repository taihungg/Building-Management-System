package itep.software.bluemoon.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Áp dụng cho TẤT CẢ các đường dẫn
                .allowedOrigins("http://localhost:3000") // Chỉ cho phép origin này
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS") // Cho phép các phương thức cần thiết                .allowedHeaders("*") // Cho phép tất cả các header
                .allowCredentials(true); // (Nếu bạn dùng cookies/session)
    }
}
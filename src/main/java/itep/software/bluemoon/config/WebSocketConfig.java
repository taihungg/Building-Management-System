package itep.software.bluemoon.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * Cấu hình WebSocket cho push notification
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    
    @Value("${app.cors.allowed-origins:http://localhost:3000,http://localhost:8080}")
    private String[] allowedOrigins;
    
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enable simple broker cho push notifications
        config.enableSimpleBroker("/topic");
        
        // Prefix cho các message từ client
        config.setApplicationDestinationPrefixes("/app");
    }
    
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Endpoint cho WebSocket connection
        registry.addEndpoint("/ws")
                .setAllowedOrigins(allowedOrigins) // Sử dụng origins cụ thể từ config
                .withSockJS();
        
        // Thêm endpoint không có SockJS fallback cho native WebSocket
        registry.addEndpoint("/ws")
                .setAllowedOrigins(allowedOrigins);
    }
}

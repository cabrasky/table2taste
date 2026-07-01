package net.cabrasky.table2taste.backend.configuration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import net.cabrasky.table2taste.backend.websocket.TicketPrinterFinalTicketWebSocketHandler;
import net.cabrasky.table2taste.backend.websocket.TicketPrinterOrderWebSocketHandler;



@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(@NonNull CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .maxAge(3600);
    }
    
    @Bean
    public TicketPrinterOrderWebSocketHandler ticketPrinterWebSocketHandler() {
        return new TicketPrinterOrderWebSocketHandler();
    }
    
    @Bean
    public TicketPrinterFinalTicketWebSocketHandler ticketPrinterFinalTicketWebSocketHandler() {
        return new TicketPrinterFinalTicketWebSocketHandler();
    }

}

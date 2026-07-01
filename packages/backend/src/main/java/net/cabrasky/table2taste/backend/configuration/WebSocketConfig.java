package net.cabrasky.table2taste.backend.configuration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

import net.cabrasky.table2taste.backend.websocket.TicketPrinterFinalTicketWebSocketHandler;
import net.cabrasky.table2taste.backend.websocket.TicketPrinterOrderWebSocketHandler;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

	@Autowired
	private TicketPrinterOrderWebSocketHandler ticketPrinterWebSocketHandler;
	@Autowired
	private TicketPrinterFinalTicketWebSocketHandler ticketPrinterFinalTicketWebSocketHandler;

    @Override
    public void registerWebSocketHandlers(@NonNull WebSocketHandlerRegistry registry) {
        registry.addHandler(ticketPrinterWebSocketHandler, "/ws/orderPrinter")
        .setAllowedOrigins("*");
        registry.addHandler(ticketPrinterFinalTicketWebSocketHandler, "/ws/receiptPrinter")
        .setAllowedOrigins("*");
    }
}

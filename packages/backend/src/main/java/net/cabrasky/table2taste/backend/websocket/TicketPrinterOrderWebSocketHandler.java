package net.cabrasky.table2taste.backend.websocket;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.lang.NonNull;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

public class TicketPrinterOrderWebSocketHandler extends TextWebSocketHandler {
	private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();

	@Override
	public void afterConnectionEstablished(@NonNull WebSocketSession session) throws Exception {
            sessions.put(session.getId(), session);
    }

	
	@SuppressWarnings("null")
	@Override
    public void afterConnectionClosed(@NonNull WebSocketSession session, @NonNull CloseStatus status) throws Exception {
		System.out.println(String.format("Printer disconnected from: %s", session.getLocalAddress().toString()));
        sessions.remove(session.getId());
    }



	public void broadcast(String message) {
		for (WebSocketSession session : sessions.values()) {
            if (session.isOpen()) {
            	try {
                session.sendMessage(new TextMessage(message));
            	} catch (IOException ex) {
            		ex.printStackTrace();
            	}
            }
        }
	}
}

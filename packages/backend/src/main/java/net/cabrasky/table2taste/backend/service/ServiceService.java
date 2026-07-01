package net.cabrasky.table2taste.backend.service;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Date;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import net.cabrasky.table2taste.backend.model.MenuItem;
import net.cabrasky.table2taste.backend.model.OrderItem;
import net.cabrasky.table2taste.backend.model.OrderItemQuantity;
import net.cabrasky.table2taste.backend.model.Service;
import net.cabrasky.table2taste.backend.model.Table;
import net.cabrasky.table2taste.backend.repository.ServiceRepository;
import net.cabrasky.table2taste.backend.repository.TableRepository;
import net.cabrasky.table2taste.backend.websocket.TicketPrinterFinalTicketWebSocketHandler;

@org.springframework.stereotype.Service
public class ServiceService {

	@Autowired
	private TableRepository tableRepository;

	@Autowired
	private ServiceRepository serviceRepository;

	@Autowired
	private TicketPrinterFinalTicketWebSocketHandler ticketPrinterFinalTicketWebSocketHandler;

	@Transactional
	public Service closeService(Table table) {
		if (table !=null && table.getLastService() != null) {
			Service service = table.getLastService();
			service.setIsOpen(false);
			service.setCloseTimestamp(new Timestamp(new Date().getTime()));
			service = serviceRepository.save(service);
			table.setLastService(null);
			tableRepository.save(table);

			JsonObject closureMessage = createClosureMessage(service);
			ticketPrinterFinalTicketWebSocketHandler.broadcast(closureMessage.toString());

			return service;
		}
		return null;
	}

	private JsonObject createClosureMessage(Service service) {
	    JsonObject message = new JsonObject();
	    message.addProperty("current_date", LocalDate.now().toString());
	    message.addProperty("current_time", LocalTime.now().toString());
	    message.addProperty("table_id", service.getTable().getId());
	    message.addProperty("close_timestamp", service.getCloseTimestamp().toString());

	    Map<OrderItem, Integer> combinedItems = combinedOrderItems(service.getAllOrderItems());
	    double totalPrice = calculateTotalPrice(combinedItems);
	    
	    JsonArray items = new JsonArray();
		combinedItems.forEach((orderItem, quantity) -> {
			JsonObject itemJson = createItemJson(orderItem, quantity);
			items.add(itemJson);
		});
	    
	    message.add("items", items);
	    message.addProperty("total_price", totalPrice);

	    return message;
	}

	private double calculateTotalPrice(Map<OrderItem, Integer> combinedItems) {
		return combinedItems.entrySet().stream().mapToDouble(entry -> entry.getKey().getPrice() * entry.getValue()).sum();
	}


	private Map<OrderItem, Integer> combinedOrderItems(Set<OrderItemQuantity> orderItemQuantities) {
		return orderItemQuantities.stream().collect(Collectors.groupingBy(
				orderItem -> orderItem.getOrderItem(), Collectors.summingInt(OrderItemQuantity::getQuantity)));
	}

	private JsonObject createItemJson(OrderItem orderItem, Integer quantity) {
		JsonObject item = new JsonObject();
		MenuItem menuItem = orderItem.getMenuItem();
		item.addProperty("name", getMenuItemName(menuItem));
		item.addProperty("quantity", quantity);
		item.addProperty("annotations", orderItem.getAnnotations());
		item.addProperty("price", orderItem.getPrice() * quantity);
		return item;
	}

	private String getMenuItemName(MenuItem menuItem) {
		return menuItem.getTranslations().stream()
				.filter(t -> t.getLanguage().getId().equals("en") && t.getTranslationKey().equals("name")).findFirst()
				.orElseThrow(() -> new RuntimeException("Translation not found")).getValue();
	}
}

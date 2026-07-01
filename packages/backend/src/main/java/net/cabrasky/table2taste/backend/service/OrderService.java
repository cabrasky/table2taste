package net.cabrasky.table2taste.backend.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

import org.apache.coyote.BadRequestException;
import org.springframework.beans.factory.annotation.Autowired;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import net.cabrasky.table2taste.backend.mappers.OrderMapper;
import net.cabrasky.table2taste.backend.model.MenuItem;
import net.cabrasky.table2taste.backend.model.Order;
import net.cabrasky.table2taste.backend.model.OrderItemQuantity;
import net.cabrasky.table2taste.backend.model.Service;
import net.cabrasky.table2taste.backend.model.Table;
import net.cabrasky.table2taste.backend.modelDto.OrderDTO;
import net.cabrasky.table2taste.backend.repository.OrderRepository;
import net.cabrasky.table2taste.backend.repository.ServiceRepository;
import net.cabrasky.table2taste.backend.repository.TableRepository;
import net.cabrasky.table2taste.backend.repository.UserRepository;
import net.cabrasky.table2taste.backend.websocket.TicketPrinterOrderWebSocketHandler;

@org.springframework.stereotype.Service
public class OrderService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TableRepository tableRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private OrderMapper orderMapper;
    
    @Autowired
    private TicketPrinterOrderWebSocketHandler ticketPrinterOrderWebSocketHandler;

    public Table findTableForUserOrById(String username, Long tableId) {
        Optional<Table> optTable = tableRepository.findByUsername(username).stream().findFirst();
        if (optTable.isEmpty() && tableId != null) {
            optTable = tableRepository.findById(tableId);
        }
        return optTable.orElse(null);
    }

    public JsonObject createTicketData(Order order) {
        JsonObject ticketData = new JsonObject();
        ticketData.addProperty("current_date", LocalDate.now().toString());
        ticketData.addProperty("current_time", LocalTime.now().toString());
        ticketData.addProperty("table_id", order.getService().getTable().getId());

        JsonArray items = new JsonArray();
        for (OrderItemQuantity orderItem : order.getOrderItemQuantities()) {
            JsonObject item = new JsonObject();
            MenuItem menuItem = orderItem.getOrderItem().getMenuItem();
            item.addProperty("name", getMenuItemName(menuItem));
            item.addProperty("quantity", orderItem.getQuantity());
            item.addProperty("annotations", orderItem.getOrderItem().getAnnotations());
            items.add(item);
        }
        ticketData.add("items", items);
        return ticketData;
    }

    private String getMenuItemName(MenuItem menuItem) {
        return menuItem.getTranslations().stream()
                .filter(t -> t.getLanguage().getId().equals("en") && t.getTranslationKey().equals("name"))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Translation not found"))
                .getValue();
    }
    
    public Order createOrder(String username, Table table, OrderDTO orderDto) throws BadRequestException {
        Order order = orderMapper.mapOrderDTOToOrder(orderDto);
        order.setUser(userRepository.findById(username).get());
        Service service = table.getLastService();
        if(service == null) {
        	service = new Service();
        	service.setTable(table);
        	table.setLastService(service);
        	serviceRepository.save(service);
        	tableRepository.save(table);
        }
        if(!service.getIsOpen().booleanValue()) {
            throw new BadRequestException("service clossed");
        }
        
        order.setService(service);
        order.getOrderItemQuantities().stream().forEach(orderItemQuantity -> {orderItemQuantity.setOrder(order);});
        Order o = orderRepository.save(order);

        JsonObject ticketData = createTicketData(o);
        ticketPrinterOrderWebSocketHandler.broadcast(ticketData.toString());
        return order;
    }
}

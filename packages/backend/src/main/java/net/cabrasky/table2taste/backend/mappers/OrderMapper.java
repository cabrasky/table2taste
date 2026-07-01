package net.cabrasky.table2taste.backend.mappers;

import net.cabrasky.table2taste.backend.model.MenuItem;
import net.cabrasky.table2taste.backend.model.Order;
import net.cabrasky.table2taste.backend.model.OrderItem;
import net.cabrasky.table2taste.backend.model.OrderItemQuantity;
import net.cabrasky.table2taste.backend.modelDto.OrderDTO;
import net.cabrasky.table2taste.backend.repository.MenuItemRepository;
import net.cabrasky.table2taste.backend.repository.OrderItemRepository;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Example;
import org.springframework.stereotype.Component;

@Component
public class OrderMapper {

	@Autowired
    private OrderItemRepository orderItemRepository;

	@Autowired
    private MenuItemRepository menuItemRepository;


	public Order mapOrderDTOToOrder(OrderDTO orderDTO) {
	    Order order = new Order();
	    
	    List<OrderItemQuantity> orderItemQuantities = orderDTO.orderItems.stream()
	            .map(orderItemDTO -> {
	                OrderItem orderItem = findOrCreateOrderItem(orderItemDTO);
	                OrderItemQuantity orderItemQuantity = new OrderItemQuantity();
	                orderItemQuantity.setOrderItem(orderItem);
	                orderItemQuantity.setQuantity(orderItemDTO.quantity);
	                return orderItemQuantity;
	            })
	            .collect(Collectors.toList());

	    order.setOrderItemQuantities(new HashSet<>(orderItemQuantities));

	    return order;
	}


    private OrderItem findOrCreateOrderItem(OrderDTO.OrderItem orderItemDTO) {
    	MenuItem menuItem = menuItemRepository.findById(orderItemDTO.id).get();
    	OrderItem exampleOrderItem = new OrderItem();
        exampleOrderItem.setMenuItem(menuItem);
        exampleOrderItem.setAnnotations(orderItemDTO.annotations);
        exampleOrderItem.setPrice(menuItem.getPrice());

        Example<OrderItem> example = Example.of(exampleOrderItem);

        Optional<OrderItem> existingOrderItem = orderItemRepository.findOne(example);

        return existingOrderItem.orElseGet(() -> {            
            return orderItemRepository.save(exampleOrderItem);
        });
    }
}

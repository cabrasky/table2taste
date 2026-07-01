package net.cabrasky.table2taste.backend.controller;

import java.util.Set;

import org.apache.coyote.BadRequestException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import net.cabrasky.table2taste.backend.model.Order;
import net.cabrasky.table2taste.backend.model.Service;
import net.cabrasky.table2taste.backend.model.Table;
import net.cabrasky.table2taste.backend.modelDto.OrderDTO;
import net.cabrasky.table2taste.backend.service.OrderService;

@RestController
@RequestMapping("/order")
public class OrderController {

	@Autowired
	private OrderService orderService;

	@PostMapping
	@PreAuthorize("hasAuthority('PLACE_ORDER')")
	public ResponseEntity<String> sendMessageToWebSocketClients(@RequestBody OrderDTO orderDto,
			@RequestParam(required = false) Long tableId) throws BadRequestException {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		String currentPrincipalName = authentication.getName();

		Table table = orderService.findTableForUserOrById(currentPrincipalName, tableId);
		if (table == null) {
			return ResponseEntity.badRequest().body("Table not found for user or provided ID");
		}

		orderService.createOrder(currentPrincipalName, table, orderDto);

		return ResponseEntity.ok().build();
	}

	@GetMapping("/history")
    @PreAuthorize("hasAuthority('PLACE_ORDER')")
    public ResponseEntity<Set<Order>> getHistory(@RequestParam(required = false) Long tableId) throws BadRequestException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentPrincipalName = authentication.getName();

        Table table = orderService.findTableForUserOrById(currentPrincipalName, tableId);
        if (table == null) {
            return ResponseEntity.badRequest().build();
        }
        Service service = table.getLastService();
        return ResponseEntity.ok().body(service == null ? null : service.getOrders());
    }
}

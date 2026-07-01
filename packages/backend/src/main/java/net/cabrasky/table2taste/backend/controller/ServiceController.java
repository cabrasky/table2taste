package net.cabrasky.table2taste.backend.controller;

import net.cabrasky.table2taste.backend.model.Service;
import net.cabrasky.table2taste.backend.model.Table;
import net.cabrasky.table2taste.backend.service.OrderService;
import net.cabrasky.table2taste.backend.service.ServiceService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/services")
public class ServiceController{

    @Autowired
    private OrderService orderService;

    @Autowired
    private ServiceService serviceService;
	
	@GetMapping("/close")
	@PreAuthorize("hasAuthority('PLACE_ORDER')")
	public ResponseEntity<Service> closeService(@RequestParam(required = false) Long tableId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentPrincipalName = authentication.getName();

        Table table = orderService.findTableForUserOrById(currentPrincipalName, tableId);
        Service closedService = serviceService.closeService(table);
        if (closedService != null) {
            return new ResponseEntity<>(closedService, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
	}

}

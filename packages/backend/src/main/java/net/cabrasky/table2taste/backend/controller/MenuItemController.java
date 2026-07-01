package net.cabrasky.table2taste.backend.controller;

import net.cabrasky.table2taste.backend.model.Category;
import net.cabrasky.table2taste.backend.model.MenuItem;
import net.cabrasky.table2taste.backend.modelDto.MenuItemDTO;
import net.cabrasky.table2taste.backend.service.MenuItemService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping(path = "/menuItems")
public class MenuItemController extends AbstractModificableController<MenuItem, MenuItemDTO, String, MenuItemService> {
	@Override
    @PreAuthorize("hasAuthority('CREATE_MENU_ITEMS')")
	public ResponseEntity<MenuItem> create(MenuItemDTO entity) {
		return super.create(entity);
	}
	
	@Override
    @PreAuthorize("hasAuthority('UPDATE_MENU_ITEMS')")
    public boolean update(@RequestParam(name="id") String id, @RequestBody MenuItemDTO updates) {
		return super.update(id, updates);
    }
	
	@Override
    @PreAuthorize("hasAuthority('DELETE_MENU_ITEMS')")
    public void delete(@RequestParam(name="id") String id) {
		super.delete(id);
    }
	
	@GetMapping(path = "/ancestors")
	public List<Category> getAllParents(@RequestParam(required = false) String id) {
		if (id == null) {
			return Collections.emptyList();
		}
		return service.getCategoryAncestors(id);
	}

	@GetMapping(params = { "categoryId", "allergenIds" })
	public List<MenuItem> getAllFiltered(@RequestParam List<String> allergenIds, String categoryId) {
		return service.getMenuItemsByAllergensAndCategory(allergenIds, categoryId.isEmpty() ? null : categoryId);
	}

	@GetMapping(params = { "categoryId" })
	public List<MenuItem> getAllFilteredByCategory(@RequestParam String categoryId) {
		return service.getMenuItemsByAllergensAndCategory(null, categoryId.isEmpty() ? null : categoryId);
	}
}

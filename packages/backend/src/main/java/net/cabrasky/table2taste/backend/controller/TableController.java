package net.cabrasky.table2taste.backend.controller;

import net.cabrasky.table2taste.backend.model.Table;
import net.cabrasky.table2taste.backend.service.TableService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tables")
public class TableController {

	@Autowired
    private TableService tableService;

    @GetMapping
    @PreAuthorize("hasAuthority('VIEW_TABLES')")
    public List<Table> getAllTables() {
        return tableService.getAllTables();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('VIEW_TABLES')")
    public Table getTableById(@PathVariable Long id) {
        return tableService.getTableById(id);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADD_TABLES')")
    public Table createTable(@RequestBody Table table) {
        return tableService.createTable(table);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('UPDATE_TABLES')")
    public Table updateTable(@PathVariable Long id, @RequestBody Table table) {
        return tableService.updateTable(id, table);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('DELETE_TABLES')")
    public void deleteTable(@PathVariable Long id) {
        tableService.deleteTable(id);
    }
}

package net.cabrasky.table2taste.backend.service;

import net.cabrasky.table2taste.backend.model.Table;
import net.cabrasky.table2taste.backend.repository.TableRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TableService {

	@Autowired
    private TableRepository tableRepository;


    public List<Table> getAllTables() {
        return tableRepository.findAll();
    }

    public Table getTableById(Long id) {
        return tableRepository.findById(id).orElse(null);
    }

    public Table createTable(Table table) {
        return tableRepository.save(table);
    }

    public Table updateTable(Long id, Table table) {
        if (!tableRepository.existsById(id)) {
            return null;
        }
        table.setId(id);
        return tableRepository.save(table);
    }

    public void deleteTable(Long id) {
        tableRepository.deleteById(id);
    }
}

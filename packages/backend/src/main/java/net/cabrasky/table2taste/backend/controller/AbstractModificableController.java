package net.cabrasky.table2taste.backend.controller;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import net.cabrasky.table2taste.backend.model.ModelInterface;
import net.cabrasky.table2taste.backend.modelDto.ModelDTOInterface;
import net.cabrasky.table2taste.backend.service.AbstractModificableService;

import java.util.List;

public abstract class AbstractModificableController<T extends ModelInterface<I>, DTO extends ModelDTOInterface<I>, I, S extends AbstractModificableService<T, DTO, I, ? extends JpaRepository<T, I>>> extends AbstractController<T, I, S> {

    @PostMapping
    public ResponseEntity<T> create(@RequestBody DTO entity){
        return new ResponseEntity<>(service.create(entity), HttpStatus.CREATED);
    }

    @PutMapping(params = {"id"})
    public boolean update(@RequestParam(name="id") I id, @RequestBody DTO updates) {
        return service.update(id, updates);
    }

    @DeleteMapping(params = {"id"})
    public void delete(@RequestParam(name="id") I id) {
        service.delete(id);
    }

    @DeleteMapping(params= {"ids"})
    public void deleteAll(@RequestParam(name="ids") List<I> ids) {
        service.deleteAll(ids);
    }
}

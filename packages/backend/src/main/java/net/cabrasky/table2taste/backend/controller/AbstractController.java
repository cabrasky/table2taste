package net.cabrasky.table2taste.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import net.cabrasky.table2taste.backend.model.ModelInterface;
import net.cabrasky.table2taste.backend.service.AbstractService;

import java.util.List;
import java.util.Optional;

public abstract class AbstractController<T extends ModelInterface<I>, I, S extends AbstractService<T, I, ? extends JpaRepository<T, I>>> {

	@Autowired
	protected S service;

	@GetMapping
	public List<T> getAll() {
		return service.getAll();
	}

	@GetMapping(params = { "id" })
	public ResponseEntity<T> getById(@RequestParam(name = "id") I id) {
		Optional<T> optionalElement = service.getById(id);
		if (optionalElement.isPresent()) {
			return new ResponseEntity<T>(optionalElement.get(), HttpStatus.OK);
		}
		return new ResponseEntity<>(HttpStatus.NOT_FOUND);
	}

}

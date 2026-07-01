package net.cabrasky.table2taste.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

import net.cabrasky.table2taste.backend.model.ModelInterface;

@Service
public abstract class AbstractService<T extends ModelInterface<I>, I, R extends JpaRepository<T, I>> {

	@Autowired
	protected R repository;

	public List<T> getAll() {
		return repository.findAll();
	}

	public Optional<T> getById(I id) {
		return repository.findById(id);
	}
	
	public boolean existsById(I id) {
		return repository.existsById(id);
	}
}
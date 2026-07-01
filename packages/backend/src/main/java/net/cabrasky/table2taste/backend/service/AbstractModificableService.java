package net.cabrasky.table2taste.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.transaction.Transactional;
import net.cabrasky.table2taste.backend.model.ModelInterface;
import net.cabrasky.table2taste.backend.modelDto.ModelDTOInterface;

@Service
public abstract class AbstractModificableService<T extends ModelInterface<I>, DTO extends ModelDTOInterface<I>, I, R extends JpaRepository<T, I>> extends AbstractService<T, I, R>{
	@Autowired
	ObjectMapper objectMapper;
	
	protected abstract Class<T> getModelClass();
	

	@Transactional
	public T create(DTO element) {
		T el = objectMapper.convertValue(element, this.getModelClass());
		return repository.save(el);
	}

	public boolean update(final I id, final DTO element) {
		Optional<T> optionalEl = repository.findById(id);
		if (!optionalEl.isPresent()) {
			return false;
		}
		T el = optionalEl.get();
		
		try {
			objectMapper.updateValue(el, element);
			repository.save(el);
		} catch (JsonMappingException e) {
			System.err.println(e.getStackTrace());
			return false;
		}
		return true;
	}

	@Transactional
	public void delete(I id) {
		repository.deleteById(id);
	}

	@Transactional
	public void deleteAll(List<I> ids) {
		repository.deleteAll(getAll());
	}
}
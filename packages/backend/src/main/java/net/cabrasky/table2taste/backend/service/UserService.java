package net.cabrasky.table2taste.backend.service;

import net.cabrasky.table2taste.backend.model.User;
import net.cabrasky.table2taste.backend.modelDto.UserDTO;
import net.cabrasky.table2taste.backend.repository.GroupRepository;
import net.cabrasky.table2taste.backend.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonMappingException;

import java.util.HashSet;
import java.util.Optional;

@Service
public class UserService extends AbstractModificableService<User, UserDTO, String, UserRepository> {
	@Autowired
	private GroupRepository groupRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Override
	public User create(UserDTO element) {
		element.password = passwordEncoder.encode(element.password);
		User el = objectMapper.convertValue(element, this.getModelClass());
		el.setGroups(
				new HashSet<>(element.groups.stream().map(group -> groupRepository.findById(group.id).get()).toList()));
		return repository.save(el);
	}

	@Override
	public boolean update(String id, UserDTO element) {
		Optional<User> optionalEl = repository.findById(id);
		if (!optionalEl.isPresent()) {
			return false;
		}
		User el = optionalEl.get();

		try {
			objectMapper.updateValue(el, element);
			el.setGroups(new HashSet<>(
					element.groups.stream().map(group -> groupRepository.findById(group.id).get()).toList()));
			repository.save(el);
		} catch (JsonMappingException e) {
			System.err.println(e.getStackTrace());
			return false;
		}
		return true;
	}

	@Override
	protected Class<User> getModelClass() {
		return User.class;
	}

}
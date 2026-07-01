package net.cabrasky.table2taste.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import net.cabrasky.table2taste.backend.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
	public Boolean existsByUsername(String username);
	
	public Optional<User> findByUsername(String username);
}

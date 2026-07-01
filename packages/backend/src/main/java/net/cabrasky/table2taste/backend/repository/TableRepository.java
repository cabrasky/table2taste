package net.cabrasky.table2taste.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import net.cabrasky.table2taste.backend.model.Table;


@Repository
public interface TableRepository extends JpaRepository<Table, Long> {
	@Query("SELECT t FROM Table t WHERE t.user.username = :username")
    List<Table> findByUsername(@Param("username") String username);
}

package net.cabrasky.table2taste.backend.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import net.cabrasky.table2taste.backend.model.Allergen;

import java.util.List;

@Repository
public interface AllergenRepository extends JpaRepository<Allergen, String> {
    List<Allergen> findByIdInAndInclusive(List<String> ids, boolean inclusive);
}

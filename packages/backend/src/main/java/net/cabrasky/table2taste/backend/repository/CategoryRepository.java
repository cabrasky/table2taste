package net.cabrasky.table2taste.backend.repository;

import java.util.LinkedList;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Repository;

import net.cabrasky.table2taste.backend.model.Category;

@Repository
public interface CategoryRepository extends JpaRepository<Category, String> {
    @Override
    default @NonNull List<Category> findAll() {
        return findAllByOrderByMenuPriorityAsc();
    }
   
	
	List<Category> findAllByOrderByMenuPriorityAsc();


	List<Category> findByParentCategoryId(String parentCategoryId);

	default List<Category> findAllCategoriesInDepth(String categoryId) {
		List<Category> grandchildrenCategories = new LinkedList<>();
		List<Category> children;
		if (categoryId != null) {
			Category category = findById(categoryId).get();
			grandchildrenCategories.add(category);
			children = List.copyOf(category.getSubCategories());
		} else {
			children = findByParentCategoryId(categoryId);
		}
		for (Category child : children) {
			grandchildrenCategories.addAll(findAllCategoriesInDepth(child.getId()));
		}
		return grandchildrenCategories;

	}

}

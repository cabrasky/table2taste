package net.cabrasky.table2taste.backend.service;

import net.cabrasky.table2taste.backend.model.Category;
import net.cabrasky.table2taste.backend.modelDto.CategoryDTO;
import net.cabrasky.table2taste.backend.repository.CategoryRepository;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

@Service
public class CategoryService extends AbstractModificableService<Category, CategoryDTO, String, CategoryRepository> {

	public List<Category> getAllByParentCategoryId(String parentCategoryId) {
		return repository.findByParentCategoryId(parentCategoryId);
	}
	
	public List<Category> getCategoryAncestors(String categoryId) {
        List<Category> ancestors = new ArrayList<>();
        Optional<Category> categoryOpt = repository.findById(categoryId);
        if(categoryOpt.isEmpty()) {
        	return Collections.emptyList();
        }
        Category category = categoryOpt.get();

        while (category != null) {
            ancestors.add(category);
            category = category.getParentCategory();
        }

        return ancestors;
    }

	@Override
	protected Class<Category> getModelClass() {
		return Category.class;
	}
}
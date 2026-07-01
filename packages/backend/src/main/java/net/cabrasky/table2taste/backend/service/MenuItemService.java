package net.cabrasky.table2taste.backend.service;

import net.cabrasky.table2taste.backend.model.Allergen;
import net.cabrasky.table2taste.backend.model.Category;
import net.cabrasky.table2taste.backend.model.MenuItem;
import net.cabrasky.table2taste.backend.modelDto.MenuItemDTO;
import net.cabrasky.table2taste.backend.repository.AllergenRepository;
import net.cabrasky.table2taste.backend.repository.CategoryRepository;
import net.cabrasky.table2taste.backend.repository.MenuItemRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonMappingException;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;

@Service
public class MenuItemService extends AbstractModificableService<MenuItem, MenuItemDTO, String, MenuItemRepository> {
	@Autowired
	private CategoryRepository categoryRepository;

	@Autowired
	private AllergenRepository allergenRepository;

	@Override
	public MenuItem create(MenuItemDTO element) {
		MenuItem el = objectMapper.convertValue(element, this.getModelClass());
		el.setAllergens(new HashSet<Allergen>(
				element.allergens.stream().map(allergen -> allergenRepository.findById(allergen.id).get()).toList()));
		return repository.save(el);
	}

	@Override
	public boolean update(String id, MenuItemDTO element) {
			Optional<MenuItem> optionalEl = repository.findById(id);
			if (!optionalEl.isPresent()) {
				return false;
			}
			MenuItem el = optionalEl.get();
			
			try {
				objectMapper.updateValue(el, element);
				el.setAllergens(new HashSet<Allergen>(element.allergens.stream().map(allergen -> allergenRepository.findById(allergen.id).get()).toList()));
				repository.save(el);
			} catch (JsonMappingException e) {
				System.err.println(e.getStackTrace());
				return false;
			}
			return true;
	}

	public List<MenuItem> getMenuItemsByAllergensAndCategory(List<String> allergenIds, String categoryId) {

		List<Allergen> inclusiveAllergens = allergenRepository.findByIdInAndInclusive(allergenIds, true);
		List<Allergen> exclusiveAllergens = allergenRepository.findByIdInAndInclusive(allergenIds, false);

		return categoryRepository.findAllCategoriesInDepth(categoryId).stream()
				.flatMap(category -> category.getMenuItems().stream().sorted((o1, o2) -> o1.getId().compareTo(o2.getId())))
				.filter(menuItem -> menuItem.getAllergens().containsAll(inclusiveAllergens))
				.filter(menuItem -> menuItem.getAllergens().stream().noneMatch(exclusiveAllergens::contains)).toList();
	}

	@Override
	protected Class<MenuItem> getModelClass() {
		return MenuItem.class;
	}

	public List<MenuItem> getAllByCategoryId(String parentCategoryId) {
		return repository.findByCategoryId(parentCategoryId);
	}

	public List<Category> getCategoryAncestors(String id) {
		List<Category> ancestors = new ArrayList<>();
		Optional<MenuItem> menuItemOpt = repository.findById(id);
		if (menuItemOpt.isEmpty()) {
			return Collections.emptyList();
		}
		Category category = menuItemOpt.get().getCategory();

		while (category != null) {
			ancestors.add(category);
			category = category.getParentCategory();
		}

		return ancestors;
	}

}
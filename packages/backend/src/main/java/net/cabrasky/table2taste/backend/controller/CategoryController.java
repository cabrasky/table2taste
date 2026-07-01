package net.cabrasky.table2taste.backend.controller;

import net.cabrasky.table2taste.backend.model.Category;
import net.cabrasky.table2taste.backend.modelDto.CategoryDTO;
import net.cabrasky.table2taste.backend.modelDto.TranslationDTO;
import net.cabrasky.table2taste.backend.service.CategoryService;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/categories")
public class CategoryController extends AbstractModificableController<Category, CategoryDTO, String, CategoryService> {

    @Value("${app.default.language}")
    private String defaultLanguageId;

    @Override
    @PreAuthorize("hasAuthority('CREATE_CATEGORIES')")
    public ResponseEntity<Category> create(CategoryDTO entity) {
        Optional<TranslationDTO> optionalTranslationDTO = entity.translations.stream()
            .filter(t -> t.language.id.equals(defaultLanguageId) && t.translationKey.equals("name"))
            .findFirst();
        if (optionalTranslationDTO.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        entity.id = optionalTranslationDTO.get().value;
        return super.create(entity);
    }
    
    @Override
    @PreAuthorize("hasAuthority('UPDATE_CATEGORIES')")
    public boolean update(@RequestParam(name="id") String id, @RequestBody CategoryDTO updates) {
    	return super.update(id, updates);
    }
    
    @Override
    @PreAuthorize("hasAuthority('DELETE_CATEGORIES')")
    public void delete(@RequestParam(name="id") String id) {
        super.delete(id);
    }

    @GetMapping(params = {"parentCategoryId"})
    public List<Category> getAllFiltered(@RequestParam(required = true) String parentCategoryId) {
        return service.getAllByParentCategoryId(parentCategoryId.isEmpty() ? null : parentCategoryId);
    }

    @GetMapping(path = "/ancestors", params = {"id"})
    public List<Category> getAllParents(@RequestParam(required = true) String id) {
        return service.getCategoryAncestors(id);
    }
}

package net.cabrasky.table2taste.backend.modelDto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Optional;
import java.util.Set;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class CategoryDTO implements ModelDTOInterface<String> {
	@JsonProperty("id")
	public String id;
	
    @JsonProperty("mediaUrl")
    public Optional<String> mediaUrl;

    @JsonProperty("parentCategoryId")
    public String parentCategoryId;

    @JsonProperty("menuPriority")
    public Integer menuPriority;

    @JsonProperty("translations")
    public Set<TranslationDTO> translations;

    @JsonProperty("subCategories")
    public Set<TranslationDTO> subCategories;

    @JsonProperty("menuItems")
    public Set<TranslationDTO> menuItems;
}

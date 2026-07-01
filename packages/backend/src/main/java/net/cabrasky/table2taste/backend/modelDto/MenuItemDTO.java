package net.cabrasky.table2taste.backend.modelDto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Optional;
import java.util.Set;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class MenuItemDTO implements ModelDTOInterface<String> {
	@JsonProperty("id")
    public String id;
	
    @JsonProperty("price")
    public Optional<Double> price;

    @JsonProperty("mediaUrl")
    public Optional<String> mediaUrl;

    @JsonProperty("categoryId")
    public String categoryId;

    @JsonProperty("translations")
    public Set<TranslationDTO> translations;

    @JsonProperty("allergens")
    public Set<AllergenDTO> allergens;
}

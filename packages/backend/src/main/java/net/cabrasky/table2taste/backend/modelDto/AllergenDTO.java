package net.cabrasky.table2taste.backend.modelDto;

import java.util.Optional;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class AllergenDTO implements ModelDTOInterface<String>{
	@JsonProperty("id")
	public String id;
	
	@JsonProperty("inclusive")
	public Optional<Boolean> inclusive;
	
	@JsonProperty("translations")
	public Set<TranslationDTO> translations;
}
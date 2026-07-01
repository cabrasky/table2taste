package net.cabrasky.table2taste.backend.modelDto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class TranslationDTO implements ModelDTOInterface<Integer> {
    @JsonProperty("language")
    public LanguageDTO language;

    @JsonProperty("translationKey")
    public String translationKey;

    @JsonProperty("value")
    public String value;
}

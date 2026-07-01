package net.cabrasky.table2taste.backend.modelDto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Set;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class GroupDTO implements ModelDTOInterface<String> {
    @JsonProperty("id")
    public String id;

    @JsonProperty("privileges")
    public Set<PrivilegeDTO> privileges; 

    @JsonProperty("color")
    public String color;

    @JsonProperty("translations")
    public Set<TranslationDTO> translations;

    @JsonProperty("users")
    public Set<UserDTO> users;
}

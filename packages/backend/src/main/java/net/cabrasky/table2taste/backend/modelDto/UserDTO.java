package net.cabrasky.table2taste.backend.modelDto;

import java.util.Set;

import com.fasterxml.jackson.annotation.JsonProperty;

public class UserDTO implements ModelDTOInterface<String> {
    @JsonProperty("username")
    public String username;

    @JsonProperty("password")
    public String password;

    @JsonProperty("name")
    public String name;

    @JsonProperty("groups")
    public Set<GroupDTO> groups;
}

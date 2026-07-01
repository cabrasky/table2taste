package net.cabrasky.table2taste.backend.modelDto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class OrderDTO implements ModelDTOInterface<Integer> {

    @JsonProperty("orderItems")
    public List<OrderItem> orderItems;
    

    public static class OrderItem {
    	@JsonProperty("id")
    	public String id;

    	@JsonProperty("quantity")
    	public Integer quantity;
    	
    	@JsonProperty("annotations")
    	public String annotations;
    	
    }
}

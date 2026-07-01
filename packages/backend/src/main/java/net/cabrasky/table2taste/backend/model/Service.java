package net.cabrasky.table2taste.backend.model;

import java.sql.Timestamp;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnore;

import io.micrometer.common.lang.Nullable;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;

@Entity
@jakarta.persistence.Table(name = "service")
public class Service implements ModelInterface<Long> {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)

	@Column(name = "id")
	private Long id;

	@JsonIgnore
	@ManyToOne
	@JoinColumn(name = "table_id")
	private Table table;

	@CreationTimestamp
	@Column(name = "open_timestamp")
	private Timestamp openTimestamp;

	@Column(name = "close_timestamp")
	@Nullable
	private Timestamp closeTimestamp;

	@Column(name = "is_open")
	private Boolean isOpen = true;

	@OneToMany(mappedBy = "service", cascade = CascadeType.ALL, orphanRemoval = true)
	private Set<Order> orders = new HashSet<>();

	// Getters and setters

	public Long getId() {
		return id;
	}

	public Table getTable() {
		return table;
	}

	public void setTable(Table table) {
		this.table = table;
	}

	public Timestamp getOpenTimestamp() {
		return openTimestamp;
	}

	public Timestamp getCloseTimestamp() {
		return closeTimestamp;
	}

	public void setCloseTimestamp(Timestamp closeTimestamp) {
		this.closeTimestamp = closeTimestamp;
	}

	public Boolean getIsOpen() {
		return isOpen;
	}

	public void setIsOpen(Boolean isOpen) {
		this.isOpen = isOpen;
	}

	public Set<Order> getOrders() {
		return orders;
	}

	public void setOrders(Set<Order> orders) {
		this.orders = new HashSet<>(orders);
	}

	public Set<OrderItemQuantity> getAllOrderItems() {
		return orders.stream().flatMap(order -> order.getOrderItemQuantities().stream()).collect(Collectors
				.groupingBy(OrderItemQuantity::getOrderItem, Collectors.summingInt(OrderItemQuantity::getQuantity)))
				.entrySet().stream().map(entry -> {
					OrderItemQuantity orderItemQuantity = new OrderItemQuantity();
					orderItemQuantity.setOrderItem(entry.getKey());
					orderItemQuantity.setQuantity(entry.getValue());
					return orderItemQuantity;
				}).collect(Collectors.toSet());
	}

	public Double getTotalPrice() {
		return getAllOrderItems().stream().mapToDouble(
				orderItemQuantity -> orderItemQuantity.getOrderItem().getPrice() * orderItemQuantity.getQuantity())
				.sum();
	}

}

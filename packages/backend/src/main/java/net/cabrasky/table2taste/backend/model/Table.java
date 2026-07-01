package net.cabrasky.table2taste.backend.model;

import java.util.Set;

import io.micrometer.common.lang.Nullable;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;


@Entity
@jakarta.persistence.Table(name = "app_table")
public class Table {
	@Id
	@Column(name = "id")
	private Long id;

	@Column(name = "capacity")
	private Integer capacity;

	@ManyToOne(cascade = CascadeType.ALL)
	@JoinColumn(name = "user_id")
	private User user;

	@ManyToOne(cascade = CascadeType.ALL)
	@JoinColumn(name = "last_service")
	@Nullable
	private Service lastService;

	@OneToMany
	@JoinColumn(name = "app_table")
	private Set<Service> services;

	// Getters and setters

	public Integer getCapacity() {
		return capacity;
	}

	public void setCapacity(Integer capacity) {
		this.capacity = capacity;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}

	public Service getLastService() {
		return lastService;
	}

	public void setLastService(Service lastService) {
		this.lastService = lastService;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Set<Service> getServices() {
		return services;
	}

	public void setServices(Set<Service> services) {
		this.services = services;
	}

}

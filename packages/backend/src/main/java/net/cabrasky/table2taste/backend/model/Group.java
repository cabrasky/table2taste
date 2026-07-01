package net.cabrasky.table2taste.backend.model;

import java.util.Set;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "app_group")
public class Group implements ModelInterface<String> {
	@Id
	@Column(name = "id")
	private String id;

	@ManyToMany(cascade = CascadeType.ALL)
	@JoinTable(name = "group_privilege", joinColumns = @JoinColumn(name = "group_id"), inverseJoinColumns = @JoinColumn(name = "privilege_id"))
	private Set<Privilege> privileges;

	@Column(name = "color")
	private String color;

	@OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
	@JoinTable(name = "group_translation", joinColumns = @JoinColumn(name = "group_id"), inverseJoinColumns = @JoinColumn(name = "translation_id"))
	private Set<Translation> translations;

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public Set<Privilege> getPrivileges() {
		return privileges;
	}

	public void setPrivileges(Set<Privilege> privileges) {
		if(this.privileges != null){
			this.privileges.clear();
			this.privileges.addAll(privileges);
		} else {
			this.privileges = privileges;
		}
	}

	public String getColor() {
		return color;
	}

	public void setColor(String color) {
		this.color = color;
	}

	public Set<Translation> getTranslations() {
		return this.translations;
	}

	public void setTranslations(Set<Translation> translations) {		
		if(this.translations != null){
			this.translations.clear();
			this.translations.addAll(translations);
		} else {
			this.translations = translations;
		}
    }

}

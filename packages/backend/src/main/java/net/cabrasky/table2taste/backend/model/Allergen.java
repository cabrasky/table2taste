package net.cabrasky.table2taste.backend.model;

import java.util.Set;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "allergen")
public class Allergen implements ModelInterface<String>{
    @Id
    @Column(name = "id")
    private String id;
    
    @Column(name = "inclusive")
    private boolean inclusive;
	
	@OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinTable(
            name = "allergen_translation",
            joinColumns = @JoinColumn(name = "allergen_id"),
            inverseJoinColumns = @JoinColumn(name = "translation_id") 
    )
    private Set<Translation> translations;

    // Getters and setters

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

	public boolean isInclusive() {
		return inclusive;
	}

	public void setInclusive(boolean inclusive) {
		this.inclusive = inclusive;
	}

	public Set<Translation> getTranslations() {
		return translations;
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

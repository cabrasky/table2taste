package net.cabrasky.table2taste.backend.model;

import java.util.Set;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "menu_item")
public class MenuItem implements ModelInterface<String> {

    @Id
    @Column(name = "id")
    private String id;

    @Column(name = "price")
    private double price;

    @Column(name = "media_url")
    private String mediaUrl;

    @Column(name = "category_id")
    private String categoryId;

    @JsonBackReference
    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "category_id", updatable = false, insertable = false)
    private Category category;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinTable(name = "menu_item_translation", joinColumns = @JoinColumn(name = "menu_item_id"), inverseJoinColumns = @JoinColumn(name = "translation_id"))
    private Set<Translation> translations;

    @ManyToMany(cascade = CascadeType.ALL)
    @JoinTable(name = "menu_item_allergen", joinColumns = @JoinColumn(name = "menu_item_id"), inverseJoinColumns = @JoinColumn(name = "allergen_id"))
    private Set<Allergen> allergens;

    // Getters and setters

    public String getId() {
        return id;
    }
    
	public void setId(String id) {
		this.id = id;
	}

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public String getMediaUrl() {
        return mediaUrl;
    }

    public void setMediaUrl(String mediaUrl) {
        this.mediaUrl = mediaUrl;
    }

    public String getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(String categoryId) {
        this.categoryId = categoryId;
    }

    public Category getCategory() {
        return this.category;
    }

    public Set<Translation> getTranslations() {
        return translations;
    }

    public void setTranslations(Set<Translation> translations) {
        if (this.translations != null) {
            this.translations.clear();
            this.translations.addAll(translations);
        } else {
            this.translations = translations;
        }
    }

    public Set<Allergen> getAllergens() {
        return allergens;
    }

    public void setAllergens(Set<Allergen> allergens) {
        if (this.allergens != null) {
            this.allergens.clear();
            this.allergens.addAll(allergens);
        } else {
            this.allergens = allergens;
        }
    }
}

package net.cabrasky.table2taste.backend.model;

import java.util.Set;

import org.hibernate.annotations.ColumnDefault;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIdentityReference;

import io.micrometer.common.lang.Nullable;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "category")
public class Category implements ModelInterface<String> {

    @Id
    @Column(name = "id")
    private String id;

    @Column(name = "media_url")
    private String mediaUrl;

    @Column(name = "menu_priority")
    @ColumnDefault("0")
    private Integer menuPriority = 0;

    @Column(name = "parent_category_id")
    @Nullable
    private String parentCategoryId;

    @JsonBackReference
    @ManyToOne
    @JoinColumn(name = "parent_category_id", updatable = false, insertable = false)
    private Category parentCategory;

    @JsonIdentityReference
    @OneToMany(mappedBy = "parentCategory", cascade = CascadeType.ALL)
    private Set<Category> subCategories;

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL)
    private Set<MenuItem> menuItems;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinTable(name = "category_translation", joinColumns = @JoinColumn(name = "category_id"), inverseJoinColumns = @JoinColumn(name = "translation_id"))
    private Set<Translation> translations;

    // Getters and setters

    public String getId() {
        return id;
    }
    
    public void setId(String id) {
    	this.id = id;
    }

    public String getMediaUrl() {
        return mediaUrl;
    }

    public void setMediaUrl(String mediaUrl) {
        this.mediaUrl = mediaUrl;
    }

    public String getParentCategoryId() {
        return this.parentCategoryId;
    }

    public void setParentCategoryId(String parentCategoryId) {
        this.parentCategoryId = parentCategoryId.isEmpty() ? null : parentCategoryId;
    }

    public Integer getMenuPriority() {
        return menuPriority;
    }

    public void setMenuPriority(Integer menuPriority) {
        this.menuPriority = menuPriority;
    }

    public Category getParentCategory() {
        return parentCategory;
    }

    public Set<Category> getSubCategories() {
        return this.subCategories;
    }

    public void setSubCategories(Set<Category> subCategories) {
        if (this.subCategories != null) {
            this.subCategories.clear();
            this.subCategories.addAll(subCategories);
        } else {
            this.subCategories = subCategories;
        }
    }

    public Set<MenuItem> getMenuItems() {
        return this.menuItems;
    }

    public void setMenuItems(Set<MenuItem> menuItems) {
        if (this.menuItems != null) {
            this.menuItems.clear();
            this.menuItems.addAll(menuItems);
        } else {
            this.menuItems = menuItems;
        }
    }

    public Set<Translation> getTranslations() {
        return this.translations;
    }

    public void setTranslations(Set<Translation> translations) {
        if (this.translations != null) {
            this.translations.clear();
            this.translations.addAll(translations);
        } else {
            this.translations = translations;
        }
    }
}

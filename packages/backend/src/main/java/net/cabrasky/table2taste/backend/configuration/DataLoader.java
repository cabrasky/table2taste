package net.cabrasky.table2taste.backend.configuration;

import java.io.FileReader;
import java.io.IOException;
import java.util.HashSet;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.repository.CrudRepository;
import org.springframework.transaction.annotation.Transactional;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import net.cabrasky.table2taste.backend.model.*;
import net.cabrasky.table2taste.backend.repository.*;

import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataLoader {

	private static final Logger logger = LoggerFactory.getLogger(DataLoader.class);
	private static final String DATA_FILE_PATH = "defaultData.json";

	@Autowired
	private CategoryRepository categoryRepository;

	@Autowired
	private LanguageRepository languageRepository;

	@Autowired
	private AllergenRepository allergenRepository;

	@Autowired
	private MenuItemRepository menuItemRepository;

	@Autowired
	private PrivilegeRepository privilegeRepository;

	@Autowired
	private GroupRepository groupRepository;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private TableRepository tableRepository;
	
	@Autowired
	private PasswordEncoder passwordEncoder;
	
	@Value("${app.default.tablePassword}")
    private String defaultTablePassword;

	@Bean
	public ApplicationRunner initData() {
		return args -> {
			try (FileReader fileReader = new FileReader(DATA_FILE_PATH)) {
				JsonObject defaultData = JsonParser.parseReader(fileReader).getAsJsonObject();

				loadDataIfEmpty(languageRepository, () -> loadDefaultLanguages(defaultData));
				loadDataIfEmpty(allergenRepository, () -> loadDefaultAllergens(defaultData));
				loadDataIfEmpty(privilegeRepository, () -> loadDefaultPrivileges(defaultData));
				loadDataIfEmpty(groupRepository, () -> loadDefaultGroups(defaultData));
				loadDataIfEmpty(userRepository, () -> loadDefaultUsers(defaultData));
				loadDataIfEmpty(tableRepository, () -> loadDefaultTables(defaultData));
				loadDataIfEmpty(categoryRepository, () -> loadDefaultCategories(defaultData));
			} catch (IOException e) {
				logger.error("Error reading " + DATA_FILE_PATH, e);
			}
		};
	}

	private <T> void loadDataIfEmpty(CrudRepository<T, ?> repository, Runnable loadFunction) {
		if (repository.count() == 0) {
			loadFunction.run();
		} else {
			logger.info("{} already exist. Skipping data loading.", repository.getClass().getSimpleName());
		}
	}

	@Transactional
	public void loadDefaultLanguages(JsonObject data) {
		data.get("languages").getAsJsonArray().forEach(languageElement -> {
			Language language = new Language();
			language.setId(languageElement.getAsString());
			languageRepository.save(language);
		});
	}

	@Transactional
	public void loadDefaultAllergens(JsonObject data) {
		data.get("allergens").getAsJsonArray().forEach(allergenElement -> {
			allergenRepository.save(getAllergen(allergenElement.getAsJsonObject()));
		});
	}

	@Transactional
	public void loadDefaultPrivileges(JsonObject data) {
		data.get("privileges").getAsJsonArray().forEach(privilegeElement -> {
			Privilege privilege = new Privilege();
			privilege.setId(privilegeElement.getAsString());
			privilegeRepository.save(privilege);
		});
	}

	@Transactional
	public void loadDefaultGroups(JsonObject data) {
		data.get("groups").getAsJsonArray().forEach(groupElement -> {
			saveGroup(groupElement.getAsJsonObject());
		});
	}

	@Transactional
	public void loadDefaultUsers(JsonObject data) {
		data.get("users").getAsJsonArray().forEach(userElement -> {
			saveUser(userElement.getAsJsonObject());
		});
	}

	@Transactional
	public void loadDefaultTables(JsonObject data) {
		data.get("tables").getAsJsonArray().forEach(tableElement -> {
			saveTable(tableElement.getAsJsonObject());
		});
	}

	@Transactional
	public void loadDefaultCategories(JsonObject data) {
		data.get("categories").getAsJsonArray().forEach(categoryElement -> {
			saveCategory(categoryElement.getAsJsonObject());
		});
	}

	private Allergen getAllergen(JsonObject allergenObject) {
		Allergen allergen = new Allergen();
		allergen.setId(allergenObject.get("id").getAsString());
		allergen.setInclusive(allergenObject.get("inclusive").getAsBoolean());
		allergen.setTranslations(getTranslations(allergenObject));
		return allergen;
	}

	private void saveGroup(JsonObject groupObject) {
		Group group = new Group();
		group.setId(groupObject.get("id").getAsString());
		group.setColor(groupObject.get("color").getAsString());
		group.setTranslations(getTranslations(groupObject));
		group.setPrivileges(getPrivileges(groupObject));
		groupRepository.save(group);
	}

	private void saveUser(JsonObject userObject) {
		User user = new User();
		user.setUsername(userObject.get("username").getAsString());
		user.setName(userObject.get("name").getAsString());
		user.setPhotoUrl(userObject.get("photo_url").getAsString());
		user.setPassword(passwordEncoder.encode(userObject.get("password").getAsString()));
		user.setGroups(getGroups(userObject));
		userRepository.save(user);
	}

	private void saveTable(JsonObject tableObject) {
		Table table = new Table();
		table.setId(tableObject.get("id").getAsLong());
		table.setCapacity(tableObject.get("capacity").getAsInt());
		table.setUser(new User() {{
			setName(String.format("Table %d", table.getId()));
			setPassword(passwordEncoder.encode(defaultTablePassword));
			setUsername(getName());
			setGroups(Set.of(groupRepository.findById("table").get()));
		}});
		tableRepository.save(table);
	}

	private void saveCategory(JsonObject categoryObject) {
		Set<Translation> categoryTranslations = getTranslations(categoryObject);
		String categoryId = categoryObject.get("id").getAsString();
		Category category = new Category();
		category.setId(categoryId);
		category.setMediaUrl("");
		category.setMenuPriority(categoryObject.get("menuPriority").getAsInt());
		category.setTranslations(categoryTranslations);
		categoryRepository.save(category);
		saveMenuItems(categoryObject, categoryId);
	}

	private void saveMenuItems(JsonObject categoryObject, String categoryId) {
		JsonArray menuItemArray = categoryObject.getAsJsonArray("menuItems");
		menuItemArray.forEach(menuItemElement -> {
			MenuItem menuItem = getMenuItem(menuItemElement.getAsJsonObject());
			menuItem.setCategoryId(categoryId);
			menuItemRepository.save(menuItem);
		});
	}

	private MenuItem getMenuItem(JsonObject menuItemObject) {
		MenuItem menuItem = new MenuItem();
		menuItem.setId(menuItemObject.get("id").getAsString());
		menuItem.setPrice(menuItemObject.get("price").getAsDouble());
		menuItem.setMediaUrl(menuItemObject.get("mediaUrl").getAsString());
		menuItem.setTranslations(getTranslations(menuItemObject));
		menuItem.setAllergens(getAllergens(menuItemObject));
		return menuItem;
	}

	private Set<Allergen> getAllergens(JsonObject object) {
		Set<Allergen> allergens = new HashSet<>();
		object.getAsJsonArray("allergens").forEach(allergenElement -> {
			allergenRepository.findById(allergenElement.getAsString()).ifPresent(allergens::add);
		});
		return allergens;
	}

	private Set<Privilege> getPrivileges(JsonObject object) {
		Set<Privilege> privileges = new HashSet<>();
		object.getAsJsonArray("privileges").forEach(privilegeElement -> {
			privilegeRepository.findById(privilegeElement.getAsString()).ifPresent(privileges::add);
		});
		return privileges;
	}

	private Set<Group> getGroups(JsonObject object) {
		Set<Group> groups = new HashSet<>();
		object.getAsJsonArray("groups").forEach(groupElement -> {
			groupRepository.findById(groupElement.getAsString()).ifPresent(groups::add);
		});
		return groups;
	}

	private Set<Translation> getTranslations(JsonObject object) {
		Set<Translation> translations = new HashSet<>();
		JsonObject translationsObject = object.getAsJsonObject("translations");
		translationsObject.entrySet().forEach(entry -> {
			String languageId = entry.getKey();
			JsonObject languageTranslations = entry.getValue().getAsJsonObject();
			Language language = languageRepository.findById(languageId)
					.orElseThrow(() -> new IllegalArgumentException("Language not found: " + languageId));
			languageTranslations.entrySet().forEach(translationEntry -> {
				Translation translation = new Translation();
				translation.setTranslationKey(translationEntry.getKey());
				translation.setValue(translationEntry.getValue().getAsString());
				translation.setLanguage(language);
				translations.add(translation);
			});
		});
		return translations;
	}
}

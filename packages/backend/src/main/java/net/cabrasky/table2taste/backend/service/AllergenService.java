package net.cabrasky.table2taste.backend.service;

import org.springframework.stereotype.Service;

import net.cabrasky.table2taste.backend.model.Allergen;
import net.cabrasky.table2taste.backend.repository.AllergenRepository;

@Service
public class AllergenService extends AbstractService<Allergen, String, AllergenRepository> {

}

package net.cabrasky.table2taste.backend.service;

import org.springframework.stereotype.Service;

import net.cabrasky.table2taste.backend.model.Language;
import net.cabrasky.table2taste.backend.repository.LanguageRepository;

@Service
public class LanguageService extends AbstractService<Language, String, LanguageRepository> {

}

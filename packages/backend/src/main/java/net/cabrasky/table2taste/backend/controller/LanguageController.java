package net.cabrasky.table2taste.backend.controller;


import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import net.cabrasky.table2taste.backend.model.Language;
import net.cabrasky.table2taste.backend.service.LanguageService;

@RestController
@RequestMapping("/languages")
public class LanguageController extends AbstractController<Language, String, LanguageService>{
}
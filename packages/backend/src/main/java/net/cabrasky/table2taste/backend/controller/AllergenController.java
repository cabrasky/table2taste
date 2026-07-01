package net.cabrasky.table2taste.backend.controller;


import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import net.cabrasky.table2taste.backend.model.Allergen;
import net.cabrasky.table2taste.backend.service.AllergenService;

@RestController
@RequestMapping("/allergens")
public class AllergenController extends AbstractController<Allergen, String, AllergenService>{
}
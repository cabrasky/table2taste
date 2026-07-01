import { Allergen } from '../models/Allergen';
import { CrudService } from './CRUDService';

export const allergenService = new CrudService<Allergen, string>("allergens");
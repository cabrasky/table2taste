import { CrudService } from './CRUDService';
import { Language } from '../models/Language';

export const languageService = new CrudService<Language, string>("languages");
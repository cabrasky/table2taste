import { Group } from '../models/Group';
import { ModificableCrudService } from './CRUDService';

export const groupService = new ModificableCrudService<Group, string>("groups");
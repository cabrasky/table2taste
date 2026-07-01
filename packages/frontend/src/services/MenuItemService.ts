import { ModificableCrudService } from './CRUDService';
import { MenuItem } from '../models/MenuItem';
import { Category } from '../models/Category';
import axios from 'axios';
import { getAxiosConfig } from '../utils/authUtils';
import { ErrorMessage } from '../utils/popupUtils';

class MenuItemCrudService extends ModificableCrudService<MenuItem, string> {
    constructor() {
        super("menuItems");
    }

    async getAncestors(id: string): Promise<Category[]> {
        try {
            const response = await axios.get<Category[]>(`${this.baseUrl}/ancestors`, {
                params: { id },
                ...getAxiosConfig(),
            });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                const errorMessage: ErrorMessage = error.response.data;
                console.error('Error fetching ancestors:', errorMessage);
                throw new Error(errorMessage.message);
            } else {
                console.error('Unexpected error:', error);
                throw new Error('Unexpected error occurred');
            }
        }
    }
    async getAllByAllergens(categoryId: string, allergenIds: string[]): Promise<MenuItem[]> {
        try {
            const params = new URLSearchParams();
            params.append('categoryId', categoryId);
            allergenIds.forEach((id) => params.append('allergenIds', id));

            const response = await axios.get<MenuItem[]>(`${this.baseUrl}`, {
                params,
                ...getAxiosConfig(),
            });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                const errorMessage: ErrorMessage = error.response.data;
                console.error('Error fetching menu items:', errorMessage);
                throw new Error(errorMessage.message);
            } else {
                console.error('Unexpected error:', error);
                throw new Error('Unexpected error occurred');
            }
        }
    }
}

export const menuItemService = new MenuItemCrudService();
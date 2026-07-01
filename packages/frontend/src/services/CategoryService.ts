import { ModificableCrudService } from './CRUDService';
import { Category } from '../models/Category';
import axios from 'axios';
import { getAxiosConfig } from '../utils/authUtils';
import { ErrorMessage } from '../utils/popupUtils';

class CategoryCrudService extends ModificableCrudService<Category, string> {
    constructor() {
        super("categories");
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
}

export const categoryService = new CategoryCrudService();

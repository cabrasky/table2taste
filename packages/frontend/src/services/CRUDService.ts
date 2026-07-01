import axios from "axios";
import { getAxiosConfig } from "../utils/authUtils";
import { API_HOST } from "./conts";
import { ErrorMessage } from "../utils/popupUtils";

export class CrudService<T, I> {
    protected baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = `${API_HOST}/${baseUrl}`;
    }

    async get(id: I): Promise<T> {
        try {
            const response = await axios.get<T>(this.baseUrl, {
                params: { id },
                ...getAxiosConfig()
            });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                const errorMessage: ErrorMessage = error.response.data;
                console.error('Error fetching data:', errorMessage);
                throw new Error(errorMessage.message);
            } else {
                console.error('Unexpected error:', error);
                throw new Error('Unexpected error occurred');
            }
        }
    }

    async getAll(params?: Partial<T>): Promise<T[]> {
        try {
            const response = await axios.get<T[]>(this.baseUrl, {
                params,
                ...getAxiosConfig()
            });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                const errorMessage: ErrorMessage = error.response.data;
                console.error('Error fetching data:', errorMessage);
                throw new Error(errorMessage.message);
            } else {
                console.error('Unexpected error:', error);
                throw new Error('Unexpected error occurred');
            }
        }
    }
}

export class ModificableCrudService<T, I> extends CrudService<T, I> {
    async create(data: T): Promise<T> {
        try {
            const response = await axios.post<T>(this.baseUrl, data, getAxiosConfig());
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                const errorMessage: ErrorMessage = error.response.data;
                console.error('Error creating data:', errorMessage);
                throw new Error(errorMessage.message);
            } else {
                console.error('Unexpected error:', error);
                throw new Error('Unexpected error occurred');
            }
        }
    }

    async update(id: I, data: Partial<T>): Promise<T> {
        try {
            const response = await axios.put<T>(`${this.baseUrl}?id=${id}`, data, getAxiosConfig());
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                const errorMessage: ErrorMessage = error.response.data;
                console.error('Error updating data:', errorMessage);
                throw new Error(errorMessage.message);
            } else {
                console.error('Unexpected error:', error);
                throw new Error('Unexpected error occurred');
            }
        }
    }

    async delete(id: I): Promise<void> {
        try {
            await axios.delete<void>(`${this.baseUrl}?id=${id}`, getAxiosConfig());
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                const errorMessage: ErrorMessage = error.response.data;
                console.error('Error deleting data:', errorMessage);
                throw new Error(errorMessage.message);
            } else {
                console.error('Unexpected error:', error);
                throw new Error('Unexpected error occurred');
            }
        }
    }
}
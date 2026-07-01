import { ModificableCrudService } from './CRUDService';
import { User } from '../models/User';
import axios from 'axios';
import { API_HOST } from './conts';
import { getAxiosConfig } from '../utils/authUtils';
import { ErrorMessage } from '../utils/popupUtils';

interface LoginToken {
    username: string,
    tokenType: string,
    accessToken: string
}

class UserService extends ModificableCrudService<User, string> {
    constructor() {
        super("users");
    }

    async userInfo(): Promise<User> {
        try {
            const response = await axios.get<User>(`${API_HOST}/userInfo`, getAxiosConfig());
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                const errorMessage: ErrorMessage = error.response.data;
                console.error('Error fetching user info:', errorMessage);
                throw new Error(errorMessage.message);
            } else {
                console.error('Unexpected error:', error);
                throw new Error('Unexpected error occurred');
            }
        }
    }

    async login(username: string, password: string): Promise<LoginToken> {
        try {
            const response = await axios.post<LoginToken>(`${API_HOST}/login`, { username, password });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                const errorMessage: ErrorMessage = error.response.data;
                console.error('Error logging in:', errorMessage);
                throw new Error(errorMessage.message);
            } else {
                console.error('Unexpected error:', error);
                throw new Error('Unexpected error occurred');
            }
        }
    }
}

export const userService = new UserService();

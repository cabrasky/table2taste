import { AxiosRequestConfig } from 'axios';
import {jwtDecode} from 'jwt-decode';

interface JwtPayload {
    exp: number;
}

export const getAxiosConfig = (token: string | null = localStorage.getItem('token')): AxiosRequestConfig => {
    return token
        ? {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        }
        : {};
};

export const isTokenExpired = (token: string): boolean => {
    try {
        const { exp } = jwtDecode<JwtPayload>(token);
        if (!exp) {
            return true;
        }
        return Date.now() >= exp * 1000;
    } catch (error) {
        return true;
    }
};

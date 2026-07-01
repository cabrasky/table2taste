import React, { createContext, useContext, useEffect, useState } from 'react';
import { AxiosRequestConfig } from 'axios';
import { User } from '../models/User';
import { userService } from '../services/UserService';
import { getAxiosConfig, isTokenExpired } from '../utils/authUtils'; // Adjust the path as necessary

interface AuthContextType {
    token: string | null;
    setToken: (newToken: string|null) => void;
    user: User | null;
    config: AxiosRequestConfig;
}

const AuthContext = createContext<AuthContextType>({
    token: null,
    setToken: () => { },
    user: null,
    config: {}
});

export const useAuth = () => useContext(AuthContext);

interface Props {
    children?: React.ReactNode;
}

export const AuthProvider: React.FC<Props> = ({ children }) => {
    const [token, setToken_] = useState<string | null>(localStorage.getItem('token'));
    const [user, setUser] = useState<User | null>(null);
    const [config, setConfig] = useState<AxiosRequestConfig>({});

    const setToken = (newToken: string | null) => {
        setToken_(newToken);
    };

    useEffect(() => {
        if (token && isTokenExpired(token)) {
            setToken(null);
            return;
        }

        const newConfig = getAxiosConfig(token)
        setConfig(newConfig);

        if (token) {
            localStorage.setItem('token', token);
            userService.userInfo().then(data => {
                setUser(data);
            }).catch(() => {
                setToken(null);
            });
        } else {
            localStorage.removeItem('token');
            setUser(null);
        }
    }, [token]);

    return (
        <AuthContext.Provider value={{ token, setToken, user, config }}>
            {children}
        </AuthContext.Provider>
    );
};

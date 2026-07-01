import React from 'react';
import { AppRoutes } from './components/AppRoutes';
import { LanguageProvider } from './contexts/LanguageContext';
import './app.css'
import { BreadcrumbsProvider } from './contexts/BreadcrumbContext';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App: React.FC = () => {
    return (
        <>
            <ToastContainer />
            <LanguageProvider>
                <AuthProvider>
                    <BreadcrumbsProvider>
                        <CartProvider>
                            <AppRoutes />
                        </CartProvider>
                    </BreadcrumbsProvider>
                </AuthProvider>
            </LanguageProvider>
        </>
    );
};

export default App;

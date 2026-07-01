import React, { createContext, useContext, useEffect, useState } from 'react';
import { Translation } from '../models/Translation';
import axios from 'axios';

interface LanguageContextType {
    language: string;
    setLanguage: React.Dispatch<React.SetStateAction<string>>;
    defaultTranslations: Translation[];
}

interface AppTranslations {
    [key: string]: {
        [key: string]: string
    }
}

const LanguageContext = createContext<LanguageContextType>({
    language: 'en',
    setLanguage: () => { },
    defaultTranslations: []
});

export const useLanguage = () => useContext(LanguageContext);

interface Props {
    children?: React.ReactNode
};

export const LanguageProvider: React.FC<Props> = ({ children }) => {
    const [language, setLanguage] = useState('en');
    const [defaultTranslations, setDefaultTranslations] = useState<Translation[]>([])

    useEffect(() => {
        async function fetchData() {
            axios.get('/data/appTranslations.json').then(data => {
                setDefaultTranslations((Object.entries(data.data as AppTranslations).map((lang) => {
                    return (Object.entries(lang[1]).map((keyEntry) => {
                        return ({
                            language: {
                                id: lang[0]
                            },
                            translationKey: keyEntry[0],
                            value: keyEntry[1]
                        } as Translation)
                    })) as Translation[]
                }).flat()));

            });;

        }
        fetchData();
    }, []);



    return (
        <LanguageContext.Provider value={{ language, setLanguage, defaultTranslations }}>
            {children}
        </LanguageContext.Provider>
    );
};

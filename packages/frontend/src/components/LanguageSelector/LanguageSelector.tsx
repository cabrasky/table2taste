import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import './style.css'

const LanguageSelector: React.FC = () => {
    const {language, setLanguage } = useLanguage();

    const changeLanguage = (value: string) => {
        setLanguage(value);
    };

    return (
        <div className="language-switcher">
            <img
                src="/img/flags/en.png"
                alt="English Flag"
                onClick={() => changeLanguage('en')}
                className={`flag-icon ${language !== 'en' ? 'grayscale' : ''}`}
                role="button"
                aria-label="Switch to English"
            />
            <img
                src="/img/flags/es.png"
                alt="Spanish Flag"
                onClick={() => changeLanguage('es')}
                className={`flag-icon ${language !== 'es' ? 'grayscale' : ''}`}
                role="button"
                aria-label="Switch to Spanish"
            />
        </div>


    );
};

export default LanguageSelector;

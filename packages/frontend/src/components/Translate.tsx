// Translate.tsx
import React, { useEffect, useState } from 'react';
import { Translation } from '../models/Translation';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
    translationKey: string;
    dataSet?: Partial<Translation>[];
}

const Translate: React.FC<Props> = ({ translationKey, dataSet }) => {
    const { language, defaultTranslations } = useLanguage();
    const [translations, setTranslations] = useState<Partial<Translation>[]>([])
    
    useEffect(() => {
        if (!dataSet) {
            setTranslations(defaultTranslations);
        } else {
            setTranslations(dataSet);
        }
    }, [dataSet, language, defaultTranslations]);

    const translation = translations.find(translation =>
        translation.translationKey === translationKey &&
        translation.language!.id === language
    );

    return <>{translation ? translation.value : translationKey}</>;
};

export default Translate;
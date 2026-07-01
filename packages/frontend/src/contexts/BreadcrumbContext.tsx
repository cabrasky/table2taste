import React, { createContext, useContext, useState } from 'react';

interface BreadcrumbProps {
    label: string | React.ReactNode;
    url: string;
}

interface BreadcrumbsContextType {
    breadcrumbs: BreadcrumbProps[];
    setBreadcrumbs: React.Dispatch<React.SetStateAction<BreadcrumbProps[]>>;
}

const BreadcrumbsContext = createContext<BreadcrumbsContextType>({
    breadcrumbs: [],
    setBreadcrumbs: () => {},
});

export const useBreadcrumbs = () => useContext(BreadcrumbsContext);

interface Props {
    children?: React.ReactNode;
}

export const BreadcrumbsProvider: React.FC<Props> = ({ children }) => {
    const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbProps[]>([]);

    return (
        <BreadcrumbsContext.Provider value={{ breadcrumbs, setBreadcrumbs }}>
            {children}
        </BreadcrumbsContext.Provider>
    );
};

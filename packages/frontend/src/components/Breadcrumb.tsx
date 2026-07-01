import React from 'react';
import { useBreadcrumbs } from '../contexts/BreadcrumbContext';
import { Link } from 'react-router-dom';

const Breadcrumb: React.FC = () => {
    const { breadcrumbs } = useBreadcrumbs();
    return (
        <div>
            {breadcrumbs.map((breadcrumb, index) => (
                <span key={index}>
                    <Link to={breadcrumb.url} >{breadcrumb.label}</Link>
                    {index < breadcrumbs.length - 1 && ' / '}
                </span>
            ))}
        </div>
    );
};

export default Breadcrumb;

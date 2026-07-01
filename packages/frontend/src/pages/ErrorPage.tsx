import React from 'react';
import { useLocation } from 'react-router-dom';

interface ErrorPageProps {
  requiredGroup: string;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ requiredGroup }) => {
  const location = useLocation();

  return (
    <div>
      <h1>Access Denied</h1>
      <p>You do not have permission to view this page.</p>
      <p>Required group: {requiredGroup}</p>
      <p>Attempted URL: {location.pathname}</p>
    </div>
  );
};

export default ErrorPage;

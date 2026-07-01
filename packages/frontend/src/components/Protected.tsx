import React from "react";
import { useAuth } from "../contexts/AuthContext";

interface Props {
    privilege: string;
    children: React.ReactNode;
}



export const Protected: React.FC<Props> = ({ privilege, children }) => {
    const { user } = useAuth();
    
    const userPrivileges = user?.groups.flatMap(g => g.privileges?.map(p => p.id)) || [];

    const hasRequiredPrivilege = userPrivileges.includes(privilege);

    if (user === null || !hasRequiredPrivilege) {
        return null
    }

    return <>{children}</>;
};

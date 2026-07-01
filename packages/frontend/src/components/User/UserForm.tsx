import React, { useState, useEffect } from 'react';
import {userService} from '../../services/UserService';
import { User } from '../../models/User';
import {groupService} from '../../services/GroupService';
import { Group } from '../../models/Group';

interface UserFormProps {
    defaultUsername?: string;
}

const UserForm: React.FC<UserFormProps> = ({ defaultUsername = "" }) => {
    const [username, setUsername] = useState('');
    const [name, setName] = useState('');
    const [photoUrl, setPhotoUrl] = useState('');
    const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
    const [allGroups, setAllGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchGroups();
        if (defaultUsername != "") {
            fetchUser(defaultUsername);
        }
    }, [defaultUsername]);

    const fetchGroups = async () => {
        try {
            // Fetch groups using userService
            const groups = await groupService.getAll();
            setAllGroups(groups);
            setLoading(false);
        } catch (error) {
            setError('Error fetching groups');
            setLoading(false);
        }
    };

    const fetchUser = async (id: string) => {
        try {
            const user = await userService.get(id);
            setName(user.name);
            setPhotoUrl(user.photoUrl);
            setSelectedGroups(user.groups.map((userGroup) => userGroup.id!));
            setLoading(false);
        } catch (error) {
            setError('Error fetching user');
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (defaultUsername != "") {
                await userService.update(username, {
                    id: username,
                    name,
                    photoUrl: photoUrl,
                    groups: selectedGroups.map(groupId => ({ id: groupId }))
                });
            } else {
                await userService.create({
                    id: username,
                    name,
                    photoUrl: photoUrl,
                    groups: selectedGroups.map(groupId => ({ id: groupId }))
                });
            }
        } catch (error) {
            setError('Error saving user');
        }
    };
    
    return (
        <div>
            <h2>{username ? 'Modify User' : 'Create User'}</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Id:</label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>
                <div>
                    <label>Name:</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                    <label>Photo URL:</label>
                    <input type="text" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} />
                </div>
                <div>
                    <label>Groups:</label>
                    <select multiple value={selectedGroups} onChange={(e) => setSelectedGroups(Array.from(e.target.selectedOptions, option => option.value))}>
                        {allGroups.map(group => (
                            <option key={group.id} value={group.id}>{group.id}</option>
                        ))}
                    </select>
                </div>
                <button type="submit">{username ? 'Modify' : 'Create'}</button>
            </form>
        </div>
    );
};

export default UserForm;

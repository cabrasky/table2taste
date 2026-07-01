import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User } from '../../models/User';
import UserForm from './UserForm';

const UserList: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get<User[]>('http://localhost:8000/api/users');
            setUsers(response.data);
            setLoading(false);
        } catch (error) {
            setError('Error fetching users');
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await axios.delete(`http://localhost:8000/api/users/${id}`);
        } catch (error) {
            console.error('Error deleting user:', error);
            setError('Error deleting user');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div>
            <h2>User List</h2>
            {users.length === 0 ? (
                <div>No users found</div>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Photo</th>
                            <th>Groups</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.name}</td>
                                <td><img src={user.photoUrl} alt={user.name} /></td>
                                <td>
                                    <div>
                                        {user.groups.map((group) => (
                                            <button
                                                key={`${user.id}_${group.id}`}
                                                className="group-button"
                                                style={{ backgroundColor: group.color, borderRadius: '50%', height: '24px', marginRight: '5px' }}
                                                onClick={() => console.log(group.id)}
                                            >
                                                {group.id}
                                            </button>
                                        ))}
                                    </div>
                                </td>
                                <td>
                                    <button onClick={() => handleDelete(user.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            
            <UserForm/>
        </div>
    );
};

export default UserList;

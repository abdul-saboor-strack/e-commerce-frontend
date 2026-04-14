import React, { useEffect, useState } from "react";
import axios from "axios";

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

const Users = () => {
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = () => {
        axios.get("http://localhost:5000/api/users")
            .then(res => setUsers(res.data))
            .catch(err => console.error(err));
    };

    const handleRoleChange = (id: number, role: string) => {
        axios.put(`http://localhost:5000/api/users/${id}`, { role })
            .then(() => fetchUsers())
            .catch(err => console.error(err));
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Users</h1>
            <table className="w-full border-collapse border border-gray-300">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="border p-2">ID</th>
                        <th className="border p-2">Name</th>
                        <th className="border p-2">Email</th>
                        <th className="border p-2">Role</th>
                        <th className="border p-2">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td className="border p-2">{user.id}</td>
                            <td className="border p-2">{user.name}</td>
                            <td className="border p-2">{user.email}</td>
                            <td className="border p-2">{user.role}</td>
                            <td className="border p-2">
                                <select
                                    value={user.role}
                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                    className="border p-1"
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Users;
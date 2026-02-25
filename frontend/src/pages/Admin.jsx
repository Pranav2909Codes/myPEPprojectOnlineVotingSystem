import React, { useState, useEffect } from 'react';
import { Users, Trash2, Shield, User as UserIcon, AlertTriangle, RefreshCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Admin.css';

const Admin = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/auth/users', {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            const data = await res.json();
            if (res.ok) {
                setUsers(data);
            } else {
                setError(data.message || 'Failed to fetch users');
            }
        } catch (err) {
            setError('Error connecting to server');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

        try {
            const res = await fetch(`/api/auth/users/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${user.token}` },
            });
            if (res.ok) {
                setUsers(users.filter(u => u._id !== id));
            } else {
                const data = await res.json();
                alert(data.message || 'Delete failed');
            }
        } catch (err) {
            console.error('Error deleting user:', err);
        }
    };

    return (
        <div className="container admin-container">
            <header className="admin-header">
                <div>
                    <h1>System Administration</h1>
                    <p>Manage users, roles, and system security.</p>
                </div>
                <button className="btn btn-outline" onClick={fetchUsers} disabled={loading}>
                    <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </header>

            <div className="admin-stats">
                <div className="card stat-card glass">
                    <div className="stat-icon-admin users-icon">
                        <Users size={24} />
                    </div>
                    <div className="stat-detail">
                        <span className="stat-label">Total Registered</span>
                        <h3 className="stat-value">{users.length}</h3>
                    </div>
                </div>
                <div className="card stat-card glass">
                    <div className="stat-icon-admin admin-icon">
                        <Shield size={24} />
                    </div>
                    <div className="stat-detail">
                        <span className="stat-label">Administrators</span>
                        <h3 className="stat-value">{users.filter(u => u.role === 'admin').length}</h3>
                    </div>
                </div>
            </div>

            <section className="user-management-section">
                <div className="card glass">
                    <div className="section-title">
                        <h2>User Management</h2>
                        <span className="user-count">{users.length} users found</span>
                    </div>

                    {loading ? (
                        <div className="loading-placeholder">Loading user data...</div>
                    ) : error ? (
                        <div className="error-state">
                            <AlertTriangle size={32} />
                            <p>{error}</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Joined</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u) => (
                                        <tr key={u._id}>
                                            <td>
                                                <div className="user-cell">
                                                    <div className="avatar-small">
                                                        <UserIcon size={14} />
                                                    </div>
                                                    <span>{u.name}</span>
                                                </div>
                                            </td>
                                            <td>{u.email}</td>
                                            <td>
                                                <span className={`role-badge ${u.role === 'admin' ? 'admin' : 'user'}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                {u._id !== user._id && u.role !== 'admin' && (
                                                    <button
                                                        className="delete-btn"
                                                        onClick={() => handleDeleteUser(u._id)}
                                                        title="Delete User"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Admin;

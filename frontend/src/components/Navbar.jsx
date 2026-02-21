import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Vote, LayoutDashboard, BarChart3, Settings, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <nav className="navbar glass">
            <div className="container navbar-content">
                <Link to="/dashboard" className="navbar-logo">
                    <Vote className="logo-icon" size={28} />
                    <span>VoteSmart</span>
                </Link>

                <div className="navbar-links">
                    <Link to="/dashboard" className="nav-item">
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </Link>
                    <Link to="/polls" className="nav-item">
                        <BarChart3 size={20} />
                        <span>Polls</span>
                    </Link>
                    <Link to="/reports" className="nav-item">
                        <BarChart3 size={20} />
                        <span>Reports</span>
                    </Link>
                    {user.role === 'admin' && (
                        <Link to="/admin" className="nav-item admin-link">
                            <Settings size={20} />
                            <span>Admin</span>
                        </Link>
                    )}
                </div>

                <div className="navbar-user">
                    <div className="user-profile">
                        <div className="user-avatar">
                            <UserIcon size={18} />
                        </div>
                        <div className="user-info">
                            <span className="user-name">{user.name}</span>
                            <span className="user-role uppercase">{user.role}</span>
                        </div>
                    </div>
                    <button className="logout-btn" onClick={handleLogout} title="Logout">
                        <LogOut size={20} />
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

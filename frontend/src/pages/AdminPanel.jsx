import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Shield, BarChart3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import OnlineVoting from './OnlineVoting';
import Reports from './Reports';
import './Admin.css';

const AdminPanel = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('overview'); // overview | elections

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (user.role !== 'admin') {
        return <Navigate to="/dashboard" />;
    }

    return (
        <div className="container admin-container">
            <header className="admin-header">
                <div>
                    <h1>Election Admin Panel</h1>
                    <p>Configure national polls, monitor turnout, and review live results.</p>
                </div>
                <div className="admin-header-icons">
                    <span className="admin-chip">
                        <Shield size={16} />
                        Admin Access
                    </span>
                    <span className="admin-chip">
                        <BarChart3 size={16} />
                        Live Analytics
                    </span>
                </div>
            </header>

            <div className="admin-tabs">
                <button
                    className={`admin-tab ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    Overview & Reports
                </button>
                <button
                    className={`admin-tab ${activeTab === 'elections' ? 'active' : ''}`}
                    onClick={() => setActiveTab('elections')}
                >
                    Manage Elections
                </button>
            </div>

            {activeTab === 'overview' && (
                <section style={{ marginBottom: '2rem' }}>
                    <Reports />
                </section>
            )}

            {activeTab === 'elections' && (
                <section>
                    <OnlineVoting isAdmin />
                </section>
            )}
        </div>
    );
};

export default AdminPanel;


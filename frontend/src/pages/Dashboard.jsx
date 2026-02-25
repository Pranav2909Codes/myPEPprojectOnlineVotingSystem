import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Vote, Users, PieChart, Clock, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const res = await fetch('/api/reports/summary', {
                    headers: { Authorization: `Bearer ${user.token}` },
                });
                const data = await res.json();
                if (res.ok) setSummary(data);
            } catch (err) {
                console.error('Error fetching dashboard summary:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, [user.token]);

    const stats = [
        { label: 'Active Elections', value: summary?.activePolls || '0', icon: <Vote size={24} />, color: 'var(--primary)' },
        { label: 'Registered Voters', value: summary?.totalUsers || '0', icon: <Users size={24} />, color: 'var(--secondary)' },
        { label: 'Total Votes Cast', value: summary?.totalVotes || '0', icon: <PieChart size={24} />, color: 'var(--accent)' },
        {
            label: 'Closing Soon',
            value: summary?.pollStats
                ? summary.pollStats.filter(p => p.status === 'active').length
                : '0',
            icon: <Clock size={24} />,
            color: '#f59e0b',
        },
    ];

    const recentPolls = summary?.pollStats || [];

    return (
        <div className="container dashboard-container">
            <header className="dashboard-header">
                <div>
                    <h1>Welcome, {user.name}!</h1>
                    <p>Review live election activity and jump straight into voting.</p>
                </div>

                <button
                    className="btn btn-primary"
                    onClick={() =>
                        user.role === 'admin' ? navigate('/admin/panel') : navigate('/polls')
                    }
                >
                    {user.role === 'admin' ? 'Open Admin Panel' : 'Go to Ballot'}
                </button>

            </header>

            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div key={index} className="card stat-card">
                        <div className="stat-icon" style={{ backgroundColor: stat.color + '20', color: stat.color }}>
                            {stat.icon}
                        </div>
                        <div className="stat-info">
                            <span className="stat-label">{stat.label}</span>
                            <h3 className="stat-value">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="dashboard-main">
                <section className="recent-activity">
                    <div className="section-header">
                        <h2>Active Elections</h2>
                        <button
                            type="button"
                            className="link-button"
                            onClick={() => navigate('/polls')}
                        >
                            View all elections <ArrowUpRight size={16} />
                        </button>
                    </div>
                    <div className="poll-list">
                        {recentPolls.map((poll) => (
                            <div key={poll.id} className="card poll-item">
                                <div className="poll-content">
                                    <h3>{poll.title}</h3>
                                    <div className="poll-meta">
                                        <span>Status: {poll.status}</span>
                                        <span className="separator">•</span>
                                        <span>{poll.totalVotes} total votes</span>
                                    </div>
                                </div>
                                <div className="poll-action">
                                    <span className={`status-badge ${poll.status.toLowerCase()}`}>{poll.status}</span>
                                    <button className="btn btn-outline" onClick={() => navigate('/polls')}>Vote Now</button>
                                </div>
                            </div>
                        ))}
                        {recentPolls.length === 0 && (
                            <div className="empty-state">No elections created yet.</div>
                        )}
                    </div>
                </section>

                <aside className="quick-actions">
                    <h2>Quick Actions</h2>
                    <div className="action-buttons">
                        <button className="btn btn-outline w-full">View My Votes</button>
                        <button className="btn btn-outline w-full">Generate Reports</button>
                        <button className="btn btn-outline w-full">Security Settings</button>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default Dashboard;

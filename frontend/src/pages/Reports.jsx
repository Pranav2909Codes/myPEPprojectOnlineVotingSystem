import { useState, useEffect } from 'react';
import { Download, FileText, PieChart, TrendingUp, Users, Clock, CheckCircle2, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Reports.css';

const Reports = () => {
    const [summary, setSummary] = useState(null);
    const [feed, setFeed] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const [summaryRes, feedRes] = await Promise.all([
                    fetch('/api/reports/summary', {
                        headers: { Authorization: `Bearer ${user.token}` },
                    }),
                    fetch('/api/reports/feed', {
                        headers: { Authorization: `Bearer ${user.token}` },
                    }),
                ]);

                const summaryData = await summaryRes.json();
                const feedData = await feedRes.json();

                if (summaryRes.ok) setSummary(summaryData);
                if (feedRes.ok) setFeed(feedData);
            } catch (err) {
                console.error('Error fetching reports:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, [user.token]);

    const reportStats = [
        { label: 'Total Voted Users', value: summary?.totalUsers || '0', icon: <Users size={24} />, change: '+12%', type: 'Users' },
        { label: 'Poll Success Rate', value: '98.5%', icon: <TrendingUp size={24} />, change: '+0.5%', type: 'Performance' },
        { label: 'Active Polls Running', value: summary?.activePolls || '0', icon: <FileText size={24} />, change: '-2', type: 'System' },
        { label: 'Average Turnout', value: '76%', icon: <PieChart size={24} />, change: '+5%', type: 'Engagement' },
    ];

    if (loading) return <div className="loading-screen">Loading Reports...</div>;

    return (
        <div className="container reports-container">
            <div className="reports-header">
                <h1>Reports & Analytics</h1>
                <button className="btn btn-outline">
                    <Download size={18} />
                    Export All Data
                </button>
            </div>

            <div className="reports-grid">
                {reportStats.map((report, index) => (
                    <div key={index} className="card report-stat glass">
                        <div className="report-stat-header">
                            <span className="report-stat-type">{report.type}</span>
                            <span className={`report-stat-change ${report.change.startsWith('+') ? 'up' : 'down'}`}>
                                {report.change}
                            </span>
                        </div>
                        <h3 className="report-stat-value">{report.value}</h3>
                        <p className="report-stat-title">{report.label}</p>
                    </div>
                ))}
            </div>

            <div className="reports-content">
                <div className="card report-table-card glass">
                    <div className="section-header">
                        <h2>Live Voting Feed</h2>
                        <div className="header-actions">
                            <button className="btn btn-outline btn-sm">Filter</button>
                        </div>
                    </div>
                    <table className="report-table">
                        <thead>
                            <tr>
                                <th>User ID</th>
                                <th>Poll Name</th>
                                <th>Time Cast</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {feed.map((item) => (
                                <tr key={item._id}>
                                    <td>User {item.createdBy?._id.slice(-4) || 'Anon'}</td>
                                    <td>{item.title}</td>
                                    <td>{new Date(item.createdAt).toLocaleTimeString()}</td>
                                    <td>
                                        <span className="badge verified">
                                            <CheckCircle2 size={12} />
                                            Verified
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {feed.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="text-center">No recent activity.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="card summary-card glass">
                    <h2>Summary Insights</h2>
                    <div className="summary-list">
                        <div className="summary-item">
                            <TrendingUp size={24} className="icon-blue" />
                            <div>
                                <h4>Engagement Peak</h4>
                                <p>Most votes were cast between 10:00 AM and 11:30 AM.</p>
                            </div>
                        </div>
                        <div className="summary-item">
                            <Users size={24} className="icon-purple" />
                            <div>
                                <h4>Top Contributor</h4>
                                <p>The "Engineering" department has 100% turnout.</p>
                            </div>
                        </div>
                        <div className="summary-item">
                            <Calendar size={24} className="icon-pink" />
                            <div>
                                <h4>Poll Trends</h4>
                                <p>Polls ending on Fridays receive 40% more participation.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;

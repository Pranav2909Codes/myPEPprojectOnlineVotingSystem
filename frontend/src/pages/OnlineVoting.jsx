import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Plus, ChevronRight, X, Clock, Calendar, CheckCircle2, Flag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Voting.css';

const OnlineVoting = ({ isAdmin = false }) => {
    const [polls, setPolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newPoll, setNewPoll] = useState({
        title: '',
        description: '',
        options: ['', ''],
        endDate: '',
    });
    const { user } = useAuth();
    const [statusFilter, setStatusFilter] = useState('all'); // all | active | completed | mine
    const [searchTerm, setSearchTerm] = useState('');
    const [banner, setBanner] = useState(null); // { type: 'success' | 'error', message: string }
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        fetchPolls();

        // Auto-refresh results every 30 seconds to keep things live
        const intervalId = setInterval(fetchPolls, 30000);

        // Keep a ticking "now" value for countdown timers
        const clockId = setInterval(() => setNow(new Date()), 30000);

        return () => {
            clearInterval(intervalId);
            clearInterval(clockId);
        };
    }, []);

    const [showVoteModal, setShowVoteModal] = useState(false);
    const [selectedPoll, setSelectedPoll] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);

    const fetchPolls = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/online', {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            const data = await res.json();
            if (res.ok) setPolls(data);
        } catch (err) {
            console.error('Error fetching polls:', err);
        } finally {
            setLoading(false);
        }
    };

    const displayedPolls = useMemo(() => {
        let filtered = [...polls];

        if (statusFilter === 'active') {
            filtered = filtered.filter(
                (poll) => poll.status === 'active' && new Date(poll.endDate) >= now
            );
        } else if (statusFilter === 'completed') {
            filtered = filtered.filter(
                (poll) => poll.status === 'closed' || new Date(poll.endDate) < now
            );
        } else if (statusFilter === 'mine') {
            filtered = filtered.filter((poll) => {
                const createdByMe =
                    poll.createdBy && poll.createdBy._id === user._id;
                const iVoted = poll.hasVoted;
                return createdByMe || iVoted;
            });
        }

        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter((poll) => {
                const inTitle = poll.title.toLowerCase().includes(term);
                const inDescription = poll.description.toLowerCase().includes(term);
                const inOptions = poll.options.some((opt) =>
                    opt.text.toLowerCase().includes(term)
                );
                return inTitle || inDescription || inOptions;
            });
        }

        // Sort active elections soonest ending first
        filtered.sort((a, b) => new Date(a.endDate) - new Date(b.endDate));

        return filtered;
    }, [polls, statusFilter, searchTerm, user?._id, now]);

    const summary = useMemo(() => {
        if (!polls.length) {
            return {
                active: 0,
                totalVotes: 0,
                participated: 0,
            };
        }

        const active = polls.filter(
            (p) => p.status === 'active' && new Date(p.endDate) >= now
        ).length;

        const totalVotes = polls.reduce(
            (sum, poll) => sum + poll.options.reduce((a, b) => a + b.votes, 0),
            0
        );

        const participated = polls.filter((p) => p.hasVoted).length;

        return { active, totalVotes, participated };
    }, [polls, now]);

    const formatCountdown = (endDate) => {
        const end = new Date(endDate).getTime();
        const diff = end - now.getTime();

        if (diff <= 0) return 'Ended';

        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ${hours % 24}h left`;
        if (hours > 0) return `${hours}h ${minutes % 60}m left`;
        return `${minutes}m left`;
    };

    const handleCreatePoll = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/online', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify(newPoll),
            });
            if (res.ok) {
                setShowModal(false);
                fetchPolls();
                setNewPoll({ title: '', description: '', options: ['', ''], endDate: '' });
            }
        } catch (err) {
            console.error('Error creating poll:', err);
        }
    };

    const handleCreateSampleElection = () => {
        // Pre-fill a realistic national election with real political parties
        setNewPoll({
            title: 'National General Election 2026',
            description:
                'Cast your vote for the next national government. This simulated ballot uses real political parties for a realistic experience.',
            options: [
                'Bharatiya Janata Party (BJP)',
                'Indian National Congress (INC)',
                'Aam Aadmi Party (AAP)',
                'Bahujan Samaj Party (BSP)',
            ],
            endDate: new Date(new Date().setDate(new Date().getDate() + 7))
                .toISOString()
                .slice(0, 10),
        });
        setShowModal(true);
    };

    const handleVote = async () => {
        if (!selectedOption) return;
        try {
            const res = await fetch(`/api/online/${selectedPoll._id}/vote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify({ optionId: selectedOption }),
            });
            const data = await res.json();
            if (res.ok) {
                setShowVoteModal(false);
                setBanner({ type: 'success', message: 'Your vote has been recorded successfully.' });
                fetchPolls();
            } else {
                setBanner({
                    type: 'error',
                    message: data.message || 'There was a problem recording your vote.',
                });
            }
        } catch (err) {
            console.error('Error voting:', err);
            setBanner({
                type: 'error',
                message: 'Unable to reach the voting server. Please try again.',
            });
        }
    };

    const handleDeletePoll = async (id) => {
        if (!window.confirm('Are you sure you want to delete this poll?')) return;
        try {
            const res = await fetch(`/api/online/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${user.token}` },
            });
            if (res.ok) {
                fetchPolls();
            }
        } catch (err) {
            console.error('Error deleting poll:', err);
        }
    };

    const handleDuplicatePoll = async (poll) => {
        try {
            const res = await fetch('/api/online', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify({
                    title: `${poll.title} (Re-run)`,
                    description: poll.description,
                    options: poll.options.map((o) => o.text),
                    endDate: new Date(new Date().setDate(new Date().getDate() + 7))
                        .toISOString()
                        .slice(0, 10),
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setBanner({
                    type: 'success',
                    message: 'Election duplicated for a new run.',
                });
                fetchPolls();
            } else {
                setBanner({
                    type: 'error',
                    message: data.message || 'Could not duplicate election.',
                });
            }
        } catch (err) {
            console.error('Error duplicating poll:', err);
            setBanner({
                type: 'error',
                message: 'Unable to reach the server. Please try again.',
            });
        }
    };

    const handleToggleStatus = async (poll) => {
        const newStatus = poll.status === 'active' ? 'closed' : 'active';
        try {
            const res = await fetch(`/api/online/${poll._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                fetchPolls();
            }
        } catch (err) {
            console.error('Error toggling status:', err);
        }
    };

    const handleAddOption = () => {
        setNewPoll({ ...newPoll, options: [...newPoll.options, ''] });
    };

    const handleOptionChange = (index, value) => {
        const updatedOptions = [...newPoll.options];
        updatedOptions[index] = value;
        setNewPoll({ ...newPoll, options: updatedOptions });
    };


    return (
        <div className="container voting-container">
            <div className="voting-header">
                <h1>Online Voting</h1>
                <div className="header-actions">
                    <div className="search-bar glass">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search elections or parties..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {isAdmin && (
                        <>
                            <button className="btn btn-outline" onClick={handleCreateSampleElection}>
                                <Flag size={18} />
                                Sample National Election
                            </button>
                            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                                <Plus size={18} />
                                Create Custom Poll
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="voting-summary-grid">
                <div className="voting-summary-card glass">
                    <span className="summary-label">Active Elections</span>
                    <span className="summary-value">{summary.active}</span>
                </div>
                <div className="voting-summary-card glass">
                    <span className="summary-label">Total Votes</span>
                    <span className="summary-value">{summary.totalVotes}</span>
                </div>
                <div className="voting-summary-card glass">
                    <span className="summary-label">You Participated In</span>
                    <span className="summary-value">
                        {summary.participated} {summary.participated === 1 ? 'election' : 'elections'}
                    </span>
                </div>
                <div className="voting-summary-card glass meta">
                    <span className="summary-label small">
                        Results auto-refresh every 30 seconds for a live experience.
                    </span>
                </div>
            </div>

            <div className="voting-filters">
                <div className="filter-chips">
                    <button
                        className={`chip ${statusFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('all')}
                    >
                        All Elections
                    </button>
                    <button
                        className={`chip ${statusFilter === 'active' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('active')}
                    >
                        Active
                    </button>
                    <button
                        className={`chip ${statusFilter === 'completed' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('completed')}
                    >
                        Completed
                    </button>
                    <button
                        className={`chip ${statusFilter === 'mine' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('mine')}
                    >
                        My Elections
                    </button>
                </div>
                <button className="filter-btn glass">
                    <Filter size={18} />
                    <span>Filters</span>
                </button>
            </div>

            {banner && (
                <div
                    className={`voting-banner ${banner.type === 'success' ? 'success' : 'error'}`}
                    onAnimationEnd={() => {
                        // auto-clear after animation completes
                        setTimeout(() => setBanner(null), 2500);
                    }}
                >
                    {banner.message}
                </div>
            )}

            {loading ? (
                <div className="loading-state">Loading polls...</div>
            ) : (
                <div className="polls-grid">
                    {displayedPolls.map((poll) => {
                        const totalVotesForPoll = poll.options.reduce(
                            (a, b) => a + b.votes,
                            0
                        );
                        const maxVotes =
                            totalVotesForPoll > 0
                                ? Math.max(...poll.options.map((o) => o.votes))
                                : 0;

                        return (
                        <div key={poll._id} className="poll-card glass">
                            <div className="poll-status-row">
                                <span className={`status-badge ${poll.status}`}>
                                    {poll.status === 'active' ? 'Active Election' : 'Completed'}
                                </span>
                                {poll.hasVoted && (
                                    <span className="voted-badge">
                                        <CheckCircle2 size={14} />
                                        Voted
                                    </span>
                                )}
                                <span className="end-date">
                                    <Clock size={14} />
                                    {formatCountdown(poll.endDate)}
                                </span>
                            </div>
                            <div className="poll-content">
                                <h3>{poll.title}</h3>
                                <p>{poll.description}</p>

                                <div className="poll-options-preview">
                                    {poll.options.map((opt) => {
                                        const percentage = totalVotesForPoll
                                            ? Math.round((opt.votes / totalVotesForPoll) * 100)
                                            : 0;
                                        const isLeading =
                                            totalVotesForPoll > 0 &&
                                            opt.votes === maxVotes &&
                                            maxVotes > 0;
                                        return (
                                            <div
                                                key={opt._id}
                                                className={`preview-option ${
                                                    isLeading ? 'leading' : ''
                                                }`}
                                            >
                                                <div className="opt-main">
                                                    <span className="opt-text">{opt.text}</span>
                                                    <span className="opt-votes">
                                                        {opt.votes} votes ({percentage}%)
                                                    </span>
                                                </div>
                                                <div className="opt-bar">
                                                    <div
                                                        className="opt-bar-fill"
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="poll-footer">
                                <span className="vote-count">
                                    {totalVotesForPoll} total votes
                                </span>
                                <div className="poll-actions-buttons">
                                    {isAdmin && (
                                        <div className="admin-actions">
                                            <button
                                                className="btn btn-outline btn-sm"
                                                onClick={() => handleToggleStatus(poll)}
                                                title={poll.status === 'active' ? "Close Poll" : "Open Poll"}
                                            >
                                                {poll.status === 'active' ? "Close" : "Open"}
                                            </button>
                                            <button
                                                className="btn btn-outline btn-sm"
                                                onClick={() => handleDuplicatePoll(poll)}
                                                title="Duplicate Election"
                                            >
                                                Duplicate
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleDeletePoll(poll._id)}
                                                title="Delete Poll"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                    <button
                                        className="btn btn-secondary"
                                        disabled={poll.status !== 'active' || new Date(poll.endDate) < new Date()}
                                        onClick={() => {
                                            setSelectedPoll(poll);
                                            setSelectedOption(null);
                                            setShowVoteModal(true);
                                        }}
                                    >
                                        {poll.status === 'active' ? 'Vote Now' : 'View Results'}
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )})}
                    {displayedPolls.length === 0 && (
                        <div className="empty-state">
                            No elections match your filters. Try clearing the search or filters.
                        </div>
                    )}
                </div>
            )}

            {/* Vote Modal */}
            {showVoteModal && selectedPoll && (
                <div className="modal-overlay">
                    <div className="modal-content glass">
                        <div className="modal-header">
                            <h2>{selectedPoll.title}</h2>
                            <button className="close-btn" onClick={() => setShowVoteModal(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <div className="vote-options">
                            <p className="poll-desc">{selectedPoll.description}</p>
                            {selectedPoll.hasVoted && (
                                <div className="already-voted-banner">
                                    <CheckCircle2 size={16} />
                                    <span>You have already voted in this election. You can still view the live results below.</span>
                                </div>
                            )}
                            {selectedPoll.options.map((option) => {
                                const totalVotes = selectedPoll.options.reduce(
                                    (sum, opt) => sum + opt.votes,
                                    0
                                );
                                const percentage = totalVotes
                                    ? Math.round((option.votes / totalVotes) * 100)
                                    : 0;

                                return (
                                    <div
                                        key={option._id}
                                        className={`vote-option-btn glass ${
                                            selectedOption === option._id ? 'selected' : ''
                                        }`}
                                        onClick={() =>
                                            !selectedPoll.hasVoted &&
                                            selectedPoll.status === 'active' &&
                                            new Date(selectedPoll.endDate) >= new Date() &&
                                            setSelectedOption(option._id)
                                        }
                                    >
                                        <span>{option.text}</span>
                                        <div className="vote-result-meta">
                                            <span>{option.votes} votes</span>
                                            <span>{percentage}%</span>
                                        </div>
                                    </div>
                                );
                            })}
                            <div className="modal-actions">
                                <button className="btn btn-secondary" onClick={() => setShowVoteModal(false)}>
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleVote}
                                    disabled={
                                        !selectedOption ||
                                        selectedPoll.hasVoted ||
                                        selectedPoll.status !== 'active' ||
                                        new Date(selectedPoll.endDate) < new Date()
                                    }
                                >
                                    Confirm Vote
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}


            {/* Create Poll Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content glass">
                        <div className="modal-header">
                            <h2>Create New Poll</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleCreatePoll} className="poll-form">
                            <div className="form-group">
                                <label>Poll Title</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Project Budget 2026"
                                    value={newPoll.title}
                                    onChange={(e) => setNewPoll({ ...newPoll, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    placeholder="Provide details about the poll..."
                                    value={newPoll.description}
                                    onChange={(e) => setNewPoll({ ...newPoll, description: e.target.value })}
                                    required
                                ></textarea>
                            </div>

                            <div className="form-group">
                                <label>Options</label>
                                {newPoll.options.map((option, index) => (
                                    <input
                                        key={index}
                                        type="text"
                                        placeholder={`Option ${index + 1}`}
                                        className="option-input"
                                        value={option}
                                        onChange={(e) => handleOptionChange(index, e.target.value)}
                                        required
                                    />
                                ))}
                                <button type="button" className="add-option-btn" onClick={handleAddOption}>
                                    <Plus size={16} /> Add Option
                                </button>
                            </div>

                            <div className="form-group">
                                <label>End Date</label>
                                <input
                                    type="date"
                                    value={newPoll.endDate}
                                    onChange={(e) => setNewPoll({ ...newPoll, endDate: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Create Poll
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OnlineVoting;

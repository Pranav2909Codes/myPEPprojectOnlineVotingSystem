import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, ChevronRight, X, Clock, Calendar } from 'lucide-react';
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

    useEffect(() => {
        fetchPolls();
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
            if (res.ok) {
                setShowVoteModal(false);
                fetchPolls();
            }
        } catch (err) {
            console.error('Error voting:', err);
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
                        <input type="text" placeholder="Search polls..." />
                    </div>
                    {isAdmin && (
                        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                            <Plus size={18} />
                            Create Poll
                        </button>
                    )}
                </div>
            </div>

            <div className="voting-filters">
                <div className="filter-chips">
                    <button className="chip active">All Polls</button>
                    <button className="chip">Active</button>
                    <button className="chip">Completed</button>
                    <button className="chip">My Polls</button>
                </div>
                <button className="filter-btn glass">
                    <Filter size={18} />
                    <span>Filters</span>
                </button>
            </div>

            {loading ? (
                <div className="loading-state">Loading polls...</div>
            ) : (
                <div className="polls-grid">
                    {polls.map((poll) => (
                        <div key={poll._id} className="poll-card glass">
                            <div className="poll-status-row">
                                <span className={`status-badge ${poll.status}`}>
                                    {poll.status}
                                </span>
                                <span className="end-date">
                                    <Clock size={14} />
                                    Ends: {new Date(poll.endDate).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="poll-content">
                                <h3>{poll.title}</h3>
                                <p>{poll.description}</p>

                                <div className="poll-options-preview">
                                    {poll.options.map((opt, idx) => (
                                        <div key={opt._id} className="preview-option">
                                            <span className="opt-text">{opt.text}</span>
                                            <span className="opt-votes">{opt.votes} votes</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="poll-footer">
                                <span className="vote-count">{poll.options.reduce((a, b) => a + b.votes, 0)} total votes</span>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setSelectedPoll(poll);
                                        setShowVoteModal(true);
                                    }}
                                >
                                    {poll.status === 'active' ? 'Vote Now' : 'View Results'}
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {polls.length === 0 && <div className="empty-state">No polls found.</div>}
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
                            {selectedPoll.options.map((option) => (
                                <div
                                    key={option._id}
                                    className={`vote-option-btn glass ${selectedOption === option._id ? 'selected' : ''}`}
                                    onClick={() => setSelectedOption(option._id)}
                                >
                                    <span>{option.text}</span>
                                    {selectedOption === option._id && <div className="check-mark">✓</div>}
                                </div>
                            ))}
                            <div className="modal-actions">
                                <button className="btn btn-secondary" onClick={() => setShowVoteModal(false)}>
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleVote}
                                    disabled={!selectedOption}
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

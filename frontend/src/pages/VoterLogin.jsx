import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Vote } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const VoterLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await login(email, password);

            if (result.success) {
                // After a successful voter login, go straight to the ballot
                navigate('/polls');
            } else {
                setError(result.message || 'Failed to login');
            }
        } catch (err) {
            setError('An unexpected error occurred.');
            console.error('Voter login error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card glass">
                <div className="auth-header">
                    <div className="auth-header-icon">
                        <Vote size={28} />
                    </div>
                    <h1>Voter Login</h1>
                    <p>Sign in to access your secure online ballot</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    {error && <div className="auth-error">{error}</div>}
                    <div className="input-group">
                        <label htmlFor="email">Email Address</label>
                        <div className="input-wrapper">
                            <Mail size={18} className="input-icon" />
                            <input
                                type="email"
                                id="email"
                                placeholder="voter@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <div className="input-wrapper">
                            <Lock size={18} className="input-icon" />
                            <input
                                type="password"
                                id="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
                        <span>{loading ? 'Logging in...' : 'Go to Ballot'}</span>
                        {!loading && <ArrowRight size={20} />}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Need an account? <Link to="/register">Register as a voter</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VoterLogin;


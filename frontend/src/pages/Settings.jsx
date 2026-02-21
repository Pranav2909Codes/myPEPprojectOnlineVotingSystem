import React from 'react';
import { User, Lock, Bell, Moon, Shield, Save } from 'lucide-react';
import './Settings.css';

const Settings = () => {
    return (
        <div className="container settings-container">
            <div className="settings-header">
                <h1>Settings</h1>
                <p>Manage your account preferences and security settings.</p>
            </div>

            <div className="settings-layout">
                <aside className="settings-nav card">
                    <button className="settings-nav-item active">
                        <User size={18} />
                        Profile Settings
                    </button>
                    <button className="settings-nav-item">
                        <Lock size={18} />
                        Security & Password
                    </button>
                    <button className="settings-nav-item">
                        <Bell size={18} />
                        Notifications
                    </button>
                    <button className="settings-nav-item">
                        <Moon size={18} />
                        Appearance
                    </button>
                    <button className="settings-nav-item">
                        <Shield size={18} />
                        Data & Privacy
                    </button>
                </aside>

                <main className="settings-content">
                    <section className="settings-section card">
                        <h2>Public Profile</h2>
                        <div className="profile-edit">
                            <div className="avatar-large">
                                <User size={48} />
                                <button className="edit-avatar">Change</button>
                            </div>
                            <div className="profile-inputs">
                                <div className="input-group">
                                    <label>Full Name</label>
                                    <input type="text" defaultValue="John Doe" />
                                </div>
                                <div className="input-group">
                                    <label>Email Address</label>
                                    <input type="email" defaultValue="john.doe@example.com" />
                                </div>
                            </div>
                        </div>
                        <div className="input-group">
                            <label>Bio</label>
                            <textarea defaultValue="Software Engineer at TechCorp. Active voter." rows="3"></textarea>
                        </div>
                        <div className="section-footer">
                            <button className="btn btn-primary">
                                <Save size={18} />
                                Save Changes
                            </button>
                        </div>
                    </section>

                    <section className="settings-section card">
                        <h2>Security Configuration</h2>
                        <div className="security-item">
                            <div>
                                <h4>Two-Factor Authentication</h4>
                                <p>Add an extra layer of security to your account.</p>
                            </div>
                            <button className="btn btn-outline btn-sm">Enable</button>
                        </div>
                        <hr className="settings-divider" />
                        <div className="security-item">
                            <div>
                                <h4>Change Password</h4>
                                <p>Update your password regularly to stay secure.</p>
                            </div>
                            <button className="btn btn-outline btn-sm">Update</button>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
};

export default Settings;

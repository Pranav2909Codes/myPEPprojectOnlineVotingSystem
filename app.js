// Static Version - No Backend Needed
let currentUser = JSON.parse(localStorage.getItem('user')) || null;
let polls = JSON.parse(localStorage.getItem('polls')) || [
    {
        id: '1',
        title: 'Organization President 2026',
        description: 'Vote for the next president of the organization.',
        candidates: [
            { name: 'Alice Smith', votes: 42 },
            { name: 'Bob Johnson', votes: 38 }
        ]
    },
    {
        id: '2',
        title: 'New Office Location',
        description: 'Choose our next regional office location.',
        candidates: [
            { name: 'London', votes: 15 },
            { name: 'Tokyo', votes: 27 },
            { name: 'New York', votes: 12 }
        ]
    }
];

const app = document.getElementById('app');

const init = () => {
    if (currentUser) {
        showDashboard();
    } else {
        showLogin();
    }
};

const showLogin = () => {
    app.innerHTML = `
        <div class="auth-container">
            <h2>Online Voting</h2>
            <form id="loginForm">
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="email" required placeholder="admin@vote.com">
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" id="password" required placeholder="••••••••">
                </div>
                <button type="submit">Log In</button>
            </form>
            <div class="toggle-links">
                Don't have an account? <span onclick="showRegister()">Register</span>
            </div>
            <p style="margin-top: 1rem; font-size: 0.8rem; color: #666; text-align: center;">
                Hint: Any login works in this demo.
            </p>
        </div>
    `;
    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        currentUser = { name: 'Demo User', role: 'admin' };
        localStorage.setItem('user', JSON.stringify(currentUser));
        showDashboard();
    });
};

const showRegister = () => {
    app.innerHTML = `
        <div class="auth-container">
            <h2>Register</h2>
            <form id="registerForm">
                <div class="form-group">
                    <label>Full Name</label>
                    <input type="text" id="name" required placeholder="John Doe">
                </div>
                <div class="form-group">
                    <label>Government ID</label>
                    <input type="text" id="id" required placeholder="Aadhaar / Voter ID">
                </div>
                <button type="submit">Create Account</button>
                <button type="button" class="secondary-btn" style="margin-top: 1rem;" onclick="showLogin()">Back to Login</button>
            </form>
        </div>
    `;
    document.getElementById('registerForm').addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Registered! (Demo Mode)');
        showLogin();
    });
};

const showDashboard = () => {
    app.innerHTML = `
        <div class="nav">
            <h1 style="font-size: 1.75rem;">Voting Dashboard</h1>
            <div style="display: flex; gap: 1rem; align-items: center;">
                <span class="text-dim">Hello, ${currentUser.name}</span>
                <button onclick="logout()" style="width: auto; padding: 0.5rem 1rem;">Logout</button>
            </div>
        </div>

        <div class="dashboard-grid" id="pollsContainer"></div>

        ${currentUser.role === 'admin' ? `
            <div class="auth-container" style="margin-top: 4rem; max-width: 600px;">
                <h2 style="font-size: 1.5rem;">Create New Poll</h2>
                <form id="createPollForm">
                    <div class="form-group">
                        <label>Poll Title</label>
                        <input type="text" id="pollTitle" placeholder="e.g. Best Feature" required>
                    </div>
                    <div class="form-group">
                        <label>Candidates (Separated by commas)</label>
                        <input type="text" id="pollCandidates" placeholder="Opt A, Opt B" required>
                    </div>
                    <button type="submit">Publish Poll</button>
                </form>
            </div>
        ` : ''}
    `;

    renderPolls();
    if (currentUser.role === 'admin') {
        document.getElementById('createPollForm').addEventListener('submit', handleCreatePoll);
    }
};

const renderPolls = () => {
    const container = document.getElementById('pollsContainer');
    container.innerHTML = polls.map(poll => `
        <div class="poll-card">
            <div style="display: flex; justify-content: space-between;">
                <h3>${poll.title}</h3>
                ${currentUser.role === 'admin' ? `<span style="cursor:pointer; color:var(--error);" onclick="deletePoll('${poll.id}')">×</span>` : ''}
            </div>
            <p class="text-dim">${poll.description}</p>
            <div class="candidate-list">
                ${poll.candidates.map(c => `
                    <div class="candidate-item">
                        <span>${c.name}</span>
                        <div style="display: flex; gap: 1rem; align-items: center;">
                            <span class="vote-count">${c.votes}</span>
                            <button onclick="castVote('${poll.id}', '${c.name}')" style="width: auto; padding: 0.4rem 0.8rem; font-size: 0.8rem;">Vote</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
};

const handleCreatePoll = (e) => {
    e.preventDefault();
    const title = document.getElementById('pollTitle').value;
    const candidatesText = document.getElementById('pollCandidates').value;
    const candidates = candidatesText.split(',').map(name => ({ name: name.trim(), votes: 0 }));

    const newPoll = {
        id: Date.now().toString(),
        title,
        description: 'New poll created by admin.',
        candidates
    };

    polls.push(newPoll);
    saveState();
    renderPolls();
    e.target.reset();
};

const castVote = (pollId, candidateName) => {
    const boothId = prompt("Enter Booth ID (Identity Verification):", "BOOTH-123");
    if (!boothId) return;

    const poll = polls.find(p => p.id === pollId);
    if (poll) {
        const candidate = poll.candidates.find(c => c.name === candidateName);
        if (candidate) {
            candidate.votes++;
            saveState();
            renderPolls();
            alert(`Vote cast for ${candidateName} at ${boothId}!`);
        }
    }
};

const deletePoll = (id) => {
    polls = polls.filter(p => p.id !== id);
    saveState();
    renderPolls();
};

const saveState = () => {
    localStorage.setItem('polls', JSON.stringify(polls));
};

const logout = () => {
    localStorage.removeItem('user');
    currentUser = null;
    showLogin();
};

init();

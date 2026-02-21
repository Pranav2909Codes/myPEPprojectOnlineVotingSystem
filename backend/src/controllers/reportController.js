import Poll from '../models/Poll.js';
import User from '../models/User.js';

// @desc    Get voting summary for all polls
// @route   GET /api/reports/summary
// @access  Private/Admin
const getVotingSummary = async (req, res) => {
    try {
        const totalPolls = await Poll.countDocuments();
        const activePolls = await Poll.countDocuments({ status: 'active' });
        const totalUsers = await User.countDocuments({ role: 'user' });

        const polls = await Poll.find({}).select('title options status');

        let totalVotes = 0;
        const pollStats = polls.map(poll => {
            const pollVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
            totalVotes += pollVotes;
            return {
                id: poll._id,
                title: poll.title,
                status: poll.status,
                totalVotes: pollVotes,
            };
        });

        res.json({
            totalPolls,
            activePolls,
            totalUsers,
            totalVotes,
            pollStats,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get live feed of recent poll creation
// @route   GET /api/reports/feed
// @access  Private
const getPollFeed = async (req, res) => {
    try {
        const recentPolls = await Poll.find({})
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('createdBy', 'name');

        res.json(recentPolls);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { getVotingSummary, getPollFeed };

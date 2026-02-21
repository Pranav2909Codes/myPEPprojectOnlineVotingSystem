import Poll from '../models/Poll.js';

// @desc    Create a new poll
// @route   POST /api/online
// @access  Private/Admin
const createPoll = async (req, res) => {
    const { title, description, options, endDate } = req.body;

    const poll = new Poll({
        title,
        description,
        options: options.map(opt => ({ text: opt })),
        createdBy: req.user._id,
        endDate,
    });

    const createdPoll = await poll.save();
    res.status(201).json(createdPoll);
};

// @desc    Get all polls
// @route   GET /api/online
// @access  Private
const getPolls = async (req, res) => {
    const polls = await Poll.find({}).populate('createdBy', 'name');
    res.json(polls);
};

// @desc    Get poll by ID
// @route   GET /api/online/:id
// @access  Private
const getPollById = async (req, res) => {
    const poll = await Poll.findById(req.params.id).populate('createdBy', 'name');

    if (poll) {
        res.json(poll);
    } else {
        res.status(404).json({ message: 'Poll not found' });
    }
};

// @desc    Update a poll
// @route   PUT /api/online/:id
// @access  Private/Admin
const updatePoll = async (req, res) => {
    const { title, description, status, endDate } = req.body;

    const poll = await Poll.findById(req.params.id);

    if (poll) {
        poll.title = title || poll.title;
        poll.description = description || poll.description;
        poll.status = status || poll.status;
        poll.endDate = endDate || poll.endDate;

        const updatedPoll = await poll.save();
        res.json(updatedPoll);
    } else {
        res.status(404).json({ message: 'Poll not found' });
    }
};

// @desc    Delete a poll
// @route   DELETE /api/online/:id
// @access  Private/Admin
const deletePoll = async (req, res) => {
    const poll = await Poll.findById(req.params.id);

    if (poll) {
        await poll.deleteOne();
        res.json({ message: 'Poll removed' });
    } else {
        res.status(404).json({ message: 'Poll not found' });
    }
};

// @desc    Vote in a poll
// @route   POST /api/online/:id/vote
// @access  Private
const voteInPoll = async (req, res) => {
    const { optionId } = req.body;

    const poll = await Poll.findById(req.params.id);

    if (poll) {
        if (poll.status === 'closed' || new Date() > new Date(poll.endDate)) {
            return res.status(400).json({ message: 'Poll is closed' });
        }

        const option = poll.options.id(optionId);
        if (option) {
            option.votes += 1;
            await poll.save();
            res.json({ message: 'Vote registered' });
        } else {
            res.status(404).json({ message: 'Option not found' });
        }
    } else {
        res.status(404).json({ message: 'Poll not found' });
    }
};

export { createPoll, getPolls, getPollById, updatePoll, deletePoll, voteInPoll };

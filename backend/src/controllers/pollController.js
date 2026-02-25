import Poll from '../models/Poll.js';


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


const getPolls = async (req, res) => {
    const polls = await Poll.find({}).populate('createdBy', 'name');

    // Enrich polls with a flag indicating if the current user has already voted
    const userId = req.user?._id?.toString();
    const enriched = userId
        ? polls.map((poll) => {
              const doc = poll.toObject();
              const hasVoted =
                  Array.isArray(doc.votedBy) &&
                  doc.votedBy.some((voterId) => voterId.toString() === userId);
              return { ...doc, hasVoted };
          })
        : polls;

    res.json(enriched);
};


const getPollById = async (req, res) => {
    const poll = await Poll.findById(req.params.id).populate('createdBy', 'name');

    if (poll) {
        res.json(poll);
    } else {
        res.status(404).json({ message: 'Poll not found' });
    }
};


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


const deletePoll = async (req, res) => {
    const poll = await Poll.findById(req.params.id);

    if (poll) {
        await poll.deleteOne();
        res.json({ message: 'Poll removed' });
    } else {
        res.status(404).json({ message: 'Poll not found' });
    }
};


const voteInPoll = async (req, res) => {
    const { optionId } = req.body;

    const poll = await Poll.findById(req.params.id);

    if (!poll) {
        return res.status(404).json({ message: 'Poll not found' });
    }

    // Prevent voting on closed/expired polls
    if (poll.status === 'closed' || new Date() > new Date(poll.endDate)) {
        return res.status(400).json({ message: 'Poll is closed' });
    }

    // Enforce one-vote-per-user
    const userId = req.user._id.toString();
    const alreadyVoted =
        Array.isArray(poll.votedBy) &&
        poll.votedBy.some((voterId) => voterId.toString() === userId);

    if (alreadyVoted) {
        return res.status(400).json({ message: 'You have already voted in this poll' });
    }

    const option = poll.options.id(optionId);
    if (!option) {
        return res.status(404).json({ message: 'Option not found' });
    }

    option.votes += 1;
    poll.votedBy = poll.votedBy || [];
    poll.votedBy.push(req.user._id);

    await poll.save();
    res.json({ message: 'Vote registered' });
};

export { createPoll, getPolls, getPollById, updatePoll, deletePoll, voteInPoll };

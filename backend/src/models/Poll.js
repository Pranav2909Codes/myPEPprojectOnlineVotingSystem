import mongoose from 'mongoose';

const optionSchema = mongoose.Schema({
    text: { type: String, required: true },
    votes: { type: Number, default: 0 },
});

const pollSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        options: [optionSchema],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        status: {
            type: String,
            required: true,
            enum: ['active', 'closed'],
            default: 'active',
        },
        endDate: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Poll = mongoose.model('Poll', pollSchema);

export default Poll;

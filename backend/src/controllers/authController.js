import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// In-memory dev user store (only used when DB not connected)
const devUsers = new Map();
let devIdCounter = 1;


const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (mongoose.connection.readyState !== 1) {
            // Dev fallback: register in-memory
            if (devUsers.has(email)) {
                return res.status(400).json({ message: 'User already exists (dev)' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(password, salt);
            const id = `dev-${devIdCounter++}`;
            const user = {
                _id: id,
                name,
                email,
                password: hashed,
                role: role || 'user',
            };
            devUsers.set(email, user);
            return res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'user',
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('registerUser error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

const authUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (mongoose.connection.readyState !== 1) {
            // Dev fallback: authenticate from in-memory store
            const user = devUsers.get(email);
            if (user && (await bcrypt.compare(password, user.password))) {
                return res.json({
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    token: generateToken(user._id),
                });
            }
            return res.status(401).json({ message: 'Invalid email or password (dev)' });
        }

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('authUser error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};


const getUsers = async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            // return dev users
            const arr = Array.from(devUsers.values()).map(u => ({ _id: u._id, name: u.name, email: u.email, role: u.role }));
            return res.json(arr);
        }
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        console.error('getUsers error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};


const deleteUser = async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            // dev fallback delete
            const targetEmail = Array.from(devUsers.values()).find(u => u._id === req.params.id)?.email;
            if (!targetEmail) return res.status(404).json({ message: 'User not found (dev)' });
            const user = devUsers.get(targetEmail);
            if (user.role === 'admin') return res.status(400).json({ message: 'Cannot delete admin user' });
            devUsers.delete(targetEmail);
            return res.json({ message: 'User removed (dev)' });
        }

        const user = await User.findById(req.params.id);

        if (user) {
            if (user.role === 'admin') {
                res.status(400).json({ message: 'Cannot delete admin user' });
                return;
            }
            await user.deleteOne();
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('deleteUser error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

export { registerUser, authUser, getUsers, deleteUser };

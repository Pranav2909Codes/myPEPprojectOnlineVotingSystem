import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const secret = process.env.JWT_SECRET || 'dev-secret';
            const decoded = jwt.verify(token, secret);

            // Only check DB if connected
            if (mongoose.connection.readyState === 1) {
                req.user = await User.findById(decoded.id).select('-password');
            } else {
                // Dev mode: store token payload in req.user
                req.user = { _id: decoded.id };
            }

            next();
        } catch (error) {
            console.error('Auth error:', error.message);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};

export { protect, admin };

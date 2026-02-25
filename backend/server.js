// import express from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import connectDB from './src/config/db.js';
// import authRoutes from './src/routes/authRoutes.js';
// import pollRoutes from './src/routes/pollRoutes.js';
// import reportRoutes from './src/routes/reportRoutes.js';

// dotenv.config();

// connectDB();

// const app = express();
// const PORT = process.env.PORT || 5001;

// app.use(cors());
// app.use(express.json());

// app.use('/api/auth', authRoutes);
// app.use('/api/online', pollRoutes);
// app.use('/api/reports', reportRoutes);



// app.get('/', (req, res) => {
//     res.json({ message: 'Voting System API is running' });
// });

// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';
import authRoutes from './src/routes/authRoutes.js';
import pollRoutes from './src/routes/pollRoutes.js';
import reportRoutes from './src/routes/reportRoutes.js';

dotenv.config();

connectDB();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/online', pollRoutes);
app.use('/api/reports', reportRoutes);


app.get('/', (req, res) => {
    res.json({ message: 'Voting System API is running' });
});

// 404 handler for API routes
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// JSON error handler
app.use((err, req, res, next) => {
    const status = err.status || 500;
    console.error('API error:', err);
    res.status(status).json({ message: err.message || 'Server Error' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
import express from 'express';
import { login, resetPassword } from '../controllers/authentication.js';
import { User } from '../models/User.js';

const router = express.Router();

// Debug middleware for auth routes
router.use((req, res, next) => {
    console.log('Auth Route:', req.method, req.url);
    next();
});

// Login route
router.post('/login', login);

// Reset password route
router.post('/reset-password', resetPassword);

// Debug route to get all users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({}, { password: 0 }); // Exclude passwords
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
});

export default router;
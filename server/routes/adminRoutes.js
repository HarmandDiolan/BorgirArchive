import express from 'express'
import { addUser, login, getUsers } from '../controllers/adminController.js';
import { verifyToken, isAdmin } from '../utils/authMiddleware.js';
import mongoose from 'mongoose';

const router = express.Router();

// Debug middleware for admin routes
router.use((req, res, next) => {
    console.log('Admin Route:', req.method, req.url);
    console.log('Headers:', req.headers);
    next();
});

// Error handling middleware for admin routes
router.use((err, req, res, next) => {
    console.error('Admin route error:', err);
    res.status(500).json({ 
        message: 'Internal server error in admin route',
        error: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// Public admin login route (no auth required)
router.post('/login', login);

// Protected admin routes
router.get('/users', verifyToken, isAdmin, async (req, res, next) => {
    try {
        // Check MongoDB connection
        if (mongoose.connection.readyState !== 1) {
            throw new Error('Database connection not ready');
        }
        
        console.log('Fetching users...');
        const users = await getUsers(req, res);
        console.log('Users fetched successfully');
        
        if (!res.headersSent) {
            res.json(users);
        }
    } catch (error) {
        console.error('Error in /users route:', error);
        next(error);
    }
});

router.post('/add-user', verifyToken, isAdmin, async (req, res, next) => {
    try {
        // Check MongoDB connection
        if (mongoose.connection.readyState !== 1) {
            throw new Error('Database connection not ready');
        }
        
        await addUser(req, res);
    } catch (error) {
        console.error('Error in /add-user route:', error);
        next(error);
    }
});

export default router;
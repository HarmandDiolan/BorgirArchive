import express from 'express'
import { addUser, login, getUsers } from '../controllers/adminController.js';
import { verifyToken, isAdmin } from '../utils/authMiddleware.js';

const router = express.Router();

// Debug middleware for admin routes
router.use((req, res, next) => {
    console.log('Admin Route:', req.method, req.url);
    console.log('Headers:', req.headers);
    next();
});

// Public admin login route (no auth required)
router.post('/login', login);

// Protected admin routes - verify token first, then check admin role
router.use('/users', verifyToken, isAdmin);
router.use('/add-user', verifyToken, isAdmin);

// Protected routes
router.get('/users', getUsers);
router.post('/add-user', addUser);

export default router;
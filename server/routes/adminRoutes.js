import express from 'express'
import { addUser, login, getUsers } from '../controllers/adminController.js';
import { verifyToken, isAdmin } from '../utils/authMiddleware.js';

const router = express.Router();

// Debug middleware for admin routes
router.use((req, res, next) => {
    console.log('Admin Route:', req.method, req.url);
    next();
});

// Public admin login route (no auth required)
router.post('/login', login);

// Protected admin routes
router.get('/users', verifyToken, isAdmin, getUsers);
router.post('/add-user', verifyToken, isAdmin, addUser);

export default router;
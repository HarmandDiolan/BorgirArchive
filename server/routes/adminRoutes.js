import express from 'express'
import { addUser, login, getUsers } from '../controllers/adminController.js';
import { verifyToken, isAdmin } from '../utils/authMiddleware.js';

const router = express.Router();

// Public admin login route (no auth required)
router.post('/login', login);

// Protect all other admin routes with authentication and admin role check
router.use(verifyToken);
router.use(isAdmin);

// Admin routes
router.get('/users', getUsers);
router.post('/add-user', addUser);

export default router;
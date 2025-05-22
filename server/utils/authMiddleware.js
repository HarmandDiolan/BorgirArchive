import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwt.js';

export const verifyToken = (req, res, next) => {
    console.log('🔒 Verifying token...');
    console.log('Authorization header:', req.headers.authorization);
    
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        console.log('❌ No authorization header');
        return res.status(401).json({ message: 'No authorization header' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        console.log('❌ No token provided');
        return res.status(401).json({ message: 'No token provided' });
    }

    console.log('Token:', token);
    console.log('JWT Secret:', JWT_SECRET);

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('Decoded token:', decoded);

        // Handle both userId and _id fields
        const userId = decoded.userId;
        if (!userId) {
            console.log('❌ No user ID in token');
            return res.status(401).json({ message: 'Invalid token: No user ID' });
        }

        // Set user object with consistent field names
        req.user = {
            userId: userId,
            username: decoded.username,
            role: decoded.role
        };
        
        console.log('User object set in request:', req.user);
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(401).json({ message: 'Invalid token' });
    }
};

export const isAdmin = (req, res, next) => {
    console.log('🔒 Checking admin role...');
    console.log('User from token:', req.user);
    
    if (!req.user) {
        console.log('❌ No user in request');
        return res.status(401).json({ message: 'No user in request' });
    }

    if (req.user.role !== 'admin') {
        console.log('❌ User is not admin');
        return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    console.log('✅ Admin access granted');
    next();
};

export const isUser = (req, res, next) => {
    if (req.user && (req.user.role === 'user' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. User role required.' });
    }
}; 
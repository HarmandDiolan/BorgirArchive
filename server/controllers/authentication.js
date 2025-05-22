import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { JWT_SECRET } from '../config/jwt.js';

export const resetPassword = async (req, res) => {
    try {
        const { username, newPassword } = req.body;

        console.log('Password reset attempt for username:', username);
        
        // Find user
        const user = await User.findOne({ username });
        if (!user) {
            console.log('❌ User not found for password reset');
            return res.status(404).json({ message: 'User not found' });
        }

        // Set the new password directly - the pre-save middleware will hash it
        user.password = newPassword;
        await user.save();

        console.log('✅ Password reset successful');
        res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ message: 'Error resetting password' });
    }
};

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log('Login attempt for username:', username);

        // Check if it's admin login
        if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
            console.log('✅ Admin login success');
            
            // Create admin JWT token
            const token = jwt.sign(
                { 
                    userId: 'admin',
                    username: process.env.ADMIN_USERNAME,
                    role: 'admin'
                },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            return res.status(200).json({
                message: 'Admin login successfully',
                token,
                user: {
                    userId: 'admin',
                    username: process.env.ADMIN_USERNAME,
                    role: 'admin'
                }
            });
        }

        // Regular user login from database
        console.log('Attempting to find user in database...');
        const user = await User.findOne({ username });
        
        if (!user) {
            console.log('❌ User not found in database');
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        console.log('User found, verifying password...');
        console.log('Stored hashed password:', user.password);
        console.log('Attempting to verify password...');
        console.log('Input password:', password);
        console.log('Stored hashed password type:', typeof user.password);
        console.log('Input password type:', typeof password);
        
        // Verify password
        if (!password || !user.password) {
            console.log('❌ Missing password data:', { 
                hasInputPassword: !!password, 
                hasStoredPassword: !!user.password 
            });
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        console.log('Password verification result:', isValidPassword);
        
        if (!isValidPassword) {
            console.log('❌ Invalid password');
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        console.log('✅ User login successful');
        // Create user JWT token
        const token = jwt.sign(
            { 
                userId: user._id,
                username: user.username,
                role: user.role || 'user'
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Send response with user role and token
        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                userId: user._id,
                username: user.username,
                email: user.email,
                role: user.role || 'user'
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

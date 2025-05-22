import { sendPasswordEmail } from "../utils/sendEmail.js";
import { User } from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwt.js';
import mongoose from 'mongoose';

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (
            username === process.env.ADMIN_USERNAME &&
            password === process.env.ADMIN_PASSWORD
        ) {
            console.log('✅ Admin login success');
            
            // Create JWT token for admin
            const token = jwt.sign(
                { 
                    userId: 'admin',
                    username: process.env.ADMIN_USERNAME,
                    role: 'admin'
                },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            return res.json({
                message: 'Admin login successfully',
                token,
                user: {
                    userId: 'admin',
                    username: process.env.ADMIN_USERNAME,
                    role: 'admin'
                }
            });
        }

        console.log('❌ Invalid admin credentials');
        return res.status(401).json({ message: 'Invalid Credentials' });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error during login' });
    }
};

function generateRandomPassword(length = 8) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for(let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

const getUsers = async (req, res) => {
    try {
        console.log('Fetching all users...');
        
        // Ensure MongoDB connection
        if (mongoose.connection.readyState !== 1) {
            throw new Error('Database connection not ready');
        }

        const users = await User.find({}, { password: 0 }).lean();
        console.log(`Found ${users.length} users`);
        
        return users;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

const addUser = async (req, res) => {
    try {
        const { username, email } = req.body;

        if (!username || !email) {
            return res.status(400).json({ message: 'Username and email are required' });
        }

        // Ensure MongoDB connection
        if (mongoose.connection.readyState !== 1) {
            throw new Error('Database connection not ready');
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists with this email' });
        }

        const rawPassword = generateRandomPassword();

        const newUser = new User({
            username,
            email,
            password: rawPassword,
            role: 'user',
        });

        await newUser.save();

        try {
            await sendPasswordEmail(email, username, rawPassword);
        } catch (emailError) {
            console.error('Error sending email:', emailError);
            // Don't fail the request if email fails
        }

        res.status(201).json({ message: 'User created and password sent via email.' });
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};

export { login, addUser, getUsers };

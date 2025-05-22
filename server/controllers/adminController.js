import { sendPasswordEmail } from "../utils/sendEmail.js";
import { User } from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwt.js';
import { connectToDatabase, checkConnection } from '../utils/db.js';

const login = async (req, res) => {
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
        console.log('🔍 Fetching all users...');
        console.log('Request user:', req.user);
        
        // Ensure database connection
        await connectToDatabase();
        
        if (!checkConnection()) {
            console.error('❌ MongoDB not connected');
            return res.status(500).json({ 
                message: 'Database connection error',
                details: 'Connection check failed'
            });
        }

        console.log('✅ Database connection verified, fetching users...');
        const users = await User.find({}, { password: 0 }).lean();
        console.log('✅ Found users:', users);
        
        if (!users) {
            console.log('⚠️ No users found');
            return res.json([]);
        }

        res.json(users);
    } catch (error) {
        console.error('❌ Error fetching users:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({ 
            message: 'Error fetching users',
            error: error.message,
            details: {
                name: error.name,
                code: error.code
            }
        });
    }
};

const addUser = async (req, res) => {
    try {
        const { username, email } = req.body;

        if (!username || !email) {
            return res.status(400).json({ message: 'Username and email are required' });
        }

        // Ensure database connection
        await connectToDatabase();
        
        if (!checkConnection()) {
            console.error('❌ MongoDB not connected');
            return res.status(500).json({ 
                message: 'Database connection error',
                details: 'Connection check failed'
            });
        }

        console.log('✅ Database connection verified, checking for existing user...');
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists with this email' });
        }

        const rawPassword = generateRandomPassword();

        const newUser = new User({
            username,
            email,
            password: rawPassword, // The pre-save middleware will hash this
            role: 'user',
        });

        console.log('✅ Creating new user...');
        await newUser.save();

        console.log('✅ Sending password email...');
        await sendPasswordEmail(email, username, rawPassword);

        res.status(201).json({ message: 'User created and password sent via email.' });
    } catch (error) {
        console.error('❌ Error creating user:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({ 
            message: 'Error creating new user',
            error: error.message,
            details: {
                name: error.name,
                code: error.code
            }
        });
    }
};

export { login, addUser, getUsers };

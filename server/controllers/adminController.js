import { sendPasswordEmail } from "../utils/sendEmail.js";
import { User } from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwt.js';

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
        console.log('Fetching all users...');
        const users = await User.find({}, { password: 0 }); // Exclude passwords
        console.log('Found users:', users);
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
};

const addUser = async (req, res) => {
    try {
        const { username, email } = req.body;

        if (!username || !email) {
            return res.status(400).json({ message: 'Username and email are required' });
        }

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

        await newUser.save();

        await sendPasswordEmail(email, username, rawPassword);

        res.status(201).json({ message: 'User created and password sent via email.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating new user' });
    }
};

export { login, addUser, getUsers };

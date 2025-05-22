import jwt from 'jsonwebtoken';

// Set a default JWT secret if not in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'borgir_archive_default_secret_key_2024';

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'No authentication token, access denied' });
        }

        const verified = jwt.verify(token, JWT_SECRET);
        
        // Handle both userId and _id in the token payload
        if (verified.userId) {
            verified._id = verified.userId;
        }
        
        req.user = verified;
        next();
    } catch (err) {
        console.error('Token verification error:', err);
        res.status(401).json({ message: 'Token verification failed, authorization denied' });
    }
};

export default auth; 
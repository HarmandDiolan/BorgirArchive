import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

    const userSchema = new mongoose.Schema({
        username: { type: String, required: true,},
        email:    { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role:     { type: String, default: 'user' },
        });

        userSchema.pre('save', async function (next) {
        if (!this.isModified('password')) return next();

        try {
            this.password = await bcrypt.hash(this.password, 10);
            next();
        } catch (err) {
            next(err);
        }
    });

export const User = mongoose.model('User', userSchema);

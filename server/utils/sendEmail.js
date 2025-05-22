import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD);

    const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
    });

    export const sendPasswordEmail = async (to, username, password) => {
    const mailOptions = {
        from: `"Borgir Archive" <${process.env.EMAIL_USER}>`,
        to,
        subject: 'Account Password',
        html: `<p>Hello, ${username}</p>
        <p>Your temporary password is: <strong>${password}
        </strong></p><p>Please change it after logging in.</p>`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully to:', to);
    } catch (error) {
        console.error('Email sending failed:', error);
        throw error;
    }
    };



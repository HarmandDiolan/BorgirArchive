import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_URL = import.meta.env.VITE_API_URL || 'https://borgir-archive-backend.onrender.com';

const Index = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        try {
            // First try admin login
            try {
                const adminRes = await axios.post(`${API_URL}/api/admin/login`, {
                    username,
                    password,
                });

                // Store token and user data in localStorage
                localStorage.setItem('token', adminRes.data.token);
                localStorage.setItem('user', JSON.stringify(adminRes.data.user));

                setMessage(adminRes.data.message);
                setError('');

                if (adminRes.data.user.role === 'admin') {
                    navigate('/admin');
                    return;
                }
            } catch (adminError) {
                // If admin login fails, try user login
                const userRes = await axios.post(`${API_URL}/api/auth/login`, {
                    username,
                    password,
                });

                // Store token and user data in localStorage
                localStorage.setItem('token', userRes.data.token);
                localStorage.setItem('user', JSON.stringify(userRes.data.user));

                setMessage(userRes.data.message);
                setError('');

                if (userRes.data.user.role === 'user') {
                    navigate('/user-dashboard');
                    return;
                }
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
            setMessage('');
        }
    };

    return (
        <div style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: '#f8f9fa'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '400px',
                padding: '20px',
                background: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                <h1 style={{ 
                    textAlign: 'center', 
                    marginBottom: '20px',
                    color: '#333'
                }}>Login</h1>
                
                {error && (
                    <div style={{ 
                        padding: '10px', 
                        backgroundColor: '#f8d7da', 
                        color: '#721c24',
                        borderRadius: '4px',
                        marginBottom: '20px'
                    }}>
                        {error}
                    </div>
                )}
                
                {message && (
                    <div style={{ 
                        padding: '10px', 
                        backgroundColor: '#d4edda', 
                        color: '#155724',
                        borderRadius: '4px',
                        marginBottom: '20px'
                    }}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '5px',
                            color: '#333'
                        }}>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px',
                                borderRadius: '4px',
                                border: '1px solid #ddd',
                                fontSize: '1em'
                            }}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '5px',
                            color: '#333'
                        }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px',
                                borderRadius: '4px',
                                border: '1px solid #ddd',
                                fontSize: '1em'
                            }}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        style={{
                            width: '100%',
                            padding: '10px',
                            background: '#61dafb',
                            color: '#000',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '1em'
                        }}
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Index;

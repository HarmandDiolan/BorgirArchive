import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';  // <-- import useNavigate
import 'bootstrap/dist/css/bootstrap.min.css';

const Index = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate(); // <-- initialize navigate

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            // First try admin login
            try {
                const adminRes = await axios.post('http://localhost:8000/api/admin/login', {
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
                const userRes = await axios.post('http://localhost:8000/api/auth/login', {
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
            setError(err.response?.data?.message || 'Login failed');
            setMessage('');
        }
    };

    return (
        <div
        className="d-flex flex-column min-vh-100"
        style={{
            fontFamily:
            "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen",
            color: '#212529',
        }}
        >
        {/* Header */}
        <header
            className="d-flex justify-content-between align-items-center px-5 py-4 fixed-top"
            style={{
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'saturate(180%) blur(20px)',
            boxShadow: '0 2px 12px rgb(0 0 0 / 0.1)',
            zIndex: 10,
            }}
        >
            <h1 className="h4 fw-bold m-0" style={{ color: '#0d6efd' }}>
            Borgir Archive
            </h1>
        </header>

        {/* Main - Centered Login Card with Inputs */}
        <main
            className="flex-grow-1 d-flex justify-content-center align-items-center"
            style={{ paddingTop: '120px' }}
        >
            <div
            className="card shadow p-5 rounded-4 text-center"
            style={{ minWidth: '320px', maxWidth: '400px' }}
            >
            <h2 className="mb-4 fw-bold" style={{ color: '#0d6efd' }}>
                Welcome to Borgir Archive
            </h2>
            <form onSubmit={handleLogin}>
                <div className="mb-3 text-start">
                <label htmlFor="username" className="form-label fw-semibold">
                    Username
                </label>
                <input
                    type="text"
                    className="form-control"
                    id="username"
                    placeholder="Enter your username"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                </div>
                <div className="mb-4 text-start">
                <label htmlFor="password" className="form-label fw-semibold">
                    Password
                </label>
                <input
                    type="password"
                    className="form-control"
                    id="password"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                </div>

                {error && <div className="text-danger mb-3">{error}</div>}
                {message && <div className="text-success mb-3">{message}</div>}

                <button
                type="submit"
                className="btn btn-primary btn-lg rounded-pill px-5 fw-semibold"
                >
                Login
                </button>
            </form>
            </div>
        </main>
        </div>
    );
};

export default Index;

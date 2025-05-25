import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import axios from 'axios';

const API_URL = 'https://borgirarchive.onrender.com';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newUser, setNewUser] = useState({ username: '', email: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Check if user is authenticated and is admin
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));

        if (!token || !user || user.role !== 'admin') {
            navigate('/');
            return;
        }

        // Fetch users when component mounts
        fetchUsers();
    }, [navigate]);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/admin/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('Fetched users:', response.data);
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
            setError('Failed to fetch users');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    const openModal = () => setShowModal(true);

    const closeModal = () => {
        setShowModal(false);
        setNewUser({ username: '', email: '' });
        setError('');
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        setError('');

        if (!newUser.username || !newUser.email) {
            setError('Please enter both username and email.');
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/api/admin/add-user`, 
                { ...newUser },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Refresh the users list
            await fetchUsers();
            closeModal();
        } catch (error) {
            console.error('Error adding user:', error);
            setError(error.response?.data?.message || 'Failed to add user');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            name: 'Username',
            selector: row => row.username,
            sortable: true,
        },
        {
            name: 'Email',
            selector: row => row.email,
            sortable: true,
        },
        {
            name: 'Role',
            selector: row => row.role || 'user',
            sortable: true,
        }
    ];

    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            {/* Sidebar */}
            <nav
                style={{
                    width: '200px',
                    background: '#282c34',
                    color: 'white',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                }}
            >
                <div>
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Admin Panel</h1>
                    <button
                        style={{
                            background: '#61dafb',
                            color: '#000',
                            border: 'none',
                            padding: '10px',
                            width: '100%',
                            cursor: 'pointer',
                            textAlign: 'left',
                            marginBottom: '10px',
                        }}
                        onClick={openModal}
                    >
                        Add User
                    </button>
                </div>

                <button
                    style={{
                        background: '#e63946',
                        color: 'white',
                        border: 'none',
                        padding: '10px',
                        cursor: 'pointer',
                    }}
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </nav>

            {/* Main content */}
            <main style={{ flexGrow: 1, padding: '20px' }}>
                <h2>Manage Users</h2>
                
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

                <DataTable
                    columns={columns}
                    data={users}
                    pagination
                    highlightOnHover
                    pointerOnHover
                    responsive
                    progressPending={loading}
                    progressComponent={<div>Loading users...</div>}
                />

                {showModal && (
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        onClick={closeModal}
                    >
                        <div 
                            style={{
                                background: 'white',
                                padding: '20px',
                                borderRadius: '8px',
                                width: '400px',
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3>Add New User</h3>
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
                            <form onSubmit={handleAddUser}>
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px' }}>Username</label>
                                    <input
                                        type="text"
                                        value={newUser.username}
                                        onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '8px',
                                            borderRadius: '4px',
                                            border: '1px solid #ddd',
                                        }}
                                        required
                                    />
                                </div>

                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px' }}>Email</label>
                                    <input
                                        type="email"
                                        value={newUser.email}
                                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '8px',
                                            borderRadius: '4px',
                                            border: '1px solid #ddd',
                                        }}
                                        required
                                    />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        style={{
                                            background: '#61dafb',
                                            color: '#000',
                                            border: 'none',
                                            padding: '8px 16px',
                                            borderRadius: '4px',
                                            cursor: loading ? 'not-allowed' : 'pointer',
                                            opacity: loading ? 0.7 : 1,
                                        }}
                                    >
                                        {loading ? 'Adding...' : 'Add User'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        style={{
                                            background: '#e63946',
                                            color: 'white',
                                            border: 'none',
                                            padding: '8px 16px',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;

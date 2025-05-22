import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import axios from 'axios';

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
            const response = await axios.get('http://localhost:8000/api/admin/users', {
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
            const response = await axios.post('http://localhost:8000/api/admin/add-user', 
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
                        className="modal d-flex align-items-center justify-content-center"
                        style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
                        onClick={closeModal}
                    >
                        <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-content p-3">
                                <h5 className="modal-title mb-3">Add New User</h5>
                                {error && (
                                    <div className="alert alert-danger" role="alert">
                                        {error}
                                    </div>
                                )}
                                <form onSubmit={handleAddUser}>
                                    <div className="mb-3">
                                        <label htmlFor="username" className="form-label">Username</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="username"
                                            name="username"
                                            value={newUser.username}
                                            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="email" className="form-label">Email</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            id="email"
                                            name="email"
                                            value={newUser.email}
                                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="role" className="form-label">Role</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="role"
                                            name="role"
                                            value="user"
                                            readOnly
                                            disabled
                                        />
                                    </div>

                                    <div className="d-flex justify-content-between">
                                        <button type="submit" className="btn btn-success" disabled={loading}>
                                            {loading ? 'Adding...' : 'Add User'}
                                        </button>
                                        <button type="button" className="btn btn-danger" onClick={closeModal}>
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;

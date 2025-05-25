import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:8000';

const UserDashboard = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showResetModal, setShowResetModal] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [resetMessage, setResetMessage] = useState('');

    // Cloudinary upload states
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [videoUrl, setVideoUrl] = useState('');

    const [showTagInput, setShowTagInput] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [tags, setTags] = useState('');
    const [tagError, setTagError] = useState('');

    const [userVideos, setUserVideos] = useState([]);
    const [loadingVideos, setLoadingVideos] = useState(true);

    const [selectedTags, setSelectedTags] = useState([]);
    const [allTags, setAllTags] = useState([]);

    const navigate = useNavigate();

    // Cloudinary config
    const CLOUD_NAME = 'dk3wralha';
    const API_KEY = '768221497979577';
    const UPLOAD_PRESET = 'archive'; // Your Cloudinary upload preset name

    useEffect(() => {
        // Check if user is authenticated
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));

        if (!token || !user || user.role !== 'user') {
            navigate('/');
            return;
        }

        setUser(user);
        setLoading(false);
        fetchAllVideos();
    }, [navigate]);

    const fetchAllVideos = async () => {
        try {
            console.log('Fetching all videos...');
            const token = localStorage.getItem('token');
            console.log('Token being sent:', token);
            
            if (!token) {
                console.error('No token found in localStorage');
                setLoadingVideos(false);
                return;
            }

            const response = await axios.get(`http://localhost:8000/api/videos`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('Videos response:', response.data);
            setUserVideos(response.data);
            setAllTags(extractUniqueTags(response.data));
            setLoadingVideos(false);
        } catch (error) {
            console.error('Error fetching videos:', error.response?.data || error.message);
            setLoadingVideos(false);
            setError('Failed to fetch videos');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setResetMessage('');

        if (newPassword !== confirmPassword) {
            setResetMessage('Passwords do not match');
            return;
        }

        try {
            const response = await axios.post(`http://localhost:8000/api/auth/reset-password`, {
                username: user.username,
                newPassword: newPassword,
            });

            setResetMessage('Password reset successful!');
            setNewPassword('');
            setConfirmPassword('');
            setShowResetModal(false);
        } catch (error) {
            setResetMessage(error.response?.data?.message || 'Error resetting password');
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) {
            setUploadError('No file selected');
            return;
        }

        if (!file.type.startsWith('video/')) {
            setUploadError('Please select a video file');
            return;
        }

        setSelectedFile(file);
        setShowTagInput(true);
        setUploadError('');
    };

    const handleVideoUpload = async (e) => {
        e.preventDefault();
        setUploadError('');
        setTagError('');
        setUploading(true);

        if (!tags.trim()) {
            setTagError('Please enter at least one tag');
            setUploading(false);
            return;
        }

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('upload_preset', UPLOAD_PRESET);
            formData.append('cloud_name', CLOUD_NAME);
            formData.append('tags', tags);

            const res = await axios.post(
                `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        console.log(`Upload Progress: ${percentCompleted}%`);
                    }
                }
            );

            if (res.data.secure_url) {
                setVideoUrl(res.data.secure_url);
                try {
                    const token = localStorage.getItem('token');
                    await axios.post(`http://localhost:8000/api/videos`, {
                        url: res.data.secure_url,
                        title: selectedFile.name,
                        tags: tags.split(',').map(tag => tag.trim()),
                        publicId: res.data.public_id,
                        duration: res.data.duration,
                        format: res.data.format,
                        size: res.data.bytes
                    }, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    // Refresh the videos list after successful upload
                    fetchAllVideos();
                } catch (error) {
                    console.error('Error saving video to database:', error);
                    setUploadError('Error saving video to database. Please try again.');
                }
            }
            setUploading(false);
            setShowTagInput(false);
            setSelectedFile(null);
            setTags('');
        } catch (error) {
            console.error('Upload error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            setUploadError(
                error.response?.data?.error?.message || 
                error.message || 
                'Upload failed. Please try again.'
            );
            setUploading(false);
        }
    };

    // Add this function to extract unique tags from videos
    const extractUniqueTags = (videos) => {
        const tags = new Set();
        videos.forEach(video => {
            if (video.tags && Array.isArray(video.tags)) {
                video.tags.forEach(tag => tags.add(tag));
            }
        });
        return Array.from(tags);
    };

    // Add function to handle tag selection
    const handleTagClick = (tag) => {
        setSelectedTags(prev => {
            if (prev.includes(tag)) {
                return prev.filter(t => t !== tag);
            } else {
                return [...prev, tag];
            }
        });
    };

    // Add function to filter videos by selected tags
    const getFilteredVideos = () => {
        if (selectedTags.length === 0) return userVideos;
        return userVideos.filter(video => 
            video.tags && video.tags.some(tag => selectedTags.includes(tag))
        );
    };

    if (loading) return <p>Loading...</p>;

    if (error)
        return (
        <div>
            <p className="text-danger">{error}</p>
            <button onClick={handleLogout} className="btn btn-primary">
            Go to Login
            </button>
        </div>
        );

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
            <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
                {user.role === 'admin' ? 'Admin Dashboard' : 'User Dashboard'}
            </h1>
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
                onClick={() => setShowResetModal(true)}
            >
                Settings
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
            {/* Video Upload Section - Only show for users */}
            {user.role === 'user' && (
                <div style={{ marginBottom: '40px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                    <h2 style={{ color: '#333', marginBottom: '20px' }}>Upload a Video</h2>
                    <div style={{ 
                        border: '2px dashed #61dafb', 
                        padding: '20px', 
                        borderRadius: '8px',
                        textAlign: 'center',
                        marginBottom: '20px'
                    }}>
                        <input
                            type="file"
                            accept="video/*"
                            onChange={handleFileSelect}
                            disabled={uploading}
                            style={{ display: 'none' }}
                            id="video-upload"
                        />
                        <label 
                            htmlFor="video-upload"
                            style={{
                                display: 'block',
                                padding: '20px',
                                cursor: uploading ? 'not-allowed' : 'pointer',
                                backgroundColor: uploading ? '#e9ecef' : '#fff',
                                borderRadius: '4px'
                            }}
                        >
                            {selectedFile ? (
                                <div>
                                    <p style={{ margin: '0 0 10px 0' }}>Selected file: {selectedFile.name}</p>
                                    <p style={{ fontSize: '0.9em', color: '#666' }}>
                                        Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <p style={{ margin: '0 0 10px 0' }}>Click to select a video file</p>
                                    <p style={{ fontSize: '0.9em', color: '#666' }}>
                                        Supported formats: MP4, WebM, MOV
                                    </p>
                                </div>
                            )}
                        </label>
                    </div>

                    {uploading && (
                        <div style={{ 
                            padding: '15px', 
                            backgroundColor: '#e9ecef', 
                            borderRadius: '4px',
                            marginBottom: '20px'
                        }}>
                            <p style={{ margin: '0 0 10px 0' }}>Uploading video...</p>
                            <div style={{ 
                                width: '100%', 
                                height: '4px', 
                                backgroundColor: '#dee2e6',
                                borderRadius: '2px'
                            }}>
                                <div style={{ 
                                    width: '100%', 
                                    height: '100%', 
                                    backgroundColor: '#61dafb',
                                    borderRadius: '2px',
                                    transition: 'width 0.3s ease'
                                }}></div>
                            </div>
                        </div>
                    )}

                    {uploadError && (
                        <div style={{ 
                            padding: '15px', 
                            backgroundColor: '#f8d7da', 
                            color: '#721c24',
                            borderRadius: '4px',
                            marginBottom: '20px'
                        }}>
                            {uploadError}
                        </div>
                    )}
                    
                    {showTagInput && (
                        <div style={{ 
                            marginTop: '20px', 
                            padding: '20px', 
                            border: '1px solid #ddd', 
                            borderRadius: '8px',
                            backgroundColor: '#fff'
                        }}>
                            <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Add Tags</h3>
                            <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '15px' }}>
                                Enter tags separated by commas (e.g., nature, wildlife, documentary)
                            </p>
                            <input
                                type="text"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                placeholder="Enter tags..."
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    marginBottom: '15px',
                                    borderRadius: '4px',
                                    border: '1px solid #ddd',
                                    fontSize: '1em'
                                }}
                            />
                            {tagError && (
                                <p style={{ color: '#dc3545', marginBottom: '15px' }}>{tagError}</p>
                            )}
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={handleVideoUpload}
                                    disabled={uploading}
                                    style={{
                                        background: '#61dafb',
                                        color: '#000',
                                        border: 'none',
                                        padding: '10px 20px',
                                        borderRadius: '4px',
                                        cursor: uploading ? 'not-allowed' : 'pointer',
                                        opacity: uploading ? 0.7 : 1,
                                        flex: 1
                                    }}
                                >
                                    {uploading ? 'Uploading...' : 'Upload with Tags'}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowTagInput(false);
                                        setSelectedFile(null);
                                        setTags('');
                                    }}
                                    style={{
                                        background: '#e63946',
                                        color: 'white',
                                        border: 'none',
                                        padding: '10px 20px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        flex: 1
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Videos Section - Show for all roles */}
            <div>
                <h2>All Videos</h2>
                
                {/* Tag Cloud */}
                {!loadingVideos && allTags.length > 0 && (
                    <div style={{ 
                        marginBottom: '20px',
                        padding: '15px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px'
                    }}>
                        <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1em' }}>Filter by Tags:</h3>
                        <div style={{ 
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '10px'
                        }}>
                            {allTags.map((tag, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleTagClick(tag)}
                                    style={{
                                        padding: '6px 12px',
                                        borderRadius: '20px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        backgroundColor: selectedTags.includes(tag) ? '#61dafb' : '#e9ecef',
                                        color: selectedTags.includes(tag) ? '#000' : '#666',
                                        transition: 'all 0.2s ease',
                                        fontSize: '0.9em'
                                    }}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {loadingVideos ? (
                    <p>Loading videos...</p>
                ) : getFilteredVideos().length === 0 ? (
                    <div>
                        <p>No videos found.</p>
                        {selectedTags.length > 0 ? (
                            <p style={{ fontSize: '0.9em', color: '#666' }}>
                                Try selecting different tags or clear the filter.
                            </p>
                        ) : (
                            <p style={{ fontSize: '0.9em', color: '#666' }}>
                                {user.role === 'user' ? 'You can upload videos using the form above.' : 'Users can upload videos to this archive.'}
                            </p>
                        )}
                    </div>
                ) : (
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '20px',
                        marginTop: '20px'
                    }}>
                        {getFilteredVideos().map((video) => {
                            console.log('Rendering video:', video);
                            return (
                                <div key={video._id} style={{
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    padding: '15px',
                                    backgroundColor: '#fff'
                                }}>
                                    <video
                                        src={video.url}
                                        controls
                                        style={{
                                            width: '100%',
                                            borderRadius: '4px',
                                            marginBottom: '10px'
                                        }}
                                    />
                                    <h3 style={{ margin: '0 0 10px 0' }}>{video.title}</h3>
                                    <div style={{ marginBottom: '10px' }}>
                                        <strong>Tags:</strong>{' '}
                                        {video.tags && video.tags.map((tag, index) => (
                                            <span
                                                key={index}
                                                style={{
                                                    backgroundColor: '#e9ecef',
                                                    padding: '2px 8px',
                                                    borderRadius: '12px',
                                                    marginRight: '5px',
                                                    fontSize: '0.9em'
                                                }}
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <div style={{ fontSize: '0.9em', color: '#666' }}>
                                        <p>Uploaded by: {video.userId?.username || 'Unknown'}</p>
                                        <p>Uploaded: {new Date(video.createdAt).toLocaleDateString()}</p>
                                        <p>Duration: {Math.round(video.duration)} seconds</p>
                                        <p>Size: {(video.size / (1024 * 1024)).toFixed(2)} MB</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>

        {/* Reset Password Modal */}
        {showResetModal && (
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
            >
            <div
                style={{
                background: 'white',
                padding: '20px',
                borderRadius: '8px',
                width: '400px',
                }}
            >
                <h3>Reset Password</h3>
                {resetMessage && (
                <p style={{ color: resetMessage.includes('successful') ? 'green' : 'red' }}>
                    {resetMessage}
                </p>
                )}
                <form onSubmit={handleResetPassword}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>New Password</label>
                    <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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
                    <label style={{ display: 'block', marginBottom: '5px' }}>Confirm Password</label>
                    <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                    style={{
                        background: '#61dafb',
                        color: '#000',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                    >
                    Reset Password
                    </button>
                    <button
                    type="button"
                    onClick={() => {
                        setShowResetModal(false);
                        setResetMessage('');
                        setNewPassword('');
                        setConfirmPassword('');
                    }}
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
        </div>
    );
};

export default UserDashboard;

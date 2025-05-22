import Video from '../models/Video.js';

// Get all videos
export const getAllVideos = async (req, res) => {
    try {
        console.log('User from token:', req.user); // Debug log
        console.log('User ID:', req.user.userId); // Debug log
        
        const videos = await Video.find()
            .populate('userId', 'username')
            .sort({ createdAt: -1 });
            
        console.log('Found videos:', videos); // Debug log
        res.json(videos);
    } catch (error) {
        console.error('Error fetching videos:', error);
        res.status(500).json({ message: 'Error fetching videos' });
    }
};

// Get videos by user
export const getUserVideos = async (req, res) => {
    try {
        const userId = req.user.userId;
        console.log('Getting videos for user:', userId); // Debug log
        
        const videos = await Video.find({ userId })
            .populate('userId', 'username')
            .sort({ createdAt: -1 });
            
        console.log('Found user videos:', videos); // Debug log
        res.json(videos);
    } catch (error) {
        console.error('Error fetching user videos:', error);
        res.status(500).json({ message: 'Error fetching user videos' });
    }
};

// Save new video
export const saveVideo = async (req, res) => {
    try {
        const { url, title, tags, publicId, duration, format, size } = req.body;
        const userId = req.user.userId;
        console.log('Saving video for user:', userId); // Debug log

        const video = new Video({
            url,
            title,
            tags,
            publicId,
            userId,
            duration,
            format,
            size
        });

        await video.save();
        console.log('Video saved successfully:', video); // Debug log
        res.status(201).json(video);
    } catch (error) {
        console.error('Error saving video:', error);
        res.status(500).json({ message: 'Error saving video' });
    }
};

// Delete video
export const deleteVideo = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        
        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }

        const userId = req.user.userId;
        console.log('Deleting video for user:', userId); // Debug log
        
        // Check if user is the owner or admin
        if (video.userId.toString() !== userId.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this video' });
        }

        await video.remove();
        console.log('Video deleted successfully'); // Debug log
        res.json({ message: 'Video deleted successfully' });
    } catch (error) {
        console.error('Error deleting video:', error);
        res.status(500).json({ message: 'Error deleting video' });
    }
}; 
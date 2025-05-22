import express from 'express';
import { getAllVideos, getUserVideos, saveVideo, deleteVideo } from '../controllers/videoController.js';
import { verifyToken } from '../utils/authMiddleware.js';

const router = express.Router();

// All routes are protected with verifyToken middleware
router.use(verifyToken);

// Get all videos
router.get('/', getAllVideos);

// Get videos by user
router.get('/user/:userId', getUserVideos);

// Save new video
router.post('/', saveVideo);

// Delete video
router.delete('/:id', deleteVideo);

export default router; 
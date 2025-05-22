import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    publicId: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tags: [{
        type: String
    }],
    duration: {
        type: Number
    },
    format: {
        type: String
    },
    size: {
        type: Number
    }
}, {
    timestamps: true
});

export default mongoose.model('Video', videoSchema); 
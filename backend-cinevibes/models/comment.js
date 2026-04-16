const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    movieId: { type: String, required: true }, // The imdbID
    content: { type: String, required: true },
    category: {
        type: String,
        enum: ['normal', 'technical'],
        default: 'normal'
    },
    user: { type: String, default: 'Anonymous' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Comment', commentSchema);
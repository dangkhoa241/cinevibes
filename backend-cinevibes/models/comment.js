const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    movieId: { type: String, required: true },
    content: { type: String, required: true },
    category: {
        type: String,
        enum: ['normal', 'technical'],
        default: 'normal'
    },
    user: { type: String, default: 'Anonymous' }
}, {
    timestamps: true
});

module.exports = mongoose.model('Comment', commentSchema);
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    movieId: { type: String, required: true },
    content: { type: String, required: true },
    category: {
        type: String,
        enum: ['normal', 'technical'],
        default: 'normal'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.models.Comment || mongoose.model('Comment', commentSchema);
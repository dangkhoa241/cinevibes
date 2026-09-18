const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fromUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    comment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        required: true
    },
    movieId: { type: String, required: true },
    read: { type: Boolean, default: false }
}, {
    timestamps: true
});

module.exports = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

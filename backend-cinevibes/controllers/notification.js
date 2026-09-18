const Notification = require("../models/notification");

exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .populate('fromUser', 'username')
            .populate('comment', 'content');

        res.json(notifications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.markAllRead = async (req, res) => {
    try {
        await Notification.updateMany({ user: req.user.id, read: false }, { $set: { read: true } });
        res.status(204).end();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

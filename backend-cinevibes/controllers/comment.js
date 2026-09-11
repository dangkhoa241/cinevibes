const Comment = require("../models/comment");

exports.addComment = async (req, res) => {
    try {
        const { id } = req.params;

        const { content, category, isSpoiler } = req.body;

        const newComment = new Comment({
            movieId: id,
            content,
            category,
            isSpoiler: Boolean(isSpoiler),
            user: req.user.id
        });

        const savedComment = await newComment.save();
        const responseComment = savedComment.toObject();
        responseComment.user = { _id: req.user.id, username: req.user.username };

        res.status(201).json(responseComment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getComments = async (req, res) => {
    try {
        const { id } = req.params;
        const { category } = req.query;

        const comments = await Comment.find({
            movieId: id,
            category: category
        })
            .sort({ createdAt: -1, _id: -1 })
            .populate('user', 'username');

        res.json(comments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
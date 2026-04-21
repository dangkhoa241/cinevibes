const Comment = require("../models/comment");

exports.addComment = async (req, res) => {
    try {
        const { id } = req.params;

        const { content, category } = req.body;

        const newComment = new Comment({
            movieId: id,
            content,
            category,
            user: req.user.id
        });

        const savedComment = await newComment.save();
        res.status(201).json(savedComment);
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
        }).sort({ createdAt: 1 });

        res.json(comments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
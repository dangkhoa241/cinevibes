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

exports.toggleLike = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user.id;

        const comment = await Comment.findById(commentId);
        if (!comment) return res.status(404).json({ error: 'Comment not found' });

        const alreadyLiked = comment.likedBy.some((likerId) => likerId.toString() === userId);

        if (alreadyLiked) {
            comment.likedBy.pull(userId);
        } else {
            comment.likedBy.push(userId);
        }

        await comment.save();

        res.json({ likeCount: comment.likedBy.length, liked: !alreadyLiked });
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
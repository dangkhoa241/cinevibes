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
        responseComment.user = { id: req.user.id, username: req.user.username };

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

exports.updateComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { content, isSpoiler } = req.body;

        const comment = await Comment.findById(commentId);
        if (!comment) return res.status(404).json({ error: 'Comment not found' });
        if (!comment.user || comment.user.toString() !== req.user.id) {
            return res.status(403).json({ error: 'You can only edit your own comments' });
        }

        if (content !== undefined) comment.content = content;
        if (isSpoiler !== undefined) comment.isSpoiler = Boolean(isSpoiler);
        await comment.save();

        const responseComment = comment.toObject();
        responseComment.user = { id: req.user.id, username: req.user.username };
        res.json(responseComment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;

        const comment = await Comment.findById(commentId);
        if (!comment) return res.status(404).json({ error: 'Comment not found' });
        if (!comment.user || comment.user.toString() !== req.user.id) {
            return res.status(403).json({ error: 'You can only delete your own comments' });
        }

        await comment.deleteOne();
        res.status(204).end();
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
const Movie = require("../models/movie");
const Comment = require("../models/Comment");

// GET /api/movies/trending - For Rankings
exports.getTrending = async (req, res) => {
    try {
        const trending = await Movie.find()
            .sort({ discussionCount: -1 }) // Based on user comments [cite: 31]
            .limit(10);
        res.json(trending);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/movies/:id - For Movie Detail Page
exports.getMovieDetail = async (req, res) => {
    try {
        const movie = await Movie.findOne({ imdbID: req.params.id });
        if (!movie) return res.status(404).json({ message: "Movie not found" });
        res.json(movie);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addComment = async (req, res) => {
    try {
        const { movieId, content, category } = req.body;

        const newComment = new Comment({
            movieId,
            content,
            category
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
        const { category } = req.query; // Get 'normal' or 'technical' from URL

        const comments = await Comment.find({
            movieId: id,
            category: category
        }).sort({ createdAt: -1 }); // Newest first

        res.json(comments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
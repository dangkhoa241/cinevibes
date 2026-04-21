const Movie = require("../models/movie");

// GET /api/movies/trending - For Rankings
exports.getTrending = async (req, res) => {
    try {
        const page= parseInt(req.query.page) || 1;
        const limit= 10;
        const skip= (page - 1) * limit;
        const totalMovies = await Movie.countDocuments();

        const trending = await Movie.find()
            .sort({ discussionCount: -1, _id:1 }) // Based on user comments [cite: 31]
            .skip(skip)
            .limit(limit);

        res.json({movies: trending, totalMovies, page, limit});
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

const Movie = require("../models/movie");

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

exports.getMovieDetail = async (req, res) => {
    try {
        const movie = await Movie.findOne({ imdbID: req.params.id });
        if (!movie) return res.status(404).json({ message: "Movie not found" });
        res.json(movie);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.searchMovie = async (req, res) => {
    try {
        const { title, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const movies = await Movie.find({
            title: { $regex: title, $options: 'i' }
        })
            .limit(Number(limit))
            .skip(Number(skip));

        const totalMovies = await Movie.countDocuments({
            title: { $regex: title, $options: 'i' }
        });

        res.json({
            movies,
            totalMovies,
            page: Number(page),
            limit: Number(limit)
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
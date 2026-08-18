const Movie = require("../models/movie");

const SORT_OPTIONS = {
    trending: { discussionCount: -1, year: -1, _id: -1 },
    rating: { rating: -1, _id: 1 },
    year: { year: -1, _id: 1 },
};

const buildFilter = (base, { genre, year }) => {
    const filter = { ...base };
    if (genre) filter.genre = { $regex: genre, $options: 'i' };
    if (year) filter.year = { $regex: `^${year}` };
    return filter;
};

exports.getTrending = async (req, res) => {
    try {
        const page= parseInt(req.query.page) || 1;
        const limit= 10;
        const skip= (page - 1) * limit;
        const { genre, year, sort } = req.query;
        const filter = buildFilter({}, { genre, year });
        const sortOption = SORT_OPTIONS[sort] || SORT_OPTIONS.trending;

        const totalMovies = await Movie.countDocuments(filter);

        const trending = await Movie.find(filter)
            .sort(sortOption)
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
        const { title, page = 1, limit = 10, genre, year, sort } = req.query;
        const skip = (page - 1) * limit;
        const filter = buildFilter({ title: { $regex: title, $options: 'i' } }, { genre, year });
        const sortOption = SORT_OPTIONS[sort] || SORT_OPTIONS.trending;

        const movies = await Movie.find(filter)
            .sort(sortOption)
            .limit(Number(limit))
            .skip(Number(skip));

        const totalMovies = await Movie.countDocuments(filter);

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

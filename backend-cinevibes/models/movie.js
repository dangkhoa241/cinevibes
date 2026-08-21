const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
    imdbID: { type: String, unique: true, required: true },
    title: String,
    year: String,
    poster: String,
    plot: String,
    genre: String,
    rating: String,
    actors: String,   // Added for Character/Actor discussions
    director: String, // Added for Movie Detail Page
    discussionCount: { type: Number, default: 0 } // For Trending Rankings
});

module.exports = mongoose.models.Movie || mongoose.model("Movie", movieSchema);
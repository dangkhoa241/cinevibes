const axios = require("axios");
const Movie = require("../models/movie");

const API_KEY = process.env.OMDB_API_KEY;

const searchListAndGetIDs = async (keyword, year) => {
    const url = `http://www.omdbapi.com/?s=${keyword}&y=${year}&apikey=${API_KEY}`;
    const { data } = await axios.get(url);
    return data.Response === "True" ? data.Search.map(m => m.imdbID) : [];
};

const crawlAndStoreDetails = async (imdbID, forceSave = false) => {
    try {
        const { data } = await axios.get(`http://www.omdbapi.com/?i=${imdbID}&plot=full&apikey=${API_KEY}`);

        if (data.Response === "True") {
            // 1. Basic string validation
            if (!data.Poster || data.Poster === "N/A" || !data.Poster.startsWith("http")) {
                return;
            }

            // 2. LIVENESS CHECK: Ping the image URL directly
            try {
                // A HEAD request only fetches headers, not the whole image, so it's fast
                await axios.head(data.Poster);
            } catch (imageError) {
                console.log(`git Dead Link Skipped: ${data.Title}`);
                return; // Stop execution, do not save this movie
            }

            const rating = parseFloat(data.imdbRating) || 0;
            const year = parseInt(data.Year) || 0;

            // Only Recent (2020+) OR Top Rated (8.0+)
            if (year >= 1990 || rating >= 7.0 || forceSave) {
                await Movie.updateOne(
                    { imdbID: data.imdbID },
                    {
                        imdbID: data.imdbID,
                        title: data.Title,
                        year: data.Year,
                        poster: data.Poster,
                        plot: data.Plot,
                        genre: data.Genre,
                        rating: data.imdbRating,
                        actors: data.Actors,
                        director: data.Director
                    },
                    { upsert: true }
                );
                console.log(`Stored High-Quality: ${data.Title}`);
            }
        }
    } catch (err) {
        console.error(`Fetch failed for ${imdbID}:`, err.message);
    }
};

module.exports = { searchListAndGetIDs, crawlAndStoreDetails };
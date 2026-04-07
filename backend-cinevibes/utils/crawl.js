const axios = require("axios");
const Movie = require("../models/movie");

const API_KEY = process.env.OMDB_API_KEY;

const searchListAndGetIDs = async (keyword, year) => {
    const url = `http://www.omdbapi.com/?s=${keyword}&y=${year}&apikey=${API_KEY}`;
    const { data } = await axios.get(url);
    return data.Response === "True" ? data.Search.map(m => m.imdbID) : [];
};

const crawlAndStoreDetails = async (imdbID) => {
    try {
        const { data } = await axios.get(`http://www.omdbapi.com/?i=${imdbID}&plot=full&apikey=${API_KEY}`);

        if (data.Response === "True") {
            // STRICT VALIDATION
            const hasPoster = data.Poster && data.Poster.startsWith("http") && data.Poster !== "N/A";
            const hasMinInfo = data.Actors !== "N/A" && data.Director !== "N/A" && data.imdbRating !== "N/A";

            if (!hasPoster || !hasMinInfo) {
                console.log(`Skipping ${data.Title}: Incomplete data or missing poster.`);
                return;
            }

            const rating = parseFloat(data.imdbRating) || 0;
            const year = parseInt(data.Year) || 0;

            // Only Recent (2020+) OR Top Rated (8.0+)
            if (year >= 2020 || rating >= 8.0) {
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
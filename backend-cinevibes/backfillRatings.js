// Backfills ratings for movies OMDB returned as "N/A" using IMDb's official
// non-commercial dataset (https://developer.imdb.com/non-commercial-datasets/),
// NOT by scraping imdb.com - that would violate IMDb's Conditions of Use, which
// explicitly prohibit data mining/scraping of the live site. This dataset is
// free, IMDb-sanctioned, and keyed by the same tconst/imdbID we already store.
require("dotenv").config();
const axios = require("axios");
const zlib = require("zlib");
const readline = require("readline");
const mongoose = require("mongoose");
const Movie = require("./models/movie");

const RATINGS_URL = "https://datasets.imdbws.com/title.ratings.tsv.gz";

const backfillRatings = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB Atlas: CineVibes");

        const movies = await Movie.find({}, "imdbID rating");
        const needsRating = new Set(
            movies.filter((m) => !m.rating || m.rating === "N/A").map((m) => m.imdbID)
        );
        console.log(`${needsRating.size} of ${movies.length} movies have no rating; checking IMDb's dataset...`);

        if (needsRating.size === 0) {
            console.log("Nothing to backfill.");
            return;
        }

        console.log("Downloading IMDb's non-commercial ratings dataset (large file, may take a bit)...");
        const response = await axios.get(RATINGS_URL, { responseType: "stream" });
        const rl = readline.createInterface({ input: response.data.pipe(zlib.createGunzip()) });

        const bulkOps = [];
        let isHeader = true;

        for await (const line of rl) {
            if (isHeader) { isHeader = false; continue; }

            const [tconst, averageRating] = line.split("\t");
            if (!needsRating.has(tconst) || !averageRating || averageRating === "\\N") continue;

            bulkOps.push({
                updateOne: {
                    filter: { imdbID: tconst },
                    update: { $set: { rating: averageRating } },
                },
            });
        }

        if (bulkOps.length > 0) {
            await Movie.bulkWrite(bulkOps);
        }

        console.log(`Backfilled ratings for ${bulkOps.length} movies from IMDb's official dataset.`);
    } catch (err) {
        console.error("Backfill failed:", err.message);
    } finally {
        await mongoose.connection.close();
    }
};

backfillRatings();

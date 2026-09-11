// Minimal, offline fixture data for the e2e suite in CI.
// Unlike seedDatabase.js, this never calls OMDB — it just needs enough
// movies (more than one page's worth, so pagination has a second page)
// directly in Mongo.
require("dotenv").config();
const mongoose = require("mongoose");
const Movie = require("./models/movie");

const GENRES = ["Action", "Comedy", "Drama", "Sci-Fi"];

const fixtures = Array.from({ length: 18 }, (_, i) => ({
    imdbID: `ci-fixture-${i + 1}`,
    title: `CI Fixture Movie ${i + 1}`,
    year: String(2020 + (i % 6)),
    poster: "N/A",
    plot: `Placeholder plot for CI fixture movie ${i + 1}.`,
    genre: GENRES[i % GENRES.length],
    rating: (5 + (i % 5)).toFixed(1),
    actors: "Fixture Actor One, Fixture Actor Two",
    director: "Fixture Director",
    discussionCount: 0,
}));

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB: seeding CI fixtures...");

        for (const fixture of fixtures) {
            await Movie.updateOne({ imdbID: fixture.imdbID }, fixture, { upsert: true });
        }

        console.log(`Seeded ${fixtures.length} fixture movies.`);
    } catch (error) {
        console.error("CI seeding failed:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.connection.close();
    }
};

seed();

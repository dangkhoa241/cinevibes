require("dotenv").config();
const mongoose = require("mongoose");
const { searchListAndGetIDs, crawlAndStoreDetails } = require("./utils/crawl");

// Keywords and years to ensure a high-quality dataset for CineVibes
const keywords = ["action", "love", "future", "war", "space", "mystery"];
const targetYears = ["2023", "2024", "2025"];

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB Atlas: CineVibes");

        for (const year of targetYears) {
            for (const keyword of keywords) {
                console.log(`Searching for "${keyword}" movies from ${year}...`);


                const movieIDs = await searchListAndGetIDs(keyword, year);
                console.log(`Found ${movieIDs.length} potential movies.`);

                for (const id of movieIDs) {
                    await crawlAndStoreDetails(id);
                }
            }
        }

        console.log("Database seeding complete. Movies collection is ready.");
    } catch (error) {
        console.error("Seeding failed:", error.message);
    } finally {
        mongoose.connection.close();
    }
};

seed();
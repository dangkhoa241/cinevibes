require("dotenv").config();
const mongoose = require("mongoose");
const { searchListAndGetIDs, crawlAndStoreDetails } = require("./utils/crawl");

// Keywords and years to ensure a high-quality dataset for CineVibes
//const keywords = ["action", "love", "future", "war", "space", "mystery"];
//const targetYears = ["2023", "2024", "2025"];

const keywords = [
    "action", "love", "future", "war", "space", "mystery",
    "comedy", "drama", "family", "adventure", "crime", "horror"
];

const targetYears = ["2024", "2025", "2026"];

const top100IDs = [
    "tt0111161", "tt0068646", "tt0468569", "tt0071562", "tt0050083",
    "tt0108052", "tt0167260", "tt0110912", "tt0060196", "tt0120737",
    "tt0137523", "tt0109830", "tt0133093", "tt0080684", "tt0172495",
    "tt0076759", "tt0099685", "tt0066921", "tt0081505", "tt0114369",
    "tt0034583", "tt0054215", "tt0118799", "tt0062622", "tt0086190",
    "tt0102721", "tt0046912", "tt0040522", "tt0073486", "tt0167261",
    "tt0209144", "tt0110357", "tt0021749", "tt0050613", "tt0033467",
    "tt0057438", "tt0022651", "tt0067116", "tt0052357", "tt0103064",
    "tt0082971", "tt0311448", "tt0056172", "tt0047396", "tt0050051",
    "tt0053125", "tt0035417", "tt0052561", "tt0050825", "tt0042192",
    "tt0080161", "tt0112253", "tt0042876", "tt0049730", "tt0120601",
    "tt0114814", "tt0075314", "tt0088763", "tt0058331", "tt0245429",
    "tt0059742", "tt0113277", "tt0051130", "tt0061722", "tt0107048",
    "tt0102431", "tt0056058", "tt0120338", "tt0078748", "tt0055630",
    "tt0405159", "tt0063350", "tt0111413", "tt0053291", "tt0105698",
    "tt0070735", "tt0041913", "tt0064116", "tt0057012", "tt0052149",
    "tt0111503", "tt0060665", "tt0071853", "tt0114709", "tt0025499",
    "tt0070130", "tt0054047", "tt0036855", "tt0053619", "tt0054135",
    "tt0050419", "tt0055031", "tt0119116", "tt0050976", "tt0058150",
    "tt0043044", "tt0051584", "tt0101414", "tt0062060", "tt0060027"
];

const seedTopMovies = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB: Starting Top 100 Import...");

        for (let i = 0; i < top100IDs.length; i++) {
            const id = top100IDs[i];
            console.log(`[${i + 1}/100] Processing ID: ${id}`);

            await crawlAndStoreDetails(id);

            await new Promise(r => setTimeout(r, 500));
        }

        console.log("Success: Top 100 movies are now in the database.");
    } catch (err) {
        console.error("Seeding failed:", err.message);
    } finally {
        mongoose.connection.close();
    }
};

//seedTopMovies();

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
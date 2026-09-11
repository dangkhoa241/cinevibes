require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Movie = require("./models/movie");
const User = require("./models/user");
const Comment = require("./models/comment");

const sampleUsers = [
    { username: "moviebuff42", name: "Alex Chen" },
    { username: "cinephile_jane", name: "Jane Ortiz" },
    { username: "plottwistpro", name: "Marcus Reed" },
    { username: "casualwatcher", name: "Sam Patel" },
];

const commentTemplates = [
    { category: "normal", isSpoiler: false, content: "Just watched this and honestly had a great time. The pacing dragged a bit in the middle but the ending made up for it." },
    { category: "normal", isSpoiler: false, content: "Can we talk about how good the soundtrack is? I've been listening to it on repeat since." },
    { category: "normal", isSpoiler: false, content: "Went in with low expectations and came out pleasantly surprised." },
    { category: "normal", isSpoiler: true, content: "I did NOT see that twist with the main character's brother coming. Wild." },
    { category: "technical", isSpoiler: false, content: "The cinematography in the third act leans on a lot of Dutch angles to build unease - really effective choice." },
    { category: "technical", isSpoiler: false, content: "Runtime feels bloated. Could've cut 20 minutes from the second act without losing anything." },
    { category: "technical", isSpoiler: true, content: "The foreshadowing for the ending is all there in the first act if you look closely - the recurring broken-clock motif pays off perfectly." },
];

const hoursAgo = (h) => new Date(Date.now() - h * 60 * 60 * 1000);

const seedComments = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB Atlas: CineVibes");

        const users = [];
        for (const u of sampleUsers) {
            let user = await User.findOne({ username: u.username });
            if (!user) {
                const passwordHash = await bcrypt.hash("seedpass123", 10);
                user = await User.create({ username: u.username, name: u.name, passwordHash });
                console.log(`Created user: ${u.username}`);
            }
            users.push(user);
        }

        const movies = await Movie.find().sort({ year: -1 }).limit(8);

        let created = 0;
        for (const movie of movies) {
            for (let i = 0; i < commentTemplates.length; i++) {
                const template = commentTemplates[i];
                const user = users[i % users.length];

                const exists = await Comment.findOne({ movieId: movie.imdbID, content: template.content });
                if (exists) continue;

                const doc = await Comment.create({
                    movieId: movie.imdbID,
                    content: template.content,
                    category: template.category,
                    isSpoiler: template.isSpoiler,
                    user: user._id,
                });

                // Backdate for variety in the UI's relative timestamps. A query-based
                // update (not .save()) bypasses the timestamps plugin's createdAt guard.
                await Comment.updateOne(
                    { _id: doc._id },
                    { $set: { createdAt: hoursAgo(Math.floor(Math.random() * 96)) } }
                );

                created++;
            }
            console.log(`Seeded comments for: ${movie.title}`);
        }

        console.log(`Done. Created ${created} new sample comments across ${movies.length} movies.`);
    } catch (err) {
        console.error("Seeding comments failed:", err.message);
    } finally {
        mongoose.connection.close();
    }
};

seedComments();

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const movieRoutes = require("./routes/movie");

const app = express();
app.use(express.static('dist'))

// Connect to Atlas CineVibes DB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("CineVibes connected to MongoDB Atlas"))
    .catch(err => console.error("Database connection error:", err));

app.use("/api/movies", movieRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
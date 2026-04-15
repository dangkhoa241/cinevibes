require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const movieRoutes = require("./routes/movie");

const app = express();


app.use(cors());
app.use(express.json());
app.use(express.static('dist'));

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("CineVibes connected to MongoDB Atlas"))
    .catch(err => console.error("Database connection error:", err));

app.use("/api/movies", movieRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("CineVibes connected to MongoDB Atlas"))
    .catch(err => console.error("Database connection error:", err));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

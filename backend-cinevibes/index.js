require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const movieRoutes = require("./routes/movie");
const usersRouter = require('./controllers/user');
const loginRouter = require('./controllers/login');
const commentRouter = require('./routes/comment');
const authMiddleware = require('./middleware/auth');

const app = express();

const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map(origin => origin.trim())
    : true; // no FRONTEND_URL set (e.g. local dev) -> allow any origin

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("CineVibes connected to MongoDB Atlas"))
    .catch(err => console.error("Database connection error:", err));

app.use('/api/users', usersRouter);
app.use('/api/login', loginRouter);

app.use("/api/movies", movieRoutes);

app.use('/api/movies', commentRouter);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
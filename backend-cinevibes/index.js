require("dotenv").config();
const path = require('path');
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const movieRoutes = require("./routes/movie");
const usersRouter = require('./controllers/user');
const loginRouter = require('./controllers/login');

const app = express();


app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, './dist')));

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("CineVibes connected to MongoDB Atlas"))
    .catch(err => console.error("Database connection error:", err));

app.use('/api/users', usersRouter);
app.use('/api/login', loginRouter);

app.use("/api/movies", movieRoutes);

app.use("/movie", (req, res, next) => {
    if (req.method === 'GET' && req.accepts('html')) {
        return res.sendFile(path.join(__dirname, './dist/index.html'));
    }
    next();
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
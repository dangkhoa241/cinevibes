const express = require("express");
const cors = require("cors");
const movieRoutes = require("./routes/movie");
const usersRouter = require('./controllers/user');
const loginRouter = require('./controllers/login');
const commentRouter = require('./routes/comment');
const chatRouter = require('./routes/chat');

const app = express();

const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map(origin => origin.trim())
    : true; // no FRONTEND_URL set (e.g. local dev) -> allow any origin

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.use('/api/users', usersRouter);
app.use('/api/login', loginRouter);

app.use("/api/movies", movieRoutes);

app.use('/api/movies', commentRouter);

app.use('/api/chat', chatRouter);

module.exports = app;

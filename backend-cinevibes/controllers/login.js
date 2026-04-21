const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const loginRouter = require('express').Router();
const User = require('../models/user');

loginRouter.post('/', async (request, response) => {
    const { username, password } = request.body;

    const user = await User.findOne({ username });

    // Check if user exists and password is correct
    const passwordCorrect = user === null
        ? false
        : await bcrypt.compare(password, user.passwordHash);

    if (!(user && passwordCorrect)) {
        return response.status(401).json({
            error: 'invalid username or password'
        });
    }

    const userForToken = {
        username: user.username,
        id: user._id,
    };

    // Generate the token (Ensure you have JWT_SECRET in your .env)
    const token = jwt.sign(
        userForToken,
        process.env.SECRET,
        { expiresIn: 60*60 } // Token expires in 1 hour
    );

    response
        .status(200)
        .send({ token, username: user.username, name: user.name });
});

module.exports = loginRouter;
const jwt = require('jsonwebtoken');

const authMiddleware = (request, response, next) => {
    const authorization = request.get('authorization');

    if (authorization && authorization.startsWith('Bearer ')) {
        const token = authorization.replace('Bearer ', '');

        let decodedToken;
        try {
            decodedToken = jwt.verify(token, process.env.SECRET);
        } catch (err) {
            return response.status(401).json({ error: 'token expired or invalid' });
        }

        if (!decodedToken.id) {
            return response.status(401).json({ error: 'token invalid' });
        }

        request.user = decodedToken;
        next();
    } else {
        return response.status(401).json({ error: 'token missing' });
    }
};

module.exports = authMiddleware;
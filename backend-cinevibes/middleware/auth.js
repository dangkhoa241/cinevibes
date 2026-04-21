const jwt = require('jsonwebtoken');

const authMiddleware = (request, response, next) => {
    const authorization = request.get('authorization');

    if (authorization && authorization.startsWith('Bearer ')) {
        const token = authorization.replace('Bearer ', '');
        const decodedToken = jwt.verify(token, process.env.SECRET);

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
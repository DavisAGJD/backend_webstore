const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(403).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, 'your_jwt_secret');
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token.' });
    }
};

const authorizeAdmin = (req, res, next) => {
    if (req.user.rolID !== 2) {
        return res.status(403).json({ error: 'Access denied. Admins only.' });
    }
    next();
};


module.exports = {
    authenticateJWT,
    authorizeAdmin
};

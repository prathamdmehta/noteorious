const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;

function isAuthenticated(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        res.locals.authenticated = false;
        res.locals.username = null;
        return next(); // Proceed to next middleware
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.userId = decoded.userId;
        res.locals.authenticated = true;
        // Assuming req.session.username is set correctly in your login route
        res.locals.username = req.session.username; // Pass username to templates
        next(); // Proceed to next middleware
    } catch (error) {
        console.error('JWT verification error:', error);
        res.locals.authenticated = false;
        res.locals.username = null;
        next(); // Proceed to next middleware
    }
}

module.exports = { isAuthenticated };

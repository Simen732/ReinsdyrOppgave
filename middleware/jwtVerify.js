const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.redirect('/auth/login');
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'shhhhh');
        req.user = decoded;
        next();
    } catch (err) {
        return res.redirect('/auth/login');
    }
};

module.exports = verifyToken;

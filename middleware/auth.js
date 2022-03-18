const jwt = require('jsonwebtoken');

const tokenKey = process.env.TOKEN_KEY;

const verifyToken = async function (req, res, next) {
    const token =
        req.body.token || req.query.token || req.headers["x-access-token"];

    if (!token || token.length === 0) {
        return res.status(403).send("A token is required for authentication");
    }
    try {
        const decoded = await jwt.verify(token, tokenKey);
        req.user = decoded;
    } catch (error) {
        return res.status(401).send("Invalid Token, could be expired");
    }
    next();
}

module.exports = verifyToken;
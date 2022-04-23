const jwt = require('jsonwebtoken');

const tokenKey = process.env.TOKEN_KEY;

/**
 * Middleware that decodes the eventual token. If a token is not provided, it sends a status 403. If the token is present but invalid, it sends a status 401.
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns Either returns an error string (with a status code 401/403) or it goes to the next express function
 */
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
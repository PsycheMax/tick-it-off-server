const jwt = require('jsonwebtoken');
const Users = require('../models/User');

module.exports = async function (req, res, next) {
    const existingToken = req.body.token || req.query.token || req.headers["x-access-token"];
    if (existingToken) {
        let decoded = jwt.decode(existingToken, { complete: true });
        let loggedUser = await Users.findOne({ _id: decoded.payload.user_id });
        req.loggedUser = loggedUser;
        next();
    } else {
        console.log("DecodeMiddleware - No user logged");
        return null;
    }
}
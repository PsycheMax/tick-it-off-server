const jwt = require('jsonwebtoken');
const Users = require('../models/User');
const { errorLogging } = require('./logging');

module.exports = async function (req, res, next) {
    try {
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
    } catch (error) {
        errorLogging(error);
    }
}
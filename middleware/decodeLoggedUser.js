const jwt = require('jsonwebtoken');
const Users = require('../models/User');
const { errorLogging } = require('./logging');

/**
 * This middleware is used to decode the token, and check if said token is associated with a User in the UserDB
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns null if the token is not provided, otherwise it goes to the next express function
 */
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
        errorLogging(error, "In decodeLoggedUser");
    }
}
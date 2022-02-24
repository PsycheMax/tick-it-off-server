const jwt = require('jsonwebtoken');
const Users = require('../models/User');

module.exports = async function (req, res, next) {
    console.log("Decoding middleware");
    const existingToken = req.body.token || req.query.token || req.headers["x-access-token"];
    if (existingToken) {
        console.log(existingToken);
        let decoded = jwt.decode(existingToken, { complete: true });
        console.log(decoded);
        let loggedUser = await Users.findOne({ _id: decoded.payload.user_id });
        req.loggedUser = loggedUser;
        console.log("Out of decoding middleware");
        next();
    } else {
        console.log("No user logged");
        console.log("Gotta go back to login somehow?");
        return null;
    }
}
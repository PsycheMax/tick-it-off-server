const bcrypt = require('bcryptjs');

const salt = 10;

module.exports.encrypt = async function (stringToEncrypt) {
    let toReturn = await bcrypt.hash(stringToEncrypt, salt);
    return toReturn;
}

module.exports.compare = async function (plainString, hashedString) {
    let toReturn = await bcrypt.compare(plainString, hashedString);
    return toReturn;
}
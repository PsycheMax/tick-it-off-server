const bcrypt = require('bcryptjs');

const salt = 10;

/**
 * This functions encrypts a string, pretty self explanatory
 * @param {string} stringToEncrypt a string to encrypt via bcrypt
 * @returns an encripted string
 */
module.exports.encrypt = async function (stringToEncrypt) {
    let toReturn = await bcrypt.hash(stringToEncrypt, salt);
    return toReturn;
}

/**
 * This functions compares a plain string to a hashed one
 * @param {string} plainString The humanly readable string, to compare to hashedString
 * @param {string} hashedString The hashed string, to use as a comparison element for plainString
 * @returns a boolean
 */
module.exports.compare = async function (plainString, hashedString) {
    let toReturn = await bcrypt.compare(plainString, hashedString);
    return toReturn;
}
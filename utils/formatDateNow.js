const date = require('date-and-time');

/**
 * This function uses Date.now() and rewrites it as a readable string
 * @returns A string formatted via date-and-time - it is easier to read this way
 */
function formatDateNow() {
    let dateFormatted = date.format(new Date(), "hh:mm:ss A [-] MMM DD YYYY");
    return dateFormatted;
}

module.exports = formatDateNow;
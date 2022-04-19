const date = require('date-and-time');

/**
 * 
 * @returns A string formatted via date-and-time - it reads easily
 */
function formatDateNow() {
    let dateFormatted = date.format(new Date(), "hh:mm A [-] MMM DD YYYY");
    return dateFormatted;
}

module.exports = formatDateNow;
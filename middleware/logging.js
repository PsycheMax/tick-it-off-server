const fsPromises = require('fs/promises');
const path = require('path');
const formatDateNow = require('../utils/formatDateNow');

const mainLogLocation = path.join(__dirname, "../", "logs");

const statsFolder = "stats";

let statsFilename = "TiO-Server-Stats.txt";
let baseStatsContent = "STATS\nTotal Number Of API Calls:1";

const statsLoggingMiddleware = async function (req, res, next) {
    let targetFile = path.join(mainLogLocation, statsFolder, statsFilename);
    let backupFile = path.join(mainLogLocation, statsFolder, Date.now() + statsFilename);
    try {
        let foundFile = await fsPromises.readFile(targetFile, "utf8")
        if (foundFile) {
            let splitArray = foundFile.split(":");
            let previousNumberOfAPICalls = parseInt(splitArray[1]);
            if (isNaN(previousNumberOfAPICalls)) {
                await fsPromises.copyFile(targetFile, backupFile);
                await fsPromises.writeFile(targetFile, baseStatsContent, "utf8");
            } else {
                let numberOfAPICalls = previousNumberOfAPICalls + 1;
                let endLine = splitArray[0] + ":" + numberOfAPICalls.toString();
                await fsPromises.writeFile(targetFile, endLine, "utf8");
            }
        } else {
            await fsPromises.writeFile(targetFile, baseStatsContent, "utf8");
        }
    } catch (error) {
        errorLogging(error);
        await fsPromises.writeFile(targetFile, baseStatsContent, "utf8");
    }
    next();
}

const errorLogCreation = function (error) {
    return (
        `ERROR - ${formatDateNow()} \n
Error: ${error}`)
}
const errorsFolder = "errors";
const errorFilename = `BugLog-${Date.now()}.txt`

const errorLogging = async function (error) {
    let targetFile = path.join(mainLogLocation, errorsFolder, errorFilename);
    await fsPromises.writeFile(targetFile, errorLogCreation(error), "utf8");
}

//  ______________________________________________


let statsToWrite = {
    user: {
        login: 0,
        logout: 0,
        getUserData: 0,
        patch: 0,
        delete: 0
    },
    project: {
        created: 0,
        patched: 0,
        archived: 0,
        permantentlyDeleted: 0
    },
    task: {
        created: 0,
        patched: 0,
        archived: 0,
        permantentlyDeleted: 0
    }
}

function createStatsFileText() {
    return (
        `API CALLS STATS
This file has been written on ${formatDateNow()}

User API Calls:
    login: ${statsToWrite.user.login},
    logout: ${statsToWrite.user.logout},
    getUserData: ${statsToWrite.user.getUserData},
    patch: ${statsToWrite.user.patch},
    delete: ${statsToWrite.user.delete}
    
Project API Calls:
    created: ${statsToWrite.project.created}
    patched: ${statsToWrite.project.patched}
    archived: ${statsToWrite.project.archived}
    permantentlyDeleted: ${statsToWrite.project.permantentlyDeleted}

Task API Calls:
    created: ${statsToWrite.task.created}
    patched: ${statsToWrite.task.patched}
    archived: ${statsToWrite.task.archived}
    permantentlyDeleted: ${statsToWrite.task.permantentlyDeleted}
`)
}

module.exports.increaseObjectValue = function (category, kindOfCall) {
    statsToWrite[category][kindOfCall] = statsToWrite[category][kindOfCall] + 1;
}

module.exports.writeStatsBeforeClosing = async function () {
    let targetFile = path.join(mainLogLocation, statsFolder, Date.now() + statsFilename);
    try {
        await fsPromises.writeFile(targetFile, createStatsFileText())
    } catch (error) {
        errorLogging(error);
    }
}


module.exports.statsLoggingMiddleware = statsLoggingMiddleware;
module.exports.errorLogging = errorLogging;
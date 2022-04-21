const fs = require('fs');
const fsPromises = require('fs/promises');
const path = require('path');
const formatDateNow = require('../utils/formatDateNow');

const mainLogLocation = path.join(__dirname, "../", "logs");
const errorsFolder = "errors";
const statsFolder = "stats";

let fileExtension = ".log";


const errorLogFormatting = function (error, optionalInfo) {
    return (
        `ERROR - ${formatDateNow()}
${optionalInfo} \n
Error: ${error}`)
}

const errorFilename = `BugLog-${Date.now()}${fileExtension}`

const errorLogging = function (error, optionalInfo) {
    let optionalInfo = optionalInfo ? optionalInfo : "";
    let targetFile = path.join(mainLogLocation, errorsFolder, errorFilename);
    fs.writeFile(targetFile, errorLogFormatting(error, optionalInfo), "utf8", (err) => { console.log(err) });
}



let statsFilename = "TiO-Server-Stats"


let JSONFilePath = path.join(mainLogLocation, statsFolder, statsFilename + ".JSON");
let readableFilePath = path.join(mainLogLocation, statsFolder, statsFilename + fileExtension);

let emptyJSON = {
    user: {
        create: 0,
        login: 0,
        logout: 0,
        get: 0,
        patch: 0,
        archive: 0
    },
    project: {
        get: 0,
        create: 0,
        patch: 0,
        archive: 0,
        permantentlyDelete: 0
    },
    task: {
        get: 0,
        create: 0,
        patch: 0,
        archive: 0,
        permantentlyDelete: 0
    }
};
let statsToWrite = emptyJSON;

const JSONExistingData = async function () {
    try {
        let jsonInFile = await fsPromises.readFile(JSONFilePath);
        if (jsonInFile) {
            let parsed = await JSON.parse(jsonInFile);
            statsToWrite = parsed;
        } else {
            statsToWrite = emptyJSON;
        }
    } catch (error) {
        await errorLogging(error);
        await fsPromises.writeFile(JSONFilePath, JSON.stringify(emptyJSON), "utf8");
        statsToWrite = emptyJSON;
    }
}
JSONExistingData().then(() => { createReadableStatsFile() });

function createReadableStatsFile() {
    return (
        `API CALLS STATS
This file has been written on ${formatDateNow()}

User API Calls:
    create: ${statsToWrite.user.create},
    get: ${statsToWrite.user.get},
    login: ${statsToWrite.user.login},
    logout: ${statsToWrite.user.logout},
    patch: ${statsToWrite.user.patch},
    archive: ${statsToWrite.user.delete}
    
Project API Calls:
    get: ${statsToWrite.project.get},
    create: ${statsToWrite.project.create}
    patch: ${statsToWrite.project.patch}
    archive: ${statsToWrite.project.archive}
    permantentlyDelete: ${statsToWrite.project.permantentlyDelete}

Task API Calls:
    get: ${statsToWrite.task.get}
    create: ${statsToWrite.task.create}
    patch: ${statsToWrite.task.patch}
    archive: ${statsToWrite.task.archive}
    permantentlyDelete: ${statsToWrite.task.permantentlyDelete}
`)
}

function createJSONStatsFile() {
    let toReturn = JSON.stringify(statsToWrite);
    console.log(toReturn)
    return toReturn;
}

module.exports.increaseObjectValueMiddleware = async function (req, res, next) {
    let category = req.baseUrl.slice(1, req.baseUrl.length);
    if (category === "project") {
        if (req.route.path !== "/:id") {
            if (req.route.path !== "/permanentlyDelete/:id") {
                category = "task";
            }
        }
    }

    switch (req.method) {
        case "GET":
            statsToWrite[category]["get"] += 1;
            break;
        case "POST":
            if (req.route.path === "/" || req.route.path === "/:id/task") {
                statsToWrite[category]["create"] += 1;
            } else {
                switch (req.route.path) {
                    case "/login":
                        statsToWrite[category]["login"] += 1;
                        break;
                    case "logout":
                        statsToWrite[category]["logout"] += 1;
                        break;
                    default:
                        console.log("Error - case not expected")
                        break;
                }
            }
            break;
        case "PATCH":
            statsToWrite[category]["patch"] += 1;
            break;
        case "DELETE":
            if (req.route.path === "/:id") {
                statsToWrite[category]["archive"] += 1;
            } else {
                switch (req.route.path) {
                    case "/permanentlyDelete/:id":
                        statsToWrite[category]["permantentlyDelete"] += 1;
                        break;
                    case "/:id/task/:taskid":
                        statsToWrite["task"]["archive"] += 1;
                        break;
                    case "/:id/task/permanentlyDelete/:taskid":
                    default:
                        statsToWrite["task"]["permantentlyDelete"] += 1;
                        break;
                }
            }
            break;
        default:
            break;
    }
    next();
}

module.exports.writeStatsBeforeClosing = async function () {
    console.log("writing stats");

    try {
        fs.writeFileSync(readableFilePath, createReadableStatsFile(), "utf8", (error) => { console.log(error) });
        fs.writeFileSync(JSONFilePath, createJSONStatsFile(), "utf8", (error) => { console.log(error) });
    } catch (error) {
        console.log(error);
        errorLogging(error);
    }
}

module.exports.errorLogging = errorLogging;
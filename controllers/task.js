const { errorLogging } = require("../middleware/logging");
const Projects = require("../models/Project");
const Tasks = require("../models/Task");
const Users = require("../models/User");

const formatDateNow = require('../utils/formatDateNow');

/**
 * This function checks if the loggedUser is authorized to just read the task
 * @param {*} task 
 * @param {*} loggedUser 
 * @returns A boolean
 */
function canLoggedUserReadThis(task, loggedUser) {
    for (const key in task.users) {
        if (Object.hasOwnProperty.call(task.users, key)) {
            const usersInRoleArray = task.users[key];
            for (let i = 0; i < usersInRoleArray.length; i++) {
                const user = usersInRoleArray[i];
                if (user._id.toString() === loggedUser._id.toString()) {
                    return true;
                }
            }
            return false;
        }
    }
}

/**
 * This function checks if the loggedUser is authorized to manage the task (therefore edit it)
 * @param {*} task 
 * @param {*} loggedUser 
 * @returns a boolean
 */
function canLoggedUserManageThis(task, loggedUser) {
    const managersArray = task.users["managers"];
    for (let i = 0; i < managersArray.length; i++) {
        const userInArray = managersArray[i];
        if (userInArray._id.toString() === loggedUser._id.toString()) {
            return true;
        }
    }
    return false;
}
// An empty object, to which every function(to be associated with routes) is added, is declared here
let taskController = {};

// Bear in mind that the tasks routes look like: /project/:projectID/task/:taskID
taskController.getID = async function (req, res) {
    const { id: projectID, taskid: taskID } = req.params;
    try {
        let toReturn = await Tasks.findById(taskID)
            // .populate("project", "name image active")
            .populate("users.creators", "username image active")
            .populate("users.joiners", "username image active")
            .populate("users.managers", "username image active");
        if (toReturn) {
            if (canLoggedUserReadThis(toReturn, req.loggedUser)) {
                res.status(200).send(toReturn);
            } else {
                res.status(403).send("You lack the authorization to perform this operation");
            }
        } else {
            res.send("Task not found");
        }
    } catch (error) {
        errorLogging(error, "In task controller - getID");
        res.status(500).send(error);
    }
}

taskController.post = async function (req, res) {
    const { id: projectID } = req.params;
    try {
        const foundProject = await Projects.findById(projectID);
        if (foundProject) {
            if (canLoggedUserManageThis(foundProject, req.loggedUser)) {
                // The next declaration saves a lot of time retyping stuff when changing the way data is submitted to the API
                let reqTask = req.body.newTask;
                let newTask = new Tasks({
                    name: reqTask.name,
                    completion: reqTask.completion,
                    description: reqTask.description,
                    image: reqTask.image,
                    level: reqTask.level,
                    active: true,
                    creationDate: formatDateNow(),
                    modificationDate: formatDateNow(),
                    project: foundProject._id,
                    users: {
                        creators: [req.loggedUser._id],
                        joiners: [],
                        managers: [req.loggedUser._id]
                    },
                    settings: {},
                    notifications: []
                });
                await newTask.save();
                res.status(201).send(newTask);
            } else {
                res.status(403).send("You lack the authorization to perform this operation");
            }
        } else {
            res.status(404).send("The project you're referring to can't be found");
        }
    } catch (error) {
        errorLogging(error, "In task controller - post");
        res.status(500).send(error);
    }
}

taskController.patch = async function (req, res) {
    const { id: projectID, taskid: taskID } = req.params;
    const { patchedTask } = req.body;
    try {
        const toUpdate = await Tasks.findById(taskID)
            .populate("project", "name image active")
            .populate("users.creators", "username image active")
            .populate("users.joiners", "username image active")
            .populate("users.managers", "username image active");

        const projectBelongingTo = await Projects.findById(projectID);
        if (toUpdate) {
            if (projectBelongingTo) {
                if (canLoggedUserManageThis(toUpdate, req.loggedUser) && canLoggedUserManageThis(projectBelongingTo, req.loggedUser)) {
                    // The following for...in iterates through the PATCHEDJsonObject received by the request, and updates the DB Document with the eventual new data
                    for (const key in patchedTask) {
                        if (Object.hasOwnProperty.call(patchedTask, key)) {
                            toUpdate[key] = patchedTask[key];
                        }
                    }
                    toUpdate.modificationDate = formatDateNow();
                    await toUpdate.save();
                    res.status(200).send(toUpdate);
                } else {
                    res.status(403).send("You lack the authorization to perform this operation");
                }
            } else {
                res.status(404).send("The project you're referring to can't be found");
            }
        } else {
            res.status(404).send("The task you're referring to can't be found");
        }
    } catch (error) {
        errorLogging(error, "In task controller - patch");
        res.status(500).send(error);
    }
}

taskController.deactivate = async function (req, res) {
    const { id: projectID, taskid: taskID } = req.params;
    try {
        const toDeactivate = await Tasks.findById(taskID);
        const projectBelongingTo = await Projects.findById(projectID);
        if (toDeactivate) {
            if (projectBelongingTo) {
                if (canLoggedUserManageThis(toDeactivate, req.loggedUser) && canLoggedUserManageThis(projectBelongingTo, req.loggedUser)) {
                    toDeactivate.active = false;
                    toDeactivate.modificationDate = formatDateNow();
                    await toDeactivate.save();
                    res.status(200).send("Task " + taskID + " has been moved to the archived tasks");
                } else {
                    res.status(403).send("You lack the authorization to perform this operation");
                }
            } else {
                res.status(404).send("The project you're referring to can't be found");
            }
        } else {
            res.status(404).send("The task you're referring to can't be found");
        }
    } catch (error) {
        errorLogging(error, "In task controller - deactivate");
        res.status(500).send(error);
    }
}

taskController.permanentlyDelete = async function (req, res) {
    const { id: projectID, taskid: taskID } = req.params;
    try {
        const toDelete = await Tasks.findById(taskID);
        const projectBelongingTo = await Projects.findById(projectID);
        if (toDelete) {
            if (projectBelongingTo) {
                if (canLoggedUserManageThis(toDelete, req.loggedUser) && canLoggedUserManageThis(projectBelongingTo, req.loggedUser)) {
                    await Tasks.deleteOne(toDelete);
                    res.status(200).send("Task " + taskID + " has been deleted in a permanent way");
                } else {
                    res.status(403).send("You lack the authorization to perform this operation");
                }
            } else {
                res.status(404).send("The project you're referring to can't be found");
            }
        } else {
            res.status(404).send("The task you're referring to can't be found");
        }
    } catch (error) {
        errorLogging(error, "In task controller - permanentlyDelete");
        res.status(500).send(error);
    }
}

taskController.getTaskSettings = async function (req, res) {
    const { id: projectID, taskid: taskID } = req.params;
    try {
        const task = await Tasks.findById(taskID);
        const projectBelongingTo = await Projects.findById(projectID);
        if (task) {
            if (projectBelongingTo) {
                if (canLoggedUserReadThis(task, req.loggedUser) && canLoggedUserReadThis(projectBelongingTo, req.loggedUser)) {
                    const settings = task.settings;
                    res.status(200).send(settings);
                } else {
                    res.status(403).send("You lack the authorization to perform this operation");
                }
            } else {
                res.status(404).send("The project you're referring to can't be found");
            }
        } else {
            res.status(404).send("The task you're referring to can't be found");
        }
    } catch (error) {
        errorLogging(error, "In task controller - getTaskSettings");
        res.status(500).send(error);
    }
}

taskController.setTaskSettings = async function (req, res) {
    const { id: projectID, taskid: taskID } = req.params;
    const { newSettings } = req.body;
    try {
        const task = await Tasks.findById(taskID);
        const projectBelongingTo = await Projects.findById(projectID);
        if (task) {
            if (projectBelongingTo) {
                if (canLoggedUserManageThis(task, req.loggedUser) && canLoggedUserManageThis(projectBelongingTo, req.loggedUser)) {
                    task.settings = newSettings;
                    task.modificationDate = formatDateNow();
                    task.save();
                    res.status(200).send("Settings updated");
                } else {
                    res.status(403).send("You lack the authorization to perform this operation");
                }
            } else {
                res.status(404).send("The project you're referring to can't be found");
            }
        } else {
            res.status(404).send("The task you're referring to can't be found");
        }
    } catch (error) {
        errorLogging(error, "In task controller - setTaskSettings");
        res.status(500).send(error);
    }
}

module.exports = taskController;
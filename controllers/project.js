const { errorLogging } = require("../middleware/logging");
const Projects = require("../models/Project");
const Tasks = require("../models/Task");
const Users = require("../models/User");

const formatDateNow = require('../utils/formatDateNow');

function canLoggedUserReadThis(project, loggedUser) {
    for (const key in project.users) {
        if (Object.hasOwnProperty.call(project.users, key)) {
            const usersInRoleArray = project.users[key];
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
function canLoggedUserManageThis(project, loggedUser) {
    const managersArray = project.users["managers"];
    for (let i = 0; i < managersArray.length; i++) {
        const userInArray = managersArray[i];
        if (userInArray._id.toString() === loggedUser._id.toString()) {
            return true;
        }
    }
    return false;
}

let projectController = {};

projectController.getRoot = async function (req, res) {
    let toReturn = "Get Project Page";
    try {
        let toReturn = await Projects.find({});
        if (toReturn) {
            res.status(200).send(toReturn);
        } else {
            res.status(403).send("You lack the authorization to perform this operation");
        }
    } catch (error) {
        errorLogging(error, "In project controller - getRoot");
        res.status(500).send(error);
    }
}

projectController.getID = async function (req, res) {
    const { id } = req.params;
    try {
        let toReturn = await Projects.findById(id)
            .populate("tasks", "active image completion name description creationDate modificationDate")
            .populate("archivedTasks", "active image completion name description creationDate modificationDate")
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
            res.status(404).send("Project not found");
        }
    } catch (error) {
        errorLogging(error, "In project controller - getID");
        res.status(500).send(error);
    }
}

projectController.post = async function (req, res) {
    // The next declaration saves a lot of time retyping stuff when changing the way data is submitted to the API
    let reqProject = req.body.newProject;
    try {
        let newProject = new Projects({
            name: reqProject.name,
            description: reqProject.description,
            completion: false,
            image: reqProject.image,
            active: true,
            creationDate: formatDateNow(),
            modificationDate: formatDateNow(),
            users: {
                creators: [req.loggedUser._id],
                joiners: [],
                managers: [req.loggedUser._id],
            },
            tasks: [],
            settings: {},
            notifications: []
        });
        await newProject.save();
        res.status(201).send(newProject);
    } catch (error) {
        errorLogging(error, "In project controller - post");
        res.status(500).send(error);
    }
}

projectController.patch = async function (req, res) {
    const { id } = req.params;
    const { patchedProject } = req.body;
    try {
        const toUpdate = await Projects.findById(id)
            .populate("tasks", "active image completed name description")
            .populate("archivedTasks", "active image completion name description")
            .populate("users.creators", "username image active")
            .populate("users.joiners", "username image active")
            .populate("users.managers", "username image active");
        if (toUpdate) {
            if (canLoggedUserManageThis(toUpdate, req.loggedUser)) {
                // The following for...in iterates through the PATCHEDJsonObject received by the request, and updates the DB Document with the eventual new data
                for (const key in patchedProject) {
                    if (Object.hasOwnProperty.call(patchedProject, key)) {
                        toUpdate[key] = patchedProject[key];
                    }
                }
                toUpdate.modificationDate = formatDateNow();
                await toUpdate.save();
                res.status(200).send(toUpdate);
            } else {
                res.status(403).send("You lack the authorization to perform this operation");
            }
        } else {
            res.status(404).send("Project not found");
        }
    } catch (error) {
        errorLogging(error, "In project controller - patch");
        res.status(500).send(error);
    }
}

projectController.deactivate = async function (req, res) {
    const { id } = req.params;
    try {
        const toDeactivate = await Projects.findById(id);

        if (toDeactivate) {
            if (toDeactivate.active) {
                if (canLoggedUserManageThis(toDeactivate, req.loggedUser)) {
                    toDeactivate.active = false;
                    toDeactivate.modificationDate = formatDateNow();
                    await toDeactivate.save();
                    res.status(200).send(`Project ${id}, ${toDeactivate.name} has been deactivated.`);
                } else {
                    res.status(403).send("You lack the authorization to perform this operation");
                }
            } else {
                res.status(204).send(`Project ${id}, ${toDeactivate.name} was already deactivated.`)
            }
        } else {
            res.send("Project not found");
        }
    } catch (error) {
        errorLogging(error, "In project controller - deactivate");
        res.status(500).send(error);
    }
}

projectController.permanentlyDelete = async function (req, res) {
    const { id } = req.params;

    // MOST PROBABLY in the long-run it's safer to just change the status of the entry, instead of deleting it, but I'll keep this around just in case

    try {
        const toDelete = await Projects.findById(id);

        if (toDelete) {
            if (canLoggedUserManageThis(toDelete, req.loggedUser)) {
                let toReturn = await Projects.deleteOne(toDelete);
                res.status(200).send(`Project ${id}, ${toReturn.name} has been deleted permanently.`);
            } else {
                res.status(403).send("You lack the authorization to perform this operation");
            }
        } else {
            res.send("Project not found");
        }
    } catch (error) {
        errorLogging(error, "In project controller - permanentlyDelete");
        res.status(500).send(error);
    }
}

projectController.getProjectSettings = async function (req, res) {
    const { id } = req.params;
    try {
        const project = await Projects.findById(id);
        if (project) {
            if (canLoggedUserReadThis(project, req.loggedUser)) {
                const settings = project.settings;
                res.status(200).send(settings);
            } else {
                res.status(403).send("You lack the authorization to perform this operation");
            }
        } else {
            res.send("Project not found");
        }
    } catch (error) {
        errorLogging(error, "In project controller - getProjectSettings");
        res.status(500).send(error);
    }
}
projectController.setProjectSettings = async function (req, res) {
    const { id } = req.params;
    const { newSettings } = req.body;
    try {
        const project = await Projects.findById(id);
        if (project) {
            if (canLoggedUserManageThis(project, req.loggedUser)) {
                project.settings = newSettings;
                project.modificationDate = formatDateNow();
                project.save();
                res.status(200).send("Settings updated");
            } else {
                res.status(403).send("You lack the authorization to perform this operation");
            }
        } else {
            res.send("User not found");
        }
    } catch (error) {
        errorLogging(error, "In project controller - setProjectSettings");
        res.status(500).send(error);
    }
}

module.exports = projectController;
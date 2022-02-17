const Projects = require("../models/Project");
const Tasks = require("../models/Task");
const User = require("../models/User");

function checkIfReadable(project, loggedUser) {
    for (const key in project.users) {
        if (Object.hasOwnProperty.call(project.users, key)) {
            const usersInRoleArray = project.users[key];
            for (let i = 0; i < usersInRoleArray.length; i++) {
                const user = usersInRoleArray[i];
                if (user._id.toString() === loggedUser._id.toString()) {
                    return true;
                } else {
                    return false;
                }
            }
        }
    }
}

let projectController = {};

projectController.getRoot = async function (req, res) {
    let toReturn = "Get Project Page";
    console.log(toReturn);
    try {
        let toReturn = await Projects.find({});
        console.log(toReturn);
        if (checkIfReadable(toReturn, req.loggedUser)) {
            res.status(200).send(toReturn);
        } else {
            res.status(403).send("You lack the authorization to perform this operation");
        }
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
}

projectController.getID = async function (req, res) {
    const { id } = req.params;
    console.log(id);
    try {
        let toReturn = await Projects.findById(id);
        console.log(toReturn);
        if (toReturn) {

            res.status(200).send(toReturn);
        } else {
            res.status(404).send("Project not found");
        }
    } catch (error) {
        console.log(error);
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
            status: "Active",
            creationDate: Date.now(),
            modificationDate: Date.now(),
            users: {
                creators: [],
                joiners: [],
                managers: [],
            },
            tasks: [],
            settings: {},
            notifications: []
        });
        await newProject.save();
        res.send("This is the project ID " + newProject._id);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
}

projectController.patch = async function (req, res) {
    const { id } = req.params;
    const { patchedProject } = req.body;
    patchedProject.modificationDate = Date.now();
    try {
        const toUpdate = await Projects.findById(id);
        // The following for...in iterates through the PATCHEDJsonObject received by the request, and updates the DB Document with the eventual new data
        for (const key in patchedProject) {
            if (Object.hasOwnProperty.call(patchedProject, key)) {
                toUpdate[key] = patchedProject[key];
            }
        }
        await toUpdate.save();
        res.send(toUpdate);
    } catch (error) {
        console.log(req.body);
        console.log(error);
        res.status(500).send(error);
    }
}

projectController.delete = async function (req, res) {
    const { id } = req.params;

    // MOST PROBABLY in the long-run it's safer to just change the status of the entry, instead of deleting it, but I'll keep this around just in case

    try {
        const toDelete = await Projects.findById(id);
        // if (toDelete._id === req.session.userID){ }
        if (toDelete) {
            toDelete.status = "Inactive";
            await toDelete.save();
            res.send("Project " + id + "has been deactivated");
        } else {
            res.send("Project not found");
        }
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
}

projectController.getUserSettings = async function (req, res) {
    const { id } = req.params;
    try {
        const project = await Projects.findById(id);
        if (project) {
            const settings = project.settings;
            res.send(settings);
        } else {
            res.send("Project not found");
        }
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
}
projectController.setUserSettings = async function (req, res) {
    const { id } = req.params;
    const { newSettings } = req.body;
    try {
        const project = await Projects.findById(id);
        if (project) {
            project.settings = newSettings;
            project.save();
            res.send("Settings updated");
        } else {
            res.send("User not found");
        }
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
}

module.exports = projectController;
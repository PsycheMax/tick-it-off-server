const Projects = require("../models/Project");
const Tasks = require("../models/Task");
const User = require("../models/User");

let taskController = {};

taskController.getRoot = async function (req, res) {
    let toReturn = "Get Task Page";
    console.log(toReturn);
    try {
        let toReturn = await Tasks.find({});
        console.log(toReturn);
        res.send(toReturn);
    } catch (error) {
        console.log(error);
        res.send(error);
    }
}

taskController.getID = async function (req, res) {
    const { id: projectID, taskid: taskID } = req.params;
    console.log(projectID, taskID);
    try {
        let toReturn = await Tasks.findById(taskID);
        console.log(toReturn);
        if (toReturn) {
            res.send(toReturn);
        } else {
            res.send("Task not found");
        }
    } catch (error) {
        console.log(error);
        res.send(error);
    }

}

taskController.post = async function (req, res) {
    const { id: projectID } = req.params;
    try {
        const foundProject = await Projects.findById(projectID);
        // The next declaration saves a lot of time retyping stuff when changing the way data is submitted to the API
        let reqTask = req.body.newTask;

        let newTask = new Tasks({
            name: reqTask.name,
            completion: reqTask.completion,
            description: reqTask.description,
            image: reqTask.image,
            level: reqTask.level,
            status: "Active",
            creationDate: Date.now(),
            modificationDate: Date.now(),
            project: foundProject,
            users: {
                creators: [],
                joiners: [],
                managers: []
            },
            settings: {},
            notifications: []
        });
        await newTask.save();
        res.send("This is the Task ID " + newTask._id);
    } catch (error) {
        console.log(error);
        res.send(error);
    }
}

taskController.patch = async function (req, res) {
    const { id: projectID, taskid: taskID } = req.params;
    const { patchedTask } = req.body;
    patchedTask.modificationDate = Date.now();
    try {
        const toUpdate = await Tasks.findById(taskID);
        // The following for...in iterates through the PATCHEDJsonObject received by the request, and updates the DB Document with the eventual new data
        for (const key in patchedTask) {
            if (Object.hasOwnProperty.call(patchedTask, key)) {
                toUpdate[key] = patchedTask[key];
            }
        }
        await toUpdate.save();
        res.send(toUpdate);
    } catch (error) {
        console.log(req.body);
        console.log(error);
        res.send(error);
    }
}

taskController.delete = async function (req, res) {
    const { id: projectID, taskid: taskID } = req.params;

    // MOST PROBABLY in the long-run it's safer to just change the status of the entry, instead of deleting it, but I'll keep this around just in case

    try {
        const toDelete = await Tasks.findById(taskID);
        // if (toDelete._id === req.session.userID){ }
        if (toDelete) {
            toDelete.status = "Inactive";
            await toDelete.save();
            res.send("Task " + id + "has been deactivated");
        } else {
            res.send("Task not found");
        }
    } catch (error) {
        console.log(error);
        res.send(error);
    }
}

taskController.getTaskSettings = async function (req, res) {
    const { id: projectID, taskid: taskID } = req.params;
    try {
        const task = await Tasks.findById(taskID);
        if (task) {
            const settings = task.settings;
            res.send(settings);
        } else {
            res.send("Task not found");
        }
    } catch (error) {
        console.log(error);
        res.send(error);
    }
}
taskController.setTaskSettings = async function (req, res) {
    const { id: projectID, taskid: taskID } = req.params;
    const { newSettings } = req.body;
    try {
        const task = await Tasks.findById(taskID);
        if (task) {
            task.settings = newSettings;
            task.save();
            res.send("Settings updated");
        } else {
            res.send("User not found");
        }
    } catch (error) {
        console.log(error);
        res.send(error);
    }
}

module.exports = taskController;
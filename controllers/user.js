const Projects = require("../models/Project");
const Tasks = require("../models/Task");
const Users = require("../models/User");

let userController = {};

userController.getRoot = async function (req, res) {
    let toReturn = "Get User Page";
    console.log(toReturn);
    try {
        let toReturn = await Users.find({});
        console.log(toReturn);
        res.send(toReturn);
    } catch (error) {
        console.log(error);
        res.send(error);
    }
}

userController.getID = async function (req, res) {
    const { id } = req.params;
    console.log(id);
    try {
        let toReturn = await Users.findById(id);
        console.log(toReturn);
        if (toReturn) {
            res.send(toReturn);
        } else {
            res.send("User not found");
        }
    } catch (error) {
        console.log(error);
        res.send(error);
    }

}

userController.post = async function (req, res) {
    // The next declaration saves a lot of time retyping stuff when changing the way data is submitted to the API
    let reqUser = req.body.newUser;
    try {
        let newUser = new Users({
            username: reqUser.username,
            password: reqUser.password,
            email: reqUser.email,
            image: reqUser.image,
            status: "Active",
            creationDate: Date.now(),
            modificationDate: Date.now(),
            projects: {
                createdProjects: [],
                joinedProjects: [],
                managedProjects: [],
            },
            tasks: {
                createdTasks: [],
                assignedTasks: [],
                managedTasks: [],
                completedTasks: []
            },
            settings: {},
            notifications: []
        });
        await newUser.save();
        res.send("This is the user ID " + newUser._id);
    } catch (error) {
        console.log(error);
        res.send(error);
    }
}

userController.patch = async function (req, res) {
    const { id } = req.params;
    const { patchedUser } = req.body;
    patchedUser.modificationDate = Date.now();
    try {
        const toUpdate = await Users.findById(id);
        // The following for...in iterates through the PATCHEDJsonObject received by the request, and updates the DB Document with the eventual new data
        for (const key in patchedUser) {
            if (Object.hasOwnProperty.call(patchedUser, key)) {
                toUpdate[key] = patchedUser[key];
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

userController.delete = async function (req, res) {
    const { id } = req.params;

    // MOST PROBABLY in the long-run it's safer to just change the status of the entry, instead of deleting it, but I'll keep this around just in case

    try {
        const toDelete = await Users.findById(id);
        // if (toDelete._id === req.session.userID){ }
        if (toDelete) {
            toDelete.status = "Inactive";
            await toDelete.save();
            res.send("User " + id + "has been deactivated");
        } else {
            res.send("User not found");
        }
    } catch (error) {
        console.log(error);
        res.send(error);
    }
}

userController.getUserSettings = async function (req, res) {
    const { id } = req.params;
    try {
        const user = await Users.findById(id);
        if (user) {
            const settings = user.settings;
            res.send(settings);
        } else {
            res.send("User not found");
        }
    } catch (error) {
        console.log(error);
        res.send(error);
    }
}
userController.setUserSettings = async function (req, res) {
    const { id } = req.params;
    const { newSettings } = req.body;
    try {
        const user = await Users.findById(id);
        if (user) {
            user.settings = newSettings;
            user.save();
            res.send("Settings updated");
        } else {
            res.send("User not found");
        }
    } catch (error) {
        console.log(error);
        res.send(error);
    }
}

module.exports = userController;
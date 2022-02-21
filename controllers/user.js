const Projects = require("../models/Project");
const Tasks = require("../models/Task");
const Users = require("../models/User");

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { encrypt, compare } = require("../utils/passwordLogic");

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
        res.status(500).send(error);
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
        res.status(500).send(error);
    }
}

userController.postNewUser = async function (req, res) {
    // The next declaration saves a lot of time retyping stuff when changing the way data is submitted to the API
    let reqUser = req.body.newUser;
    try {
        const existingUser = await Users.findOne({ email: reqUser.email });
        // if (existingUser) {
        //     return res.status(409).send("This email cannot be used.");
        // }
        let encryptedPassword = await encrypt(reqUser.password);
        let newUser = new Users({
            username: reqUser.username,
            password: encryptedPassword,
            email: reqUser.email.toLowerCase(),
            image: reqUser.image,
            status: "Active",
            creationDate: Date.now(),
            modificationDate: Date.now(),
            projects: {
                created: [],
                joined: [],
                managed: [],
                completed: []
            },
            tasks: {
                created: [],
                assigned: [],
                managed: [],
                completed: []
            },
            settings: {},
            notifications: []
        });
        await newUser.save();
        const token = jwt.sign({
            user_id: newUser._id, email: reqUser.email
        }, process.env.TOKEN_KEY, {
            expiresIn: '1h'
        });
        newUser.token = token;
        let toReturn = JSON.parse(newUser);
        toReturn.password = "";
        console.log(toReturn);
        res.status(201).json(toReturn);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
}

userController.login = async function (req, res) {
    try {
        let { email, password } = req.body.loginUser;
        email = email.toLowerCase();
        if (!(email && password)) {
            res.status(400).send("Please fill all the input fields");
        }
        const userToLogin = await Users.findOne({ email: email });
        if (userToLogin && (await compare(password, userToLogin.password))) {
            userToLogin.lastLogin = Date.now();
            await userToLogin.save();
            const token = jwt.sign({
                user_id: userToLogin._id, email: email
            }, process.env.TOKEN_KEY, {
                expiresIn: '1h'
            });
            userToLogin.token = token;
            let toReturn = userToLogin;
            toReturn.password = "HIDDEN";
            console.log(toReturn);
            res.status(200).json(toReturn);
        } else {
            res.status(401).send("Invalid Credentials");
        }
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
}
userController.logout = async function (req, res) {
    try {
        if (req.loggedUser) {
            const logoutToken = jwt.sign({
                user_id: " ", email: " "
            }, process.env.TOKEN_KEY, {
                expiresIn: "10"
            })
            loggedUser.token = logoutToken;
            res.status(200).json(logoutToken);
        } else {
            res.status(200).send("Already logged out");
        }
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
}

userController.patch = async function (req, res) {
    const { id } = req.params;
    const { patchedUser } = req.body;
    patchedUser.modificationDate = Date.now();
    patchedUser.password = await encrypt(patchedUser.password);
    try {
        const toUpdate = await Users.findById(id);
        if (req.loggedUser._id.toString() === toUpdate._id.toString()) {
            // The following for...in iterates through the PATCHEDJsonObject received by the request, and updates the DB Document with the eventual new data
            for (const key in patchedUser) {
                if (Object.hasOwnProperty.call(patchedUser, key)) {
                    toUpdate[key] = patchedUser[key];
                }
            }
            await toUpdate.save();
            res.send(toUpdate);
        } else {
            res.status(403).send("You lack the authorization to perform this operation");
        }
    } catch (error) {
        console.log(req.body);
        console.log(error);
        res.status(500).send(error);
    }
}

userController.delete = async function (req, res) {
    const { id } = req.params;

    // MOST PROBABLY in the long-run it's safer to just change the status of the entry, instead of deleting it, but I'll keep this around just in case

    try {
        const toDelete = await Users.findById(id);
        if (toDelete) {
            if (req.loggedUser._id.toString() === toDelete._id.toString()) {
                toDelete.status = "Inactive";
                await toDelete.save();
                res.send("User " + id + "has been deactivated");
            } else {
                res.status(403).send("You lack the authorization to perform this operation");
            }
        } else {
            res.status(404).send("User not found");
        }
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
}


userController.getUserSettings = async function (req, res) {
    const { id } = req.params;
    try {
        const user = await Users.findById(id);
        if (user) {
            if (req.loggedUser._id.toString() === user._id.toString()) {
                const settings = user.settings;
                res.send(settings);
            } else {
                res.status(403).send("You lack the authorization to perform this operation");
            }
        } else {
            res.status(404).send("User not found");
        }
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
}
userController.setUserSettings = async function (req, res) {
    const { id } = req.params;
    const { newSettings } = req.body;
    try {
        const user = await Users.findById(id);
        if (user) {
            if (req.loggedUser._id.toString() === user._id.toString()) {
                user.settings = newSettings;
                user.save();
                res.send("Settings updated");
            } else {
                res.status(403).send("You lack the authorization to perform this operation");
            }
        } else {
            res.status(404).send("User not found");
        }
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
}

module.exports = userController;
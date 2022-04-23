const Projects = require("../models/Project");
const Tasks = require("../models/Task");
const Users = require("../models/User");

const formatDateNow = require('../utils/formatDateNow');

const jwt = require('jsonwebtoken');
const { encrypt, compare } = require("../utils/passwordLogic");
const { errorLogging } = require("../middleware/logging");

let userController = {};

userController.getID = async function (req, res) {
    const { id } = req.params;
    try {
        let toReturn = await Users.findById(id)
            .populate('projects.created', 'name active image description')
            .populate('projects.managed', 'name active image description')
            .populate('projects.joined', 'name active image description')
            .populate('projects.archived', 'name active image description');
        if (toReturn) {
            res.send(toReturn);
        } else {
            res.send("User not found");
        }
    } catch (error) {
        errorLogging(error, "In user controller - getID");
        res.status(500).send(error);
    }
}

userController.postNewUser = async function (req, res) {
    // The next declaration saves a lot of time retyping stuff when changing the way data is submitted to the API
    let reqUser = req.body.newUser;
    reqUser.email = reqUser.email.toLowerCase();
    try {
        const existingUser = await Users.findOne({ email: reqUser.email });
        if (existingUser) {
            return res.status(409).send("This email address cannot be used.");
        }
        let encryptedPassword = await encrypt(reqUser.password);
        let newUser = new Users({
            username: reqUser.username,
            password: encryptedPassword,
            email: reqUser.email,
            image: reqUser.image,
            active: true,
            creationDate: formatDateNow(),
            modificationDate: formatDateNow(),
            projects: {
                created: [],
                joined: [],
                managed: [],
                archived: []
            },
            tasks: {
                created: [],
                assigned: [],
                managed: [],
                archived: []
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
        let toReturn = newUser;
        toReturn.password = "";
        res.status(201).json(toReturn);
    } catch (error) {
        errorLogging(error, "In user controller - postNewUser");
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
        const userToLogin = await Users.findOne({ email: email })
            .populate('projects.created', 'name active image description')
            .populate('projects.managed', 'name active image description')
            .populate('projects.joined', 'name active image description')
            .populate('projects.archived', 'name active image description');
        if (userToLogin && (await compare(password, userToLogin.password))) {
            userToLogin.lastOnline = formatDateNow();
            await userToLogin.save();
            const token = jwt.sign({
                user_id: userToLogin._id, email: email
            }, process.env.TOKEN_KEY, {
                expiresIn: '15000h'
            });
            userToLogin.token = token;
            let toReturn = userToLogin;
            toReturn.password = "HIDDEN";
            res.status(200).json(toReturn);
        } else {
            res.status(401).send("Invalid Credentials");
        }
    } catch (error) {
        errorLogging(error, "In user controller - login ");
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
            let logoutUser = req.loggedUser;
            logoutUser.lastOnline = formatDateNow();
            logoutUser.token = logoutToken;
            await logoutUser.save();
            res.status(200).send("Logout Successful");
        } else {
            res.status(200).send("Already logged out");
        }
    } catch (error) {
        errorLogging(error, "In user controller - logout");
        res.status(500).send(error);
    }
}

userController.patch = async function (req, res) {
    const { id } = req.params;
    const { patchedUser } = req.body;
    patchedUser.modificationDate = formatDateNow();

    patchedUser.email ? patchedUser.email = patchedUser.email.toLowerCase() : "";
    try {
        const toUpdate = await Users.findById(id)
            .populate('projects.created', 'name active image')
            .populate('projects.managed', 'name active image')
            .populate('projects.joined', 'name active image')
            .populate('projects.archived', 'name active image');
        patchedUser.password ? patchedUser.password = await encrypt(patchedUser.password) : patchedUser.password = toUpdate.password;
        if (toUpdate) {
            let passwordCompare = await compare(patchedUser.oldPassword, toUpdate.password);
            if (passwordCompare) {
                if (req.loggedUser._id.toString() === toUpdate._id.toString()) {
                    // The following for...in iterates through the PATCHEDJsonObject received by the request, and updates the DB Document with the eventual new data
                    for (const key in patchedUser) {
                        if (Object.hasOwnProperty.call(patchedUser, key)) {
                            toUpdate[key] = patchedUser[key];
                        }
                    }
                    toUpdate.modificationDate = formatDateNow();
                    await toUpdate.save();
                    res.status(200).send(toUpdate);
                } else {
                    res.status(403).send("You lack the authorization to perform this operation");
                }
            } else {
                res.status(401).send("Please enter the correct current password");
            }
        }
        else {
            res.status(404).send("Could not find the user, please refresh the page.");
        }

    } catch (error) {
        errorLogging(error, "In user controller - patch");
        res.status(500).send(error);
    }
}

userController.delete = async function (req, res) {
    const { id } = req.params;
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
        errorLogging(error, "In user controller - delete");
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
        errorLogging(error, "In user controller - getUserSettings");
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
                user.modificationDate = formatDateNow();
                user.save();
                res.send("Settings updated");
            } else {
                res.status(403).send("You lack the authorization to perform this operation");
            }
        } else {
            res.status(404).send("User not found");
        }
    } catch (error) {
        errorLogging(error, "In user controller - setUserSettings");
        res.status(500).send(error);
    }
}

module.exports = userController;
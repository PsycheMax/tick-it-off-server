const mongoose = require('mongoose');
const Users = require('./User');

// Shortcut to Mongoose.Schema;
const Schema = mongoose.Schema;

const ProjectSchema = new Schema({
    name: {
        type: String
    },
    description: {
        type: String
    },
    completion: {
        type: Boolean
    },
    image: {
        // URL
        type: String
    },
    active: {
        type: Boolean,
        default: true
    },
    creationDate: {
        type: Date,
        default: Date.now
    },
    modificationDate: {
        type: Date,
        default: Date.now
    },
    users: {
        creators: [{
            type: Schema.Types.ObjectId,
            ref: 'Users'
        }],
        joiners: [{
            type: Schema.Types.ObjectId,
            ref: 'Users'
        }],
        managers: [{
            type: Schema.Types.ObjectId,
            ref: 'Users'
        }]
    },
    tasks: [{
        type: Schema.Types.ObjectId,
        ref: 'Tasks'
    }],
    archivedTasks: [{
        type: Schema.Types.ObjectId,
        ref: 'Tasks'
    }],
    settings: {
        colorScheme: {
            type: String,
            default: 'default'
        },
    },
    notifications: [{
        type: Schema.Types.ObjectId,
        ref: 'Notifications'
    }]
})


ProjectSchema.pre('save', async function () {
    // The following middleware cycles through the users in the Project ".users" property, and adds this project to the correct user
    try {
        // The following for...in goes through the keys of the document.user object ("managers", "joiners", "creators")
        for (const key in this.users) {
            if (Object.hasOwnProperty.call(this.users, key)) {
                const array = this.users[key];
                // Every this.user[key] will contain an array of UserIDs - array
                for (let i = 0; i < array.length; i++) {
                    // In order to change the right object, the key has to be passivized
                    // e.g. going from "managers" to "managed" requires a slice (3 letters from the end) and the addition of "ed" at the end
                    let keyPassivized = key.toString().slice(0, key.length - 3) + "ed";
                    const userInArray = array[i];
                    const userFound = await Users.findById(userInArray);
                    // For every user found, the array found in user.projects[keyPassivized] has to be checked - if it already contains it, it won't be added
                    if (userFound.projects[keyPassivized].indexOf(this._id) === -1) {
                        userFound.projects[keyPassivized] = [...userFound.projects[keyPassivized], this._id];
                        await userFound.save();
                    }
                }
            }
        }
    } catch (error) {
        console.log(error);
        return ("Project could not be saved properly in the user lists - error 500, MONGOOSE PRE-SAVE SCHEMA");
    }
    // The following part of the middleware cycles through the users in the project.users.managers and puts this Project in the "projects.archived" or "projects.managed" arrays, depending on its own "active" status;
    try {
        // Foreach manager found in users.manager
        this.users.managers.forEach(async (manager) => {
            const foundUser = await Users.findById(manager);
            // If the project is flagged as active
            if (this.active) {
                // if the manager has an array of managed projects
                if (foundUser.projects.managed) {
                    // If this project is not in that array
                    if (foundUser.projects.managed.indexOf(this._id) === -1) {
                        // Add this project to said array
                        foundUser.projects.managed = [...foundUser.projects.managed, this._id];
                    }
                    // if the manager has no array of managed projects
                } else {
                    // make this project the only element of a new array, the projects.managed array
                    foundUser.projects.managed = [this._id];
                }
                // if the manager has an array of archived projects
                if (foundUser.projects.archived) {
                    // If this project is found in that array
                    if (foundUser.projects.archived.indexOf(this._id) !== -1) {
                        // Remove this project from said array
                        foundUser.projects.archived.splice(foundUser.projects.archived.indexOf(this._id), 1);
                    }
                }
                // IF the project is flagged as NOT ACTIVE
            } else {
                // If the manager has an array of archived projects
                if (foundUser.projects.archived) {
                    // If the project is not in the array of archived projects
                    if (foundUser.projects.archived.indexOf(this._id) === -1) {
                        // Add this project to said array
                        foundUser.projects.archived = [...foundUser.projects.archived, this._id];
                    }
                    // If the manager has no array of archived projects
                } else {
                    // Make this project the only element of a new array, the projects.archived array
                    foundUser.projects.archived = [this._id];
                }
                // IF the manager has an array of managed projects
                if (foundUser.projects.managed) {
                    // If this project is found in that array
                    if (foundUser.projects.managed.indexOf(this._id) !== -1) {
                        // Remove this project from said array
                        foundUser.projects.managed.splice(foundUser.projects.managed.indexOf(this._id), 1);
                    }
                }
            }
            await foundUser.save();
        })
    } catch (error) {
        console.log(error);
        return ("Project could not be assigned to its user.projects arrays - error 500 - MONGOOSE pre-save schema");
    }
    this.modificationDate = Date.now();
});

const Projects = mongoose.model('Projects', ProjectSchema, 'TaskManager_Project');

module.exports = Projects;
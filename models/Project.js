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
    status: {
        type: String,
        default: "Active"
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

// The following middleware cycles through the users in the Project ".users" property, and adds this project to the correct user
ProjectSchema.pre('save', async function () {

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

    // for (let i = 0; i < this.users.creators.length; i++) {
    //     const userInArray = this.users.creators[i];
    //     const userFound = await Users.findById(userInArray);
    //     if (userFound.projects.created.indexOf(this._id) === -1) {
    //         userFound.projects.created = [...userFound.projects.created, this._id];
    //         await userFound.save();
    //     }
    // }
    // for (let i = 0; i < this.users.joiners.length; i++) {
    //     const userInArray = this.users.joiners[i];
    //     const userFound = await Users.findById(userInArray);
    //     if (userFound.projects.joined.indexOf(this._id) === -1) {
    //         userFound.projects.joined = [...userFound.projects.joined, this._id];
    //         await userFound.save();
    //     }
    // }
    // for (let i = 0; i < this.users.managers.length; i++) {
    //     const userInArray = this.users.managers[i];
    //     const userFound = await Users.findById(userInArray);
    //     if (userFound.projects.managed.indexOf(this._id) === -1) {
    //         userFound.projects.managed = [...userFound.projects.managed, this._id];
    //         await userFound.save();
    //     }
    // }
    this.modificationDate = Date.now();
});

const Projects = mongoose.model('Projects', ProjectSchema, 'TaskManager_Project');

module.exports = Projects;
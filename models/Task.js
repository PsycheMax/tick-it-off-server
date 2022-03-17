const mongoose = require('mongoose');
const Projects = require('./Project');
const Users = require('./User');

// Shortcut to Mongoose.Schema;
const Schema = mongoose.Schema;

const TaskSchema = new Schema({
    name: {
        type: String
    },
    completion: {
        type: Boolean
    },
    description: {
        type: String
    },
    image: {
        // URL
        type: String
    },
    level: {
        type: Number
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
    project: {
        type: Schema.Types.ObjectId,
        ref: 'Projects'
    },
    settings: {
        colorScheme: {
            type: String,
            default: 'default'
        },
    },
    notifications: [{
        type: Schema.Types.ObjectId,
        ref: "Notifications"
    }]
})

// The following middleware cycles through the users in the Task ".users" property, and adds this project to the correct user
TaskSchema.pre('save', async function () {
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
                    // For every user found, the array found in user.tasks[keyPassivized] has to be checked - if it already contains it, it won't be added
                    if (userFound.tasks[keyPassivized].indexOf(this._id) === -1) {
                        userFound.tasks[keyPassivized] = [...userFound.tasks[keyPassivized], this._id];
                        await userFound.save();
                    }
                }
            }
        }
    } catch (error) {
        console.log(error);
        return "Error 500, can't add the Task to its users";
    }
    try {
        const projectBelongingTo = await Projects.findById(this.project);
        if (projectBelongingTo) {
            if (this.active) {
                if (projectBelongingTo.tasks) {
                    if (projectBelongingTo.tasks.indexOf(this._id) === -1) {
                        projectBelongingTo.tasks = [...projectBelongingTo.tasks, this._id];
                    }
                } else {
                    projectBelongingTo.tasks = [this._id];
                }
                if (projectBelongingTo.archivedTasks.indexOf(this._id) !== -1) {
                    projectBelongingTo.archivedTasks.splice(projectBelongingTo.archivedTasks.indexOf(this._id), 1);
                }
            } else {
                if (projectBelongingTo.archivedTasks) {
                    if (projectBelongingTo.archivedTasks.indexOf(this._id) === -1) {
                        projectBelongingTo.archivedTasks = [...projectBelongingTo.archivedTasks, this._id];
                    } else {
                        projectBelongingTo.archivedTasks = [this._id];
                    }
                }
                if (projectBelongingTo.tasks.indexOf(this._id) !== -1) {
                    projectBelongingTo.tasks.splice(projectBelongingTo.tasks.indexOf(this._id), 1);
                }
            }
            await projectBelongingTo.save();
        } else {
            return "Error 404 - The project can't be found. MongooseMiddlewareTasksSchema";
        }
    } catch (error) {
        console.log(error);
        return "Error 500, can't add task to its project";
    }

    this.modificationDate = Date.now();
});

const Tasks = mongoose.model('Tasks', TaskSchema, 'TaskManager_Task');

module.exports = Tasks;
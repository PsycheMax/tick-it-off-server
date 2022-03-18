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
    // The following part of the middleware checks the project in task.project and puts this Task in the "tasks.archived" or "tasks.managed" arrays, depending on its own "active" status;
    try {
        const projectBelongingTo = await Projects.findById(this.project);
        // IF the Project found in this.project exists and it's found
        if (projectBelongingTo) {
            // If this task is active
            if (this.active) {
                // IF an array of working tasks in the project exists
                if (projectBelongingTo.tasks) {
                    // If this task is not found in said array
                    if (projectBelongingTo.tasks.indexOf(this._id) === -1) {
                        // Add this task to the array
                        projectBelongingTo.tasks = [...projectBelongingTo.tasks, this._id];
                    }
                    // if an array of working tasks in the project is not found
                } else {
                    // Create an array of working tasks with one element, this task
                    projectBelongingTo.tasks = [this._id];
                }
                // If the project has an array of archived tasks
                if (projectBelongingTo.archivedTasks) {
                    // if this task is found in the array of archived tasks
                    if (projectBelongingTo.archivedTasks.indexOf(this._id) !== -1) {
                        // Remove this task from the archived tasks array
                        projectBelongingTo.archivedTasks.splice(projectBelongingTo.archivedTasks.indexOf(this._id), 1);
                    }
                }
                // IF this task is NOT active
            } else {
                // If an array of archived tasks in the projects exists
                if (projectBelongingTo.archivedTasks) {
                    // If this task is not found in said array of archived tasks
                    if (projectBelongingTo.archivedTasks.indexOf(this._id) === -1) {
                        // Add this task to the array
                        projectBelongingTo.archivedTasks = [...projectBelongingTo.archivedTasks, this._id];
                        // If an array of archived tasks is not found
                    } else {
                        // Create an array of archived tasks in the project and add one element, this task
                        projectBelongingTo.archivedTasks = [this._id];
                    }
                }
                // If the project has an array of working tasks
                if (projectBelongingTo.tasks) {
                    // If this task is found in the array of working tasks
                    if (projectBelongingTo.tasks.indexOf(this._id) !== -1) {
                        // Remove this task from the working tasks array
                        projectBelongingTo.tasks.splice(projectBelongingTo.tasks.indexOf(this._id), 1);
                    }
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
    try {
        // TODO Put into the archived tasks for the creator user
    } catch (error) {
        console.log(error);
        return "Error 500, this task can't be properly archived in its parent user"
    }

    this.modificationDate = Date.now();
});

const Tasks = mongoose.model('Tasks', TaskSchema, 'TaskManager_Task');

module.exports = Tasks;
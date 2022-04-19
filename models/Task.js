const mongoose = require('mongoose');
const formatDateNow = require('../utils/formatDateNow');
let Projects = require('./Project');
let Users = require('./User');

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
        type: String,
        default: formatDateNow(),
        dateFormat: {
            type: Date,
            default: Date.now
        }
    },
    modificationDate: {
        type: String,
        default: formatDateNow(),
        dateFormat: {
            type: Date,
            default: Date.now
        }
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

// / The following middleware cycles through the users in the Task ".users" property, and adds this project to the correct user

TaskSchema.statics.preSaveOperations = async function (Projects, thisDocument) {
    try {
        // The following for...in goes through the keys of the document.user object ("managers", "joiners", "creators")
        for (const key in thisDocument.users) {
            if (Object.hasOwnProperty.call(thisDocument.users, key)) {
                const array = thisDocument.users[key];
                // Every this.user[key] will contain an array of UserIDs - array
                for (let i = 0; i < array.length; i++) {
                    // In order to change the right object, the key has to be passivized
                    // e.g. going from "managers" to "managed" requires a slice (3 letters from the end) and the addition of "ed" at the end
                    let keyPassivized = key.toString().slice(0, key.length - 3) + "ed";
                    const userInArray = array[i];
                    const userFound = await Users.findById(userInArray);
                    // For every user found, the array found in user.tasks[keyPassivized] has to be checked - if it already contains it, it won't be added
                    if (userFound.tasks[keyPassivized].indexOf(thisDocument._id) === -1) {
                        userFound.tasks[keyPassivized] = [...userFound.tasks[keyPassivized], thisDocument._id];
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
        const projectBelongingTo = await Projects.findById(thisDocument.project);
        // IF the Project found in this.project exists and it's found
        if (projectBelongingTo) {
            // If this task is active
            if (thisDocument.active) {
                // IF an array of working tasks in the project exists
                if (projectBelongingTo.tasks) {
                    // If this task is not found in said array
                    if (projectBelongingTo.tasks.indexOf(thisDocument._id) === -1) {
                        // Add this task to the array
                        projectBelongingTo.tasks = [...projectBelongingTo.tasks, thisDocument._id];
                    }
                    // if an array of working tasks in the project is not found
                } else {
                    // Create an array of working tasks with one element, this task
                    projectBelongingTo.tasks = [thisDocument._id];
                }
                // If the project has an array of archived tasks
                if (projectBelongingTo.archivedTasks) {
                    // if this task is found in the array of archived tasks
                    if (projectBelongingTo.archivedTasks.indexOf(thisDocument._id) !== -1) {
                        // Remove this task from the archived tasks array
                        projectBelongingTo.archivedTasks.splice(projectBelongingTo.archivedTasks.indexOf(thisDocument._id), 1);
                    }
                }
                // IF this task is NOT active
            } else {
                // If an array of archived tasks in the projects exists
                if (projectBelongingTo.archivedTasks) {
                    // If this task is not found in said array of archived tasks
                    if (projectBelongingTo.archivedTasks.indexOf(thisDocument._id) === -1) {
                        // Add this task to the array
                        projectBelongingTo.archivedTasks = [...projectBelongingTo.archivedTasks, thisDocument._id];
                        // If an array of archived tasks is not found
                    } else {
                        // Create an array of archived tasks in the project and add one element, this task
                        projectBelongingTo.archivedTasks = [thisDocument._id];
                    }
                }
                // If the project has an array of working tasks
                if (projectBelongingTo.tasks) {
                    // If this task is found in the array of working tasks
                    if (projectBelongingTo.tasks.indexOf(thisDocument._id) !== -1) {
                        // Remove this task from the working tasks array
                        projectBelongingTo.tasks.splice(projectBelongingTo.tasks.indexOf(thisDocument._id), 1);
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
}

TaskSchema.statics.removeEveryReferenceFromProjects = async function (thisDocument) {
    try {
        let project = await Projects.findById(thisDocument.project);
        if (project.tasks && project.tasks.length > 0) {
            project.tasks.forEach(async (task) => {
                // both IDs have to be converted to string before comparison, otherwise the comparison fails
                if (task._id.toString() === thisDocument._id.toString()) {
                    let indexInArray = project.tasks.indexOf(thisDocument._id);
                    project.tasks.splice(indexInArray, 1);
                    await project.save();
                }
            })
        };
        if (project.archivedTasks && project.archivedTasks.length > 0) {
            project.archivedTasks.forEach(async (task) => {
                if (task._id.toString() === thisDocument._id.toString()) {
                    let indexInArray = project.archivedTasks.indexOf(thisDocument._id);
                    project.archivedTasks.splice(indexInArray, 1);
                    await project.save();
                }
            })
        };
    } catch (error) {
        console.log(error);
        return ("Task could not be permanently deleted from its parent project - error 500 - MONGOOSE pre-delete schema");
    }
}

TaskSchema.statics.removeEveryReferenceFromUsers = async function (thisDocument) {
    try {
        // Going through every user, we'll remove references to this task
        for (const key in thisDocument.users) {
            if (Object.hasOwnProperty.call(thisDocument.users, key)) {
                const array = thisDocument.users[key];
                // Every thisDocument.user[key] will contain an array of UserIDs - array
                for (let i = 0; i < array.length; i++) {
                    // In order to change the right object, the key has to be passivized
                    // e.g. going from "managers" to "managed" requires a slice (3 letters from the end) and the addition of "ed" at the end
                    let keyPassivized = key.toString().slice(0, key.length - 3) + "ed";
                    const userInArray = array[i];
                    const userFound = await Users.findById(userInArray);
                    // For every user found, the array found in user.tasks[keyPassivized] has to be checked - if it contains a reference to this document id, it'll get rid of it.
                    let indexInArray = userFound.tasks[keyPassivized].indexOf(thisDocument._id);
                    if (indexInArray !== -1) {
                        userFound.tasks[keyPassivized].splice(indexInArray, 1);
                        await userFound.save();
                    }
                }
            }
        }
    } catch (error) {
        console.log(error);
        return ("Task could not be permanently deleted from its parent user - error 500 - MONGOOSE pre-delete schema");
    }
}

TaskSchema.pre('deleteOne', { query: true }, async function () {
    const thisDocument = await this.model.findOne(this.getQuery());
    await TaskSchema.statics.removeEveryReferenceFromUsers(thisDocument);
    await TaskSchema.statics.removeEveryReferenceFromProjects(thisDocument);
})

TaskSchema.pre('save', async function () {
    Projects = require('./Project');
    await TaskSchema.statics.preSaveOperations(Projects, this);
})

const Tasks = mongoose.model('Tasks', TaskSchema, 'TaskManager_Task');

module.exports = Tasks;
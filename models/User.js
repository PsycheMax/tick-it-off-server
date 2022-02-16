const mongoose = require('mongoose');

// Shortcut to Mongoose.Schema;
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: {
        type: String,
        minlength: 5
    },
    password: {
        required: true,
        type: String,
        minlength: 6,
        maxlength: 64
    },
    email: {
        required: true,
        type: String,
        min: 5
    },
    image: {
        // URL
        type: String
    },
    status: {
        type: String
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    creationDate: {
        type: Date,
        default: Date.now
    },
    modificationDate: {
        type: Date,
        default: Date.now
    },
    projects: {
        createdProjects: [{
            type: Schema.Types.ObjectId,
            ref: 'Projects'
        }],
        joinedProjects: [{
            type: Schema.Types.ObjectId,
            ref: 'Projects'
        }],
        managedProjects: [{
            type: Schema.Types.ObjectId,
            ref: 'Projects'
        }]
    },
    tasks: {
        createdTasks: [{
            type: Schema.Types.ObjectId,
            ref: 'Tasks'
        }],
        assignedTasks: [{
            type: Schema.Types.ObjectId,
            ref: 'Tasks'
        }],
        managedTasks: [{
            type: Schema.Types.ObjectId,
            ref: 'Tasks'
        }],
        completedTasks: [{
            type: Schema.Types.ObjectId,
            ref: 'Tasks'
        }],
    },
    settings: {
        colorScheme: {
            type: String,
            default: 'Default'
        }
    },
    notifications: [{
        type: Schema.Types.ObjectId,
        ref: 'Notifications'
    }]
})

const Users = mongoose.model('Users', UserSchema, 'TaskManager_User');

Users.createCollection();
module.exports = Users;
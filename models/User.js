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
        created: [{
            type: Schema.Types.ObjectId,
            ref: 'Projects'
        }],
        joined: [{
            type: Schema.Types.ObjectId,
            ref: 'Projects'
        }],
        managed: [{
            type: Schema.Types.ObjectId,
            ref: 'Projects'
        }],
        completed: [{
            type: Schema.Types.ObjectId,
            ref: 'Projects'
        }]
    },
    tasks: {
        created: [{
            type: Schema.Types.ObjectId,
            ref: 'Tasks'
        }],
        assigned: [{
            type: Schema.Types.ObjectId,
            ref: 'Tasks'
        }],
        managed: [{
            type: Schema.Types.ObjectId,
            ref: 'Tasks'
        }],
        completed: [{
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
    }],
    token: {
        type: String
    }
})

const Users = mongoose.model('Users', UserSchema, 'TaskManager_User');

Users.createCollection();
module.exports = Users;
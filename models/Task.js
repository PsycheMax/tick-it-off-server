const mongoose = require('mongoose');

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
    project: [{
        type: Schema.Types.ObjectId,
        ref: 'Projects'
    }],
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

const Tasks = mongoose.model('Tasks', TaskSchema, 'TaskManager_Task');

module.exports = Tasks;